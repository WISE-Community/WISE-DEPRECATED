"use strict";

class NotebookNotesController {
    constructor($filter,
                $rootScope) {
                    
        this.$translate = $filter('translate');
        this.$rootScope = $rootScope;
        
        this.$onChanges = (changes) => {
            if(changes.notebook) {
                this.notebook = angular.copy(changes.notebook.currentValue);
            }
        }
    }
    
    getTitle() {
        let title = '';
        if (this.insertMode) {
            title = this.$translate('addToReport', { reportLabel: this.config.itemTypes.report.label.singular });
        } else {
            title = this.config.itemTypes.note.label.link;
        }
        return title;
    }
    
    deleteItem($ev, $itemId, doDelete = true) {
        this.$rootScope.$broadcast('deleteNote', {itemId: $itemId, ev: $ev});
    }
    
    reviveItem(ev, itemId) {
        this.$rootScope.$broadcast('reviveNote', {itemId: $itemId, ev: $ev});
    }

    editItem($ev, $itemId) {
        //this.NotebookService.editItem(ev, itemId);
        this.$rootScope.$broadcast('editNote', {itemId: $itemId, ev: $ev});
    }
    
    select($ev, $itemId) {
        if (this.insertMode) {
            this.onInsert({value: $itemId, event: $ev});
        } else {
            this.editItem($ev, $itemId);
        }
    }
    
    edit(itemId) {
        alert("Edit the item: " + itemId);
    }

    close($event) {
        this.onClose($event);
    }
}

NotebookNotesController.$inject = [
    '$filter',
    '$rootScope'
];

const NotebookNotes = {
    bindings: {
        config: '<',
        insertMode: '<',
        notebook: '<',
        notesVisible: '<',
        workgroupId: '<',
        onClose: '&',
        onInsert: '&'
    },
    template:
        `<md-sidenav md-component-id="notes"
                     md-is-open="$ctrl.notesVisible"
                     md-whiteframe="4"
                     md-disable-backdrop
                     layout="column"
                     class="md-sidenav-right notebook-sidebar">
            <md-toolbar md-theme="light">
                <div class="md-toolbar-tools notebook-sidebar__header">
                    <span style="color: {{$ctrl.config.itemTypes.note.label.color}}">{{$ctrl.getTitle()}}</span>
                    <span flex></span>
                    <md-button ng-click="$ctrl.close($event)" class="md-icon-button" aria-label="{{ 'Close' | translate }}">
                        <md-icon>close</md-icon>
                    </md-button>
                </div>
            </md-toolbar>
            <md-content>
                <div ng-if="$ctrl.insertMode" class="heavy md-padding md-caption">
                    {{ 'selectItemToInsert' | translate }}
                </div>
                <div class="notebook-items" ng-class="{'notebook-items--insert': $ctrl.insertMode}" layout="row" layout-wrap>
                    <notebook-item ng-repeat="(localNotebookItemId, notes) in $ctrl.notebook.items"
                                 ng-if="notes.last().type === 'note'"
                                 config="$ctrl.config"
                                 item-id="localNotebookItemId"
                                 is-edit-allowed="!$ctrl.insertMode"
                                 is-choose-mode="$ctrl.insertMode"
                                 workgroup-id="$ctrl.workgroupId"
                                 on-select="$ctrl.select($ev, $itemId)"
                                 on-delete="$ctrl.deleteItem($ev, $itemId)"
                                 style="display: flex;"
                                 flex="100"
                                 flex-gt-xs="50">
                    </notebook-item>
                    <!-- TODO: show deleted items somewhere
                        <notebook-item ng-repeat="(localNotebookItemId, notes) in $ctrl.notebook.deletedItems"
                                       ng-if="notes.last().type === 'note'"
                                       config="$ctrl.config"
                                       item-id="localNotebookItemId"
                                       is-edit-allowed="!$ctrl.insertMode"
                                       is-choose-mode="$ctrl.insertMode"
                                       workgroup-id="$ctrl.workgroupId"
                                       on-select="$ctrl.select($ev, $itemId)"
                                       on-revive="$ctrl.deleteItem($ev, $itemId)"
                                       style="display: flex;"
                                       flex="100"
                                       flex-gt-xs="50">
                        </notebook-item>
                    -->
                </div> <!-- TODO: add questions when supported -->
            </md-content>
        </md-sidenav>`,
    controller: NotebookNotesController
};

export default NotebookNotes;
