"use strict";

const AlertStatusCorner = {
    bindings: {
        alertStatus: '<',
        message: '<',
        onClick: '&'
    },
    template:
        `<div ng-if="$ctrl.alertStatus"
              class="status-corner-wrapper status-corner-top-right">
            <div class="status-corner"
                 ng-click="$ctrl.onClick()"
                 ng-class="{'status-corner--warn': $ctrl.alertStatus === 'new'}">
                <md-tooltip md-direction="top" ng-if='$ctrl.message'>{{$ctrl.message}}</md-tooltip>
            </div>
        </div>`
};

export default AlertStatusCorner;
