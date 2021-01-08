'use strict';

import * as $ from 'jquery';
import * as html2canvas from 'html2canvas';
import { ComponentService } from '../componentService';
import { StudentAssetService } from '../../services/studentAssetService';
import { Injectable } from '@angular/core';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentDataService } from '../../services/studentDataService';

@Injectable()
export class EmbeddedService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    protected StudentAssetService: StudentAssetService,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.getTranslation('embedded.componentTypeLabel');
  }

  getTranslation(key: string) {
    return this.upgrade.$injector.get('$filter')('translate')(key);
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Embedded';
    component.url = '';
    component.height = 600;
    return component;
  }

  isCompleted(component: any, componentStates: any[], componentEvents: any[], nodeEvents: any[]) {
    if (componentStates != null) {
      if (
        this.hasComponentStateWithIsCompletedField(componentStates) &&
        this.hasComponentStateWithIsCompletedTrue(componentStates)
      ) {
        return true;
      }
    }
    return this.hasNodeEnteredEvent(nodeEvents);
  }

  hasComponentStateWithIsCompletedField(componentStates: any[]) {
    for (const componentState of componentStates) {
      const studentData = componentState.studentData;
      if (studentData != null && studentData.isCompleted != null) {
        return true;
      }
    }
    return false;
  }

  hasComponentStateWithIsCompletedTrue(componentStates: any[]) {
    for (const componentState of componentStates) {
      const studentData = componentState.studentData;
      if (studentData != null && studentData.isCompleted === true) {
        return true;
      }
    }
    return false;
  }

  hasNodeEnteredEvent(nodeEvents: any[]) {
    for (const nodeEvent of nodeEvents) {
      if (nodeEvent.event === 'nodeEntered') {
        return true;
      }
    }
    return false;
  }

  componentHasWork(component: any) {
    return false;
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    return componentState.studentData != null;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState: any) {
    const modelElement = this.getModelElement(componentState.componentId);
    return new Promise((resolve, reject) => {
      html2canvas(modelElement).then((canvas) => {
        const base64Image = canvas.toDataURL('image/png');
        const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);
        this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
          resolve(asset);
        });
      });
    });
  }

  getModelElement(componentId: string) {
    const iframe = $('#componentApp_' + componentId);
    if (iframe != null && iframe.length > 0) {
      const modelElement: any = iframe.contents().find('html');
      if (modelElement != null && modelElement.length > 0) {
        return modelElement[0];
      }
    }
    return null;
  }
}
