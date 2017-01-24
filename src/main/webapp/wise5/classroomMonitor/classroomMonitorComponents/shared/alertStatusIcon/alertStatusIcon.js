"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var AlertStatusIcon = {
    bindings: {
        hasAlert: '<',
        hasNewAlert: '<',
        message: '@',
        onClick: '&'
    },
    template: '<md-icon ng-if="$ctrl.hasAlert"\n                  class="status-icon text-disabled"\n                  ng-class="{\'warn\': $ctrl.hasNewAlert}"\n                  ng-click="$ctrl.onClick()">\n            error\n            <md-tooltip md-direction="top" ng-if=\'$ctrl.message\'>{{$ctrl.message}}</md-tooltip>\n        </md-icon>'
};

exports.default = AlertStatusIcon;
//# sourceMappingURL=alertStatusIcon.js.map