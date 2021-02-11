'use strict';

import { ComponentService } from '../componentService';
import { Injectable } from '@angular/core';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';

@Injectable()
export class MatchService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.upgrade.$injector.get('$filter')('translate')('match.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Match';
    component.choices = [];
    component.buckets = [];
    component.feedback = [{ bucketId: '0', choices: [] }];
    component.ordered = false;
    return component;
  }

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    if (componentStates && componentStates.length > 0) {
      const isSubmitRequired = this.isSubmitRequired(node, component);
      for (const componentState of componentStates) {
        const buckets = componentState.studentData.buckets;
        if (buckets && buckets.length > 0) {
          if (!isSubmitRequired || (isSubmitRequired && componentState.isSubmit)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    if (componentState != null) {
      const buckets = componentState.studentData.buckets;
      for (const bucket of buckets) {
        const items = bucket.items;
        if (items != null && items.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  hasCorrectAnswer(component: any) {
    for (const bucket of component.feedback) {
      for (const choice of bucket.choices) {
        if (choice.isCorrect) {
          return true;
        }
      }
    }
    return false;
  }

  getChoiceById(id: string, choices: any[]): any {
    return this.getItemById(id, choices);
  }

  getBucketById(id: string, buckets: any[]): any {
    return this.getItemById(id, buckets);
  }

  getItemById(id: string, items: any[]): any {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
    }
    return null;
  }

  componentHasCorrectAnswer(component: any): boolean {
    for (const feedback of component.feedback) {
      for (const choice of feedback.choices) {
        if (choice.isCorrect) {
          return true;
        }
      }
    }
    return false;
  }
}
