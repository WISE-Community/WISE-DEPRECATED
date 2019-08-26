class TeacherWebSocketService {
  constructor(
      $log,
      $rootScope,
      $stomp,
      ConfigService,
      StudentStatusService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.ConfigService = ConfigService;
    this.StudentStatusService = StudentStatusService;
    this.studentsOnlineArray = [];
    this.$stomp.setDebug(function (args) {
      $log.debug(args)
    });
  }

  initialize() {
    this.runId = this.ConfigService.getRunId();
    try {
      this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
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
        const studentWork = JSON.parse(message.content);
        this.$rootScope.$broadcast('newStudentWorkReceived', {studentWork: studentWork});
      } else if (message.type === 'studentStatus') {
        const status = JSON.parse(message.content);
        this.StudentStatusService.setStudentStatus(status);
        this.$rootScope.$emit('studentStatusReceived', {studentStatus: status});
      } else if (message.type === 'newStudentAchievement') {
        const achievement = JSON.parse(message.content);
        this.$rootScope.$broadcast('newStudentAchievement', {studentAchievement: achievement});
      } else if (message.type === 'annotation') {
        const annotationData = JSON.parse(message.content);
        this.$rootScope.$broadcast('newAnnotationReceived', {annotation: annotationData});
      }
    });
  }

  subscribeToTeacherWorkgroupTopic() {
    this.$stomp.subscribe(`/topic/workgroup/${this.ConfigService.getWorkgroupId()}`, (message, headers, res) => {
      if (message.type === 'notification') {
        const notification = JSON.parse(message.content);
        this.$rootScope.$broadcast('newNotificationReceived', notification);
      }
    });
  }

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

  handleStudentDisconnected(studentDisconnectedMessage) {
    this.$rootScope.$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
  }

  pauseScreens(periodId) {
    this.$stomp.send(`/app/pause/${this.runId}/${periodId}`, {}, {});
  }

  unPauseScreens(periodId) {
    this.$stomp.send(`/app/unpause/${this.runId}/${periodId}`, {}, {});
  }
}

TeacherWebSocketService.$inject = [
  '$log',
  '$rootScope',
  '$stomp',
  'ConfigService',
  'StudentStatusService'
];

export default TeacherWebSocketService;
