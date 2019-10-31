'use strict';

import EditNotebookItemController from '../editNotebookItemController';

class NotebookController {
  constructor($filter,
              $mdDialog,
              $scope,
              $rootScope,
              ConfigService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService) {
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.$translate = this.$filter('translate');
    this.themePath = this.ProjectService.getThemePath();
    this.itemId = null;
    this.item = null;
    if (this.workgroupId == null) {
      this.workgroupId = this.ConfigService.getWorkgroupId();
    }

    if (this.isStudentNotebook()) {
      this.config = this.NotebookService.getStudentNotebookConfig();
    } else {
      this.config = this.NotebookService.getTeacherNotebookConfig();
    }

    if (!this.config.enabled) {
      return;
    }

    this.reportVisible = this.config.itemTypes.report.enabled;
    this.notesVisible = false;
    this.insertMode = false;
    this.insertContent = null;
    this.requester = null;

    this.$scope.$on('notebookUpdated', (event, args) => {
      this.notebook = angular.copy(args.notebook);
    });

    this.$scope.$on('openNotebook', (event, args) => {
      this.open('note', event);
      this.setInsertMode(args.insertMode, args.requester);
    });

    this.$scope.$on('closeNotebook', (event, args) => {
      this.closeNotes(event);
    });

    this.$scope.$on('editNote', (event, args) => {
      const note = args.note;
      const isEditMode = true;
      const file = null;
      const noteText = null;
      const isEditTextEnabled = true;
      const isFileUploadEnabled = true;
      const studentWorkIds = null;
      const ev = args.ev;
      this.showEditNoteDialog(note, isEditMode, file, noteText, isEditTextEnabled, isFileUploadEnabled, studentWorkIds, ev);
    });

    this.$scope.$on('addNote', (event, args) => {
      const note = null;
      const isEditMode = true;
      const file = args.file;
      const noteText = args.text;
      const isEditTextEnabled = args.isEditTextEnabled;
      const isFileUploadEnabled = args.isFileUploadEnabled;
      const studentWorkIds = args.studentWorkIds;
      const ev = args.ev;
      this.showEditNoteDialog(note, isEditMode, file, noteText, isEditTextEnabled, isFileUploadEnabled, studentWorkIds, ev);
    });

    this.$scope.$on('copyNote', (event, args) => {
      const itemId = args.itemId;
      const ev = args.ev;
      this.showCopyNoteConfirmDialog(itemId, ev);
    });

    this.logOutListener = $scope.$on('logOut', (event, args) => {
      this.logOutListener();
      this.$rootScope.$broadcast('componentDoneUnloading');
    });

    this.notebook = this.NotebookService.getNotebookByWorkgroup(this.workgroupId);
    this.publicNotebookItems = this.NotebookService.publicNotebookItemspublicNotebookItems;

    // assume only 1 report for now
    this.reportId = this.config.itemTypes.report.notes[0].reportId;
  }

  isStudentNotebook() {
    return this.ConfigService.getMode() === 'studentRun' ||
        this.ConfigService.getMode() === 'preview' ||
        ((this.ConfigService.isRunOwner() || this.ConfigService.isRunSharedTeacher()) &&
          this.ConfigService.getWorkgroupId() !== this.workgroupId);
  }

  deleteStudentAsset(studentAsset) {
    alert(this.$translate('deleteStudentAssetFromNotebookNotImplementedYet'));
  }

  showEditNoteDialog(note, isEditMode, file, text, isEditTextEnabled, isFileUploadEnabled, studentWorkIds, ev) {
    const notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';
    this.$mdDialog.show({
      parent: angular.element(document.body),
      targetEvent: ev,
      templateUrl: notebookItemTemplate,
      controller: EditNotebookItemController,
      controllerAs: 'editNotebookItemController',
      bindToController: true,
      locals: {
        note: note,
        isEditMode: isEditMode,
        file: file,
        text: text,
        studentWorkIds: studentWorkIds,
        isEditTextEnabled: isEditTextEnabled,
        isFileUploadEnabled: isFileUploadEnabled
      }
    });
  }

  notebookItemSelected($event, notebookItem) {
    this.selectedNotebookItem = notebookItem;
  }

  attachNotebookItemToComponent($event, notebookItem) {
    this.componentController.attachNotebookItemToComponent(notebookItem);
    this.selectedNotebookItem = null;  // reset selected notebook item
    // TODO: add some kind of unobtrusive confirmation to let student know that the notebook item has been added to current component
    $event.stopPropagation();  // prevents parent notebook list item from getting the onclick event so this item won't be re-selected.
  }

  getNotes() {
    const notes = [];
    const notebookItems = this.notebook.items;
    for (let notebookItemKey in notebookItems) {
      const notebookItem = notebookItems[notebookItemKey];
      if (notebookItem.last().type === 'note') {
        notes.push(notebookItem);
      }
    }
    return notes;
  }

  open(value, event) {
    if (value === 'report') {
      this.reportVisible = !this.reportVisible;
    } else if (value === 'note') {
      if (this.notesVisible) {
        this.closeNotes(event);
      } else {
        this.NotebookService.retrievePublicNotebookItems('public').then(() => {
          this.notesVisible = true;
        });
      }
    } else if (value === 'new') {
      this.NotebookService.addNote(event);
    }
  }

  closeNotes($event) {
    this.notesVisible = false;
    this.insertMode = false;
  }

  setInsertMode(value, requester) {
    this.insertMode = value;
    if (value) {
      this.NotebookService.retrievePublicNotebookItems('public').then(() => {
        this.notesVisible = true;
      });
    }
    this.requester = requester;
  }

  insert(notebookItem, $event) {
    if (this.requester === 'report') {
      this.insertContent = angular.copy(notebookItem);
    } else {
      this.$rootScope.$broadcast('notebookItemChosen', { requester: this.requester, notebookItem: notebookItem });
    }
  }
}

NotebookController.$inject = [
  '$filter',
  '$mdDialog',
  '$scope',
  '$rootScope',
  'ConfigService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService'
];

const Notebook = {
  bindings: {
    filter: '@',
    mode: '@',
    workgroupId: '='
  },
  template:
    `<div ng-if="::$ctrl.config.enabled" ng-class="{'notes-visible': $ctrl.notesVisible}">
      <div class="notebook-overlay"></div>
      <notebook-launcher ng-if="::$ctrl.config.itemTypes.note.enabled"
                 config="$ctrl.config"
                 note-count="$ctrl.notebook.items.length"
                 notes-visible="$ctrl.notesVisible"
                 on-open="$ctrl.open(value, event)"></notebook-launcher>
      <notebook-report ng-if="::$ctrl.config.itemTypes.report.enabled"
               mode="{{$ctrl.mode}}"
               insert-content="$ctrl.insertContent"
               insert-mode="$ctrl.insertMode"
               config="$ctrl.config"
               reportId="::$ctrl.reportId"
               visible="$ctrl.reportVisible"
               workgroup-id="::$ctrl.workgroupId"
               on-collapse="$ctrl.insertMode=false"
               on-set-insert-mode="$ctrl.setInsertMode(value, requester)"></notebook-report>               
    </div>
    <notebook-notes ng-if="::$ctrl.config.enabled"
            notebook="$ctrl.notebook"
            notes-visible="$ctrl.notesVisible"
            config="$ctrl.config"
            insert-mode="$ctrl.insertMode"
            workgroup-id="$ctrl.workgroupId"
            on-close="$ctrl.closeNotes()"
            on-insert="$ctrl.insert(note, event)"
            on-set-insert-mode="$ctrl.setInsertMode(value, requester)"></notebook-notes>
    `,
  controller: NotebookController
};

export default Notebook;
