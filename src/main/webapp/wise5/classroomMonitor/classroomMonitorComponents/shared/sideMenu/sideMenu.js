"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SideMenuController = function () {
    function SideMenuController() {
        _classCallCheck(this, SideMenuController);
    }

    _createClass(SideMenuController, [{
        key: 'toggleMenu',
        value: function toggleMenu() {
            this.onMenuToggle();
        }
    }]);

    return SideMenuController;
}();

SideMenuController.inject = [];

var SideMenu = {
    bindings: {
        state: '<',
        views: '<',
        onMenuToggle: '&'
    },
    controller: SideMenuController,
    template: '<div class="menu-sidebar">\n            <md-button ng-repeat="(key, value) in $ctrl.views"\n                       ng-if="value.type === \'primary\' && value.active"\n                       aria-label="{{ value.name }}"\n                       ui-sref="{{ key }}"\n                       ng-click="value.action()"\n                       class="md-icon-button menu-sidebar__link">\n                <md-icon ng-class="{ \'primary\': key.startsWith($ctrl.state.$current.name) }"> {{ value.icon }} </md-icon>\n                <md-tooltip md-direction="right">{{ value.name }}</md-tooltip>\n            </md-button>\n        </div>'
};

exports.default = SideMenu;
//# sourceMappingURL=sideMenu.js.map
