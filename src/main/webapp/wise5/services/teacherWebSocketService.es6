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
    const webSocketURL = this.ConfigService.getWebSocketURL();
    try {
      this.$stomp.connect(webSocketURL).then((frame) => {
        this.subscribeToTeacherTopic();
        this.subscribeToTeacherWorkgroupTopic();
      });
    } catch(e) {
      console.log(e);
    }
  }

  subscribeToTeacherTopic() {
    this.$stomp.subscribe(`/topic/teacher/${this.runId}`, (message, headers, res) => {
      if (message.type === 'studentWork') {
        const studentWork = message.content;
        studentWork.studentData = JSON.parse(studentWork.studentData);
        this.$rootScope.$broadcast('newStudentWorkReceived', {studentWork: studentWork});
      } else if (message.type === 'studentStatus') {
        const studentStatus = message.content;
        const status = JSON.parse(studentStatus.status);
        this.handleStudentStatusReceived(status);
      } else if (message.type === 'newStudentAchievement') {
        const achievement = message.content;
        achievement.data = JSON.parse(achievement.data);
        this.$rootScope.$broadcast('newStudentAchievement', {studentAchievement: achievement});
      }
    });
  }

  subscribeToTeacherWorkgroupTopic() {
    this.$stomp.subscribe(`/topic/workgroup/${this.ConfigService.getWorkgroupId()}`, (message, headers, res) => {
      if (message.type === 'notification') {
        const notification = message.content;
        notification.data = JSON.parse(notification.data);
        this.$rootScope.$broadcast('newNotification', notification);
      }
    });
  }

  /*
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
*/

  handleStudentsOnlineReceived(studentsOnlineMessage) {
    this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;
    this.$rootScope.$broadcast('studentsOnlineReceived', {studentsOnline: this.studentsOnlineArray});
  }

  getStudentsOnline() {
    return this.studentsOnlineArray;
  }

  isStudentOnline(workgroupId) {
    return this.studentsOnlineArray.indexOf(workgroupId) > -1;
  }

  handleStudentStatusReceived(studentStatus) {
    const workgroupId = studentStatus.workgroupId;
    this.StudentStatusService
        .setStudentStatusForWorkgroupId(workgroupId, studentStatus);
    this.$rootScope
        .$emit('studentStatusReceived', {studentStatus: studentStatus});
  }

  handleStudentDisconnected(studentDisconnectedMessage) {
    this.$rootScope.$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
  }

  pauseScreens(periodId) {
    this.$stomp.send(`/app/pause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {});
  }

  unPauseScreens(periodId) {
    this.$stomp.send(`/app/unpause/${this.runId}/${periodId}`, JSON.stringify({'name': 'teacher'}), {});
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
