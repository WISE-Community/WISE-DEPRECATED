"use strict";

class WorkgroupInfoController {
    constructor(ConfigService,
                StudentStatusService) {
        this.ConfigService = ConfigService;
        this.StudentStatusService = StudentStatusService;

        this.$onInit = () => {
            this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
            this.userNames = [];
            if (this.canViewStudentNames) {
                this.userNames = this.ConfigService.getUserNamesByWorkgroupId(this.workgroupId);
            } else {
                this.userNames = 'WorkgroupId: ' + this.workgroupId;
            }
        };
    };
}

WorkgroupInfoController.$inject = [
    'ConfigService',
    'StudentStatusService'
];

const WorkgroupInfo = {
    bindings: {
        workgroupId: '<',
        canViewStudentNames: '<',
        alertStatus: '@',
        statusMsg: '@'
    },
    template:
        `<div layout="row" layout-align="start center">
            <div class="md-avatar" hide-xs>
                <md-icon class="md-36" style="color: {{$ctrl.avatarColor}};"> account_circle </md-icon>
            </div>
            <div ng-if='$ctrl.canViewStudentNames' layout="row" layout-align="start center" class="heavy">
                <div>
                    <span ng-repeat="userName in $ctrl.userNames">{{userName.name}}<span ng-if="!$last">,&nbsp;</span></span>
                    <md-tooltip md-direction="top" ng-if='$ctrl.canViewStudentNames'>{{ 'WORKGROUP_ID' | translate }}: {{$ctrl.workgroupId}}</md-tooltip>
                </div>
                <alert-status-icon message="$ctrl.statusMsg" alert-status="$ctrl.alertStatus"></alert-status-icon>
            </div>
            <div ng-if='!$ctrl.canViewStudentNames' class="heavy">
                {{$ctrl.userNames}}
                <alert-status-icon message="$ctrl.statusMsg" alert-status="$ctrl.alertStatus"></alert-status-icon>
            </div>
        </div>`,
    controller: WorkgroupInfoController
};

export default WorkgroupInfo;
