"use strict";

class NotebookItemController {
    constructor($injector,
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
        //this.mode = this.ConfigService.getMode();

        if (this.group != null && this.group != 'private') {
          this.item = this.NotebookService.getPublicNotebookItem(this.group, this.itemId, this.workgroupId);
        } else {
          this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId, this.workgroupId);
          //this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
        }

        // set the type in the controller
        this.type = this.item ? this.item.type : null;

        this.label = this.config.itemTypes[this.type].label;
        if (this.group == 'public') {
          this.color = 'orange';
        } else {
          this.color = this.label.color;
        }

        this.$rootScope.$on('notebookUpdated', (event, args) => {
            let notebook = args.notebook;
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

    /**
     * Returns this NotebookItem's position link
     */
    getItemNodeLink() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
        }
    }

    /**
     * Returns this NotebookItem's position
     */
    getItemNodePosition() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionById(this.item.nodeId);
        }
    }

    getTemplateUrl() {
        return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
    }

    doDelete(ev) {
        if (this.onDelete) {
            ev.stopPropagation();  // don't follow-through on the doSelect callback after this
            this.onDelete({$ev: ev, $itemId: this.item.localNotebookItemId});
        }
    }

    doRevive(ev) {
        if (this.onRevive) {
            ev.stopPropagation();  // don't follow-through on the doRevive callback after this
            this.onRevive({$ev: ev, $itemId: this.item.localNotebookItemId});
        }
    }

    doSelect(ev) {
        if (this.onSelect) {
          this.onSelect({$ev: ev, $itemId: this.item.id});
        }
    }

    doCopy(ev) {
      ev.stopPropagation();
      this.$rootScope.$broadcast('copyNote', {itemId: this.item.id, ev: ev});
    }

    doShare(ev) {
      ev.stopPropagation();  // don't follow-through on the doShare callback after this
      this.$rootScope.$broadcast('shareNote', {itemId: this.item.id, ev: ev});
    }

    doUnshare(ev) {
      ev.stopPropagation();  // don't follow-through on the doUnshare callback after this
      this.$rootScope.$broadcast('unshareNote', {itemId: this.item.id, ev: ev});
    }

    canCopyNotebookItem() {
      return !this.isMyNotebookItem() &&
          !this.isChooseMode;
    }

    canShareNotebookItem() {
      return this.isMyNotebookItem() &&
          this.item.serverDeleteTime == null &&
          !this.isChooseMode &&
          !this.isItemInGroup('public');
    }

    canUnshareNotebookItem() {
      return this.isMyNotebookItem() &&
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
      return this.item.serverDeleteTime != null &&
          !this.isChooseMode;
    }

    isMyNotebookItem() {
      return this.item.workgroupId === this.ConfigService.getWorkgroupId();
    }
}

NotebookItemController.$inject = [
    "$injector",
    "$rootScope",
    "$scope",
    "$filter",
    "ConfigService",
    "NotebookService",
    "ProjectService",
    "StudentAssetService",
    "StudentDataService",
    "UtilService"
];

const NotebookItem = {
    bindings: {
        itemId: '<',
        group: '@',
        isChooseMode: '<',
        config: '<',
        componentController: '<',
        workgroupId: '<',
        onDelete: '&',
        onRevive: '&',
        onSelect: '&'
    },
    template:
        `<md-card class="notebook-item"
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
                           ng-if="$ctrl.canShareNotebookItem()"
                           aria-label="Share notebook item"
                           ng-click="$ctrl.doShare($event)">
                    <md-icon> cloud_upload </md-icon>
                    <md-tooltip md-direction="top">{{ 'SHARE' | translate }}</md-tooltip>
                </md-button>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.canUnshareNotebookItem()"
                           aria-label="Unshare notebook item"
                           ng-click="$ctrl.doUnshare($event)">
                    <md-icon> cloud_off </md-icon>
                    <md-tooltip md-direction="top">{{ 'UNSHARE' | translate }}</md-tooltip>
                </md-button>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.canCopyNotebookItem()"
                           aria-label="Copy notebook item"
                           ng-click="$ctrl.doCopy($event)">
                    <md-icon> cloud_download </md-icon>
                    <md-tooltip md-direction="top">{{ 'COPY' | translate }}</md-tooltip>
                </md-button>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.canDeleteNotebookItem()"
                           aria-label="Delete notebook item"
                           ng-click="$ctrl.doDelete($event)">
                    <md-icon> delete </md-icon>
                    <md-tooltip md-direction="top">{{ 'DELETE' | translate }}</md-tooltip>
                </md-button>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.canReviveNotebookItem()"
                           aria-label="Revive notebook item"
                           ng-click="$ctrl.doRevive($event)">
                    <md-icon> undo </md-icon>
                    <md-tooltip md-direction="top">{{ 'reviveNote' | translate }}</md-tooltip>
                </md-button>
            </md-card-actions>
        </md-card>`,
    controller: NotebookItemController
};

export default NotebookItem;
