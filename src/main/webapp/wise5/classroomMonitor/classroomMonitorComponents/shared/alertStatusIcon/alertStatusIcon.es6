"use strict";

const AlertStatusIcon = {
    bindings: {
        hasAlert: '<',
        hasNewAlert: '<',
        message: '@',
        onClick: '&'
    },
    template:
        `<md-icon ng-if="$ctrl.hasAlert"
                  class="status-icon text-disabled"
                  ng-class="{'warn': $ctrl.hasNewAlert}"
                  ng-click="$ctrl.onClick()">
            error
            <md-tooltip md-direction="top" ng-if='$ctrl.message'>{{$ctrl.message}}</md-tooltip>
        </md-icon>`
};

export default AlertStatusIcon;
