'use strict';

class StepToolsController {
  constructor($scope, $state, ConfigService, NodeService, ProjectService, TeacherDataService) {
    this.$scope = $scope;
    this.$state = $state;
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.projectId = this.ConfigService.getProjectId();
    this.is_rtl = $('html').attr('dir') == 'rtl';
    this.icons = { prev: 'chevron_left', next: 'chevron_right' };
    if (this.is_rtl) {
      this.icons = { prev: 'chevron_right', next: 'chevron_left' };
    }
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.idToOrder = this.ProjectService.idToOrder;
    this.updateModel();
    this.$scope.$on('currentNodeChanged', (event, args) => {
      this.updateModel();
    });
    this.$scope.$on('projectChanged', (event, args) => {
      this.projectId = this.ConfigService.getProjectId();
      this.idToOrder = this.ProjectService.idToOrder;
      this.updateModel();
    });
  }

  nodeIdChanged() {
    this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);
    this.$state.go('root.project.node', { projectId: this.projectId, nodeId: this.nodeId });
  }

  updateModel() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    if (this.nodeId == null) {
      this.prevId = null;
      this.nextId = null;
    } else {
      if (!this.ProjectService.isGroupNode(this.nodeId)) {
        this.prevId = this.NodeService.getPrevNodeId(this.nodeId);
        this.NodeService.getNextNodeId(this.nodeId).then(currentNodeId => {
          this.nextId = currentNodeId;
        });
      }
    }
  }

  getSelectedText() {
    let text = 'Select a step';
    if (this.nodeId != null) {
      text = this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId);
    }
    return text;
  }

  getNodePositionAndTitleByNodeId(nodeId) {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  goToPrevNode() {
    this.NodeService.goToPrevNode();
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.$state.go('root.project.node', { projectId: this.projectId, nodeId: this.nodeId });
  }

  goToNextNode() {
    this.NodeService.goToNextNode().then(nodeId => {
      this.nodeId = nodeId;
      this.$state.go('root.project.node', { projectId: this.projectId, nodeId: this.nodeId });
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
  template: `<div layout="row" layout-align="center center">
      <md-button id="previousNodeButton"
                 aria-label="{{ ::'PREVIOUS_STEP' | translate }}"
                 class="md-icon-button toolbar__nav"
                 ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevNode()">
          <md-icon> {{$ctrl.icons.prev}} </md-icon>
          <md-tooltip md-direction="bottom">{{ ::'PREVIOUS_STEP' | translate }}</md-tooltip>
      </md-button>
      <node-icon node-id="$ctrl.nodeId" size="18"></node-icon>&nbsp;
      <md-select id="stepSelectMenu" md-theme="default"
                 class="md-button md-no-underline toolbar__select toolbar__select--fixedwidth"
                 md-container-class="stepSelectMenuContainer"
                 aria-label="{{ ::'selectAStep' | translate }}"
                 ng-model="$ctrl.nodeId"
                 ng-change="$ctrl.nodeIdChanged()"
                 md-selected-text="$ctrl.getSelectedText()">
          <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : 'order'"
                     ng-if="item.order !== 0"
                     value="{{ ::item.$key }}"
                     ng-class="::{'node-select-option--group': $ctrl.isGroupNode(item.$key), 'node-select-option--node': !$ctrl.isGroupNode(item.$key)}">
              <div layout="row" layout-align="start center">
                  <node-icon node-id="::item.$key" size="18" custom-class="'node-select__icon'"></node-icon>
                  <span class="node-select__text">{{ ::$ctrl.getNodePositionAndTitleByNodeId(item.$key) }}</span>
              </div>
          </md-option>
      </md-select>
      <md-button id="nextNodeButton"
                 aria-label="{{ 'NEXT_STEP' | translate }}"
                 class="md-icon-button toolbar__nav"
                 ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextNode()">
          <md-icon> {{$ctrl.icons.next}} </md-icon>
          <md-tooltip md-direction="bottom">{{ 'NEXT_STEP' | translate }}</md-tooltip>
      </md-button>
  </div>`,
  controller: StepToolsController
};

export default StepTools;
