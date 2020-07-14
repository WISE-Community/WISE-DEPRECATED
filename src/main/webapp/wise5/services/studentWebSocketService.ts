'use strict';

import { Injectable } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";
import { AnnotationService } from "./annotationService";
import { ConfigService } from "./configService";
import NodeService from "./nodeService";
import { TagService } from "./tagService";
import { StudentDataService } from "./studentDataService";

@Injectable()
export class StudentWebSocketService {
  runId: number;
  periodId: any;
  workgroupId: number;

  constructor(private upgrade: UpgradeModule, private AnnotationService: AnnotationService,
      private ConfigService: ConfigService, private StudentDataService: StudentDataService,
      private TagService: TagService) {
  }

  initialize() {
    this.runId = this.ConfigService.getRunId();
    this.periodId = this.ConfigService.getPeriodId();
    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.upgrade.$injector.get('$stomp').setDebug((args) => {
      this.upgrade.$injector.get('$log').debug(args)
    });
    try {
      this.upgrade.$injector.get('$stomp').connect(this.ConfigService.getWebSocketURL())
          .then((frame) => {
        this.subscribeToClassroomTopic();
        this.subscribeToWorkgroupTopic();
      });
    } catch(e) {
      console.log(e);
    }
  }

  subscribeToClassroomTopic() {
    this.upgrade.$injector.get('$stomp').subscribe(
        `/topic/classroom/${this.runId}/${this.periodId}`, (message, headers, res) => {
      if (message.type === 'pause') {
        this.upgrade.$injector.get('$rootScope').$broadcast('pauseScreen', {data: message.content});
      } else if (message.type === 'unpause') {
        this.upgrade.$injector.get('$rootScope').$broadcast('unPauseScreen', {data: message.content});
      } else if (message.type === 'studentWork') {
        const studentWork = JSON.parse(message.content);
        this.upgrade.$injector.get('$rootScope').$broadcast('studentWorkReceived', studentWork);
      }
    });
  }

  subscribeToWorkgroupTopic() {
    this.upgrade.$injector.get('$stomp').subscribe(`/topic/workgroup/${this.workgroupId}`,
        (message, headers, res) => {
      if (message.type === 'notification') {
        const notification = JSON.parse(message.content);
        this.upgrade.$injector.get('$rootScope').$broadcast('newNotificationReceived', notification);
      } else if (message.type === 'annotation') {
        const annotationData = JSON.parse(message.content);
        this.AnnotationService.addOrUpdateAnnotation(annotationData);
        this.StudentDataService.handleAnnotationReceived(annotationData);
      } else if (message.type === 'tagsToWorkgroup') {
        const tags = JSON.parse(message.content);
        this.TagService.setTags(tags);
        this.upgrade.$injector.get('StudentDataService').updateNodeStatuses();
        this.upgrade.$injector.get('NodeService').evaluateTransitionLogic()
      }
    });
  }
}
