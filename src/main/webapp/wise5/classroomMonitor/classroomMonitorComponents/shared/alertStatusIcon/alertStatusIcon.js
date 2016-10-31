"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var AlertStatusIcon = {
    bindings: {
        alertStatus: '<',
        message: '<',
        onClick: '&'
    },
    template: '<md-icon ng-if="$ctrl.alertStatus"\n                  class="status-icon text-disabled"\n                  ng-class="{\'warn\': $ctrl.alertStatus === \'new\'}"\n                  ng-click="$ctrl.onClick()">\n            error\n            <md-tooltip md-direction="top" ng-if=\'$ctrl.message\'>{{$ctrl.message}}</md-tooltip>\n        </md-icon>'
};

exports.default = AlertStatusIcon;
//# sourceMappingURL=alertStatusIcon.js.map