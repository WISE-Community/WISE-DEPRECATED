"use strict";
// TODO: aria-label

const AlertStatusIcon = {
    bindings: {
        hasNewAlert: '<',
        message: '@',
        onClick: '&'
    },
    template:
        `<div class="md-avatar avatar avatar--icon avatar--icon--alert"
              ng-click="$ctrl.onClick()"
              aria-label="$ctrl.message">
            <md-icon class="node-icon avatar--icon--alert__icon"
                     ng-class="{'warn': $ctrl.hasNewAlert, 'text-disabled': !$ctrl.hasNewAlert}">
                error
            </md-icon>
            <md-tooltip md-direction="top" ng-if='$ctrl.message'>{{$ctrl.message}}</md-tooltip>
        </div>`
};

export default AlertStatusIcon;
