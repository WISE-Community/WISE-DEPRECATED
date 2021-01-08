'use strict';

import { ComponentService } from '../componentService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient } from '@angular/common/http';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';

@Injectable()
export class OutsideURLService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    private http: HttpClient,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.upgrade.$injector.get('$filter')('translate')('outsideURL.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'OutsideURL';
    component.url = '';
    component.height = 600;
    return component;
  }

  isCompleted(component: any, componentStates: any[], componentEvents: any[], nodeEvents: any[]) {
    if (nodeEvents != null) {
      for (const event of nodeEvents) {
        if (event.event === 'nodeEntered') {
          return true;
        }
      }
    }
    return false;
  }

  componentHasWork(component: any) {
    return false;
  }

  componentUsesSaveButton() {
    return false;
  }

  componentUsesSubmitButton() {
    return false;
  }

  getOpenEducationalResources() {
    return this.http
      .get(`wise5/components/outsideURL/resources.json`)
      .toPromise()
      .then((result) => {
        return result;
      });
  }
}
