'use strict';

class NotebookNotesController {
  constructor($filter,
              $rootScope,
              $scope,
              NotebookService,
              ProjectService) {
    this.$translate = $filter('translate');
    this.$rootScope = $rootScope;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.groups = [];
    this.selectedTabIndex = 0;
    this.$scope = $scope;
    this.publicNotebookItems = this.NotebookService.publicNotebookItems;
    this.groupNameToGroup = {};
  }

  $onInit() {
    const personalGroup = {
      title: 'Personal',
      name: 'private',
      isEditAllowed: true,
      items: []
    };
    this.groupNameToGroup['private'] = personalGroup;
    for (const [personalItemKey, personalItemValue] of Object.entries(this.notebook.items)) {
      if (personalItemValue.last().type === 'note') {
        personalGroup.items.push(personalItemValue.last());
      }
    }
    this.groups.push(personalGroup);

    const spaces = this.ProjectService.getSpaces();
    for (let space of spaces) {
      if (space.isShowInNotebook) {
        const spaceGroup = {
          title: space.name,
          name: space.id,
          isEditAllowed: true,
          items: []
        };
        this.groupNameToGroup[space.id] = spaceGroup;
        this.groups.push(spaceGroup);
      }
    }

    this.$onInit = () => {
      this.color = this.config.itemTypes.note.label.color;
    };

    this.$onChanges = (changes) => {
      if (changes.notebook) {
        this.notebook = angular.copy(changes.notebook.currentValue);
        this.hasNotes = Object.keys(this.notebook.items).length ? true : false;
      }
    };

    this.$scope.$on('openNotebook', (event, args) => {
      this.selectedTabIndex = args.visibleSpace === 'public' ? 1 : 0;
    });

    this.$rootScope.$on('publicNotebookItemsRetrieved', (event, args) => {
      for (let group of this.groups) {
        if (group.name !== 'private') {
          group.items = this.publicNotebookItems[group.name];
        }
      }
    });

    this.$rootScope.$on('notebookUpdated', (event, args) => {
      let notebookItem = args.notebookItem;
      if ((notebookItem.groups == null || notebookItem.groups.length === 0) &&
          notebookItem.type === 'note') {
        this.updatePrivateNotebookNote(notebookItem);
      }
      if (notebookItem.groups != null && notebookItem.groups.includes('public')) {
        this.updatePublicNotebookNote(notebookItem);
      }
    });
  }

  updatePrivateNotebookNote(notebookItem) {
    this.updateNotebookNote(this.groupNameToGroup['private'],
        notebookItem.localNotebookItemId, notebookItem.workgroupId, notebookItem);
    if (this.groupNameToGroup['public'] != null) {
      this.removeNotebookNote(this.groupNameToGroup['public'],
        notebookItem.localNotebookItemId, notebookItem.workgroupId);
    }
  }

  updatePublicNotebookNote(notebookItem) {
    this.updateNotebookNote(this.groupNameToGroup['public'],
        notebookItem.localNotebookItemId, notebookItem.workgroupId, notebookItem);
    this.removeNotebookNote(this.groupNameToGroup['private'],
        notebookItem.localNotebookItemId, notebookItem.workgroupId);
  }

  updateNotebookNote(group, localNotebookItemId, workgroupId, notebookItem) {
    let added = false;
    let items = group.items;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.localNotebookItemId == localNotebookItemId && item.workgroupId == workgroupId) {
        items[i] = notebookItem;
        added = true;
      }
    }
    if (!added) {
      items.push(notebookItem);
    }
  }

  removeNotebookNote(group, localNotebookItemId, workgroupId) {
    let items = group.items;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.localNotebookItemId == localNotebookItemId && item.workgroupId == workgroupId) {
        items.splice(i, 1);
        i--;
      }
    }
  }

  getTitle() {
    if (this.insertMode) {
      return this.$translate('selectItemToInsert');
    } else {
      return this.config.itemTypes.note.label.link;
    }
  }

  editItem($ev, note) {
    this.$rootScope.$broadcast('editNote', {note: note, ev: $ev});
  }

  select($ev, note) {
    if (this.insertMode) {
      this.onInsert({note: note, event: $ev});
    } else {
      this.editItem($ev, note);
    }
  }

  edit(itemId) {
    alert(`Edit the item: ${itemId}`);
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
  'NotebookService',
  'ProjectService'
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
    onSetInsertMode: '&',
    mode: '@'
  },
  template:
    `<md-sidenav ng-if="::$ctrl.mode !== 'classroomMonitor'" md-component-id="notes"
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
              <span flex></span>
              <md-button ng-click="$ctrl.close($event)"
                  class="md-icon-button"
                  aria-label="{{ ::'Close' | translate }}">
                <md-icon>close</md-icon>
              </md-button>
          </div>
      </md-toolbar>
      <md-content>
      <md-tabs md-selected="$ctrl.selectedTabIndex" md-dynamic-height md-border-bottom md-autoselect md-swipe-content>
        <md-tab ng-repeat="group in $ctrl.groups"
            ng-disabled="::group.disabled"
            label="{{::group.title}}">
          <div class="demo-tab tab{{$index%4}}" style="padding: 25px; text-align: center;">
              <div class="notebook-items" ng-class="{'notebook-items--insert': $ctrl.insertMode}" layout="row" layout-wrap>
                <div class="md-padding" ng-if="!$ctrl.hasNotes" translate="noNotes" translate-value-term="{{::$ctrl.config.itemTypes.note.label.plural}}"></div>
                <notebook-item ng-repeat="note in group.items"
                    config="$ctrl.config"
                    group="{{::group.name}}"
                    item-id="note.localNotebookItemId"
                    is-edit-allowed="group.isEditAllowed"
                    is-choose-mode="$ctrl.insertMode"
                    note="note"
                    workgroup-id="note.workgroupId"
                    on-select="$ctrl.select($ev, note)"
                    style="display: flex;"
                    flex="100"
                    flex-gt-xs="50">
                </notebook-item>
            </div>
          </div>
        </md-tab>
      </md-tabs>
      </md-content>
    </md-sidenav>
    <div ng-if="::$ctrl.mode === 'classroomMonitor'" md-dynamic-height md-border-bottom md-autoselect md-swipe-content>
      <div ng-repeat="group in $ctrl.groups"
          ng-disabled="::group.disabled"
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
                  note="note"
                  workgroup-id="note.workgroupId"
                  on-select="$ctrl.select($ev, note)"
                  style="display: flex;"
                  flex="100"
                  flex-gt-xs="50">
              </notebook-item>
          </div>
        </div>
      </div>
    </div>
    `,
  controller: NotebookNotesController
};

export default NotebookNotes;
