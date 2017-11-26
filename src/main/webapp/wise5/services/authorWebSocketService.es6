class AuthorWebSocketService {
  constructor($rootScope, $websocket, ConfigService) {
    this.$rootScope = $rootScope;
    this.$websocket = $websocket;
    this.ConfigService = ConfigService;
    this.dataStream = null;
  }

  /**
   * Initialize the websocket connection and listens for messages
   */
  initialize() {
    const webSocketURL = this.ConfigService.getWebSocketURL() +
        "?projectId=" + this.ConfigService.getProjectId();
    this.dataStream = this.$websocket(webSocketURL);
    this.dataStream.onMessage((message) => {
      this.handleMessage(message);
    });
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
  '$websocket',
  'ConfigService'
];

export default AuthorWebSocketService;
