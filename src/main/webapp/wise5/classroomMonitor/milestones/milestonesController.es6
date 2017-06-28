'use strict';

class MilestonesController {

    constructor($injector,
                $filter,
                $mdDialog,
                $rootScope,
                $scope,
                $state,
                AchievementService,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService,
                UtilService,
                moment) {

        this.$injector = $injector;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.AchievementService = AchievementService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.UtilService = UtilService;
        this.moment = moment;

        this.$translate = this.$filter('translate');

        /*
         * Arrays used to temporarily store milestone display values. We add
         * fields to the milestone objects but we don't want to save those
         * fields when we save the milestones to the server. We remove the
         * fields from the milestones and then save the milestones to the
         * server. After we save the milestones, we add the fields back into
         * the milestones.
         */
        this.calendarIsOpenTemporaryStorage = [];
        this.itemsTemporaryStorage = [];
        this.workgroupsStorage = [];
        this.editStorage = [];
        this.numberOfStudentsCompletedStorage = [];
        this.percentageCompletedStorage = [];
        this.showStudentsStorage = [];
        this.timeDiffStorage = [];

        this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
        this.setWorkgroupsInCurrentPeriod();

        // load the achievements and perform additional calculations
        this.loadAchievements();

        // listen for the newStudentAchievement event
        this.$rootScope.$on('newStudentAchievement', (event, args) => {

            if (args) {
                // get the student achievement that was saved to the server
                let studentAchievement = args.studentAchievement;

                if (studentAchievement != null) {

                    // add the student achievement to our local copy of the student achievements
                    this.AchievementService.addOrUpdateAchievement(studentAchievement);

                    if (studentAchievement.data != null && studentAchievement.data.id != null) {
                        // update the milestone in the UI with the new student achievement information
                        this.updateMilestoneCompletion(studentAchievement.data.id);
                    }
                }
            }
        });

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            this.periodId = args.currentPeriod.periodId;

            // update the completion status for all the project achievements
            for (let i = 0; i < this.achievements.length; i++) {
                this.setWorkgroupsInCurrentPeriod();
                this.updateMilestoneCompletion(this.achievements[i].id);
            }
        });
    }

    /**
     * Load the achievements and perform additional calculations
     */
    loadAchievements() {

        // get the project achievements object
        var achievementsObject = this.ProjectService.getAchievements();

        if (achievementsObject != null) {

            if (achievementsObject.isEnabled) {

                if (achievementsObject.items) {

                    // get the project achievements
                    this.achievements = achievementsObject.items;

                    // loop through all the project achievements
                    for (var a = 0; a < this.achievements.length; a++) {

                        // get a project achievement
                        var projectAchievement = this.achievements[a];

                        if (projectAchievement != null) {

                            // update the student completion information for this milestone
                            this.updateMilestoneCompletion(projectAchievement.id);

                            // get all the activities and steps in the project
                            projectAchievement.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);

                            if (projectAchievement.params != null && projectAchievement.params.nodeIds != null) {

                                /*
                                 * loop through all the node ids that are required
                                 * to be completed for this achievement
                                 */
                                for (var n = 0; n < projectAchievement.params.nodeIds.length; n++) {
                                    var nodeId = projectAchievement.params.nodeIds[n];

                                    if (projectAchievement.items[nodeId] != null) {
                                        // check the checkbox corresponding to the node id
                                        projectAchievement.items[nodeId].checked = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Check if the given milestone date is before the current day (and
     * milestone completion is less than 100%)
     * @param date a date string or object
     * @param percentageCompleted Number percent completed
     * @return Boolean whether given date is before today
     */
    isBeforeDay(date, percentageCompleted) {
        let result = false;

        if (date && percentageCompleted < 100) {
            result = this.moment(date).isBefore(this.moment(), 'day');
        }

        return result;
    }

    /**
     * Check if the given milestone date is the same as the current day (and
     * milestone completion is less than 100%)
     * @param date a date string or object
     * @param percentageCompleted Number percent completed
     * @return Boolean whether given date is before today
     */
    isSameDay(date, percentageCompleted) {
        let result = false;

        if (date && percentageCompleted < 100) {
            result = this.moment(date).isSame(this.moment(), 'day');
        }

        return result;
    }

    /**
     * Create a new milestone
     * @return a milestone object
     */
    createMilestone() {
        let milestone = null;

        // get the project achievements
        let projectAchievements = this.ProjectService.getAchievementItems();

        if (projectAchievements != null) {

            // get the time of tomorrow at 3pm
            let tomorrow = this.moment().add('days', 1).hours(23).minutes(11).seconds(59);

            // create a new milestone object
            milestone = {
                id: this.AchievementService.getAvailableAchievementId(),
                name: '',
                description: '',
                type: "milestone",
                params: {
                    nodeIds: [],
                    targetDate: tomorrow.valueOf()
                },
                icon: {
                    image: ""
                },
                items: this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder),
                isVisible: true
            };
        }

        return milestone;
    }

    /**
     * Delete a milestone
     * @param milestone the milestone to delete
     */
    deleteMilestone(milestone, $event) {

        if (milestone) {
            let title = milestone.name;
            let label = this.$translate('DELETE_MILESTONE');
            let msg = this.$translate('DELETE_MILESTONE_CONFIRM', { name: milestone.name });
            let yes = this.$translate('YES');
            let cancel = this.$translate('CANCEL')

            let confirm = this.$mdDialog.confirm()
                .title(title)
                .textContent(msg)
                .ariaLabel(label)
                .targetEvent($event)
                .ok(yes)
                .cancel(cancel);

            this.$mdDialog.show(confirm).then(() => {
                let achievements = this.achievements;
                let index = -1;

                // find the matching achievement index
                for (let i = 0; i < achievements.length; i++) {
                    if (achievements[i].id === milestone.id) {
                        index = i;
                        break;
                    }
                }

                if (index > -1) {
                    // remove the milestone
                    this.achievements.splice(index, 1);

                    // save the project to the server
                    this.saveProject();
                }
            }, () => {
            });
        }
    }

    saveMilestone(milestone) {
        let index = -1;

        for (let i = 0; i < this.achievements.length; i++) {
            let achievementId = this.achievements[i].id;

            if (milestone.id === achievementId) {
                index = i;
                this.achievements[i] = milestone;
                break;
            }
        }

        if (index < 0) {
            // get the project achievements
            let projectAchievements = this.ProjectService.getAchievementItems();

            if (projectAchievements && milestone) {

                // add the milestone object to the array of achievements
                projectAchievements.push(milestone);
            }
        }

        // save the project
        this.saveProject();

        // reload the achievements
        this.loadAchievements();
    }

    /**
     * Remove the temporary fields from the milestone objects and store
     * them in temporary storage arrays so that we can load the fields back
     * in later
     */
    clearTempFields() {

        /*
         * these array will store the temporary fields. the index of the arrays
         * corresponds to the index of the achievement. for example the percentageCompletedStorage
         * value for the first achievement will be stored in
         * this.percentageCompletedStorage[0]. the percentageCompletedStorage value for the second
         * achievement will be stored in this.percentageCompletedStorage[1].
         */
        this.itemsTemporaryStorage = [];
        this.workgroupsStorage = [];
        this.numberOfStudentsCompletedStorage = [];
        this.percentageCompletedStorage = [];

        // loop through all the achievements
        for (var a = 0; a < this.achievements.length; a++) {

            // get an achievement
            var achievement = this.achievements[a];

            // save the field values in the temprary storage arrays
            this.workgroupsStorage.push(achievement.workgroups);
            this.numberOfStudentsCompletedStorage.push(achievement.numberOfStudentsCompleted);
            this.percentageCompletedStorage.push(achievement.percentageCompleted);

            // delete the field from the achievement
            delete achievement.items;
            delete achievement.workgroups;
            delete achievement.numberOfStudentsCompleted;
            delete achievement.percentageCompleted;
        }
    }

    /**
     * Restore the temporary fields into the achievement objects
     */
    restoreTempFields() {

        // loop through all the achievements
        for (var a = 0; a < this.achievements.length; a++) {

            // get an achievement
            var achievement = this.achievements[a];

            // set the fields back into the achievement object
            achievement.items = this.itemsTemporaryStorage[a];
            achievement.workgroups = this.workgroupsStorage[a];
            achievement.numberOfStudentsCompleted = this.numberOfStudentsCompletedStorage[a];
            achievement.percentageCompleted = this.percentageCompletedStorage[a];
        }

        // clear the temporary storage arrays
        this.itemsTemporaryStorage = [];
        this.workgroupsStorage = [];
        this.numberOfStudentsCompletedStorage = [];
        this.percentageCompletedStorage = [];
    }

    /**
     * Save the project to the server
     */
    saveProject() {

        // clear the temp fields and remember them
        this.clearTempFields();

        // save the project to the server
        this.ProjectService.saveProject();

        // restore the temp fields
        this.restoreTempFields();
    }

    /**
     * Get the user names for a workgroup id
     * @param workgroupId the workgroup id
     * @return the user names in the workgroup
     */
    getDisplayUserNamesByWorkgroupId(workgroupId) {
        return this.ConfigService.getDisplayUserNamesByWorkgroupId(workgroupId);
    }

    setWorkgroupsInCurrentPeriod() {
        // get the workgroup ids
        let workgroupIdsInRun = this.ConfigService.getClassmateWorkgroupIds();
        this.workgroupIds = [];

        // filter out workgroups not in the current period
        for (let i = 0; i < workgroupIdsInRun.length; i++) {
            let currentId = workgroupIdsInRun[i];
            let currentPeriodId = this.ConfigService.getPeriodIdByWorkgroupId(currentId);

            if (this.periodId === -1 || currentPeriodId === this.periodId) {
                this.workgroupIds.push(currentId);
            }
        }

        // the number of students in the run
        this.numberOfStudentsInRun = this.workgroupIds.length;
    }

    /**
     * Update the student completion information for this milestone
     * @param achievementId the achievement id to update
     */
    updateMilestoneCompletion(achievementId) {
        if (achievementId != null) {

            // loop through all the project achievements
            for (var a = 0; a < this.achievements.length; a++) {
                var projectAchievement = this.achievements[a];

                if (achievementId == projectAchievement.id) {
                    // we have found the milestone we want to update

                    // get the student achievements
                    var achievementIdToAchievements = this.AchievementService.getAchievementIdToAchievementsMappings();

                    // get the student achievements for this achievement id
                    var studentAchievementsForAchievementId = achievementIdToAchievements[projectAchievement.id];

                    var workgroupIdsCompleted = [];
                    var achievementTimes = [];
                    var workgroupIdsNotCompleted = [];

                    /*
                     * loop through all the student achievements for
                     * this achievement id
                     */
                    for (var s = 0; s < studentAchievementsForAchievementId.length; s++) {
                        var studentAchievement = studentAchievementsForAchievementId[s];

                        if (studentAchievement != null) {
                            let currentWorkgroupId = studentAchievement.workgroupId;

                            // check if workgroup is in current period
                            if (this.workgroupIds.indexOf(currentWorkgroupId) > -1) {
                                /*
                                 * add the workgroup id to the array of workgroup ids that
                                 * have completed the achievement
                                 */
                                workgroupIdsCompleted.push(currentWorkgroupId);

                                // add the achievement time to the achievement times array
                                achievementTimes.push(studentAchievement.achievementTime);
                            }
                        }
                    }

                    /*
                     * loop through all the workgroup ids to find the
                     * workgroup ids that have not completed the
                     * achievement
                     */
                     for (var w = 0; w < this.workgroupIds.length; w++) {
                        var workgroupId = this.workgroupIds[w];
                        if (workgroupIdsCompleted.indexOf(workgroupId) == -1) {
                            // this workgroup has not completed the achievement

                            /*
                             * add the workgroup id to the array of workgroup ids that
                             * have not completed the achievement
                             */
                            workgroupIdsNotCompleted.push(workgroupId);
                        }
                    }

                    projectAchievement.workgroups = [];

                    /*
                     * loop through all the workgroups that have
                     * completed the achievement
                     */
                    for (var c = 0; c < workgroupIdsCompleted.length; c++) {
                        var workgroupId = workgroupIdsCompleted[c];
                        var achievementTime = achievementTimes[c];

                        /*
                         * create an object used for displaying
                         * information about the workgroup
                         */
                        var workgroupObject = {
                            workgroupId: workgroupId,
                            displayNames: this.getDisplayUserNamesByWorkgroupId(workgroupId),
                            achievementTime: achievementTime,
                            completed: true
                        };

                        projectAchievement.workgroups.push(workgroupObject);
                    }

                    /*
                     * loop through all the workgroups that have not
                     * completed the achievement
                     */
                    for (var n = 0; n < workgroupIdsNotCompleted.length; n++) {
                        var workgroupId = workgroupIdsNotCompleted[n];

                        /*
                         * create an object used for displaying
                         * information about the workgroup
                         */
                        var workgroupObject = {
                            workgroupId: workgroupId,
                            displayNames: this.getDisplayUserNamesByWorkgroupId(workgroupId),
                            achievementTime: null,
                            completed: false
                        };

                        projectAchievement.workgroups.push(workgroupObject);
                    }

                    /*
                     * calculate the number of workgroups that completed
                     * the achievement
                     */
                    projectAchievement.numberOfStudentsCompleted = workgroupIdsCompleted.length;

                    /*
                     * calculate the percentage of workgroups that have
                     * completed the achievement
                     */
                    projectAchievement.percentageCompleted = parseInt(100 * projectAchievement.numberOfStudentsCompleted / this.numberOfStudentsInRun);
                }
            }
        }
    }

    /**
     * Open a dialog with the milestone details (list with workgroups statuses
     * for the given milestone)
     * @param milestone the milestone object to show
     * @param $event the event that triggered the function call
     */
    showMilestoneDetails(milestone, $event) {
        let title = this.$translate('MILESTONE_DETAILS_TITLE', { name: milestone.name });
        let template =
            `<md-dialog class="dialog--wide">
                <md-toolbar>
                    <div class="md-toolbar-tools">
                        <h2>${ title }</h2>
                    </div>
                </md-toolbar>
                <md-dialog-content class="gray-lighter-bg md-dialog-content">
                    <milestone-details milestone="milestone" on-show-workgroup="onShowWorkgroup(value)"></milestone-details>
                </md-dialog-content>
                <md-dialog-actions layout="row" layout-align="start center">
                    <md-button class="warn"
                               ng-click="delete()"
                               aria-label="{{ 'DELETE' | translate }}">
                        {{ 'DELETE' | translate }}
                    </md-button>
                    <span flex></span>
                    <md-button class="md-primary"
                               ng-click="edit()"
                               aria-label="{{ 'EDIT' | translate }}">
                        {{ 'EDIT' | translate }}
                    </md-button>
                    <md-button class="md-primary"
                               ng-click="close()"
                               aria-label="{{ 'CLOSE' | translate }}">
                            {{ 'CLOSE' | translate }}
                        </md-button>
                    </md-dialog-actions>
            </md-dialog>`;

        // display the milestone details in a dialog
        this.$mdDialog.show({
            parent: angular.element(document.body),
            template: template,
            ariaLabel: title,
            fullscreen: true,
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            locals: {
                $event, $event,
                milestone: milestone
            },
            controller: ['$scope', '$state', '$mdDialog', 'milestone', '$event', 'TeacherDataService',
                function DialogController($scope, $state, $mdDialog, milestone, $event, TeacherDataService) {
                    $scope.milestone = milestone;
                    $scope.event = $event;

                    // close the popup
                    $scope.close = function() {
                        $mdDialog.hide();
                    }

                    // edit the milestone
                    $scope.edit = function() {
                        $mdDialog.hide({ milestone: $scope.milestone, action: 'edit', $event: $event });
                    }

                    // delete the milestone
                    $scope.delete = function() {
                        $mdDialog.hide({ milestone: $scope.milestone, action: 'delete' });
                    }

                    $scope.onShowWorkgroup = function(workgroup) {
                        $mdDialog.hide();
                        TeacherDataService.setCurrentWorkgroup(workgroup);
                        $state.go('root.nodeProgress');
                    }
                }
            ]
        }).then((data) => {
            if (data && data.action && data.milestone) {
                if (data.action === 'edit') {
                    let milestone = angular.copy(data.milestone);
                    this.editMilestone(milestone, data.$event);
                } else if (data.action === 'delete') {
                    this.deleteMilestone(data.milestone);
                }
            }
        }, () => {});;
    }

    /**
     * Open a dialog to edit milestone details (or create a new one)
     * @param milestone the milestone object to show
     * @param $event the event that triggered the function call
     */
    editMilestone(milestone, $event) {
        let editMode = milestone ? true : false;
        let title = editMode ? this.$translate('EDIT_MILESTONE') : this.$translate('ADD_MILESTONE');

        if (!editMode) {
            milestone = this.createMilestone();
        }

        let template =
            `<md-dialog class="dialog--wide">
                <md-toolbar>
                    <div class="md-toolbar-tools">
                        <h2>${ title }</h2>
                    </div>
                </md-toolbar>
                <md-dialog-content class="gray-lighter-bg md-dialog-content">
                    <milestone-edit milestone="milestone" on-change="onChange(milestone, valid)"></milestone-edit>
                </md-dialog-content>
                <md-dialog-actions layout="row" layout-align="end center">
                    <md-button ng-click="close()"
                               aria-label="{{ 'CANCEL' | translate }}">
                        {{ 'CANCEL' | translate }}
                    </md-button>
                    <md-button class="md-primary"
                               ng-click="save()"
                               aria-label="{{ 'SAVE' | translate }}">
                            {{ 'SAVE' | translate }}
                        </md-button>
                    </md-dialog-actions>
            </md-dialog>`;

        // display the milestone edit form in a dialog
        this.$mdDialog.show({
            parent: angular.element(document.body),
            template: template,
            ariaLabel: title,
            fullscreen: true,
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            locals: {
                editMode: editMode,
                $event, $event,
                milestone: milestone
            },
            controller: ['$scope', '$mdDialog', '$filter', 'milestone', 'editMode', '$event',
                function DialogController($scope, $mdDialog, $filter, milestone, editMode, $event) {
                    $scope.editMode = editMode;
                    $scope.milestone = milestone;
                    $scope.$event = $event;
                    $scope.valid = editMode;

                    $scope.$translate = $filter('translate');

                    // close the popup
                    $scope.close = function() {
                        $mdDialog.hide({ milestone: $scope.milestone, $event: $scope.$event });
                    }

                    // save the milestone
                    $scope.save = function() {
                        if ($scope.valid) {
                            $mdDialog.hide({ milestone: $scope.milestone, save: true, $event: $scope.$event });
                        } else {
                            alert($scope.$translate('MILESTONE_EDIT_INVALID_ALERT'));
                        }
                    }

                    $scope.onChange = function(milestone, valid) {
                        $scope.milestone = milestone;
                        $scope.valid = valid;
                    }
                }
            ]
        }).then((data) => {
            if (data) {
                if (data.milestone && data.save) {
                    this.saveMilestone(data.milestone);
                }
            }
        }, () => {});
    }
}

MilestonesController.$inject = [
    '$injector',
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    'AchievementService',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService',
    'UtilService',
    'moment'
];

export default MilestonesController;
