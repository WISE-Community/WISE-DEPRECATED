"use strict";
// TODO: aria-label

Object.defineProperty(exports, "__esModule", {
    value: true
});
var AlertStatusIcon = {
    bindings: {
        hasNewAlert: '<',
        message: '@',
        onClick: '&'
    },
    template: '<div class="md-avatar avatar avatar--icon avatar--icon--alert"\n              ng-click="$ctrl.onClick()"\n              aria-label="$ctrl.message">\n            <md-icon class="node-icon avatar--icon--alert__icon"\n                     ng-class="{\'warn\': $ctrl.hasNewAlert, \'text-disabled\': !$ctrl.hasNewAlert}">\n                error\n            </md-icon>\n            <md-tooltip md-direction="top" ng-if=\'$ctrl.message\'>{{$ctrl.message}}</md-tooltip>\n        </div>'
};

exports.default = AlertStatusIcon;
//# sourceMappingURL=alertStatusIcon.js.map