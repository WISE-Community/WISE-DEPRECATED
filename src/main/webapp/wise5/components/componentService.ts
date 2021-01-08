'use strict';

import { Injectable } from '@angular/core';
import { StudentDataService } from '../services/studentDataService';
import { UtilService } from '../services/utilService';

@Injectable()
export class ComponentService {
  constructor(
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
  }

  /**
   * Get the component type label. For example "Open Response".
   * @returns {string}
   */
  getComponentTypeLabel() {
    return '';
  }

  /**
   * Create a component object
   * @returns {object} a component object
   */
  createComponent() {
    return {
      id: this.UtilService.generateKey(),
      type: '',
      prompt: '',
      showSaveButton: false,
      showSubmitButton: false
    };
  }

  /**
   * Check if the component was completed
   * @param component the component object
   * @param componentStates the component states for the specific component
   * @param componentEvents the events for the specific component
   * @param nodeEvents the events for the parent node of the component
   * @param node parent node of the component
   * @returns {boolean} whether the component was completed
   */
  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    return true;
  }

  /**
   * Check if we need to display the annotation to the student
   * @param componentContent the component content
   * @param annotation the annotation
   * @returns {boolean} whether we need to display the annotation to the student
   */
  displayAnnotation(componentContent, annotation) {
    return true;
  }

  /**
   * Whether this component generates student work
   * @param component (optional) the component object. if the component object
   * is not provided, we will use the default value of whether the
   * component type usually has work.
   * @return {boolean} whether this component generates student work
   */
  componentHasWork(component) {
    return true;
  }

  /**
   * Check if the component state has student work. Sometimes a component
   * state may be created if the student visits a component but doesn't
   * actually perform any work. This is where we will check if the student
   * actually performed any work.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return {boolean} whether the component state has any work
   */
  componentStateHasStudentWork(componentState, componentContent) {
    return false;
  }

  /**
   * Get the human readable student data string
   * @param componentState the component state
   * @return {string} a human readable student data string
   */
  getStudentDataString(componentState) {
    return '';
  }

  /**
   * Whether this component uses a save button
   * @return {boolean} whether this component uses a save button
   */
  componentUsesSaveButton() {
    return true;
  }

  /**
   * Whether this component uses a submit button
   * @return {boolean} whether this component uses a submit button
   */
  componentUsesSubmitButton() {
    return true;
  }

  componentHasCorrectAnswer(component) {
    return false;
  }

  isSubmitRequired(node: any, component: any) {
    return node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);
  }
}
