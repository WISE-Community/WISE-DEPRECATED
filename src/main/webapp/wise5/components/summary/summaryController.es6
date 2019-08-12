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
    this.summaryStudentDataType = this.componentContent.summaryStudentDataType;
    this.chartType = this.componentContent.chartType;
    this.prompt = this.componentContent.prompt;
    if (this.componentContent.showPromptFromOtherComponent) {
      this.otherPrompt = this.getOtherPrompt(this.summaryNodeId, this.summaryComponentId);
    }
    this.isStudent = this.ConfigService.isPreview() || this.ConfigService.isStudentRun();
    if (this.isStudent) {
      this.otherStepTitle = this.getOtherStepTitle();
      this.studentHasWork = this.isStudentHasWork();
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

  getOtherStepTitle() {
    return this.ProjectService.getNodePositionAndTitleByNodeId(this.summaryNodeId);
  }

  setPeriodIdIfNecessary() {
    if (this.ConfigService.isStudentRun()) {
      if (this.componentContent.summarySource === 'period') {
        this.periodId = this.ConfigService.getPeriodId();
      } else if (this.componentContent.summarySource === 'allPeriods') {
        this.periodId = null;
      }
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