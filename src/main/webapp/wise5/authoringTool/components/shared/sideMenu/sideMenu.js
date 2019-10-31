"use strict";

class SideMenuController {
  constructor() {
  }

  toggleMenu() {
    this.onMenuToggle();
  }
}

SideMenuController.inject= [];

const SideMenu = {
  bindings: {
    state: '<',
    views: '<',
    onMenuToggle: '&'
  },
  controller: SideMenuController,
  template:
    `<div class="menu-sidebar">
      <md-button ng-repeat="(key, value) in $ctrl.views"
             id="{{ ::value.id }}"
             ng-if="value.type === 'primary' && value.active"
             aria-label="{{ ::value.label }}"
             ui-sref="{{ ::key }}"
             class="md-icon-button menu-sidebar__link">
        <md-icon ng-class="{'primary': $ctrl.state.$current.name === key}"> {{ ::value.icon }} </md-icon>
        <md-tooltip md-direction="right">{{ ::value.name }}</md-tooltip>
      </md-button>
      <md-divider></md-divider>
      <md-button aria-label="{{ ::'authoringToolMenu' | translate }}"
             ng-click="$ctrl.toggleMenu()"
             class="md-icon-button menu-sidebar__link">
        <md-icon ng-class="{'primary': $ctrl.views[$ctrl.state.$current.name].type !== 'primary'}"> more_horiz </md-icon>
      </md-button>
    </div>`
};

export default SideMenu;
