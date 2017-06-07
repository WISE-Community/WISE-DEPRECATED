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

        // load the achievements in the project
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

                // get the signed in workgroup id
                var workgroupId = this.ConfigService.getWorkgroupId();

                // initialize the achievements for the workgroup to an empty array
                this.achievementsByWorkgroupId[workgroupId] = [];

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
                    // get the achievements for the logged-in workgroup
                    config.params.workgroupId = this.ConfigService.getWorkgroupId();
                    config.params.periodId = this.ConfigService.getPeriodId();
                }
                if (type != null) {
                    config.params.type = type;
                }

                return this.$http(config).then(function (response) {
                    var achievements = response.data;

                    if (achievements != null) {
                        for (var i = 0; i < achievements.length; i++) {
                            var achievement = achievements[i];

                            // add the student achievement to our local data structure
                            _this.addOrUpdateAchievement(achievement);

                            // get the project achievement object
                            var projectAchievement = _this.ProjectService.getAchievementByAchievementId(achievement.achievementId);

                            if (projectAchievement != null) {

                                /*
                                 * set the completed field to true in case we ever
                                 * need to easily see which achievements the student
                                 * has completed
                                 */
                                projectAchievement.completed = true;

                                if (projectAchievement.deregisterFunction != null) {
                                    /*
                                     * the student has completed this achievement
                                     * so we no longer need to listen for it
                                     */
                                    projectAchievement.deregisterFunction();
                                    _this.debugOutput('deregistering ' + projectAchievement.id);
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

                // get the workgroup id
                var achievementWorkgroupId = achievement.workgroupId;

                /*
                 * initialize the workgroup's array of achievements if it does
                 * not exist yet
                 */
                if (this.achievementsByWorkgroupId[achievementWorkgroupId] == null) {
                    this.achievementsByWorkgroupId[achievementWorkgroupId] = new Array();
                }

                // get the achievements the workgroup has completed
                var achievements = this.achievementsByWorkgroupId[achievementWorkgroupId];

                var found = false;

                // loop through all the achievements this workgroup has completed
                for (var w = 0; w < achievements.length; w++) {

                    // get an achievement the workgroup has compeleted
                    var a = achievements[w];

                    if (a.id != null && a.id === achievement.id) {
                        /*
                         * the achievement auto increment integer id matches so we
                         * will update it
                         */
                        achievements[w] = achievement;
                        found = true; // remember this so we don't insert later.
                        break;
                    } else if (a.achievementId != null && a.achievementId === achievement.achievementId && a.workgroupId != null && a.workgroupId === achievement.workgroupId) {
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
                // if we're in preview, don't make any request to the server but pretend that we did
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
                        // parse the data string into a JSON object
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

                    // get all the achievements in the project
                    var projectAchievementItems = projectAchievements.items;

                    if (projectAchievementItems != null) {

                        // loop through all the achievements in the project
                        for (var a = 0; a < projectAchievementItems.length; a++) {

                            var projectAchievement = projectAchievementItems[a];

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

                // get the student workgroup id
                var workgroupId = this.ConfigService.getWorkgroupId();

                // get all the achievements the student has completed
                var achievements = this.getAchievementsByWorkgroupId(workgroupId);

                if (achievements != null) {

                    // loop through all the achievements the student has completed
                    for (var a = 0; a < achievements.length; a++) {
                        var achievement = achievements[a];

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

                if (achievement.isVisible == true) {
                    /*
                     * this is a visible achievement so we will display a message
                     * to the student
                     */
                    alert("Congratulations you completed: " + achievement.name);
                    console.log("Congratulations you completed: " + achievement.name);
                }

                // get the project achievement object
                var projectAchievement = this.ProjectService.getAchievementByAchievementId(achievement.id);

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
                var achievement = this.UtilService.makeCopyOfJSONObject(achievement);

                // get the student workgroup id
                var workgroupId = this.ConfigService.getWorkgroupId();

                // get the parameters for creating an achievement
                var type = achievement.type;
                var id = achievement.id;
                var data = achievement;

                // create the student achievement
                var newAchievement = this.createNewAchievement(type, id, data, workgroupId);

                // get all the achievements the student has completed
                var achievements = this.getAchievementsByWorkgroupId(workgroupId);

                // add the achievement to the array of student completed achievements
                achievements.push(newAchievement);

                // save the new achievement to the server
                this.saveAchievementToServer(newAchievement);

                // fire an achievementCompleted event
                this.$rootScope.$broadcast('achievementCompleted', { achievementId: achievement.id });
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

            // listen for the nodeCompleted event
            var deregisterFunction = this.$rootScope.$on('nodeCompleted', function (event, args) {
                /*
                 * the nodeCompleted event was fired so we will check if this
                 * achievement has been completed
                 */

                var achievement = thisAchievement;

                if (achievement != null) {
                    _this3.debugOutput('createNodeCompletedListener checking ' + achievement.id + ' completed ' + args.nodeId);

                    // get the id of the achievement we need to check
                    var id = achievement.id;

                    if (!_this3.isAchievementCompleted(id)) {
                        /*
                         * the student has not completed this achievement yet
                         * so we will now check if they have completed it
                         */
                        var params = achievement.params;

                        if (params != null) {

                            // get the node ids that need to be completed
                            var nodeIds = params.nodeIds;

                            var completed = false;

                            /*
                             * loop through all the node ids that need to be completed
                             * for the achievement
                             */
                            for (var n = 0; n < nodeIds.length; n++) {
                                var nodeId = nodeIds[n];

                                if (n == 0) {
                                    // this is the first node id
                                    completed = _this3.StudentDataService.isCompleted(nodeId);
                                } else {
                                    /*
                                     * this is a node id after the first node id so
                                     * we will use an and conditional
                                     */
                                    completed = completed && _this3.StudentDataService.isCompleted(nodeId);
                                }
                            }

                            if (completed) {
                                // the student has just completed the achievement
                                thisAchievementService.studentCompletedAchievement(achievement);
                            }
                        }
                    }
                }
            });

            return deregisterFunction;
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

            // listen for the achievementCompleted event
            var deregisterFunction = this.$rootScope.$on('achievementCompleted', function (event, args) {
                /*
                 * the achievementCompleted event was fired so we will check if this
                 * achievement has been completed
                 */

                var achievement = thisAchievement;

                if (achievement != null) {
                    _this4.debugOutput('createAggregateAchievementListener checking ' + achievement.id + ' completed ' + args.achievementId);

                    // get the id of the achievement we need to check
                    var id = achievement.id;

                    // the achievement that was just completed
                    var achievementId = args.achievementId;

                    if (!_this4.isAchievementCompleted(id)) {
                        /*
                         * the student has not completed this achievement yet
                         * so we will now check if they have completed it
                         */

                        var params = achievement.params;

                        if (params != null) {

                            // get the achievement ids that need to be completed
                            var achievementIds = params.achievementIds;

                            var completed = false;

                            /*
                             * loop through all the achievement ids that need to be
                             * compeleted
                             */
                            for (var a = 0; a < achievementIds.length; a++) {
                                var tempAchievementId = achievementIds[a];

                                if (a == 0) {
                                    // this is the first node id
                                    completed = thisAchievementService.isAchievementCompleted(tempAchievementId);
                                } else {
                                    /*
                                     * this is a node id after the first node id so
                                     * we will use an and conditional
                                     */
                                    completed = completed && thisAchievementService.isAchievementCompleted(tempAchievementId);
                                }
                            }

                            if (completed) {
                                // the student has just completed the achievement
                                thisAchievementService.studentCompletedAchievement(achievement);
                            }
                        }
                    }
                }
            });

            return deregisterFunction;
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


            var achievements = [];

            if (workgroupId == null) {
                // get the signed in workgroup id
                workgroupId = this.ConfigService.getWorkgroupId();
            }

            if (this.achievementsByWorkgroupId[workgroupId] == null) {
                /*
                 * this workgroup does not have an array of achievements yet so we
                 * will make it
                 */
                this.achievementsByWorkgroupId[workgroupId] = [];
                achievements = this.achievementsByWorkgroupId[workgroupId];
            } else if (this.achievementsByWorkgroupId[workgroupId] != null) {
                // this workgroup has an array of achievements
                achievements = this.achievementsByWorkgroupId[workgroupId];
            }

            return achievements;
        }
    }]);

    return AchievementService;
}();

AchievementService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = AchievementService;
//# sourceMappingURL=achievementService.js.map