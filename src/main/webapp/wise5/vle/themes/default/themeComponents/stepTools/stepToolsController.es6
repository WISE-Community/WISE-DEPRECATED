"use strict";

class StepToolsCtrl {
    constructor($scope,
                NodeService,
                ProjectService,
                StudentDataService,
                $mdSidenav) {

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        //this.$mdSidenav = $mdSidenav;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        this.updateModel();

        this.$scope.$watch(
            () => { return this.toNodeId; },
            (newId, oldId) => {
                if (newId !== oldId) {
                    // selected node id has changed, so open new node
                    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(newId);
                }
            }
        );

        this.$scope.$on('currentNodeChanged', (event, args) => {
            this.updateModel();
        });

        this.$scope.$on('nodeStatusesChanged', (event, arge) => {
            this.updateModel();
        })
    }

    toggleStepNav() {
        this.$mdSidenav('stepNav')
          .toggle();
    }

    updateModel() {
        var nodeId = this.StudentDataService.getCurrentNodeId();
        if (!this.ProjectService.isGroupNode(nodeId)) {
            this.nodeId = nodeId;
            this.nodeStatus = this.nodeStatuses[this.nodeId];

            this.prevId = this.NodeService.getPrevNodeId();
            this.nextId = this.NodeService.getNextNodeId();

            // model variable for selected node id
            this.toNodeId = this.nodeId;
        }
    };

    getSelectedText() {
        return (this.showPosition ? this.getNodePositionById(this.nodeId) + ': ' : '') + this.getNodeTitleByNodeId(this.nodeId);
    };

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
    'StudentDataService',
    '$mdSidenav'
];

export default StepToolsCtrl;
