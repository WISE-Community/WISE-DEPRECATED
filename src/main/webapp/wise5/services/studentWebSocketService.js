'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var StudentWebSocketService =
/*#__PURE__*/
function () {
  function StudentWebSocketService($rootScope, //$stomp,
  AnnotationService, ConfigService) {
    _classCallCheck(this, StudentWebSocketService);

    this.$rootScope = $rootScope; //this.$stomp = $stomp;

    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
  }

  _createClass(StudentWebSocketService, [{
    key: "initialize",
    value: function initialize() {
      this.runId = this.ConfigService.getRunId();
      this.periodId = this.ConfigService.getPeriodId();
      this.workgroupId = this.ConfigService.getWorkgroupId();
      /*
      try {
        this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
          this.subscribeToClassroomTopic();
          this.subscribeToWorkgroupTopic();
        });
      } catch(e) {
        console.log(e);
      }
      */
    }
  }, {
    key: "subscribeToClassroomTopic",
    value: function subscribeToClassroomTopic() {
      var _this = this;

      this.$stomp.subscribe("/topic/classroom/".concat(this.runId, "/").concat(this.periodId), function (message, headers, res) {
        if (message.type === 'pause') {
          _this.$rootScope.$broadcast('pauseScreen', {
            data: message.content
          });
        } else if (message.type === 'unpause') {
          _this.$rootScope.$broadcast('unPauseScreen', {
            data: message.content
          });
        } else if (message.type === 'studentWork') {
          var studentWork = JSON.parse(message.content);

          _this.$rootScope.$broadcast('studentWorkReceived', studentWork);
        }
      });
    }
  }, {
    key: "subscribeToWorkgroupTopic",
    value: function subscribeToWorkgroupTopic() {
      var _this2 = this;

      this.$stomp.subscribe("/topic/workgroup/".concat(this.workgroupId), function (message, headers, res) {
        if (message.type === 'notification') {
          var notification = JSON.parse(message.content);

          _this2.$rootScope.$broadcast('newNotificationReceived', notification);
        } else if (message.type === 'annotation') {
          var annotationData = JSON.parse(message.content);

          _this2.AnnotationService.addOrUpdateAnnotation(annotationData);

          _this2.$rootScope.$broadcast('newAnnotationReceived', {
            annotation: annotationData
          });
        }
      });
    }
  }]);

  return StudentWebSocketService;
}();

StudentWebSocketService.$inject = ['$rootScope', //'$stomp',
'AnnotationService', 'ConfigService'];
var _default = StudentWebSocketService;
exports["default"] = _default;
//# sourceMappingURL=studentWebSocketService.js.map
