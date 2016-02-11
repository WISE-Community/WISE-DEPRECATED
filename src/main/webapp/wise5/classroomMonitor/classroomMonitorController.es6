'use strict';

class ClassroomMonitorController {

    constructor($scope, $rootScope, $state, $stateParams, ConfigService, ProjectService, TeacherDataService) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
    };

    hello() {
        ocpu.seturl("//128.32.189.240:81/ocpu/user/wiser/library/wiser/R");
        // perform the request
        var req = ocpu.call("hello", {
            "name": "Hiroki"
        }, function (session) {
            session.getStdout(function (returnedCSVString) {
                var csvBlob = new Blob([returnedCSVString], {type: 'text/csv'});
                var csvUrl = URL.createObjectURL(csvBlob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = csvUrl;
                a.download = "export_" + runId + ".csv";
                a.click();

                // timeout is required for FF.
                window.setTimeout(function () {
                    URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
                }, 3000);
            });
        });
    };

    export(exportType) {
        this.TeacherDataService.getExport(exportType).then((result) => {
            var COLUMN_INDEX_NODE_ID = 1;
            var COLUMN_INDEX_COMPONENT_ID = 2;
            var COLUMN_INDEX_STEP_NUMBER = 4;
            var COLUMN_INDEX_STEP_TITLE = 5;
            var COLUMN_INDEX_COMPONENT_PART_NUMBER = 6;
            var COLUMN_INDEX_STUDENT_DATA = 11;
            var COLUMN_INDEX_WISE_IDS = 18;
            var COLUMN_INDEX_WISE_ID_1 = 18;
            var COLUMN_INDEX_WISE_ID_2 = 19;
            var COLUMN_INDEX_WISE_ID_3 = 20;
            var COLUMN_INDEX_STUDENT_RESPONSE = 21;

            var csvString = "";
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
                    row[COLUMN_INDEX_STEP_NUMBER] = this.ProjectService.getNodePositionById(nodeId);
                    row[COLUMN_INDEX_STEP_TITLE] = this.ProjectService.getNodeTitleByNodeId(nodeId);
                    row[COLUMN_INDEX_COMPONENT_PART_NUMBER] = this.ProjectService.getComponentPositionByNodeIdAndComponentId(nodeId, componentId) + 1; // make it 1-indexed for researchers
                    var wiseIDs = row[COLUMN_INDEX_WISE_IDS];
                    var wiseIDsArray = wiseIDs.split(",");
                    row[COLUMN_INDEX_WISE_ID_1] = wiseIDsArray[0];
                    row[COLUMN_INDEX_WISE_ID_2] = wiseIDsArray[1] || "";
                    row[COLUMN_INDEX_WISE_ID_3] = wiseIDsArray[2] || "";

                    // get the student data JSON and extract responses into its own column
                    var studentDataJSONCell = row[COLUMN_INDEX_STUDENT_DATA];
                    row[COLUMN_INDEX_STUDENT_RESPONSE] = studentDataJSONCell.response || "";
                }

                // append row to cvsString
                for (var cellIndex = 0; cellIndex < row.length; cellIndex++) {
                    var cell = row[cellIndex];
                    if (typeof cell === "object") {
                        cell = "\"" + JSON.stringify(cell).replace(/"/g, '""') + "\"";
                    } else if (typeof cell === "string") {
                        cell = "\"" + cell + "\"";
                    }
                    csvString += cell + ",";
                }
                csvString += "\r\n";
            }
            var runId = this.ConfigService.getRunId();
            var csvBlob = new Blob([csvString], {type: 'text/csv'});
            var csvFile = new File([csvBlob], "export_" + runId + ".csv");

            //ocpu.seturl("//localhost:1234/ocpu/library/wise/R");
            ocpu.seturl("http://128.32.189.240:81/ocpu/user/wiser/library/wiser/R");
            //perform the request
            var request = ocpu.call("extractchoices", {
                "csvFile": csvFile
            }, function (session) {
                session.getStdout(function (returnedCSVString) {
                    var csvBlob = new Blob([returnedCSVString], {type: 'text/csv'});
                    var csvUrl = URL.createObjectURL(csvBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = csvUrl;
                    a.download = "export_" + runId + ".csv";
                    a.click();

                    // timeout is required for FF.
                    window.setTimeout(function () {
                        URL.revokeObjectURL(csvUrl);  // tell browser to release URL reference
                    }, 3000);

                    //return returnedCSVString;
                });
            });

            //if R returns an error, alert the error message
            request.fail(function () {
                alert("Server error: " + request.responseText);
            });
        });
    }
}

ClassroomMonitorController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'ConfigService',
    'ProjectService', 'TeacherDataService'];

export default ClassroomMonitorController;