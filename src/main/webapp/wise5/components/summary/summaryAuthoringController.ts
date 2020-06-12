'use strict';

import SummaryController from './summaryController';

class SummaryAuthoringController extends SummaryController {
  $injector: any;
  isResponsesOptionAvailable: boolean;
  isHighlightCorrectAnswerAvailable: boolean;
  isPieChartAllowed: boolean;

  static $inject = [
    '$filter',
    '$injector',
    '$q',
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

  constructor(
    $filter,
    $injector,
    $q,
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
      SummaryService,
      UtilService
    );
    this.$injector = $injector;
    this.isResponsesOptionAvailable = false;
    this.isHighlightCorrectAnswerAvailable = false;
    this.isPieChartAllowed = true;
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
  }

  authoringSummaryNodeIdChanged() {
    this.authoringComponentContent.summaryComponentId = null;
    const components = this.getComponentsByNodeId(this.authoringComponentContent.summaryNodeId);
    const allowedComponents = [];
    for (const component of components) {
      if (this.isComponentTypeAllowed(component.type) && component.id != this.componentId) {
        allowedComponents.push(component);
      }
    }
    if (allowedComponents.length === 1) {
      this.authoringComponentContent.summaryComponentId = allowedComponents[0].id;
    }
    this.performUpdatesIfNecessary();
    this.authoringViewComponentChanged();
  }

  isComponentTypeAllowed(componentType: string) {
    return this.SummaryService.isComponentTypeAllowed(componentType);
  }

  authoringSummaryComponentIdChanged() {
    this.performUpdatesIfNecessary();
    this.authoringViewComponentChanged();
  }

  studentDataTypeChanged() {
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
    this.authoringViewComponentChanged();
  }

  performUpdatesIfNecessary() {
    this.updateOtherPrompt();
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateStudentDataTypeIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
  }

  updateOtherPrompt() {
    this.otherPrompt = this.getOtherPrompt(
      this.authoringComponentContent.summaryNodeId,
      this.authoringComponentContent.summaryComponentId
    );
  }

  updateStudentDataTypeOptionsIfNecessary() {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    this.isResponsesOptionAvailable = this.isStudentDataTypeAvailableForComponent(
      nodeId,
      componentId,
      'responses'
    );
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
    this.isHighlightCorrectAnswerAvailable =
      this.componentHasCorrectAnswer() &&
      this.authoringComponentContent.studentDataType === 'responses';
    if (!this.isHighlightCorrectAnswerAvailable) {
      this.authoringComponentContent.highlightCorrectAnswer = false;
    }
  }

  updateChartTypeOptionsIfNecessary() {
    this.isPieChartAllowed =
      this.authoringComponentContent.studentDataType === 'scores' ||
      !this.componentAllowsMultipleResponses();
    if (!this.isPieChartAllowed && this.authoringComponentContent.chartType === 'pie') {
      this.authoringComponentContent.chartType = 'column';
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

  componentAllowsMultipleResponses() {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    if (nodeId != null && componentId != null) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        return component.choiceType === 'checkbox';
      }
    }
    return false;
  }

  addCustomLabelColor() {
    if (this.authoringComponentContent.customLabelColors == null) {
      this.authoringComponentContent.customLabelColors = [];
    }
    this.authoringComponentContent.customLabelColors.push({ label: '', color: '' });
    this.authoringViewComponentChanged();
  }

  deleteCustomLabelColor(index: number) {
    if (confirm(this.$translate('summary.areYouSureYouWantToDeleteThisCustomLabelColor'))) {
      this.authoringComponentContent.customLabelColors.splice(index, 1);
      this.triggerCustomLabelColorChange();
      this.authoringViewComponentChanged();
    }
  }

  customLabelColorChanged() {
    this.triggerCustomLabelColorChange();
    this.authoringViewComponentChanged();
  }

  moveCustomLabelColorUp(index: number) {
    this.UtilService.moveObjectUp(this.authoringComponentContent.customLabelColors, index);
    this.authoringViewComponentChanged();
  }

  moveCustomLabelColorDown(index: number) {
    this.UtilService.moveObjectDown(this.authoringComponentContent.customLabelColors, index);
    this.authoringViewComponentChanged();
  }

  triggerCustomLabelColorChange() {
    /*
     * AngularJS doesn't detect a change on arrays when an array's content changes. We need to
     * create a new array using concat() to actually trigger a change so the SummaryDisplay will
     * update when a custom label color is changed in the authoring view.
     */
    this.authoringComponentContent.customLabelColors =
        this.authoringComponentContent.customLabelColors.concat();
  }
}

export default SummaryAuthoringController;
