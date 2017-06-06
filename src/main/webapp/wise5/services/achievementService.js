"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AchievementService = function () {
    function AchievementService($http, $q, $rootScope, ConfigService, ProjectService, UtilService) {
        _classCallCheck(this, AchievementService);

        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.achievementsByWorkgroupId = {}; // an object of achievements, where key is workgroupId and value is the array of achievements for the workgroup.
    }

    /**
     * Retrieves achievements from the server
     */


    _createClass(AchievementService, [{
        key: "retrieveAchievements",
        value: function retrieveAchievements() {
            var _this = this;

            var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


            if (this.ConfigService.isPreview()) {
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
                            _this.addOrUpdateAchievement(achievement);
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
        key: "addOrUpdateAchievement",
        value: function addOrUpdateAchievement(achievement) {
            var achievementWorkgroupId = achievement.workgroupId;
            if (this.achievementsByWorkgroupId[achievementWorkgroupId] == null) {
                this.achievementsByWorkgroupId[achievementWorkgroupId] = new Array();
            }
            var found = false;
            for (var w = 0; w < this.achievementsByWorkgroupId[achievementWorkgroupId].length; w++) {
                var a = this.achievementsByWorkgroupId[achievementWorkgroupId][w];
                if (a.id != null && a.id === achievement.id) {
                    // found the same achievement id, so just update it in place.
                    this.achievementsByWorkgroupId[achievementWorkgroupId][w] = achievement;
                    found = true; // remember this so we don't insert later.
                    break;
                }
            }
            if (!found) {
                this.achievementsByWorkgroupId[achievementWorkgroupId].push(achievement);
            }
        }

        /**
         * Saves the achievement for the logged-in user
         * @param achievement
         */

    }, {
        key: "saveAchievementToServer",
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
        key: "createNewAchievement",
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
    }]);

    return AchievementService;
}();

AchievementService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = AchievementService;
//# sourceMappingURL=achievementService.js.map