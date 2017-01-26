"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupNodeStatus = {
    bindings: {
        statusClass: '@',
        statusText: '@'
    },
    template: '<span class="md-subhead block center heavy {{$ctrl.statusClass}}" ng-class="{\'text-secondary\': !$ctrl.statusClass}">{{$ctrl.statusText}}</span>'
};

exports.default = WorkgroupNodeStatus;
//# sourceMappingURL=workgroupNodeStatus.js.map