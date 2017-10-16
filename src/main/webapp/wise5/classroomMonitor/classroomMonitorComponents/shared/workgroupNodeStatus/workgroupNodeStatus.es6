"use strict";

const WorkgroupNodeStatus = {
    bindings: {
        statusClass: '@',
        statusText: '@'
    },
    template:
        `<span class="md-body-2 block center {{$ctrl.statusClass}}" ng-class="{'text-secondary': !$ctrl.statusClass}">{{$ctrl.statusText}}</span>`
};

export default WorkgroupNodeStatus;
