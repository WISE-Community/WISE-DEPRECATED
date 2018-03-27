"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _editNotebookItemController = require('../editNotebookItemController');

var _editNotebookItemController2 = _interopRequireDefault(_editNotebookItemController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookController = function () {
  function NotebookController($filter, $mdDialog, $scope, $rootScope, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService) {
    var _this = this;

    _classCallCheck(this, NotebookController);

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
    this.config = this.NotebookService.config;

    if (!this.config.enabled) {
      return;
    }

    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.reportVisible = this.config.itemTypes.report.enabled;
    this.notesVisible = false;
    this.insertMode = false;
    this.insertContent = null;
    this.requester = null;

    this.$scope.$on('notebookUpdated', function (event, args) {
      _this.notebook = angular.copy(args.notebook);
    });

    this.$scope.$on('openNotebook', function (event, args) {
      _this.open('note', event);
      _this.setInsertMode(args.insertMode, args.requester);
    });

    this.$scope.$on('closeNotebook', function (event, args) {
      _this.closeNotes(event);
    });

    this.$scope.$on('editNote', function (event, args) {
      var itemId = args.itemId;
      var ev = args.ev;
      var studentWorkIds = null;
      var noteText = null;
      var isEditTextEnabled = true;
      var isFileUploadEnabled = true;
      _this.showEditNoteDialog(itemId, true, null, noteText, isEditTextEnabled, isFileUploadEnabled, studentWorkIds, ev);
    });

    this.$scope.$on('addNewNote', function (event, args) {
      var ev = args.ev;
      var file = args.file;
      var studentWorkIds = args.studentWorkIds;
      var noteText = args.text;
      var isEditTextEnabled = args.isEditTextEnabled;
      var isFileUploadEnabled = args.isFileUploadEnabled;
      _this.showEditNoteDialog(null, true, file, noteText, isEditTextEnabled, isFileUploadEnabled, studentWorkIds, ev);
    });

    this.$scope.$on('copyNote', function (event, args) {
      var itemId = args.itemId;
      var ev = args.ev;
      _this.showCopyNoteConfirmDialog(itemId, ev);
    });

    this.logOutListener = $scope.$on('logOut', function (event, args) {
      _this.logOutListener();
      _this.$rootScope.$broadcast('componentDoneUnloading');
    });

    this.notebook = this.NotebookService.getNotebookByWorkgroup(this.workgroupId);
    this.publicNotebookItems = this.NotebookService.publicNotebookItemspublicNotebookItems;

    // assume only 1 report for now
    this.reportId = this.config.itemTypes.report.notes[0].reportId;
  }

  _createClass(NotebookController, [{
    key: 'deleteStudentAsset',
    value: function deleteStudentAsset(studentAsset) {
      alert(this.$translate('deleteStudentAssetFromNotebookNotImplementedYet'));
    }
  }, {
    key: 'showEditNoteDialog',
    value: function showEditNoteDialog(itemId, isEditMode, file, text, isEditTextEnabled, isFileUploadEnabled, studentWorkIds, ev) {
      var notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';
      this.$mdDialog.show({
        parent: angular.element(document.body),
        targetEvent: ev,
        templateUrl: notebookItemTemplate,
        controller: _editNotebookItemController2.default,
        controllerAs: 'editNotebookItemController',
        bindToController: true,
        locals: {
          itemId: itemId,
          isEditMode: isEditMode,
          file: file,
          text: text,
          studentWorkIds: studentWorkIds,
          isEditTextEnabled: isEditTextEnabled,
          isFileUploadEnabled: isFileUploadEnabled
        }
      });
    }
  }, {
    key: 'notebookItemSelected',
    value: function notebookItemSelected($event, notebookItem) {
      this.selectedNotebookItem = notebookItem;
    }
  }, {
    key: 'attachNotebookItemToComponent',
    value: function attachNotebookItemToComponent($event, notebookItem) {
      this.componentController.attachNotebookItemToComponent(notebookItem);
      this.selectedNotebookItem = null; // reset selected notebook item
      // TODO: add some kind of unobtrusive confirmation to let student know that the notebook item has been added to current component
      $event.stopPropagation(); // prevents parent notebook list item from getting the onclick event so this item won't be re-selected.
    }
  }, {
    key: 'getNotes',
    value: function getNotes() {
      var notes = [];
      var notebookItems = this.notebook.items;
      for (var notebookItemKey in notebookItems) {
        var notebookItem = notebookItems[notebookItemKey];
        if (notebookItem.last().type === 'note') {
          notes.push(notebookItem);
        }
      }
      return notes;
    }
  }, {
    key: 'open',
    value: function open(value, event) {
      var _this2 = this;

      if (value === 'report') {
        this.reportVisible = !this.reportVisible;
      } else if (value === 'note') {
        if (this.notesVisible) {
          this.closeNotes(event);
        } else {
          this.NotebookService.retrievePublicNotebookItems("public").then(function () {
            _this2.notesVisible = true;
          });
        }
      } else if (value === 'new') {
        this.NotebookService.addNewItem(event);
      }
    }
  }, {
    key: 'closeNotes',
    value: function closeNotes($event) {
      this.notesVisible = false;
      this.insertMode = false;
    }
  }, {
    key: 'setInsertMode',
    value: function setInsertMode(value, requester) {
      var _this3 = this;

      this.insertMode = value;
      if (value) {
        this.NotebookService.retrievePublicNotebookItems("public").then(function () {
          _this3.notesVisible = true;
        });
      }
      this.requester = requester;
    }
  }, {
    key: 'insert',
    value: function insert(notebookItemId, $event) {
      var notebookItem = this.NotebookService.getNotebookItemById(notebookItemId, this.workgroupId);
      if (this.requester == 'report') {
        this.insertContent = angular.copy(notebookItem);
      } else {
        this.$rootScope.$broadcast('notebookItemChosen', { requester: this.requester, notebookItem: notebookItem });
      }
    }
  }]);

  return NotebookController;
}();

NotebookController.$inject = ['$filter', '$mdDialog', '$scope', '$rootScope', 'ConfigService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

var Notebook = {
  bindings: {},
  template: '<div ng-if="$ctrl.config.enabled" ng-class="{\'notes-visible\': $ctrl.notesVisible}">\n      <div class="notebook-overlay"></div>\n      <notebook-launcher config="$ctrl.config"\n                 note-count="$ctrl.notebook.items.length"\n                 notes-visible="$ctrl.notesVisible"\n                 on-open="$ctrl.open(value, event)"></notebook-launcher>\n      <notebook-report ng-if="$ctrl.config.itemTypes.report.enabled"\n               insert-content="$ctrl.insertContent"\n               insert-mode="$ctrl.insertMode"\n               config="$ctrl.config"\n               reportId="$ctrl.reportId"\n               visible="$ctrl.reportVisible"\n               workgroup-id="$ctrl.workgroupId"\n               on-collapse="$ctrl.insertMode=false"\n               on-set-insert-mode="$ctrl.setInsertMode(value, requester)"></notebook-report>\n    </div>\n    <notebook-notes ng-if="$ctrl.config.enabled"\n            notebook="$ctrl.notebook"\n            notes-visible="$ctrl.notesVisible"\n            config="$ctrl.config"\n            insert-mode="$ctrl.insertMode"\n            workgroup-id="$ctrl.workgroupId"\n            on-close="$ctrl.closeNotes()"\n            on-insert="$ctrl.insert(value, event)"\n            on-set-insert-mode="$ctrl.setInsertMode(value, requester)"></notebook-notes>',
  controller: NotebookController
};

exports.default = Notebook;
//# sourceMappingURL=notebook.js.map
