'use strict';

define(['configService'], function (configService) {

    var service = ['$http', '$rootScope', '$websocket', 'ConfigService', 'StudentDataService', 'StudentStatusService', function ($http, $rootScope, $websocket, ConfigService, StudentDataService, StudentStatusService) {
        var serviceObject = {};

        serviceObject.dataStream = null;

        serviceObject.initialize = function () {
            var runId = ConfigService.getRunId();
            var periodId = ConfigService.getPeriodId();
            var workgroupId = ConfigService.getWorkgroupId();
            var webSocketURL = ConfigService.getWebSocketURL();
            webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
            this.dataStream = $websocket(webSocketURL);

            this.dataStream.onMessage(angular.bind(this, function (message) {
                this.handleMessage(message);
            }));
        };

        serviceObject.handleMessage = function (message) {
            var data = JSON.parse(message.data);
            var messageType = data.messageType;
            if (messageType === 'studentStatus') {
                this.handleStudentStatusReceived(data);
            } else if (messageType === 'studentsOnlineList') {
                this.handleStudentsOnlineReceived(data);
            }
        };

        serviceObject.handleStudentsOnlineReceived = function (studentsOnlineMessage) {
            this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;

            $rootScope.$broadcast('studentsOnlineReceived', { studentsOnline: this.studentsOnlineArray });
        };

        serviceObject.getStudentsOnline = function () {
            var studentsOnline = [];
            if (this.studentsOnlineArray != null) {
                studentsOnline = this.studentsOnlineArray;
            }
            return studentsOnline;
        };

        /**
         * This function is called when the teacher receives a websocket message
         * with messageType 'studentStatus'.
         */
        serviceObject.handleStudentStatusReceived = function (studentStatus) {
            var workgroupId = studentStatus.workgroupId;

            StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);

            var latestCompletedNodeVisit = studentStatus.previousNodeVisit;
            if (latestCompletedNodeVisit != null) {
                var nodeStates = latestCompletedNodeVisit.nodeStates;
                if (nodeStates != null && nodeStates.length > 0) {
                    // there's new work. notify the teacher
                    StudentStatusService.addNewNodeVisit(latestCompletedNodeVisit);
                }
            }
            /*
            var runId = data.runId;
            var periodId = data.periodId;
            var workgroupId = data.workgroupId;
            var currentNodeId = data.currentNodeId;
            var previousNodeVisit = data.previousNodeVisit;
            var nodeStatuses = data.nodeStatuses;
             //we will reset the time spent value to 0 since the student has just moved to a new step
            var timeSpent = '0:00';
             //update our local copy of the student status object for the workgroup id
            var studentStatusObject = this.updateStudentStatusObject(data);
            */

            //get the annotation if any
            //var annotation = data.annotation;

            //update the student progress row for the workgroup id
            //this.updateStudentProgress(runId, periodId, workgroupId, currentNodeId, previousNodeVisit, nodeStatuses, timeSpent);

            //update the step progress for all steps and periods
            //this.updateStepProgress();

            //check if we need to notify the teacher that there's new work for the screen they are viewing
            //this.checkIfNeedToDisplayNewWorkNotification(data);

            //if (annotation != null) {
            //analyze the annotation to see if we need to do anything special
            //this.analyzeAnnotation(annotation, previousNodeVisit, workgroupId);
            //}
        };

        return serviceObject;
    }];

    return service;
});