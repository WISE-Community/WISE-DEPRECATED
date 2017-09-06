"use strict";

const NavItemProgress = {
    bindings: {
        nodeCompletion: '<',
        periodName: '<',
        periodId: '<',
        workgroup: '<'
    },
    template:
        `<span layout="row" layout-align="start center">
            <span class="progress-wrapper" tabindex="0">
                <md-progress-linear class="nav-item__progress" md-mode="determinate" value="{{$ctrl.nodeCompletion}}"></md-progress-linear>
                <md-tooltip ng-if="!$ctrl.workgroup" ng-switch on="$ctrl.periodId" md-direction="top">
                    <span ng-switch-when="-1" translate="percentCompletedPeriodAll" translate-value-percent="{{$ctrl.nodeCompletion}}" />
                    <span ng-switch-default translate="percentCompletedPeriod" translate-values="{ period: {{$ctrl.periodName}}, percent: {{$ctrl.nodeCompletion}} }" />
                <md-tooltip ng-if="$ctrl.workgroup" md-direction="top">
                    <span translate="percentCompleted" translate-value-percent="{{$ctrl.nodeCompletion}}" />
                </md-tooltip>
            </span>
            <span class="nav-item__progress-value md-body-2 text-secondary" hide-xs>{{$ctrl.nodeCompletion}}%</span>
        </span>`
};

export default NavItemProgress;
