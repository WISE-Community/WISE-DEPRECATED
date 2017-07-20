"use strict";

class ToolbarController {
    constructor() {
    }

    toggleMenu() {
        this.onMenuToggle();
    }
}

ToolbarController.inject= [];

const Toolbar = {
    bindings: {
        numberProject: '<',
        showStepTools: '<',
        viewName: '<',
        onMenuToggle: '&'
    },
    controller: ToolbarController,
    template:
        `<md-toolbar class="md-whiteframe-1dp layout-toolbar md-toolbar--wise" md-theme="light">
            <div class="md-toolbar-tools">
                <md-button aria-label="{{ 'mainMenu' | translate}}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">
                    <md-icon> menu </md-icon>
                    <md-tooltip md-direction="bottom">{{ 'mainMenu' | translate}}</md-tooltip>
                </md-button>
                <span class="toolbar-title" ng-if="!$ctrl.showStepTools">{{ $ctrl.viewName }}</span>
                <step-tools ng-if="$ctrl.showStepTools" class="layout-tools layout-tools--step" show-position="$ctrl.numberProject" layout-fill></step-tools>
            </div>
        </md-toolbar>`
};

export default Toolbar;
