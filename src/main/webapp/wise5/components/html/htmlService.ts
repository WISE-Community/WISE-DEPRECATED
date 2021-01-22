import { ComponentService } from '../componentService';
import { Injectable } from '@angular/core';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';

@Injectable()
export class HTMLService extends ComponentService {
  constructor(
    private upgrade: UpgradeModule,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.getTranslation('html.componentTypeLabel');
  }

  getTranslation(key: string) {
    return this.upgrade.$injector.get('$filter')('translate')(key);
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'HTML';
    component.html = this.getTranslation('html.enterHTMLHere');
    return component;
  }

  isCompleted(component: any, componentStates: any[], componentEvents: any[], nodeEvents: any[]) {
    if (nodeEvents != null) {
      for (const nodeEvent of nodeEvents) {
        if (nodeEvent.event === 'nodeEntered') {
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
}
