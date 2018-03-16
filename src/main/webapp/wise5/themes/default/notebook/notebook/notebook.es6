"use strict";

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
        this.config = this.NotebookService.config;

        if (!this.config.enabled) {
            return;
        }

        this.workgroupId = this.ConfigService.getWorkgroupId();
        //this.reportVisible = false;
        this.reportVisible = this.config.itemTypes.report.enabled;
        this.notesVisible = false;
        this.insertMode = false;
        this.insertContent = null;

        this.$scope.$on('notebookUpdated', (event, args) => {
            this.notebook = angular.copy(args.notebook);
        });

        // show edit note dialog on 'editNote' event
        this.$scope.$on('editNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            const studentWorkIds = null;
            this.editNote(itemId, true, null, studentWorkIds, ev);
        });

        // show edit note dialog on 'addNewNote' event
        this.$scope.$on('addNewNote', (event, args) => {
            let ev = args.ev;
            let file = args.file;
            const studentWorkIds = args.studentWorkIds;
            this.editNote(null, true, file, studentWorkIds, ev);
        });

        // show delete note confirm dialog on 'deleteNote' event
        this.$scope.$on('deleteNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            let doDelete = true;
            this.deleteNote(itemId, ev, doDelete);
        });

        // show revive note confirm dialog on 'reviveNote' event
        this.$scope.$on('reviveNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            let doDelete = false;
            this.deleteNote(itemId, ev, doDelete);
        });

        this.$scope.$on('copyNote', (event, args) => {
          let itemId = args.itemId;
          let ev = args.ev;
          this.showCopyNoteConfirmDialog(itemId, ev);
        });

        // show share note confirm dialog on 'shareNote' event
        this.$scope.$on('shareNote', (event, args) => {
          let itemId = args.itemId;
          let ev = args.ev;
          this.shareNote(itemId, ev);
        });

        this.$scope.$on('unshareNote', (event, args) => {
            let itemId = args.itemId;
            let ev = args.ev;
            this.showUnshareNoteConfirmDialog(itemId, ev);
        });

        this.logOutListener = $scope.$on('logOut', (event, args) => {
            this.logOutListener();
            this.$rootScope.$broadcast('componentDoneUnloading');
        });

        // get the notebook for this workgroup
        this.notebook = this.NotebookService.getNotebookByWorkgroup(this.workgroupId);

        this.publicNotebookItems = this.NotebookService.publicNotebookItemspublicNotebookItems;

        // assume only 1 report for now
        this.reportId = this.config.itemTypes.report.notes[0].reportId;
    }

    deleteStudentAsset(studentAsset) {
        alert(this.$translate('deleteStudentAssetFromNotebookNotImplementedYet'));
        /*
         StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
         // remove studentAsset
         this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
         this.calculateTotalUsage();
         }));
         */
    }

    editNote(itemId, isEditMode, file, studentWorkIds, ev) {
        let notebookItemTemplate = this.themePath + '/notebook/editNotebookItem.html';

        // Display a dialog where students can view/add/edit a notebook item
        this.$mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: ev,
            templateUrl: notebookItemTemplate,
            controller: EditNotebookItemController,
            controllerAs: 'editNotebookItemController',
            bindToController: true,
            locals: {
                itemId: itemId,
                isEditMode: isEditMode,
                file: file,
                studentWorkIds: studentWorkIds
            }
        });
    }

    /**
     * Delete the note specified by the itemId.
     */
    deleteNote(itemId, ev, doDelete = true) {
        let confirm = null;

        if (doDelete) {
            confirm = this.$mdDialog.confirm()
                .title(this.$translate('deleteNoteConfirmMessage'))
                .ariaLabel('delete note confirmation')
                .targetEvent(ev)
                .ok(this.$translate('delete'))
                .cancel(this.$translate('cancel'));
        } else {
            confirm = this.$mdDialog.confirm()
                .title(this.$translate('reviveNoteConfirmMessage'))
                .ariaLabel('revive note confirmation')
                .targetEvent(ev)
                .ok(this.$translate('revive'))
                .cancel(this.$translate('cancel'));
        }

        this.$mdDialog.show(confirm).then(() => {
            let noteCopy = angular.copy(this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(itemId));
            noteCopy.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
            noteCopy.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
            let clientDeleteTime = null;  // if delete timestamp is null, then we are in effect un-deleting this note item
            if (doDelete) {
                clientDeleteTime = Date.parse(new Date());  // set delete timestamp
            }
            this.NotebookService.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId,
                noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
        }, () => {
            // they chose not to delete. Do nothing, the dialog will close.
        });
    }

    showCopyNoteConfirmDialog(itemId, ev) {
      let confirm = this.$mdDialog.confirm()
        .title('copyNoteConfirmMessage')
        .ariaLabel('copy note confirmation')
        .ok(this.$translate('copy'))
        .cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(() => {
        this.NotebookService.copyNotebookItem(itemId);
      });
    }

    shareNote(itemId, ev) {
      let confirm = this.$mdDialog.confirm()
        .title('shareNoteConfirmMessage')
        .ariaLabel('share note confirmation')
        .ok(this.$translate('share'))
        .cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(() => {
        this.NotebookService.addNotebookItemToGroup(itemId, 'public');
      });
    }

    showUnshareNoteConfirmDialog(itemId, ev) {
        let confirm = this.$mdDialog.confirm()
            .title('unshareNoteConfirmMessage')
            .ariaLabel('unshare note confirmation')
            .ok(this.$translate('unshare'))
            .cancel(this.$translate('cancel'));
        this.$mdDialog.show(confirm).then(() => {
            this.NotebookService.removeNotebookItemFromGroup(itemId, 'public');
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
        let notes = [];
        let notebookItems = this.notebook.items;
        for (let notebookItemKey in notebookItems) {
            let notebookItem = notebookItems[notebookItemKey];
            if (notebookItem.last().type === 'note') {
                notes.push(notebookItem);
            }
        }
        return notes;
    }

    open(value, event) {
        if (value === 'report') {
            // toggle the report view
            this.reportVisible = !this.reportVisible;
        } else if (value === 'note') {
            // toggle the notes view
            if (this.notesVisible) {
                this.closeNotes(event);
            } else {
                this.NotebookService.retrievePublicNotebookItems("public").then(() => {
                    this.notesVisible = true;
                });
            }
        } else if (value === 'new') {
            // open the new note dialog
            this.NotebookService.addNewItem(event);
        }
    }

    closeNotes($event) {
        this.notesVisible = false;
        this.insertMode = false;
    }

    /*closeReport() {
        this.reportVisible = false;
    }*/

    setInsertMode(value) {
        this.insertMode = value;
        if (value) {
            this.notesVisible = true;
        }
    }

    insert(notebookItemId, $event) {
      let notebookItem = this.NotebookService.getNotebookItemByNotebookItemId(notebookItemId, this.workgroupId);
      if (notebookItem == null) {
        notebookItem = this.NotebookService.getPublicNotebookItemById(notebookItemId);
      }
      // user is inserting new content into the report
      this.insertContent = angular.copy(notebookItem);
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
    },
    template:
        `<div ng-if="$ctrl.config.enabled" ng-class="{'notes-visible': $ctrl.notesVisible}">
            <div class="notebook-overlay"></div>
            <notebook-launcher config="$ctrl.config"
                               note-count="$ctrl.notebook.items.length"
                               notes-visible="$ctrl.notesVisible"
                               on-open="$ctrl.open(value, event)"></notebook-launcher>
            <notebook-report ng-if="$ctrl.config.itemTypes.report.enabled"
                             insert-content="$ctrl.insertContent"
                             insert-mode="$ctrl.insertMode"
                             config="$ctrl.config"
                             reportId="$ctrl.reportId"
                             visible="$ctrl.reportVisible"
                             workgroup-id="$ctrl.workgroupId"
                             on-collapse="$ctrl.insertMode=false"
                             on-set-insert-mode="$ctrl.setInsertMode(value)"></notebook-report>
        </div>
        <notebook-notes ng-if="$ctrl.config.enabled"
                        notebook="$ctrl.notebook"
                        notes-visible="$ctrl.notesVisible"
                        config="$ctrl.config"
                        insert-mode="$ctrl.insertMode"
                        workgroup-id="$ctrl.workgroupId"
                        on-close="$ctrl.closeNotes()"
                        on-insert="$ctrl.insert(value, event)"
                        on-set-insert-mode="$ctrl.setInsertMode(value)"></notebook-notes>`,
    controller: NotebookController
};

export default Notebook;
