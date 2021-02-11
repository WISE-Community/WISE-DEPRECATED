import * as angular from 'angular';
import { Component } from '@angular/core';
import { ComponentGrading } from '../../../classroomMonitor/classroomMonitorComponents/shared/component-grading.component';

@Component({
  selector: 'open-response-grading',
  templateUrl: 'open-response-grading.component.html'
})
export class OpenResponseGrading extends ComponentGrading {
  studentResponse: string = '';
  attachments: any[] = [];
  audioAttachments: any[] = [];
  otherAttachments: any[] = [];

  ngOnInit(): void {
    if (this.componentState != null && this.componentState !== '') {
      this.componentState = this.convertComponentStateFromStringToObject(this.componentState);
      this.studentResponse = this.getStudentResponse(this.componentState);
      this.attachments = this.getAttachments(this.componentState);
      this.processAttachments(this.attachments);
    }
  }

  convertComponentStateFromStringToObject(componentState: any): any {
    return angular.fromJson(componentState);
  }

  getStudentResponse(componentState: any): string {
    return componentState.studentData.response;
  }

  getAttachments(componentState: any): any[] {
    return componentState.studentData.attachments;
  }

  processAttachments(attachments: any[]): void {
    for (const attachment of attachments) {
      if (attachment.type === 'audio') {
        this.audioAttachments.push(attachment);
      } else {
        this.otherAttachments.push(attachment);
      }
    }
  }
}
