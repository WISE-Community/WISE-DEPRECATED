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
  initialize() {
    // start the websocket connection
    const webSocketURL = this.ConfigService.getWebSocketURL() +
        "?projectId=" + this.ConfigService.getProjectId();
    this.dataStream = this.$websocket(webSocketURL);
    // this is the function that handles messages we receive from web sockets
    this.dataStream.onMessage((message) => {
      this.handleMessage(message);
    });
  };

  handleMessage(message) {
    let data = JSON.parse(message.data);
    let messageType = data.messageType;
    if (messageType === "currentAuthors") {
      this.$rootScope.$broadcast('currentAuthorsReceived', {currentAuthorsUsernames: data.currentAuthorsUsernames});
    }
  };

  sendMessage(messageJSON) {
    // send the websocket message
    this.dataStream.send(messageJSON);
  }
}

AuthorWebSocketService.$inject = [
  '$rootScope',
  '$websocket',
  'ConfigService'
];

export default AuthorWebSocketService;
