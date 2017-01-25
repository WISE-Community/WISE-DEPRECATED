"use strict";

class WorkgroupInfoController {
    constructor(ConfigService) {
        this.ConfigService = ConfigService;				
 	
        this.$onInit = () => {		
            this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
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
                <alert-status-icon message="{{$ctrl.alertMsg}}" has-alert="$ctrl.hasAlert" has-new-alert="$ctrl.hasNewAlert"></alert-status-icon>
            </div>
        </div>`,
    controller: WorkgroupInfoController
};

export default WorkgroupInfo;
