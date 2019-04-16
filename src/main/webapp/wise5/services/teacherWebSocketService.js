'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TeacherWebSocketService = function () {
  function TeacherWebSocketService($rootScope, $stomp, $websocket, ConfigService, StudentStatusService) {
    _classCallCheck(this, TeacherWebSocketService);

    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.StudentStatusService = StudentStatusService;
    this.dataStream = null;
    this.studentsOnlineArray = [];
  }

  _createClass(TeacherWebSocketService, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.runId = this.ConfigService.getRunId();
      var webSocketURL = this.ConfigService.getWebSocketURL();
      try {
        this.$stomp.connect(webSocketURL).then(function (frame) {
          _this.subscribeToTeacherTopic();
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'subscribeToTeacherTopic',
    value: function subscribeToTeacherTopic() {
      var _this2 = this;

      this.$stomp.subscribe('/topic/teacher/' + this.runId, function (message, headers, res) {
        if (message.type === 'studentWork') {
          var studentWork = message.content;
          studentWork.studentData = JSON.parse(studentWork.studentData);
          _this2.$rootScope.$broadcast('newStudentWorkReceived', { studentWork: studentWork });
        } else if (message.type === 'studentStatus') {
          var studentStatus = message.content;
          var status = JSON.parse(studentStatus.status);
          _this2.handleStudentStatusReceived(status);
        } else if (message.type === 'notification') {
          _this2.$rootScope.$broadcast('newNotification', message.content);
        }
      });
    }

    /*
    handleMessage(message) {
      const data = JSON.parse(message.data);
      const messageType = data.messageType;
      if (messageType === 'studentStatus') {
        this.handleStudentStatusReceived(data);
      } else if (messageType === 'studentsOnlineList') {
        this.handleStudentsOnlineReceived(data);
      } else if (messageType === 'studentConnected') {
       } else if (messageType === 'studentDisconnected') {
        this.handleStudentDisconnected(data);
      } else if (messageType === 'notification' || messageType === 'CRaterResultNotification') {
        this.$rootScope.$broadcast('newNotification', data.data);
      } else if (messageType === 'newAnnotation') {
        this.$rootScope.$broadcast('newAnnotationReceived', {annotation: data.annotation});
      } else if (messageType === 'newStudentWork') {
        this.$rootScope.$broadcast('newStudentWorkReceived', {studentWork: data.studentWork});
      } else if (messageType === 'newStudentAchievement') {
        this.$rootScope.$broadcast('newStudentAchievement', {studentAchievement: data.studentAchievement});
      }
    }
    sendMessage(messageJSON) {
      this.dataStream.send(messageJSON);
    }
    */

  }, {
    key: 'handleStudentsOnlineReceived',
    value: function handleStudentsOnlineReceived(studentsOnlineMessage) {
      this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
      this.$rootScope.$broadcast('studentsOnlineReceived', { studentsOnline: this.studentsOnlineArray });
    }
  }, {
    key: 'getStudentsOnline',
    value: function getStudentsOnline() {
      return this.studentsOnlineArray;
    }
  }, {
    key: 'isStudentOnline',
    value: function isStudentOnline(workgroupId) {
      return this.studentsOnlineArray.indexOf(workgroupId) > -1;
    }
  }, {
    key: 'handleStudentStatusReceived',
    value: function handleStudentStatusReceived(studentStatus) {
      var workgroupId = studentStatus.workgroupId;
      this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);
      this.$rootScope.$emit('studentStatusReceived', { studentStatus: studentStatus });
    }
  }, {
    key: 'handleStudentDisconnected',
    value: function handleStudentDisconnected(studentDisconnectedMessage) {
      this.$rootScope.$broadcast('studentDisconnected', { data: studentDisconnectedMessage });
    }
  }, {
    key: 'pauseScreens',
    value: function pauseScreens(periodId) {
      this.$stomp.send('/app/pause/' + this.runId + '/' + periodId, JSON.stringify({ 'name': 'teacher' }), {});
    }
  }, {
    key: 'unPauseScreens',
    value: function unPauseScreens(periodId) {
      this.$stomp.send('/app/unpause/' + this.runId + '/' + periodId, JSON.stringify({ 'name': 'teacher' }), {});
    }
  }]);

  return TeacherWebSocketService;
}();

TeacherWebSocketService.$inject = ['$rootScope', '$stomp', '$websocket', 'ConfigService', 'StudentStatusService'];

exports.default = TeacherWebSocketService;
//# sourceMappingURL=teacherWebSocketService.js.map
