"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SessionService =
/*#__PURE__*/
function () {
  function SessionService($http, $rootScope, ConfigService) {
    _classCallCheck(this, SessionService);

    this.$http = $http;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.warningVisible = false;
    var intervals = this.calculateIntervals(this.ConfigService.getConfigParam('sessionTimeout'));
    this.showWarningInterval = intervals.showWarningInterval;
    this.forceLogoutAfterWarningInterval = intervals.forceLogoutAfterWarningInterval;
    this.checkMouseEventInterval = this.convertMinutesToMilliseconds(1);
    this.updateLastActivityTimestamp();
    this.initializeListeners();
    this.initializeSession();
  }

  _createClass(SessionService, [{
    key: "calculateIntervals",
    value: function calculateIntervals(sessionTimeout) {
      var forceLogoutAfterWarningInterval = Math.min(sessionTimeout * 0.1, this.convertMinutesToSeconds(5));
      var showWarningInterval = sessionTimeout - forceLogoutAfterWarningInterval;
      return {
        showWarningInterval: showWarningInterval,
        forceLogoutAfterWarningInterval: forceLogoutAfterWarningInterval
      };
    }
  }, {
    key: "initializeListeners",
    value: function initializeListeners() {
      var _this = this;

      this.$rootScope.$on('goHome', function () {
        _this.goHome();
      });
      this.$rootScope.$on('logOut', function () {
        _this.logOut();
      });
    }
  }, {
    key: "goHome",
    value: function goHome() {
      var wiseBaseURL = this.ConfigService.getWISEBaseURL();
      var userType = this.ConfigService.getConfigParam('userType');
      var href = this.ConfigService.getMainHomePageURL();

      if (userType === 'student') {
        href = wiseBaseURL + '/student';
      } else if (userType === 'teacher') {
        href = wiseBaseURL + '/teacher';
      }

      window.location.href = href;
    }
  }, {
    key: "logOut",
    value: function logOut() {
      this.$rootScope.$broadcast('exit');
      window.location.href = this.ConfigService.getSessionLogOutURL();
    }
  }, {
    key: "initializeSession",
    value: function initializeSession() {
      if (!this.ConfigService.isPreview()) {
        this.startCheckMouseEvent();
      }
    }
  }, {
    key: "startCheckMouseEvent",
    value: function startCheckMouseEvent() {
      var _this2 = this;

      setInterval(function () {
        _this2.checkMouseEvent();
      }, this.checkMouseEventInterval);
    }
  }, {
    key: "convertMinutesToSeconds",
    value: function convertMinutesToSeconds(minutes) {
      return minutes * 60;
    }
  }, {
    key: "convertMinutesToMilliseconds",
    value: function convertMinutesToMilliseconds(minutes) {
      return minutes * 60 * 1000;
    }
    /**
     * Note: This does not get called when the warning popup is being shown.
     */

  }, {
    key: "mouseMoved",
    value: function mouseMoved() {
      this.updateLastActivityTimestamp();
    }
  }, {
    key: "updateLastActivityTimestamp",
    value: function updateLastActivityTimestamp() {
      this.lastActivityTimestamp = new Date();
    }
  }, {
    key: "checkMouseEvent",
    value: function checkMouseEvent() {
      if (this.isActiveWithinLastMinute()) {
        this.renewSession();
      } else if (this.isInactiveLongEnoughToForceLogout()) {
        this.forceLogOut();
      } else if (this.isInactiveLongEnoughToWarn() && !this.isShowingWarning()) {
        this.showWarning();
      }
    }
  }, {
    key: "isActiveWithinLastMinute",
    value: function isActiveWithinLastMinute() {
      return new Date() - this.lastActivityTimestamp < this.convertMinutesToMilliseconds(1);
    }
  }, {
    key: "isInactiveLongEnoughToForceLogout",
    value: function isInactiveLongEnoughToForceLogout() {
      return this.getInactiveTimeInSeconds() >= this.showWarningInterval + this.forceLogoutAfterWarningInterval;
    }
  }, {
    key: "isInactiveLongEnoughToWarn",
    value: function isInactiveLongEnoughToWarn() {
      return this.getInactiveTimeInSeconds() >= this.showWarningInterval;
    }
  }, {
    key: "isShowingWarning",
    value: function isShowingWarning() {
      return this.warningVisible;
    }
  }, {
    key: "getInactiveTimeInSeconds",
    value: function getInactiveTimeInSeconds() {
      return Math.floor(this.getInactiveTimeInMilliseconds() / 1000);
    }
  }, {
    key: "getInactiveTimeInMilliseconds",
    value: function getInactiveTimeInMilliseconds() {
      return new Date() - this.lastActivityTimestamp;
    }
  }, {
    key: "forceLogOut",
    value: function forceLogOut() {
      this.$rootScope.$broadcast('logOut');
    }
  }, {
    key: "showWarning",
    value: function showWarning() {
      this.warningVisible = true;
      this.$rootScope.$broadcast('showSessionWarning');
    }
  }, {
    key: "closeWarningAndRenewSession",
    value: function closeWarningAndRenewSession() {
      this.warningVisible = false;
      this.updateLastActivityTimestamp();
      this.renewSession();
    }
  }, {
    key: "renewSession",
    value: function renewSession() {
      var renewSessionURL = this.ConfigService.getConfigParam('renewSessionURL');
      this.$http.get(renewSessionURL).then(function (result) {});
    }
  }]);

  return SessionService;
}();

SessionService.$inject = ['$http', '$rootScope', 'ConfigService'];
var _default = SessionService;
exports["default"] = _default;
//# sourceMappingURL=sessionService.js.map
