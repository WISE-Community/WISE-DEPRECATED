"use strict";

const WorkgroupNodeStatus = {
    bindings: {
        statusClass: '@',
        statusText: '@'
    },
    template:
        `<span class="md-subhead heavy {{$ctrl.statusClass}}" ng-class="{'text-secondary': !$ctrl.statusClass}">{{$ctrl.statusText}}</span>`
};

export default WorkgroupNodeStatus;
