class NavigationController {
  constructor(
      $rootScope,
      $filter,
      ConfigService,
      ProjectService,
      StudentDataService) {
    this.$rootScope = $rootScope;
    this.$filter = $filter;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.rootNode = this.ProjectService.rootNode;

    this.$rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
      const toNodeId = toParams.nodeId;
      const fromNodeId = fromParams.nodeId;
      if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
      }

      if (toState.name === 'root.vle') {
        const nodeId = toParams.nodeId;
        if (this.ProjectService.isApplicationNode(nodeId)) {
          // scroll to top when viewing a new step
          document.getElementById('content').scrollTop = 0;
        }
      }
    }.bind(this));
  }
}

NavigationController.$inject = [
  '$rootScope',
  '$filter',
  'ConfigService',
  'ProjectService',
  'StudentDataService'
];

export default NavigationController;
