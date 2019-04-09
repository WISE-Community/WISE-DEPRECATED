'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentWebSocketService = function () {
  function StudentWebSocketService($rootScope, $stomp, $websocket, ConfigService, StudentDataService) {
    _classCallCheck(this, StudentWebSocketService);

    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.StudentDataService = StudentDataService;
    this.dataStream = null;
  }

  _createClass(StudentWebSocketService, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      if (!this.ConfigService.isPreview()) {
        var runId = this.ConfigService.getRunId();
        var periodId = this.ConfigService.getPeriodId();
        var workgroupId = this.ConfigService.getWorkgroupId();
        var webSocketURL = this.ConfigService.getWebSocketURL();
        try {
          this.$stomp.connect(webSocketURL).then(function (frame) {
            console.log('connected! runId: ' + runId);
            var greetingSubscription = _this.$stomp.subscribe('/topic/greetings/' + runId, function (payload, headers, res) {
              console.log('Greeting: ' + payload);
            }, {});

            var pauseSubscription = _this.$stomp.subscribe('/topic/pause/' + runId + '/' + periodId, function (payload, headers, res) {
              console.log('Pause: ' + payload);
              _this.$rootScope.$broadcast('pauseScreen', { data: payload });
            }, {});

            var unPauseSubscription = _this.$stomp.subscribe('/topic/unpause/' + runId + '/' + periodId, function (payload, headers, res) {
              console.log('UnPause: ' + payload);
              _this.$rootScope.$broadcast('unPauseScreen', { data: payload });
            }, {});

            _this.$stomp.send('/app/hello/' + runId, JSON.stringify({ 'name': 'workgroup ' + workgroupId }), { priority: 9, custom: 42 });
          });
          //this.dataStream = this.$websocket(webSocketURL);
          //this.dataStream.onMessage((message) => {
          //  this.handleMessage(message);
          //});
        } catch (e) {
          console.log(e);
        }
      }
    }

    /**
     * Handle the message we have received
     * @param data the data from the message
     */

  }, {
    key: 'handleWebSocketMessageReceived',
    value: function handleWebSocketMessageReceived(data) {
      this.$rootScope.$broadcast('webSocketMessageReceived', { data: data });
    }

    /**
     * Handle receiving a websocket message
     * @param message the websocket message
     */

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

    /**
     * Send a message to teacher
     * @param data the data to send to the teacher
     */

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
    key: 'sendStudentToClassmatesInPeriodMessage',
    value: function sendStudentToClassmatesInPeriodMessage(messageType, data) {
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

StudentWebSocketService.$inject = ['$rootScope', '$stomp', '$websocket', 'ConfigService', 'StudentDataService'];

exports.default = StudentWebSocketService;
//# sourceMappingURL=studentWebSocketService.js.map
