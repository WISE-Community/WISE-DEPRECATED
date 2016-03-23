'use strict';

class NodeProgressController {

    constructor($scope,
                $state,
                ConfigService,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.currentGroup = null;
        this.items = null;
        this.periods = [];

        // initialize the periods
        this.initializePeriods();

        this.items = this.ProjectService.idToOrder;

        this.$scope.$on('currentNodeChanged', (event, args) => {
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
        });

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

    /**
     * Get the number of students on the node
     * @param nodeId the node id
     * @returns the number of students that are on the node
     */
    getNumberOfStudentsOnNode(nodeId) {
        // get the currently selected period
        var currentPeriod = this.getCurrentPeriod();
        var periodId = currentPeriod.periodId;

        // get the number of students that are on the node in the period
        var count = this.StudentStatusService.getNumberOfStudentsOnNode(nodeId, periodId);

        return count;
    }

    /**
     * Get the percentage of the class or period that has completed the node
     * @param nodeId the node id
     * @returns the percentage of the class or period that has completed the node
     */
    getNodeCompletion(nodeId) {
        // get the currently selected period
        var currentPeriod = this.getCurrentPeriod();
        var periodId = currentPeriod.periodId;

        // get the percentage of the class or period that has completed the node
        var completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId);

        return completionPercentage;
    }

    /**
     * Check if there are any online students on the node
     * @param nodeId the node id
     * @returns whether there are any online students on the node
     */
    isWorkgroupOnlineOnNode(nodeId) {
        // get the currently selected period
        var currentPeriod = this.getCurrentPeriod();
        var periodId = currentPeriod.periodId;

        // get the workgroup ids that are online
        var studentsOnline = this.TeacherWebSocketService.getStudentsOnline();

        // check if there are any online students on the node in the period
        var isOnline = this.StudentStatusService.isWorkgroupOnlineOnNode(studentsOnline, nodeId, periodId);

        return isOnline;
    }

    /**
     * Get the average score for the node
     * @param nodeId the node id
     * @returns the average score for the node
     */
    getNodeAverageScore(nodeId) {
        // get the currently selected period
        var currentPeriod = this.getCurrentPeriod();
        var periodId = currentPeriod.periodId;

        // get the max score for the node
        var nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);

        // get the average score for the node
        var averageScore = this.StudentStatusService.getNodeAverageScore(nodeId, periodId);

        var averageScoreDisplay = null;

        if (averageScore != null && nodeMaxScore != null) {
            // create the average score display e.g. 8/10
            averageScoreDisplay = averageScore + '/' + nodeMaxScore;
        }

        return averageScoreDisplay;
    }
}

NodeProgressController.$inject = [
    '$scope',
    '$state',
    'ConfigService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default NodeProgressController;
