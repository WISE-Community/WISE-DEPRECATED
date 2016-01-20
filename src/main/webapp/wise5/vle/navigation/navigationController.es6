class NavigationController {
    constructor($rootScope,
                ProjectService,
                StudentDataService) {

        this.$rootScope = $rootScope;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.rootNode = this.ProjectService.rootNode;

        this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var toNodeId = toParams.nodeId;
            var fromNodeId = fromParams.nodeId;
            if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
            }
        }.bind(this));
    }
}

NavigationController.$inject = [
    '$rootScope',
    'ProjectService',
    'StudentDataService'
];

export default NavigationController;
