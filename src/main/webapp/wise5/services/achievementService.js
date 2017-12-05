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
    this.achievementsByWorkgroupId = {}; // an object of achievements, where key is workgroupId and value is the array of achievements for the workgroup.

    // whether to print debug output to the console
    this.debug = false;

    this.loadAchievements();
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

    /**
     * Retrieves achievements from the server
     */

  }, {
    key: 'retrieveAchievements',
    value: function retrieveAchievements() {
      var _this = this;

      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.ConfigService.isPreview()) {
        var _workgroupId = this.ConfigService.getWorkgroupId();
        this.achievementsByWorkgroupId[_workgroupId] = [];
        return Promise.resolve(this.achievementsByWorkgroupId);
      } else {
        var achievementsURL = this.ConfigService.getAchievementsURL();

        var config = {
          method: "GET",
          url: achievementsURL,
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
          var achievements = response.data;

          if (achievements != null) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = achievements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var achievement = _step.value;

                _this.addOrUpdateAchievement(achievement);

                if (_this.ConfigService.getMode() == 'studentRun') {
                  var _projectAchievement = _this.ProjectService.getAchievementByAchievementId(achievement.achievementId);
                  if (_projectAchievement != null) {

                    /*
                     * set the completed field to true in case we ever
                     * need to easily see which achievements the student
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

            if (_this.ConfigService.getMode() == 'studentRun') {
              /*
               * Loop through all the project achievements and
               * re-evaluate whether the student has completed each.
               * This is to make sure students never get stuck in a
               * state where they did everything required to complete
               * a certain achievement but some error or bug occurred
               * which prevented their student achievement from being
               * saved and then they end up never being able to
               * complete that achievement. We will avoid this
               * situation by re-evaluating all the project
               * achievements each time the student loads the VLE.
               */

              var projectAchievements = _this.ProjectService.getAchievementItems();
              if (projectAchievements != null) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = projectAchievements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var projectAchievement = _step2.value;

                    if (projectAchievement != null) {

                      if (!_this.isAchievementCompleted(projectAchievement.id)) {
                        /*
                         * the student has not completed this project achievement
                         * yet
                         */

                        if (_this.checkAchievement(projectAchievement)) {
                          /*
                           * the student has satisfied everything that is
                           * required of the achievement
                           */
                          _this.studentCompletedAchievement(projectAchievement);
                        }
                      }
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
            }
          } else {
            _this.achievementsByWorkgroupId = {};
          }

          return _this.achievementsByWorkgroupId;
        });
      }
    }

    /**
     * Add Achievement to local bookkeeping
     * @param achievement the Achievement to add or update
     */

  }, {
    key: 'addOrUpdateAchievement',
    value: function addOrUpdateAchievement(achievement) {
      if (achievement != null) {
        var achievementWorkgroupId = achievement.workgroupId;

        /*
         * initialize the workgroup's array of achievements if it does
         * not exist yet
         */
        if (this.achievementsByWorkgroupId[achievementWorkgroupId] == null) {
          this.achievementsByWorkgroupId[achievementWorkgroupId] = new Array();
        }

        var achievements = this.achievementsByWorkgroupId[achievementWorkgroupId];
        var found = false;

        for (var w = 0; w < achievements.length; w++) {
          var a = achievements[w];

          if (a.achievementId != null && a.achievementId === achievement.achievementId && a.workgroupId != null && a.workgroupId === achievement.workgroupId) {
            /*
             * the achievement 10 character alphanumeric id matches and
             * the workgroup id matches so we will update it
             */
            achievements[w] = achievement;
            found = true; // remember this so we don't insert later.
            break;
          }
        }

        if (!found) {
          // we did not find the achievement so we will add it to the array
          achievements.push(achievement);
        }
      }
    }

    /**
     * Saves the achievement for the logged-in user
     * @param achievement
     */

  }, {
    key: 'saveAchievementToServer',
    value: function saveAchievementToServer(achievement) {
      var _this2 = this;

      if (this.ConfigService.isPreview()) {
        // if we're in preview, don't make any request to the server and resolve
        // the promise right away
        var deferred = this.$q.defer();
        deferred.resolve(achievement);
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
          achievementId: achievement.achievementId,
          workgroupId: achievement.workgroupId,
          type: achievement.type
        };

        if (achievement.id != null) {
          params.id = achievement.id;
        }
        if (achievement.data != null) {
          params.data = angular.toJson(achievement.data);
        }

        config.data = $.param(params);

        return this.$http(config).then(function (result) {
          var achievement = result.data;
          if (achievement.data != null) {
            achievement.data = angular.fromJson(achievement.data);
          }
          _this2.addOrUpdateAchievement(achievement);
          return achievement;
        });
      }
    }

    /**
     * Creates a new achievement object
     * @param type type of achievement ["completion", "milestone", etc]
     * @param achievementId id of achievement in project content
     * @param data other extra information about this achievement
     * @param workgroupId id of workgroup whom this achievement is for
     * @returns newly created achievement object
     */

  }, {
    key: 'createNewAchievement',
    value: function createNewAchievement(type, achievementId) {
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

    /**
     * Load the achievements by creating listeners for the appropriate events
     */

  }, {
    key: 'loadAchievements',
    value: function loadAchievements() {
      var projectAchievements = this.ProjectService.getAchievements();
      if (projectAchievements != null) {
        if (projectAchievements.isEnabled) {
          var projectAchievementItems = projectAchievements.items;
          if (projectAchievementItems != null) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = projectAchievementItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var projectAchievement = _step3.value;

                if (projectAchievement != null) {
                  var deregisterFunction = null;

                  // create a listener for the achievement
                  if (projectAchievement.type == 'milestone' || projectAchievement.type == 'completion') {
                    deregisterFunction = this.createNodeCompletedListener(projectAchievement);
                  } else if (projectAchievement.type == 'aggregate') {
                    deregisterFunction = this.createAggregateAchievementListener(projectAchievement);
                  }

                  /*
                   * set the deregisterFunction into the project
                   * achievement so that we can deregister the
                   * listener after the student has completed the
                   * achievement
                   */
                  projectAchievement.deregisterFunction = deregisterFunction;
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
      }
    }

    /**
     * Check if the student has completed the achievement
     * @param achievementId
     * @return whether the student has completed the achievement
     */

  }, {
    key: 'isAchievementCompleted',
    value: function isAchievementCompleted(achievementId) {
      if (achievementId != null) {
        var workgroupId = this.ConfigService.getWorkgroupId();
        var achievements = this.getAchievementsByWorkgroupId(workgroupId);
        if (achievements != null) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = achievements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var achievement = _step4.value;

              if (achievement != null) {
                if (achievement.achievementId == achievementId) {
                  /*
                   * we have found the achievement with the matching
                   * achievement id which means the student has
                   * completed the achievement
                   */
                  return true;
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
      return false;
    }

    /**
     * The student has just completed an achievement
     * @param achievement the achievement the student completed
     */

  }, {
    key: 'studentCompletedAchievement',
    value: function studentCompletedAchievement(achievement) {
      if (achievement != null) {
        if (_achievement.isVisible == true) {
          /*
           * this is a visible achievement so we will display a message
           * to the student
           */
          alert("Congratulations you completed: " + _achievement.name);
          console.log("Congratulations you completed: " + _achievement.name);
        }

        var projectAchievement = this.ProjectService.getAchievementByAchievementId(_achievement.id);
        if (projectAchievement != null && projectAchievement.deregisterFunction != null) {
          /*
           * deregister the achievement listener now that the student has
           * completed the achievement
           */
          projectAchievement.deregisterFunction();
          this.debugOutput('deregistering ' + projectAchievement.id);
        }

        /*
         * create a copy of the achievement to make sure we don't cause
         * any referencing problems in the future
         */
        var _achievement = this.UtilService.makeCopyOfJSONObject(_achievement);

        var workgroupId = this.ConfigService.getWorkgroupId();

        var type = _achievement.type;
        var id = _achievement.id;
        var data = _achievement;
        var newAchievement = this.createNewAchievement(type, id, data, workgroupId);
        var achievements = this.getAchievementsByWorkgroupId(workgroupId);
        achievements.push(newAchievement);

        // save the new achievement to the server
        this.saveAchievementToServer(newAchievement);

        // fire an achievementCompleted event
        this.$rootScope.$broadcast('achievementCompleted', { achievementId: _achievement.id });
      }
    }

    /**
     * Create a listener for the node completed achievement
     * @param achievement the achievement to listen for
     * @return the deregister function for the listener
     */

  }, {
    key: 'createNodeCompletedListener',
    value: function createNodeCompletedListener(achievement) {
      var _this3 = this;

      // save this to a variable so that we can access it in the callback
      var thisAchievementService = this;

      // save the achievement to a variable so that we can access it in the callback
      var thisAchievement = achievement;

      this.debugOutput('registering ' + achievement.id);

      var deregisterFunction = this.$rootScope.$on('nodeCompleted', function (event, args) {
        /*
         * the nodeCompleted event was fired so we will check if this
         * achievement has been completed
         */
        var achievement = thisAchievement;
        if (achievement != null) {
          _this3.debugOutput('createNodeCompletedListener checking ' + achievement.id + ' completed ' + args.nodeId);
          var id = achievement.id;

          if (!_this3.isAchievementCompleted(id)) {
            /*
             * the student has not completed this achievement before
             * so we will now check if they have completed it
             */
            // check if the student has completed this node completed achievement
            var completed = _this3.checkNodeCompletedAchievement(achievement);
            if (completed) {
              thisAchievementService.studentCompletedAchievement(achievement);
            }
          }
        }
      });
      return deregisterFunction;
    }

    /**
     * Check if the student completed a specific achievement
     * @param achievement an achievement
     * @return whether the student completed the achievement
     */

  }, {
    key: 'checkAchievement',
    value: function checkAchievement(achievement) {
      var completed = false;
      if (achievement != null) {
        if (achievement.type == 'milestone' || achievement.type == 'completion') {
          completed = this.checkNodeCompletedAchievement(achievement);
        } else if (achievement.type == 'aggregate') {
          completed = this.checkAggregateAchievement(achievement);
        }
      }
      return completed;
    }

    /**
     * Check if the student completed a node completed achievement
     * @param achievement a node completed achievement
     * @return whether the student completed the node completed achievement
     */

  }, {
    key: 'checkNodeCompletedAchievement',
    value: function checkNodeCompletedAchievement(achievement) {
      var completed = false;
      if (achievement != null) {
        var params = achievement.params;
        if (params != null) {
          var nodeIds = params.nodeIds;
          for (var n = 0; n < nodeIds.length; n++) {
            var nodeId = nodeIds[n];
            if (n == 0) {
              // this is the first node id
              completed = this.StudentDataService.isCompleted(nodeId);
            } else {
              /*
               * this is a node id after the first node id so
               * we will use an and conditional
               */
              completed = completed && this.StudentDataService.isCompleted(nodeId);
            }
          }
        }
      }
      return completed;
    }

    /**
     * Create a listener for an aggregate achievement
     * @param achievement the project achievement
     * @return the deregister function for the listener
     */

  }, {
    key: 'createAggregateAchievementListener',
    value: function createAggregateAchievementListener(achievement) {
      var _this4 = this;

      var thisAchievementService = this;
      var thisAchievement = achievement;
      this.debugOutput('registering ' + achievement.id);
      var deregisterFunction = this.$rootScope.$on('achievementCompleted', function (event, args) {
        /*
         * the achievementCompleted event was fired so we will check if this
         * achievement has been completed
         */
        var achievement = thisAchievement;
        if (achievement != null) {
          _this4.debugOutput('createAggregateAchievementListener checking ' + achievement.id + ' completed ' + args.achievementId);

          var id = achievement.id;
          var achievementId = args.achievementId;

          if (!_this4.isAchievementCompleted(id)) {
            /*
             * the student has not completed this achievement before
             * so we will now check if they have completed it
             */

            var completed = _this4.checkAggregateAchievement(achievement);
            if (completed) {
              thisAchievementService.studentCompletedAchievement(achievement);
            }
          }
        }
      });
      return deregisterFunction;
    }

    /**
     * Check if the student completed a aggregate achievement
     * @param achievement an aggregate achievement
     * @return whether the student completed the aggregate achievement
     */

  }, {
    key: 'checkAggregateAchievement',
    value: function checkAggregateAchievement(achievement) {
      var completed = false;
      if (achievement != null) {
        var params = achievement.params;
        if (params != null) {
          var achievementIds = params.achievementIds;
          for (var a = 0; a < achievementIds.length; a++) {
            var tempAchievementId = achievementIds[a];
            if (a == 0) {
              // this is the first node id
              completed = this.isAchievementCompleted(tempAchievementId);
            } else {
              /*
               * this is a node id after the first node id so
               * we will use an and conditional
               */
              completed = completed && this.isAchievementCompleted(tempAchievementId);
            }
          }
        }
      }
      return completed;
    }

    /**
     * Get achievements for a workgroup id
     * @param workgroupId the workgroup id
     * @return an array of achievements completed by the workgroup
     */

  }, {
    key: 'getAchievementsByWorkgroupId',
    value: function getAchievementsByWorkgroupId() {
      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (workgroupId == null) {
        workgroupId = this.ConfigService.getWorkgroupId();
      }
      if (this.achievementsByWorkgroupId[workgroupId] == null) {
        /*
         * this workgroup does not have an array of achievements yet so we
         * will make it
         */
        this.achievementsByWorkgroupId[workgroupId] = [];
        return this.achievementsByWorkgroupId[workgroupId];
      } else if (this.achievementsByWorkgroupId[workgroupId] != null) {
        return this.achievementsByWorkgroupId[workgroupId];
      }
      return [];
    }

    /**
     * Get an array of student achievements for a given achievement id
     * @param achievementId a 10 character achievement id
     * @return an array of student achievements. student achievements are
     * created when a workgroup completes an achievement.
     */

  }, {
    key: 'getAchievementsByAchievementId',
    value: function getAchievementsByAchievementId(achievementId) {
      var achievementsByAchievementId = [];
      if (achievementId != null) {
        var workgroupIds = this.ConfigService.getClassmateWorkgroupIds();
        if (workgroupIds != null) {
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = workgroupIds[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var workgroupId = _step5.value;

              if (workgroupId != null) {
                var achievementsForWorkgroup = this.achievementsByWorkgroupId[workgroupId];
                if (achievementsForWorkgroup != null) {
                  for (var a = achievementsForWorkgroup.length - 1; a >= 0; a--) {
                    var achievement = achievementsForWorkgroup[a];
                    if (achievement != null && achievement.data != null) {
                      if (achievementId == achievement.data.id) {
                        /*
                         * the workgroup has completed the achievement we are
                         * looking for
                         */
                        achievementsByAchievementId.push(achievement);
                      }
                    }
                  }
                }
              }
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
      return achievementsByAchievementId;
    }

    /**
     * Get a mapping from achievement id to array of student achievements
     * @param achievementId the achievement id
     * @return a mapping from achievement id to array of student achievements
     * student achievements are created when a workgroup completes an achievement.
     */

  }, {
    key: 'getAchievementIdToAchievementsMappings',
    value: function getAchievementIdToAchievementsMappings(achievementId) {
      var achievementIdToAchievements = {};
      var projectAchievements = this.ProjectService.getAchievementItems();
      if (projectAchievements != null) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = projectAchievements[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var projectAchievement = _step6.value;

            if (projectAchievement != null) {
              var studentAchievements = this.getAchievementsByAchievementId(projectAchievement.id);
              achievementIdToAchievements[projectAchievement.id] = studentAchievements;
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
      }
      return achievementIdToAchievements;
    }

    /**
     * Get an available achievement id
     * @return an achievement id that isn't being used
     */

  }, {
    key: 'getAvailableAchievementId',
    value: function getAvailableAchievementId() {
      var id = null;
      while (id == null) {
        // generate a 10 character id
        id = this.UtilService.generateKey(10);

        // check to make sure the id isn't already being used
        var achievements = this.ProjectService.getAchievementItems();

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = achievements[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var achievement = _step7.value;

            if (achievement != null) {
              if (id == achievement.id) {
                /*
                 * the id is already being used so we need to find
                 * a different one
                 */
                id = null;
                break;
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
      return id;
    }
  }]);

  return AchievementService;
}();

AchievementService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = AchievementService;
//# sourceMappingURL=achievementService.js.map
