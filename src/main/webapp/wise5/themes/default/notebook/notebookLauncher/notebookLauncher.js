'use strict';

class NotebookLauncherController {
  constructor($filter, $timeout) {
    this.$filter = $filter;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
  }

  $onInit() {
    this.translationData = {
      noteLabel: this.config.itemTypes.note.label.singular
    }
  }

  fabAction($event) {
    if (this.notesVisible) {
      this.open($event, 'new');
    } else {
      this.open($event, 'note');
    }
  }

  open($event, target) {
    $event.stopPropagation();
    this.onOpen({value: target, event: $event});
    this.isOpen = false;
  }

  fabLabel() {
    if (this.notesVisible) {
      return this.$translate('addNote',
          { noteLabel: this.config.itemTypes.note.label.singular });
    } else {
      return this.config.label;
    }
  }

  isShowButton() {
    return !this.notesVisible || this.config.itemTypes.note.enableAddNote;
  }
}

NotebookLauncherController.$inject = [
  '$filter',
  '$timeout'
];

const NotebookLauncher = {
  bindings: {
    config: '<',
    noteCount: '<',
    notesVisible: '<',
    onOpen: '&'
  },
  template:
    `<md-button ng-if="$ctrl.isShowButton()"
                    class="md-scale md-fab md-fab-bottom-right notebook-launcher"
                    aria-label="{{ ::$ctrl.fabLabel() }}"
                    ng-click="$ctrl.fabAction($event)">
            <md-icon ng-if="!$ctrl.notesVisible">{{ ::$ctrl.config.icon }}</md-icon>
            <md-icon ng-if="$ctrl.notesVisible">add</md-icon>
            <md-tooltip md-direction="top">
                {{ ::$ctrl.fabLabel() }}
            </md-tooltip>
        </md-button>`,
  controller: NotebookLauncherController
};

export default NotebookLauncher;
