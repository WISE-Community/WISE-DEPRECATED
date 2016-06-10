class AuthorWebSocketService {
    constructor($rootScope, $websocket, ConfigService) {
        this.$rootScope = $rootScope;
        this.$websocket = $websocket;
        this.ConfigService = ConfigService;
        this.dataStream = null;
    }

    /**
     * Initialize the websocket connection
     */
    initialize(projectId) {
        // start the websocket connection
        var webSocketURL = this.ConfigService.getWebSocketURL() + "?projectId=" + projectId;
        this.dataStream = this.$websocket(webSocketURL);

        // this is the function that handles messages we receive from web sockets
        this.dataStream.onMessage((message) => {
            this.handleMessage(message);
        });
    };

    handleMessage(message) {
        debugger;
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

    notifyAuthorProjectBegin(projectId) {
        if (projectId != null) {
            // create the websocket message
            let messageJSON = {};

            messageJSON.messageType = 'authorProjectBegin';
            messageJSON.projectId = projectId;
            messageJSON.username = this.ConfigService.getUserInfo().myUserInfo.userName;

            // send the websocket message
            this.sendMessage(messageJSON);
        }
    }

    sendMessage(messageJSON) {
        // send the websocket message
        this.dataStream.send(messageJSON);
    }

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

    /**
     * Pause the screens in the period
     * @param periodId the period id. if null or -1 is passed in we will pause
     * all the periods
     */
    pauseScreens(periodId) {

        // create the websocket message
        var messageJSON = {};

        messageJSON.messageType = 'pauseScreen';

        if(periodId == null || periodId == -1) {
            //we are going to pause all the students in a run
            messageJSON.messageParticipants = 'teacherToStudentsInRun';
        } else if(periodId != null) {
            //we are going to pause the students in a period
            messageJSON.periodId = periodId;
            messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
        }

        // send the websocket message
        this.sendMessage(messageJSON);
    }

    /**
     * Unpause the screens in the period
     * @param periodId the period id. if null or -1 is passed in we will unpause
     * all the periods
     */
    unPauseScreens(periodId) {

        // create the websocket message
        var messageJSON = {};

        messageJSON.messageType = 'unPauseScreen';

        if(periodId == null || periodId == -1) {
            //we are going to unpause all the students in a run
            messageJSON.messageParticipants = 'teacherToStudentsInRun';
        } else if(periodId != null) {
            //we are going to unpause the students in a period
            messageJSON.periodId = periodId;
            messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
        }
        
        // send the websocket message
        this.sendMessage(messageJSON);
    }
}

AuthorWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService'];

export default AuthorWebSocketService;
