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
    this.chartType = this.componentContent.chartType;
    this.prompt = this.componentContent.prompt;
    if (this.componentContent.showPromptFromOtherComponent) {
      this.otherPrompt = this.getOtherPrompt(this.summaryNodeId, this.summaryComponentId);
    }
    if (this.ConfigService.getMode() === 'studentRun') {
      if (this.componentContent.summarySource === 'period') {
        this.periodId = this.ConfigService.getPeriodId();
      } else if (this.componentContent.summarySource === 'allPeriods') {
        this.periodId = null;
      }
    } else if (this.ConfigService.getMode() === 'classroomMonitor') {
      const studentWorkgroupId = this.workgroupId;
      this.periodId = this.ConfigService.getPeriodIdByWorkgroupId(studentWorkgroupId);
    }
  }

  getOtherPrompt(nodeId, componentId) {
    const otherComponent = this.ProjectService.getComponentByNodeIdAndComponentId(
        nodeId, componentId);
    if (otherComponent != null) {
      return otherComponent.prompt;
    }
    return null;
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