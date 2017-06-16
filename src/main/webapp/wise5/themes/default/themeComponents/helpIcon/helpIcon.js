"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HelpIconController = function () {
    function HelpIconController() {
        _classCallCheck(this, HelpIconController);
    }

    _createClass(HelpIconController, [{
        key: 'click',
        value: function click() {
            this.onClick();
        }
    }]);

    return HelpIconController;
}();

//HelpIconController.$inject = [];

var HelpIcon = {
    bindings: {
        color: '<',
        customClass: '<',
        icon: '<',
        iconClass: '<',
        pulse: '<',
        onClick: '&'
    },
    controller: HelpIconController,
    template: '<div class="help-icon {{ $ctrl.customClass }}" ng-class="{ \'pulse\': $ctrl.pulse} ">\n                <md-button aria-label="{{ $ctrl.label }}"\n                           ng-click="$ctrl.click()"\n                           class="md-whiteframe-1dp md-icon-button help-icon__button">\n                <md-icon style="color: {{ $ctrl.color }}" ng-class="[\'md-36\', \'help-icon__icon\', $ctrl.iconClass]"> {{ $ctrl.icon }} </md-icon>\n            </md-button>\n        </div>'
};

exports.default = HelpIcon;
//# sourceMappingURL=helpIcon.js.map