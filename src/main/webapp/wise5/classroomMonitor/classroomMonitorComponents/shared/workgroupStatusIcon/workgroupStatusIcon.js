"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupStatusIcon = {
    bindings: {
        alertStatus: '<',
        message: '<',
        onClick: '&'
    },
    template: '<md-icon ng-if="$ctrl.alertStatus"\n                  class="nav-item__status-icon text-disabled"\n                  ng-class="{\'warn\': $ctrl.alertStatus === \'new\', \'nav-item__status-icon--action\': ($ctrl.message || $ctrl.onClick)}"\n                  ng-click="$ctrl.onClick()">\n            error\n            <md-tooltip md-direction="top" ng-if=\'$ctrl.message\'>{{$ctrl.message}}</md-tooltip>\n        </md-icon>'
};

exports.default = WorkgroupStatusIcon;
//# sourceMappingURL=workgroupStatusIcon.js.map