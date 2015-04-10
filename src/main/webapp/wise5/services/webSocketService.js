define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', '$websocket', 'ConfigService', function($http, $rootScope, $websocket, ConfigService) {
        var serviceObject = {};
        
        serviceObject.dataStream = null;
        
        serviceObject.initialize = function() {
            var runId = ConfigService.getRunId();
            var periodId = ConfigService.getPeriodId();
            var workgroupId = ConfigService.getWorkgroupId();
            var webSocketURL = ConfigService.getWebSocketURL();
            webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
            this.dataStream = $websocket(webSocketURL);
            
            var jsonObject = {};
            jsonObject.messageParticipants = 'studentToClassmatesInPeriod';
            jsonObject.data = 'hello';
            this.dataStream.send(jsonObject);
            
            this.dataStream.onMessage(function(message) {
               console.log('message received: ' + message.data); 
            });
        };
        
        return serviceObject;
    }];
    
    return service;
});