"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TeacherWebSocketService =
/*#__PURE__*/
function () {
  function TeacherWebSocketService($rootScope, //$stomp,
  ConfigService, StudentStatusService) {
    _classCallCheck(this, TeacherWebSocketService);

    this.$rootScope = $rootScope; //this.$stomp = $stomp;

    this.ConfigService = ConfigService;
    this.StudentStatusService = StudentStatusService;
    this.studentsOnlineArray = [];
  }

  _createClass(TeacherWebSocketService, [{
    key: "initialize",
    value: function initialize() {
      this.runId = this.ConfigService.getRunId();
      /*
      try {
        this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
          this.subscribeToTeacherTopic();
          this.subscribeToTeacherWorkgroupTopic();
        });
      } catch(e) {
        console.log(e);
      }
      */
    }
  }, {
    key: "subscribeToTeacherTopic",
    value: function subscribeToTeacherTopic() {
      var _this = this;

      this.$stomp.subscribe("/topic/teacher/".concat(this.runId), function (message, headers, res) {
        if (message.type === 'studentWork') {
          var studentWork = JSON.parse(message.content);

          _this.$rootScope.$broadcast('newStudentWorkReceived', {
            studentWork: studentWork
          });
        } else if (message.type === 'studentStatus') {
          var status = JSON.parse(message.content);

          _this.StudentStatusService.setStudentStatus(status);

          _this.$rootScope.$emit('studentStatusReceived', {
            studentStatus: status
          });
        } else if (message.type === 'newStudentAchievement') {
          var achievement = JSON.parse(message.content);

          _this.$rootScope.$broadcast('newStudentAchievement', {
            studentAchievement: achievement
          });
        } else if (message.type === 'annotation') {
          var annotationData = JSON.parse(message.content);

          _this.$rootScope.$broadcast('newAnnotationReceived', {
            annotation: annotationData
          });
        }
      });
    }
  }, {
    key: "subscribeToTeacherWorkgroupTopic",
    value: function subscribeToTeacherWorkgroupTopic() {
      var _this2 = this;

      this.$stomp.subscribe("/topic/workgroup/".concat(this.ConfigService.getWorkgroupId()), function (message, headers, res) {
        if (message.type === 'notification') {
          var notification = JSON.parse(message.content);

          _this2.$rootScope.$broadcast('newNotificationReceived', notification);
        }
      });
    }
  }, {
    key: "handleStudentsOnlineReceived",
    value: function handleStudentsOnlineReceived(studentsOnlineMessage) {
      this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
      this.$rootScope.$broadcast('studentsOnlineReceived', {
        studentsOnline: this.studentsOnlineArray
      });
    }
  }, {
    key: "getStudentsOnline",
    value: function getStudentsOnline() {
      return this.studentsOnlineArray;
    }
  }, {
    key: "isStudentOnline",
    value: function isStudentOnline(workgroupId) {
      return this.studentsOnlineArray.indexOf(workgroupId) > -1;
    }
  }, {
    key: "handleStudentDisconnected",
    value: function handleStudentDisconnected(studentDisconnectedMessage) {
      this.$rootScope.$broadcast('studentDisconnected', {
        data: studentDisconnectedMessage
      });
    }
  }, {
    key: "pauseScreens",
    value: function pauseScreens(periodId) {
      this.$stomp.send("/app/pause/".concat(this.runId, "/").concat(periodId), {}, {});
    }
  }, {
    key: "unPauseScreens",
    value: function unPauseScreens(periodId) {
      this.$stomp.send("/app/unpause/".concat(this.runId, "/").concat(periodId), {}, {});
    }
  }]);

  return TeacherWebSocketService;
}();

TeacherWebSocketService.$inject = ['$rootScope', //'$stomp',
'ConfigService', 'StudentStatusService'];
var _default = TeacherWebSocketService;
exports["default"] = _default;
//# sourceMappingURL=teacherWebSocketService.js.map
