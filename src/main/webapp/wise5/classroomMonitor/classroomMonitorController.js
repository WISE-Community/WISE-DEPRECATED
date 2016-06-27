'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClassroomMonitorController = function () {
    function ClassroomMonitorController($mdDialog, $rootScope, $scope, $state, $stateParams, $translate, ConfigService, ProjectService, SessionService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, ClassroomMonitorController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.$translate('pauseStudentScreens').then(function (pauseStudentScreens) {
            _this.pauseScreenButtonText = pauseStudentScreens;
        });

        $scope.$on('showSessionWarning', function () {
            // Appending dialog to document.body
            var confirm = $mdDialog.confirm().parent(angular.element(document.body)).title('Session Timeout').content('You have been inactive for a long time. Do you want to stay logged in?').ariaLabel('Session Timeout').ok('YES').cancel('No');
            $mdDialog.show(confirm).then(function () {
                _this.SessionService.renewSession();
            }, function () {
                _this.SessionService.forceLogOut();
            });
        });

        // listen for the periodChanged event
        $scope.$on('periodChanged', function (event, args) {
            // the period has changed so we will update the paused/unpaused button
            _this.updatePauseButton();
        });

        // update the text of the pause/unpause button
        this.updatePauseButton();
    }

    _createClass(ClassroomMonitorController, [{
        key: 'hello',
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
        key: 'export',


        /**
         * Export all or latest work for this run in CSV format
         */
        value: function _export(exportType) {
            var _this2 = this;

            this.TeacherDataService.getExport(exportType).then(function (result) {
                if (result == null) {
                    alert("Error retrieving result");
                    return;
                }
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
                var runId = _this2.ConfigService.getRunId();

                var exportFilename = "";
                if (exportType === "latestStudentWork") {
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
                } else {
                    exportFilename = "all_work_" + runId + ".csv";
                }

                var csvString = ""; // resulting csv string

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
                        var nodeId = row[COLUMN_INDEX_NODE_ID];
                        var componentId = row[COLUMN_INDEX_COMPONENT_ID];
                        row[COLUMN_INDEX_STEP_NUMBER] = _this2.ProjectService.getNodePositionById(nodeId);
                        row[COLUMN_INDEX_STEP_TITLE] = _this2.ProjectService.getNodeTitleByNodeId(nodeId);
                        row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = _this2.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
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
                        if ((typeof cell === 'undefined' ? 'undefined' : _typeof(cell)) === "object") {
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

        /**
         * Export all events for this run in CSV format
         */

    }, {
        key: 'exportEvents',
        value: function exportEvents() {
            var _this3 = this;

            this.TeacherDataService.getExport("events").then(function (result) {
                if (result == null) {
                    alert("Error retrieving result");
                    return;
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
                        if ((typeof cell === 'undefined' ? 'undefined' : _typeof(cell)) === "object") {
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
         * The pause screen button was clicked. This button is used to toggle
         * pause screen on and off.
         */

    }, {
        key: 'pauseScreenButtonClicked',
        value: function pauseScreenButtonClicked() {

            // get the currently selected period
            var currentPeriod = this.TeacherDataService.getCurrentPeriod();
            var periodId = currentPeriod.periodId;

            // get the previous value of whether the period was paused or unpaused
            var isPaused = this.TeacherDataService.isPeriodPaused(periodId);

            // toggle the value
            var newIsPausedValue = !isPaused;

            // update the run status
            this.TeacherDataService.updatePausedRunStatusValue(periodId, newIsPausedValue);

            // update the pause/unpause button text
            this.updatePauseButton();

            if (newIsPausedValue) {
                // pause the student screens
                this.TeacherWebSocketService.pauseScreens(periodId);
            } else {
                // unpause the student screens
                this.TeacherWebSocketService.unPauseScreens(periodId);
            }

            // save the run status to the server
            this.TeacherDataService.sendRunStatus();
        }

        /**
         * Update the pause button to reflect the pause/unpaused state of the period
         */

    }, {
        key: 'updatePauseButton',
        value: function updatePauseButton() {
            // get the currently selected period
            var currentPeriod = this.TeacherDataService.getCurrentPeriod();

            // default to all periods
            var periodId = -1;

            if (currentPeriod != null) {
                periodId = currentPeriod.periodId;
            }

            // whether the period is paused or unpaused
            var isPaused = this.TeacherDataService.isPeriodPaused(periodId);

            // update the paused/unpaused button text
            if (isPaused) {
                this.displayUnPauseButton();
            } else if (!isPaused) {
                this.displayPauseButton();
            }
        }

        /**
         * Change the text of the button to display 'Pause Screens'
         */

    }, {
        key: 'displayPauseButton',
        value: function displayPauseButton() {
            var _this4 = this;

            this.$translate('pauseStudentScreens').then(function (pauseStudentScreens) {
                _this4.pauseScreenButtonText = pauseStudentScreens;
            });
        }

        /**
         * Change the text of the button to display 'Unpause Screens'
         */

    }, {
        key: 'displayUnPauseButton',
        value: function displayUnPauseButton() {
            var _this5 = this;

            this.$translate('unPauseStudentScreens').then(function (unPauseStudentScreens) {
                _this5.pauseScreenButtonText = unPauseStudentScreens;
            });
        }

        /**
         * The user has moved the mouse so we will notify the Session Service
         * so that it can refresh the session
         */

    }, {
        key: 'mouseMoved',
        value: function mouseMoved() {
            /*
             * notify the Session Service that the user has moved the mouse
             * so we can refresh the session
             */
            this.SessionService.mouseMoved();
        }
    }]);

    return ClassroomMonitorController;
}();

ClassroomMonitorController.$inject = ['$mdDialog', '$rootScope', '$scope', '$state', '$stateParams', '$translate', 'ConfigService', 'ProjectService', 'SessionService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = ClassroomMonitorController;
//# sourceMappingURL=classroomMonitorController.js.map