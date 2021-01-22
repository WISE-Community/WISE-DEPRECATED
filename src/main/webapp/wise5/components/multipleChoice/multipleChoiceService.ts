'use strict';

import { ComponentService } from '../componentService';
import { Injectable } from '@angular/core';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';

@Injectable()
export class MultipleChoiceService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.upgrade.$injector.get('$filter')('translate')('multipleChoice.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'MultipleChoice';
    component.choiceType = 'radio';
    component.choices = [];
    component.showFeedback = true;
    return component;
  }

  /**
   * Check if the student chose a specific choice
   * @param criteria the criteria object
   * @returns a boolean value whether the student chose the choice specified in the
   * criteria object
   */
  choiceChosen(criteria: any) {
    const nodeId = criteria.params.nodeId;
    const componentId = criteria.params.componentId;
    const constraintChoiceIds = criteria.params.choiceIds;
    const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    if (latestComponentState != null) {
      const studentChoices = latestComponentState.studentData.studentChoices;
      const studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);
      return this.isChoicesSelected(studentChoiceIds, constraintChoiceIds);
    }
    return false;
  }

  isChoicesSelected(studentChoiceIds: any, constraintChoiceIds: any) {
    if (typeof constraintChoiceIds === 'string') {
      return studentChoiceIds.length === 1 && studentChoiceIds[0] === constraintChoiceIds;
    } else if (Array.isArray(constraintChoiceIds)) {
      return this.isChoiceIdsMatch(studentChoiceIds, constraintChoiceIds);
    }
    return false;
  }

  isChoiceIdsMatch(choiceIds1: string[], choiceIds2: string[]) {
    if (choiceIds1.length === choiceIds2.length) {
      for (let choiceId of choiceIds2) {
        if (choiceIds1.indexOf(choiceId) === -1) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Get the student choice ids from the student choice objects
   * @param studentChoices an array of student choice objects. these objects contain
   * an id and text fields
   * @returns an array of choice id strings
   */
  getStudentChoiceIdsFromStudentChoiceObjects(studentChoices: any[]) {
    const choiceIds = [];
    if (studentChoices != null) {
      for (const studentChoice of studentChoices) {
        if (studentChoice != null) {
          choiceIds.push(studentChoice.id);
        }
      }
    }
    return choiceIds;
  }

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    if (componentStates && componentStates.length) {
      const isSubmitRequired = this.isSubmitRequired(node, component);
      for (let c = componentStates.length - 1; c >= 0; c--) {
        const componentState = componentStates[c];
        const studentChoices = this.getStudentChoicesFromComponentState(componentState);
        if (
          studentChoices != null &&
          (!isSubmitRequired || (isSubmitRequired && componentState.isSubmit))
        ) {
          return true;
        }
      }
    }
    return false;
  }

  getStudentChoicesFromComponentState(componentState: any) {
    if (componentState.studentData) {
      return componentState.studentData.studentChoices;
    }
    return [];
  }

  /**
   * Get the human readable student data string
   * @param componentState the component state
   * @return a human readable student data string
   */
  getStudentDataString(componentState: any) {
    if (componentState != null) {
      const studentData = componentState.studentData;
      if (studentData != null) {
        const studentChoices = studentData.studentChoices;
        if (studentChoices != null) {
          return studentChoices.map((studentChoice) => studentChoice.text).join(', ');
        }
      }
    }
    return '';
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    if (componentState != null) {
      const studentData = componentState.studentData;
      if (studentData != null) {
        const studentChoices = studentData.studentChoices;
        if (studentChoices != null && studentChoices.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  componentHasCorrectAnswer(component: any) {
    for (const choice of component.choices) {
      if (choice.isCorrect) {
        return true;
      }
    }
    return false;
  }
}
