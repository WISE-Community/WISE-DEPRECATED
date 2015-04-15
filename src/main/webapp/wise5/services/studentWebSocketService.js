define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', '$websocket', 'ConfigService', 'StudentDataService',
                   function($http, $rootScope, $websocket, ConfigService, StudentDataService) {
        var serviceObject = {};
        
        serviceObject.dataStream = null;
        
        serviceObject.initialize = function() {
            var runId = ConfigService.getRunId();
            var periodId = ConfigService.getPeriodId();
            var workgroupId = ConfigService.getWorkgroupId();
            var webSocketURL = ConfigService.getWebSocketURL();
            webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
            this.dataStream = $websocket(webSocketURL);
            
            this.dataStream.onMessage(function(message) {
               console.log('message received: ' + message.data); 
            });
        };
        
        serviceObject.sendStudentStatus = function() {
            var currentNodeId = StudentDataService.getCurrentNodeId();
            
            var nodeStatuses = StudentDataService.getNodeStatuses();
            
            var latestCompletedNodeVisit = StudentDataService.getLatestCompletedNodeVisit();
                
            var messageJSON = {};
            messageJSON.messageType = 'studentStatus';
            messageJSON.messageParticipants = 'studentToTeachers';
            messageJSON.currentNodeId = currentNodeId;
            messageJSON.previousNodeVisit = latestCompletedNodeVisit;
            messageJSON.nodeStatuses = nodeStatuses;
            
            this.dataStream.send(messageJSON);
        };
        
        return serviceObject;
    }];
    
    return service;
});