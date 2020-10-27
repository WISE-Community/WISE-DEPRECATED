'use strict';

import * as angular from 'angular';
import ComponentController from '../componentController';
import { SummaryService } from './summaryService';

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
  customLabelColors: any[];

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'SummaryService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    NodeService,
    NotebookService,
    NotificationService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    SummaryService,
    UtilService
  ) {
    super(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
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
    this.source = this.componentContent.source;
    this.customLabelColors = this.componentContent.customLabelColors;
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
    if (this.isRequirementToSeeSummarySubmitWork()) {
      return this.studentHasSubmittedWork();
    } else if (this.isRequirementToSeeSummaryCompleteComponent()) {
      return this.studentHasCompletedComponent();
    } else if (this.isRequirementToSeeSummaryNone()) {
      return true;
    }
  }

  getWarningMessage() {
    if (this.isSourceSelf()) {
      return this.getWarningMessageForSourceSelf();
    } else if (this.isSourcePeriod() || this.isSourceAllPeriods()) {
      return this.getWarningMessageForSourceClass();
    }
  }

  isSourceSelf() {
    return this.source === 'self';
  }

  isSourcePeriod() {
    return this.source === 'period';
  }

  isSourceAllPeriods() {
    return this.source === 'allPeriods';
  }

  getWarningMessageForSourceSelf() {
    let messageTranslationKey = '';
    if (this.isRequirementToSeeSummarySubmitWork()) {
      messageTranslationKey = 'summary.youMustSubmitWorkToViewSelfSummary';
    } else if (this.isRequirementToSeeSummaryCompleteComponent()) {
      messageTranslationKey = 'summary.youMustCompleteToViewSelfSummary';
    }
    return this.$translate(messageTranslationKey, { stepTitle: this.otherStepTitle });
  }

  getWarningMessageForSourceClass() {
    let messageTranslationKey = '';
    if (this.isRequirementToSeeSummarySubmitWork()) {
      messageTranslationKey = 'summary.youMustSubmitWorkToViewClassSummary';
    } else if (this.isRequirementToSeeSummaryCompleteComponent()) {
      messageTranslationKey = 'summary.youMustCompleteToViewClassSummary';
    }
    return this.$translate(messageTranslationKey, { stepTitle: this.otherStepTitle });
  }

  isRequirementToSeeSummarySubmitWork() {
    return this.componentContent.requirementToSeeSummary === 'submitWork';
  }

  isRequirementToSeeSummaryCompleteComponent() {
    return this.componentContent.requirementToSeeSummary === 'completeComponent';
  }

  isRequirementToSeeSummaryNone() {
    return this.componentContent.requirementToSeeSummary === 'none';
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

  handleStudentWorkSavedToServerAdditionalProcessing(args: any) {
    if (this.isStudent) {
      this.isShowDisplay = this.calculateIsShowDisplay();
    }
  }
}

export default SummaryController;
