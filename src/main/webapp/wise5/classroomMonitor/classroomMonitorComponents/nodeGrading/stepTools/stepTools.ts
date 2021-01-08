'use strict';

import { NodeService } from '../../../../services/nodeService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import * as $ from 'jquery';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { Directive } from '@angular/core';

@Directive()
class StepToolsController {
  icons: any;
  idToOrder: any;
  is_rtl: any;
  nextId: string;
  nodeId: string;
  prevId: string;
  showPosition: boolean;
  toNodeId: string;
  currentNodeChangedSubscription: any;
  static $inject = ['$scope', 'NodeService', 'ProjectService', 'TeacherDataService'];
  constructor(
    private $scope: any,
    private NodeService: NodeService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {
    this.is_rtl = $('html').attr('dir') == 'rtl';
    this.icons = { prev: 'chevron_left', next: 'chevron_right' };
    if (this.is_rtl) {
      this.icons = { prev: 'chevron_right', next: 'chevron_left' };
    }

    this.idToOrder = this.ProjectService.idToOrder;
    this.updateModel();
    this.currentNodeChangedSubscription = this.TeacherDataService.currentNodeChanged$.subscribe(
      () => {
        this.updateModel();
      }
    );
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.currentNodeChangedSubscription.unsubscribe();
  }

  toNodeIdChanged() {
    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.toNodeId);
  }

  updateModel() {
    var nodeId = this.TeacherDataService.getCurrentNodeId();
    if (!this.ProjectService.isGroupNode(nodeId)) {
      this.nodeId = nodeId;
      this.prevId = this.NodeService.getPrevNodeIdWithWork();
      this.nextId = null;
      this.NodeService.getNextNodeIdWithWork().then((nextNodeId) => {
        this.nextId = nextNodeId;
      });
      this.toNodeId = this.nodeId;
    }
  }

  getSelectedText() {
    return (
      (this.showPosition && this.getNodePositionById(this.nodeId)
        ? this.getNodePositionById(this.nodeId) + ': '
        : '') + this.getNodeTitleByNodeId(this.nodeId)
    );
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
    this.NodeService.goToPrevNodeWithWork();
  }

  goToNextNode() {
    this.NodeService.goToNextNodeWithWork();
  }
}

const StepTools = {
  bindings: {
    showPosition: '<'
  },
  template: `<div layout="row" layout-align="center center">
            <md-button aria-label="{{ ::'PREVIOUS_STEP' | translate }}"
                       class="md-icon-button toolbar__nav"
                       ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevNode()">
                <md-icon> {{ ::$ctrl.icons.prev }} </md-icon>
                <md-tooltip md-direction="bottom">{{ ::'PREVIOUS_STEP' | translate }}</md-tooltip>
            </md-button>
            <node-icon ng-if="$ctrl.nodeId" hide-xs [node-id]="$ctrl.nodeId" size="18"></node-icon>&nbsp;
            <md-select id="stepSelectMenu" md-theme="cm"
                       class="md-button md-no-underline toolbar__select toolbar__select--fixedwidth"
                       md-container-class="stepSelectMenuContainer"
                       aria-label="{{ ::'selectAStep' | translate }}"
                       ng-model="$ctrl.toNodeId"
                       ng-change="$ctrl.toNodeIdChanged()"
                       md-selected-text="$ctrl.getSelectedText()">
                <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : 'order'"
                           ng-if="item.order !== 0 && $ctrl.showNode(item.$key)"
                           value="{{ ::item.$key }}"
                           ng-class="::{'node-select-option--group': $ctrl.isGroupNode(item.$key), 'node-select-option--node': !$ctrl.isGroupNode(item.$key)}">
                    <div layout="row" layout-align="start center">
                        <node-icon [node-id]="item.$key" size="18" custom-class="node-select__icon"></node-icon>
                        <span class="node-select__text">{{ $ctrl.showPosition && $ctrl.getNodePositionById(item.$key) ? $ctrl.getNodePositionById(item.$key) + ': ' : '' }}{{ ::$ctrl.getNodeTitleByNodeId(item.$key) }}</span>
                    </div>
                </md-option>
            </md-select>
            <md-button aria-label="{{ ::'NEXT_STEP' | translate }}"
                       class="md-icon-button toolbar__nav"
                       ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextNode()">
                <md-icon> {{ ::$ctrl.icons.next }} </md-icon>
                <md-tooltip md-direction="bottom">{{ ::'NEXT_STEP' | translate }}</md-tooltip>
            </md-button>
        </div>`,
  controller: StepToolsController
};

export default StepTools;
