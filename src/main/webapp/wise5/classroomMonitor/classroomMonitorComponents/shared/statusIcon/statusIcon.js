"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var StatusIcon = {
    bindings: {
        iconName: '<',
        iconClass: '<',
        iconLabel: '<',
        tooltip: '<',
        onClick: '&'
    },
    template: '<md-icon class="status-icon"\n                  ng-class="[$ctrl.iconClass]"\n                  title="{{ $ctrl.iconLabel }}"\n                  aria-label="{{ $ctrl.iconLabel }}"\n                  ng-click="$ctrl.onClick">\n            {{ $ctrl.iconName }}\n            <md-tooltip md-direction="top" ng-if=\'$ctrl.tooltip\'>{{$ctrl.tooltip}}</md-tooltip>\n        </md-icon>'
};

exports.default = StatusIcon;
//# sourceMappingURL=statusIcon.js.map