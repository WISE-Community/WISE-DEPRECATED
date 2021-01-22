'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class SummaryAuthoringController extends EditComponentController {
  isResponsesOptionAvailable: boolean = false;
  isHighlightCorrectAnswerAvailable: boolean = false;
  isPieChartAllowed: boolean = true;

  static $inject = [
    '$filter',
    '$injector',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'SummaryService',
    'UtilService'
  ];

  constructor(
    protected $filter,
    protected $injector,
    protected ConfigService,
    protected NodeService,
    protected NotificationService,
    protected ProjectAssetService,
    protected ProjectService,
    protected SummaryService,
    protected UtilService
  ) {
    super(
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  $onInit() {
    super.$onInit();
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
  }

  summaryNodeIdChanged() {
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
    this.componentChanged();
  }

  isComponentTypeAllowed(componentType: string) {
    return this.SummaryService.isComponentTypeAllowed(componentType);
  }

  summaryComponentIdChanged() {
    this.performUpdatesIfNecessary();
    this.componentChanged();
  }

  studentDataTypeChanged() {
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
    this.componentChanged();
  }

  performUpdatesIfNecessary() {
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateStudentDataTypeIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
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
    this.componentChanged();
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
    this.componentChanged();
  }

  deleteCustomLabelColor(index: number) {
    if (confirm(this.$translate('summary.areYouSureYouWantToDeleteThisCustomLabelColor'))) {
      this.authoringComponentContent.customLabelColors.splice(index, 1);
      this.triggerCustomLabelColorChange();
      this.componentChanged();
    }
  }

  customLabelColorChanged() {
    this.triggerCustomLabelColorChange();
    this.componentChanged();
  }

  moveCustomLabelColorUp(index: number) {
    this.UtilService.moveObjectUp(this.authoringComponentContent.customLabelColors, index);
    this.componentChanged();
  }

  moveCustomLabelColorDown(index: number) {
    this.UtilService.moveObjectDown(this.authoringComponentContent.customLabelColors, index);
    this.componentChanged();
  }

  triggerCustomLabelColorChange() {
    /*
     * AngularJS doesn't detect a change on arrays when an array's content changes. We need to
     * create a new array using concat() to actually trigger a change so the SummaryDisplay will
     * update when a custom label color is changed in the authoring view.
     */
    this.authoringComponentContent.customLabelColors = this.authoringComponentContent.customLabelColors.concat();
  }
}

const SummaryAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: SummaryAuthoringController,
  controllerAs: 'summaryController',
  templateUrl: 'wise5/components/summary/authoring.html'
};

export default SummaryAuthoring;
