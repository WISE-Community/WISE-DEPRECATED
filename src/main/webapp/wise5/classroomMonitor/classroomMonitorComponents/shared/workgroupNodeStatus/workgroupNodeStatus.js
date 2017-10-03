"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var WorkgroupNodeStatus = {
    bindings: {
        statusClass: '@',
        statusText: '@'
    },
    template: '<span class="md-body-2 block center {{$ctrl.statusClass}}" ng-class="{\'text-secondary\': !$ctrl.statusClass}">{{$ctrl.statusText}}</span>'
};

exports.default = WorkgroupNodeStatus;
//# sourceMappingURL=workgroupNodeStatus.js.map
