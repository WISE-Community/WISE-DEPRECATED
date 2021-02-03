'use strict';

import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';
import { SummaryService } from '../summaryService';

@Component({
  selector: 'summary-authoring.component',
  templateUrl: 'summary-authoring.component.html',
  styleUrls: ['summary-authoring.component.scss']
})
export class SummaryAuthoring extends ComponentAuthoring {
  isResponsesOptionAvailable: boolean = false;
  isHighlightCorrectAnswerAvailable: boolean = false;
  isPieChartAllowed: boolean = true;
  stepNodesDetails: string[];
  inputChange: Subject<string> = new Subject<string>();
  inputChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    private SummaryService: SummaryService,
    private UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.stepNodesDetails = this.ProjectService.getStepNodesDetailsInOrder();
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.inputChangeSubscription.unsubscribe();
  }

  summaryNodeIdChanged(): void {
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

  isComponentTypeAllowed(componentType: string): boolean {
    return this.SummaryService.isComponentTypeAllowed(componentType);
  }

  summaryComponentIdChanged(): void {
    this.performUpdatesIfNecessary();
    this.componentChanged();
  }

  studentDataTypeChanged(): void {
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
    this.componentChanged();
  }

  performUpdatesIfNecessary(): void {
    this.updateStudentDataTypeOptionsIfNecessary();
    this.updateStudentDataTypeIfNecessary();
    this.updateHasCorrectAnswerIfNecessary();
    this.updateChartTypeOptionsIfNecessary();
  }

  updateStudentDataTypeOptionsIfNecessary(): void {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    this.isResponsesOptionAvailable = this.isStudentDataTypeAvailableForComponent(
      nodeId,
      componentId,
      'responses'
    );
  }

  updateStudentDataTypeIfNecessary(): void {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    const studentDataType = this.authoringComponentContent.studentDataType;
    if (!this.isStudentDataTypeAvailableForComponent(nodeId, componentId, studentDataType)) {
      if (this.isStudentDataTypeAvailableForComponent(nodeId, componentId, 'responses')) {
        this.authoringComponentContent.studentDataType = 'responses';
      } else if (this.isStudentDataTypeAvailableForComponent(nodeId, componentId, 'scores')) {
        this.authoringComponentContent.studentDataType = 'scores';
      } else {
        this.authoringComponentContent.studentDataType = null;
      }
    }
  }

  updateHasCorrectAnswerIfNecessary(): void {
    this.isHighlightCorrectAnswerAvailable =
      this.componentHasCorrectAnswer() &&
      this.authoringComponentContent.studentDataType === 'responses';
    if (!this.isHighlightCorrectAnswerAvailable) {
      this.authoringComponentContent.highlightCorrectAnswer = false;
    }
  }

  updateChartTypeOptionsIfNecessary(): void {
    this.isPieChartAllowed =
      this.authoringComponentContent.studentDataType === 'scores' ||
      !this.componentAllowsMultipleResponses();
    if (!this.isPieChartAllowed && this.authoringComponentContent.chartType === 'pie') {
      this.authoringComponentContent.chartType = 'column';
    }
  }

  isStudentDataTypeAvailableForComponent(
    nodeId: string,
    componentId: string,
    studentDataType: string
  ): boolean {
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

  showPromptFromOtherComponentChanged(): void {
    this.componentChanged();
  }

  componentHasCorrectAnswer(): boolean {
    const nodeId = this.authoringComponentContent.summaryNodeId;
    const componentId = this.authoringComponentContent.summaryComponentId;
    if (nodeId != null && componentId != null) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        const componentService = this.ProjectService.getComponentService(component.type);
        return componentService.componentHasCorrectAnswer(component);
      }
    }
    return false;
  }

  componentAllowsMultipleResponses(): boolean {
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

  addCustomLabelColor(): void {
    if (this.authoringComponentContent.customLabelColors == null) {
      this.authoringComponentContent.customLabelColors = [];
    }
    this.authoringComponentContent.customLabelColors.push({ label: '', color: '' });
    this.componentChanged();
  }

  deleteCustomLabelColor(index: number): void {
    if (confirm($localize`Are you sure you want to delete this custom label color?`)) {
      this.authoringComponentContent.customLabelColors.splice(index, 1);
      this.componentChanged();
    }
  }

  moveCustomLabelColorUp(index: number): void {
    this.UtilService.moveObjectUp(this.authoringComponentContent.customLabelColors, index);
    this.componentChanged();
  }

  moveCustomLabelColorDown(index: number): void {
    this.UtilService.moveObjectDown(this.authoringComponentContent.customLabelColors, index);
    this.componentChanged();
  }

  getComponentsByNodeId(nodeId: string): any[] {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }
}
