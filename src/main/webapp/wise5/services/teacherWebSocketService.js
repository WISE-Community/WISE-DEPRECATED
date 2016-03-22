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

            // update the student status for the workgroup
            this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);

            // fire the student status received event
            this.$rootScope.$emit('studentStatusReceived', { studentStatus: studentStatus });
        }
    }]);

    return TeacherWebSocketService;
}();

TeacherWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentStatusService'];

exports.default = TeacherWebSocketService;
//# sourceMappingURL=teacherWebSocketService.js.map