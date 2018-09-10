'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SessionService = function () {
  function SessionService($http, $rootScope, ConfigService) {
    var _this = this;

    _classCallCheck(this, SessionService);

    this.$http = $http;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.initialized = false;

    /*
     * The amount of user inactive time (in milliseconds) before we display
     * a warning message asking if they want to stay logged in.
     */
    this.warningInterval = this.convertMinutesToMilliseconds(25);

    /*
     * The amount of time (in milliseconds) after the warning message is
     * displayed at which we automatically log out the user.
     */
    this.logOutInterval = this.convertMinutesToMilliseconds(5);

    /*
     * The amount of time (in milliseconds) before we check if there were
     * any mouse events.
     */
    this.checkMouseEventInterval = this.convertMinutesToMilliseconds(1);

    /*
     * the timestamp when the last mouse event occurred
     */
    this.lastMouseEventTimestamp = null;

    /*
     * boolean value used to determine if we need to log out the
     * user or just bring them back to the home page when we exit
     * the VLE
     */
    this.performLogOut = false;

    // the active warning ids
    this.warningIds = [];

    // the active log out ids
    this.logOutIds = [];

    /**
     * Listen for the 'componentDoneUnloading' event. When the user logs
     * out of the VLE, we will need to wait for certain components to
     * finish performing any necessary processing (such as saving) before
     * we actually log out. Once a component has completed their unloading
     * they will fire the 'componentDoneUnloading' event. We will listen
     * for this event and when there are no more components left to wait
     * for, we will then log out.
     */
    this.$rootScope.$on('doneExiting', function () {
      // check if all components are done unloading so we can exit
      // no longer needed.
      //this.attemptExit();
    });

    /**
     * Listen for the 'goHome' event. We will attempt to go home when
     * the 'goHome' even is fired. There may be components that have not
     * saved their data yet so we may not be able to go home right away.
     * If there are components that have not saved their data yet, we
     * will wait for those components to fire the 'componentDoneUnloading'
     * event and then try to go home again.
     */
    this.$rootScope.$on('goHome', function () {
      // let other components know that we are exiting
      _this.$rootScope.$broadcast('exit');

      // check if all components are done unloading so we can exit
      _this.attemptExit();
    });

    /**
     * Listen for the 'logOut' event. We will attempt to log out when
     * the 'logOut' even is fired. There may be components that have not
     * saved their data yet so we may not be able to log out right away.
     * If there are components that have not saved their data yet, we
     * will wait for those components to fire the 'componentDoneUnloading'
     * event and then try to log out again.
     */
    this.$rootScope.$on('logOut', function () {
      /*
       * set the perform log out boolean to true so that we know to
       * log out the user later
       */
      _this.performLogOut = true;

      // let other components know that we are exiting
      _this.$rootScope.$broadcast('exit');

      // check if all components are done unloading so we can exit
      _this.attemptExit();
    });
  }

  /**
   * Start the timers, save session initialized event
   */


  _createClass(SessionService, [{
    key: 'initializeSession',
    value: function initializeSession() {
      if (!this.initialized) {
        this.initialized = true;
        if (this.ConfigService.isPreview()) {
          // no session management for previewers
          return;
        }

        this.startWarningTimer();
        this.startCheckMouseEventTimer();
      }
    }
  }, {
    key: 'startWarningTimer',


    /**
     * Start the warning timer. When the warning timer expires, we will display
     * a warning message to the user asking them if they want to stay logged in.
     */
    value: function startWarningTimer() {
      // clear all the previous warning timers
      this.clearWarningTimers();
      var warningId = setTimeout(angular.bind(this, this.showWarning), this.warningInterval);
      this.warningIds.push(warningId);
    }

    /**
     * Clear all the warning timers
     */

  }, {
    key: 'clearWarningTimers',
    value: function clearWarningTimers() {
      for (var w = 0; w < this.warningIds.length; w++) {
        var warningId = this.warningIds[w];
        clearTimeout(warningId);
        this.warningIds.splice(w, 1);

        // move the counter back now that we have removed a warning id
        w--;
      }
    }

    /**
     * Restart the warning time so that it starts counting from 0 again.
     */

  }, {
    key: 'restartWarningTimer',
    value: function restartWarningTimer() {
      this.clearWarningTimers();
      this.startWarningTimer();
    }

    /**
     * Start the auto log out timer
     */

  }, {
    key: 'startLogOutTimer',
    value: function startLogOutTimer() {
      // clear all the previou log out timers
      this.clearLogOutTimers();
      var logOutId = setTimeout(angular.bind(this, this.forceLogOut), this.logOutInterval);
      this.logOutIds.push(logOutId);
    }
  }, {
    key: 'clearLogOutTimers',


    /**
     * Clear the log out timers
     */
    value: function clearLogOutTimers() {
      // clear all the active log out timeouts
      for (var l = 0; l < this.logOutIds.length; l++) {
        // get a log out id
        var logOutId = this.logOutIds[l];

        // clear the timeout for the log out id
        clearTimeout(logOutId);

        // remove the log out id from the array
        this.logOutIds.splice(l, 1);

        // move the counter back now that we have removed a log out id
        l--;
      }
    }

    /**
     * Start the check mouse event timer
     */

  }, {
    key: 'startCheckMouseEventTimer',
    value: function startCheckMouseEventTimer() {
      setInterval(angular.bind(this, this.checkMouseEvent), this.checkMouseEventInterval);
    }
  }, {
    key: 'showWarning',


    /**
     * Fire the event that will show the warning message
     */
    value: function showWarning() {
      if (this.checkMouseEvent()) {
        // a mouse event has occurred recently so we don't need to show the warning
      } else {
        // a mouse event has not occurred recently so we will show the warning
        this.$rootScope.$broadcast('showSessionWarning');
        this.startLogOutTimer();
      }
    }
  }, {
    key: 'renewSession',


    /**
     * Renew the session with the server and refresh the local timers
     */
    value: function renewSession() {
      var _this2 = this;

      var renewSessionURL = this.ConfigService.getConfigParam('renewSessionURL');
      // make a request to the log out url
      this.$http.get(renewSessionURL).then(function (result) {
        var renewSessionResult = result.data;
        if (renewSessionResult === 'true') {
          // the session is still active
          _this2.clearLogOutTimers();
          _this2.restartWarningTimer();
        } else if (renewSessionResult === "requestLogout") {
          // WISE server is requesting that we log out
          _this2.$rootScope.$broadcast('showRequestLogout');
        } else {
          // User is no longer logged in (session is inactive)
          _this2.forceLogOut();
        }
      });
    }
  }, {
    key: 'clearTimers',


    /**
     * Delete the existing timers
     */
    value: function clearTimers() {
      this.clearWarningTimers();
      this.clearLogOutTimers();
    }
  }, {
    key: 'mouseMoved',


    /**
     * Called when the user moves the mouse
     */
    value: function mouseMoved() {
      var date = new Date();
      var timestamp = date.getTime();
      this.lastMouseEventTimestamp = timestamp;
    }
  }, {
    key: 'checkMouseEvent',


    /**
     * Check if there were any mouse events since the last time we checked.
     * Currently we check every 1 minute which is based on the value of the
     * checkMouseEventInterval variable.
     * @returns whether there was a mouse event recently
     */
    value: function checkMouseEvent() {
      if (this.lastMouseEventTimestamp != null) {
        // there was a mouse event since the last time we checked
        this.renewSession();
        this.lastMouseEventTimestamp = null;
        return true;
      }
      return false;
    }
  }, {
    key: 'convertMinutesToMilliseconds',


    /**
     * Convert minutes to milliseconds
     * @param minutes the number of minutes
     * @return the number of milliseconds
     */
    value: function convertMinutesToMilliseconds(minutes) {
      if (minutes != null) {
        var seconds = minutes * 60;
        return seconds * 1000;
      }
      return null;
    }
  }, {
    key: 'forceLogOut',


    /**
     * Log out the user
     */
    value: function forceLogOut() {
      /*
       * make a final check to see if there were any mouse events recently
       * before we log out the user
       */
      if (this.checkMouseEvent()) {
        // a mouse event has occurred so we will not log out the user
      } else {
        // a mouse event has not occurred recently so we will log out the user
        this.clearTimers();
        this.$rootScope.$broadcast('logOut');
      }
    }
  }, {
    key: 'attemptExit',


    /**
     * Check if there are components that are not ready to exit
     * because they have not saved their data yet. If there are no
     * components left to wait for, we can then exit.
     */
    value: function attemptExit() {
      var exitListenerCount = this.$rootScope.$$listenerCount.exit;

      /*
       * Check how many exit listeners are still listening for the
       * exit event. Components such as nodes will finish saving their
       * data and then be removed from the listener count.
       */
      if (exitListenerCount != null && exitListenerCount > 0) {
        // don't log out yet because there are still listeners
      } else {
        if (this.performLogOut) {
          window.location.href = this.ConfigService.getSessionLogOutURL();
        } else {
          var wiseBaseURL = this.ConfigService.getWISEBaseURL();
          var userType = this.ConfigService.getConfigParam('userType');
          if (userType === 'student') {
            window.location.href = wiseBaseURL + '/student';
          } else if (userType === 'teacher') {
            window.location.href = wiseBaseURL + '/teacher';
          } else {
            window.location.href = this.ConfigService.getMainHomePageURL();
          }
        }
      }
    }
  }]);

  return SessionService;
}();

SessionService.$inject = ['$http', '$rootScope', 'ConfigService'];

exports.default = SessionService;
//# sourceMappingURL=sessionService.js.map
