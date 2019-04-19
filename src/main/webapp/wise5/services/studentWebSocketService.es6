'use strict';

class StudentWebSocketService {
  constructor(
      $rootScope,
      $stomp,
      AnnotationService,
      ConfigService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
  }

  initialize() {
    this.runId = this.ConfigService.getRunId();
    this.periodId = this.ConfigService.getPeriodId();
    this.workgroupId = this.ConfigService.getWorkgroupId();
    try {
      this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
        this.subscribeToClassroomTopic();
        this.subscribeToWorkgroupTopic();
      });
    } catch(e) {
      console.log(e);
    }
  }

  subscribeToClassroomTopic() {
    this.$stomp.subscribe(`/topic/classroom/${this.runId}/${this.periodId}`, (message, headers, res) => {
      if (message.type === 'pause') {
        this.$rootScope.$broadcast('pauseScreen', {data: message.content});
      } else if (message.type === 'unpause') {
        this.$rootScope.$broadcast('unPauseScreen', {data: message.content});
      } else if (message.type === 'studentWork') {
        const studentWork = message.content;
        studentWork.studentData = JSON.parse(studentWork.studentData);
        this.$rootScope.$broadcast('studentWorkReceived', studentWork);
      }
    });
  }

  subscribeToWorkgroupTopic() {
    this.$stomp.subscribe(`/topic/workgroup/${this.workgroupId}`, (message, headers, res) => {
      if (message.type === 'notification') {
        const notification = message.content;
        notification.data = JSON.parse(notification.data);
        this.$rootScope.$broadcast('newNotificationReceived', notification);
      } else if (message.type === 'annotation') {
        const annotationData = message.content;
        annotationData.data = JSON.parse(annotationData.data);
        this.AnnotationService.addOrUpdateAnnotation(annotationData);
        this.$rootScope.$broadcast('newAnnotationReceived', {annotation: annotationData});
      }
    });
  }
}

StudentWebSocketService.$inject = [
  '$rootScope',
  '$stomp',
  'AnnotationService',
  'ConfigService'
];

export default StudentWebSocketService;
