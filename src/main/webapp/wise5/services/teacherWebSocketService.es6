class TeacherWebSocketService {
    constructor($rootScope, $websocket, ConfigService, StudentStatusService) {
        this.$rootScope = $rootScope;
        this.$websocket = $websocket;
        this.ConfigService = ConfigService;
        this.StudentStatusService = StudentStatusService;
        this.dataStream = null;
    }

    initialize() {
        var runId = this.ConfigService.getRunId();
        var periodId = this.ConfigService.getPeriodId();
        var workgroupId = this.ConfigService.getWorkgroupId();
        var webSocketURL = this.ConfigService.getWebSocketURL();
        webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
        this.dataStream = this.$websocket(webSocketURL);

        this.dataStream.onMessage(angular.bind(this, function(message) {
            this.handleMessage(message);
        }));
    };

    handleMessage(message) {
        var data = JSON.parse(message.data);
        var messageType = data.messageType;

        if (messageType === 'studentStatus') {
            this.handleStudentStatusReceived(data);
        } else if (messageType === 'studentsOnlineList') {
            this.handleStudentsOnlineReceived(data);
        } else if (messageType === 'studentConnected') {
            
        } else if (messageType === 'studentDisconnected') {
            this.handleStudentDisconnected(data);
        }
    };

    handleStudentsOnlineReceived(studentsOnlineMessage) {
        this.studentsOnlineArray = studentsOnlineMessage.studentsOnlineList;

        this.$rootScope.$broadcast('studentsOnlineReceived', {studentsOnline: this.studentsOnlineArray});
    };

    getStudentsOnline() {
        var studentsOnline = [];
        if (this.studentsOnlineArray != null) {
            studentsOnline = this.studentsOnlineArray;
        }
        return studentsOnline;
    };

    /**
     * This function is called when the teacher receives a websocket message
     * with messageType 'studentStatus'.
     */
    handleStudentStatusReceived(studentStatus) {
        var workgroupId = studentStatus.workgroupId;

        // update the student status for the workgroup
        this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);

        // fire the student status received event
        this.$rootScope.$emit('studentStatusReceived', {studentStatus: studentStatus});
    };

    /**
     * Handle the student disconnected message
     */
    handleStudentDisconnected(studentDisconnectedMessage) {

        // fire the student disconnected event
        this.$rootScope.$broadcast('studentDisconnected', {data: studentDisconnectedMessage});
    }
}

TeacherWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentStatusService'];

export default TeacherWebSocketService;
