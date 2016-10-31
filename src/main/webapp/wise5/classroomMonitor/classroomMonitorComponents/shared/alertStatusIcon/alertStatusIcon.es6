"use strict";

const AlertStatusIcon = {
    bindings: {
        alertStatus: '<',
        message: '<',
        onClick: '&'
    },
    template:
        `<md-icon ng-if="$ctrl.alertStatus"
                  class="status-icon text-disabled"
                  ng-class="{'warn': $ctrl.alertStatus === 'new'}"
                  ng-click="$ctrl.onClick()">
            error
            <md-tooltip md-direction="top" ng-if='$ctrl.message'>{{$ctrl.message}}</md-tooltip>
        </md-icon>`
};

export default AlertStatusIcon;
