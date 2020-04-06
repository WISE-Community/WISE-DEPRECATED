class NavigationController {
  constructor($filter, $transitions, ConfigService, ProjectService, StudentDataService) {
    this.$filter = $filter;
    this.$transitions = $transitions;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.rootNode = this.ProjectService.rootNode;

    $transitions.onSuccess({}, $transition => {
      const toNodeId = $transition.params('to').nodeId;
      const fromNodeId = $transition.params('from').nodeId;
      if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
      }

      if ($transition.name === 'root.vle') {
        if (this.ProjectService.isApplicationNode(toNodeId)) {
          // scroll to top when viewing a new step
          document.getElementById('content').scrollTop = 0;
        }
      }
    });
  }
}

NavigationController.$inject = [
  '$filter',
  '$transitions',
  'ConfigService',
  'ProjectService',
  'StudentDataService'
];

export default NavigationController;
