"use strict";

/*class WorkgroupInfoController {
    constructor() {
    };
}

WorkgroupInfoController.$inject = [
    
];*/

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupInfo = {
    bindings: {
        alertMsg: '@',
        hasAlert: '<',
        hasNewAlert: '<',
        usernames: '@'
    },
    template: '<div layout="row" layout-align="start center">\n            <div class="md-avatar" hide-xs>\n                <md-icon class="md-36" style="color: {{$ctrl.avatarColor}};"> account_circle </md-icon>\n            </div>\n            <div class="heavy">\n                {{$ctrl.usernames}}\n                <alert-status-icon message="{{$ctrl.alertMsg}}" has-alert="$ctrl.hasAlert" has-new-alert="$ctrl.hasNewAlert"></alert-status-icon>\n            </div>\n        </div>' //,
    //controller: WorkgroupInfoController
};

exports.default = WorkgroupInfo;
//# sourceMappingURL=workgroupInfo.js.map