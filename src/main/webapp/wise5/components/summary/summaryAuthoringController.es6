'use strict';

import SummaryController from "./summaryController";

class SummaryAuthoringController extends SummaryController {
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
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter,
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
        UtilService);
  }

  authoringSummaryNodeIdChanged() {
    this.authoringComponentContent.summaryComponentId = null;
    const components = this.getComponentsByNodeId(this.authoringComponentContent.summaryNodeId);
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (let component of components) {
      if (this.isComponentTypeAllowed(component.type) && component.id != this.componentId) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents == 1) {
      this.authoringComponentContent.summaryComponentId = allowedComponent.id;
    }
    this.authoringViewComponentChanged();
  }

  isComponentTypeAllowed(componentType) {
    return componentType === 'MultipleChoice';
  }
}

SummaryAuthoringController.$inject = [
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
  'NotificationService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default SummaryAuthoringController;
