"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var NavItemProgress = {
    bindings: {
        nodeCompletion: '<',
        periodName: '<'
    },
    template: '<span class="nav-item--list__info-item"s>\n            <span layout="row" layout-align="start center">\n                <span class="progress-wrapper" tabindex="0">\n                    <md-progress-linear class="nav-item__progress" md-mode="determinate" value="{{$ctrl.nodeCompletion}}"></md-progress-linear>\n                    <md-tooltip ng-switch on="$ctrl.periodName" md-direction="top">\n                        <span ng-switch-when="All" translate="periodAllPercentCompleted" translate-value-percent="{{$ctrl.nodeCompletion}}" />\n                        <span ng-switch-default translate="periodPercentCompleted" translate-values="{period: {{$ctrl.periodName}}, percent: {{$ctrl.nodeCompletion}}}" />\n                    </md-tooltip>\n                </span>\n                <span class="nav-item__progress-value md-body-2 text-secondary">{{$ctrl.nodeCompletion}}%</span>\n            </span>\n        </span>'
};

exports.default = NavItemProgress;
//# sourceMappingURL=navItemProgress.js.map