'use strict';

import { Directive } from '@angular/core';
import { NotificationService } from '../../../../services/notificationService';

@Directive()
class ToolbarController {
  globalMessage: string;
  isJSONValid: boolean = null;
  onMenuToggle: any;
  NotificationService: NotificationService;
  setGlobalMessageSubscription: any;
  setIsJSONValidSubscription: any;

  static $inject = ['$scope', 'NotificationService'];

  constructor(private $scope, NotificationService: NotificationService) {
    this.NotificationService = NotificationService;
    this.setGlobalMessageSubscription = this.NotificationService.setGlobalMessage$.subscribe(
      ({ globalMessage }) => {
        this.globalMessage = globalMessage;
      }
    );
    this.setIsJSONValidSubscription = this.NotificationService.setIsJSONValid$.subscribe(
      ({ isJSONValid }) => {
        this.isJSONValid = isJSONValid;
      }
    );
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.setGlobalMessageSubscription.unsubscribe();
    this.setIsJSONValidSubscription.unsubscribe();
  }

  toggleMenu() {
    this.onMenuToggle();
  }
}

const Toolbar = {
  bindings: {
    numberProject: '<',
    showStepTools: '<',
    viewName: '<',
    onMenuToggle: '&'
  },
  controller: ToolbarController,
  template: `<md-toolbar class="md-whiteframe-z1 toolbar md-toolbar--wise" md-theme="light">
      <div class="md-toolbar-tools toolbar__tools">
        <md-button aria-label="{{ ::'authoringToolMenu' | translate}}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">
          <md-icon> menu </md-icon>
        </md-button>
        <span class="toolbar__title" ng-if="!$ctrl.showStepTools">{{ $ctrl.viewName }}</span>
        <at-step-tools ng-if="$ctrl.showStepTools" show-position="$ctrl.numberProject"></at-step-tools>
        <div flex></div>
        <span ng-if="$ctrl.isJSONValid === true" style="color: green; font-size: 16px"><md-icon style="color:green; margin-top: -4px;">done</md-icon><span>{{ ::'jsonValid' | translate }}</span></span>
        <span ng-if="$ctrl.isJSONValid === false" style="color: red; font-size: 16px"><md-icon style="color:red; margin-top: -4px;">clear</md-icon><span>{{ ::'jsonInvalid' | translate }}</span></span>
        <div style="width: 40px; height: 40px;">
          <md-progress-circular ng-if="$ctrl.globalMessage.isProgressIndicatorVisible"
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
