'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataExportController = function () {
    function DataExportController($rootScope, $scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, DataExportController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.exportStepSelectionType = "exportAllSteps";
        this.exportType = null; // type of export: [latestWork, allWork, events]

        // get the project
        // create the mapping of node id to order for the import project
        this.ProjectService.retrieveProject().then(function (projectJSON) {
            _this.project = projectJSON;
            // calculate the node order of the import project
            var nodeOrderOfProject = _this.ProjectService.getNodeOrderOfProject(_this.project);
            _this.projectIdToOrder = nodeOrderOfProject.idToOrder;
            _this.projectItems = nodeOrderOfProject.nodes;
        });

        // save event when data export view is displayed
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "dataExportViewDisplayed",
            data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    _createClass(DataExportController, [{
        key: "hello",
        value: function hello() {
            ocpu.seturl("//128.32.189.240:81/ocpu/user/wiser/library/wiser/R");
            // perform the request
            var req = ocpu.call("hello", {
                "name": "Hiroki"
            }, function (session) {
                session.getStdout(function (returnedCSVString) {
                    var csvBlob = new Blob([returnedCSVString], { type: 'text/csv' });
                    var csvUrl = URL.createObjectURL(csvBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    a.href = csvUrl;
                    a.download = "export_" + runId + ".csv";
                    a.click();

                    // timeout is required for FF.
                    window.setTimeout(function () {
                        URL.revokeObjectURL(csvUrl); // tell browser to release URL reference
                    }, 3000);
                });
            });
        }
    }, {
        key: "export",


        /**
         * Export all or latest work for this run in CSV format
         * latestWork, allWork, and events will call this function with a null exportType.
         */
        value: function _export() {
            var _this2 = this;

            var exportType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (exportType == null) {
                exportType = this.exportType;
            }

            // save event for this export request
            var context = "ClassroomMonitor",
                nodeId = null,
                componentId = null,
                componentType = null,
                category = "UserInteraction",
                event = "exportRequested",
                data = { "exportType": exportType };
            this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);

            if ((exportType === "latestStudentWork" || exportType === "allStudentWork" || exportType === "events") && !this.exportStepSelectionType === "exportAllSteps") {
                // get the nodes that were selected
                var selectedNodes = this.getSelectedNodesToExport();

                if (selectedNodes == null || selectedNodes.length == 0) {
                    // the user did not select any steps to export
                    alert('Please select a step to export.');
                }
                return;
            }
            if (exportType === "events") {
                // events are handled separately right now
                this.exportEvents();
                return;
            }

            this.TeacherDataService.getExport(exportType).then(function (result) {
                if (result == null) {
                    alert("Error retrieving result");
                    return;
                }

                if (exportType === "studentAssets") {
                    return; // no further processing necessary
                }
                var onlyExportNodes = null; // this varioable is used later when looping through all rows
                if (_this2.exportStepSelectionType !== "exportAllSteps") {
                    // get the nodes that were selected
                    onlyExportNodes = _this2.getSelectedNodesToExport();
                }

                var runId = _this2.ConfigService.getRunId();
                var exportFilename = "";

                var csvString = ""; // resulting csv string

                if (exportType === "latestStudentWork" || exportType === "allStudentWork") {
                    (function () {
                        var COLUMN_INDEX_NODE_ID = 1;
                        var COLUMN_INDEX_COMPONENT_ID = 2;
                        var COLUMN_INDEX_STEP_NUMBER = 4;
                        var COLUMN_INDEX_STEP_TITLE = 5;
                        var COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                        var COLUMN_INDEX_STUDENT_DATA = 11;
                        var COLUMN_INDEX_WORKGROUP_ID = 14;
                        var COLUMN_INDEX_WISE_IDS = 18;
                        var COLUMN_INDEX_WISE_ID_1 = 18;
                        var COLUMN_INDEX_WISE_ID_2 = 19;
                        var COLUMN_INDEX_WISE_ID_3 = 20;
                        var COLUMN_INDEX_STUDENT_RESPONSE = 21;

                        if (exportType === "latestStudentWork") {
                            (function () {
                                var hash = {}; // store latestStudentWork. Assume that key = (nodeId, componentId, workgroupId)
                                result = result.reverse().filter(function (studentWorkRow) {
                                    var hashKey = studentWorkRow[COLUMN_INDEX_NODE_ID] + "_" + studentWorkRow[COLUMN_INDEX_COMPONENT_ID] + "_" + studentWorkRow[COLUMN_INDEX_WORKGROUP_ID];
                                    if (!hash.hasOwnProperty(hashKey)) {
                                        // remember in hash
                                        hash[hashKey] = studentWorkRow;
                                        return true;
                                    } else {
                                        // we already have the latest, so we can disregard this studentWorkRow.
                                        return false;
                                    }
                                }).reverse();
                                exportFilename = "latest_work_" + runId + ".csv";
                            })();
                        } else if (exportType === "allStudentWork") {
                            exportFilename = "all_work_" + runId + ".csv";
                        }

                        for (var rowIndex = 0; rowIndex < result.length; rowIndex++) {
                            var row = result[rowIndex];

                            if (rowIndex === 0) {
                                // append additional header columns
                                row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                                row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                                row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = "response";
                            } else {
                                // for all non-header rows, fill in step numbers, titles, and component part numbers.
                                var _nodeId = row[COLUMN_INDEX_NODE_ID];
                                var _componentId = row[COLUMN_INDEX_COMPONENT_ID];
                                if (_this2.exportStepSelectionType !== "exportAllSteps") {
                                    // is user chose certain steps/components to export, see if we need to include this row or not in the export.
                                    // get the nodes that were selected
                                    if (_nodeId != null && _componentId != null) {
                                        var searchString = _nodeId + "-" + _componentId;
                                        if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                            if (onlyExportNodes.indexOf(searchString) == -1) {
                                                continue; // user didn't select this node to export, so ignore this row and keep looping
                                            }
                                        }
                                    } else if (_nodeId != null) {
                                        // only looking for this specific node, not node+component
                                        var _searchString = _nodeId;
                                        if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                            if (onlyExportNodes.indexOf(_searchString) == -1) {
                                                continue; // user didn't select this node to export, so ignore this row and keep looping
                                            }
                                        }
                                    } else if (_nodeId == null && _componentId == null) {
                                        continue; // don't add general work to export
                                    }
                                }
                                row[COLUMN_INDEX_STEP_NUMBER] = _this2.ProjectService.getNodePositionById(_nodeId);
                                row[COLUMN_INDEX_STEP_TITLE] = _this2.ProjectService.getNodeTitleByNodeId(_nodeId);
                                row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = _this2.ProjectService.getComponentPositionByNodeIdAndComponentId(_nodeId, _componentId) + 1; // make it 1-indexed for researchers
                                var workgroupId = row[COLUMN_INDEX_WORKGROUP_ID];
                                var wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                                var wiseIDsArray = wiseIDs.split(",");
                                row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                                row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                                row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                                // get the student data JSON and extract responses into its own column
                                var studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = studentDataJSONCell.response || "";
                            }

                            // append row to csvString
                            for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                                var cell = row[cellIndex];
                                if ((typeof cell === "undefined" ? "undefined" : _typeof(cell)) === "object") {
                                    cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                                } else if (typeof cell === "string") {
                                    cell = "\"" + cell + "\"";
                                }
                                csvString += cell + ",";
                            }
                            csvString += "\r\n";
                        }
                    })();
                } else if (exportType === "notebookItems") {
                    exportFilename = "notebook_" + runId + ".csv";

                    var COLUMN_INDEX_NODE_ID = 1;
                    var COLUMN_INDEX_COMPONENT_ID = 2;
                    var COLUMN_INDEX_STEP_NUMBER = 3;
                    var COLUMN_INDEX_STEP_TITLE = 4;
                    var COLUMN_INDEX_COMPONENT_PART_NUMBER = 5;
                    var COLUMN_INDEX_TYPE = 8;
                    var COLUMN_INDEX_STUDENT_DATA = 9;
                    var COLUMN_INDEX_WISE_IDS = 16;
                    var COLUMN_INDEX_WISE_ID_1 = 16;
                    var COLUMN_INDEX_WISE_ID_2 = 17;
                    var COLUMN_INDEX_WISE_ID_3 = 18;
                    var COLUMN_INDEX_STUDENT_RESPONSE = 19;

                    for (var rowIndex = 0; rowIndex < result.length; rowIndex++) {
                        var row = result[rowIndex];

                        if (rowIndex === 0) {
                            // append additional header columns
                            row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                            row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                            row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                            row[COLUMN_INDEX_STUDENT_RESPONSE] = "response";
                        } else {
                            // for all non-header rows, fill in step numbers, titles, and component part numbers.
                            var _nodeId2 = row[COLUMN_INDEX_NODE_ID];
                            var _componentId2 = row[COLUMN_INDEX_COMPONENT_ID];
                            row[COLUMN_INDEX_STEP_NUMBER] = _this2.ProjectService.getNodePositionById(_nodeId2);
                            row[COLUMN_INDEX_STEP_TITLE] = _this2.ProjectService.getNodeTitleByNodeId(_nodeId2);
                            row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = _this2.ProjectService.getComponentPositionByNodeIdAndComponentId(_nodeId2, _componentId2) + 1; // make it 1-indexed for researchers
                            var wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                            var wiseIDsArray = wiseIDs.split(",");
                            row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                            row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                            row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                            // get the student data JSON and extract responses into its own column
                            var studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                            if (row[COLUMN_INDEX_TYPE] === "report") {
                                if (studentDataJSONCell.content != null) {
                                    row[COLUMN_INDEX_STUDENT_RESPONSE] = _this2.escapeContent(studentDataJSONCell.content);
                                } else {
                                    row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                                }
                            } else if (row[COLUMN_INDEX_TYPE] === "note") {
                                if (studentDataJSONCell.text != null) {
                                    row[COLUMN_INDEX_STUDENT_RESPONSE] = _this2.escapeContent(studentDataJSONCell.text);
                                } else {
                                    row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                                }
                            }
                        }

                        // append row to csvString
                        for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                            var cell = row[cellIndex];
                            if ((typeof cell === "undefined" ? "undefined" : _typeof(cell)) === "object") {
                                cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                            } else if (typeof cell === "string") {
                                cell = "\"" + cell + "\"";
                            }
                            csvString += cell + ",";
                        }
                        csvString += "\r\n";
                    }
                }

                var csvBlob = new Blob([csvString], { type: 'text/csv' });
                var csvUrl = URL.createObjectURL(csvBlob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = csvUrl;
                a.download = exportFilename;
                a.click();

                // timeout is required for FF.
                window.setTimeout(function () {
                    URL.revokeObjectURL(csvUrl); // tell browser to release URL reference
                }, 3000);

                /* TODO: get OCPU working again
                 //ocpu.seturl("//localhost:1234/ocpu/library/wise/R");
                 ocpu.seturl("http://128.32.189.240:81/ocpu/user/wiser/library/wiser/R");
                 //perform the request
                 var request = ocpu.call("extractchoices", {
                 "csvFile": csvFile
                 }, (session) => {
                 session.getStdout((returnedCSVString) => {
                 var csvBlob = new Blob([returnedCSVString], {type: 'text/csv'});
                 var csvUrl = URL.createObjectURL(csvBlob);
                 var a = document.createElement("a");
                 document.body.appendChild(a);
                 a.href = csvUrl;
                 a.download = "export_" + runId + ".csv";
                 a.click();
                  // timeout is required for FF.
                 window.setTimeout(() => {
                 URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
                 }, 3000);
                  //return returnedCSVString;
                 });
                 });
                  //if R returns an error, alert the error message
                 request.fail(() => {
                 alert("Server error: " + request.responseText);
                 });
                 */
            });
        }
    }, {
        key: "escapeContent",
        value: function escapeContent(str) {
            return str.replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t');
        }

        /**
         * Export all events for this run in CSV format
         */

    }, {
        key: "exportEvents",
        value: function exportEvents() {
            var _this3 = this;

            this.TeacherDataService.getExport("events").then(function (result) {
                if (result == null) {
                    alert("Error retrieving result");
                    return;
                }
                var onlyExportNodes = null; // this varioable is used later when looping through all rows
                if (_this3.exportStepSelectionType !== "exportAllSteps") {
                    // get the nodes that were selected
                    onlyExportNodes = _this3.getSelectedNodesToExport();
                }

                var COLUMN_INDEX_NODE_ID = 1;
                var COLUMN_INDEX_COMPONENT_ID = 2;
                var COLUMN_INDEX_STEP_NUMBER = 4;
                var COLUMN_INDEX_STEP_TITLE = 5;
                var COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                var COLUMN_INDEX_DATA = 12;
                var COLUMN_INDEX_WORKGROUP_ID = 15;
                var COLUMN_INDEX_WISE_IDS = 19;
                var COLUMN_INDEX_WISE_ID_1 = 19;
                var COLUMN_INDEX_WISE_ID_2 = 20;
                var COLUMN_INDEX_WISE_ID_3 = 21;
                var runId = _this3.ConfigService.getRunId();

                var exportFilename = "events_" + runId + ".csv";

                var csvString = ""; // resulting csv string

                for (var rowIndex = 0; rowIndex < result.length; rowIndex++) {

                    var row = result[rowIndex];

                    if (rowIndex === 0) {
                        // append additional header columns
                        row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                        row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                        row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                    } else {
                        // for all non-header rows, fill in step numbers, titles, and component part numbers.
                        var nodeId = row[COLUMN_INDEX_NODE_ID];
                        var componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        if (_this3.exportStepSelectionType !== "exportAllSteps") {
                            // is user chose certain steps/components to export, see if we need to include this row or not in the export.
                            // get the nodes that were selected
                            if (nodeId != null && componentId != null) {
                                var searchString = nodeId + "-" + componentId;
                                if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                    if (onlyExportNodes.indexOf(searchString) == -1) {
                                        continue; // user didn't select this node to export, so ignore this row and keep looping
                                    }
                                }
                            } else if (nodeId != null) {
                                // only looking for this specific node, not node+component
                                var _searchString2 = nodeId;
                                if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                    if (onlyExportNodes.indexOf(_searchString2) == -1) {
                                        continue; // user didn't select this node to export, so ignore this row and keep looping
                                    }
                                }
                            } else if (nodeId == null && componentId == null) {
                                continue; // don't add general events to export
                            }
                        }
                        row[COLUMN_INDEX_STEP_NUMBER] = _this3.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = _this3.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = _this3.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                        var workgroupId = row[COLUMN_INDEX_WORKGROUP_ID];
                        var wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                        var wiseIDsArray = wiseIDs.split(",");
                        row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                        row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                        row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";
                    }

                    // append row to csvString
                    for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                        var cell = row[cellIndex];
                        if ((typeof cell === "undefined" ? "undefined" : _typeof(cell)) === "object") {
                            cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                        } else if (typeof cell === "string") {
                            cell = "\"" + cell + "\"";
                        }
                        csvString += cell + ",";
                    }
                    csvString += "\r\n";
                }

                var csvBlob = new Blob([csvString], { type: 'text/csv' });
                var csvUrl = URL.createObjectURL(csvBlob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = csvUrl;
                a.download = exportFilename;
                a.click();

                // timeout is required for FF.
                window.setTimeout(function () {
                    URL.revokeObjectURL(csvUrl); // tell browser to release URL reference
                }, 3000);
            });
        }

        /**
         * Get the selected nodes to export
         * @return an array of selected node and component ids that were selected.
         * ex: ["node1", "node1-abcde", "node1-fghij", "node2"], where abcde, fghij are components in node1
         * "node2" means just node2, not components in node2.
         */

    }, {
        key: "getSelectedNodesToExport",
        value: function getSelectedNodesToExport() {
            var selectedNodes = [];

            // loop through all the import project items
            for (var n = 0; n < this.projectItems.length; n++) {
                var item = this.projectItems[n];
                if (item.node.type === "node") {
                    (function () {
                        var nodeId = item.node.id;
                        if (item.checked) {
                            // this item is checked so we will add it to the array of nodes that we will export
                            selectedNodes.push(nodeId);
                        }
                        // also check the components
                        if (item.node.components != null && item.node.components.length > 0) {
                            item.node.components.map(function (component) {
                                if (component.checked) {
                                    selectedNodes.push(nodeId + "-" + component.id);
                                }
                            });
                        }
                    })();
                }
            }

            return selectedNodes;
        }

        /**
         * Handle node item clicked
         */

    }, {
        key: "nodeItemClicked",
        value: function nodeItemClicked(nodeItem) {
            if (nodeItem.checked) {
                // if this node item is checked, make sure its components are also checked.
                if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
                    nodeItem.node.components.map(function (componentItem) {
                        componentItem.checked = true;
                    });
                }
            } else {
                // if this node item is checked, make sure its components are also unchecked.
                if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
                    nodeItem.node.components.map(function (componentItem) {
                        componentItem.checked = false;
                    });
                }
            }
        }

        /**
         * Handle select all items
         */

    }, {
        key: "selectAll",
        value: function selectAll() {
            var doSelect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this.projectIdToOrder != null) {
                for (var nodeId in this.projectIdToOrder) {
                    var projectItem = this.projectIdToOrder[nodeId];
                    if (projectItem.order != 0 && projectItem.node.type != "group") {
                        projectItem.checked = doSelect;
                        // also check its components
                        if (projectItem.node != null && projectItem.node.components != null && projectItem.node.components.length > 0) {
                            projectItem.node.components.map(function (componentItem) {
                                componentItem.checked = doSelect;
                            });
                        }
                    }
                }
            }
        }

        /**
         * Handle deselect all items
         */

    }, {
        key: "deselectAll",
        value: function deselectAll() {
            this.selectAll(false);
        }

        /**
         * Preview the project
         */

    }, {
        key: "previewProject",
        value: function previewProject() {
            var previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');
            // open the preview step in a new tab
            window.open(previewProjectURL);
        }

        /**
         * Preview the step
         * @param node
         */

    }, {
        key: "previewNode",
        value: function previewNode(node) {

            if (node != null) {

                // get the node id
                var nodeId = node.id;

                // get the preview project url
                var previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');

                // create the url to preview the step
                var previewStepURL = previewProjectURL + "#/vle/" + nodeId;

                // open the preview step in a new tab
                window.open(previewStepURL);
            }
        }
    }]);

    return DataExportController;
}();

DataExportController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = DataExportController;
//# sourceMappingURL=dataExportController.js.map