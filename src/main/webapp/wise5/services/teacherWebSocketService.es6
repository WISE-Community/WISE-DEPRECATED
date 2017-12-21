class TeacherWebSocketService {
  constructor(
      $rootScope,
      $websocket,
      ConfigService,
      StudentStatusService) {
    this.$rootScope = $rootScope;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.StudentStatusService = StudentStatusService;
    this.dataStream = null;
    this.studentsOnlineArray = [];
  }

  initialize() {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const workgroupId = this.ConfigService.getWorkgroupId();
    const webSocketURL = this.ConfigService.getWebSocketURL() +
        "?runId=" + runId + "&periodId=" + periodId +
        "&workgroupId=" + workgroupId;
    this.dataStream = this.$websocket(webSocketURL);
    this.dataStream.onMessage((message) => {
      this.handleMessage(message);
    });
  };

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
  };

  sendMessage(messageJSON) {
    this.dataStream.send(messageJSON);
  }

  handleStudentsOnlineReceived(studentsOnlineMessage) {
    this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
    this.$rootScope.$broadcast('studentsOnlineReceived', {studentsOnline: this.studentsOnlineArray});
  };

  getStudentsOnline() {
    return this.studentsOnlineArray;
  };

  /**
   * Check to see if a given workgroup is currently online
   * @param workgroupId the workgroup id
   * @returns boolean whether a workgroup is online
   */
  isStudentOnline(workgroupId) {
    return this.studentsOnlineArray.indexOf(workgroupId) > -1;
  };

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
  };

  /**
   * Handle the student disconnected message
   */
  handleStudentDisconnected(studentDisconnectedMessage) {
    this.$rootScope.$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
  }

  /**
   * Pause the screens in the period
   * @param periodId the period id. if null or -1 is passed in we will pause
   * all the periods
   */
  pauseScreens(periodId) {
    const messageJSON = {};
    messageJSON.messageType = 'pauseScreen';

    if (periodId == null || periodId == -1) {
      messageJSON.messageParticipants = 'teacherToStudentsInRun';
    } else if(periodId != null) {
      messageJSON.periodId = periodId;
      messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
    }
    this.sendMessage(messageJSON);
  }

  /**
   * Unpause the screens in the period
   * @param periodId the period id. if null or -1 is passed in we will unpause
   * all the periods
   */
  unPauseScreens(periodId) {
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
}

TeacherWebSocketService.$inject = [
  '$rootScope',
  '$websocket',
  'ConfigService',
  'StudentStatusService'
];

export default TeacherWebSocketService;
