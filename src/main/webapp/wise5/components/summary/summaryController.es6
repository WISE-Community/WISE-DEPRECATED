'use strict';

import ComponentController from '../componentController';

class SummaryController extends ComponentController {

  constructor($filter,
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
      const otherComponent = this.ProjectService.getComponentByNodeIdAndComponentId(
          this.summaryNodeId, this.summaryComponentId);
      if (otherComponent != null) {
        this.otherPrompt = otherComponent.prompt;
      }
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
}

SummaryController.$inject = [
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

export default SummaryController;