'use strict';

class StudentWebSocketService {
  constructor(
      $rootScope,
      $stomp,
      ConfigService,
      StudentDataService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.ConfigService = ConfigService;
    this.StudentDataService = StudentDataService;
    this.dataStream = null;
  }

  initialize() {
    if (!this.ConfigService.isPreview()) {
      this.runId = this.ConfigService.getRunId();
      this.periodId = this.ConfigService.getPeriodId();
      this.workgroupId = this.ConfigService.getWorkgroupId();
      try {
        this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
          this.subscribeToClassroomTopic();
          this.subscribeToWorkgroupTopic();
          this.subscribeToTeacherTopic();
        });
      } catch(e) {
        console.log(e);
      }
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
        this.$rootScope.$broadcast('newNotification', message.content);
      } else if (message.type === 'annotation') {
        const annotationData = message.content;
        annotationData.data = JSON.parse(annotationData.data);
        this.StudentDataService.AnnotationService.addOrUpdateAnnotation(annotationData);
        this.$rootScope.$broadcast('newAnnotationReceived', {annotation: annotationData});
      }
    });
  }

  subscribeToTeacherTopic() {
    this.$stomp.subscribe(`/topic/teacher/${this.runId}/${this.periodId}`, (payload, headers, res) => {
    });
  }

  sendStudentToTeacherMessage(messageType, data) {
    if (!this.ConfigService.isPreview()) {
      const currentNodeId = this.StudentDataService.getCurrentNodeId();
      const messageJSON = {};
      messageJSON.messageType = messageType;
      messageJSON.messageParticipants = 'studentToTeachers';
      messageJSON.currentNodeId = currentNodeId;
      messageJSON.data = data;
      this.dataStream.send(messageJSON);
    }
  }
}

StudentWebSocketService.$inject = [
  '$rootScope',
  '$stomp',
  'ConfigService',
  'StudentDataService'
];

export default StudentWebSocketService;
