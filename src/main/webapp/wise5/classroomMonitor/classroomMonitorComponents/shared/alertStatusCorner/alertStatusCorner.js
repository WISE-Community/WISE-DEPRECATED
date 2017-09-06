"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AlertStatusConrerController = function () {
    function AlertStatusConrerController() {
        _classCallCheck(this, AlertStatusConrerController);
    }

    _createClass(AlertStatusConrerController, [{
        key: 'click',
        value: function click() {
            this.onClick();
        }
    }]);

    return AlertStatusConrerController;
}();

var AlertStatusCorner = {
    bindings: {
        hasNewAlert: '<',
        hasAlert: '<',
        message: '<',
        onClick: '&'
    },
    template: '<div ng-if="$ctrl.hasAlert"\n              class="status-corner-wrapper status-corner-top-right">\n            <div class="status-corner"\n                 ng-click="$ctrl.click()"\n                 ng-class="{\'status-corner--warn\': $ctrl.hasNewAlert}">\n                <md-tooltip md-direction="top" ng-if="$ctrl.message">{{ $ctrl.message }}</md-tooltip>\n            </div>\n        </div>'
};

exports.default = AlertStatusCorner;
//# sourceMappingURL=alertStatusCorner.js.map