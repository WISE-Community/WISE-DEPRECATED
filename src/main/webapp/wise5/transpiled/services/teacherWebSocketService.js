"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TeacherWebSocketService = function () {
    function TeacherWebSocketService($rootScope, $websocket, ConfigService, StudentStatusService) {
        _classCallCheck(this, TeacherWebSocketService);

        this.$rootScope = $rootScope;
        this.$websocket = $websocket;
        this.ConfigService = ConfigService;
        this.StudentStatusService = StudentStatusService;
        this.dataStream = null;
    }

    _createClass(TeacherWebSocketService, [{
        key: "initialize",
        value: function initialize() {
            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var workgroupId = this.ConfigService.getWorkgroupId();
            var webSocketURL = this.ConfigService.getWebSocketURL();
            webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
            this.dataStream = this.$websocket(webSocketURL);

            this.dataStream.onMessage(angular.bind(this, function (message) {
                this.handleMessage(message);
            }));
        }
    }, {
        key: "handleMessage",
        value: function handleMessage(message) {
            var data = JSON.parse(message.data);
            var messageType = data.messageType;
            if (messageType === 'studentStatus') {
                this.handleStudentStatusReceived(data);
            } else if (messageType === 'studentsOnlineList') {
                this.handleStudentsOnlineReceived(data);
            }
        }
    }, {
        key: "handleStudentsOnlineReceived",
        value: function handleStudentsOnlineReceived(studentsOnlineMessage) {
            this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;

            this.$rootScope.$broadcast('studentsOnlineReceived', { studentsOnline: this.studentsOnlineArray });
        }
    }, {
        key: "getStudentsOnline",
        value: function getStudentsOnline() {
            var studentsOnline = [];
            if (this.studentsOnlineArray != null) {
                studentsOnline = this.studentsOnlineArray;
            }
            return studentsOnline;
        }
    }, {
        key: "handleStudentStatusReceived",

        /**
         * This function is called when the teacher receives a websocket message
         * with messageType 'studentStatus'.
         */
        value: function handleStudentStatusReceived(studentStatus) {
            var workgroupId = studentStatus.workgroupId;

            this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);

            var latestCompletedNodeVisit = studentStatus.previousNodeVisit;
            if (latestCompletedNodeVisit != null) {
                var nodeStates = latestCompletedNodeVisit.nodeStates;
                if (nodeStates != null && nodeStates.length > 0) {
                    // there's new work. notify the teacher
                    this.StudentStatusService.addNewNodeVisit(latestCompletedNodeVisit);
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
        }
    }]);

    return TeacherWebSocketService;
}();

TeacherWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentStatusService'];

exports.default = TeacherWebSocketService;