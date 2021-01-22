'use strict';

import { Injectable } from '@angular/core';
import { ConfigService } from './configService';
import { StudentStatusService } from './studentStatusService';
import { UpgradeModule } from '@angular/upgrade/static';
import { NotificationService } from './notificationService';
import { Observable, Subject } from 'rxjs';
import { AchievementService } from './achievementService';

@Injectable()
export class TeacherWebSocketService {
  runId: number;
  rootScope: any;
  stomp: any;
  private newAnnotationReceivedSource: Subject<any> = new Subject<any>();
  public newAnnotationReceived$: Observable<any> = this.newAnnotationReceivedSource.asObservable();
  private newStudentWorkReceivedSource: Subject<any> = new Subject<any>();
  public newStudentWorkReceived$: Observable<any> = this.newStudentWorkReceivedSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    private AchievementService: AchievementService,
    private ConfigService: ConfigService,
    private NotificationService: NotificationService,
    private StudentStatusService: StudentStatusService
  ) {
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
      this.getStomp()
        .connect(this.ConfigService.getWebSocketURL())
        .then((frame) => {
          this.subscribeToTeacherTopic();
          this.subscribeToTeacherWorkgroupTopic();
        });
    } catch (e) {
      console.log(e);
    }
  }

  subscribeToTeacherTopic() {
    this.getStomp().subscribe(`/topic/teacher/${this.runId}`, (message, headers, res) => {
      if (message.type === 'studentWork') {
        const studentWork = JSON.parse(message.content);
        this.broadcastNewStudentWorkReceived({ studentWork: studentWork });
      } else if (message.type === 'studentStatus') {
        const status = JSON.parse(message.content);
        this.StudentStatusService.setStudentStatus(status);
        this.StudentStatusService.broadcastStudentStatusReceived({ studentStatus: status });
      } else if (message.type === 'newStudentAchievement') {
        const achievement = JSON.parse(message.content);
        this.AchievementService.broadcastNewStudentAchievement({ studentAchievement: achievement });
      } else if (message.type === 'annotation') {
        const annotationData = JSON.parse(message.content);
        this.broadcastNewAnnotationReceived({ annotation: annotationData });
      }
    });
  }

  broadcastNewStudentWorkReceived(args: any) {
    this.newStudentWorkReceivedSource.next(args);
  }

  broadcastNewAnnotationReceived(args: any) {
    this.newAnnotationReceivedSource.next(args);
  }

  subscribeToTeacherWorkgroupTopic() {
    this.getStomp().subscribe(
      `/topic/workgroup/${this.ConfigService.getWorkgroupId()}`,
      (message, headers, res) => {
        if (message.type === 'notification') {
          this.NotificationService.addNotification(JSON.parse(message.content));
        }
      }
    );
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
