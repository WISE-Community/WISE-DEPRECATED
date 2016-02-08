'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentWebSocketService = function () {
    function StudentWebSocketService($rootScope, $websocket, ConfigService, StudentDataService) {
        _classCallCheck(this, StudentWebSocketService);

        this.$rootScope = $rootScope;
        this.$websocket = $websocket;
        this.ConfigService = ConfigService;
        this.StudentDataService = StudentDataService;

        this.dataStream = null;
    }

    /**
     * Initialize the websocket connection
     */


    _createClass(StudentWebSocketService, [{
        key: 'initialize',
        value: function initialize() {

            // get the mode
            var mode = this.ConfigService.getConfigParam('mode');

            if (mode === 'preview') {
                // we are previewing the project
            } else {
                    // we are in a run

                    // get the parameters for initializing the websocket connection
                    var runId = this.ConfigService.getRunId();
                    var periodId = this.ConfigService.getPeriodId();
                    var workgroupId = this.ConfigService.getWorkgroupId();
                    var webSocketURL = this.ConfigService.getWebSocketURL();
                    webSocketURL += "?runId=" + runId + "&periodId=" + periodId + "&workgroupId=" + workgroupId;

                    // start the websocket connection
                    this.dataStream = this.$websocket(webSocketURL);

                    // this is the function that handles messages we receive from web sockets
                    this.dataStream.onMessage(angular.bind(this, function (message) {

                        if (message != null && message.data != null) {

                            var data = message.data;

                            try {
                                data = angular.fromJson(data);

                                this.handleWebSocketMessageReceived(data);
                            } catch (e) {}
                        }
                    }));
                }
        }
    }, {
        key: 'handleWebSocketMessageReceived',


        /**
         * Handle the message we have received
         * @param data the data from the message
         */
        value: function handleWebSocketMessageReceived(data) {

            // broadcast the data to all listeners
            this.$rootScope.$broadcast('webSocketMessageRecieved', { data: data });
        }
    }, {
        key: 'sendStudentStatus',


        /**
         * Send the student status to the server through websockets
         */
        value: function sendStudentStatus() {

            var mode = this.ConfigService.getConfigParam('mode');

            if (mode !== 'preview') {
                // we are in a run

                // get the current node id
                var currentNodeId = this.StudentDataService.getCurrentNodeId();

                // get the node statuses
                var nodeStatuses = this.StudentDataService.getNodeStatuses();

                // get the latest node visit
                //var latestCompletedNodeVisit = this.StudentDataService.getLatestCompletedNodeVisit();
                var latestComponentState = this.StudentDataService.getLatestComponentState();

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
        }
    }, {
        key: 'sendStudentToClassmatesInPeriodMessage',


        /**
         * Send a message to classmates in the period
         * @param data the data to send to the classmates
         */
        value: function sendStudentToClassmatesInPeriodMessage(data) {
            var mode = this.ConfigService.getConfigParam('mode');

            if (mode !== 'preview') {
                // we are in a run

                // get the current node id
                var currentNodeId = this.StudentDataService.getCurrentNodeId();

                // make the websocket message
                var messageJSON = {};
                messageJSON.messageType = 'studentData';
                messageJSON.messageParticipants = 'studentToClassmatesInPeriod';
                messageJSON.currentNodeId = currentNodeId;
                messageJSON.data = data;

                // send the websocket message
                this.dataStream.send(messageJSON);
            }
        }
    }]);

    return StudentWebSocketService;
}();

StudentWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentDataService'];

exports.default = StudentWebSocketService;
//# sourceMappingURL=studentWebSocketService.js.map