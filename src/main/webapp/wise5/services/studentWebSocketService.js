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
    key: "initialize",
    value: function initialize() {
      var _this = this;

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
          this.dataStream.onMessage(function (message) {
            _this.handleMessage(message);
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, {
    key: "handleWebSocketMessageReceived",


    /**
     * Handle the message we have received
     * @param data the data from the message
     */
    value: function handleWebSocketMessageReceived(data) {

      // broadcast the data to all listeners
      this.$rootScope.$broadcast('webSocketMessageRecieved', { data: data });
    }
  }, {
    key: "handleMessage",


    /**
     * Handle receiving a websocket message
     * @param message the websocket message
     */
    value: function handleMessage(message) {
      var data = JSON.parse(message.data);
      var messageType = data.messageType;

      if (messageType === 'pauseScreen') {
        this.$rootScope.$broadcast('pauseScreen', { data: data });
      } else if (messageType === 'unPauseScreen') {
        this.$rootScope.$broadcast('unPauseScreen', { data: data });
      } else if (messageType === 'notification') {
        this.$rootScope.$broadcast('newNotification', data.data);
      } else if (messageType === 'annotationNotification') {
        // a new annotation + notification combo object was sent over websocket

        // save the new annotation locally
        var annotationData = data.annotationData;
        this.StudentDataService.AnnotationService.addOrUpdateAnnotation(annotationData);
        this.$rootScope.$broadcast('newAnnotationReceived', { annotation: annotationData });

        // fire the new notification
        var notificationData = data.notificationData;
        this.$rootScope.$broadcast('newNotification', notificationData);
      }

      this.handleWebSocketMessageReceived(data);
    }

    /**
     * Send a message to teacher
     * @param data the data to send to the teacher
     */

  }, {
    key: "sendStudentToTeacherMessage",
    value: function sendStudentToTeacherMessage(messageType, data) {

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
    }
  }, {
    key: "sendStudentToClassmatesInPeriodMessage",


    /**
     * Send a message to classmates in the period
     * @param data the data to send to the classmates
     */
    value: function sendStudentToClassmatesInPeriodMessage(messageType, data) {

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
    }
  }]);

  return StudentWebSocketService;
}();

StudentWebSocketService.$inject = ['$rootScope', '$websocket', 'ConfigService', 'StudentDataService'];

exports.default = StudentWebSocketService;
//# sourceMappingURL=studentWebSocketService.js.map
