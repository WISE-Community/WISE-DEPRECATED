'use strict';

class ComponentRevisionsInfoController {
    constructor($filter,
                $mdDialog,
                $scope,
                ConfigService,
                TeacherDataService) {
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');

        this.$onInit = () => {
            this.runId = this.ConfigService.getRunId();

            let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);
            if (toUserInfo) {
                // set the period id
                this.periodId = toUserInfo.periodId;
            }

            // get the workgroup user names
            let userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(this.toWorkgroupId);
            this.userNames = userNamesArray.map( (obj) => {
                return obj.name;
            }).join(', ');
        };

        this.$onChanges = (changes) => {

            if (changes.maxScore) {
                this.maxScore = typeof changes.maxScore.currentValue === 'number' ? changes.maxScore.currentValue : 0;
            }

            let latest = null;

            if (this.active) {
                // get all the componentStates for this workgroup
                this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(this.toWorkgroupId, this.componentId);
                let total = this.componentStates.length;

                if (total > 0) {
                    latest = this.componentStates[total-1];
                }
            } else if (this.componentState){
                // we're only showing info for a single component state
                latest = this.componentState;
                this.componentStates = [];
                this.componentStates.push(latest);
            }

            if (latest) {
                // calculate the save time of the latest component state
                let serverSaveTime = latest.serverSaveTime;
                this.latestComponentStateTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // check if the latest component state is a submit
                this.latestComponentStateIsSubmit = latest.isSubmit;
            }
        };
    }

    showRevisions($event) {
        let workgroupId = this.toWorkgroupId;
        let componentId = this.componentId;
        let maxScore  = this.maxScore;
        let userNames = this.userNames;

        this.$mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            fullscreen: true,
            template:
                `<md-dialog aria-label="{{ 'revisionsForTeam' | translate:{teamNames: userNames} }}" class="dialog--wider">
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2 class="overflow--ellipsis">{{ 'revisionsForTeam' | translate:{teamNames: userNames} }}</h2>
                        </div>
                    </md-toolbar>
                    <md-dialog-content>
                        <div class="md-dialog-content gray-lighter-bg">
                            <workgroup-component-revisions workgroup-id="{{ workgroupId }}" component-id="{{ componentId }}" max-score="maxScore"></workgroup-component-revisions>
                        </div>
                    </md-dialog-content>
                    <md-dialog-actions layout="row" layout-align="end center">
                        <md-button class="md-primary" ng-click="close()" aria-label="{{ 'close' | translate }}">{{ 'close' | translate }}</md-button>
                    </md-dialog-actions>
                </md-dialog>`,
            locals: {
                workgroupId: workgroupId,
                componentId: componentId,
                maxScore: maxScore,
                userNames: userNames
            },
            controller: RevisionsController
        });
        function RevisionsController($scope, $mdDialog, workgroupId, componentId, maxScore, userNames) {
            $scope.workgroupId = workgroupId;
            $scope.componentId = componentId;
            $scope.maxScore = maxScore;
            $scope.userNames = userNames;
            $scope.close = () => {
                $mdDialog.hide();
            };
        }
        RevisionsController.$inject = ["$scope", "$mdDialog", "workgroupId", "componentId", "maxScore", "userNames"];
    }
}

ComponentRevisionsInfoController.$inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    'ConfigService',
    'TeacherDataService'
];

const ComponentRevisionsInfo = {
    bindings: {
        active: '<',
        componentId: '<',
        componentState: '<',
        nodeId: '<',
        maxScore: '<',
        toWorkgroupId: '<'
    },
    template:
        `<div class="component__actions__info component--grading__actions__info md-caption">
            <span ng-if="$ctrl.componentStates.length > 0">
                <span ng-if="$ctrl.latestComponentStateIsSubmit">{{ 'SUBMITTED' | translate }} </span>
                <span ng-if="!$ctrl.latestComponentStateIsSubmit">{{ 'SAVED' | translate }} </span>
                <span ng-if="$ctrl.active">
                    <span class="component__actions__more" am-time-ago="$ctrl.latestComponentStateTime"></span>
                    <md-tooltip md-direction="top">{{ $ctrl.latestComponentStateTime | amDateFormat:'ddd MMM D YYYY, h:mm a' }}</md-tooltip>
                </span>
                <span ng-if="!$ctrl.active">{{ $ctrl.latestComponentStateTime | amDateFormat:'ddd MMM D YYYY, h:mm a' }}</span>
            </span>
            <span ng-if="$ctrl.componentStates.length === 0">{{ 'TEAM_HAS_NOT_SAVED_ANY_WORK' | translate }}</span>
            <span ng-if="$ctrl.active && $ctrl.componentStates.length > 0">
                &#8226;&nbsp;<a ng-click="$ctrl.showRevisions($event)" translate="SEE_REVISIONS" translate-value-number="{{($ctrl.componentStates.length - 1)}}"></a>
           </span>
    </div>`,
    controller: ComponentRevisionsInfoController
};

export default ComponentRevisionsInfo;
