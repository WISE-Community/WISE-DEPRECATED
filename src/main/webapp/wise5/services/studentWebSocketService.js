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
        this.workgroupId = this.ConfigService.getWorkgroupId();
        try {
          this.$stomp.connect(this.ConfigService.getWebSocketURL()).then(function (frame) {
            console.log('connected! runId: ' + _this.runId);
            var greetingSubscription = _this.$stomp.subscribe('/topic/greetings/' + _this.runId, function (payload, headers, res) {
              console.log('Greeting: ' + payload);
            }, {});

            var classroomSubscription = _this.$stomp.subscribe('/topic/classroom/' + _this.runId + '/' + _this.periodId, function (message, headers, res) {
              if (message.type === 'pause') {
                _this.$rootScope.$broadcast('pauseScreen', { data: message.content });
              } else if (message.type === 'unpause') {
                _this.$rootScope.$broadcast('unPauseScreen', { data: message.content });
              } else if (message.type === 'studentWork') {
                var studentWork = message.content;
                studentWork.studentData = JSON.parse(studentWork.studentData);
                _this.$rootScope.$broadcast('studentWorkReceived', studentWork);
              }
            });

            var notificationSubscription = _this.$stomp.subscribe('/topic/workgroup/' + _this.workgroupId, function (message, headers, res) {
              if (message.type === 'notification') {
                _this.$rootScope.$broadcast('newNotification', message.content);
              } else if (message.type === 'annotation') {
                var annotationData = message.content;
                _this.StudentDataService.AnnotationService.addOrUpdateAnnotation(annotationData);
                _this.$rootScope.$broadcast('newAnnotationReceived', { annotation: annotationData });
              } else if (message.type === 'annotationNotification') {
                var annotationNotification = message.content;
                var _annotationData = annotationNotification.annotationData;
                _this.StudentDataService.AnnotationService.addOrUpdateAnnotation(_annotationData);
                _this.$rootScope.$broadcast('newAnnotationReceived', { annotation: _annotationData });
                _this.$rootScope.$broadcast('newNotification', annotationNotification.notificationData);
              }
            }, {});

            var teacherSubscription = _this.$stomp.subscribe('/topic/teacher/' + _this.runId + '/' + _this.periodId, function (payload, headers, res) {});

            /*
            const pauseSubscription = this.$stomp.subscribe(`/topic/pause/${this.runId}/${this.periodId}`, (payload, headers, res) => {
              console.log(`Pause: ${payload}`);
              this.$rootScope.$broadcast('pauseScreen', {data: payload});
            }, {});
             const unPauseSubscription = this.$stomp.subscribe(`/topic/unpause/${this.runId}/${this.periodId}`, (payload, headers, res) => {
              console.log(`UnPause: ${payload}`);
              this.$rootScope.$broadcast('unPauseScreen', {data: payload});
            }, {});
             const studentWorkSubscription = this.$stomp.subscribe(`/topic/student-work/${this.runId}/${this.periodId}`, (studentWork, headers, res) => {
              studentWork.studentData = JSON.parse(studentWork.studentData);
              this.$rootScope.$broadcast('studentWorkReceived', studentWork);
            }, {});
             const notificationSubscription = this.$stomp.subscribe(`/topic/notification/${this.runId}/${this.periodId}/${this.workgroupId}`, (notification, headers, res) => {
              this.$rootScope.$broadcast('newNotification', notification);
            }, {});
            */

            _this.$stomp.send('/app/hello/' + _this.runId, JSON.stringify({ 'name': 'workgroup ' + _this.workgroupId }), {});
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
  }]);

  return StudentWebSocketService;
}();

StudentWebSocketService.$inject = ['$rootScope', '$stomp', 'ConfigService', 'StudentDataService'];

exports.default = StudentWebSocketService;
//# sourceMappingURL=studentWebSocketService.js.map
