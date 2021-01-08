'use strict';

import { Injectable } from '@angular/core';
import { ComponentService } from '../componentService';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';

@Injectable()
export class OpenResponseService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.upgrade.$injector.get('$filter')('translate')('openResponse.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'OpenResponse';
    component.starterSentence = null;
    component.isStudentAttachmentEnabled = false;
    return component;
  }

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    if (component.completionCriteria != null) {
      return this.StudentDataService.isCompletionCriteriaSatisfied(component.completionCriteria);
    } else if (this.hasComponentState(componentStates)) {
      return this.isCompletedByComponentStates(component, componentStates, node);
    }
    return false;
  }

  isCompletedByComponentStates(component: any, componentStates: any[], node: any) {
    if (this.isSubmitRequired(node, component)) {
      return this.isAnyComponentStateHasResponseAndIsSubmit(componentStates);
    } else {
      return this.isAnyComponentStateHasResponse(componentStates);
    }
  }

  displayAnnotation(componentContent: any, annotation: any) {
    if (annotation.displayToStudent === false) {
      return false;
    } else if (annotation.type === 'autoScore') {
      return this.isDisplayAnnotationForAutoScore(componentContent);
    } else if (annotation.type === 'autoComment') {
      return this.isDisplayAnnotationForAutoComment(componentContent);
    }
    return true;
  }

  isDisplayAnnotationForAutoScore(componentContent: any) {
    if (
      (componentContent.cRater != null && !componentContent.cRater.showScore) ||
      componentContent.showAutoScore === false
    ) {
      return false;
    }
    return true;
  }

  isDisplayAnnotationForAutoComment(componentContent: any) {
    if (
      (componentContent.cRater != null && !componentContent.cRater.showFeedback) ||
      componentContent.showAutoFeedback === false
    ) {
      return false;
    }
    return true;
  }

  getStudentDataString(componentState: any) {
    return componentState.studentData.response;
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    if (this.hasStarterSentence(componentContent)) {
      const response = componentState.studentData.response;
      const starterSentence = componentContent.starterSentence;
      return this.hasResponse(componentState) && response !== starterSentence;
    } else {
      return this.hasResponse(componentState);
    }
  }

  hasComponentState(componentStates: any[]) {
    return componentStates != null && componentStates.length > 0;
  }

  hasStarterSentence(componentContent: any) {
    const starterSentence = componentContent.starterSentence;
    return starterSentence != null && starterSentence !== '';
  }

  hasResponse(componentState: any) {
    const response = componentState.studentData.response;
    const attachments = componentState.studentData.attachments;
    return (response != null && response !== '') || attachments.length > 0;
  }

  isAnyComponentStateHasResponse(componentStates: any[]) {
    for (let c = componentStates.length - 1; c >= 0; c--) {
      if (this.hasResponse(componentStates[c])) {
        return true;
      }
    }
    return false;
  }

  isAnyComponentStateHasResponseAndIsSubmit(componentStates: any[]) {
    for (let c = componentStates.length - 1; c >= 0; c--) {
      const componentState = componentStates[c];
      if (this.hasResponse(componentState) && componentState.isSubmit) {
        return true;
      }
    }
    return false;
  }
}
