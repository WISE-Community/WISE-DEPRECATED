"use strict";

const TopBar = {
    bindings: {
        logoPath: '@',
        projectId: '<',
        projectTitle: '<',
        runId: '<'
    },
    template:
        `<md-toolbar class="l-header">
            <div class="md-toolbar-tools">
                <span class="md-button logo-link">
                    <img ng-src="{{ $ctrl.logoPath }}" alt="{{ 'WISE_LOGO' | translate }}" class="logo" />
                </span>
                <h3>
                    <span ng-if="$ctrl.projectTitle">{{ $ctrl.projectTitle }}</span>
                    <span ng-if="!$ctrl.projectTitle">{{ 'authoringTool' | translate }}</span>
                    <span class="md-caption" ng-if="$ctrl.projectId">
                        ({{ 'PROJECT_ID_DISPLAY' | translate:{id: $ctrl.projectId} }}<span class="md-caption" ng-if="$ctrl.runId"> | {{ 'RUN_ID_DISPLAY' | translate:{id: $ctrl.runId} }}</span>)
                    </span>
                </h3>
                <span flex></span>
                <md-menu id='accountMenu' md-position-mode="target-right target" md-offset="8 26">
                    <md-button aria-label="{{ 'USER_MENU' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">
                        <md-icon md-menu-origin> account_box </md-icon>
                    </md-button>
                    <md-menu-content width="5" class="account-menu">
                        <account-menu></account-menu>
                    </md-menu-content>
                </md-menu>
            </div>
        </md-toolbar>`
};

export default TopBar;
