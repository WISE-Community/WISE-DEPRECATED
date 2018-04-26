"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookLauncherController = function () {
  function NotebookLauncherController($filter, $timeout) {
    _classCallCheck(this, NotebookLauncherController);

    this.$filter = $filter;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.translationData = {
      noteLabel: this.config.itemTypes.note.label.singular
    };
  }

  _createClass(NotebookLauncherController, [{
    key: 'fabAction',
    value: function fabAction($event) {
      if (this.notesVisible) {
        this.open($event, 'new');
      } else {
        this.open($event, 'note');
      }
    }
  }, {
    key: 'open',
    value: function open($event, target) {
      $event.stopPropagation();
      this.onOpen({ value: target, event: $event });
      this.isOpen = false;
    }
  }, {
    key: 'fabLabel',
    value: function fabLabel() {
      if (this.notesVisible) {
        return this.$translate('addNote', { noteLabel: this.config.itemTypes.note.label.singular });
      } else {
        return this.config.label;
      }
    }
  }]);

  return NotebookLauncherController;
}();

NotebookLauncherController.$inject = ['$filter', '$timeout'];

var NotebookLauncher = {
  bindings: {
    config: '<',
    noteCount: '<',
    notesVisible: '<',
    onOpen: '&'
  },
  template: '<md-button class="md-scale md-fab md-fab-bottom-right notebook-launcher"\n                    aria-label="{{ $ctrl.fabLabel() }}"\n                    ng-click="$ctrl.fabAction($event)">\n            <md-icon ng-if="!$ctrl.notesVisible">{{ $ctrl.config.icon }}</md-icon>\n            <md-icon ng-if="$ctrl.notesVisible">add</md-icon>\n            <md-tooltip md-direction="top">\n                {{ $ctrl.fabLabel() }}\n            </md-tooltip>\n        </md-button>',
  controller: NotebookLauncherController
};

exports.default = NotebookLauncher;
//# sourceMappingURL=notebookLauncher.js.map
