'use strict';

import ComponentController from '../componentController';

class SummaryController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      SummaryService,
      UtilService) {
    super($filter,
        $mdDialog,
        $rootScope,
        $scope,
        AnnotationService,
        ConfigService,
        NodeService,
        NotebookService,
        ProjectService,
        StudentAssetService,
        StudentDataService,
        UtilService);
    this.SummaryService = SummaryService;
    this.summaryNodeId = this.componentContent.summaryNodeId;
    this.summaryComponentId = this.componentContent.summaryComponentId;
    this.studentDataType = this.componentContent.studentDataType;
    this.chartType = this.componentContent.chartType;
    this.prompt = this.componentContent.prompt;
    this.highlightCorrectAnswer = this.componentContent.highlightCorrectAnswer;
    this.warningMessage = '';
    if (this.componentContent.showPromptFromOtherComponent) {
      this.otherPrompt = this.getOtherPrompt(this.summaryNodeId, this.summaryComponentId);
    }
    this.isStudent = this.ConfigService.isPreview() || this.ConfigService.isStudentRun();
    if (this.isStudent) {
      this.otherStepTitle = this.getOtherStepTitle();
      this.isShowDisplay = this.calculateIsShowDisplay();
    } else {
      this.isShowDisplay = true;
    }
    if (!this.isShowDisplay) {
      this.warningMessage = this.getWarningMessage();
    }
    this.setPeriodIdIfNecessary();
  }

  getOtherPrompt(nodeId, componentId) {
    const otherComponent = this.ProjectService.getComponentByNodeIdAndComponentId(
        nodeId, componentId);
    if (otherComponent != null) {
      return otherComponent.prompt;
    }
    return null;
  }

  isStudentHasWork() {
    const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
        this.summaryNodeId, this.summaryComponentId);
    return componentStates.length > 0;
  }

  calculateIsShowDisplay() {
    if (this.componentContent.requirementToSeeSummary === 'submitWork') {
      return this.studentHasSubmittedWork();
    } else if (this.componentContent.requirementToSeeSummary === 'completeComponent') {
      return this.studentHasCompletedComponent();
    } else if (this.componentContent.requirementToSeeSummary === 'none') {
      return true;
    }
  }

  getWarningMessage() {
    let messageTranslationKey = '';
    if (this.componentContent.requirementToSeeSummary === 'submitWork') {
      messageTranslationKey = 'summary.youMustSubmitWork';
    } else if (this.componentContent.requirementToSeeSummary === 'completeComponent') {
      messageTranslationKey = 'summary.youMustComplete';
    }
    return this.$translate(messageTranslationKey, { stepTitle: this.otherStepTitle });
  }

  studentHasSubmittedWork() {
    const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
        this.summaryNodeId, this.summaryComponentId);
    for (const componentState of componentStates) {
      if (componentState.isSubmit) {
        return true;
      }
    }
    return false;
  }

  studentHasSavedWork() {
    const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
        this.summaryNodeId, this.summaryComponentId);
    return componentStates.length > 0;
  }

  studentHasCompletedComponent() {
    return this.StudentDataService.isCompleted(this.summaryNodeId, this.summaryComponentId);
  }

  getOtherStepTitle() {
    return this.ProjectService.getNodePositionAndTitleByNodeId(this.summaryNodeId);
  }

  setPeriodIdIfNecessary() {
    if (this.ConfigService.isStudentRun()) {
      if (this.componentContent.source === 'period') {
        this.periodId = this.ConfigService.getPeriodId();
      } else if (this.componentContent.source === 'allPeriods') {
        this.periodId = null;
      }
    }
  }

  handleStudentWorkSavedToServerAdditionalProcessing(event, args) {
    if (this.isStudent) {
      this.isShowDisplay = this.calculateIsShowDisplay();
    }
  }
}

SummaryController.$inject = [
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'SummaryService',
    'UtilService'
];

export default SummaryController;
