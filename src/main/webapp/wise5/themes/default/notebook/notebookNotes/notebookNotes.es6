"use strict";

class NotebookNotesController {
    constructor($filter,
                $rootScope,
                $scope,
                NotebookService) {

        this.$translate = $filter('translate');
        this.$rootScope = $rootScope;
        this.NotebookService = NotebookService;
        this.groups = [];
        this.selectedTabIndex = 0;
        this.$scope = $scope;

        this.publicNotebookItems = this.NotebookService.publicNotebookItems;

        const personalGroup = {
            title: "Personal",
            name: "private",
            isEditAllowed: true,
            items: []
        }

        for (const [personalItemKey, personalItemValue] of Object.entries(this.notebook.items)) {
            if (personalItemValue.last().type === 'note') {
                personalGroup.items.push(personalItemValue.last());
            }
        };

        this.groups.push(personalGroup);

        this.$onInit = () => {
            this.color = this.config.itemTypes.note.label.color;
        }

        this.$onChanges = (changes) => {
            if (changes.notebook) {
                this.notebook = angular.copy(changes.notebook.currentValue);
                this.hasNotes = Object.keys(this.notebook.items).length ? true : false;
            }
        }

        this.$rootScope.$on('publicNotebookItemsRetrieved', (event, args) => {
            let publicGroupFound = false;
            for (let group of this.groups) {
                if (group.name == "public") {
                    group.items = this.publicNotebookItems["public"];
                    publicGroupFound = true;
                }
            }
            if (!publicGroupFound) {
                const publicGroup = {
                    title: "Public",
                    name: "public",
                    isEditAllowed: false,
                    items: this.publicNotebookItems["public"]
                };
                this.groups.push(publicGroup);
            }
            this.selectedTabIndex = 0;
        });

    }

    getTitle() {
        let title = '';
        if (this.insertMode) {
            title = this.$translate('selectItemToInsert');
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

    cancelInsertMode($event) {
        this.onSetInsertMode({value: false});
    }
}

NotebookNotesController.$inject = [
    '$filter',
    '$rootScope',
    '$scope',
    'NotebookService'
];

const NotebookNotes = {
    bindings: {
        config: '<',
        insertMode: '<',
        notebook: '<',
        publicNotebookItems: '<',
        notesVisible: '<',
        workgroupId: '<',
        onClose: '&',
        onInsert: '&',
        onSetInsertMode: '&'
    },
    template:
        `<md-sidenav md-component-id="notes"
                     md-is-open="$ctrl.notesVisible"
                     md-whiteframe="4"
                     md-disable-backdrop
                     layout="column"
                     class="md-sidenav-right notebook-sidebar">
            <md-toolbar>
                <div class="md-toolbar-tools"
                     ng-class="{'insert-mode': $ctrl.insertMode}"
                     style="background-color: {{$ctrl.color}};">
                    {{$ctrl.getTitle()}}
                    <!--<md-button ng-if="$ctrl.insertMode"
                               ng-click="$ctrl.cancelInsertMode($event)"
                               md-theme="default"
                               class="md-accent button--small"
                               aria-label="{{ 'Cancel' | translate }}">
                        {{ 'Cancel' | translate }}
                    </md-button>-->
                    <span flex></span>
                    <md-button ng-click="$ctrl.close($event)"
                               class="md-icon-button"
                               aria-label="{{ 'Close' | translate }}">
                        <md-icon>close</md-icon>
                    </md-button>
                </div>
            </md-toolbar>
            <md-content>
            <md-tabs md-selected="$ctrl.selectedTabIndex" md-dynamic-height md-border-bottom md-autoselect md-swipe-content>
              <md-tab ng-repeat="group in $ctrl.groups"
                      ng-disabled="group.disabled"
                      label="{{group.title}}">
                <div class="demo-tab tab{{$index%4}}" style="padding: 25px; text-align: center;">
                    <div class="notebook-items" ng-class="{'notebook-items--insert': $ctrl.insertMode}" layout="row" layout-wrap>
                    <div class="md-padding" ng-if="!$ctrl.hasNotes" translate="noNotes" translate-value-term="{{$ctrl.config.itemTypes.note.label.plural}}"></div>
                    <notebook-item ng-repeat="note in group.items"
                                 config="$ctrl.config"
                                 group="{{group.name}}"
                                 item-id="note.localNotebookItemId"
                                 is-edit-allowed="group.isEditAllowed"
                                 is-choose-mode="$ctrl.insertMode"
                                 workgroup-id="note.workgroupId"
                                 on-select="$ctrl.select($ev, $itemId)"
                                 on-delete="$ctrl.deleteItem($ev, $itemId)"
                                 style="display: flex;"
                                 flex="100"
                                 flex-gt-xs="50">
                    </notebook-item>
                    <!--
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
                    <notebook-item ng-repeat="note in $ctrl.publicNotebookItems.public"
                                 config="$ctrl.config"
                                 group="public"
                                 item-id="note.localNotebookItemId"
                                 is-edit-allowed="false"
                                 is-choose-mode="$ctrl.insertMode"
                                 workgroup-id="note.workgroupId"
                                 on-select="$ctrl.select($ev, $itemId)"
                                 on-delete="$ctrl.deleteItem($ev, $itemId)"
                                 style="display: flex;"
                                 flex="100"
                                 flex-gt-xs="50">
                    </notebook-item>
                    -->

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
                </div>
              </md-tab>
            </md-tabs>

            </md-content>
        </md-sidenav>`,
    controller: NotebookNotesController
};

export default NotebookNotes;
