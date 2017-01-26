"use strict";

const AlertStatusCorner = {
    bindings: {
        hasNewAlert: '<',
        hasAlert: '<',
        message: '<',
        onClick: '&'
    },
    template:
        `<div ng-if="$ctrl.hasAlert"
              class="status-corner-wrapper status-corner-top-right">
            <div class="status-corner"
                 ng-click="$ctrl.onClick()"
                 ng-class="{'status-corner--warn': $ctrl.hasNewAlert}">
                <md-tooltip md-direction="top" ng-if='$ctrl.message'>{{$ctrl.message}}</md-tooltip>
            </div>
        </div>`
};

export default AlertStatusCorner;
