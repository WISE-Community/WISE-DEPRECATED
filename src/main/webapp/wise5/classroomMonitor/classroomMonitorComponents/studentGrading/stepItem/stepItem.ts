'use strict';

import * as angular from 'angular';

class StepItemController {
  $translate: any;
  disabled: boolean;
  expand: boolean;
  hasAlert: boolean;
  hasNewAlert: boolean;
  maxScore: number;
  nodeId: string;
  onUpdateExpand: any;
  score: any;
  showScore: boolean;
  status: any;
  statusClass: string;
  statusText: string;
  title: string;

  static $inject = ['$filter'];

  constructor($filter: any) {
    this.$translate = $filter('translate');
    this.statusText = '';
  }

  $onChanges(changesObj) {
    if (changesObj.maxScore) {
      this.maxScore =
        typeof changesObj.maxScore.currentValue === 'number' ? changesObj.maxScore.currentValue : 0;
    }
    if (changesObj.stepData) {
      let stepData = angular.copy(changesObj.stepData.currentValue);
      this.title = stepData.title;
      this.hasAlert = stepData.hasAlert;
      this.hasNewAlert = stepData.hasNewAlert;
      this.status = stepData.completionStatus;
      this.score = stepData.score >= 0 ? stepData.score : '-';
    }
    this.update();
  }

  update() {
    switch (this.status) {
      case -1:
        this.statusClass = ' ';
        this.statusText = this.$translate('notAssigned');
        break;
      case 2:
        this.statusClass = 'success';
        if (this.showScore) {
          this.statusText = this.$translate('completed');
        } else {
          this.statusText = this.$translate('visited');
        }
        break;
      case 1:
        this.statusClass = 'text';
        this.statusText = this.$translate('partiallyCompleted');
        break;
      default:
        this.statusClass = 'text-secondary';
        if (this.showScore) {
          this.statusText = this.$translate('noWork');
        } else {
          this.statusText = this.$translate('notVisited');
        }
    }
    if (this.hasNewAlert) {
      this.statusClass = 'warn';
    }
    this.disabled = this.status === -1;
  }

  toggleExpand() {
    if (this.showScore) {
      let expand = !this.expand;
      this.onUpdateExpand({ nodeId: this.nodeId, value: expand });
    }
  }
}

const StepItem = {
  bindings: {
    expand: '<',
    maxScore: '<',
    nodeId: '<',
    showScore: '<',
    workgroupId: '<',
    stepData: '<',
    onUpdateExpand: '&'
  },
  controller: StepItemController,
  template: `<div class="md-whiteframe-1dp"
          ng-class="{ 'list-item--warn': $ctrl.statusClass === 'warn', 'list-item--info': $ctrl.statusClass === 'info' }">
      <md-subheader class="list-item md-whiteframe-1dp">
        <button class="md-button md-ink-ripple list-item__subheader-button"
                aria-label="{{ ::toggleTeamWorkDisplay | translate }}"
                ng-class="{ 'list-item--noclick': !$ctrl.showScore || $ctrl.disabled }"
                ng-click="$ctrl.toggleExpand()"
                ng-disabled="$ctrl.disabled"
                layout-wrap>
          <div layout="row" flex>
            <div flex layout="row" layout-align="start center">
              <step-info [has-alert]="$ctrl.hasAlert"
                         [has-new-alert]="$ctrl.hasNewAlert"
                         [has-new-work]="$ctrl.hasNewWork"
                         [node-id]="::$ctrl.nodeId"></step-info>
            </div>
            <div flex="{{ $ctrl.showScore ? 30 : 20 }}" layout="row" layout-align="center center">
              <workgroup-node-status [status-text]="$ctrl.statusText" [status-class]="$ctrl.statusClass"></workgroup-node-status>
            </div>
            <div ng-if="$ctrl.showScore" flex="20" layout="row" layout-align="center center">
              <workgroup-node-score [score]="$ctrl.score" [max-score]="$ctrl.maxScore"></workgroup-node-score>
            </div>
          </div>
        </button>
      </md-subheader>
      <md-list-item ng-if="$ctrl.expand && !$ctrl.disabled" class="grading__item-container">
        <workgroup-node-grading workgroup-id="::$ctrl.workgroupId"
                                class="workgroup-node-grading"
                                node-id="{{ ::$ctrl.nodeId }}"
                                hidden-components="[]"
                                flex></workgroup-node-grading>
      </md-list-item>
    </div>`
};

export default StepItem;
