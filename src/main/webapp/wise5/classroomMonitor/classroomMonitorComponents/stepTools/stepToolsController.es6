"use strict";

class StepToolsCtrl {
    constructor($scope,
                NodeService,
                ProjectService,
                TeacherDataService,
                $mdSidenav) {

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
        //this.$mdSidenav = $mdSidenav;

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        this.updateModel();

        this.$scope.$on('currentNodeChanged', (event, args) => {
            this.updateModel();
        });
    }

    /*toggleStepNav() {
        this.$mdSidenav('stepNav').toggle();
    }*/

    toNodeIdChanged() {
        // selected node id has changed, so open new node
        this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.toNodeId);
    }

    updateModel() {
        var nodeId = this.TeacherDataService.getCurrentNodeId();
        if (!this.ProjectService.isGroupNode(nodeId)) {
            this.nodeId = nodeId;
            this.icon = this.getIcon(this.nodeId);

            this.prevId = this.NodeService.getPrevNodeId();
            this.nextId = null;
            this.NodeService.getNextNodeId().then((nodeId) => {
                this.nextId = nodeId;
            });

            // model variable for selected node id
            this.toNodeId = this.nodeId;
        }
    }

    getIcon(nodeId) {
        return this.ProjectService.getNodeIconByNodeId(nodeId);
    }

    getSelectedText() {
        return (this.showPosition && this.getNodePositionById(this.nodeId) ? this.getNodePositionById(this.nodeId) + ': ' : '') + this.getNodeTitleByNodeId(this.nodeId);
    }

    getNodeTitleByNodeId(nodeId) {
        return this.ProjectService.getNodeTitleByNodeId(nodeId);
    }

    getNodePositionById(nodeId) {
        return this.ProjectService.getNodePositionById(nodeId);
    }

    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    }

    goToPrevNode() {
        this.NodeService.goToPrevNode();
    }

    goToNextNode() {
        this.NodeService.goToNextNode();
    }

    closeNode() {
        this.NodeService.closeNode();
    }
}

StepToolsCtrl.$inject = [
    '$scope',
    'NodeService',
    'ProjectService',
    'TeacherDataService',
    '$mdSidenav'
];

export default StepToolsCtrl;
