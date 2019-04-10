'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentWebSocketService = function () {
  function StudentWebSocketService($rootScope, $stomp, ConfigService, StudentDataService) {
    _classCallCheck(this, StudentWebSocketService);

    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.ConfigService = ConfigService;
    this.StudentDataService = StudentDataService;
    this.dataStream = null;
  }

  _createClass(StudentWebSocketService, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      if (!this.ConfigService.isPreview()) {
        this.runId = this.ConfigService.getRunId();
        this.periodId = this.ConfigService.getPeriodId();
        var workgroupId = this.ConfigService.getWorkgroupId();
        var webSocketURL = this.ConfigService.getWebSocketURL();
        try {
          this.$stomp.connect(webSocketURL).then(function (frame) {
            console.log('connected! runId: ' + _this.runId);
            var greetingSubscription = _this.$stomp.subscribe('/topic/greetings/' + _this.runId, function (payload, headers, res) {
              console.log('Greeting: ' + payload);
            }, {});

            var pauseSubscription = _this.$stomp.subscribe('/topic/pause/' + _this.runId + '/' + _this.periodId, function (payload, headers, res) {
              console.log('Pause: ' + payload);
              _this.$rootScope.$broadcast('pauseScreen', { data: payload });
            }, {});

            var unPauseSubscription = _this.$stomp.subscribe('/topic/unpause/' + _this.runId + '/' + _this.periodId, function (payload, headers, res) {
              console.log('UnPause: ' + payload);
              _this.$rootScope.$broadcast('unPauseScreen', { data: payload });
            }, {});

            var studentWorkSubscription = _this.$stomp.subscribe('/topic/student-work/' + _this.runId + '/' + _this.periodId, function (studentWork, headers, res) {
              studentWork.studentData = JSON.parse(studentWork.studentData);
              _this.$rootScope.$broadcast('StudentWorkReceived', studentWork);
            }, {});

            _this.$stomp.send('/app/hello/' + _this.runId, JSON.stringify({ 'name': 'workgroup ' + workgroupId }), {});
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, {
    key: 'handleWebSocketMessageReceived',
    value: function handleWebSocketMessageReceived(data) {
      this.$rootScope.$broadcast('webSocketMessageReceived', { data: data });
    }
  }, {
    key: 'handleMessage',
    value: function handleMessage(message) {
      var data = JSON.parse(message.data);
      var messageType = data.messageType;
      if (messageType === 'pauseScreen') {
        this.$rootScope.$broadcast('pauseScreen', { data: data });
      } else if (messageType === 'unPauseScreen') {
        this.$rootScope.$broadcast('unPauseScreen', { data: data });
      } else if (messageType === 'notification') {
        this.$rootScope.$broadcast('newNotification', data.data);
      } else if (messageType === 'annotationNotification') {
        // a new annotation + notification combo object was sent over websocket

        // save the new annotation locally
        var annotationData = data.annotationData;
        this.StudentDataService.AnnotationService.addOrUpdateAnnotation(annotationData);
        this.$rootScope.$broadcast('newAnnotationReceived', { annotation: annotationData });

        // fire the new notification
        var notificationData = data.notificationData;
        this.$rootScope.$broadcast('newNotification', notificationData);
      }
      this.handleWebSocketMessageReceived(data);
    }
  }, {
    key: 'sendStudentToTeacherMessage',
    value: function sendStudentToTeacherMessage(messageType, data) {
      if (!this.ConfigService.isPreview()) {
        var currentNodeId = this.StudentDataService.getCurrentNodeId();
        var messageJSON = {};
        messageJSON.messageType = messageType;
        messageJSON.messageParticipants = 'studentToTeachers';
        messageJSON.currentNodeId = currentNodeId;
        messageJSON.data = data;
        this.dataStream.send(messageJSON);
      }
    }

    /**
     * Send a message to classmates in the period
     * @param data the data to send to the classmates
     */

  }, {
    key: 'deleteMe_sendStudentToClassmatesInPeriodMessage',
    value: function deleteMe_sendStudentToClassmatesInPeriodMessage(messageType, data) {
      if (!this.ConfigService.isPreview()) {
        var currentNodeId = this.StudentDataService.getCurrentNodeId();
        var messageJSON = {};
        messageJSON.messageType = messageType;
        messageJSON.messageParticipants = 'studentToClassmatesInPeriod';
        messageJSON.currentNodeId = currentNodeId;
        messageJSON.data = data;
        this.dataStream.send(messageJSON);
      }
    }
  }]);

  return StudentWebSocketService;
}();

StudentWebSocketService.$inject = ['$rootScope', '$stomp', 'ConfigService', 'StudentDataService'];

exports.default = StudentWebSocketService;
//# sourceMappingURL=studentWebSocketService.js.map
