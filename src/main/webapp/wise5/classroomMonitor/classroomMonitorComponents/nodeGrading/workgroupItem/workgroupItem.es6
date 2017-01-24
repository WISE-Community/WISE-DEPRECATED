"use strict";

class WorkgroupItemController {
    constructor($filter,
                $scope,
                ProjectService) {

        this.$filter = $filter;
        this.$scope = $scope;
        this.ProjectService = ProjectService;

        this.$translate = this.$filter('translate');
        this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);
        this.statusText = '';

        this.$onChanges = (changesObj) => {
            if (changesObj.hiddenComponents) {
                this.hiddenComponents = angular.copy(changesObj.hiddenComponents.currentValue);
            }

            if (changesObj.maxScore) {
                this.hasMaxScore = typeof changesObj.maxScore.currentValue === 'number';
            }

            if (changesObj.workgroupData) {
                let workgroupData = angular.copy(changesObj.workgroupData.currentValue);
                this.hasAlert = workgroupData.hasAlert;
                this.hasNewAlert = workgroupData.hasNewAlert;
                this.status = workgroupData.completionStatus;
                this.score = workgroupData.score > -1 ? workgroupData.score : '-';
                this.latestWorkTime = workgroupData.latestWorkTime;
            }

            this.update();
        };
    };

    update() {
        let completion = 0;

        switch (this.status) {
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
    }

    updateHiddenComponents(value, event) {
        this.onUpdateHidden({value: value, event: event});
    }

    toggleExpand() {
        let expand = !this.expand;
        this.onUpdateExpand({workgroupId: this.workgroupId, value: expand});
    }
}

WorkgroupItemController.$inject = [
    '$filter',
    '$scope',
    'ProjectService'
];

const WorkgroupItem = {
    bindings: {
        canViewStudentNames: '<',
        expand: '<',
        maxScore: '<',
        nodeId: '<',
        workgroupId: '<',
        workgroupData: '<',
        hiddenComponents: '<',
        onUpdateHidden: '&',
        onUpdateExpand: '&'
    },
    controller: WorkgroupItemController,
    template:
        `<md-list-item class="list-item list-item-condensed md-whiteframe-z1"
                       ng-class="{'list-item--warn': $ctrl.statusClass === 'warn', 'list-item--info': $ctrl.statusClass === 'info', 'list-item--expanded': $ctrl.showWork}"
                       ng-click="$ctrl.toggleExpand()"
                       layout-wrap>
            <div class="md-list-item-text" layout="row" flex>
                <div flex layout="row" layout-align="start center">
                    <workgroup-info has-alert="$ctrl.hasAlert" has-new-alert="$ctrl.hasNewAlert" usernames="{{$ctrl.workgroupData.usernames}}"></workgroup-info>
                </div>
                <div flex="30" layout="row" layout-align="center center">
                    <workgroup-node-status status-text="{{$ctrl.statusText}}" status-class="{{$ctrl.statusClass}}"></workgroup-node-status>
                </div>
                <div ng-if="$ctrl.hasMaxScore" flex="20" layout="row" layout-align="center center">
                    <workgroup-node-score score="{{$ctrl.score}}" max-score="{{$ctrl.maxScore}}"></workgroup-node-score>
                </div>
            </div>
        </md-list-item>
        <workgroup-node-grading workgroup-id="$ctrl.workgroupId"
                                node-id="{{$ctrl.nodeId}}"
                                latest-work-time="$ctrl.latestWorkTime"
                                ng-if="$ctrl.expand"
                                hidden-components="$ctrl.hiddenComponents"
                                on-update="$ctrl.updateHiddenComponents(value, event)"></workgroup-node-grading>`
};

export default WorkgroupItem;
