"use strict";

class WorkgroupInfoController {
    constructor(ConfigService) {
        this.ConfigService = ConfigService;

        this.$onInit = () => {
            this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
            this.alertIconClass = this.hasNewAlert ? 'warn' : 'text-disabled';
            this.alertIconName = 'error';
        }
    };
}

WorkgroupInfoController.$inject = [
    'ConfigService'
];

const WorkgroupInfo = {
    bindings: {
        alertMsg: '@',
        hasAlert: '<',
        hasNewAlert: '<',
        workgroupId: '<',
        usernames: '@'
    },
    template:
        `<div layout="row" layout-align="start center">
            <div class="md-avatar" hide-xs>
                <md-icon class="md-36" style="color: {{$ctrl.avatarColor}};"> account_circle </md-icon>
            </div>
            <div class="heavy">
                {{$ctrl.usernames}}
                <status-icon ng-if="$ctrl.hasAlert"
                             icon-label="$ctrl.alertMsg"
                             tooltip="$ctrl.alertMsg"
                             icon-name="$ctrl.alertIconName"
                             icon-class="$ctrl.alertIconClass"></status-icon>
                <span ng-if="$ctrl.hasNewWork" class="badge badge--info animate-fade">New</span>
            </div>
        </div>`,
    controller: WorkgroupInfoController
};

export default WorkgroupInfo;
