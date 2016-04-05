'use strict';

class ClassroomMonitorController {

    constructor($mdDialog,
                $rootScope,
                $scope,
                $state,
                $stateParams,
                $translate,
                ConfigService,
                ProjectService,
                SessionService,
                TeacherDataService,
                TeacherWebSocketService) {
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
        this.$translate('pauseStudentScreens').then((pauseStudentScreens) => {
            this.pauseScreenButtonText = pauseStudentScreens;
        });

        $scope.$on('showSessionWarning', () => {
            // Appending dialog to document.body
            let confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Session Timeout')
                .content('You have been inactive for a long time. Do you want to stay logged in?')
                .ariaLabel('Session Timeout')
                .ok('YES')
                .cancel('No');
            $mdDialog.show(confirm).then(() => {
                this.SessionService.renewSession();
            }, () => {
                this.SessionService.forceLogOut();
            });
        });

        // listen for the periodChanged event
        $scope.$on('periodChanged', (event, args) => {
            // the period has changed so we will update the paused/unpaused button
            this.updatePauseButton();
        });

        // update the text of the pause/unpause button
        this.updatePauseButton();
    };

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

                // append row to csvString
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
     * The pause screen button was clicked. This button is used to toggle
     * pause screen on and off.
     */
    pauseScreenButtonClicked() {

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
    updatePauseButton() {
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
    displayPauseButton() {
        this.$translate('pauseStudentScreens').then((pauseStudentScreens) => {
            this.pauseScreenButtonText = pauseStudentScreens;
        });
    }

    /**
     * Change the text of the button to display 'Unpause Screens'
     */
    displayUnPauseButton() {
        this.$translate('unPauseStudentScreens').then((unPauseStudentScreens) => {
            this.pauseScreenButtonText = unPauseStudentScreens;
        });
    }
}

ClassroomMonitorController.$inject = [
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$translate',
    'ConfigService',
    'ProjectService',
    'SessionService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default ClassroomMonitorController;
