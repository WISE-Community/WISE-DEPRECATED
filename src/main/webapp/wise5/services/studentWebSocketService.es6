'use strict';

class StudentWebSocketService {
  constructor(
      $rootScope,
      $stomp,
      $websocket,
      ConfigService,
      StudentDataService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.StudentDataService = StudentDataService;
    this.dataStream = null;
  }

  initialize() {
    if (!this.ConfigService.isPreview()) {
      const runId = this.ConfigService.getRunId();
      const periodId = this.ConfigService.getPeriodId();
      const workgroupId = this.ConfigService.getWorkgroupId();
      const webSocketURL = this.ConfigService.getWebSocketURL();
      try {
        this.$stomp.connect(webSocketURL).then((frame) => {
          console.log(`connected! runId: ${runId}`);
          const greetingSubscription = this.$stomp.subscribe(`/topic/greetings/${runId}`, (payload, headers, res) => {
            console.log(`Greeting: ${payload}`);
          }, {
          });

          const pauseSubscription = this.$stomp.subscribe(`/topic/pause/${runId}/${periodId}`, (payload, headers, res) => {
            console.log(`Pause: ${payload}`);
            this.$rootScope.$broadcast('pauseScreen', {data: payload});
          }, {
          });

          const unPauseSubscription = this.$stomp.subscribe(`/topic/unpause/${runId}/${periodId}`, (payload, headers, res) => {
            console.log(`UnPause: ${payload}`);
            this.$rootScope.$broadcast('unPauseScreen', {data: payload});
          }, {
          });

          this.$stomp.send(`/app/hello/${runId}`, JSON.stringify({'name': `workgroup ${workgroupId}`}), { priority: 9, custom: 42 });

        });
        //this.dataStream = this.$websocket(webSocketURL);
        //this.dataStream.onMessage((message) => {
        //  this.handleMessage(message);
        //});
      } catch(e) {
        console.log(e);
      }
    }
  }

  /**
   * Handle the message we have received
   * @param data the data from the message
   */
  handleWebSocketMessageReceived(data) {
    this.$rootScope.$broadcast('webSocketMessageReceived', {data: data});
  }

  /**
   * Handle receiving a websocket message
   * @param message the websocket message
   */
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

  /**
   * Send a message to teacher
   * @param data the data to send to the teacher
   */
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

  /**
   * Send a message to classmates in the period
   * @param data the data to send to the classmates
   */
  sendStudentToClassmatesInPeriodMessage(messageType, data) {
    if (!this.ConfigService.isPreview()) {
      const currentNodeId = this.StudentDataService.getCurrentNodeId();
      const messageJSON = {};
      messageJSON.messageType = messageType;
      messageJSON.messageParticipants = 'studentToClassmatesInPeriod';
      messageJSON.currentNodeId = currentNodeId;
      messageJSON.data = data;
      this.dataStream.send(messageJSON);
    }
  }
}

StudentWebSocketService.$inject = [
  '$rootScope',
  '$stomp',
  '$websocket',
  'ConfigService',
  'StudentDataService'
];

export default StudentWebSocketService;
