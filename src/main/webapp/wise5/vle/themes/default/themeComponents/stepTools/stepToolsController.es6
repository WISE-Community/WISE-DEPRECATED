"use strict";

class StepToolsCtrl {
    constructor($scope,
                NodeService,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];

        this.prevId = this.NodeService.getPrevNodeId();
        this.nextId = this.NodeService.getNextNodeId();

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        // model variable for selected node id
        this.toNodeId = this.nodeId;

        var scope = this;
        this.$scope.$watch(
            function () { return scope.toNodeId; }.bind(this),
            function (newId, oldId) {
                if (newId !== oldId) {
                    // selected node id has changed, so open new node
                    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(newId);
                }
            }.bind(this)
        );
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/themeComponents/stepTools/stepTools.html';
    };

    getNodeTitleByNodeId(nodeId) {
        return this.ProjectService.getNodeTitleByNodeId(nodeId);
    };

    getNodePositionById(nodeId) {
        return this.ProjectService.getNodePositionById(nodeId);
    };

    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    };

    goToPrevNode() {
        this.NodeService.goToPrevNode();
    };

    goToNextNode() {
        this.NodeService.goToNextNode();
    };

    closeNode() {
        this.NodeService.closeNode();
    };
}

StepToolsCtrl.$inject = [
    '$scope',
    'NodeService',
    'ProjectService',
    'StudentDataService'
];

export default StepToolsCtrl;
