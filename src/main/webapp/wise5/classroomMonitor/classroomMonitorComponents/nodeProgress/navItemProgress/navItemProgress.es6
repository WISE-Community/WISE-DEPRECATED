"use strict";

const NavItemProgress = {
    bindings: {
        nodeCompletion: '<',
        periodName: '<'
    },
    template:
        `<span class="nav-item--list__info-item"s>
            <span layout="row" layout-align="start center">
                <span class="progress-wrapper" tabindex="0">
                    <md-progress-linear class="nav-item__progress" md-mode="determinate" value="{{$ctrl.nodeCompletion}}"></md-progress-linear>
                    <md-tooltip ng-switch on="$ctrl.periodName" md-direction="top">
                        <span ng-switch-when="All" translate="periodAllPercentCompleted" translate-value-percent="{{$ctrl.nodeCompletion}}" />
                        <span ng-switch-default translate="periodPercentCompleted" translate-values="{period: {{$ctrl.periodName}}, percent: {{$ctrl.nodeCompletion}}}" />
                    </md-tooltip>
                </span>
                <span class="nav-item__progress-value md-body-2 text-secondary">{{$ctrl.nodeCompletion}}%</span>
            </span>
        </span>`
};

export default NavItemProgress;
