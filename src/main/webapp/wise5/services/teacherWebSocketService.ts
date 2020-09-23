'use strict';

import { Injectable } from "@angular/core";
import { ConfigService } from "./configService";
import { StudentStatusService } from "./studentStatusService";
import { UpgradeModule } from "@angular/upgrade/static";
import { NotificationService } from "./notificationService";
import { Subject } from "rxjs";

@Injectable()
export class TeacherWebSocketService {

  runId: number;
  rootScope: any;
  stomp: any;
  private newStudentWorkReceivedSource: Subject<any> = new Subject<any>();
  public newStudentWorkReceived$ = this.newStudentWorkReceivedSource.asObservable();

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
        this.broadcastNewStudentWorkReceived({studentWork: studentWork});
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

  broadcastNewStudentWorkReceived(args: any) {
    this.newStudentWorkReceivedSource.next(args);
  }

  subscribeToTeacherWorkgroupTopic() {
    this.getStomp().subscribe(`/topic/workgroup/${this.ConfigService.getWorkgroupId()}`,
        (message, headers, res) => {
      if (message.type === 'notification') {
        this.NotificationService.addNotification(JSON.parse(message.content));
      }
    });
  }

  pauseScreens(periodId) {
    this.getStomp().send(`/app/pause/${this.runId}/${periodId}`, {}, {});
  }

  unPauseScreens(periodId) {
    this.getStomp().send(`/app/unpause/${this.runId}/${periodId}`, {}, {});
  }

  sendNodeToClass(periodId: number, node: any) {
    this.stomp.send(`/app/api/teacher/run/${this.runId}/node-to-period/${periodId}`, node, {});
  }
}
