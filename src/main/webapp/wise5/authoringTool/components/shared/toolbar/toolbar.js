"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ToolbarController = function () {
  function ToolbarController($rootScope) {
    var _this = this;

    _classCallCheck(this, ToolbarController);

    this.$rootScope = $rootScope;
    this.$rootScope.$on('setGlobalMessage', function (event, params) {
      if (params.globalMessage.time === null) {
        _this.isProgressIndicatorVisible = true;
      } else {
        _this.isProgressIndicatorVisible = false;
      }
      _this.globalMessage = params.globalMessage;
    });
    this.$rootScope.$on('setIsJSONValid', function (event, params) {
      _this.isJSONValid = params.isJSONValid;
    });
  }

  _createClass(ToolbarController, [{
    key: 'toggleMenu',
    value: function toggleMenu() {
      this.onMenuToggle();
    }
  }]);

  return ToolbarController;
}();

ToolbarController.$inject = ['$rootScope'];

var Toolbar = {
  bindings: {
    numberProject: '<',
    showStepTools: '<',
    viewName: '<',
    onMenuToggle: '&'
  },
  controller: ToolbarController,
  template: '<md-toolbar class="md-whiteframe-z1 toolbar md-toolbar--wise" md-theme="light">\n      <div class="md-toolbar-tools toolbar__tools">\n        <md-button aria-label="{{ \'authoringToolMenu\' | translate}}" class="md-icon-button" ng-click="$ctrl.toggleMenu()">\n          <md-icon> menu </md-icon>\n        </md-button>\n        <span class="toolbar__title" ng-if="!$ctrl.showStepTools">{{ $ctrl.viewName }}</span>\n        <step-tools ng-if="$ctrl.showStepTools" show-position="$ctrl.numberProject"></step-tools>\n        <div flex></div>\n        <span ng-if="$ctrl.isJSONValid === true" style="color: green; font-size: 16px"><md-icon style="color:green; margin-top: -4px;">done</md-icon><span>{{ \'jsonValid\' | translate }}</span></span>\n        <span ng-if="$ctrl.isJSONValid === false" style="color: red; font-size: 16px"><md-icon style="color:red; margin-top: -4px;">clear</md-icon><span>{{ \'jsonInvalid\' | translate }}</span></span>\n        <div style="width: 40px; height: 40px;">\n          <md-progress-circular ng-if="$ctrl.isProgressIndicatorVisible"\n              md-mode="indeterminate"\n              class="md-accent"\n              style="margin: 8px;"\n              md-diameter="24px">\n          </md-progress-circular>\n        </div>\n        <span ng-if="$ctrl.globalMessage.text"\n            class="component__actions__info md-caption global-message"\n            style="margin-right: 20px;">\n            {{$ctrl.globalMessage.text}}\n            <span class="component__actions__more">\n              <md-tooltip md-direction="bottom">\n                {{ $ctrl.globalMessage.time | amDateFormat:\'ddd, MMM D YYYY, h:mm a\' }}\n              </md-tooltip>\n              <span am-time-ago="$ctrl.globalMessage.time"></span>\n            </span>\n        </span>\n      </div>\n    </md-toolbar>'
};

exports.default = Toolbar;
//# sourceMappingURL=toolbar.js.map
