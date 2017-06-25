"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var NodeCompletionIcon = {
    bindings: {
        nodeStatus: '<'
    },
    template: "<md-icon ng-if=\"$ctrl.nodeStatus.isCompleted\"\n                  ng-class=\"[$ctrl.customClass, {'success': $ctrl.nodeStatus.isSuccess}]\"\n                  aria-label=\"{{'completed' | translate}}\">\n                  {{'check_circle'}}\n        </md-icon>\n        <md-icon ng-if=\"!$ctrl.nodeStatus.isCompleted\"></md-icon>"
};

exports.default = NodeCompletionIcon;
//# sourceMappingURL=nodeCompletionIcon.js.map