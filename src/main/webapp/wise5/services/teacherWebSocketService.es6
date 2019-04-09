class TeacherWebSocketService {
  constructor(
      $rootScope,
      $stomp,
      $websocket,
      ConfigService,
      StudentStatusService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.StudentStatusService = StudentStatusService;
    this.dataStream = null;
    this.studentsOnlineArray = [];
  }

  initialize() {
    this.runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const workgroupId = this.ConfigService.getWorkgroupId();
    const webSocketURL = this.ConfigService.getWebSocketURL();
    try {
      this.$stomp.connect(webSocketURL).then((frame) => {
        console.log('connected!');
        const subscription = this.$stomp.subscribe('/topic/greetings', (payload, headers, res) => {
          this.payload = payload;
          console.log(payload);
        }, {
          'headers': 'are awesome'
        });

        this.$stomp.send('/app/hello', JSON.stringify({'name': 'teacher'}), {
          priority: 9,
          custom: 42
        });

      });
      // this.dataStream = this.$websocket(webSocketURL);
      // this.dataStream.onMessage((message) => {
      //   this.handleMessage(message);
      // });
    } catch(e) {
      console.log(e);
    }
  }

  handleMessage(message) {
    const data = JSON.parse(message.data);
    const messageType = data.messageType;
    if (messageType === 'studentStatus') {
      this.handleStudentStatusReceived(data);
    } else if (messageType === 'studentsOnlineList') {
      this.handleStudentsOnlineReceived(data);
    } else if (messageType === 'studentConnected') {

    } else if (messageType === 'studentDisconnected') {
      this.handleStudentDisconnected(data);
    } else if (messageType === 'notification' || messageType === 'CRaterResultNotification') {
      this.$rootScope.$broadcast('newNotification', data.data);
    } else if (messageType === 'newAnnotation') {
      this.$rootScope.$broadcast('newAnnotationReceived', {annotation: data.annotation});
    } else if (messageType === 'newStudentWork') {
      this.$rootScope.$broadcast('newStudentWorkReceived', {studentWork: data.studentWork});
    } else if (messageType === 'newStudentAchievement') {
      this.$rootScope.$broadcast('newStudentAchievement', {studentAchievement: data.studentAchievement});
    }
  }

  sendMessage(messageJSON) {
    this.dataStream.send(messageJSON);
  }

  handleStudentsOnlineReceived(studentsOnlineMessage) {
    this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
    this.$rootScope.$broadcast('studentsOnlineReceived', {studentsOnline: this.studentsOnlineArray});
  }

  getStudentsOnline() {
    return this.studentsOnlineArray;
  }

  /**
   * Check to see if a given workgroup is currently online
   * @param workgroupId the workgroup id
   * @returns boolean whether a workgroup is online
   */
  isStudentOnline(workgroupId) {
    return this.studentsOnlineArray.indexOf(workgroupId) > -1;
  }

  /**
   * This function is called when the teacher receives a websocket message
   * with messageType 'studentStatus'.
   */
  handleStudentStatusReceived(studentStatus) {
    const workgroupId = studentStatus.workgroupId;
    this.StudentStatusService
        .setStudentStatusForWorkgroupId(workgroupId, studentStatus);
    this.$rootScope
        .$emit('studentStatusReceived', {studentStatus: studentStatus});
  }

  /**
   * Handle the student disconnected message
   */
  handleStudentDisconnected(studentDisconnectedMessage) {
    this.$rootScope.$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
  }

  pauseScreens(periodId) {
    this.$stomp.send(`/app/pause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {
      priority: 9,
      custom: 42
    });

    /*
    if (periodId === -1) {
      this.$stomp.send(`/app/pause/${this.runId}`, JSON.stringify({'name': 'teacher'}), {
        priority: 9,
        custom: 42
      });
    } else {
      this.$stomp.send(`/app/pause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {
        priority: 9,
        custom: 42
      });
    }
    const messageJSON = {};
    messageJSON.messageType = 'pauseScreen';

    if (periodId == null || periodId == -1) {
      messageJSON.messageParticipants = 'teacherToStudentsInRun';
    } else if(periodId != null) {
      messageJSON.periodId = periodId;
      messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
    }
    this.sendMessage(messageJSON);
    */
  }

  unPauseScreens(periodId) {
    this.$stomp.send(`/app/unpause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {
      priority: 9,
      custom: 42
    });
    /*
    if (periodId === -1) {
      this.$stomp.send(`/app/unpause/${this.runId}`, JSON.stringify({'name': 'teacher'}), {
        priority: 9,
        custom: 42
      });
    } else {
      this.$stomp.send(`/app/unpause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {
        priority: 9,
        custom: 42
      });

      const messageJSON = {};
      messageJSON.messageType = 'unPauseScreen';

      if(periodId == null || periodId == -1) {
        messageJSON.messageParticipants = 'teacherToStudentsInRun';
      } else if(periodId != null) {
        messageJSON.periodId = periodId;
        messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
      }
      this.sendMessage(messageJSON);
    }
      */
  }
}

TeacherWebSocketService.$inject = [
  '$rootScope',
  '$stomp',
  '$websocket',
  'ConfigService',
  'StudentStatusService'
];

export default TeacherWebSocketService;
