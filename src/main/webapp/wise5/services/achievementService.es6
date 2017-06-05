class AchievementService {
    constructor($http, $q, $rootScope, ConfigService, ProjectService, UtilService) {

        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.achievementsByWorkgroupId = {};  // an object of achievements, where key is workgroupId and value is the array of achievements for the workgroup.
    }

    /**
     * Retrieves achievements from the server
     */
    retrieveAchievements(workgroupId = null, type = null) {

        if (this.ConfigService.isPreview()) {
            return Promise.resolve(this.achievementsByWorkgroupId);
        } else {
            let achievementsURL = this.ConfigService.getAchievementsURL();

            let config = {
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

            return this.$http(config).then((response) => {
                let achievements = response.data;

                if (achievements != null) {
                    for (let i = 0; i < achievements.length; i++) {
                        let achievement = achievements[i];
                        this.addOrUpdateAchievement(achievement);
                    }
                } else {
                    this.achievementsByWorkgroupId = {};
                }

                return this.achievementsByWorkgroupId;
            });
        }
    }

    /**
     * Add Achievement to local bookkeeping
     * @param achievement the Achievement to add or update
     */
    addOrUpdateAchievement(achievement) {
        let achievementWorkgroupId = achievement.workgroupId;
        if (this.achievementsByWorkgroupId[achievementWorkgroupId] == null) {
            this.achievementsByWorkgroupId[achievementWorkgroupId] = new Array();
        }
        let found = false;
        for (let w = 0; w < this.achievementsByWorkgroupId[achievementWorkgroupId].length; w++) {
            let a = this.achievementsByWorkgroupId[achievementWorkgroupId][w];
            if (a.id != null && a.id === achievement.id) {
                // found the same achievement id, so just update it in place.
                this.achievementsByWorkgroupId[achievementWorkgroupId][w] = achievement;
                found = true;  // remember this so we don't insert later.
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
    saveAchievementToServer(achievement) {

        if (this.ConfigService.isPreview()) {
            // if we're in preview, don't make any request to the server but pretend that we did
            let deferred = this.$q.defer();
            deferred.resolve(achievement);
            return deferred.promise;

        } else {

            let config = {
                method: "POST",
                url: this.ConfigService.getAchievementsURL(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            let params = {
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

            return this.$http(config).then((result) => {
                let achievement = result.data;
                if (achievement.data != null) {
                    // parse the data string into a JSON object
                    achievement.data = angular.fromJson(achievement.data);
                }
                this.addOrUpdateAchievement(achievement);
                return achievement;
            })
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
    createNewAchievement(type, achievementId, data = null, workgroupId = null) {
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
}

AchievementService.$inject = [
    '$http',
    '$q',
    '$rootScope',
    'ConfigService',
    'ProjectService',
    'UtilService'
];

export default AchievementService;
