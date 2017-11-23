'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConfigService = function () {
  function ConfigService($filter, $http, $location) {
    _classCallCheck(this, ConfigService);

    this.$filter = $filter;
    this.$http = $http;
    this.$location = $location;
    this.config = null;

    this.$translate = this.$filter('translate');
  }

  _createClass(ConfigService, [{
    key: 'setConfig',
    value: function setConfig(config) {
      this.config = config;
      this.sortClassmateUserInfosAlphabeticallyByName();
      this.setPermissions();
      this.setClassmateDisplayNames();
    }
  }, {
    key: 'retrieveConfig',
    value: function retrieveConfig(configURL) {
      var _this = this;

      return this.$http.get(configURL).then(function (result) {
        var configJSON = result.data;

        if (configJSON.retrievalTimestamp != null) {
          // get the client timestamp
          var clientTimestamp = new Date().getTime();

          // get the server timestamp
          var serverTimestamp = configJSON.retrievalTimestamp;

          // get the difference between the client and server time
          var timestampDiff = clientTimestamp - serverTimestamp;

          // add the timestamp diff to the config object
          configJSON.timestampDiff = timestampDiff;
        }

        var constraints = true;

        // get the full url
        var absURL = _this.$location.$$absUrl;

        if (configJSON.mode == 'preview') {
          // constraints can only be disabled using the url in preview mode

          // regex to match constraints=false in the url
          var constraintsRegEx = new RegExp("constraints=false", 'gi');

          if (absURL != null && absURL.match(constraintsRegEx)) {
            // the url contains constraints=false
            constraints = false;
          }
        }

        // set the constraints value into the config so we can access it later
        configJSON.constraints = constraints;

        // regex to match showProjectPath=true in the url
        var showProjectPathRegEx = new RegExp("showProjectPath=true", 'gi');

        if (absURL != null && absURL.match(showProjectPathRegEx)) {
          // the url contains showProjectPath=true

          // get the host e.g. http://wise.berkeley.edu
          var host = location.origin;

          // get the project URL e.g. /wise/curriculum/123/project.json
          var projectURL = configJSON.projectURL;

          // get the full project path
          var projectPath = host + projectURL;

          // output the full project path to the console
          console.log(projectPath);
        }

        _this.setConfig(configJSON);

        if (_this.isPreview()) {
          // assign a random workgroup id
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
    key: 'getConfigParam',
    value: function getConfigParam(paramName) {
      if (this.config !== null) {
        return this.config[paramName];
      } else {
        return null;
      }
    }
  }, {
    key: 'getAchievementsURL',
    value: function getAchievementsURL() {
      return this.getConfigParam('achievementURL');
    }
  }, {
    key: 'getCRaterRequestURL',
    value: function getCRaterRequestURL() {
      return this.getConfigParam('cRaterRequestURL');
    }
  }, {
    key: 'getMainHomePageURL',
    value: function getMainHomePageURL() {
      return this.getConfigParam('mainHomePageURL');
    }
  }, {
    key: 'getNotificationURL',
    value: function getNotificationURL() {
      return this.getConfigParam('notificationURL');
    }
  }, {
    key: 'getRunId',
    value: function getRunId() {
      return this.getConfigParam('runId');
    }
  }, {
    key: 'getProjectId',
    value: function getProjectId() {
      return this.getConfigParam('projectId');
    }
  }, {
    key: 'getOpenCPUURL',
    value: function getOpenCPUURL() {
      return this.getConfigParam('openCPUURL');
    }
  }, {
    key: 'getSessionLogOutURL',
    value: function getSessionLogOutURL() {
      return this.getConfigParam('sessionLogOutURL');
    }
  }, {
    key: 'getStudentAssetsURL',
    value: function getStudentAssetsURL() {
      return this.getConfigParam('studentAssetsURL');
    }
  }, {
    key: 'getStudentStatusURL',
    value: function getStudentStatusURL() {
      return this.getConfigParam('studentStatusURL');
    }
  }, {
    key: 'getStudentMaxTotalAssetsSize',
    value: function getStudentMaxTotalAssetsSize() {
      return this.getConfigParam('studentMaxTotalAssetsSize');
    }
  }, {
    key: 'getStudentNotebookURL',
    value: function getStudentNotebookURL() {
      return this.getConfigParam('studentNotebookURL');
    }
  }, {
    key: 'getStudentUploadsBaseURL',
    value: function getStudentUploadsBaseURL() {
      return this.getConfigParam('studentUploadsBaseURL');
    }
  }, {
    key: 'getUserInfo',
    value: function getUserInfo() {
      return this.getConfigParam('userInfo');
    }
  }, {
    key: 'getWebSocketURL',
    value: function getWebSocketURL() {
      return this.getConfigParam('webSocketURL');
    }
  }, {
    key: 'getWISEBaseURL',
    value: function getWISEBaseURL() {
      return this.getConfigParam('wiseBaseURL');
    }
  }, {
    key: 'getLocale',
    value: function getLocale() {
      return this.getConfigParam('locale') || 'en';
    }
  }, {
    key: 'getMode',
    value: function getMode() {
      return this.getConfigParam('mode');
    }
  }, {
    key: 'getPeriodId',


    /**
     * Returns the period id of the logged-in user.
     */
    value: function getPeriodId() {
      var periodId = null;
      var myUserInfo = this.getMyUserInfo();
      if (myUserInfo != null) {
        periodId = myUserInfo.periodId;
      }
      return periodId;
    }
  }, {
    key: 'getPeriods',


    /**
     * Get the periods
     * @returns an array of period objects
     */
    value: function getPeriods() {
      var periods = [];

      var myUserInfo = this.getMyUserInfo();
      if (myUserInfo != null) {

        var myClassInfo = myUserInfo.myClassInfo;
        if (myClassInfo != null) {

          if (myClassInfo.periods != null) {
            periods = myClassInfo.periods;
          }
        }
      }

      return periods;
    }
  }, {
    key: 'getWorkgroupId',
    value: function getWorkgroupId() {
      var workgroupId = null;

      var myUserInfo = this.getMyUserInfo();
      if (myUserInfo != null) {
        workgroupId = myUserInfo.workgroupId;
      }

      return workgroupId;
    }
  }, {
    key: 'getUserId',


    /**
     * Get the user id (aka WISE ID)
     * @return the user id
     */
    value: function getUserId() {

      var userId = null;

      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        userId = myUserInfo.id;
      }

      return userId;
    }
  }, {
    key: 'getMyUserInfo',
    value: function getMyUserInfo() {
      var myUserInfo = null;

      var userInfo = this.getUserInfo();
      if (userInfo != null) {
        myUserInfo = userInfo.myUserInfo;
      }

      return myUserInfo;
    }
  }, {
    key: 'getMyUserName',


    /**
     * Get the user name of the signed in user
     * @return the user name of the signed in user
     */
    value: function getMyUserName() {

      var userName = null;

      // get my user info
      var myUserInfo = this.getMyUserInfo();

      if (myUserInfo != null) {
        // get the user name
        userName = myUserInfo.userName;
      }

      return userName;
    }
  }, {
    key: 'getClassmateUserInfos',
    value: function getClassmateUserInfos() {
      var classmateUserInfos = null;
      var myUserInfo = this.getMyUserInfo();
      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;
        if (myClassInfo != null) {
          classmateUserInfos = myClassInfo.classmateUserInfos;
        }
      }

      return classmateUserInfos;
    }
  }, {
    key: 'setClassmateDisplayNames',
    value: function setClassmateDisplayNames() {
      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = classmateUserInfos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var workgroup = _step.value;

            workgroup.displayNames = this.getDisplayUserNamesByWorkgroupId(workgroup.workgroupId);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
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
    key: 'getClassmateUserInfosSortedByWorkgroupId',
    value: function getClassmateUserInfosSortedByWorkgroupId() {

      var sortedClassmateUserInfos = [];

      // get all the classmate user info objects
      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos != null) {

        /*
         * loop through all the classmate user info objects and add it to
         * new array of classmate user infos
         */
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
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      // sort the new classmate user infos array by ascending workgroup id
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
    key: 'compareClassmateUserInfosByWorkgroupId',
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
    key: 'getTeacherWorkgroupId',
    value: function getTeacherWorkgroupId() {
      var teacherWorkgroupId = null;
      var teacherUserInfo = this.getTeacherUserInfo();
      if (teacherUserInfo != null) {
        teacherWorkgroupId = teacherUserInfo.workgroupId;
      }
      return teacherWorkgroupId;
    }
  }, {
    key: 'getTeacherUserInfo',
    value: function getTeacherUserInfo() {
      var teacherUserInfo = null;
      var myUserInfo = this.getMyUserInfo();
      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;
        if (myClassInfo != null) {
          teacherUserInfo = myClassInfo.teacherUserInfo;
        }
      }
      return teacherUserInfo;
    }
  }, {
    key: 'getSharedTeacherUserInfos',


    /**
     * Get the shared teacher user infos for the run
     */
    value: function getSharedTeacherUserInfos() {
      var sharedTeacherUserInfos = null;
      var myUserInfo = this.getMyUserInfo();
      if (myUserInfo != null) {
        var myClassInfo = myUserInfo.myClassInfo;
        if (myClassInfo != null) {
          sharedTeacherUserInfos = myClassInfo.sharedTeacherUserInfos;
        }
      }
      return sharedTeacherUserInfos;
    }
  }, {
    key: 'getClassmateWorkgroupIds',
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
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
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
    key: 'sortClassmateUserInfosAlphabeticallyByName',
    value: function sortClassmateUserInfosAlphabeticallyByName() {
      var classmateUserInfos = this.getClassmateUserInfos();

      if (classmateUserInfos != null) {
        classmateUserInfos.sort(this.sortClassmateUserInfosAlphabeticallyByNameHelper);
      }

      return classmateUserInfos;
    }
  }, {
    key: 'sortClassmateUserInfosAlphabeticallyByNameHelper',
    value: function sortClassmateUserInfosAlphabeticallyByNameHelper(a, b) {
      var result = 0;

      if (a != null && a.userName != null && b != null && b.userName != null) {
        var aUserName = a.userName.toLowerCase();
        var bUserName = b.userName.toLowerCase();

        if (aUserName < bUserName) {
          result = -1;
        } else if (aUserName > bUserName) {
          result = 1;
        }
      }

      return result;
    }
  }, {
    key: 'setPermissions',
    value: function setPermissions() {
      // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
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
    key: 'getPermissions',
    value: function getPermissions() {

      // a switched user (admin/researcher user impersonating a teacher) should not be able to view/grade
      return {
        canViewStudentNames: this.config.canViewStudentNames && !this.isSwitchedUser(),
        canGradeStudentWork: this.config.canGradeStudentWork && !this.isSwitchedUser()
      };
    }
  }, {
    key: 'getUserInfoByWorkgroupId',
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
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
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
    key: 'getPeriodIdByWorkgroupId',


    /**
     * Get the period id for a workgroup id
     * @param workgroupId the workgroup id
     * @returns the period id the workgroup id is in
     */
    value: function getPeriodIdByWorkgroupId(workgroupId) {
      var periodId = null;

      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          periodId = userInfo.periodId;
        }
      }

      return periodId;
    }
  }, {
    key: 'getStudentFirstNamesByWorkgroupId',


    /**
     * Get the student names
     * @param workgroupId the workgroup id
     * @return an array containing the student names
     */
    value: function getStudentFirstNamesByWorkgroupId(workgroupId) {
      var studentNames = [];

      // get the user names for the workgroup e.g. "Spongebob Squarepants (SpongebobS0101):Patrick Star (PatrickS0101)"
      var userNames = this.getUserNameByWorkgroupId(workgroupId);

      if (userNames != null) {
        // split the user names string by ':'
        var userNamesSplit = userNames.split(':');

        if (userNamesSplit != null) {
          // loop through each user name
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = userNamesSplit[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var userName = _step5.value;


              // get the index of the first empty space
              var indexOfSpace = userName.indexOf(' ');

              // get the student first name e.g. "Spongebob"
              var studentFirstName = userName.substring(0, indexOfSpace);

              // add the student name to the array
              studentNames.push(studentFirstName);
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }
        }
      }

      return studentNames;
    }
  }, {
    key: 'getUserIdsByWorkgroupId',
    value: function getUserIdsByWorkgroupId(workgroupId) {
      var userIds = [];

      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          userIds = userInfo.userIds;
        }
      }

      return userIds;
    }
  }, {
    key: 'getUserNameByWorkgroupId',
    value: function getUserNameByWorkgroupId(workgroupId) {
      var userName = null;

      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          userName = userInfo.userName;
        }
      }

      return userName;
    }
  }, {
    key: 'getDisplayNamesByWorkgroupId',
    value: function getDisplayNamesByWorkgroupId(workgroupId) {
      var displayNames = null;

      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          displayNames = userInfo.displayNames;
        }
      }

      return displayNames;
    }
  }, {
    key: 'getUserNamesByWorkgroupId',
    value: function getUserNamesByWorkgroupId(workgroupId) {
      var userNamesObjects = [];

      if (workgroupId != null) {
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          var userNames = userInfo.userName.split(':');

          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = userNames[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var name = _step6.value;

              var id = "";
              var regex = /(.+) \((.+)\)/g;
              var matches = regex.exec(name);
              if (matches) {
                name = matches[1];
                id = matches[2];
              }
              userNamesObjects.push({
                name: name,
                id: id
              });
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      }

      return userNamesObjects;
    }
  }, {
    key: 'getDisplayUserNamesByWorkgroupId',
    value: function getDisplayUserNamesByWorkgroupId(workgroupId) {
      var usernames = '';

      if (workgroupId != null) {
        if (this.getPermissions().canViewStudentNames) {
          var names = this.getUserNamesByWorkgroupId(workgroupId);
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
            usernames += this.$translate('studentId', { id: id });
          }
        }
      }

      return usernames;
    }
  }, {
    key: 'isPreview',
    value: function isPreview() {
      var result = false;

      var mode = this.getMode();

      if (mode != null && mode === 'preview') {
        result = true;
      }

      return result;
    }
  }, {
    key: 'convertToServerTimestamp',


    /**
     * Convert a client timestamp to a server timestamp. This is required
     * in case the client and server clocks are not synchronized.
     * @param clientTimestamp the client timestamp
     */
    value: function convertToServerTimestamp(clientTimestamp) {

      // get the difference between the client time and server time
      var timestampDiff = this.getConfigParam('timestampDiff');

      // convert the client timestamp to a server timestamp
      var serverTimestamp = clientTimestamp - timestampDiff;

      return serverTimestamp;
    }

    /**
     * Convert a server timestamp to a client timestamp. This is required
     * in case the client and server clocks are not synchronized.
     * @param serverTimestamp the client timestamp
     */

  }, {
    key: 'convertToClientTimestamp',
    value: function convertToClientTimestamp(serverTimestamp) {

      // get the difference between the client time and server time
      var timestampDiff = this.getConfigParam('timestampDiff');

      // convert the client timestamp to a server timestamp
      var clientTimestamp = serverTimestamp + timestampDiff;

      return clientTimestamp;
    }

    /**
     * Check if the workgroup is the owner of the run
     * @param workgroupId the workgroup id
     * @returns whether the workgroup is the owner of the run
     */

  }, {
    key: 'isRunOwner',
    value: function isRunOwner(workgroupId) {

      var result = false;

      if (workgroupId != null) {
        var teacherUserInfo = this.getTeacherUserInfo();

        if (teacherUserInfo != null) {

          if (workgroupId == teacherUserInfo.workgroupId) {
            result = true;
          }
        }
      }

      return result;
    }

    /**
     * Check if the workgroup is a shared teacher for the run
     * @param workgroupId the workgroup id
     * @returns whether the workgroup is a shared teacher of the run
     */

  }, {
    key: 'isRunSharedTeacher',
    value: function isRunSharedTeacher(workgroupId) {

      var result = false;

      if (workgroupId != null) {
        var sharedTeacherUserInfos = this.getSharedTeacherUserInfos();

        if (sharedTeacherUserInfos != null) {
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {

            for (var _iterator7 = sharedTeacherUserInfos[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var sharedTeacherUserInfo = _step7.value;

              if (sharedTeacherUserInfo != null) {
                if (workgroupId == sharedTeacherUserInfo.workgroupId) {
                  result = true;
                }
              }
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }
        }
      }

      return result;
    }

    /**
     * Get the teacher role for the run
     * @param workgroupId the workgroup id
     * @returns the role of the teacher for the run. the possible values are
     * 'owner', 'write', 'read'
     */

  }, {
    key: 'getTeacherRole',
    value: function getTeacherRole(workgroupId) {
      var role = null;

      if (this.isRunOwner(workgroupId)) {
        // the teacher is the owner of the run
        role = 'owner';
      } else if (this.isRunSharedTeacher(workgroupId)) {
        // the teacher is a shared teacher so their role may be 'write' or 'read'
        role = this.getSharedTeacherRole(workgroupId);
      }

      return role;
    }

    /**
     * Get the shared teacher role for the run
     * @param workgroupId the workgroup id
     * @returns the shared teacher role for the run. the possible values are
     * 'write' or 'read'
     */

  }, {
    key: 'getSharedTeacherRole',
    value: function getSharedTeacherRole(workgroupId) {
      var role = null;

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
                  role = sharedTeacherUserInfo.role;
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      }

      return role;
    }

    /**
     * Replace student names in the content.
     * For example, we will replace instances of {{firstStudentFirstName}}
     * with the actual first name of the first student in the workgroup.
     * @param content a content object or string
     * @return an updated content object or string
     */

  }, {
    key: 'replaceStudentNames',
    value: function replaceStudentNames(content) {
      if (content != null) {

        var contentString = content;

        if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
          // get the content as a string
          contentString = JSON.stringify(content);
        }

        if (contentString != null) {

          // get the workgroup id
          var workgroupId = this.getWorkgroupId();

          // get all the first names
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

        if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
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
    key: 'getAvatarColorForWorkgroupId',
    value: function getAvatarColorForWorkgroupId(workgroupId) {
      var avatarColors = ['#E91E63', '#9C27B0', '#CDDC39', '#2196F3', '#FDD835', '#43A047', '#795548', '#EF6C00', '#C62828', '#607D8B'];
      var modulo = workgroupId % 10;
      return avatarColors[modulo];
    }

    /**
     * Get the library projects
     */

  }, {
    key: 'getLibraryProjects',
    value: function getLibraryProjects() {

      // get the URL to get the list of library projects
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
    key: 'getProjectAssetsDirectoryPath',
    value: function getProjectAssetsDirectoryPath(includeHost) {
      var projectAssetsDirectoryPath = null;

      // get the project base URL e.g. /wise/curriculum/3/
      var projectBaseURL = this.getConfigParam('projectBaseURL');

      if (projectBaseURL != null) {
        if (includeHost) {
          // get the host e.g. http://wise.berkeley.edu
          var host = window.location.origin;

          /*
           * get the full path including the host
           * e.g. http://wise.berkeley.edu/wise/curriculum/3/assets
           */
          projectAssetsDirectoryPath = host + projectBaseURL + 'assets';
        } else {
          /*
           * get the full path not including the host
           * e.g. /wise/curriculum/3/assets
           */
          projectAssetsDirectoryPath = projectBaseURL + 'assets';
        }
      }

      return projectAssetsDirectoryPath;
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
    key: 'removeAbsoluteAssetPaths',
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
    key: 'getWISEIds',
    value: function getWISEIds(workgroupId) {

      var wiseIds = [];

      if (workgroupId != null) {
        // get the user info object for the workgroup id
        var userInfo = this.getUserInfoByWorkgroupId(workgroupId);

        if (userInfo != null) {
          // get the WISE IDs
          wiseIds = userInfo.userIds;
        }
      }

      return wiseIds;
    }

    /**
     * Get all the authorable projects
     */

  }, {
    key: 'getAuthorableProjects',
    value: function getAuthorableProjects() {

      // get the projects this teacher owns
      var projects = this.getConfigParam('projects');

      // get the projects that were shared with the teacher
      var sharedProjects = this.getConfigParam('sharedProjects');

      var authorableProjects = [];

      if (projects != null) {
        // add the owned projects
        authorableProjects = authorableProjects.concat(projects);
      }

      if (sharedProjects != null) {
        // add the shared projects
        authorableProjects = authorableProjects.concat(sharedProjects);
      }

      // sort the projects by descending id
      authorableProjects.sort(this.sortByProjectId);

      return authorableProjects;
    }

    /**
     * Determines whether the current user is logged in as somebody else
     * @return true iff the user is a switched user
     */

  }, {
    key: 'isSwitchedUser',
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
    key: 'sortByProjectId',
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
  }]);

  return ConfigService;
}();

ConfigService.$inject = ['$filter', '$http', '$location'];

exports.default = ConfigService;
//# sourceMappingURL=configService.js.map
