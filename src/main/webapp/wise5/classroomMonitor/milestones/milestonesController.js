'use strict';

class MilestonesController {

  constructor($injector,
              $filter,
              $mdDialog,
              $rootScope,
              $scope,
              $state,
              AchievementService,
              AnnotationService,
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

    this.$rootScope.$on('newStudentAchievement', (event, args) => {
      if (args) {
        const studentAchievement = args.studentAchievement;
        this.AchievementService.addOrUpdateStudentAchievement(studentAchievement);
        this.updateMilestoneCompletion(studentAchievement.achievementId);
      }
    });

    this.$scope.$on('currentPeriodChanged', (event, args) => {
      this.periodId = args.currentPeriod.periodId;

      // update the completion status for all the project projectAchievements
      for (let projectAchievement of this.projectAchievements) {
        this.setWorkgroupsInCurrentPeriod();
        this.updateMilestoneCompletion(projectAchievement.id);
      }
    });
  }

  /**
   * Load the projectAchievements and perform additional calculations
   */
  loadProjectAchievements() {
    const projectAchievements = this.ProjectService.getAchievements();
    if (projectAchievements.isEnabled) {
      this.projectAchievements = projectAchievements.items;
      for (let projectAchievement of this.projectAchievements) {
        this.updateMilestoneCompletion(projectAchievement.id);

        // get all the activities and steps in the project
        projectAchievement.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);
        if (projectAchievement.params != null && projectAchievement.params.nodeIds != null) {
          /*
           * loop through all the node ids that are required
           * to be completed for this project achievement
           */
          for (let nodeId of projectAchievement.params.nodeIds) {
            if (projectAchievement.items[nodeId] != null) {
              projectAchievement.items[nodeId].checked = true;
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
    let projectAchievements = this.ProjectService.getAchievementItems();
    if (projectAchievements != null) {
      // get the time of tomorrow at 3pm
      const tomorrow = this.moment().add('days', 1).hours(23).minutes(11).seconds(59);
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
  deleteMilestone(milestone, $event) {
    if (milestone) {
      const title = milestone.name;
      const label = this.$translate('DELETE_MILESTONE');
      const msg = this.$translate('DELETE_MILESTONE_CONFIRM', { name: milestone.name });
      const yes = this.$translate('YES');
      const cancel = this.$translate('CANCEL')

      const confirm = this.$mdDialog.confirm()
        .title(title)
        .textContent(msg)
        .ariaLabel(label)
        .targetEvent($event)
        .ok(yes)
        .cancel(cancel);

      this.$mdDialog.show(confirm).then(() => {
        let projectAchievements = this.projectAchievements;
        let index = -1;
        for (let i = 0; i < projectAchievements.length; i++) {
          if (projectAchievements[i].id === milestone.id) {
            index = i;
            break;
          }
        }

        if (index > -1) {
          this.projectAchievements.splice(index, 1);
          this.saveProject();
        }
      }, () => {

      });
    }
  }

  saveMilestone(milestone) {
    let index = -1;
    for (let i = 0; i < this.projectAchievements.length; i++) {
      if (this.projectAchievements[i].id === milestone.id) {
        index = i;
        this.projectAchievements[i] = milestone;
        break;
      }
    }
    if (index < 0) {
      let projectAchievements = this.ProjectService.getAchievementItems();
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
  clearTempFields() {
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

    for (let projectAchievement of this.projectAchievements) {
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
  }

  /**
   * Restore the temporary fields into the achievement objects
   */
  restoreTempFields() {
    for (let a = 0; a < this.projectAchievements.length; a++) {
      const projectAchievement = this.projectAchievements[a];
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
  saveProject() {
    this.clearTempFields();
    this.ProjectService.saveProject();
    this.restoreTempFields();
  }

  /**
   * Get the user names for a workgroup id
   * @param workgroupId the workgroup id
   * @return the user names in the workgroup
   */
  getDisplayUsernamesByWorkgroupId(workgroupId) {
    return this.ConfigService.getDisplayUsernamesByWorkgroupId(workgroupId);
  }

  setWorkgroupsInCurrentPeriod() {
    const workgroupIdsInRun = this.ConfigService.getClassmateWorkgroupIds();
    this.workgroupIds = [];

    // filter out workgroups not in the current period
    for (let i = 0; i < workgroupIdsInRun.length; i++) {
      const currentId = workgroupIdsInRun[i];
      const currentPeriodId = this.ConfigService.getPeriodIdByWorkgroupId(currentId);

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
  updateMilestoneCompletion(achievementId) {
    const projectAchievement = this.getProjectAchievementById(achievementId);
    const achievementIdToStudentAchievements = this.AchievementService.getAchievementIdToStudentAchievementsMappings();
    const studentAchievements = achievementIdToStudentAchievements[projectAchievement.id];
    const workgroupIdsCompleted = [];
    const achievementTimes = [];
    const workgroupIdsNotCompleted = [];

    for (let studentAchievement of studentAchievements) {
      const currentWorkgroupId = studentAchievement.workgroupId;
      // check if workgroup is in current period
      if (this.workgroupIds.indexOf(currentWorkgroupId) > -1) {
        workgroupIdsCompleted.push(currentWorkgroupId);
        achievementTimes.push(studentAchievement.achievementTime);
      }
    }

    for (let workgroupId of this.workgroupIds) {
      if (workgroupIdsCompleted.indexOf(workgroupId) === -1) {
        workgroupIdsNotCompleted.push(workgroupId);
      }
    }

    projectAchievement.workgroups = [];

    for (let c = 0; c < workgroupIdsCompleted.length; c++) {
      const workgroupId = workgroupIdsCompleted[c];
      const achievementTime = achievementTimes[c];
      const workgroupObject = {
        workgroupId: workgroupId,
        displayNames: this.getDisplayUsernamesByWorkgroupId(workgroupId),
        achievementTime: achievementTime,
        completed: true
      };
      projectAchievement.workgroups.push(workgroupObject);
    }

    /*
     * loop through all the workgroups that have not
     * completed the achievement
     */
    for (let workgroupId of workgroupIdsNotCompleted) {
      const workgroupObject = {
        workgroupId: workgroupId,
        displayNames: this.getDisplayUsernamesByWorkgroupId(workgroupId),
        achievementTime: null,
        completed: false
      };
      projectAchievement.workgroups.push(workgroupObject);
    }

    projectAchievement.numberOfStudentsCompleted = workgroupIdsCompleted.length;
    projectAchievement.percentageCompleted =
      parseInt(100 * projectAchievement.numberOfStudentsCompleted / this.numberOfStudentsInRun);
    if (projectAchievement.type === 'milestoneReport') {
      if (this.isCompletionReached(projectAchievement)) {
        const report = this.generateReport(projectAchievement);
        this.setReportAvailable(projectAchievement, true);
        projectAchievement.generatedReport = report.content ? report.content : null;
        projectAchievement.recommendations = report.recommendations ? report.recommendations : null;
      } else {
        this.setReportAvailable(projectAchievement, false);
      }
    }
  }

  isCompletionReached(projectAchievement) {
    return projectAchievement.percentageCompleted >= projectAchievement.satisfyMinPercentage &&
      projectAchievement.numberOfStudentsCompleted >= projectAchievement.satisfyMinNumWorkgroups;
  }

  setReportAvailable(projectAchievement, reportAvailable) {
    projectAchievement.isReportAvailable = reportAvailable;
  }

  generateReport(projectAchievement) {
    const referencedComponents = this.getSatisfyCriteriaReferencedComponents(projectAchievement);
    const aggregateAutoScores = {};
    for (const referencedComponent of Object.values(referencedComponents)) {
      const nodeId = referencedComponent.nodeId;
      const componentId = referencedComponent.componentId;
      aggregateAutoScores[componentId] = this.calculateAggregateAutoScores(nodeId, componentId, this.periodId);
    }
    const template = this.chooseTemplate(projectAchievement.report.templates, aggregateAutoScores);
    let content = template.content ? template.content : '';
    if (content) {
      for (let componentId of Object.keys(aggregateAutoScores)) {
        const componentAggregate = aggregateAutoScores[componentId];
        let subScoreIndex = 0;
        for (let subScoreId of Object.keys(componentAggregate)) {
          const regex = new RegExp(`milestone-report-graph.*id="(${subScoreId})"`, 'g');
          let index = 0;
          if (subScoreId !== 'ki') {
            subScoreIndex++;
            index = subScoreIndex;
          }
          const milestoneData = this.calculateMilestoneData(componentAggregate[subScoreId], index);
          const milestoneCategories = this.calculateMilestoneCategories(subScoreId);
          const categories = JSON.stringify(milestoneCategories).replace(/\"/g, '\'');
          const data = JSON.stringify(milestoneData).replace(/\"/g, '\'');
          content = content.replace(regex,
            `$& categories=\"${categories}\" data=\"${data}\"`);
        }
      }
    }
    const recommendations = template.recommendations ? template.recommendations : '';
    return {
      content: content,
      recommendations: recommendations
    };
  }

  getSatisfyCriteriaReferencedComponents(projectAchievement) {
    const components = {};
    const templates = projectAchievement.report.templates;
    for (const template of templates) {
      for (const satisfyCriterion of template.satisfyCriteria) {
        const nodeId = satisfyCriterion.nodeId;
        const componentId = satisfyCriterion.componentId;
        const component = {
          nodeId: nodeId,
          componentId: componentId
        };
        components[nodeId + '_' + componentId] = component;
      }
    }
    return components;
  }

  calculateMilestoneCategories(subScoreId) {
    if (subScoreId === 'ki') {
      return ['1','2','3','4','5'];
    } else {
      return ['1','2','3'];
    }
  }

  calculateMilestoneData(subScoreAggregate, subScoreIndex) {
    const mainColor = 'rgb(255,143,0)';
    const subColor1 = 'rgb(0,105,92)';
    const subColor2 = 'rgb(106,27,154)';
    const scoreKeys = Object.keys(subScoreAggregate.counts);
    const scoreKeysSorted = scoreKeys.sort((a, b) => { return parseInt(a) - parseInt(b);});
    const data = [];
    let color = mainColor;
    if (subScoreIndex > 0) {
      color = subScoreIndex % 2 === 0 ? subColor1 : subColor2;
    }
    let step = (100/scoreKeysSorted.length)/100;
    let opacity = 0;
    for (let scoreKey of scoreKeysSorted) {
      opacity = opacity + step;
      const scoreKeyCount = subScoreAggregate.counts[scoreKey];
      const scoreKeyPercentage = Math.floor(100 * scoreKeyCount / subScoreAggregate.scoreCount);
      const scoreKeyColor = this.UtilService.rgbToHex(color, opacity);
      const scoreData = {'y': scoreKeyPercentage, 'color': scoreKeyColor, 'count': scoreKeyCount };
      data.push(scoreData);
    }
    return data;
  }

  calculateAggregateAutoScores(nodeId, componentId, periodId) {
    const aggregate = {};
    const scoreAnnotations = this.AnnotationService.getAllLatestScoreAnnotations(nodeId, componentId, periodId);
    for (let scoreAnnotation of scoreAnnotations) {
      if (scoreAnnotation.type === 'autoScore') {
        this.addDataToAggregate(aggregate, scoreAnnotation);
      }
    }
    return aggregate;
  }

  addDataToAggregate(aggregate, annotation) {
    if (annotation.data.scores != null) {
      for (let subScore of annotation.data.scores) {
        if (aggregate[subScore.id] == null) {
          if (subScore.id === 'ki') {
            aggregate[subScore.id] = {
              scoreSum: 0,
              scoreCount: 0,
              counts: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
              },
              average: 0
            };
          } else {
            aggregate[subScore.id] = {
              scoreSum: 0,
              scoreCount: 0,
              counts: {
                1: 0,
                2: 0,
                3: 0
              },
              average: 0
            };
          }
        }
        const subScoreVal = subScore.score;
        aggregate[subScore.id].counts[subScoreVal]++;
        aggregate[subScore.id].scoreSum += subScoreVal;
        aggregate[subScore.id].scoreCount++;
        aggregate[subScore.id].average = aggregate[subScore.id].scoreSum / aggregate[subScore.id].scoreCount;
      }
    }
    return aggregate;
  }

  chooseTemplate(templates, aggregateAutoScores) {
    for (let template of templates) {
      if (this.isTemplateMatch(template, aggregateAutoScores)) {
        return template;
      }
    }
    return {
      content: null
    };
  }

  isTemplateMatch(template, aggregateAutoScores) {
    const matchedCriteria = [];
    for (const satisfyCriterion of template.satisfyCriteria) {
      if (this.isTemplateCriterionSatisfied(satisfyCriterion, aggregateAutoScores)) {
        matchedCriteria.push(satisfyCriterion);
      }
    }
    if (template.satisfyConditional === 'all') {
      return matchedCriteria.length === template.satisfyCriteria.length;
    } else if (template.satisfyConditional === 'any') {
      return matchedCriteria.length > 0;
    }
  }

  isTemplateCriterionSatisfied(satisfyCriterion, aggregateAutoScores) {
    if (satisfyCriterion.function === 'percentOfScoresGreaterThan') {
      return this.isPercentOfScoresGreaterThan(satisfyCriterion, aggregateAutoScores);
    } else if (satisfyCriterion.function === 'percentOfScoresGreaterThanOrEqualTo') {
      return this.isPercentOfScoresGreaterThanOrEqualTo(satisfyCriterion, aggregateAutoScores);
    } else if (satisfyCriterion.function === 'percentOfScoresLessThan') {
      return this.isPercentOfScoresLessThan(satisfyCriterion, aggregateAutoScores);
    } else if (satisfyCriterion.function === 'percentOfScoresLessThanOrEqualTo') {
      return this.isPercentOfScoresLessThanOrEqualTo(satisfyCriterion, aggregateAutoScores);
    } else if (satisfyCriterion.function === 'percentOfScoresEqualTo') {
      return this.isPercentOfScoresEqualTo(satisfyCriterion, aggregateAutoScores);
    } else if (satisfyCriterion.function === 'percentOfScoresNotEqualTo') {
      return this.isPercentOfScoresNotEqualTo(satisfyCriterion, aggregateAutoScores);
    } else if (satisfyCriterion.function === 'default') {
      return true;
    }
  }

  isPercentOfScoresGreaterThan(satisfyCriterion, aggregateAutoScores) {
    const aggregateData = this.getAggregateData(satisfyCriterion, aggregateAutoScores);
    const possibleScores = this.getPossibleScores(aggregateData);
    const sum = this.getGreaterThanSum(satisfyCriterion, aggregateData, possibleScores);
    return this.isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum);
  }

  getGreaterThanSum(satisfyCriterion, aggregateData, possibleScores) {
    let sum = 0;
    for (const possibleScore of possibleScores) {
      if (possibleScore > satisfyCriterion.value) {
        sum += aggregateData.counts[possibleScore];
      }
    }
    return sum;
  }

  isPercentOfScoresGreaterThanOrEqualTo(satisfyCriterion, aggregateAutoScores) {
    const aggregateData = this.getAggregateData(satisfyCriterion, aggregateAutoScores);
    const possibleScores = this.getPossibleScores(aggregateData);
    const sum = this.getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores);
    return this.isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum);
  }

  getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores) {
    let sum = 0;
    for (const possibleScore of possibleScores) {
      if (possibleScore >= satisfyCriterion.value) {
        sum += aggregateData.counts[possibleScore];
      }
    }
    return sum;
  }

  isPercentOfScoresLessThan(satisfyCriterion, aggregateAutoScores) {
    const aggregateData = this.getAggregateData(satisfyCriterion, aggregateAutoScores);
    const possibleScores = this.getPossibleScores(aggregateData);
    const sum = this.getLessThanSum(satisfyCriterion, aggregateData, possibleScores);
    return this.isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum);
  }

  getLessThanSum(satisfyCriterion, aggregateData, possibleScores) {
    let sum = 0;
    for (const possibleScore of possibleScores) {
      if (possibleScore < satisfyCriterion.value) {
        sum += aggregateData.counts[possibleScore];
      }
    }
    return sum;
  }

  isPercentOfScoresLessThanOrEqualTo(satisfyCriterion, aggregateAutoScores) {
    const aggregateData = this.getAggregateData(satisfyCriterion, aggregateAutoScores);
    const possibleScores = this.getPossibleScores(aggregateData);
    const sum = this.getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores);
    return this.isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum);
  }

  getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores) {
    let sum = 0;
    for (const possibleScore of possibleScores) {
      if (possibleScore <= satisfyCriterion.value) {
        sum += aggregateData.counts[possibleScore];
      }
    }
    return sum;
  }

  isPercentOfScoresEqualTo(satisfyCriterion, aggregateAutoScores) {
    const aggregateData = this.getAggregateData(satisfyCriterion, aggregateAutoScores);
    const possibleScores = this.getPossibleScores(aggregateData);
    const sum = this.getEqualToSum(satisfyCriterion, aggregateData, possibleScores);
    return this.isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum);
  }

  getEqualToSum(satisfyCriterion, aggregateData, possibleScores) {
    let sum = 0;
    for (const possibleScore of possibleScores) {
      if (possibleScore === satisfyCriterion.value) {
        sum += aggregateData.counts[possibleScore];
      }
    }
    return sum;
  }

  isPercentOfScoresNotEqualTo(satisfyCriterion, aggregateAutoScores) {
    const aggregateData = this.getAggregateData(satisfyCriterion, aggregateAutoScores);
    const possibleScores = this.getPossibleScores(aggregateData);
    const sum = this.getNotEqualToSum(satisfyCriterion, aggregateData, possibleScores);
    return this.isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum);
  }

  getNotEqualToSum(satisfyCriterion, aggregateData, possibleScores) {
    let sum = 0;
    for (const possibleScore of possibleScores) {
      if (possibleScore !== satisfyCriterion.value) {
        sum += aggregateData.counts[possibleScore];
      }
    }
    return sum;
  }

  getAggregateData(satisfyCriterion, aggregateAutoScores) {
    const component = aggregateAutoScores[satisfyCriterion.componentId];
    return component[satisfyCriterion.targetVariable];
  }

  getPossibleScores(aggregateData) {
    return Object.keys(aggregateData.counts).map(Number).sort();
  }

  isPercentThresholdSatisfied(satisfyCriterion, aggregateData, sum) {
    const percentOfScores = 100 * sum / aggregateData.scoreCount;
    return percentOfScores >= satisfyCriterion.percentThreshold;
  }

  getProjectAchievementById(achievementId) {
    for (let projectAchievement of this.projectAchievements) {
      if (projectAchievement.id === achievementId) {
        return projectAchievement;
      }
    }
    return {};
  }

  generateName(scoreName) {
    if (scoreName === 'ki') {
      return `name="KI Score"`;
    } else if (scoreName === 'science') {
      return `name="Science Score"`;
    } else if (scoreName === 'engineering') {
      return `name="Engineering Score"`;
    }
  }

  generateCategories(scoreName) {
    if (scoreName === 'ki') {
      return `categories="['1', '2', '3', '4', '5']"`;
    } else {
      return `categories="['0', '1', '2', '3']"`;
    }
  }

  generateData(scoreName) {
    if (scoreName === 'ki') {
      return `name="KI Score"`;
    } else if (scoreName === 'science') {
      return `name="Science Score"`;
    } else if (scoreName === 'engineering') {
      return `name="Engineering Score"`;
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
      `<md-dialog class="dialog--wider">
                <md-toolbar>
                    <div class="md-toolbar-tools">
                        <h2>${ title }</h2>
                    </div>
                </md-toolbar>
                <md-dialog-content class="gray-lighter-bg md-dialog-content">
                    <milestone-details milestone="milestone" on-show-workgroup="onShowWorkgroup(value)" on-visit-node-grading="onVisitNodeGrading()"></milestone-details>
                </md-dialog-content>
                <md-dialog-actions layout="row" layout-align="start center">
                    <md-button class="warn"
                               ng-click="delete()"
                               ng-if="!milestone.type === 'milestoneReport'"
                               aria-label="{{ ::'DELETE' | translate }}">
                        {{ ::'DELETE' | translate }}
                    </md-button>
                    <span flex></span>
                    <md-button class="md-primary"
                               ng-click="edit()"
                               ng-if="!milestone.type === 'milestoneReport'"
                               aria-label="{{ ::'EDIT' | translate }}">
                        {{ ::'EDIT' | translate }}
                    </md-button>
                    <md-button class="md-primary"
                               ng-click="close()"
                               aria-label="{{ ::'CLOSE' | translate }}">
                            {{ ::'CLOSE' | translate }}
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

          $scope.close = function() {
            $mdDialog.hide();
          };

          $scope.edit = function() {
            $mdDialog.hide({ milestone: $scope.milestone, action: 'edit', $event: $event });
          };

          $scope.delete = function() {
            $mdDialog.hide({ milestone: $scope.milestone, action: 'delete' });
          };

          $scope.onShowWorkgroup = function(workgroup) {
            $mdDialog.hide();
            TeacherDataService.setCurrentWorkgroup(workgroup);
            $state.go('root.nodeProgress');
          };

          $scope.onVisitNodeGrading = function() {
            $mdDialog.hide();
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
                               aria-label="{{ ::'CANCEL' | translate }}">
                        {{ ::'CANCEL' | translate }}
                    </md-button>
                    <md-button class="md-primary"
                               ng-click="save()"
                               aria-label="{{ ::'SAVE' | translate }}">
                            {{ ::'SAVE' | translate }}
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

          $scope.close = function() {
            $mdDialog.hide({ milestone: $scope.milestone, $event: $scope.$event });
          };

          $scope.save = function() {
            if ($scope.valid) {
              $mdDialog.hide({ milestone: $scope.milestone, save: true, $event: $scope.$event });
            } else {
              alert($scope.$translate('MILESTONE_EDIT_INVALID_ALERT'));
            }
          };

          $scope.onChange = function(milestone, valid) {
            $scope.milestone = milestone;
            $scope.valid = valid;
          };
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
  'AnnotationService',
  'ConfigService',
  'ProjectService',
  'StudentStatusService',
  'TeacherDataService',
  'TeacherWebSocketService',
  'UtilService',
  'moment'
];

export default MilestonesController;
