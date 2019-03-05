'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AchievementService = function () {
  function AchievementService($http, $q, $rootScope, ConfigService, ProjectService, StudentDataService, UtilService) {
    _classCallCheck(this, AchievementService);

    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    // an object of projectAchievements, where key is workgroupId and value is the array of projectAchievements for the workgroup.
    this.studentAchievementsByWorkgroupId = {};

    // whether to print debug output to the console
    this.debug = false;
  }

  /**
   * Output the string to the console if debug=true
   * @param str the string to output to the console
   */


  _createClass(AchievementService, [{
    key: 'debugOutput',
    value: function debugOutput(str) {
      if (this.debug) {
        console.log(str);
      }
    }
  }, {
    key: 'retrieveStudentAchievements',
    value: function retrieveStudentAchievements() {
      var _this = this;

      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.ConfigService.isPreview()) {
        var _workgroupId = this.ConfigService.getWorkgroupId();
        this.studentAchievementsByWorkgroupId[_workgroupId] = [];
        return Promise.resolve(this.studentAchievementsByWorkgroupId);
      } else {
        var config = {
          method: 'GET',
          url: this.ConfigService.getAchievementsURL(),
          params: {}
        };
        if (workgroupId != null) {
          config.params.workgroupId = workgroupId;
        } else if (this.ConfigService.getMode() !== 'classroomMonitor') {
          config.params.workgroupId = this.ConfigService.getWorkgroupId();
          config.params.periodId = this.ConfigService.getPeriodId();
        }
        if (type != null) {
          config.params.type = type;
        }

        return this.$http(config).then(function (response) {
          var studentAchievements = response.data;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = studentAchievements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var studentAchievement = _step.value;

              _this.addOrUpdateStudentAchievement(studentAchievement);

              if (_this.ConfigService.getMode() === 'studentRun') {
                var _projectAchievement = _this.ProjectService.getAchievementByAchievementId(studentAchievement.achievementId);
                if (_projectAchievement != null) {
                  /*
                   * set the completed field to true in case we ever
                   * need to easily see which projectAchievements the student
                   * has completed
                   */
                  _projectAchievement.completed = true;
                  if (_projectAchievement.deregisterFunction != null) {
                    /*
                     * the student has completed this achievement
                     * so we no longer need to listen for it
                     */
                    _projectAchievement.deregisterFunction();
                    _this.debugOutput('deregistering ' + _projectAchievement.id);
                  }
                }
              }
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

          if (_this.ConfigService.getMode() === 'studentRun') {
            /*
             * Loop through all the projectAchievements and
             * re-evaluate whether the student has completed each.
             * This is to make sure students never get stuck in a
             * state where they did everything required to complete
             * a certain achievement but some error or bug occurred
             * which prevented their student achievement from being
             * saved and then they end up never being able to
             * complete that achievement. We will avoid this
             * situation by re-evaluating all the projectAchievements
             * each time the student loads the VLE.
             */
            var projectAchievements = _this.ProjectService.getAchievementItems();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = projectAchievements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var projectAchievement = _step2.value;

                if (!_this.isStudentAchievementExists(projectAchievement.id) && _this.isProjectAchievementSatisfied(projectAchievement)) {
                  _this.createStudentAchievement(projectAchievement);
                }
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
          _this.registerAchievementListeners();
          return _this.studentAchievementsByWorkgroupId;
        });
      }
    }

    /**
     * Add Achievement to local bookkeeping
     * @param studentAchievement the student achievement to add or update
     */

  }, {
    key: 'addOrUpdateStudentAchievement',
    value: function addOrUpdateStudentAchievement(studentAchievement) {
      if (studentAchievement != null) {
        var achievementWorkgroupId = studentAchievement.workgroupId;
        if (this.studentAchievementsByWorkgroupId[achievementWorkgroupId] == null) {
          this.studentAchievementsByWorkgroupId[achievementWorkgroupId] = new Array();
        }
        var achievements = this.studentAchievementsByWorkgroupId[achievementWorkgroupId];
        var found = false;
        for (var achievementIndex = 0; achievementIndex < achievements.length; achievementIndex++) {
          var achievement = achievements[achievementIndex];

          if (achievement.achievementId != null && achievement.achievementId === studentAchievement.achievementId && achievement.workgroupId != null && achievement.workgroupId === studentAchievement.workgroupId) {
            /*
             * the achievement 10 character alphanumeric id matches and
             * the workgroup id matches so we will update it
             */
            achievements[achievementIndex] = studentAchievement;
            found = true; // remember this so we don't insert later.
            break;
          }
        }
        if (!found) {
          // we did not find the achievement so we will add it to the array
          achievements.push(studentAchievement);
        }
      }
    }

    /**
     * Saves the achievement for the logged-in user
     * @param studentAchievement
     */

  }, {
    key: 'saveAchievementToServer',
    value: function saveAchievementToServer(studentAchievement) {
      var _this2 = this;

      if (this.ConfigService.isPreview()) {
        // if we're in preview, don't make any request to the server and resolve the promise right away
        var deferred = this.$q.defer();
        deferred.resolve(studentAchievement);
        return deferred.promise;
      } else {
        var config = {
          method: "POST",
          url: this.ConfigService.getAchievementsURL(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };

        var params = {
          achievementId: studentAchievement.achievementId,
          workgroupId: studentAchievement.workgroupId,
          type: studentAchievement.type
        };

        if (studentAchievement.id != null) {
          params.id = studentAchievement.id;
        }
        if (studentAchievement.data != null) {
          params.data = angular.toJson(studentAchievement.data);
        }

        config.data = $.param(params);

        return this.$http(config).then(function (result) {
          var achievement = result.data;
          if (achievement.data != null) {
            achievement.data = angular.fromJson(achievement.data);
          }
          _this2.addOrUpdateStudentAchievement(achievement);
          return achievement;
        });
      }
    }

    /**
     * Creates a new student achievement object
     * @param type type of achievement ["completion", "milestone", etc]
     * @param achievementId id of achievement in project content
     * @param data other extra information about this achievement
     * @param workgroupId id of workgroup whom this achievement is for
     * @returns newly created student achievement object
     */

  }, {
    key: 'createNewStudentAchievement',
    value: function createNewStudentAchievement(type, achievementId) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var workgroupId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      if (workgroupId == null) {
        workgroupId = this.ConfigService.getWorkgroupId();
      }
      return {
        id: null,
        type: type,
        achievementId: achievementId,
        workgroupId: workgroupId,
        data: data
      };
    }
  }, {
    key: 'registerAchievementListeners',
    value: function registerAchievementListeners() {
      var projectAchievements = this.ProjectService.getAchievements();
      if (projectAchievements.isEnabled) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = projectAchievements.items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var projectAchievement = _step3.value;

            if (!this.isStudentAchievementExists(projectAchievement.id)) {
              this.createListenerFunction(projectAchievement);
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
    }
  }, {
    key: 'createListenerFunction',
    value: function createListenerFunction(projectAchievement) {
      var deregisterListenerFunction = null;
      if (projectAchievement.type === 'milestone' || projectAchievement.type === 'milestoneReport' || projectAchievement.type === 'completion') {
        deregisterListenerFunction = this.createStudentWorkSavedListener(projectAchievement);
      } else if (projectAchievement.type === 'aggregate') {
        deregisterListenerFunction = this.createAggregateAchievementListener(projectAchievement);
      }
      /*
       * set the deregisterListenerFunction into the project
       * achievement so that we can deregister the
       * listener after the student has completed the
       * achievement
       */
      projectAchievement.deregisterListenerFunction = deregisterListenerFunction;
    }

    /**
     * Check if the student has completed the achievement
     * @param achievementId
     * @return whether the student has completed the achievement
     */

  }, {
    key: 'isStudentAchievementExists',
    value: function isStudentAchievementExists(achievementId) {
      var workgroupId = this.ConfigService.getWorkgroupId();
      var achievements = this.getStudentAchievementsByWorkgroupId(workgroupId);
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = achievements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var achievement = _step4.value;

          if (achievement.achievementId === achievementId) {
            return true;
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

      return false;
    }

    /**
     * Create achievement and save to server
     * @param achievement the achievement the student completed
     */

  }, {
    key: 'createStudentAchievement',
    value: function createStudentAchievement(achievement) {
      if (achievement.isVisible) {
        alert('Congratulations you completed: ' + achievement.name);
        console.log('Congratulations you completed: ' + achievement.name);
      }

      var projectAchievement = this.ProjectService.getAchievementByAchievementId(achievement.id);
      if (projectAchievement != null && projectAchievement.deregisterListenerFunction != null) {
        /*
         * deregister the achievement listener now that the student has
         * completed the achievement
         */
        projectAchievement.deregisterListenerFunction();
        this.debugOutput('deregistering ' + projectAchievement.id);
      }

      /*
       * create a copy of the achievement to make sure we don't cause
       * any referencing problems in the future
       */
      var achievementCopy = this.UtilService.makeCopyOfJSONObject(achievement);
      var workgroupId = this.ConfigService.getWorkgroupId();
      var type = achievementCopy.type;
      var id = achievementCopy.id;
      var data = achievementCopy;
      var newAchievement = this.createNewStudentAchievement(type, id, data, workgroupId);
      var achievements = this.getStudentAchievementsByWorkgroupId(workgroupId);
      achievements.push(newAchievement);
      this.saveAchievementToServer(newAchievement);
      this.$rootScope.$broadcast('achievementCompleted', { achievementId: achievementCopy.id });
    }

    /**
     * Create a listener for the component completed achievement
     * @param projectAchievement the achievement to listen for
     * @return the deregister function for the listener
     */

  }, {
    key: 'createStudentWorkSavedListener',
    value: function createStudentWorkSavedListener(projectAchievement) {
      var _this3 = this;

      this.debugOutput('registering ' + projectAchievement.id);
      var deregisterListenerFunction = this.$rootScope.$on('studentWorkSavedToServer', function (event, args) {
        _this3.debugOutput('createStudentWorkSavedListener checking ' + projectAchievement.id + ' completed ' + args.nodeId);
        if (!_this3.isStudentAchievementExists(projectAchievement.id)) {
          if (_this3.isAchievementCompletedByStudent(projectAchievement)) {
            _this3.createStudentAchievement(projectAchievement);
          }
        }
      });
      return deregisterListenerFunction;
    }

    /**
     * Check if the student completed a specific achievement
     * @param projectAchievement an achievement
     * @return whether the student completed the achievement
     */

  }, {
    key: 'isProjectAchievementSatisfied',
    value: function isProjectAchievementSatisfied(projectAchievement) {
      var completed = false;
      if (projectAchievement != null) {
        if (projectAchievement.type === 'milestone' || projectAchievement.type === 'milestoneReport' || projectAchievement.type === 'completion') {
          completed = this.isAchievementCompletedByStudent(projectAchievement);
        } else if (projectAchievement.type === 'aggregate') {
          completed = this.checkAggregateAchievement(projectAchievement);
        }
      }
      return completed;
    }

    /**
     * Check if the student completed a node completed achievement
     * @param projectAchievement a node completed achievement
     * @return whether the student completed the node completed achievement
     */

  }, {
    key: 'isAchievementCompletedByStudent',
    value: function isAchievementCompletedByStudent(projectAchievement) {
      var isCompleted = true;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = projectAchievement.satisfyCriteria[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var satisfyCriterion = _step5.value;

          isCompleted = isCompleted && this.isCriterionSatisfied(satisfyCriterion);
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

      return isCompleted;
    }
  }, {
    key: 'isCriterionSatisfied',
    value: function isCriterionSatisfied(satisfyCriterion) {
      if (satisfyCriterion.name === 'isCompleted') {
        return this.StudentDataService.isCompleted(satisfyCriterion.nodeId, satisfyCriterion.componentId);
      }
      return false;
    }

    /**
     * Create a listener for an aggregate achievement
     * @param projectAchievement the project achievement
     * @return the deregister function for the listener
     */

  }, {
    key: 'createAggregateAchievementListener',
    value: function createAggregateAchievementListener(projectAchievement) {
      var _this4 = this;

      var thisAchievementService = this;
      var thisAchievement = projectAchievement;
      this.debugOutput('registering ' + projectAchievement.id);
      var deregisterListenerFunction = this.$rootScope.$on('achievementCompleted', function (event, args) {
        /*
         * the achievementCompleted event was fired so we will check if this
         * achievement has been completed
         */
        var projectAchievement = thisAchievement;
        if (projectAchievement != null) {
          _this4.debugOutput('createAggregateAchievementListener checking ' + projectAchievement.id + ' completed ' + args.achievementId);

          var id = projectAchievement.id;
          var achievementId = args.achievementId;

          if (!_this4.isStudentAchievementExists(id)) {
            /*
             * the student has not completed this achievement before
             * so we will now check if they have completed it
             */

            var completed = _this4.checkAggregateAchievement(projectAchievement);
            if (completed) {
              thisAchievementService.createStudentAchievement(projectAchievement);
            }
          }
        }
      });
      return deregisterListenerFunction;
    }

    /**
     * Check if the student completed a aggregate achievement
     * @param projectAchievement an aggregate achievement
     * @return whether the student completed the aggregate achievement
     */

  }, {
    key: 'checkAggregateAchievement',
    value: function checkAggregateAchievement(projectAchievement) {
      var completed = false;
      var params = projectAchievement.params;
      if (params != null) {
        var achievementIds = params.achievementIds;
        for (var a = 0; a < achievementIds.length; a++) {
          var tempAchievementId = achievementIds[a];
          if (a === 0) {
            // this is the first node id
            completed = this.isStudentAchievementExists(tempAchievementId);
          } else {
            /*
             * this is a node id after the first node id so
             * we will use an and conditional
             */
            completed = completed && this.isStudentAchievementExists(tempAchievementId);
          }
        }
      }
      return completed;
    }

    /**
     * Get student achievements for a workgroup id
     * @param workgroupId the workgroup id
     * @return an array of student achievements completed by the workgroup
     */

  }, {
    key: 'getStudentAchievementsByWorkgroupId',
    value: function getStudentAchievementsByWorkgroupId() {
      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (workgroupId == null) {
        workgroupId = this.ConfigService.getWorkgroupId();
      }
      if (this.studentAchievementsByWorkgroupId[workgroupId] == null) {
        this.studentAchievementsByWorkgroupId[workgroupId] = [];
        return this.studentAchievementsByWorkgroupId[workgroupId];
      } else if (this.studentAchievementsByWorkgroupId[workgroupId] != null) {
        return this.studentAchievementsByWorkgroupId[workgroupId];
      }
      return [];
    }

    /**
     * Get an array of student projectAchievements for a given achievement id
     * @param achievementId a 10 character achievement id
     * @return an array of student projectAchievements. student projectAchievements are
     * created when a workgroup completes an achievement.
     */

  }, {
    key: 'getStudentAchievementsByAchievementId',
    value: function getStudentAchievementsByAchievementId(achievementId) {
      var achievementsByAchievementId = [];
      var workgroupIds = this.ConfigService.getClassmateWorkgroupIds();
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = workgroupIds[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var workgroupId = _step6.value;

          var achievementsForWorkgroup = this.studentAchievementsByWorkgroupId[workgroupId];
          if (achievementsForWorkgroup != null) {
            for (var a = achievementsForWorkgroup.length - 1; a >= 0; a--) {
              var studentAchievement = achievementsForWorkgroup[a];
              if (studentAchievement != null && studentAchievement.data != null) {
                if (studentAchievement.data.id === achievementId) {
                  achievementsByAchievementId.push(studentAchievement);
                }
              }
            }
          }
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

      return achievementsByAchievementId;
    }

    /**
     * Get a mapping from achievement id to array of student projectAchievements
     * @param achievementId the achievement id
     * @return a mapping from achievement id to array of student projectAchievements
     * student projectAchievements are created when a workgroup completes an achievement.
     */

  }, {
    key: 'getAchievementIdToStudentAchievementsMappings',
    value: function getAchievementIdToStudentAchievementsMappings(achievementId) {
      var achievementIdToAchievements = {};
      var projectAchievements = this.ProjectService.getAchievementItems();
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = projectAchievements[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var projectAchievement = _step7.value;

          if (projectAchievement != null) {
            var studentAchievements = this.getStudentAchievementsByAchievementId(projectAchievement.id);
            achievementIdToAchievements[projectAchievement.id] = studentAchievements;
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

      return achievementIdToAchievements;
    }

    /**
     * Get an achievement id that isn't being used
     * @return an achievement id that isn't being used
     */

  }, {
    key: 'getAvailableAchievementId',
    value: function getAvailableAchievementId() {
      var id = null;
      var achievements = this.ProjectService.getAchievementItems();
      while (id == null) {
        id = this.UtilService.generateKey(10);
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = achievements[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var achievement = _step8.value;

            if (achievement.id === id) {
              /*
               * the id is already being used so we need to find
               * a different one
               */
              id = null;
              break;
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
      return id;
    }
  }]);

  return AchievementService;
}();

AchievementService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = AchievementService;
//# sourceMappingURL=achievementService.js.map
