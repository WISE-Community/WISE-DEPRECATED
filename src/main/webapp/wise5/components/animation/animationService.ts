'use strict';

import { ComponentService } from '../componentService';
import { Injectable } from '@angular/core';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentDataService } from '../../services/studentDataService';

@Injectable()
export class AnimationService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.getTranslation('animation.componentTypeLabel');
  }

  getTranslation(key: string) {
    return this.upgrade.$injector.get('$filter')('translate')(key);
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Animation';
    component.widthInPixels = 600;
    component.widthInUnits = 60;
    component.heightInPixels = 200;
    component.heightInUnits = 20;
    component.dataXOriginInPixels = 0;
    component.dataYOriginInPixels = 80;
    component.coordinateSystem = 'screen';
    component.objects = [];
    return component;
  }

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    return componentStates.length > 0;
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    if (componentState != null) {
      return componentState.studentData != null;
    }
    return false;
  }
}
