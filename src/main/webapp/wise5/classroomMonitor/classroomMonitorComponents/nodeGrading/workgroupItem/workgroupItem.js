"use strict";

class WorkgroupItemController {
    constructor($filter,
                $scope,
                ProjectService) {
        this.$filter = $filter;
        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.$translate = this.$filter('translate');
    }

    $onInit() {
      this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);
      this.statusText = '';
      this.update();
    }

    $onChanges(changesObj) {
      if (changesObj.hiddenComponents) {
          this.hiddenComponents = angular.copy(changesObj.hiddenComponents.currentValue);
      }

      if (changesObj.maxScore) {
          this.maxScore = typeof changesObj.maxScore.currentValue === 'number' ? changesObj.maxScore.currentValue : 0;
      }

      if (changesObj.workgroupData) {
          let workgroupData = angular.copy(changesObj.workgroupData.currentValue);
          this.hasAlert = workgroupData.hasAlert;
          this.hasNewAlert = workgroupData.hasNewAlert;
          this.status = workgroupData.completionStatus;
          this.score = workgroupData.score >= 0 ? workgroupData.score : '-';
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

                if (this.nodeHasWork) {
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

                if (this.nodeHasWork) {
                    this.statusText = this.$translate('noWork');
                } else {
                    this.statusText = this.$translate('notVisited');
                }
        }

        if (this.hasNewAlert) {
            this.statusClass = 'warn';
        }

        this.disabled = (this.status === -1);
    }

    toggleExpand() {
        if (this.showScore) {
            let expand = !this.expand;
            this.onUpdateExpand({workgroupId: this.workgroupId, value: expand});
        }
    }
}

WorkgroupItemController.$inject = [
    '$filter',
    '$scope',
    'ProjectService'
];

const WorkgroupItem = {
    bindings: {
        expand: '<',
        maxScore: '<',
        nodeId: '<',
        showScore: '<',
        workgroupId: '<',
        workgroupData: '<',
        hiddenComponents: '<',
        onUpdateExpand: '&'
    },
    controller: WorkgroupItemController,
    template:
        `<div class="md-whiteframe-1dp" ng-class="{'list-item--warn': $ctrl.statusClass === 'warn', 'list-item--info': $ctrl.statusClass === 'info'}">
            <md-subheader class="list-item md-whiteframe-1dp">
                <button class="md-button md-ink-ripple list-item__subheader-button"
                               aria-label="{{ ::toggleTeamWorkDisplay | translate }}"
                               ng-class="{'list-item--expanded': $ctrl.showWork,
                                   'list-item--noclick': !$ctrl.showScore || $ctrl.disabled}"
                               ng-click="$ctrl.toggleExpand()"
                               ng-disabled="$ctrl.disabled"
                               layout-wrap>
                    <div layout="row" flex>
                        <div flex layout="row" layout-align="start center">
                            <workgroup-info has-alert="$ctrl.hasAlert" has-new-alert="$ctrl.hasNewAlert" has-new-work="$ctrl.hasNewWork" usernames="{{$ctrl.workgroupData.displayNames}}" workgroup-id="$ctrl.workgroupId"></workgroup-info>
                        </div>
                        <div flex="{{$ctrl.showScore ? 30 : 20}}" layout="row" layout-align="center center">
                            <workgroup-node-status status-text="{{$ctrl.statusText}}" status-class="{{$ctrl.statusClass}}"></workgroup-node-status>
                        </div>
                        <div ng-if="$ctrl.showScore" flex="20" layout="row" layout-align="center center">
                            <workgroup-node-score score="{{$ctrl.score}}" max-score="{{$ctrl.maxScore}}"></workgroup-node-score>
                        </div>
                    </div>
                </button>
            </md-subheader>
            <md-list-item ng-if="$ctrl.expand && !$ctrl.disabled" class="grading__item-container">
                <workgroup-node-grading workgroup-id="::$ctrl.workgroupId"
                                        class="workgroup-node-grading"
                                        node-id="{{::$ctrl.nodeId}}"
                                        hidden-components="$ctrl.hiddenComponents"
                                        flex></workgroup-node-grading>
            </md-list-item>
        </div>`
};

export default WorkgroupItem;
