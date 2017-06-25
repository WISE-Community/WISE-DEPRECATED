"use strict";

const StatusIcon = {
    bindings: {
        iconName: '<',
        iconClass: '<',
        iconLabel: '<',
        tooltip: '<',
        onClick: '&'
    },
    template:
        `<md-icon class="status-icon"
                  ng-class="[$ctrl.iconClass]"
                  title="{{ $ctrl.iconLabel }}"
                  aria-label="{{ $ctrl.iconLabel }}"
                  ng-click="$ctrl.onClick">
            {{ $ctrl.iconName }}
            <md-tooltip md-direction="top" ng-if='$ctrl.tooltip'>{{$ctrl.tooltip}}</md-tooltip>
        </md-icon>`
};

export default StatusIcon;
