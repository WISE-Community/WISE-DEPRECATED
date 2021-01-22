'use strict';

import { ComponentService } from '../componentService';
import { UtilService } from '../../services/utilService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentDataService } from '../../services/studentDataService';

@Injectable()
export class SummaryService extends ComponentService {
  componentsWithScoresSummary: string[];
  componentsWithResponsesSummary: string[];

  constructor(
    private upgrade: UpgradeModule,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
    this.componentsWithScoresSummary = [
      'Animation',
      'AudioOscillator',
      'ConceptMap',
      'Discussion',
      'Draw',
      'Embedded',
      'Graph',
      'Label',
      'Match',
      'MultipleChoice',
      'OpenResponse',
      'Table'
    ];
    this.componentsWithResponsesSummary = ['MultipleChoice', 'Table'];
  }

  getComponentTypeLabel() {
    return this.upgrade.$injector.get('$filter')('translate')('summary.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Summary';
    component.summaryNodeId = null;
    component.summaryComponentId = null;
    component.source = 'period';
    component.studentDataType = null;
    component.chartType = 'column';
    component.requirementToSeeSummary = 'submitWork';
    component.highlightCorrectAnswer = false;
    component.customLabelColors = [];
    return component;
  }

  componentHasWork(component) {
    return false;
  }

  isComponentTypeAllowed(componentType) {
    return ['HTML', 'OutsideURL', 'Summary'].indexOf(componentType) === -1;
  }

  isScoresSummaryAvailableForComponentType(componentType) {
    return this.componentsWithScoresSummary.indexOf(componentType) != -1;
  }

  isResponsesSummaryAvailableForComponentType(componentType) {
    return this.componentsWithResponsesSummary.indexOf(componentType) != -1;
  }
}
