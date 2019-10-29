"use strict";

class AlertStatusConrerController {
    constructor() {}

    click() {
        this.onClick();
    }
}

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
                 ng-click="$ctrl.click()"
                 ng-class="{'status-corner--warn': $ctrl.hasNewAlert}">
                <md-tooltip md-direction="top" ng-if="$ctrl.message">{{ $ctrl.message }}</md-tooltip>
            </div>
        </div>`
};

export default AlertStatusCorner;
