'use strict';

import ComponentController from '../componentController';

class SummaryController extends ComponentController {

  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      SummaryService,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
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
    this.summaryNodeId = this.componentContent.summaryNodeId;
    this.summaryComponentId = this.componentContent.summaryComponentId;
    this.prompt = this.componentContent.prompt;
    if (this.componentContent.showPromptFromOtherComponent) {
      const otherComponent = this.ProjectService.getComponentByNodeIdAndComponentId(
          this.summaryNodeId, this.summaryComponentId);
      if (otherComponent != null) {
        this.otherPrompt = otherComponent.prompt;
      }
    }
    if (this.ConfigService.getMode() === 'studentRun') {
      this.periodId = this.ConfigService.getPeriodId();
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
    'SummaryService',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
];

export default SummaryController;