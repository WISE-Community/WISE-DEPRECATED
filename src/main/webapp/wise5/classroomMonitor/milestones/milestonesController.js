'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MilestonesController = function () {
    function MilestonesController($injector, $rootScope, $scope, $state, AchievementService, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService, UtilService, moment) {
        var _this = this;

        _classCallCheck(this, MilestonesController);

        this.$injector = $injector;
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

        // load the achievements and perform additional calculations
        this.loadAchievements();

        // listen for the newStudentAchievement event
        this.$rootScope.$on('newStudentAchievement', function (event, args) {

            if (args) {
                // get the student achievement that was saved to the server
                var studentAchievement = args.studentAchievement;

                if (studentAchievement != null) {

                    // add the student achievement to our local copy of the student achievements
                    _this.AchievementService.addOrUpdateAchievement(studentAchievement);

                    if (studentAchievement.data != null && studentAchievement.data.id != null) {
                        // update the milestone in the UI with the new student achievement information
                        _this.updateMilestoneCompletion(studentAchievement.data.id);
                    }
                }
            }
        });
    }

    /**
     * Load the achievements and perform additional calculations
     */


    _createClass(MilestonesController, [{
        key: 'loadAchievements',
        value: function loadAchievements() {

            // get the project achievements object
            var achievementsObject = this.ProjectService.getAchievements();

            // get the workgroup ids
            var workgroupIds = this.ConfigService.getClassmateWorkgroupIds();

            // the number of students in the run
            this.numberOfStudentsInRun = workgroupIds.length;

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

                                // calculate the target date as a Date() object
                                projectAchievement.params.targetDateTemp = new Date(projectAchievement.params.targetDate);

                                /*
                                 * calculate the time difference between now and the
                                 * target date
                                 */
                                var timeDiff = this.calculateTimeDiff(projectAchievement.params.targetDate);

                                projectAchievement.timeDiff = timeDiff;

                                if (projectAchievement.edit === null || projectAchievement.edit === undefined) {
                                    // initialize the edit field
                                    projectAchievement.edit = false;
                                }

                                if (projectAchievement.calendarIsOpen === null || projectAchievement.calendarIsOpen === undefined) {
                                    // initialize the calendarIsOpen field
                                    projectAchievement.calendarIsOpen = false;
                                }

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
         * Calculate the time difference between now and the date
         * @param date a date in milliseconds since the epoch
         * @return a string that contains a human readable time difference
         * example "2 days ago", or "in 3 days"
         */

    }, {
        key: 'calculateTimeDiff',
        value: function calculateTimeDiff(date) {

            // get the time difference from now
            var timeDiff = this.moment(date).fromNow();

            /*
             * there seems to be a bug in moment where if the date is in the future
             * the timeDiff will be something like "in 3 days ago" when it should
             * only be "in 3 days". if the timeDiff string starts with "in", we will
             * remove the " ago" from the end of the string
             */
            if (timeDiff.indexOf("in") != -1) {
                timeDiff = timeDiff.replace(" ago", "");
            }

            return timeDiff;
        }

        /**
         * Create a new milestone
         */

    }, {
        key: 'createMilestone',
        value: function createMilestone() {

            // get the project achievements
            var projectAchievements = this.ProjectService.getAchievementItems();

            if (projectAchievements != null) {

                // get the time of tomorrow at 3pm
                var tomorrow = this.moment().add('days', 1).hours(15).minutes(0).seconds(0);

                // create a new milestone object
                var newMilestone = {
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
                    isVisible: true,
                    edit: true
                };

                // add the milestone object to the array of achievements
                projectAchievements.push(newMilestone);

                // reload the achievements
                this.loadAchievements();

                // save the project to the server
                this.saveProject();
            }
        }

        /**
         * The edit button for a milestone was clicked
         * @param milestone the milestone to edit
         */

    }, {
        key: 'editMilestoneClicked',
        value: function editMilestoneClicked(milestone) {
            milestone.edit = true;
        }

        /**
         * The checkbox for an activity or step was clicked
         * @param milestone the milestone that is being edited
         * @param item the activity or step that was clicked
         */

    }, {
        key: 'itemClicked',
        value: function itemClicked(milestone, item) {

            if (milestone != null && milestone.params != null && milestone.params.nodeIds != null) {

                // get the node ids that are currently required for the milestone
                var nodeIds = milestone.params.nodeIds;

                // get the node id of the item that was clicked
                var nodeId = item.$key;

                if (item.checked) {
                    if (nodeIds.indexOf(nodeId) == -1) {
                        // add the node id
                        milestone.params.nodeIds.push(nodeId);
                    }
                } else {
                    // remove the node id

                    // loop through all the node ids and remove the node id
                    for (var n = nodeIds.length - 1; n >= 0; n--) {
                        if (nodeId == nodeIds[n]) {
                            nodeIds.splice(n, 1);
                        }
                    }
                }
            }

            // save the project to the server
            this.saveProject();
        }

        /**
         * Show the steps for an activity
         * @param groupId the node id for the activity
         * @param milestone the milestone object that is being edited
         */

    }, {
        key: 'showStepsClicked',
        value: function showStepsClicked(groupId, milestone) {

            if (groupId != null && milestone != null) {

                /*
                 * set the showSteps field to true so that we will now see the
                 * "Hide Steps" button
                 */
                milestone.items[groupId].showSteps = true;

                // get all the child ids of the group
                var childIds = this.ProjectService.getChildNodeIdsById(groupId);

                // loop through all the child ids
                for (var c = 0; c < childIds.length; c++) {
                    var childId = childIds[c];

                    if (milestone.items[childId] != null) {
                        // show the step
                        milestone.items[childId].show = true;
                    }
                }
            }
        }

        /**
         * Hide the steps for an activity
         * @param groupId the node id for the activity
         * @param milestone the milestone object that is being edited
         */

    }, {
        key: 'hideStepsClicked',
        value: function hideStepsClicked(groupId, milestone) {

            if (groupId != null && milestone != null) {

                /*
                 * set the showSteps field to false so that we will now see the
                 * "Show Steps" button
                 */
                milestone.items[groupId].showSteps = false;

                // get all the child ids of the group
                var childIds = this.ProjectService.getChildNodeIdsById(groupId);

                // loop through all the child ids
                for (var c = 0; c < childIds.length; c++) {
                    var childId = childIds[c];

                    if (milestone.items[childId] != null) {
                        // hide the step
                        milestone.items[childId].show = false;
                    }
                }
            }
        }

        /**
         * Delete a milestone
         * @param index the index of the milestone to delete
         * @param milestone the milestone to delete
         */

    }, {
        key: 'deleteMilestone',
        value: function deleteMilestone(index, milestone) {

            var name = "";

            if (milestone != null) {
                // get the name of the milestone
                name = milestone.name;
            }

            // ask to make sure the author wants to delete the milestone
            var answer = confirm("Are you sure you want to delete this milestone?\n\n" + name);

            if (answer) {
                // remove the milestone
                this.achievements.splice(index, 1);

                // save the project to the server
                this.saveProject();
            }
        }

        /**
         * The save button for a milestone was clicked
         * @param milestone the milestone to save
         */

    }, {
        key: 'saveMilestoneClicked',
        value: function saveMilestoneClicked(milestone) {

            // do not show the edit view for the milestone anymore
            milestone.edit = false;

            // save the project to the server
            this.saveProject();
        }

        /**
         * The milestone due date changed
         * @param milestone the milestone that has changed
         */

    }, {
        key: 'milestoneDateChanged',
        value: function milestoneDateChanged(milestone) {

            // get the due date
            milestone.params.targetDate = milestone.params.targetDateTemp.getTime();

            // calculate the time difference from now to the due date
            milestone.timeDiff = this.calculateTimeDiff(milestone.params.targetDate);

            // save the project to the server
            this.saveProject();
        }

        /**
         * Remove the temporary fields from the milestone objects and store
         * them in temporary storage arrays so that we can load the fields back
         * in later
         */

    }, {
        key: 'clearTempFields',
        value: function clearTempFields() {

            /*
             * these array will store the temporary fields. the index of the arrays
             * corresponds to the index of the achievement. for example the calendarIsOpen
             * value for the first achievement will be stored in
             * this.calendarIsOpenTemporaryStorage[0]. the calendarIsOpen value for the second
             * achievement will be stored in this.calendarIsOpenTemporaryStorage[1].
             */
            this.calendarIsOpenTemporaryStorage = [];
            this.itemsTemporaryStorage = [];
            this.workgroupsStorage = [];
            this.editStorage = [];
            this.numberOfStudentsCompletedStorage = [];
            this.percentageCompletedStorage = [];
            this.showStudentsStorage = [];
            this.timeDiffStorage = [];

            // loop through all the achievements
            for (var a = 0; a < this.achievements.length; a++) {

                // get an achievement
                var achievement = this.achievements[a];

                // save the field values in the temprary storage arrays
                this.calendarIsOpenTemporaryStorage.push(achievement.calendarIsOpen);
                this.itemsTemporaryStorage.push(achievement.items);
                this.workgroupsStorage.push(achievement.workgroups);
                this.editStorage.push(achievement.edit);
                this.numberOfStudentsCompletedStorage.push(achievement.numberOfStudentsCompleted);
                this.percentageCompletedStorage.push(achievement.percentageCompleted);
                this.showStudentsStorage.push(achievement.showStudents);
                this.timeDiffStorage.push(achievement.timeDiff);

                // delete the field from the achievement
                delete achievement.params.targetDateTemp;
                delete achievement.calendarIsOpen;
                delete achievement.items;
                delete achievement.workgroups;
                delete achievement.edit;
                delete achievement.numberOfStudentsCompleted;
                delete achievement.percentageCompleted;
                delete achievement.showStudents;
                delete achievement.timeDiff;
            }
        }

        /**
         * Restore the temporary fields into the achievement objects
         */

    }, {
        key: 'restoreTempFields',
        value: function restoreTempFields() {

            // loop through all the achievements
            for (var a = 0; a < this.achievements.length; a++) {

                // get an achievement
                var achievement = this.achievements[a];

                // recalculate the target date object
                achievement.params.targetDateTemp = new Date(achievement.params.targetDate);

                // set the fields back into the achievement object
                achievement.calendarIsOpen = this.calendarIsOpenTemporaryStorage[a];
                achievement.items = this.itemsTemporaryStorage[a];
                achievement.workgroups = this.workgroupsStorage[a];
                achievement.edit = this.editStorage[a];
                achievement.numberOfStudentsCompleted = this.numberOfStudentsCompletedStorage[a];
                achievement.percentageCompleted = this.percentageCompletedStorage[a];
                achievement.showStudents = this.showStudentsStorage[a];
                achievement.timeDiff = this.timeDiffStorage[a];
            }

            // clear the temporary storage arrays
            this.calendarIsOpenTemporaryStorage = [];
            this.itemsTemporaryStorage = [];
            this.workgroupsStorage = [];
            this.editStorage = [];
            this.numberOfStudentsCompletedStorage = [];
            this.percentageCompletedStorage = [];
            this.showStudentsStorage = [];
            this.timeDiffStorage = [];
        }

        /**
         * The open calendar button was clicked
         * @param milestone the milestone that we will edit the due date for
         */

    }, {
        key: 'openCalendar',
        value: function openCalendar(milestone) {

            // open the calendar for the milestone
            milestone.calendarIsOpen = true;
        }
    }, {
        key: 'closeCalendar',


        /**
         * The close calendar button was clicked
         * @param milestone the milestone that we were editing
         */
        value: function closeCalendar(milestone) {

            // close the calendar for the milestone
            milestone.calendarIsOpen = false;
        }

        /**
         * Save the project to the server
         */

    }, {
        key: 'saveProject',
        value: function saveProject() {

            // clear the temp fields and remember them
            this.clearTempFields();

            // save the project to the server
            this.ProjectService.saveProject();

            // restore the temp fields
            this.restoreTempFields();
        }

        /**
         * Check if a node id is for a group
         * @param nodeId
         * @returns whether the node is a group node
         */

    }, {
        key: 'isGroupNode',
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: 'getNodePositionById',


        /**
         * Get the node position
         * @param nodeId the node id
         * @returns the node position
         */
        value: function getNodePositionById(nodeId) {
            return this.ProjectService.getNodePositionById(nodeId);
        }
    }, {
        key: 'getNodeTitleByNodeId',


        /**
         * Get the node title for a node
         * @param nodeId the node id
         * @returns the node title
         */
        value: function getNodeTitleByNodeId(nodeId) {
            return this.ProjectService.getNodeTitleByNodeId(nodeId);
        }
    }, {
        key: 'getDisplayUserNamesByWorkgroupId',


        /**
         * Get the user names for a workgroup id
         * @param workgroupId the workgroup id
         * @return the user names in the workgroup
         */
        value: function getDisplayUserNamesByWorkgroupId(workgroupId) {
            return this.ConfigService.getDisplayUserNamesByWorkgroupId(workgroupId);
        }

        /**
         * Show which students have completed the milestone
         * @param milestone the milestone
         */

    }, {
        key: 'showStudents',
        value: function showStudents(milestone) {
            milestone.showStudents = true;
        }

        /**
         * Hide which students have completed the milestone
         * @parma milestone the milestone
         */

    }, {
        key: 'hideStudents',
        value: function hideStudents(milestone) {
            milestone.showStudents = false;
        }

        /**
         * Update the student completion information for this milestone
         * @param achievementId the achievement id to update
         */

    }, {
        key: 'updateMilestoneCompletion',
        value: function updateMilestoneCompletion(achievementId) {

            if (achievementId != null) {

                // loop through all the project achievements
                for (var a = 0; a < this.achievements.length; a++) {
                    var projectAchievement = this.achievements[a];

                    if (achievementId == projectAchievement.id) {
                        // we have found the milestone we want to update

                        // get the workgroup ids
                        var workgroupIds = this.ConfigService.getClassmateWorkgroupIds();

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
                                /*
                                 * add the workgroup id to the array of workgroup ids that
                                 * have completed the achievement
                                 */
                                workgroupIdsCompleted.push(studentAchievement.workgroupId);

                                // add the achievement time to the achievement times array
                                achievementTimes.push(studentAchievement.achievementTime);
                            }
                        }

                        /*
                         * loop through all the workgroup ids to find the
                         * workgroup ids that have not completed the
                         * achievement
                         */
                        for (var w = 0; w < workgroupIds.length; w++) {
                            var workgroupId = workgroupIds[w];

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
                                achievementTime: null,
                                completed: false
                            };

                            projectAchievement.workgroups.push(workgroupObject);
                        }

                        /*
                         * calculate the number of workgroups that completed
                         * the achievement
                         */
                        projectAchievement.numberOfStudentsCompleted = studentAchievementsForAchievementId.length;

                        /*
                         * calculate the percentage of workgroups that have
                         * completed the achievement
                         */
                        projectAchievement.percentageCompleted = parseInt(100 * projectAchievement.numberOfStudentsCompleted / this.numberOfStudentsInRun);
                    }
                }
            }
        }
    }]);

    return MilestonesController;
}();

MilestonesController.$inject = ['$injector', '$rootScope', '$scope', '$state', 'AchievementService', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService', 'UtilService', 'moment'];

exports.default = MilestonesController;
//# sourceMappingURL=milestonesController.js.map