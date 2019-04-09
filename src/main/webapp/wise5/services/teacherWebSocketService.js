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
      var periodId = this.ConfigService.getPeriodId();
      var workgroupId = this.ConfigService.getWorkgroupId();
      var webSocketURL = this.ConfigService.getWebSocketURL();
      try {
        this.$stomp.connect(webSocketURL).then(function (frame) {
          console.log('connected!');
          var subscription = _this.$stomp.subscribe('/topic/greetings', function (payload, headers, res) {
            _this.payload = payload;
            console.log(payload);
          }, {
            'headers': 'are awesome'
          });

          _this.$stomp.send('/app/hello', JSON.stringify({ 'name': 'teacher' }), {
            priority: 9,
            custom: 42
          });
        });
        // this.dataStream = this.$websocket(webSocketURL);
        // this.dataStream.onMessage((message) => {
        //   this.handleMessage(message);
        // });
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'handleMessage',
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
    key: 'sendMessage',
    value: function sendMessage(messageJSON) {
      this.dataStream.send(messageJSON);
    }
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

    /**
     * Check to see if a given workgroup is currently online
     * @param workgroupId the workgroup id
     * @returns boolean whether a workgroup is online
     */

  }, {
    key: 'isStudentOnline',
    value: function isStudentOnline(workgroupId) {
      return this.studentsOnlineArray.indexOf(workgroupId) > -1;
    }

    /**
     * This function is called when the teacher receives a websocket message
     * with messageType 'studentStatus'.
     */

  }, {
    key: 'handleStudentStatusReceived',
    value: function handleStudentStatusReceived(studentStatus) {
      var workgroupId = studentStatus.workgroupId;
      this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);
      this.$rootScope.$emit('studentStatusReceived', { studentStatus: studentStatus });
    }

    /**
     * Handle the student disconnected message
     */

  }, {
    key: 'handleStudentDisconnected',
    value: function handleStudentDisconnected(studentDisconnectedMessage) {
      this.$rootScope.$broadcast('studentDisconnected', { data: studentDisconnectedMessage });
    }
  }, {
    key: 'pauseScreens',
    value: function pauseScreens(periodId) {
      this.$stomp.send('/app/pause/' + this.runId + '/' + periodId, JSON.stringify({ 'name': 'teacher' }), {
        priority: 9,
        custom: 42
      });

      /*
      if (periodId === -1) {
        this.$stomp.send(`/app/pause/${this.runId}`, JSON.stringify({'name': 'teacher'}), {
          priority: 9,
          custom: 42
        });
      } else {
        this.$stomp.send(`/app/pause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {
          priority: 9,
          custom: 42
        });
      }
      const messageJSON = {};
      messageJSON.messageType = 'pauseScreen';
       if (periodId == null || periodId == -1) {
        messageJSON.messageParticipants = 'teacherToStudentsInRun';
      } else if(periodId != null) {
        messageJSON.periodId = periodId;
        messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
      }
      this.sendMessage(messageJSON);
      */
    }
  }, {
    key: 'unPauseScreens',
    value: function unPauseScreens(periodId) {
      this.$stomp.send('/app/unpause/' + this.runId + '/' + periodId, JSON.stringify({ 'name': 'teacher' }), {
        priority: 9,
        custom: 42
      });
      /*
      if (periodId === -1) {
        this.$stomp.send(`/app/unpause/${this.runId}`, JSON.stringify({'name': 'teacher'}), {
          priority: 9,
          custom: 42
        });
      } else {
        this.$stomp.send(`/app/unpause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {
          priority: 9,
          custom: 42
        });
         const messageJSON = {};
        messageJSON.messageType = 'unPauseScreen';
         if(periodId == null || periodId == -1) {
          messageJSON.messageParticipants = 'teacherToStudentsInRun';
        } else if(periodId != null) {
          messageJSON.periodId = periodId;
          messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
        }
        this.sendMessage(messageJSON);
      }
        */
    }
  }]);

  return TeacherWebSocketService;
}();

TeacherWebSocketService.$inject = ['$rootScope', '$stomp', '$websocket', 'ConfigService', 'StudentStatusService'];

exports.default = TeacherWebSocketService;
//# sourceMappingURL=teacherWebSocketService.js.map
