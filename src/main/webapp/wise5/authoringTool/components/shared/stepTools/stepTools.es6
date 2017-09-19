"use strict";

class StepToolsController {
    constructor($scope,
                $state,
                ConfigService,
                NodeService,
                ProjectService,
                TeacherDataService,
                $mdSidenav) {

        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        // get the project id
        this.projectId = this.ConfigService.getProjectId();

        // set the current node to be selected in the drop down
        this.nodeId = this.TeacherDataService.getCurrentNodeId();

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        // update the current node id, previous node id, and next node id
        this.updateModel();

        this.$scope.$on('currentNodeChanged', (event, args) => {
            /*
             * the current node has changed so we will update the
             * current node id, previous node id, and next node id
             */
            this.updateModel();
        });

        this.$scope.$on('projectChanged', (event, args) => {
            /*
             * the project has changed most likely because the author has
             * added, deleted, or moved a step
             */

            // update the idToOrder mappings
            this.idToOrder = this.ProjectService.idToOrder;

            // update the current node id, previous node id, and next node id
            this.updateModel();
        })
    }

    /**
     * The user has selected a new node
     */
    nodeIdChanged() {
        // remember the new current node
        this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

        // go to the authoring view for the node
        this.$state.go('root.project.node', {projectId: this.projectId, nodeId: this.nodeId});
    }

    /**
     * update the current node id, previous node id, and next node id
     */
    updateModel() {

        // get the current node
        var nodeId = this.TeacherDataService.getCurrentNodeId();

        // set the current node to be selected in the drop down
        this.nodeId = nodeId;

        if (nodeId == null) {
            // the node id is null which means we are at the project level

            // set the previous and next node ids to null
            this.prevId = null;
            this.nextId = null;
        } else {
            /*
             * the node id is not null which means the current node is a group
             * or node
             */

            if (!this.ProjectService.isGroupNode(nodeId)) {
                // the node is a step

                // set the previous node id
                this.prevId = this.NodeService.getPrevNodeId(this.nodeId);

                // set the next node id
                this.nextId = null;
                this.NodeService.getNextNodeId(this.nodeId).then((nodeId) => {
                    this.nextId = nodeId;
                });
            }
        }
    }

    /*
     * Get the text for the selected node
     */
    getSelectedText() {

        // default to show this text if this.nodeId is null
        var text = 'Select a step';

        if (this.nodeId != null) {
            // get the step number and title
            text = this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId);
        }

        return text;
    }

    /**
     * Get the step number and title
     * @param nodeId the node id
     * @return the step number and title
     * example
     * "1.4: Explore photosynthesis"
     */
    getNodePositionAndTitleByNodeId(nodeId) {
        return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }

    /**
     * Check if a node is a group node
     * @param nodeId the node id
     * @return whether a node is a group node
     */
    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    }

    /**
     * Go to the previous node
     */
    goToPrevNode() {

        /*
         * Tell the NodeService to go to the previous node. This will set
         * the new current node id into the TeacherDataService.
         */
        this.NodeService.goToPrevNode();

        // set the current node to be selected in the drop down
        var nodeId = this.TeacherDataService.getCurrentNodeId();
        this.nodeId = nodeId;

        // go to the authoring view for the node
        this.$state.go('root.project.node', {projectId: this.projectId, nodeId: this.nodeId});
    }

    /**
     * Go to the next node
     */
    goToNextNode() {

        /*
         * Tell the NodeService to get the next node. This will return a promise
         * that will return the next node id.
         */
        this.NodeService.goToNextNode().then((nodeId) => {

            // set the current node to be selected in the drop down
            this.nodeId = nodeId;

            // go to the authoring view for the node
            this.$state.go('root.project.node', {projectId: this.projectId, nodeId: this.nodeId});
        });
    }
}

StepToolsController.$inject = [
    '$scope',
    '$state',
    'ConfigService',
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
                       ng-model="$ctrl.nodeId"
                       ng-change="$ctrl.nodeIdChanged()"
                       md-selected-text="$ctrl.getSelectedText()">
                <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : 'order'"
                           ng-if="item.order !== 0"
                           value="{{ item.$key }}"
                           ng-class="{'node-select-option--node': !$ctrl.isGroupNode(item.$key)}">
                    <div layout="row" layout-align="start center">
                        <node-icon node-id="item.$key" size="18" custom-class="'node-select__icon'"></node-icon>
                        <span class="node-select__text">{{ $ctrl.getNodePositionAndTitleByNodeId(item.$key) }}</span>
                    </div>
                </md-option>
            </md-select>
            <span flex></span>
            <md-button aria-label="{{'previousStep' | translate }}" class="md-icon-button node-nav"
                       ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevNode()">
                <md-icon> arrow_back </md-icon>
            </md-button>
            <md-button aria-label="{{ 'nextStep' | translate }}" class="md-icon-button node-nav"
                       ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextNode()" style="margin-right: 15px">
                <md-icon> arrow_forward </md-icon>
            </md-button>
        </div>`,
    controller: StepToolsController
};

export default StepTools;
