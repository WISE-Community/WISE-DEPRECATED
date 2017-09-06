"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StatusIconController = function () {
    function StatusIconController() {
        _classCallCheck(this, StatusIconController);
    }

    _createClass(StatusIconController, [{
        key: 'click',
        value: function click() {
            this.onClick();
        }
    }]);

    return StatusIconController;
}();

var StatusIcon = {
    bindings: {
        iconName: '<',
        iconClass: '<',
        iconLabel: '<',
        iconTooltip: '<',
        onClick: '&'
    },
    controller: StatusIconController,
    template: '<md-button class="md-icon-button status-icon"\n                    ng-click="$ctrl.click()"\n                    aria-label="{{ $ctrl.iconLabel }}">\n            <md-icon ng-class="[$ctrl.iconClass]">\n                {{ $ctrl.iconName }}\n            </md-icon>\n            <md-tooltip md-direction="top" ng-if="$ctrl.iconTooltip">{{ $ctrl.iconTooltip }}</md-tooltip>\n        </md-button>'
};

exports.default = StatusIcon;
//# sourceMappingURL=statusIcon.js.map