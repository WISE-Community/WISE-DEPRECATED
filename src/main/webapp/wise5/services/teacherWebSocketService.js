"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TeacherWebSocketService = function () {
    function TeacherWebSocketService($rootScope, $websocket, ConfigService, StudentStatusService) {
        _classCallCheck(this, TeacherWebSocketService);

        this.$rootScope = $rootScope;
        this.$websocket = $websocket;
        this.ConfigService = ConfigService;
        this.StudentStatusService = StudentStatusService;
        this.dataStream = null;
        this.studentsOnlineArray = [];
    }

    _createClass(TeacherWebSocketService, [{
        key: "initialize",
        value: function initialize() {
            var _this = this;

            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var workgroupId = this.ConfigService.getWorkgroupId();
            var webSocketURL = this.ConfigService.getWebSocketURL();
            webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
            this.dataStream = this.$websocket(webSocketURL);

            this.dataStream.onMessage(function (message) {
                _this.handleMessage(message);
            });
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
            } else if (messageType === 'studentConnected') {} else if (messageType === 'studentDisconnected') {
                this.handleStudentDisconnected(data);
            } else if (messageType === 'notification' || messageType === 'CRaterResultNotification') {
                this.$rootScope.$broadcast('newNotification', data.data);
            } else if (messageType === 'newAnnotation') {
                this.$rootScope.$broadcast('newAnnotationReceived', { annotation: data.annotation });
            } else if (messageType === 'newStudentWork') {
                this.$rootScope.$broadcast('newStudentWorkReceived', { studentWork: data.studentWork });
            } else if (messageType === 'newStudentAchievement') {
                this.$rootScope.$broadcast('newStudentAchievement', { studentAchievement: data.studentAchievement });
            }
        }
    }, {
        key: "sendMessage",
        value: function sendMessage(messageJSON) {
            // send the websocket message
            this.dataStream.send(messageJSON);
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
            return this.studentsOnlineArray;
        }
    }, {
        key: "isStudentOnline",


        /**
        * Check to see if a given workgroup is currently online
        * @param workgroupId the workgroup id
        * @returns boolean whether a workgroup is online
        */
        value: function isStudentOnline(workgroupId) {
            return this.studentsOnlineArray.indexOf(workgroupId) > -1;
        }
    }, {
        key: "handleStudentStatusReceived",


        /**
         * This function is called when the teacher receives a websocket message
         * with messageType 'studentStatus'.
         */
        value: function handleStudentStatusReceived(studentStatus) {
            var workgroupId = studentStatus.workgroupId;

            // update the student status for the workgroup
            this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);

            // fire the student status received event
            this.$rootScope.$emit('studentStatusReceived', { studentStatus: studentStatus });
        }
    }, {
        key: "handleStudentDisconnected",


        /**
         * Handle the student disconnected message
         */
        value: function handleStudentDisconnected(studentDisconnectedMessage) {

            // fire the student disconnected event
            this.$rootScope.$broadcast('studentDisconnected', { data: studentDisconnectedMessage });
        }

        /**
         * Pause the screens in the period
         * @param periodId the period id. if null or -1 is passed in we will pause
         * all the periods
         */

    }, {
        key: "pauseScreens",
        value: function pauseScreens(periodId) {

            // create the websocket message
            var messageJSON = {};

            messageJSON.messageType = 'pauseScreen';

            if (periodId == null || periodId == -1) {
                //we are going to pause all the students in a run
                messageJSON.messageParticipants = 'teacherToStudentsInRun';
            } else if (periodId != null) {
                //we are going to pause the students in a period
                messageJSON.periodId = periodId;
                messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
            }

            // send the websocket message
            this.sendMessage(messageJSON);
        }

        /**
         * Unpause the screens in the period
         * @param periodId the period id. if null or -1 is passed in we will unpause
         * all the periods
         */

    }, {
        key: "unPauseScreens",
        value: function unPauseScreens(periodId) {

            // create the websocket message
            var messageJSON = {};

            messageJSON.messageType = 'unPauseScreen';

            if (periodId == null || periodId == -1) {
                //we are going to unpause all the students in a run
                messageJSON.messageParticipants = 'teacherToStudentsInRun';
            } else if (periodId != null) {
                //we are going to unpause the students in a period
                messageJSON.periodId = periodId;
                messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
            }

            // send the websocket message
            this.sendMessage(messageJSON);
        }
    }]);

    return TeacherWebSocketService;
}();

TeacherWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentStatusService'];

exports.default = TeacherWebSocketService;
//# sourceMappingURL=teacherWebSocketService.js.map