"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ToolbarController = function () {
  function ToolbarController() {
    _classCallCheck(this, ToolbarController);
  }

  _createClass(ToolbarController, [{
    key: 'toggleMenu',
    value: function toggleMenu() {
      this.onMenuToggle();
    }
  }]);

  return ToolbarController;
}();

ToolbarController.inject = [];

var Toolbar = {
  bindings: {
    numberProject: '<',
    showStepTools: '<',
    viewName: '<',
    onMenuToggle: '&'
  },
  controller: ToolbarController,
  template: '<md-toolbar class="md-whiteframe-z1 toolbar md-toolbar--wise" md-theme="light">\n      <div class="md-toolbar-tools toolbar__tools">\n        <md-button aria-label="{{ \'authoringToolMenu\' | translate}}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">\n          <md-icon> menu </md-icon>\n        </md-button>\n        <span class="toolbar__title" ng-if="!$ctrl.showStepTools">{{ $ctrl.viewName }}</span>\n        <step-tools ng-if="$ctrl.showStepTools" show-position="$ctrl.numberProject"></step-tools>\n      </div>\n    </md-toolbar>'
};

exports.default = Toolbar;
//# sourceMappingURL=toolbar.js.map
