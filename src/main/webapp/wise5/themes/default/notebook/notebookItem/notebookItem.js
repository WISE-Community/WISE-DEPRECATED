'use strict';

class NotebookItemController {
  constructor($injector,
              $mdDialog,
              $rootScope,
              $scope,
              $filter,
              ConfigService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$filter = $filter;
    this.ConfigService = ConfigService;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.notebookUpdatedSubscription.unsubscribe();
  }

  $onInit() {
    this.item = this.note;
    this.type = this.item ? this.item.type : null;
    this.label = this.config.itemTypes[this.type].label;
    if (this.group === 'public') {
      this.color = 'orange';
    } else {
      this.color = this.label.color;
    }

    this.notebookUpdatedSubscription = this.NotebookService.notebookUpdated$.subscribe((args) => {
      const notebook = args.notebook;
      if (notebook.items[this.itemId]) {
        this.item = notebook.items[this.itemId].last();
      }
    });
  }

  isItemInGroup(group) {
    return this.item.groups != null && this.item.groups.includes(group);
  }

  getItemNodeId() {
    if (this.item == null) {
      return null;
    } else {
      return this.item.nodeId;
    }
  }

  getItemNodeLink() {
    if (this.item == null) {
      return '';
    } else {
      return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
    }
  }

  getItemNodePosition() {
    if (this.item == null) {
      return '';
    } else {
      return this.ProjectService.getNodePositionById(this.item.nodeId);
    }
  }

  doDelete(ev) {
    ev.stopPropagation();
    const confirm = this.$mdDialog.confirm()
      .title(this.$translate('deleteNoteConfirmMessage'))
      .ariaLabel('delete note confirmation')
      .targetEvent(ev)
      .ok(this.$translate('delete'))
      .cancel(this.$translate('cancel'));
    this.$mdDialog.show(confirm).then(() => {
      this.NotebookService.deleteNote(this.item);
    }, () => {
      // they chose not to delete. Do nothing, the dialog will close.
    });
  }

  doRevive(ev) {
    ev.stopPropagation();
    const confirm = this.$mdDialog.confirm()
      .title(this.$translate('reviveNoteConfirmMessage'))
      .ariaLabel('revive note confirmation')
      .targetEvent(ev)
      .ok(this.$translate('revive'))
      .cancel(this.$translate('cancel'));
    this.$mdDialog.show(confirm).then(() => {
      this.NotebookService.reviveNote(this.item);
    }, () => {
      // they chose not to revive. Do nothing, the dialog will close.
    });
  }

  doSelect(ev) {
    if (this.onSelect) {
      this.onSelect({$ev: ev, note: this.item});
    }
  }

  canShareNotebookItem() {
    return this.ProjectService.isSpaceExists('public') &&
        this.isMyNotebookItem() &&
        this.item.serverDeleteTime == null &&
        !this.isChooseMode &&
        !this.isItemInGroup('public');
  }

  canUnshareNotebookItem() {
    return this.ProjectService.isSpaceExists('public') &&
        this.isMyNotebookItem() &&
        this.item.serverDeleteTime == null &&
        !this.isChooseMode &&
        this.isItemInGroup('public');
  }

  canDeleteNotebookItem() {
    return this.isMyNotebookItem() &&
        this.item.serverDeleteTime == null &&
        !this.isChooseMode;
  }

  canReviveNotebookItem() {
    return this.item.serverDeleteTime != null && !this.isChooseMode;
  }

  isMyNotebookItem() {
    return this.item.workgroupId === this.ConfigService.getWorkgroupId();
  }

  isNotebookItemActive() {
    return this.item.serverDeleteTime == null;
  }
}

NotebookItemController.$inject = [
  '$injector',
  '$mdDialog',
  '$rootScope',
  '$scope',
  '$filter',
  'ConfigService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

const NotebookItem = {
  bindings: {
    itemId: '<',
    group: '@',
    note: '<',
    isChooseMode: '<',
    config: '<',
    componentController: '<',
    workgroupId: '<',
    onSelect: '&'
  },
  template:
    `<md-card class="notebook-item"
                  ng-if="$ctrl.isNotebookItemActive()"
                  ng-mouseenter="focus=true;"
                  ng-mouseleave="focus=false;"
                  ng-class="{'md-whiteframe-5dp': focus}"
                  ng-click="$ctrl.doSelect($event)">
            <md-card-content aria-label="View"
                             class="notebook-item__content notebook-item__edit"
                             ng-class="{'notebook-item__content--text-only': !$ctrl.item.content.attachments.length}"
                             md-ink-ripple
                             flex
                             layout="column"
                             layout-align="center center">
                <div ng-repeat="attachment in $ctrl.item.content.attachments"
                     ng-if="$first"
                     class="notebook-item__content__attachment"
                     style="background: url('{{attachment.iconURL}}')"></div>
                <div ng-if="$ctrl.item.content.text"
                     class="notebook-item__content__text notebook-item__edit md-body-1"
                     style="color: {{$ctrl.label.color}}">
                    {{$ctrl.item.content.text}}
                </div>
            </md-card-content>
            <md-card-actions class="notebook-item__actions"
                             layout="row"
                             layout-align="start center"
                             style="background-color: {{$ctrl.color}}">
                <span class="notebook-item__content__location"><md-icon> place </md-icon><span class="md-body-1">{{$ctrl.getItemNodePosition()}}</span></span>
                <span flex></span>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.canDeleteNotebookItem()"
                           aria-label="Delete notebook item"
                           ng-click="$ctrl.doDelete($event)">
                    <md-icon> delete </md-icon>
                    <md-tooltip md-direction="top">{{ ::'DELETE' | translate }}</md-tooltip>
                </md-button>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.canReviveNotebookItem()"
                           aria-label="Revive notebook item"
                           ng-click="$ctrl.doRevive($event)">
                    <md-icon> undo </md-icon>
                    <md-tooltip md-direction="top">{{ ::'reviveNote' | translate }}</md-tooltip>
                </md-button>
            </md-card-actions>
        </md-card>`,
  controller: NotebookItemController
};

export default NotebookItem;
