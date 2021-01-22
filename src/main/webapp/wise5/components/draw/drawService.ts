'use strict';

import * as angular from 'angular';
import { ComponentService } from '../componentService';
import { StudentAssetService } from '../../services/studentAssetService';
import { Injectable } from '@angular/core';
import { StudentDataService } from '../../services/studentDataService';
import { UpgradeModule } from '@angular/upgrade/static';
import { UtilService } from '../../services/utilService';

@Injectable()
export class DrawService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    private StudentAssetService: StudentAssetService,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.getTranslation('draw.componentTypeLabel');
  }

  getTranslation(key: string) {
    return this.upgrade.$injector.get('$filter')('translate')(key);
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Draw';
    component.stamps = {
      Stamps: []
    };
    component.tools = {
      select: true,
      line: true,
      shape: true,
      freeHand: true,
      text: true,
      stamp: true,
      strokeColor: true,
      fillColor: true,
      clone: true,
      strokeWidth: true,
      sendBack: true,
      sendForward: true,
      undo: true,
      redo: true,
      delete: true
    };
    return component;
  }

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    if (componentStates != null && componentStates.length > 0) {
      if (this.isSubmitRequired(node, component)) {
        return this.hasComponentStateWithIsSubmitTrue(componentStates);
      } else {
        return this.hasComponentStateWithDrawData(componentStates);
      }
    }
    return false;
  }

  hasComponentStateWithIsSubmitTrue(componentStates: any[]) {
    for (let c = componentStates.length - 1; c >= 0; c--) {
      if (componentStates[c].isSubmit) {
        return true;
      }
    }
    return false;
  }

  hasComponentStateWithDrawData(componentStates: any[]) {
    for (let c = componentStates.length - 1; c >= 0; c--) {
      if (componentStates[c].studentData.drawData != null) {
        return true;
      }
    }
    return false;
  }

  removeBackgroundFromComponentState(componentState: any) {
    const drawData = componentState.studentData.drawData;
    const drawDataObject = angular.fromJson(drawData);
    const canvas = drawDataObject.canvas;
    delete canvas.backgroundImage;
    const drawDataJSONString = angular.toJson(drawDataObject);
    componentState.studentData.drawData = drawDataJSONString;
    return componentState;
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    if (componentState != null) {
      const drawDataString = componentState.studentData.drawData;
      const drawData = angular.fromJson(drawDataString);
      if (this.isComponentContentNotNullAndStarterDrawDataExists(componentContent)) {
        const starterDrawData = componentContent.starterDrawData;
        return this.isStudentDrawDataDifferentFromStarterData(drawDataString, starterDrawData);
      } else if (this.isDrawDataContainsObjects(drawData)) {
        return true;
      }
    }
    return false;
  }

  isDrawDataContainsObjects(drawData: any) {
    return (
      drawData.canvas != null &&
      drawData.canvas.objects != null &&
      drawData.canvas.objects.length > 0
    );
  }

  isComponentContentNotNullAndStarterDrawDataExists(componentContent: any) {
    return componentContent != null && this.isStarterDrawDataExists(componentContent);
  }

  isStarterDrawDataExists(componentContent: any) {
    return componentContent.starterDrawData != null && componentContent.starterDrawData !== '';
  }

  isStudentDrawDataDifferentFromStarterData(drawDataString: string, starterDrawData: string) {
    return drawDataString != null && drawDataString !== '' && drawDataString !== starterDrawData;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState: any) {
    return new Promise((resolve, reject) => {
      const canvas = this.getDrawingToolCanvas(componentState.nodeId, componentState.componentId);
      const canvasBase64String = canvas.toDataURL('image/png');
      const imageObject = this.UtilService.getImageObjectFromBase64String(canvasBase64String);
      this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
        resolve(asset);
      });
    });
  }

  getDrawingToolCanvas(nodeId: string, componentId: string) {
    const id = `#drawingtool_${nodeId}_${componentId} canvas`;
    const canvas = angular.element(document.querySelector(id));
    if (canvas != null && canvas.length > 0) {
      return canvas[0];
    }
    return null;
  }
}
