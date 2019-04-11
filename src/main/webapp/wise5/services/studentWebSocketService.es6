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
          console.log(`connected! runId: ${this.runId}`);
          const greetingSubscription = this.$stomp.subscribe(`/topic/greetings/${this.runId}`, (payload, headers, res) => {
            console.log(`Greeting: ${payload}`);
          }, {});

          const pauseSubscription = this.$stomp.subscribe(`/topic/pause/${this.runId}/${this.periodId}`, (payload, headers, res) => {
            console.log(`Pause: ${payload}`);
            this.$rootScope.$broadcast('pauseScreen', {data: payload});
          }, {});

          const unPauseSubscription = this.$stomp.subscribe(`/topic/unpause/${this.runId}/${this.periodId}`, (payload, headers, res) => {
            console.log(`UnPause: ${payload}`);
            this.$rootScope.$broadcast('unPauseScreen', {data: payload});
          }, {});

          const studentWorkSubscription = this.$stomp.subscribe(`/topic/student-work/${this.runId}/${this.periodId}`, (studentWork, headers, res) => {
            studentWork.studentData = JSON.parse(studentWork.studentData);
            this.$rootScope.$broadcast('studentWorkReceived', studentWork);
          }, {});

          const notificationSubscription = this.$stomp.subscribe(`/topic/notification/${this.runId}/${this.periodId}/${this.workgroupId}`, (notification, headers, res) => {
            this.$rootScope.$broadcast('newNotification', notification);
          }, {});

          this.$stomp.send(`/app/hello/${this.runId}`, JSON.stringify({'name': `workgroup ${this.workgroupId}`}), {});
        });
      } catch(e) {
        console.log(e);
      }
    }
  }

  handleWebSocketMessageReceived(data) {
    this.$rootScope.$broadcast('webSocketMessageReceived', {data: data});
  }

  handleMessage(message) {
    const data = JSON.parse(message.data);
    const messageType = data.messageType;
    if (messageType === 'pauseScreen') {
      this.$rootScope.$broadcast('pauseScreen', {data: data});
    } else if (messageType === 'unPauseScreen') {
      this.$rootScope.$broadcast('unPauseScreen', {data: data});
    } else if (messageType === 'notification') {
      this.$rootScope.$broadcast('newNotification', data.data);
    } else if (messageType === 'annotationNotification') {
      // a new annotation + notification combo object was sent over websocket

      // save the new annotation locally
      let annotationData = data.annotationData;
      this.StudentDataService.AnnotationService.addOrUpdateAnnotation(annotationData);
      this.$rootScope.$broadcast('newAnnotationReceived', {annotation: annotationData});

      // fire the new notification
      let notificationData = data.notificationData;
      this.$rootScope.$broadcast('newNotification', notificationData);
    }
    this.handleWebSocketMessageReceived(data);
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
