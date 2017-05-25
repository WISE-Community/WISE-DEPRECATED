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
            <img ng-if="$ctrl.icon.type === 'img'" ng-animate-ref="{{ $ctrl.nodeId }}" class="md-18 avatar node-avatar" ng-src="{{$ctrl.icon.imgSrc}}" alt="{{$ctrl.icon.imgAlt}}" />
            <div ng-if="$ctrl.icon.type === 'font'" ng-animate-ref="{{ $ctrl.nodeId }}" style="background-color: {{$ctrl.icon.color}};" class="md-18 avatar avatar--icon node-avatar">
                <md-icon md-font-set="{{$ctrl.icon.fontSet}}" class="md-18 md-light node-icon" md-theme="default">{{$ctrl.icon.fontName}}</md-icon>
            </div>

            <md-select id="stepSelectMenu" md-theme="default" class="node-select md-subhead"
                       aria-label="{{ 'selectAStep' | translate }}"
                       ng-model="$ctrl.toNodeId"
                       ng-change="$ctrl.toNodeIdChanged()"
                       md-selected-text="$ctrl.getSelectedText()">
                <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : 'order'"
                           ng-init="icon = $ctrl.getIcon(item.$key)"
                           ng-if="item.order !== 0"
                           value="{{ item.$key }}"
                           ng-class="{'node-select-option--group': $ctrl.isGroupNode(item.$key), 'node-select-option--node': !$ctrl.isGroupNode(item.$key)}">
                    <div layout="row" layout-align="start center">
                        <img class="node-select__icon md-18 avatar node-avatar" ng-class="$ctrl.isGroupNode(item.$key) ? 'avatar--square' : ''" ng-if="icon.type === 'img'" ng-src="{{icon.imgSrc}}" alt="{{icon.imgAlt}}" />
                        <div class="node-select__icon md-18 avatar avatar--icon node-avatar" ng-class="$ctrl.isGroupNode(item.$key) ? 'avatar--square' : ''" ng-if="icon.type === 'font'" style="background-color: {{icon.color}};">
                            <md-icon md-font-set="{{icon.fontSet}}" class="md-18 md-light node-icon" md-theme="default">{{icon.fontName}}</md-icon>&nbsp;
                        </div>
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
            <md-button aria-label="{{ 'backToProject' | translate }}" class="md-icon-button node-nav" ng-click="$ctrl.closeNode()">
                <md-icon md-theme="default"> view_list </md-icon>
            </md-button>
        </div>`,
    controller: StepToolsController
};

export default StepTools;
