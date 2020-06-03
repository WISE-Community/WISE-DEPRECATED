'use strict';

import ComponentController from '../componentController';
import SummaryService from './summaryService';

class SummaryController extends ComponentController {
  SummaryService: SummaryService;
  summaryNodeId: string;
  summaryComponentId: string;
  studentDataType: string;
  chartType: string;
  prompt: string;
  highlightCorrectAnswer: boolean;
  warningMessage: string;
  otherPrompt: string;
  isStudent: boolean;
  otherStepTitle: string;
  isShowDisplay: boolean;
  periodId: number;
  source: string;

  static $inject = [
    '$filter',
    '$mdDialog',
    '$q',
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

  constructor(
    $filter,
    $mdDialog,
    $q,
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
    UtilService
  ) {
    super(
      $filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
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
    this.source = this.componentContent.source;
    this.setPeriodIdIfNecessary();
  }

  getOtherPrompt(nodeId, componentId) {
    const otherComponent = this.ProjectService.getComponentByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    if (otherComponent != null) {
      return otherComponent.prompt;
    }
    return null;
  }

  isStudentHasWork() {
    const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
      this.summaryNodeId,
      this.summaryComponentId
    );
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
      this.summaryNodeId,
      this.summaryComponentId
    );
    for (const componentState of componentStates) {
      if (componentState.isSubmit) {
        return true;
      }
    }
    return false;
  }

  studentHasSavedWork() {
    const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
      this.summaryNodeId,
      this.summaryComponentId
    );
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
      if (this.source === 'period') {
        this.periodId = this.ConfigService.getPeriodId();
      } else if (this.source === 'allPeriods') {
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

export default SummaryController;
