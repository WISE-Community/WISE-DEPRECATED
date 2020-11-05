'use strict';

const SideMenu = {
  bindings: {
    state: '<',
    views: '<'
  },
  template: `<div class="menu-sidebar">
      <md-button ng-repeat="(key, value) in $ctrl.views"
             id="{{ ::value.id }}"
             ng-if="value.type === 'primary' && value.active"
             aria-label="{{ ::value.label }}"
             ui-sref="{{ ::key }}"
             class="md-icon-button menu-sidebar__link">
        <md-icon ng-class="{'primary': $ctrl.state.$current.name === key}"> {{ ::value.icon }} </md-icon>
        <md-tooltip md-direction="right">{{ ::value.name }}</md-tooltip>
      </md-button>
    </div>`
};

export default SideMenu;
