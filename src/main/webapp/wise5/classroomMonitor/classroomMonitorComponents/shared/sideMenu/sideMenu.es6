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
                       ng-if="value.type === 'primary' && value.active"
                       aria-label="{{ value.name }}"
                       ui-sref="{{ key }}"
                       ng-click="value.action()"
                       class="md-icon-button menu-sidebar__link">
                <md-icon ng-class="{'primary': $ctrl.state.$current.name === key}"> {{ value.icon }} </md-icon>
                <md-tooltip md-direction="right">{{ value.name }}</md-tooltip>
            </md-button>
        </div>`
};

export default SideMenu;
