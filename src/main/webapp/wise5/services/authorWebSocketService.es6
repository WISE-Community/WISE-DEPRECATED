class AuthorWebSocketService {
  constructor($rootScope, $stomp, $websocket, ConfigService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.dataStream = null;
  }

  /**
   * Initialize the websocket connection and listens for messages
   */
  initialize() {
    const webSocketURL = this.ConfigService.getWebSocketURL();
    try {
      this.$stomp.connect(webSocketURL, (payload, headers, res) => {
        console.log(`Current Authors: ${payload}`);
      }, {});
    } catch(e) {
      console.log(e);
    }
  }

  subscribeToCurrentAuthors(projectId) {
    try {
      const currentAuthorsSubscription = this.$stomp.subscribe(`/topic/current-authors/${projectId}`, (payload, headers, res) => {
        console.log(`Greeting: ${payload}`);
      }, {});
    } catch(e) {
      console.log(e);
    }
  }

  handleMessage(message) {
    let data = JSON.parse(message.data);
    let messageType = data.messageType;
    if (messageType === "currentAuthors") {
      this.$rootScope.$broadcast('currentAuthorsReceived',
          {currentAuthorsUsernames: data.currentAuthorsUsernames});
    }
  }

  sendMessage(messageJSON) {
    this.dataStream.send(messageJSON);
  }
}

AuthorWebSocketService.$inject = [
  '$rootScope',
  '$stomp',
  '$websocket',
  'ConfigService'
];

export default AuthorWebSocketService;
