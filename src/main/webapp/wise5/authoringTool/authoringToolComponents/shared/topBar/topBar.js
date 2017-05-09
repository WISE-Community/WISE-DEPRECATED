"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var TopBar = {
    bindings: {
        logoPath: '@',
        projectId: '<',
        projectTitle: '<',
        runId: '<'
    },
    template: '<md-toolbar class="l-header">\n            <div class="md-toolbar-tools">\n                <span class="md-button logo-link">\n                    <img ng-src="{{ $ctrl.logoPath }}" alt="{{ \'WISE_LOGO\' | translate }}" class="logo" />\n                </span>\n                <h3>\n                    <span ng-if="$ctrl.projectTitle">{{ $ctrl.projectTitle }}</span>\n                    <span ng-if="!$ctrl.projectTitle">{{ \'authoringTool\' | translate }}</span>\n                    <span class="md-caption" ng-if="$ctrl.projectId">\n                        ({{ \'PROJECT_ID_DISPLAY\' | translate:{id: $ctrl.projectId} }}<span class="md-caption" ng-if="$ctrl.runId"> | {{ \'RUN_ID_DISPLAY\' | translate:{id: $ctrl.runId} }}</span>)\n                    </span>\n                </h3>\n                <span flex></span>\n                <md-menu id=\'accountMenu\' md-position-mode="target-right target" md-offset="8 26">\n                    <md-button aria-label="{{ \'USER_MENU\' | translate }}" class="md-icon-button" ng-click="$mdMenu.open($event)">\n                        <md-icon md-menu-origin> account_box </md-icon>\n                    </md-button>\n                    <md-menu-content width="5" class="account-menu">\n                        <account-menu></account-menu>\n                    </md-menu-content>\n                </md-menu>\n            </div>\n        </md-toolbar>'
};

exports.default = TopBar;
//# sourceMappingURL=topBar.js.map