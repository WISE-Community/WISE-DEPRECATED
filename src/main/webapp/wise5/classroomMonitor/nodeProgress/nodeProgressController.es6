'use strict';

class NodeProgressController {

    constructor($scope,
                $state,
                $translate,
                ProjectService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$scope = $scope;
        this.$state = $state;
        this.$translate = $translate;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.currentGroup = null;

        this.items = this.ProjectService.idToOrder;

        this.nodeId = null;
        let stateParams = null;
        let stateParamNodeId = null;

        if (this.$state != null) {
            stateParams = this.$state.params;
        }

        if (stateParams != null) {
            stateParamNodeId = stateParams.nodeId;
        }

        if (stateParamNodeId != null && stateParamNodeId !== '') {
            this.nodeId = stateParamNodeId;
        }

        if (this.nodeId == null || this.nodeId === '') {
            this.nodeId = this.ProjectService.rootNode.id;
        }

        this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

        let startNodeId = this.ProjectService.getStartNodeId();
        this.rootNode = this.ProjectService.getRootNode(startNodeId);

        this.currentGroup = this.rootNode;

        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
            this.$scope.currentgroupid = this.currentGroupId;
        }

        var flattenedProjectNodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        //console.log(JSON.stringify(flattenedProjectNodeIds, null, 4));

        var branches = this.ProjectService.getBranches();

        let currentPeriod = this.getCurrentPeriod();

        if (currentPeriod) {
            this.isPaused = this.TeacherDataService.isPeriodPaused(currentPeriod.periodId);
        }

        /**
         * Listen for current node changed event
         */
        this.$scope.$on('currentNodeChanged', (event, args) => {
            let previousNode = args.previousNode;
            let currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                let nodeId = previousNode.id;
            }

            if (currentNode != null) {

                this.nodeId = currentNode.id;
                this.TeacherDataService.setCurrentNode(currentNode);

                if (this.isGroupNode(this.nodeId)) {
                    // current node is a group

                    this.currentGroup = currentNode;
                    this.currentGroupId = this.currentGroup.id;
                    this.$scope.currentgroupid = this.currentGroupId;
                //} else if (this.isApplicationNode(this.nodeId)) {
                }
            }

            this.$state.go('root.nodeProgress', {nodeId: this.nodeId});
        });

        /**
         * Listen for current period changed event
         */
        this.$scope.$on('currentPeriodChanged', (event, args) => {
            let currentPeriod = args.currentPeriod;
            this.isPaused = this.TeacherDataService.isPeriodPaused(currentPeriod.periodId);
        });

        /**
         * Listen for state change event
         */
        this.$scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            let toNodeId = toParams.nodeId;
            let fromNodeId = fromParams.nodeId;
            if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
                this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
            }

            if (toState.name === 'root.project') {
                let nodeId = toParams.nodeId;
                if (this.ProjectService.isApplicationNode(nodeId)) {
                    // scroll to top when viewing a new step
                    document.getElementById('content').scrollTop = 0;
                }
            }
        });
    }

    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    }

    isApplicationNode(nodeId) {
        return this.ProjectService.isApplicationNode(nodeId);
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    }

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
        var count = this.StudentStatusService.getWorkgroupIdsOnNode(nodeId, periodId).length;

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
     * The pause screen status was changed. Update period(s) accordingly.
     */
    pauseScreensChanged(isPaused) {
        this.TeacherDataService.pauseScreensChanged(isPaused);
    }
}

NodeProgressController.$inject = [
    '$scope',
    '$state',
    '$translate',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default NodeProgressController;
