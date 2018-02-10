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
    `<md-toolbar class="md-whiteframe-z1 toolbar md-toolbar--wise" md-theme="light">
      <div class="md-toolbar-tools toolbar__tools">
        <md-button aria-label="{{ 'authoringToolMenu' | translate}}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">
          <md-icon> menu </md-icon>
        </md-button>
        <span class="toolbar__title" ng-if="!$ctrl.showStepTools">{{ $ctrl.viewName }}</span>
        <step-tools ng-if="$ctrl.showStepTools" show-position="$ctrl.numberProject"></step-tools>
      </div>
    </md-toolbar>`
};

export default Toolbar;
