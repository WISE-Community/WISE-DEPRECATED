"use strict";

class HelpIconController {
    constructor() {
    };

    click() {
        this.onClick();
    }
}

//HelpIconController.$inject = [];

const HelpIcon = {
    bindings: {
        color: '<',
        customClass: '<',
        icon: '<',
        iconClass: '<',
        pulse: '<',
        onClick: '&'
    },
    controller: HelpIconController,
    template:
        `<div class="help-icon {{ $ctrl.customClass }}" ng-class="{ 'pulse': $ctrl.pulse} ">
                <md-button aria-label="{{ $ctrl.label }}"
                           ng-click="$ctrl.click()"
                           class="md-whiteframe-1dp md-icon-button help-icon__button">
                <md-icon style="color: {{ $ctrl.color }}" ng-class="['md-36', 'help-icon__icon', $ctrl.iconClass]"> {{ $ctrl.icon }} </md-icon>
            </md-button>
        </div>`
};

export default HelpIcon;
