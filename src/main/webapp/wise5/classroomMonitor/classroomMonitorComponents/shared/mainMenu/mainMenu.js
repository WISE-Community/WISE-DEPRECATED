"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var MainMenu = {
    bindings: {
        state: '<',
        views: '<'
    },
    template: '<md-content>\n            <md-toolbar class="md-toolbar--sidenav">\n                <div class="md-toolbar-tools" translate="classroomMonitor"></div>\n            </md-toolbar>\n            <md-divider></md-divider>\n            <md-list class="menu-sidenav">\n                <md-list-item ng-repeat="(key, value) in $ctrl.views"\n                              ng-if="value.type === \'primary\' && value.active"\n                              aria-label="{{ value.label }}"\n                              ui-sref="{{ key }}"\n                              ng-click="value.action()"\n                              ng-class="{\'active\': key.startsWith($ctrl.state.$current.name)}">\n                    <md-icon class="menu-sidenav__icon"> {{ value.icon }} </md-icon>\n                    <p class="menu-sidenav__item">{{ value.name }}</p>\n                </md-list-item>\n            </md-list>\n            <md-divider></md-divider>\n            <md-list class="menu-sidenav">\n                <md-list-item ng-repeat="(key, value) in $ctrl.views"\n                              ng-if="value.type === \'secondary\' && value.active"\n                              aria-label="{{ value.label }}"\n                              ui-sref="{{ key }}"\n                              ng-click="value.action()"\n                              ng-class="{\'active\': key.startsWith($ctrl.state.$current.name)}">\n                    <md-icon class="menu-sidenav__icon"> {{ value.icon }} </md-icon>\n                    <p class="menu-sidenav__item">{{ value.name }}</p>\n                </md-list-item>\n            </md-list>\n        </md-content>'
};

exports.default = MainMenu;
//# sourceMappingURL=mainMenu.js.map
