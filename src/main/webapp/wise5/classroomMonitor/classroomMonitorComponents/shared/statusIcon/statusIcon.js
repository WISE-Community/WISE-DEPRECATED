"use strict";

class StatusIconController {
    constructor() {}

    click() {
        this.onClick();
    }
}

const StatusIcon = {
    bindings: {
        iconName: '<',
        iconClass: '<',
        iconLabel: '<',
        iconTooltip: '<',
        onClick: '&'
    },
    controller: StatusIconController,
    template:
        `<md-button class="md-icon-button status-icon"
                    ng-click="$ctrl.click()"
                    aria-label="{{ $ctrl.iconLabel }}">
            <md-icon ng-class="[$ctrl.iconClass]">
                {{ $ctrl.iconName }}
            </md-icon>
            <md-tooltip md-direction="top" ng-if="$ctrl.iconTooltip">{{ $ctrl.iconTooltip }}</md-tooltip>
        </md-button>`
};

export default StatusIcon;
