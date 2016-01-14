class NodeProgressController {
    constructor($scope, $state, ConfigService, ProjectService, TeacherDataService) {
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
        this.title = 'Grade By Step';
        this.currentGroup = null;
        this.items = null;
        this.periods = [];

        // initialize the periods
        this.initializePeriods();

        this.items = this.ProjectService.idToOrder;

        this.$scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                var nodeId = previousNode.id;
            }

            if (currentNode != null) {

                var currentNodeId = currentNode.id;

                if (this.ProjectService.isGroupNode(currentNodeId)) {
                    // current node is a group

                    this.currentGroup = currentNode;
                    this.currentGroupId = this.currentGroup.id;
                    this.$scope.currentgroupid = this.currentGroupId;
                } else if (this.ProjectService.isApplicationNode(currentNodeId)) {
                    // current node is an application node
                    // load the step grading view
                    this.$state.go('root.nodeGrading', {nodeId: currentNodeId});
                }
            }

            this.$scope.$apply();
        }));

        var startNodeId = this.ProjectService.getStartNodeId();
        var rootNode = this.ProjectService.getRootNode(startNodeId);

        this.currentGroup = rootNode;


        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
            this.$scope.currentgroupid = this.currentGroupId;
        }

        var flattenedProjectNodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        //console.log(JSON.stringify(flattenedProjectNodeIds, null, 4));

        var branches = this.ProjectService.getBranches();
    }

    getNodeTitleByNodeId(nodeId) {
        return this.ProjectService.getNodeTitleByNodeId(nodeId);
    };

    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    };

    getNodePositionById(nodeId) {
        return this.ProjectService.getNodePositionById(nodeId);
    };

    /**
     * Initialize the periods
     */
    initializePeriods() {

        // create an option for all periods
        var allPeriodOption = {
            periodId: -1,
            periodName: 'All'
        };

        this.periods.push(allPeriodOption);

        this.periods = this.periods.concat(this.ConfigService.getPeriods());

        // set the current period if it hasn't been set yet
        if (this.getCurrentPeriod() == null) {
            if (this.periods != null && this.periods.length > 0) {
                // set it to the all periods option
                this.setCurrentPeriod(this.periods[0]);
            }
        }
    };

    /**
     * Set the current period
     * @param period the period object
     */
    setCurrentPeriod(period) {
        this.TeacherDataService.setCurrentPeriod(period);
    };

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    };

    nodeClicked(nodeId) {

        this.$state.go('root.nodeGrading', {nodeId:nodeId});
    };
}
NodeProgressController.$inject = ['$scope', '$state', 'ConfigService', 'ProjectService', 'TeacherDataService'];

export default NodeProgressController;