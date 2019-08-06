'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ConfigService =
/*#__PURE__*/
function () {
  function ConfigService($filter, $http, $location) {
    _classCallCheck(this, ConfigService);

    this.$filter = $filter;
    this.$http = $http;
    this.$location = $location;
    this.config = null;
    this.$translate = this.$filter('translate');
  }

  _createClass(ConfigService, [{
    key: "setConfig",
    value: function setConfig(config) {
      this.config = config;
      this.sortClassmateUserInfosAlphabeticallyByName();
      this.setPermissions();
      this.setClassmateDisplayNames();
    }
  }, {
    key: "retrieveConfig",
    value: function retrieveConfig(configURL) {
      var _this = this;

      return this.$http.get(configURL).then(function (result) {
        var configJSON = result.data;

        _this.setTimestampDiff(configJSON);

        var constraints = true;
        var absURL = _this.$location.$$absUrl;

        if (configJSON.mode === 'preview') {
          // constraints can only be disabled using the url in preview mode
          // regex to match constraints=false in the url
          var constraintsRegEx = new RegExp("constraints=false", 'gi');

          if (absURL != null && absURL.match(constraintsRegEx)) {
            // the url contains constraints=false
            constraints = false;
          }
        } // set the constraints value into the config so we can access it later


        configJSON.constraints = constraints; // regex to match showProjectPath=true in the url

        var showProjectPathRegEx = new RegExp("showProjectPath=true", 'gi');

        if (absURL != null && absURL.match(showProjectPathRegEx)) {
          // the url contains showProjectPath=true
          var host = location.origin;
          var projectURL = configJSON.projectURL;
          var projectPath = host + projectURL;
          console.log(projectPath);
        }

        configJSON.isRunActive = _this.calculateIsRunActive(configJSON);

        _this.setConfig(configJSON);

        if (_this.isPreview()) {
          var myUserInfo = _this.getMyUserInfo();

          if (myUserInfo != null) {
            // set the workgroup id to a random integer between 1 and 100
            myUserInfo.workgroupId = Math.floor(100 * Math.random()) + 1;
          }
        }

        return configJSON;
      });
    }
  }, {
    key: "setTimestampDiff",
    value: function setTimestampDiff(configJSON) {
      if (configJSON.retrievalTimestamp != null) {
        var clientTimestamp = new Date().getTime();
        var serverTimestamp = configJSON.retrievalTimestamp;
        var timestampDiff = clientTimestamp - serverTimestamp;
        configJSON.timestampDiff = timestampDiff;
      } else {
        configJSON.timestampDiff = 0;
      }
    }
  }, {
    key: "getConfigParam",
    value: function getConfigParam(paramName) {
      if (this.config !== null) {
        return this.config[paramName];
      } else {
        return null;
      }
    }
  }, {
    key: "getAchievementsURL",
    value: function getAchievementsURL() {
      return this.getConfigParam('achievementURL');
    }
  }, {
    key: "getCRaterRequestURL",
    value: function getCRaterRequestURL() {
      return this.getConfigParam('cRaterRequestURL');
    }
  }, {
    key: "getMainHomePageURL",
    value: function getMainHomePageURL() {
      return this.getConfigParam('mainHomePageURL');
    }
  }, {
    key: "getNotificationURL",
    value: function getNotificationURL() {
      return this.getConfigParam('notificationURL');
    }
  }, {
    key: "getRunId",
    value: function getRunId() {
      return this.getConfigParam('runId');
    }
  }, {
    key: "getProjectId",
    value: function getProjectId() {
      return this.getConfigParam('projectId');
    }
  }, {
    key: "getSessionLogOutURL",
    value: function getSessionLogOutURL() {
      return this.getConfigParam('sessionLogOutURL');
    }
  }, {
    key: "getStudentAssetsURL",
    value: function getStudentAssetsURL() {
      return this.getConfigParam('studentAssetsURL');
    }
  }, {
    key: "getStudentStatusURL",
    value: function getStudentStatusURL() {
      return this.getConfigParam('studentStatusURL');
    }
  }, {
    key: "getStudentMaxTotalAssetsSize",
    value: function getStudentMaxTotalAssetsSize() {
      return this.getConfigParam('studentMaxTotalAssetsSize');
    }
  }, {
    key: "getStudentNotebookURL",
    value: function getStudentNotebookURL() {
      return this.getConfigParam('studentNotebookURL');
    }
  }, {
    key: "getStudentUploadsBaseURL",
    value: function getStudentUploadsBaseURL() {
      return this.getConfigParam('studentUploadsBaseURL');
    }
  }, {
    key: "getUserInfo",
    value: function getUserInfo() {
      return this.getConfigParam('userInfo');
    }
  }, {
    key: "getWebSocketURL",
    value: function getWebSocketURL() {
      return window.location.protocol + "//" + window.location.host + this.getContextPath() + "/websocket";
    }
  }, {
    key: "getWISEBaseURL",
    value: function getWISEBaseURL() {
      return this.getConfigParam('wiseBaseURL');
    }
  }, {
    key: "getLocale",
    value: function getLocale() {
      return this.getConfigParam('locale') || 'en';
    }
  }, {
    key: "getMode",
    value: function getMode() {
      return this.getConfigParam('mode');
    }
  }, {
    key: "getContextPath",
    value: function getContextPath() {
      return this.getConfigParam('contextPath');
    }
    /**
     * Returns the period id of the logged-in user.
     */

  }, {
    key: "getPeriodId",
    value: function getPeriodId() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        return myUserInfo.periodId;
      }

      return null;
    }
    /**
     * Get the periods
     * @returns an array of period objects
     */

  }, {
    key: "getPeriods",
    value: function getPeriods() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;

        if (myClassInfo != null) {
          if (myClassInfo.periods != null) {
            return myClassInfo.periods;
          }
        }
      }

      return [];
    }
  }, {
    key: "getWorkgroupId",
    value: function getWorkgroupId() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        return myUserInfo.workgroupId;
      }

      return null;
    }
    /**
     * Get the user id (aka WISE ID)
     * @return the user id
     */

  }, {
    key: "getUserId",
    value: function getUserId() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        return myUserInfo.id;
      }

      return null;
    }
  }, {
    key: "getMyUserInfo",
    value: function getMyUserInfo() {
      var userInfo = this.getUserInfo();

      if (userInfo != null) {
        return userInfo.myUserInfo;
      }

      return null;
    }
  }, {
    key: "getMyUsername",
    value: function getMyUsername() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        return myUserInfo.username;
      }

      return null;
    }
  }, {
    key: "getClassmateUserInfos",
    value: function getClassmateUserInfos() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;

        if (myClassInfo != null) {
          return myClassInfo.classmateUserInfos;
        }
      }

      return null;
    }
  }, {
    key: "setClassmateDisplayNames",
    value: function setClassmateDisplayNames() {
      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = classmateUserInfos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var workgroup = _step.value;
            workgroup.displayNames = this.getDisplayUsernamesByWorkgroupId(workgroup.workgroupId);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
    /**
     * Get the classmate user infos sorted by ascending workgroup id
     * @return an array of classmate user info objects sorted by ascending
     * workgroup id
     */

  }, {
    key: "getClassmateUserInfosSortedByWorkgroupId",
    value: function getClassmateUserInfosSortedByWorkgroupId() {
      var sortedClassmateUserInfos = [];
      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos != null) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = classmateUserInfos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var classmateUserInfo = _step2.value;
            sortedClassmateUserInfos.push(classmateUserInfo);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } // sort the new classmate user infos array by ascending workgroup id


      sortedClassmateUserInfos.sort(this.compareClassmateUserInfosByWorkgroupId);
      return sortedClassmateUserInfos;
    }
    /**
     * Used to sort the classmate user infos by ascending workgroup id.
     * Use by calling myArray.sort(compareClassmateUserInfosByWorkgroupId)
     * @param a a user info object
     * @param b a user info Object
     * @return -1 if a comes before b
     * 1 if a comes after b
     * 0 if a equals b
     */

  }, {
    key: "compareClassmateUserInfosByWorkgroupId",
    value: function compareClassmateUserInfosByWorkgroupId(a, b) {
      if (a.workgroupId < b.workgroupId) {
        return -1;
      } else if (a.workgroupId > b.workgroupId) {
        return 1;
      } else {
        return 0;
      }
    }
  }, {
    key: "getTeacherWorkgroupId",
    value: function getTeacherWorkgroupId() {
      var teacherUserInfo = this.getTeacherUserInfo();

      if (teacherUserInfo != null) {
        return teacherUserInfo.workgroupId;
      }

      return null;
    }
  }, {
    key: "getTeacherUserInfo",
    value: function getTeacherUserInfo() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;

        if (myClassInfo != null) {
          return myClassInfo.teacherUserInfo;
        }
      }

      return null;
    }
    /**
     * Get the shared teacher user infos for the run
     */

  }, {
    key: "getSharedTeacherUserInfos",
    value: function getSharedTeacherUserInfos() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;

        if (myClassInfo != null) {
          return myClassInfo.sharedTeacherUserInfos;
        }
      }

      return null;
    }
  }, {
    key: "getClassmateWorkgroupIds",
    value: function getClassmateWorkgroupIds(includeSelf) {
      var workgroupIds = [];

      if (includeSelf) {
        workgroupIds.push(this.getWorkgroupId());
      }

      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos != null) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = classmateUserInfos[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var classmateUserInfo = _step3.value;

            if (classmateUserInfo != null) {
              var workgroupId = classmateUserInfo.workgroupId;

              if (workgroupId != null) {
                workgroupIds.push(workgroupId);
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }

      return workgroupIds;
    }
  }, {
    key: "sortClassmateUserInfosAlphabeticallyByName",
    value: function sortClassmateUserInfosAlphabeticallyByName() {
      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos != null) {
        classmateUserInfos.sort(this.sortClassmateUserInfosAlphabeticallyByNameHelper);
      }

      return classmateUserInfos;
    }
  }, {
    key: "sortClassmateUserInfosAlphabeticallyByNameHelper",
    value: function sortClassmateUserInfosAlphabeticallyByNameHelper(a, b) {
      if (a != null && a.username != null && b != null && b.username != null) {
        var aUsername = a.username.toLowerCase();
        var bUsername = b.username.toLowerCase();

        if (aUsername < bUsername) {
          return -1;
        } else if (aUsername > bUsername) {
          return 1;
        }
      }

      return 0;
    }
  }, {
    key: "setPermissions",
    value: function setPermissions() {
      var role = this.getTeacherRole(this.getWorkgroupId());

      if (role === 'owner') {
        // the teacher is the owner of the run and has full access
        this.config.canViewStudentNames = true;
        this.config.canGradeStudentWork = true;
      } else if (role === 'write') {
        // the teacher is a shared teacher that can grade the student work
        this.config.canViewStudentNames = true;
        this.config.canGradeStudentWork = true;
      } else if (role === 'read') {
        // the teacher is a shared teacher that can only view the student work
        this.config.canViewStudentNames = false;
        this.config.canGradeStudentWork = false;
      } else {
        // teacher role is null, so assume we're in student mode
        this.config.canViewStudentNames = true;
        this.config.canGradeStudentWork = false;
      }
    }
  }, {
    key: "getPermissions",
    value: function getPermissions() {
      // a switched user (admin/researcher user impersonating a teacher) should not be able to view/grade
      return {
        canViewStudentNames: this.config.canViewStudentNames && !this.isSwitchedUser(),
        canGradeStudentWork: this.config.canGradeStudentWork && !this.isSwitchedUser()
      };
    }
  }, {
    key: "getUserInfoByWorkgroupId",
    value: function getUserInfoByWorkgroupId(workgroupId) {
      var userInfo = null;

      if (workgroupId != null) {
        var myUserInfo = this.getMyUserInfo();

        if (myUserInfo != null) {
          var tempWorkgroupId = myUserInfo.workgroupId;

          if (workgroupId === tempWorkgroupId) {
            userInfo = myUserInfo;
          }
        }

        if (userInfo == null) {
          var classmateUserInfos = this.getClassmateUserInfos();

          if (classmateUserInfos != null) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = classmateUserInfos[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var classmateUserInfo = _step4.value;

                if (classmateUserInfo != null) {
                  var _tempWorkgroupId = classmateUserInfo.workgroupId;

                  if (workgroupId == _tempWorkgroupId) {
                    userInfo = classmateUserInfo;
                    break;
                  }
                }
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                  _iterator4["return"]();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }
          }
        }
      }

      return userInfo;
    }
  }, {
    key: "getWorkgroupsByPeriod",
    value: function getWorkgroupsByPeriod(periodId) {
      var workgroupsInPeriod = [];
      var myUserInfo = this.getMyUserInfo();

      if (this.isStudent()) {
        if (this.isAllPeriods(periodId) || myUserInfo.periodId === periodId) {
          workgroupsInPeriod.push(myUserInfo);
        }
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.getClassmateUserInfos()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var classmateUserInfo = _step5.value;

          if (this.isAllPeriods(periodId) || classmateUserInfo.periodId === periodId) {
            workgroupsInPeriod.push(classmateUserInfo);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return workgroupsInPeriod;
    }
  }, {
    key: "isAllPeriods",
    value: function isAllPeriods(periodId) {
      return periodId == null || periodId === -1;
    }
  }, {
    key: "getNumberOfWorkgroupsInPeriod",
    value: function getNumberOfWorkgroupsInPeriod(periodId) {
      return this.getWorkgroupsByPeriod(periodId).length;
    }
    /**
     * Get the period id for a workgroup id
     * @param workgroupId the workgroup id
     * @returns the period id the workgroup id is in
     */

  }, {
    key: "getPeriodIdByWorkgroupId",
    value: function getPeriodIdByWorkgroupId(workgroupId) {
      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          return userInfo.periodId;
        }
      }

      return null;
    }
    /**
     * Get the student names
     * @param workgroupId the workgroup id
     * @return an array containing the student names
     */

  }, {
    key: "getStudentFirstNamesByWorkgroupId",
    value: function getStudentFirstNamesByWorkgroupId(workgroupId) {
      var studentNames = [];
      var usernames = this.getUsernameByWorkgroupId(workgroupId);

      if (usernames != null) {
        // split the user names string by ':'
        var usernamesSplit = usernames.split(':');

        if (usernamesSplit != null) {
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = usernamesSplit[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var username = _step6.value;
              var indexOfSpace = username.indexOf(' ');
              var studentFirstName = username.substring(0, indexOfSpace);
              studentNames.push(studentFirstName);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      }

      return studentNames;
    }
  }, {
    key: "getUserIdsByWorkgroupId",
    value: function getUserIdsByWorkgroupId(workgroupId) {
      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          return userInfo.userIds;
        }
      }

      return [];
    }
  }, {
    key: "getUsernameByWorkgroupId",
    value: function getUsernameByWorkgroupId(workgroupId) {
      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          return userInfo.username;
        }
      }

      return null;
    }
  }, {
    key: "getDisplayNamesByWorkgroupId",
    value: function getDisplayNamesByWorkgroupId(workgroupId) {
      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          return userInfo.displayNames;
        }
      }

      return null;
    }
  }, {
    key: "getUsernamesByWorkgroupId",
    value: function getUsernamesByWorkgroupId(workgroupId) {
      var usernamesObjects = [];

      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null && userInfo.username != null) {
          var usernames = userInfo.username.split(':');
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = usernames[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var name = _step7.value;
              var id = "";
              var regex = /(.+) \((.+)\)/g;
              var matches = regex.exec(name);

              if (matches) {
                name = matches[1];
                id = matches[2];
              }

              usernamesObjects.push({
                name: name,
                id: id
              });
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                _iterator7["return"]();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }
        }
      }

      return usernamesObjects;
    }
  }, {
    key: "getDisplayUsernamesByWorkgroupId",
    value: function getDisplayUsernamesByWorkgroupId(workgroupId) {
      var usernames = '';

      if (workgroupId != null) {
        if (this.getPermissions().canViewStudentNames) {
          var names = this.getUsernamesByWorkgroupId(workgroupId);
          var l = names.length;

          for (var i = 0; i < l; i++) {
            var name = names[i].name;
            usernames += name;

            if (i < l - 1) {
              usernames += ', ';
            }
          }
        } else {
          // current user is not allowed to view student names, so return string with student ids
          var userIds = this.getUserIdsByWorkgroupId(workgroupId);

          for (var _i = 0; _i < userIds.length; _i++) {
            var id = userIds[_i];

            if (_i !== 0) {
              usernames += ', ';
            }

            usernames += this.$translate('studentId', {
              id: id
            });
          }
        }
      }

      return usernames;
    }
  }, {
    key: "isPreview",
    value: function isPreview() {
      var mode = this.getMode();
      return mode != null && mode === 'preview';
    }
    /**
     * Convert a client timestamp to a server timestamp. This is required
     * in case the client and server clocks are not synchronized.
     * @param clientTimestamp the client timestamp
     */

  }, {
    key: "convertToServerTimestamp",
    value: function convertToServerTimestamp(clientTimestamp) {
      var timestampDiff = this.getConfigParam('timestampDiff');
      var serverTimestamp = clientTimestamp - timestampDiff;
      return serverTimestamp;
    }
    /**
     * Convert a server timestamp to a client timestamp. This is required
     * in case the client and server clocks are not synchronized.
     * @param serverTimestamp the client timestamp
     */

  }, {
    key: "convertToClientTimestamp",
    value: function convertToClientTimestamp(serverTimestamp) {
      var timestampDiff = this.getConfigParam('timestampDiff');
      var clientTimestamp = serverTimestamp + timestampDiff;
      return clientTimestamp;
    }
  }, {
    key: "isStudent",
    value: function isStudent(workgroupId) {
      return !this.isRunOwner(workgroupId) && !this.isRunSharedTeacher();
    }
    /**
     * Check if the workgroup is the owner of the run
     * @param workgroupId the workgroup id
     * @returns whether the workgroup is the owner of the run
     */

  }, {
    key: "isRunOwner",
    value: function isRunOwner() {
      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getWorkgroupId();

      if (workgroupId != null) {
        var teacherUserInfo = this.getTeacherUserInfo();

        if (teacherUserInfo != null) {
          if (workgroupId == teacherUserInfo.workgroupId) {
            return true;
          }
        }
      }

      return false;
    }
    /**
     * Check if the workgroup is a shared teacher for the run
     * @param workgroupId the workgroup id
     * @returns whether the workgroup is a shared teacher of the run
     */

  }, {
    key: "isRunSharedTeacher",
    value: function isRunSharedTeacher() {
      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getWorkgroupId();

      if (workgroupId != null) {
        var sharedTeacherUserInfos = this.getSharedTeacherUserInfos();

        if (sharedTeacherUserInfos != null) {
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = sharedTeacherUserInfos[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var sharedTeacherUserInfo = _step8.value;

              if (sharedTeacherUserInfo != null) {
                if (workgroupId == sharedTeacherUserInfo.workgroupId) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      }

      return false;
    }
    /**
     * Get the teacher role for the run
     * @param workgroupId the workgroup id
     * @returns the role of the teacher for the run. the possible values are
     * 'owner', 'write', 'read'
     */

  }, {
    key: "getTeacherRole",
    value: function getTeacherRole(workgroupId) {
      if (this.isRunOwner(workgroupId)) {
        return 'owner';
      } else if (this.isRunSharedTeacher(workgroupId)) {
        return this.getSharedTeacherRole(workgroupId);
      }

      return null;
    }
    /**
     * Get the shared teacher role for the run
     * @param workgroupId the workgroup id
     * @returns the shared teacher role for the run. the possible values are
     * 'write' or 'read'
     */

  }, {
    key: "getSharedTeacherRole",
    value: function getSharedTeacherRole(workgroupId) {
      if (workgroupId != null) {
        var sharedTeacherUserInfos = this.getSharedTeacherUserInfos();

        if (sharedTeacherUserInfos != null) {
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = sharedTeacherUserInfos[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var sharedTeacherUserInfo = _step9.value;

              if (sharedTeacherUserInfo != null) {
                if (workgroupId == sharedTeacherUserInfo.workgroupId) {
                  return sharedTeacherUserInfo.role;
                }
              }
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        }
      }

      return null;
    }
    /**
     * Replace student names in the content.
     * For example, we will replace instances of {{firstStudentFirstName}}
     * with the actual first name of the first student in the workgroup.
     * @param content a content object or string
     * @return an updated content object or string
     */

  }, {
    key: "replaceStudentNames",
    value: function replaceStudentNames(content) {
      if (content != null) {
        var contentString = content;

        if (_typeof(content) === 'object') {
          contentString = JSON.stringify(content);
        }

        if (contentString != null) {
          var workgroupId = this.getWorkgroupId();
          var firstNames = this.getStudentFirstNamesByWorkgroupId(workgroupId);

          if (firstNames.length >= 1) {
            /*
             * there are 1 or more students in the workgroup so we can
             * replace the first student first name with the actual
             * name
             */
            contentString = contentString.replace(new RegExp('{{firstStudentFirstName}}', 'gi'), firstNames[0]);
            /*
             * there are 1 or more students in the workgroup so we can
             * replace the student first names with the actual names
             */

            contentString = contentString.replace(new RegExp('{{studentFirstNames}}', 'gi'), firstNames.join(", "));
          }

          if (firstNames.length >= 2) {
            /*
             * there are 2 or more students in the workgroup so we can
             * replace the second student first name with the actual
             * name
             */
            contentString = contentString.replace(new RegExp('{{secondStudentFirstName}}', 'gi'), firstNames[1]);
          }

          if (firstNames.length >= 3) {
            /*
             * there are 3 or more students in the workgroup so we can
             * replace the third student first name with the actual
             * name
             */
            contentString = contentString.replace(new RegExp('{{thirdStudentFirstName}}', 'gi'), firstNames[2]);
          }
        }

        if (_typeof(content) === 'object') {
          // convert the content string back into an object
          content = JSON.parse(contentString);
        } else if (typeof content === 'string') {
          // the content was a string so we can just use the content string
          content = contentString;
        }
      }

      return content;
    }
  }, {
    key: "getAvatarColorForWorkgroupId",
    value: function getAvatarColorForWorkgroupId(workgroupId) {
      var avatarColors = ['#E91E63', '#9C27B0', '#CDDC39', '#2196F3', '#FDD835', '#43A047', '#795548', '#EF6C00', '#C62828', '#607D8B'];
      var modulo = workgroupId % 10;
      return avatarColors[modulo];
    }
    /**
     * Get the library projects
     */

  }, {
    key: "getLibraryProjects",
    value: function getLibraryProjects() {
      var getLibraryProjectsURL = this.getConfigParam('getLibraryProjectsURL');

      if (getLibraryProjectsURL != null) {
        // request the list of library projects
        return this.$http.get(getLibraryProjectsURL).then(function (result) {
          var data = result.data;

          if (data != null) {
            // reverse the list so that it is ordered newest to oldest
            data.reverse();
          }

          return data;
        });
      }
    }
    /**
     * Get the project assets folder path
     * @param includeHost whether to include the host in the URL
     * @return the project assets folder path
     * e.g.
     * with host
     * http://wise.berkeley.edu/wise/curriculum/3/assets
     * without host
     * /wise/curriculum/3/assets
     */

  }, {
    key: "getProjectAssetsDirectoryPath",
    value: function getProjectAssetsDirectoryPath(includeHost) {
      var projectBaseURL = this.getConfigParam('projectBaseURL');

      if (projectBaseURL != null) {
        if (includeHost) {
          var host = window.location.origin;
          /*
           * get the full path including the host
           * e.g. http://wise.berkeley.edu/wise/curriculum/3/assets
           */

          return host + projectBaseURL + 'assets';
        } else {
          /*
           * get the full path not including the host
           * e.g. /wise/curriculum/3/assets
           */
          return projectBaseURL + 'assets';
        }
      }

      return null;
    }
    /**
     * Remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     * @param html the html
     * @return the modified html without the absolute asset paths
     */

  }, {
    key: "removeAbsoluteAssetPaths",
    value: function removeAbsoluteAssetPaths(html) {
      /*
       * get the assets directory path with the host
       * e.g.
       * https://wise.berkeley.edu/wise/curriculum/3/assets/
       */
      var includeHost = true;
      var assetsDirectoryPathIncludingHost = this.getProjectAssetsDirectoryPath(includeHost);
      var assetsDirectoryPathIncludingHostRegEx = new RegExp(assetsDirectoryPathIncludingHost, 'g');
      /*
       * get the assets directory path without the host
       * e.g.
       * /wise/curriculum/3/assets/
       */

      var assetsDirectoryPathNotIncludingHost = this.getProjectAssetsDirectoryPath() + '/';
      var assetsDirectoryPathNotIncludingHostRegEx = new RegExp(assetsDirectoryPathNotIncludingHost, 'g');
      /*
       * remove the directory path from the html so that only the file name
       * remains in asset references
       * e.g.
       * <img src='https://wise.berkeley.edu/wise/curriculum/3/assets/sun.png'/>
       * will be changed to
       * <img src='sun.png'/>
       */

      html = html.replace(assetsDirectoryPathIncludingHostRegEx, '');
      html = html.replace(assetsDirectoryPathNotIncludingHostRegEx, '');
      return html;
    }
    /**
     * Get the WISE IDs for a workgroup
     * @param workgroupId get the WISE IDs for this workgroup
     * @return an array of WISE IDs
     */

  }, {
    key: "getWISEIds",
    value: function getWISEIds(workgroupId) {
      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          return userInfo.userIds;
        }
      }

      return [];
    }
    /**
     * Get all the authorable projects
     */

  }, {
    key: "getAuthorableProjects",
    value: function getAuthorableProjects() {
      var ownedProjects = this.getConfigParam('projects');
      var sharedProjects = this.getConfigParam('sharedProjects');
      var authorableProjects = [];

      if (ownedProjects != null) {
        authorableProjects = authorableProjects.concat(ownedProjects);
      }

      if (sharedProjects != null) {
        authorableProjects = authorableProjects.concat(sharedProjects);
      } // sort the projects by descending id


      authorableProjects.sort(this.sortByProjectId);
      return authorableProjects;
    }
    /**
     * Determines whether the current user is logged in as somebody else
     * @return true iff the user is a switched user
     */

  }, {
    key: "isSwitchedUser",
    value: function isSwitchedUser() {
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        if (myUserInfo.isSwitchedUser) {
          return true;
        }
      }

      return false;
    }
    /**
     * Sort the objects by descending id.
     * @param projectA an object with an id field
     * @param projectB an object with an id field
     * @return 1 if projectA comes before projectB
     * -1 if projectA comes after projectB
     * 0 if they are the same
     */

  }, {
    key: "sortByProjectId",
    value: function sortByProjectId(projectA, projectB) {
      var projectIdA = projectA.id;
      var projectIdB = projectB.id;

      if (projectIdA < projectIdB) {
        return 1;
      } else if (projectIdA > projectIdB) {
        return -1;
      } else {
        return 0;
      }
    }
  }, {
    key: "calculateIsRunActive",
    value: function calculateIsRunActive(configJSON) {
      var currentTime = new Date().getTime();

      if (currentTime < this.convertToClientTimestamp(configJSON.startTime)) {
        return false;
      } else if (configJSON.endTime != null && currentTime > this.convertToClientTimestamp(configJSON.endTime)) {
        return false;
      }

      return true;
    }
  }, {
    key: "isRunActive",
    value: function isRunActive() {
      return this.config.isRunActive;
    }
  }]);

  return ConfigService;
}();

ConfigService.$inject = ['$filter', '$http', '$location'];
var _default = ConfigService;
exports["default"] = _default;
//# sourceMappingURL=configService.js.map
