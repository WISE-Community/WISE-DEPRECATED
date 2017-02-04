'use strict';

class DataExportController {

    constructor($rootScope,
                $scope,
                $state,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.exportStepSelectionType = "exportAllSteps";
        this.exportType = null;  // type of export: [latestWork, allWork, events]

        // get the project
        // create the mapping of node id to order for the import project
        this.ProjectService.retrieveProject().then((projectJSON) => {
            this.project = projectJSON;
            // calculate the node order of the import project
            let nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.project);
            this.projectIdToOrder = nodeOrderOfProject.idToOrder;
            this.projectItems = nodeOrderOfProject.nodes;
        });

        // save event when data export view is displayed
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "Navigation", event = "dataExportViewDisplayed", data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    hello() {
        ocpu.seturl("//128.32.189.240:81/ocpu/user/wiser/library/wiser/R");
        // perform the request
        var req = ocpu.call("hello", {
            "name": "Hiroki"
        }, (session) => {
            session.getStdout((returnedCSVString) => {
                var csvBlob = new Blob([returnedCSVString], {type: 'text/csv'});
                var csvUrl = URL.createObjectURL(csvBlob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = csvUrl;
                a.download = "export_" + runId + ".csv";
                a.click();

                // timeout is required for FF.
                window.setTimeout(() => {
                    URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
                }, 3000);
            });
        });
    };

    /**
     * Export all or latest work for this run in CSV format
     * latestWork, allWork, and events will call this function with a null exportType.
     */
    export(exportType = null) {
        if (exportType == null) {
            exportType = this.exportType;
        }

        // save event for this export request
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "UserInteraction", event = "exportRequested", data = {"exportType": exportType};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);

        if ((exportType === "latestStudentWork" || exportType === "allStudentWork" || exportType === "events") && !this.exportStepSelectionType === "exportAllSteps") {
            // get the nodes that were selected
            let selectedNodes = this.getSelectedNodesToExport();

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

        this.TeacherDataService.getExport(exportType).then((result) => {
            if (result == null) {
                alert("Error retrieving result");
                return;
            }

            if (exportType === "studentAssets") {
                return; // no further processing necessary
            }
            let onlyExportNodes = null;  // this varioable is used later when looping through all rows
            if (this.exportStepSelectionType !== "exportAllSteps") {
                // get the nodes that were selected
                onlyExportNodes = this.getSelectedNodesToExport();
            }

            let runId = this.ConfigService.getRunId();
            let exportFilename = "";

            let csvString = "";  // resulting csv string

            if (exportType === "latestStudentWork" || exportType === "allStudentWork") {
                let COLUMN_INDEX_NODE_ID = 1;
                let COLUMN_INDEX_COMPONENT_ID = 2;
                let COLUMN_INDEX_STEP_NUMBER = 4;
                let COLUMN_INDEX_STEP_TITLE = 5;
                let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                let COLUMN_INDEX_STUDENT_DATA = 11;
                let COLUMN_INDEX_WORKGROUP_ID = 14;
                let COLUMN_INDEX_WISE_IDS = 18;
                let COLUMN_INDEX_WISE_ID_1 = 18;
                let COLUMN_INDEX_WISE_ID_2 = 19;
                let COLUMN_INDEX_WISE_ID_3 = 20;
                let COLUMN_INDEX_STUDENT_RESPONSE = 21;

                if (exportType === "latestStudentWork") {
                    let hash = {};  // store latestStudentWork. Assume that key = (nodeId, componentId, workgroupId)
                    result = result.reverse().filter( (studentWorkRow) => {
                        let hashKey = studentWorkRow[COLUMN_INDEX_NODE_ID] + "_" + studentWorkRow[COLUMN_INDEX_COMPONENT_ID] + "_" + studentWorkRow[COLUMN_INDEX_WORKGROUP_ID];
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
                } else if (exportType === "allStudentWork") {
                    exportFilename = "all_work_" + runId + ".csv";
                }

                for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                    let row = result[rowIndex];

                    if (rowIndex === 0) {
                        // append additional header columns
                        row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                        row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                        row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                        row[COLUMN_INDEX_STUDENT_RESPONSE] = "response";
                    } else {
                        // for all non-header rows, fill in step numbers, titles, and component part numbers.
                        let nodeId = row[COLUMN_INDEX_NODE_ID];
                        let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        if (this.exportStepSelectionType !== "exportAllSteps") {
                            // is user chose certain steps/components to export, see if we need to include this row or not in the export.
                            // get the nodes that were selected
                            if (nodeId != null && componentId != null) {
                                let searchString = nodeId + "-" + componentId;
                                if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                    if (onlyExportNodes.indexOf(searchString) == -1) {
                                        continue;  // user didn't select this node to export, so ignore this row and keep looping
                                    }
                                }
                            } else if (nodeId != null) {
                                // only looking for this specific node, not node+component
                                let searchString = nodeId;
                                if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                    if (onlyExportNodes.indexOf(searchString) == -1) {
                                        continue;  // user didn't select this node to export, so ignore this row and keep looping
                                    }
                                }
                            } else if (nodeId == null && componentId == null) {
                                continue;  // don't add general work to export
                            }
                        }
                        row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                        let workgroupId = row[COLUMN_INDEX_WORKGROUP_ID];
                        let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                        let wiseIDsArray = wiseIDs.split(",");
                        row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                        row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                        row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                        // get the student data JSON and extract responses into its own column
                        let studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                        row[COLUMN_INDEX_STUDENT_RESPONSE] = studentDataJSONCell.response || "";
                    }

                    // append row to csvString
                    for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                        let cell = row[cellIndex];
                        if (typeof cell === "object") {
                            cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                        } else if (typeof cell === "string") {
                            cell = "\"" + cell + "\"";
                        }
                        csvString += cell + ",";
                    }
                    csvString += "\r\n";
                }

            } else if (exportType === "latestNotebookItems" || exportType === "allNotebookItems") {
                exportFilename = "notebook_" + runId + ".csv";

                let COLUMN_INDEX_LOCAL_NOTEBOOK_ITEM_ID = 1;
                let COLUMN_INDEX_NODE_ID = 2;
                let COLUMN_INDEX_COMPONENT_ID = 3;
                let COLUMN_INDEX_STEP_NUMBER = 4;
                let COLUMN_INDEX_STEP_TITLE = 5;
                let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
                let COLUMN_INDEX_TYPE = 9;
                let COLUMN_INDEX_STUDENT_DATA = 10;
                let COLUMN_INDEX_WISE_IDS = 17;
                let COLUMN_INDEX_WISE_ID_1 = 17;
                let COLUMN_INDEX_WISE_ID_2 = 18;
                let COLUMN_INDEX_WISE_ID_3 = 19;
                let COLUMN_INDEX_STUDENT_RESPONSE = 20;

                if (exportType === "latestNotebookItems") {
                    let hash = {};  // store latestStudentWork. Assume that key = (localNotebookItemId)
                    result = result.reverse().filter( (studentWorkRow) => {
                        let hashKey = studentWorkRow[COLUMN_INDEX_LOCAL_NOTEBOOK_ITEM_ID];
                        if (!hash.hasOwnProperty(hashKey)) {
                            // remember in hash
                            hash[hashKey] = studentWorkRow;
                            return true;
                        } else {
                            // we already have the latest, so we can disregard this studentWorkRow.
                            return false;
                        }
                    }).reverse();
                    exportFilename = "latest_notebook_items_" + runId + ".csv";
                } else if (exportType === "allNotebookItems") {
                    exportFilename = "all_notebook_items_" + runId + ".csv";
                }

                for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
                    let row = result[rowIndex];

                    if (rowIndex === 0) {
                        // append additional header columns
                        row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                        row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                        row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                        row[COLUMN_INDEX_STUDENT_RESPONSE] = "response";
                    } else {
                        // for all non-header rows, fill in step numbers, titles, and component part numbers.
                        let nodeId = row[COLUMN_INDEX_NODE_ID];
                        let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                        let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                        let wiseIDsArray = wiseIDs.split(",");
                        row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                        row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                        row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                        // get the student data JSON and extract responses into its own column
                        let studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                        if (row[COLUMN_INDEX_TYPE] === "report") {
                            if (studentDataJSONCell.content != null) {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = this.escapeContent(studentDataJSONCell.content);
                            } else {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                            }
                        } else if (row[COLUMN_INDEX_TYPE] === "note") {
                            if (studentDataJSONCell.text != null) {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = this.escapeContent(studentDataJSONCell.text);
                            } else {
                                row[COLUMN_INDEX_STUDENT_RESPONSE] = "";
                            }
                        }
                    }

                    // append row to csvString
                    for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                        let cell = row[cellIndex];
                        if (typeof cell === "object") {
                            cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                        } else if (typeof cell === "string") {
                            cell = "\"" + cell + "\"";
                        }
                        csvString += cell + ",";
                    }
                    csvString += "\r\n";
                }
            }

            let csvBlob = new Blob([csvString], {type: 'text/csv'});
            let csvUrl = URL.createObjectURL(csvBlob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = csvUrl;
            a.download = exportFilename;
            a.click();

            // timeout is required for FF.
            window.setTimeout(() => {
                URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
            }, 3000);
        });
    }

    escapeContent(str) {
        return str
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    /**
     * Export all events for this run in CSV format
     */
    exportEvents() {

        this.TeacherDataService.getExport("events").then((result) => {
            if (result == null) {
                alert("Error retrieving result");
                return;
            }
            let onlyExportNodes = null;  // this varioable is used later when looping through all rows
            if (this.exportStepSelectionType !== "exportAllSteps") {
                // get the nodes that were selected
                onlyExportNodes = this.getSelectedNodesToExport();
            }

            let COLUMN_INDEX_NODE_ID = 1;
            let COLUMN_INDEX_COMPONENT_ID = 2;
            let COLUMN_INDEX_STEP_NUMBER = 4;
            let COLUMN_INDEX_STEP_TITLE = 5;
            let COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
            let COLUMN_INDEX_DATA = 12;
            let COLUMN_INDEX_WORKGROUP_ID = 15;
            let COLUMN_INDEX_WISE_IDS = 19;
            let COLUMN_INDEX_WISE_ID_1 = 19;
            let COLUMN_INDEX_WISE_ID_2 = 20;
            let COLUMN_INDEX_WISE_ID_3 = 21;
            let runId = this.ConfigService.getRunId();

            let exportFilename = "events_" + runId + ".csv";

            let csvString = "";  // resulting csv string

            for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {

                let row = result[rowIndex];

                if (rowIndex === 0) {
                    // append additional header columns
                    row[COLUMN_INDEX_WISE_ID_1] = "WISE ID 1";
                    row[COLUMN_INDEX_WISE_ID_2] = "WISE ID 2";
                    row[COLUMN_INDEX_WISE_ID_3] = "WISE ID 3";
                } else {
                    // for all non-header rows, fill in step numbers, titles, and component part numbers.
                    let nodeId = row[COLUMN_INDEX_NODE_ID];
                    let componentId = row[COLUMN_INDEX_COMPONENT_ID];
                    if (this.exportStepSelectionType !== "exportAllSteps") {
                        // is user chose certain steps/components to export, see if we need to include this row or not in the export.
                        // get the nodes that were selected
                        if (nodeId != null && componentId != null) {
                            let searchString = nodeId + "-" + componentId;
                            if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                if (onlyExportNodes.indexOf(searchString) == -1) {
                                    continue;  // user didn't select this node to export, so ignore this row and keep looping
                                }
                            }
                        } else if (nodeId != null) {
                            // only looking for this specific node, not node+component
                            let searchString = nodeId;
                            if (onlyExportNodes != null && onlyExportNodes.length > 0) {
                                if (onlyExportNodes.indexOf(searchString) == -1) {
                                    continue;  // user didn't select this node to export, so ignore this row and keep looping
                                }
                            }
                        } else if (nodeId == null && componentId == null) {
                            continue;  // don't add general events to export
                        }
                    }
                    row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                    row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                    row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                    let workgroupId = row[COLUMN_INDEX_WORKGROUP_ID];
                    let wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                    let wiseIDsArray = wiseIDs.split(",");
                    row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                    row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                    row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";
                }

                // append row to csvString
                for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                    let cell = row[cellIndex];
                    if (typeof cell === "object") {
                        cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                    } else if (typeof cell === "string") {
                        cell = "\"" + cell + "\"";
                    }
                    csvString += cell + ",";
                }
                csvString += "\r\n";
            }

            let csvBlob = new Blob([csvString], {type: 'text/csv'});
            let csvUrl = URL.createObjectURL(csvBlob);
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.href = csvUrl;
            a.download = exportFilename;
            a.click();

            // timeout is required for FF.
            window.setTimeout(() => {
                URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
            }, 3000);
        });
    }

    /**
     * Get the selected nodes to export
     * @return an array of selected node and component ids that were selected.
     * ex: ["node1", "node1-abcde", "node1-fghij", "node2"], where abcde, fghij are components in node1
     * "node2" means just node2, not components in node2.
     */
    getSelectedNodesToExport() {
        let selectedNodes = [];

        // loop through all the import project items
        for (let n = 0; n < this.projectItems.length; n++) {
            let item = this.projectItems[n];
            if (item.node.type === "node") {
                let nodeId = item.node.id;
                if (item.checked) {
                    // this item is checked so we will add it to the array of nodes that we will export
                    selectedNodes.push(nodeId);
                }
                // also check the components
                if (item.node.components != null && item.node.components.length > 0) {
                    item.node.components.map((component) => {
                        if (component.checked) {
                            selectedNodes.push(nodeId + "-" + component.id);
                        }
                    });
                }
            }
        }

        return selectedNodes;
    }

    /**
     * Handle node item clicked
     */
    nodeItemClicked(nodeItem) {
        if (nodeItem.checked) {
            // if this node item is checked, make sure its components are also checked.
            if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
                nodeItem.node.components.map((componentItem) => { componentItem.checked = true; });
            }
        } else {
            // if this node item is checked, make sure its components are also unchecked.
            if (nodeItem.node != null && nodeItem.node.components != null && nodeItem.node.components.length > 0) {
                nodeItem.node.components.map((componentItem) => { componentItem.checked = false; });
            }
        }
    }

    /**
     * Handle select all items
     */
    selectAll(doSelect = true) {
        if (this.projectIdToOrder != null) {
            for (let nodeId in this.projectIdToOrder) {
                let projectItem = this.projectIdToOrder[nodeId];
                if (projectItem.order != 0 && projectItem.node.type != "group") {
                    projectItem.checked = doSelect;
                    // also check its components
                    if (projectItem.node != null && projectItem.node.components != null && projectItem.node.components.length > 0) {
                        projectItem.node.components.map((componentItem) => { componentItem.checked = doSelect; });
                    }
                }
            }
        }
    }

    /**
     * Handle deselect all items
     */
    deselectAll() {
        this.selectAll(false);
    }

    /**
     * Preview the project
     */
    previewProject() {
        let previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');
        // open the preview step in a new tab
        window.open(previewProjectURL);
    }

    /**
     * Preview the step
     * @param node
     */
    previewNode(node) {

        if (node != null) {

            // get the node id
            let nodeId = node.id;

            // get the preview project url
            let previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');

            // create the url to preview the step
            let previewStepURL  = previewProjectURL + "#/vle/" + nodeId;

            // open the preview step in a new tab
            window.open(previewStepURL);
        }
    }
}

DataExportController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default DataExportController;
