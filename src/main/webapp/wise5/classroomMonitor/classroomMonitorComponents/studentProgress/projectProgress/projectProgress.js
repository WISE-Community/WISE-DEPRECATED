"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ProjectProgress = {
    bindings: {
        completion: '<'
    },
    template: "<span layout=\"row\" layout-align=\"start center\">\n            <span class=\"progress-wrapper\" tabindex=\"0\">\n                <md-progress-linear class=\"nav-item__progress\" md-mode=\"determinate\" value=\"{{$ctrl.completion}}\"></md-progress-linear>\n            </span>\n            <span class=\"nav-item__progress-value md-body-2 text-secondary\">{{$ctrl.completion}}%</span>\n        </span>"
};

exports.default = ProjectProgress;
//# sourceMappingURL=projectProgress.js.map