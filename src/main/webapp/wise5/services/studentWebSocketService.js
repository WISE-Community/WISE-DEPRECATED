define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', '$websocket', 'ConfigService', 'StudentDataService',
                   function($http, $rootScope, $websocket, ConfigService, StudentDataService) {
        var serviceObject = {};
        
        serviceObject.dataStream = null;
        
        /**
         * Initialize the websocket connection
         */
        serviceObject.initialize = function() {
            
            // get the mode
            var mode = ConfigService.getConfigParam('mode');
            
            if (mode === 'preview') {
                // we are previewing the project
            } else {
                // we are in a run
                
                // get the parameters for initializing the websocket connection
                var runId = ConfigService.getRunId();
                var periodId = ConfigService.getPeriodId();
                var workgroupId = ConfigService.getWorkgroupId();
                var webSocketURL = ConfigService.getWebSocketURL();
                webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;
                
                // start the websocket connection
                this.dataStream = $websocket(webSocketURL);

                // this is the function that handles messages we receive from web sockets
                this.dataStream.onMessage(angular.bind(this, function(message) {

                    if (message != null && message.data != null) {

                        var data = message.data;

                        try {
                            data = angular.fromJson(data);

                            this.handleWebSocketMessageReceived(data);
                        } catch(e) {

                        }
                    }
                }));
            }
        };

        /**
         * Handle the message we have received
         * @param data the data from the message
         */
        serviceObject.handleWebSocketMessageReceived = function(data) {

            // broadcast the data to all listeners
            $rootScope.$broadcast('webSocketMessageRecieved', {data: data});
        };
        
        /**
         * Send the student status to the server through websockets
         */
        serviceObject.sendStudentStatus = function() {
            
            var mode = ConfigService.getConfigParam('mode');
            
            if (mode !== 'preview') {
                // we are in a run
                
                // get the current node id
                var currentNodeId = StudentDataService.getCurrentNodeId();
                
                // get the node statuses
                var nodeStatuses = StudentDataService.getNodeStatuses();
                
                // get the latest node visit
                //var latestCompletedNodeVisit = StudentDataService.getLatestCompletedNodeVisit();
                var latestComponentState = StudentDataService.getLatestComponentState();
                
                // make the websocket message
                var messageJSON = {};
                messageJSON.messageType = 'studentStatus';
                messageJSON.messageParticipants = 'studentToTeachers';
                messageJSON.currentNodeId = currentNodeId;
                //messageJSON.previousNodeVisit = latestCompletedNodeVisit;
                messageJSON.previousComponentState = latestComponentState;
                messageJSON.nodeStatuses = nodeStatuses;
                
                // send the websocket message
                this.dataStream.send(messageJSON);
            }
        };

        /**
         * Send a message to classmates in the period
         * @param data the data to send to the classmates
         */
        serviceObject.sendStudentToClassmatesInPeriodMessage = function(data) {
            var mode = ConfigService.getConfigParam('mode');

            if (mode !== 'preview') {
                // we are in a run

                // get the current node id
                var currentNodeId = StudentDataService.getCurrentNodeId();

                // make the websocket message
                var messageJSON = {};
                messageJSON.messageType = 'studentData';
                messageJSON.messageParticipants = 'studentToClassmatesInPeriod';
                messageJSON.currentNodeId = currentNodeId;
                messageJSON.data = data;

                // send the websocket message
                this.dataStream.send(messageJSON);
            }
        };
        
        return serviceObject;
    }];
    
    return service;
});