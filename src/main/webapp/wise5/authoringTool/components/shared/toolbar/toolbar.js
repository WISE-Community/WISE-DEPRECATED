"use strict";

class ToolbarController {
  constructor($rootScope) {
    this.$rootScope = $rootScope;
    this.$rootScope.$on('setGlobalMessage', (event, params) => {
      if (params.globalMessage.time === null) {
        this.isProgressIndicatorVisible = true;
      } else {
        this.isProgressIndicatorVisible = false;
      }
      this.globalMessage = params.globalMessage;
    });
    this.$rootScope.$on('setIsJSONValid', (event, params) => {
      this.isJSONValid = params.isJSONValid;
    });
  }

  toggleMenu() {
    this.onMenuToggle();
  }
}

ToolbarController.$inject = [
  '$rootScope'
];

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
        <md-button aria-label="{{ ::'authoringToolMenu' | translate}}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">
          <md-icon> menu </md-icon>
        </md-button>
        <span class="toolbar__title" ng-if="!$ctrl.showStepTools">{{ $ctrl.viewName }}</span>
        <step-tools ng-if="$ctrl.showStepTools" show-position="$ctrl.numberProject"></step-tools>
        <div flex></div>
        <span ng-if="$ctrl.isJSONValid === true" style="color: green; font-size: 16px"><md-icon style="color:green; margin-top: -4px;">done</md-icon><span>{{ ::'jsonValid' | translate }}</span></span>
        <span ng-if="$ctrl.isJSONValid === false" style="color: red; font-size: 16px"><md-icon style="color:red; margin-top: -4px;">clear</md-icon><span>{{ ::'jsonInvalid' | translate }}</span></span>
        <div style="width: 40px; height: 40px;">
          <md-progress-circular ng-if="$ctrl.isProgressIndicatorVisible"
              md-mode="indeterminate"
              class="md-accent"
              style="margin: 8px;"
              md-diameter="24px">
          </md-progress-circular>
        </div>
        <span ng-if="$ctrl.globalMessage.text"
            class="component__actions__info md-caption global-message"
            style="margin-right: 20px;">
            {{$ctrl.globalMessage.text}}
            <span class="component__actions__more">
              <md-tooltip md-direction="bottom">
                {{ $ctrl.globalMessage.time | amDateFormat:'ddd, MMM D YYYY, h:mm a' }}
              </md-tooltip>
              <span am-time-ago="$ctrl.globalMessage.time"></span>
            </span>
        </span>
      </div>
    </md-toolbar>`
};

export default Toolbar;
