class AuthorWebSocketService {
  constructor($rootScope, $stomp, ConfigService) {
    this.$rootScope = $rootScope;
    this.$stomp = $stomp;
    this.ConfigService = ConfigService;
  }

  subscribeToCurrentAuthors(projectId) {
    return this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
      this.$stomp.subscribe(`/topic/current-authors/${projectId}`, (authors, headers, res) => {
        this.$rootScope.$broadcast('currentAuthorsReceived', { authors: authors });
      }, {});
    });
  }

  unSubscribeFromCurrentAuthors(projectId) {
    return this.$stomp.disconnect();
  }
}

AuthorWebSocketService.$inject = [
  '$rootScope',
  '$stomp',
  'ConfigService'
];

export default AuthorWebSocketService;
