"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var AlertStatusCorner = {
    bindings: {
        alertStatus: '<',
        message: '<',
        onClick: '&'
    },
    template: '<div ng-if="$ctrl.alertStatus"\n              class="status-corner-wrapper status-corner-top-right">\n            <div class="status-corner"\n                 ng-click="$ctrl.onClick()"\n                 ng-class="{\'status-corner--warn\': $ctrl.alertStatus === \'new\'}">\n                <md-tooltip md-direction="top" ng-if=\'$ctrl.message\'>{{$ctrl.message}}</md-tooltip>\n            </div>\n        </div>'
};

exports.default = AlertStatusCorner;
//# sourceMappingURL=alertStatusCorner.js.map