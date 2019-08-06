'use strict';

import SummaryController from './summaryController';

class SummaryAuthoringController extends SummaryController {
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
        SummaryService,
        UtilService);
  }

  authoringSummaryNodeIdChanged() {
    this.authoringComponentContent.summaryComponentId = null;
    const components = this.getComponentsByNodeId(this.authoringComponentContent.summaryNodeId);
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of components) {
      if (this.isComponentTypeAllowed(component.type) && component.id != this.componentId) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      this.authoringComponentContent.summaryComponentId = allowedComponent.id;
    }
    this.updateOtherPrompt();
    this.authoringViewComponentChanged();
  }

  authoringSummaryComponentIdChanged() {
    this.updateOtherPrompt();
    this.authoringViewComponentChanged();
  }

  isComponentTypeAllowed(componentType) {
    return this.SummaryService.isComponentTypeAllowed(componentType);
  }

  updateOtherPrompt() {
    this.otherPrompt = this.getOtherPrompt(this.authoringComponentContent.summaryNodeId,
      this.authoringComponentContent.summaryComponentId); 
  }
}

SummaryAuthoringController.$inject = [
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

export default SummaryAuthoringController;
