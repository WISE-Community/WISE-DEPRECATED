"use strict";

class StepToolsController {
    constructor($scope,
                NodeService,
                ProjectService,
                TeacherDataService,
                $mdSidenav) {

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        this.updateModel();

        this.$scope.$on('currentNodeChanged', (event, args) => {
            this.updateModel();
        });
    }

    toNodeIdChanged() {
        // selected node id has changed, so open new node
        this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.toNodeId);
    }

    updateModel() {
        var nodeId = this.TeacherDataService.getCurrentNodeId();
        if (!this.ProjectService.isGroupNode(nodeId)) {
            this.nodeId = nodeId;

            this.prevId = this.NodeService.getPrevNodeId();
            this.nextId = null;
            this.NodeService.getNextNodeId().then((nodeId) => {
                this.nextId = nodeId;
            });

            // model variable for selected node id
            this.toNodeId = this.nodeId;
        }
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

    showNode(nodeId) {
        return this.isGroupNode(nodeId) || this.ProjectService.nodeHasWork(nodeId);
    }

    goToPrevNode() {
        this.NodeService.goToPrevNode();
    }

    goToNextNode() {
        this.NodeService.goToNextNode();
    }
}

StepToolsController.$inject = [
    '$scope',
    'NodeService',
    'ProjectService',
    'TeacherDataService',
    '$mdSidenav'
];

const StepTools = {
    bindings: {
        showPosition: '<'
    },
    template:
        `<div layout="row" layout-align="center center">
            <node-icon node-id="$ctrl.nodeId" size="18"></node-icon>
            <md-select id="stepSelectMenu" md-theme="default" class="node-select md-subhead"
                       aria-label="{{ 'selectAStep' | translate }}"
                       ng-model="$ctrl.toNodeId"
                       ng-change="$ctrl.toNodeIdChanged()"
                       md-selected-text="$ctrl.getSelectedText()">
                <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : 'order'"
                           ng-if="item.order !== 0 && $ctrl.showNode(item.$key)"
                           value="{{ item.$key }}"
                           ng-class="{'node-select-option--group': $ctrl.isGroupNode(item.$key), 'node-select-option--node': !$ctrl.isGroupNode(item.$key)}">
                    <div layout="row" layout-align="start center">
                        <node-icon node-id="item.$key" size="18" custom-class="'node-select__icon'"></node-icon>
                        <span class="node-select__text">{{ $ctrl.showPosition && $ctrl.getNodePositionById(item.$key) ? $ctrl.getNodePositionById(item.$key) + ': ' : '' }}{{ $ctrl.getNodeTitleByNodeId(item.$key) }}</span>
                    </div>
                </md-option>
            </md-select>
            <span flex></span>
            <md-button aria-label="{{'previousStep' | translate }}" class="md-icon-button node-nav"
                       ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevNode()">
                <md-icon> arrow_back </md-icon>
            </md-button>
            <md-button aria-label="{{ 'nextStep' | translate }}" class="md-icon-button node-nav"
                       ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextNode()">
                <md-icon> arrow_forward </md-icon>
            </md-button>
        </div>`,
    controller: StepToolsController
};

export default StepTools;
