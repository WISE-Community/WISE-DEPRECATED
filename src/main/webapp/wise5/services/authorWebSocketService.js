'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthorWebSocketService = function () {
  function AuthorWebSocketService($rootScope, $stomp, $websocket, ConfigService) {
    _classCallCheck(this, AuthorWebSocketService);

    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.dataStream = null;
  }

  /**
   * Initialize the websocket connection and listens for messages
   */


  _createClass(AuthorWebSocketService, [{
    key: 'initialize',
    value: function initialize() {
      var webSocketURL = this.ConfigService.getWebSocketURL();
      try {
        this.$stomp.connect(webSocketURL, function (payload, headers, res) {
          console.log('Current Authors: ' + payload);
        }, {});
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'subscribeToCurrentAuthors',
    value: function subscribeToCurrentAuthors(projectId) {
      try {
        var currentAuthorsSubscription = this.$stomp.subscribe('/topic/current-authors/' + projectId, function (payload, headers, res) {
          console.log('Greeting: ' + payload);
        }, {});
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'handleMessage',
    value: function handleMessage(message) {
      var data = JSON.parse(message.data);
      var messageType = data.messageType;
      if (messageType === "currentAuthors") {
        this.$rootScope.$broadcast('currentAuthorsReceived', { currentAuthorsUsernames: data.currentAuthorsUsernames });
      }
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(messageJSON) {
      this.dataStream.send(messageJSON);
    }
  }]);

  return AuthorWebSocketService;
}();

AuthorWebSocketService.$inject = ['$rootScope', '$stomp', '$websocket', 'ConfigService'];

exports.default = AuthorWebSocketService;
//# sourceMappingURL=authorWebSocketService.js.map
