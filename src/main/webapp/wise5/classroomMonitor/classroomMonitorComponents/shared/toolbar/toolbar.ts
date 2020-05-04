'use strict';

class ToolbarController {
  onMenuToggle: any;
  showTitle: boolean;
  showStepTools: boolean;
  showTeamTools: boolean;

  constructor() {}

  $onChanges() {
    this.showTitle = !this.showStepTools && !this.showTeamTools;
  }

  toggleMenu() {
    this.onMenuToggle();
  }
}

const Toolbar = {
  bindings: {
    numberProject: '<',
    showPeriodSelect: '<',
    showStepTools: '<',
    showTeamTools: '<',
    viewName: '<',
    workgroupId: '<',
    onMenuToggle: '&'
  },
  controller: ToolbarController,
  template: `<md-toolbar class="md-whiteframe-1dp toolbar md-toolbar--wise" md-theme="light">
            <div class="md-toolbar-tools toolbar__tools">
                <md-button aria-label="{{ ::'mainMenu' | translate }}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">
                    <md-icon> menu </md-icon>
                    <md-tooltip md-direction="bottom">{{ ::'mainMenu' | translate }}</md-tooltip>
                </md-button>
                <span class="toolbar__title" ng-if="$ctrl.showTitle">{{ $ctrl.viewName }}</span>
                <cm-step-tools ng-if="$ctrl.showStepTools" show-position="$ctrl.numberProject"></cm-step-tools>
                <student-grading-tools ng-if="$ctrl.showTeamTools" workgroup-id="$ctrl.workgroupId"></student-grading-tools>
                <span flex></span>
                <period-select ng-if="$ctrl.showPeriodSelect" custom-class="'md-no-underline md-button toolbar__select'"></period-select>
            </div>
        </md-toolbar>`
};

export default Toolbar;
