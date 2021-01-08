'use strict';

import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { AnnotationService } from './annotationService';
import { ConfigService } from './configService';
import { TagService } from './tagService';
import { StudentDataService } from './studentDataService';
import { NotificationService } from './notificationService';
import { ProjectService } from './projectService';
import * as angular from 'angular';

@Injectable()
export class StudentWebSocketService {
  runId: number;
  periodId: any;
  workgroupId: number;

  constructor(
    private upgrade: UpgradeModule,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private NotificationService: NotificationService,
    private ProjectService: ProjectService,
    private StudentDataService: StudentDataService,
    private TagService: TagService
  ) {}

  initialize() {
    this.runId = this.ConfigService.getRunId();
    this.periodId = this.ConfigService.getPeriodId();
    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.upgrade.$injector.get('$stomp').setDebug((args) => {
      this.upgrade.$injector.get('$log').debug(args);
    });
    try {
      this.upgrade.$injector
        .get('$stomp')
        .connect(this.ConfigService.getWebSocketURL())
        .then((frame) => {
          this.subscribeToClassroomTopic();
          this.subscribeToWorkgroupTopic();
        });
    } catch (e) {
      console.log(e);
    }
  }

  subscribeToClassroomTopic() {
    this.upgrade.$injector
      .get('$stomp')
      .subscribe(`/topic/classroom/${this.runId}/${this.periodId}`, (message, headers, res) => {
        if (message.type === 'pause') {
          this.StudentDataService.pauseScreen(true);
        } else if (message.type === 'unpause') {
          this.StudentDataService.pauseScreen(false);
        } else if (message.type === 'studentWork') {
          const studentWork = JSON.parse(message.content);
          this.StudentDataService.broadcastStudentWorkReceived(studentWork);
        } else if (message.type === 'annotation') {
          const annotation = JSON.parse(message.content);
          this.AnnotationService.broadcastAnnotationReceived({ annotation: annotation });
        } else if (message.type === 'goToNode') {
          this.goToStep(message.content);
        } else if (message.type === 'node') {
          this.updateNode(message.content);
        }
      });
  }

  subscribeToWorkgroupTopic() {
    this.upgrade.$injector
      .get('$stomp')
      .subscribe(`/topic/workgroup/${this.workgroupId}`, (message, headers, res) => {
        if (message.type === 'notification') {
          const notification = JSON.parse(message.content);
          this.NotificationService.addNotification(notification);
        } else if (message.type === 'annotation') {
          const annotationData = JSON.parse(message.content);
          this.AnnotationService.addOrUpdateAnnotation(annotationData);
          this.StudentDataService.handleAnnotationReceived(annotationData);
        } else if (message.type === 'tagsToWorkgroup') {
          const tags = JSON.parse(message.content);
          this.TagService.setTags(tags);
          this.upgrade.$injector.get('StudentDataService').updateNodeStatuses();
          this.upgrade.$injector.get('NodeService').evaluateTransitionLogic();
        } else if (message.type === 'goToNode') {
          this.goToStep(message.content);
        } else if (message.type === 'goToNextNode') {
          this.goToNextStep();
        }
      });
  }

  goToStep(nodeId) {
    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
  }

  goToNextStep() {
    this.upgrade.$injector
      .get('NodeService')
      .getNextNodeId()
      .then((nextNodeId) => {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
      });
  }

  updateNode(nodeString: string) {
    const node = angular.fromJson(nodeString);
    this.ProjectService.replaceNode(node.id, node);
    this.ProjectService.parseProject();
    this.StudentDataService.updateNodeStatuses();
  }
}
