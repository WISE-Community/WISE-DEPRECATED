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

        this.StudentStatusService.setStudentStatusForWorkgroupId(workgroupId, studentStatus);

        var latestCompletedNodeVisit = studentStatus.previousNodeVisit;
        if (latestCompletedNodeVisit != null) {
            var nodeStates = latestCompletedNodeVisit.nodeStates;
            if (nodeStates != null && nodeStates.length > 0) {
                // there's new work. notify the teacher
                this.StudentStatusService.addNewNodeVisit(latestCompletedNodeVisit);
            }
        }
        /*
         var runId = data.runId;
         var periodId = data.periodId;
         var workgroupId = data.workgroupId;
         var currentNodeId = data.currentNodeId;
         var previousNodeVisit = data.previousNodeVisit;
         var nodeStatuses = data.nodeStatuses;

         //we will reset the time spent value to 0 since the student has just moved to a new step
         var timeSpent = '0:00';

         //update our local copy of the student status object for the workgroup id
         var studentStatusObject = this.updateStudentStatusObject(data);
         */

        //get the annotation if any
        //var annotation = data.annotation;

        //update the student progress row for the workgroup id
        //this.updateStudentProgress(runId, periodId, workgroupId, currentNodeId, previousNodeVisit, nodeStatuses, timeSpent);

        //update the step progress for all steps and periods
        //this.updateStepProgress();

        //check if we need to notify the teacher that there's new work for the screen they are viewing
        //this.checkIfNeedToDisplayNewWorkNotification(data);

        //if (annotation != null) {
        //analyze the annotation to see if we need to do anything special
        //this.analyzeAnnotation(annotation, previousNodeVisit, workgroupId);
        //}
    };
}

TeacherWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentStatusService'];

export default TeacherWebSocketService;