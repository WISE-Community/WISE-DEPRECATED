'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SessionService = function () {
  function SessionService($http, $rootScope, ConfigService) {
    _classCallCheck(this, SessionService);

    this.$http = $http;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.warningVisible = false;
    this.checkMouseEventInMinutesInterval = 1;
    this.showWarningInMinutesInterval = 25;
    this.forceLogoutAfterWarningInMinutesInterval = 5;
    this.lastActivityTimestamp = new Date();
    this.initializeListeners();
    this.initializeSession();
  }

  _createClass(SessionService, [{
    key: 'initializeListeners',
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
    key: 'goHome',
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
    key: 'logOut',
    value: function logOut() {
      this.$rootScope.$broadcast('exit');
      window.location.href = this.ConfigService.getSessionLogOutURL();
    }
  }, {
    key: 'initializeSession',
    value: function initializeSession() {
      if (!this.ConfigService.isPreview()) {
        this.startCheckMouseEvent();
      }
    }
  }, {
    key: 'startCheckMouseEvent',
    value: function startCheckMouseEvent() {
      setInterval(angular.bind(this, this.checkMouseEvent), this.convertMinutesToMilliseconds(this.checkMouseEventInMinutesInterval));
    }
  }, {
    key: 'convertMinutesToMilliseconds',
    value: function convertMinutesToMilliseconds(minutes) {
      return minutes * 60 * 1000;
    }

    /**
     * Note: This does not get called when the warning popup is being shown.
     */

  }, {
    key: 'mouseMoved',
    value: function mouseMoved() {
      this.lastActivityTimestamp = new Date();
    }
  }, {
    key: 'checkMouseEvent',
    value: function checkMouseEvent() {
      if (this.isInactiveLongEnoughToForceLogout()) {
        this.forceLogOut();
      } else if (this.isInactiveLongEnoughToWarn() && !this.isShowingWarning()) {
        this.showWarning();
      }
    }
  }, {
    key: 'isInactiveLongEnoughToForceLogout',
    value: function isInactiveLongEnoughToForceLogout() {
      return this.getInactiveTimeInMinutes() >= this.showWarningInMinutesInterval + this.forceLogoutAfterWarningInMinutesInterval;
    }
  }, {
    key: 'isInactiveLongEnoughToWarn',
    value: function isInactiveLongEnoughToWarn() {
      return this.getInactiveTimeInMinutes() >= this.showWarningInMinutesInterval;
    }
  }, {
    key: 'isShowingWarning',
    value: function isShowingWarning() {
      return this.warningVisible;
    }
  }, {
    key: 'getInactiveTimeInMinutes',
    value: function getInactiveTimeInMinutes() {
      return Math.floor(this.getInactiveTimeInMilliseconds() / 1000 / 60);
    }
  }, {
    key: 'getInactiveTimeInMilliseconds',
    value: function getInactiveTimeInMilliseconds() {
      return new Date() - this.lastActivityTimestamp;
    }
  }, {
    key: 'forceLogOut',
    value: function forceLogOut() {
      this.$rootScope.$broadcast('logOut');
    }
  }, {
    key: 'showWarning',
    value: function showWarning() {
      this.warningVisible = true;
      this.$rootScope.$broadcast('showSessionWarning');
    }
  }, {
    key: 'renewSession',
    value: function renewSession() {
      this.lastActivityTimestamp = new Date();
      this.warningVisible = false;
    }
  }]);

  return SessionService;
}();

SessionService.$inject = ['$http', '$rootScope', 'ConfigService'];

exports.default = SessionService;
//# sourceMappingURL=sessionService.js.map
