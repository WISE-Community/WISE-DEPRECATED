"use strict";

const WorkgroupStatusIcon = {
    bindings: {
        alertStatus: '<',
        message: '<',
        onClick: '&'
    },
    template:
        `<md-icon ng-if="$ctrl.alertStatus"
                  class="nav-item__status-icon text-disabled"
                  ng-class="{'warn': $ctrl.alertStatus === 'new', 'nav-item__status-icon--action': ($ctrl.message || $ctrl.onClick)}"
                  ng-click="$ctrl.onClick()">
            error
            <md-tooltip md-direction="top" ng-if='$ctrl.message'>{{$ctrl.message}}</md-tooltip>
        </md-icon>`
};

export default WorkgroupStatusIcon;
