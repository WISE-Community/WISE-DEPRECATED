'use strict';

import SummaryController from './summaryController';

class SummaryAuthoringController extends SummaryController {
  constructor($filter,
      $injector,
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
    this.$injector = $injector;
    this.isResponsesOptionAvailable = false;
    this.isHighlightCorrectAnswerAvailable = false;
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
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
    this.performUpdatesIfNecessary();
    this.authoringViewComponentChanged();
  }

  isComponentTypeAllowed(componentType) {
    return this.SummaryService.isComponentTypeAllowed(componentType);
  }

  authoringSummaryComponentIdChanged() {
    this.performUpdatesIfNecessary();
    this.authoringViewComponentChanged();
  }

  studentDataTypeChanged() {
    this.updateHasCorrectAnswerIfNecessary();
    this.authoringViewComponentChanged();
  }

  performUpdatesIfNecessary() {
    this.updateOtherPrompt();
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateStudentDataTypeIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
  }

  updateOtherPrompt() {
    this.otherPrompt = this.getOtherPrompt(this.authoringComponentContent.summaryNodeId,
      this.authoringComponentContent.summaryComponentId);
  }

  updateStudentDataTypeOptionsIfNecessary() {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    this.isResponsesOptionAvailable = 
        this.isStudentDataTypeAvailableForComponent(nodeId, componentId, 'responses');
  }

  updateStudentDataTypeIfNecessary() {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    const studentDataType = this.authoringComponentContent.studentDataType;
    if (!this.isStudentDataTypeAvailableForComponent(nodeId, componentId, studentDataType)) {
      if (this.isStudentDataTypeAvailableForComponent(nodeId, componentId, 'scores')) {
        this.authoringComponentContent.studentDataType = 'scores';
      } else {
        this.authoringComponentContent.studentDataType = null;
      }
    }
  }

  updateHasCorrectAnswerIfNecessary() {
    this.isHighlightCorrectAnswerAvailable = this.componentHasCorrectAnswer() &&
        this.authoringComponentContent.studentDataType === 'responses';
    if (!this.isHighlightCorrectAnswerAvailable) {
      this.authoringComponentContent.highlightCorrectAnswer = false;
    }
  }

  isStudentDataTypeAvailableForComponent(nodeId, componentId, studentDataType) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      if (studentDataType === 'scores') {
        return this.SummaryService.isScoresSummaryAvailableForComponentType(component.type);
      } else if (studentDataType === 'responses') {
        return this.SummaryService.isResponsesSummaryAvailableForComponentType(component.type);
      }
    }
    return false;
  }

  showPromptFromOtherComponentChanged() {
    this.updateOtherPrompt();
    this.authoringViewComponentChanged();
  }

  componentHasCorrectAnswer() {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    if (nodeId != null && componentId != null) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        const componentService = this.$injector.get(component.type + 'Service');
        return componentService.componentHasCorrectAnswer(component);
      }
    }
    return false;
  }
}

SummaryAuthoringController.$inject = [
  '$filter',
  '$injector',
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
