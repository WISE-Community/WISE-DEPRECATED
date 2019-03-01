'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MilestonesController = function () {
    function MilestonesController($injector, $filter, $mdDialog, $rootScope, $scope, $state, AchievementService, AnnotationService, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService, UtilService, moment) {
        var _this = this;

        _classCallCheck(this, MilestonesController);

        this.$injector = $injector;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.AchievementService = AchievementService;
        this.AnnotationService = AnnotationService;
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
        this.itemsTemporaryStorage = [];
        this.workgroupsStorage = [];
        this.numberOfStudentsCompletedStorage = [];
        this.percentageCompletedStorage = [];
        this.periodId = this.TeacherDataService.getCurrentPeriod().periodId;
        this.setWorkgroupsInCurrentPeriod();
        this.loadProjectAchievements();

        this.$rootScope.$on('newStudentAchievement', function (event, args) {
            if (args) {
                var studentAchievement = args.studentAchievement;
                _this.AchievementService.addOrUpdateStudentAchievement(studentAchievement);
                if (studentAchievement.data != null && studentAchievement.data.id != null) {
                    _this.updateMilestoneCompletion(studentAchievement.data.id);
                }
            }
        });

        this.$scope.$on('currentPeriodChanged', function (event, args) {
            _this.periodId = args.currentPeriod.periodId;

            // update the completion status for all the project projectAchievements
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _this.projectAchievements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var projectAchievement = _step.value;

                    _this.setWorkgroupsInCurrentPeriod();
                    _this.updateMilestoneCompletion(projectAchievement.id);
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
        });
    }

    /**
     * Load the projectAchievements and perform additional calculations
     */


    _createClass(MilestonesController, [{
        key: 'loadProjectAchievements',
        value: function loadProjectAchievements() {
            var projectAchievements = this.ProjectService.getAchievements();
            if (projectAchievements.isEnabled) {
                this.projectAchievements = projectAchievements.items;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.projectAchievements[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var projectAchievement = _step2.value;

                        this.updateMilestoneCompletion(projectAchievement.id);

                        // get all the activities and steps in the project
                        projectAchievement.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);
                        if (projectAchievement.params != null && projectAchievement.params.nodeIds != null) {
                            /*
                             * loop through all the node ids that are required
                             * to be completed for this project achievement
                             */
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = projectAchievement.params.nodeIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var nodeId = _step3.value;

                                    if (projectAchievement.items[nodeId] != null) {
                                        projectAchievement.items[nodeId].checked = true;
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

        /**
         * Check if the given milestone date is before the current day (and
         * milestone completion is less than 100%)
         * @param date a date string or object
         * @param percentageCompleted Number percent completed
         * @return Boolean whether given date is before today
         */

    }, {
        key: 'isBeforeDay',
        value: function isBeforeDay(date, percentageCompleted) {
            var result = false;
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

    }, {
        key: 'isSameDay',
        value: function isSameDay(date, percentageCompleted) {
            var result = false;
            if (date && percentageCompleted < 100) {
                result = this.moment(date).isSame(this.moment(), 'day');
            }
            return result;
        }

        /**
         * Create a new milestone
         * @return a milestone object
         */

    }, {
        key: 'createMilestone',
        value: function createMilestone() {
            var projectAchievements = this.ProjectService.getAchievementItems();
            if (projectAchievements != null) {
                // get the time of tomorrow at 3pm
                var tomorrow = this.moment().add('days', 1).hours(23).minutes(11).seconds(59);
                return {
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
            return null;
        }

        /**
         * Delete a milestone
         * @param milestone the milestone to delete
         */

    }, {
        key: 'deleteMilestone',
        value: function deleteMilestone(milestone, $event) {
            var _this2 = this;

            if (milestone) {
                var title = milestone.name;
                var label = this.$translate('DELETE_MILESTONE');
                var msg = this.$translate('DELETE_MILESTONE_CONFIRM', { name: milestone.name });
                var yes = this.$translate('YES');
                var cancel = this.$translate('CANCEL');

                var confirm = this.$mdDialog.confirm().title(title).textContent(msg).ariaLabel(label).targetEvent($event).ok(yes).cancel(cancel);

                this.$mdDialog.show(confirm).then(function () {
                    var projectAchievements = _this2.projectAchievements;
                    var index = -1;
                    for (var i = 0; i < projectAchievements.length; i++) {
                        if (projectAchievements[i].id === milestone.id) {
                            index = i;
                            break;
                        }
                    }

                    if (index > -1) {
                        _this2.projectAchievements.splice(index, 1);
                        _this2.saveProject();
                    }
                }, function () {});
            }
        }
    }, {
        key: 'saveMilestone',
        value: function saveMilestone(milestone) {
            var index = -1;
            for (var i = 0; i < this.projectAchievements.length; i++) {
                if (this.projectAchievements[i].id === milestone.id) {
                    index = i;
                    this.projectAchievements[i] = milestone;
                    break;
                }
            }
            if (index < 0) {
                var projectAchievements = this.ProjectService.getAchievementItems();
                if (projectAchievements && milestone) {
                    projectAchievements.push(milestone);
                }
            }
            this.saveProject();
            this.loadProjectAchievements();
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
             * these array will store the temporary fields. the index of the arrays corresponds to the
             * index of the project achievement. for example the percentageCompletedStorage value for
             * the first project project achievement will be stored in
             * this.percentageCompletedStorage[0]. the percentageCompletedStorage value for the second
             * project project achievement will be stored in this.percentageCompletedStorage[1].
             */
            this.itemsTemporaryStorage = [];
            this.workgroupsStorage = [];
            this.numberOfStudentsCompletedStorage = [];
            this.percentageCompletedStorage = [];

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.projectAchievements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var projectAchievement = _step4.value;

                    // save the field values in the temporary storage arrays
                    this.workgroupsStorage.push(projectAchievement.workgroups);
                    this.numberOfStudentsCompletedStorage.push(projectAchievement.numberOfStudentsCompleted);
                    this.percentageCompletedStorage.push(projectAchievement.percentageCompleted);

                    // delete the field from the projectAchievement
                    delete projectAchievement.items;
                    delete projectAchievement.workgroups;
                    delete projectAchievement.numberOfStudentsCompleted;
                    delete projectAchievement.percentageCompleted;
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

        /**
         * Restore the temporary fields into the achievement objects
         */

    }, {
        key: 'restoreTempFields',
        value: function restoreTempFields() {
            for (var a = 0; a < this.projectAchievements.length; a++) {
                var projectAchievement = this.projectAchievements[a];
                // set the fields back into the achievement object
                projectAchievement.items = this.itemsTemporaryStorage[a];
                projectAchievement.workgroups = this.workgroupsStorage[a];
                projectAchievement.numberOfStudentsCompleted = this.numberOfStudentsCompletedStorage[a];
                projectAchievement.percentageCompleted = this.percentageCompletedStorage[a];
            }
            this.itemsTemporaryStorage = [];
            this.workgroupsStorage = [];
            this.numberOfStudentsCompletedStorage = [];
            this.percentageCompletedStorage = [];
        }

        /**
         * Save the project to the server
         */

    }, {
        key: 'saveProject',
        value: function saveProject() {
            this.clearTempFields();
            this.ProjectService.saveProject();
            this.restoreTempFields();
        }

        /**
         * Get the user names for a workgroup id
         * @param workgroupId the workgroup id
         * @return the user names in the workgroup
         */

    }, {
        key: 'getDisplayUserNamesByWorkgroupId',
        value: function getDisplayUserNamesByWorkgroupId(workgroupId) {
            return this.ConfigService.getDisplayUserNamesByWorkgroupId(workgroupId);
        }
    }, {
        key: 'setWorkgroupsInCurrentPeriod',
        value: function setWorkgroupsInCurrentPeriod() {
            var workgroupIdsInRun = this.ConfigService.getClassmateWorkgroupIds();
            this.workgroupIds = [];

            // filter out workgroups not in the current period
            for (var i = 0; i < workgroupIdsInRun.length; i++) {
                var currentId = workgroupIdsInRun[i];
                var currentPeriodId = this.ConfigService.getPeriodIdByWorkgroupId(currentId);

                if (this.periodId === -1 || currentPeriodId === this.periodId) {
                    this.workgroupIds.push(currentId);
                }
            }
            this.numberOfStudentsInRun = this.workgroupIds.length;
        }

        /**
         * Update the student completion information for this milestone
         * @param achievementId the achievement id to update
         */

    }, {
        key: 'updateMilestoneCompletion',
        value: function updateMilestoneCompletion(achievementId) {
            var projectAchievement = this.getProjectAchievementById(achievementId);
            var achievementIdToStudentAchievements = this.AchievementService.getAchievementIdToStudentAchievementsMappings();
            var studentAchievements = achievementIdToStudentAchievements[projectAchievement.id];
            var workgroupIdsCompleted = [];
            var achievementTimes = [];
            var workgroupIdsNotCompleted = [];

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = studentAchievements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var studentAchievement = _step5.value;

                    var currentWorkgroupId = studentAchievement.workgroupId;
                    // check if workgroup is in current period
                    if (this.workgroupIds.indexOf(currentWorkgroupId) > -1) {
                        workgroupIdsCompleted.push(currentWorkgroupId);
                        achievementTimes.push(studentAchievement.achievementTime);
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

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.workgroupIds[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var _workgroupId = _step6.value;

                    if (workgroupIdsCompleted.indexOf(_workgroupId) === -1) {
                        workgroupIdsNotCompleted.push(_workgroupId);
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

            projectAchievement.workgroups = [];

            for (var c = 0; c < workgroupIdsCompleted.length; c++) {
                var workgroupId = workgroupIdsCompleted[c];
                var achievementTime = achievementTimes[c];
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
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = workgroupIdsNotCompleted[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var _workgroupId2 = _step7.value;

                    var _workgroupObject = {
                        workgroupId: _workgroupId2,
                        displayNames: this.getDisplayUserNamesByWorkgroupId(_workgroupId2),
                        achievementTime: null,
                        completed: false
                    };
                    projectAchievement.workgroups.push(_workgroupObject);
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

            projectAchievement.numberOfStudentsCompleted = workgroupIdsCompleted.length;
            projectAchievement.percentageCompleted = parseInt(100 * projectAchievement.numberOfStudentsCompleted / this.numberOfStudentsInRun);
            if (projectAchievement.type === 'milestoneReport') {
                this.setReportAvailable(projectAchievement);
                if (projectAchievement.isReportAvailable) {
                    projectAchievement.generatedReport = this.generateReport(projectAchievement);
                } else {
                    delete projectAchievement.generatedReport;
                }
            }
        }
    }, {
        key: 'setReportAvailable',
        value: function setReportAvailable(projectAchievement) {
            projectAchievement.isReportAvailable = projectAchievement.percentageCompleted >= projectAchievement.satisfyMinPercentage;
        }
    }, {
        key: 'generateReport',
        value: function generateReport(projectAchievement) {
            var reportVariables = projectAchievement.report.variables;
            var reportVariableValues = {};
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = reportVariables[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var reportVariable = _step8.value;

                    var varValue = reportVariable.value;
                    if (varValue === 'annotation.score') {} else if (varValue === 'annotation.autoScore') {} else if (varValue === 'annotation.autoScore.ki' && reportVariable.function === 'average') {
                        reportVariableValues[reportVariable.name] = this.AnnotationService.getAverageAutoScore(reportVariable.nodeId, reportVariable.componentId, this.periodId, 'ki');
                    } else if (varValue === 'annotation.autoScore.science' && reportVariable.function === 'average') {
                        reportVariableValues[reportVariable.name] = this.AnnotationService.getAverageAutoScore(reportVariable.nodeId, reportVariable.componentId, this.periodId, 'science');
                    } else if (varValue === 'annotation.autoScore.engineering') {}
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

            var template = this.chooseTemplate(projectAchievement.report.templates, reportVariableValues);
            return template.content;
        }
    }, {
        key: 'chooseTemplate',
        value: function chooseTemplate(templates, reportVariableValues) {
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = templates[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var template = _step9.value;

                    if (this.isTemplateMatch(template, reportVariableValues)) {
                        return template;
                    }
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            return {
                content: 'no template matched!'
            };
        }
    }, {
        key: 'isTemplateMatch',
        value: function isTemplateMatch(template, reportVariableValues) {
            var matchedCriteria = [];
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = template.satisfyCriteria[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var satisfyCriterion = _step10.value;

                    if (this.isTemplateCriterionSatisfied(satisfyCriterion, reportVariableValues)) {
                        matchedCriteria.push(satisfyCriterion);
                    }
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            if (template.satisfyConditional === 'all') {
                return matchedCriteria.length === template.satisfyCriteria.length;
            } else if (template.satisfyConditional === 'any') {
                return matchedCriteria.length > 0;
            }
        }
    }, {
        key: 'isTemplateCriterionSatisfied',
        value: function isTemplateCriterionSatisfied(satisfyCriterion, reportVariableValues) {
            var targetValue = reportVariableValues[satisfyCriterion.targetVariable];
            if (satisfyCriterion.function === 'greaterThanOrEqualTo') {
                return targetValue >= satisfyCriterion.value;
            } else if (satisfyCriterion.function === 'lessThanOrEqualTo') {
                return targetValue <= satisfyCriterion.value;
            }
        }
    }, {
        key: 'getProjectAchievementById',
        value: function getProjectAchievementById(achievementId) {
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = this.projectAchievements[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var projectAchievement = _step11.value;

                    if (projectAchievement.id === achievementId) {
                        return projectAchievement;
                    }
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            return {};
        }

        /**
         * Open a dialog with the milestone details (list with workgroups statuses
         * for the given milestone)
         * @param milestone the milestone object to show
         * @param $event the event that triggered the function call
         */

    }, {
        key: 'showMilestoneDetails',
        value: function showMilestoneDetails(milestone, $event) {
            var _locals,
                _this3 = this;

            var title = this.$translate('MILESTONE_DETAILS_TITLE', { name: milestone.name });
            var template = '<md-dialog class="dialog--wide">\n                <md-toolbar>\n                    <div class="md-toolbar-tools">\n                        <h2>' + title + '</h2>\n                    </div>\n                </md-toolbar>\n                <md-dialog-content class="gray-lighter-bg md-dialog-content">\n                    <milestone-details milestone="milestone" on-show-workgroup="onShowWorkgroup(value)"></milestone-details>\n                </md-dialog-content>\n                <md-dialog-actions layout="row" layout-align="start center">\n                    <md-button class="warn"\n                               ng-click="delete()"\n                               aria-label="{{ \'DELETE\' | translate }}">\n                        {{ \'DELETE\' | translate }}\n                    </md-button>\n                    <span flex></span>\n                    <md-button class="md-primary"\n                               ng-click="edit()"\n                               aria-label="{{ \'EDIT\' | translate }}">\n                        {{ \'EDIT\' | translate }}\n                    </md-button>\n                    <md-button class="md-primary"\n                               ng-click="close()"\n                               aria-label="{{ \'CLOSE\' | translate }}">\n                            {{ \'CLOSE\' | translate }}\n                        </md-button>\n                    </md-dialog-actions>\n            </md-dialog>';

            // display the milestone details in a dialog
            this.$mdDialog.show({
                parent: angular.element(document.body),
                template: template,
                ariaLabel: title,
                fullscreen: true,
                targetEvent: $event,
                clickOutsideToClose: true,
                escapeToClose: true,
                locals: (_locals = {
                    $event: $event }, _defineProperty(_locals, '$event', $event), _defineProperty(_locals, 'milestone', milestone), _locals),
                controller: ['$scope', '$state', '$mdDialog', 'milestone', '$event', 'TeacherDataService', function DialogController($scope, $state, $mdDialog, milestone, $event, TeacherDataService) {
                    $scope.milestone = milestone;
                    $scope.event = $event;

                    $scope.close = function () {
                        $mdDialog.hide();
                    };

                    $scope.edit = function () {
                        $mdDialog.hide({ milestone: $scope.milestone, action: 'edit', $event: $event });
                    };

                    $scope.delete = function () {
                        $mdDialog.hide({ milestone: $scope.milestone, action: 'delete' });
                    };

                    $scope.onShowWorkgroup = function (workgroup) {
                        $mdDialog.hide();
                        TeacherDataService.setCurrentWorkgroup(workgroup);
                        $state.go('root.nodeProgress');
                    };
                }]
            }).then(function (data) {
                if (data && data.action && data.milestone) {
                    if (data.action === 'edit') {
                        var _milestone = angular.copy(data.milestone);
                        _this3.editMilestone(_milestone, data.$event);
                    } else if (data.action === 'delete') {
                        _this3.deleteMilestone(data.milestone);
                    }
                }
            }, function () {});;
        }

        /**
         * Open a dialog to edit milestone details (or create a new one)
         * @param milestone the milestone object to show
         * @param $event the event that triggered the function call
         */

    }, {
        key: 'editMilestone',
        value: function editMilestone(milestone, $event) {
            var _locals2,
                _this4 = this;

            var editMode = milestone ? true : false;
            var title = editMode ? this.$translate('EDIT_MILESTONE') : this.$translate('ADD_MILESTONE');

            if (!editMode) {
                milestone = this.createMilestone();
            }

            var template = '<md-dialog class="dialog--wide">\n                <md-toolbar>\n                    <div class="md-toolbar-tools">\n                        <h2>' + title + '</h2>\n                    </div>\n                </md-toolbar>\n                <md-dialog-content class="gray-lighter-bg md-dialog-content">\n                    <milestone-edit milestone="milestone" on-change="onChange(milestone, valid)"></milestone-edit>\n                </md-dialog-content>\n                <md-dialog-actions layout="row" layout-align="end center">\n                    <md-button ng-click="close()"\n                               aria-label="{{ \'CANCEL\' | translate }}">\n                        {{ \'CANCEL\' | translate }}\n                    </md-button>\n                    <md-button class="md-primary"\n                               ng-click="save()"\n                               aria-label="{{ \'SAVE\' | translate }}">\n                            {{ \'SAVE\' | translate }}\n                        </md-button>\n                    </md-dialog-actions>\n            </md-dialog>';

            // display the milestone edit form in a dialog
            this.$mdDialog.show({
                parent: angular.element(document.body),
                template: template,
                ariaLabel: title,
                fullscreen: true,
                targetEvent: $event,
                clickOutsideToClose: true,
                escapeToClose: true,
                locals: (_locals2 = {
                    editMode: editMode,
                    $event: $event }, _defineProperty(_locals2, '$event', $event), _defineProperty(_locals2, 'milestone', milestone), _locals2),
                controller: ['$scope', '$mdDialog', '$filter', 'milestone', 'editMode', '$event', function DialogController($scope, $mdDialog, $filter, milestone, editMode, $event) {
                    $scope.editMode = editMode;
                    $scope.milestone = milestone;
                    $scope.$event = $event;
                    $scope.valid = editMode;

                    $scope.$translate = $filter('translate');

                    $scope.close = function () {
                        $mdDialog.hide({ milestone: $scope.milestone, $event: $scope.$event });
                    };

                    $scope.save = function () {
                        if ($scope.valid) {
                            $mdDialog.hide({ milestone: $scope.milestone, save: true, $event: $scope.$event });
                        } else {
                            alert($scope.$translate('MILESTONE_EDIT_INVALID_ALERT'));
                        }
                    };

                    $scope.onChange = function (milestone, valid) {
                        $scope.milestone = milestone;
                        $scope.valid = valid;
                    };
                }]
            }).then(function (data) {
                if (data) {
                    if (data.milestone && data.save) {
                        _this4.saveMilestone(data.milestone);
                    }
                }
            }, function () {});
        }
    }]);

    return MilestonesController;
}();

MilestonesController.$inject = ['$injector', '$filter', '$mdDialog', '$rootScope', '$scope', '$state', 'AchievementService', 'AnnotationService', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService', 'UtilService', 'moment'];

exports.default = MilestonesController;
//# sourceMappingURL=milestonesController.js.map
