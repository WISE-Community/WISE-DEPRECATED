'use strict';

import { Injectable } from "@angular/core";
import ConfigService from "./configService";
import { StudentStatusService } from "./studentStatusService";
import { UpgradeModule } from "@angular/upgrade/static";

@Injectable()
export class TeacherWebSocketService {
  runId: number;
  studentsOnlineArray: any[] = [];
  rootScope: any;
  stomp: any;

  constructor(
      private upgrade: UpgradeModule,
      private ConfigService: ConfigService,
      private StudentStatusService: StudentStatusService) {
    this.rootScope = this.upgrade.$injector.get('$rootScope');
    this.stomp = this.upgrade.$injector.get('$stomp');
    this.stomp.setDebug((args) => {
      this.upgrade.$injector.get('$log').debug(args);
    });
  }

  initialize() {
    this.runId = this.ConfigService.getRunId();
    try {
      this.stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
        this.subscribeToTeacherTopic();
        this.subscribeToTeacherWorkgroupTopic();
      });
    } catch(e) {
      console.log(e);
    }
  }

  subscribeToTeacherTopic() {
    this.stomp.subscribe(`/topic/teacher/${this.runId}`, (message, headers, res) => {
      if (message.type === 'studentWork') {
        const studentWork = JSON.parse(message.content);
        this.rootScope.$broadcast('newStudentWorkReceived', {studentWork: studentWork});
      } else if (message.type === 'studentStatus') {
        const status = JSON.parse(message.content);
        this.StudentStatusService.setStudentStatus(status);
        this.rootScope.$emit('studentStatusReceived', {studentStatus: status});
      } else if (message.type === 'newStudentAchievement') {
        const achievement = JSON.parse(message.content);
        this.rootScope.$broadcast('newStudentAchievement', {studentAchievement: achievement});
      } else if (message.type === 'annotation') {
        const annotationData = JSON.parse(message.content);
        this.rootScope.$broadcast('newAnnotationReceived', {annotation: annotationData});
      }
    });
  }

  subscribeToTeacherWorkgroupTopic() {
    this.stomp.subscribe(`/topic/workgroup/${this.ConfigService.getWorkgroupId()}`, (message, headers, res) => {
      if (message.type === 'notification') {
        const notification = JSON.parse(message.content);
        this.rootScope.$broadcast('newNotificationReceived', notification);
      }
    });
  }

  handleStudentsOnlineReceived(studentsOnlineMessage) {
    this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
    this.rootScope.$broadcast('studentsOnlineReceived', {studentsOnline: this.studentsOnlineArray});
  }

  getStudentsOnline() {
    return this.studentsOnlineArray;
  }

  isStudentOnline(workgroupId) {
    return this.studentsOnlineArray.indexOf(workgroupId) > -1;
  }

  handleStudentDisconnected(studentDisconnectedMessage) {
    this.rootScope.$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
  }

  pauseScreens(periodId) {
    this.stomp.send(`/app/pause/${this.runId}/${periodId}`, {}, {});
  }

  unPauseScreens(periodId) {
    this.stomp.send(`/app/unpause/${this.runId}/${periodId}`, {}, {});
  }
}
