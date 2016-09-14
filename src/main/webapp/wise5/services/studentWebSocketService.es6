'use strict';

class StudentWebSocketService {

    constructor($rootScope,
                $websocket,
                ConfigService,
                StudentDataService) {

        this.$rootScope = $rootScope;
        this.$websocket = $websocket;
        this.ConfigService = ConfigService;
        this.StudentDataService = StudentDataService;

        this.dataStream = null;
    }

    /**
     * Initialize the websocket connection
     */
    initialize() {

        if (this.ConfigService.isPreview()) {
            // We are previewing the project. Don't initialize websocket.
        } else {
            // We are in a run. Get the parameters for initializing the websocket connection
            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var workgroupId = this.ConfigService.getWorkgroupId();
            var webSocketURL = this.ConfigService.getWebSocketURL();
            webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;

            try {
                // start the websocket connection
                this.dataStream = this.$websocket(webSocketURL);

                // this is the function that handles messages we receive from web sockets
                this.dataStream.onMessage((message) => {
                    this.handleMessage(message);
                });
            } catch(e) {
                console.log(e);
            }
        }
    };

    /**
     * Handle the message we have received
     * @param data the data from the message
     */
    handleWebSocketMessageReceived(data) {

        // broadcast the data to all listeners
        this.$rootScope.$broadcast('webSocketMessageRecieved', {data: data});
    };

    /**
     * Handle receiving a websocket message
     * @param message the websocket message
     */
    handleMessage(message) {
        var data = JSON.parse(message.data);
        var messageType = data.messageType;

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
            // we are in a run

            // get the current node id
            var currentNodeId = this.StudentDataService.getCurrentNodeId();

            // make the websocket message
            var messageJSON = {};
            messageJSON.messageType = messageType;
            messageJSON.messageParticipants = 'studentToTeachers';
            messageJSON.currentNodeId = currentNodeId;
            messageJSON.data = data;

            // send the websocket message
            this.dataStream.send(messageJSON);
        }
    };

    /**
     * Send a message to classmates in the period
     * @param data the data to send to the classmates
     */
    sendStudentToClassmatesInPeriodMessage(messageType, data) {

        if (!this.ConfigService.isPreview()) {
            // we are in a run

            // get the current node id
            var currentNodeId = this.StudentDataService.getCurrentNodeId();

            // make the websocket message
            var messageJSON = {};
            messageJSON.messageType = messageType;
            messageJSON.messageParticipants = 'studentToClassmatesInPeriod';
            messageJSON.currentNodeId = currentNodeId;
            messageJSON.data = data;

            // send the websocket message
            this.dataStream.send(messageJSON);
        }
    };
}

StudentWebSocketService.$inject = [
    '$rootScope',
    '$websocket',
    'ConfigService',
    'StudentDataService'
];

export default StudentWebSocketService;
