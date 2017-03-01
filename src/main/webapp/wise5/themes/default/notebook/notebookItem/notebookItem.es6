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

        this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId, this.workgroupId);
        this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.

        // set the type in the controller
        this.type = this.item ? this.item.type : null;

        //this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.config.itemTypes[this.type].label;

        this.$rootScope.$on('notebookUpdated', (event, args) => {
            let notebook = args.notebook;
            if (notebook.items[this.itemId]) {
                this.item = notebook.items[this.itemId].last();
            }
        });
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
            this.onSelect({$ev: ev, $itemId: this.item.localNotebookItemId});
        }
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
                             style="background-color: {{$ctrl.label.color}}">
                <span class="notebook-item__content__location"><md-icon> place </md-icon><span class="md-body-1">{{$ctrl.getItemNodePosition()}}</span></span>
                <span flex></span>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.item.serverDeleteTime == null && !$ctrl.isChooseMode"
                           aria-label="Delete notebook item"
                           ng-click="$ctrl.doDelete($event)">
                    <md-icon> delete </md-icon>
                    <md-tooltip md-direction="top">{{ 'DELETE' | translate }}</md-tooltip>
                </md-button>
                <md-button class="md-icon-button"
                           ng-if="$ctrl.item.serverDeleteTime != null && !$ctrl.isChooseMode"
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
