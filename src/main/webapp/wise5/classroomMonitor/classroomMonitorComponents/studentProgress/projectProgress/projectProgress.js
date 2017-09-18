"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ProjectProgress = {
    bindings: {
        completed: '<',
        total: '<',
        percent: '<'
    },
    template: '<span layout="row" layout-align="start center">\n            <span class="progress-wrapper" tabindex="0">\n                <md-progress-linear class="nav-item__progress" md-mode="determinate" value="{{ $ctrl.percent }}"></md-progress-linear>\n                <md-tooltip md-direction="top">\n                    <span translate="completedStepsWithWork" translate-values="{ \'completed\': $ctrl.completed, \'total\': $ctrl.total }" />\n                </md-tooltip>\n            </span>\n            <span class="nav-item__progress-value md-body-2 text-secondary">{{ $ctrl.percent }}%</span>\n        </span>'
};

exports.default = ProjectProgress;
//# sourceMappingURL=projectProgress.js.map
