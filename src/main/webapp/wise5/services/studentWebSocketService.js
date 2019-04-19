'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentWebSocketService = function () {
  function StudentWebSocketService($rootScope, $stomp, AnnotationService, ConfigService) {
    _classCallCheck(this, StudentWebSocketService);

    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
  }

  _createClass(StudentWebSocketService, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.runId = this.ConfigService.getRunId();
      this.periodId = this.ConfigService.getPeriodId();
      this.workgroupId = this.ConfigService.getWorkgroupId();
      try {
        this.$stomp.connect(this.ConfigService.getWebSocketURL()).then(function (frame) {
          _this.subscribeToClassroomTopic();
          _this.subscribeToWorkgroupTopic();
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'subscribeToClassroomTopic',
    value: function subscribeToClassroomTopic() {
      var _this2 = this;

      this.$stomp.subscribe('/topic/classroom/' + this.runId + '/' + this.periodId, function (message, headers, res) {
        if (message.type === 'pause') {
          _this2.$rootScope.$broadcast('pauseScreen', { data: message.content });
        } else if (message.type === 'unpause') {
          _this2.$rootScope.$broadcast('unPauseScreen', { data: message.content });
        } else if (message.type === 'studentWork') {
          var studentWork = message.content;
          studentWork.studentData = JSON.parse(studentWork.studentData);
          _this2.$rootScope.$broadcast('studentWorkReceived', studentWork);
        }
      });
    }
  }, {
    key: 'subscribeToWorkgroupTopic',
    value: function subscribeToWorkgroupTopic() {
      var _this3 = this;

      this.$stomp.subscribe('/topic/workgroup/' + this.workgroupId, function (message, headers, res) {
        if (message.type === 'notification') {
          var notification = message.content;
          notification.data = JSON.parse(notification.data);
          _this3.$rootScope.$broadcast('newNotificationReceived', notification);
        } else if (message.type === 'annotation') {
          var annotationData = message.content;
          annotationData.data = JSON.parse(annotationData.data);
          _this3.AnnotationService.addOrUpdateAnnotation(annotationData);
          _this3.$rootScope.$broadcast('newAnnotationReceived', { annotation: annotationData });
        }
      });
    }
  }]);

  return StudentWebSocketService;
}();

StudentWebSocketService.$inject = ['$rootScope', '$stomp', 'AnnotationService', 'ConfigService'];

exports.default = StudentWebSocketService;
//# sourceMappingURL=studentWebSocketService.js.map
