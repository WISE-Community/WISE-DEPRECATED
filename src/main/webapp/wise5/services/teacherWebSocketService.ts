'use strict';

import { Injectable } from "@angular/core";
import { ConfigService } from "./configService";
import { StudentStatusService } from "./studentStatusService";
import { UpgradeModule } from "@angular/upgrade/static";
import { NotificationService } from "./notificationService";

@Injectable()
export class TeacherWebSocketService {

  runId: number;
  studentsOnlineArray: any[] = [];
  rootScope: any;
  stomp: any;

  constructor(
      private upgrade: UpgradeModule,
      private ConfigService: ConfigService,
      private NotificationService: NotificationService,
      private StudentStatusService: StudentStatusService) {
    if (this.upgrade.$injector != null) {
      this.initializeStomp();
    }
  }

  initializeStomp() {
    this.stomp = this.upgrade.$injector.get('$stomp');
    this.stomp.setDebug(() => {});
  }

  getStomp() {
    return this.stomp;
  }

  getRootScope() {
    if (this.rootScope == null) {
      this.rootScope = this.upgrade.$injector.get('$rootScope');
    }
    return this.rootScope;
  }

  initialize() {
    this.runId = this.ConfigService.getRunId();
    try {
      this.getStomp().connect(this.ConfigService.getWebSocketURL()).then((frame) => {
        this.subscribeToTeacherTopic();
        this.subscribeToTeacherWorkgroupTopic();
      });
    } catch(e) {
      console.log(e);
    }
  }

  subscribeToTeacherTopic() {
    this.getStomp().subscribe(`/topic/teacher/${this.runId}`, (message, headers, res) => {
      if (message.type === 'studentWork') {
        const studentWork = JSON.parse(message.content);
        this.getRootScope().$broadcast('newStudentWorkReceived', {studentWork: studentWork});
      } else if (message.type === 'studentStatus') {
        const status = JSON.parse(message.content);
        this.StudentStatusService.setStudentStatus(status);
        this.getRootScope().$emit('studentStatusReceived', {studentStatus: status});
      } else if (message.type === 'newStudentAchievement') {
        const achievement = JSON.parse(message.content);
        this.getRootScope().$broadcast('newStudentAchievement', {studentAchievement: achievement});
      } else if (message.type === 'annotation') {
        const annotationData = JSON.parse(message.content);
        this.getRootScope().$broadcast('newAnnotationReceived', {annotation: annotationData});
      }
    });
  }

  subscribeToTeacherWorkgroupTopic() {
    this.getStomp().subscribe(`/topic/workgroup/${this.ConfigService.getWorkgroupId()}`,
        (message, headers, res) => {
      if (message.type === 'notification') {
        this.NotificationService.addNotification(JSON.parse(message.content));
      }
    });
  }

  handleStudentsOnlineReceived(studentsOnlineMessage) {
    this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
    this.getRootScope().$broadcast('studentsOnlineReceived',
        {studentsOnline: this.studentsOnlineArray});
  }

  getStudentsOnline() {
    return this.studentsOnlineArray;
  }

  isStudentOnline(workgroupId) {
    return this.studentsOnlineArray.indexOf(workgroupId) > -1;
  }

  handleStudentDisconnected(studentDisconnectedMessage) {
    this.getRootScope().$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
  }

  pauseScreens(periodId) {
    this.getStomp().send(`/app/pause/${this.runId}/${periodId}`, {}, {});
  }

  unPauseScreens(periodId) {
    this.getStomp().send(`/app/unpause/${this.runId}/${periodId}`, {}, {});
  }

  sendProjectToClass(periodId: string, project: any) {
    this.stomp.send(`/app/api/teacher/run/${this.runId}/project-to-period/${periodId}`, project, {});
  }
}
