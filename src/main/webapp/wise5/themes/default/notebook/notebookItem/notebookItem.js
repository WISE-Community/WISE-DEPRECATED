"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemController = function () {
    function NotebookItemController($injector, $rootScope, $scope, $filter, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, NotebookItemController);

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

        if (this.group != null) {
            this.item = this.NotebookService.getPublicNotebookItem(this.group, this.itemId, this.workgroupId);
        } else {
            this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId, this.workgroupId);
            //this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
        }

        // set the type in the controller
        this.type = this.item ? this.item.type : null;

        //this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.config.itemTypes[this.type].label;

        this.$rootScope.$on('notebookUpdated', function (event, args) {
            var notebook = args.notebook;
            if (notebook.items[_this.itemId]) {
                _this.item = notebook.items[_this.itemId].last();
            }
        });
    }

    _createClass(NotebookItemController, [{
        key: 'isItemInGroup',
        value: function isItemInGroup(group) {
            return this.item.groups != null && this.item.groups.includes(group);
        }
    }, {
        key: 'getItemNodeId',
        value: function getItemNodeId() {
            if (this.item == null) {
                return null;
            } else {
                return this.item.nodeId;
            }
        }

        /**
         * Returns this NotebookItem's position link
         */

    }, {
        key: 'getItemNodeLink',
        value: function getItemNodeLink() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
            }
        }

        /**
         * Returns this NotebookItem's position
         */

    }, {
        key: 'getItemNodePosition',
        value: function getItemNodePosition() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionById(this.item.nodeId);
            }
        }
    }, {
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
        }
    }, {
        key: 'doDelete',
        value: function doDelete(ev) {
            if (this.onDelete) {
                ev.stopPropagation(); // don't follow-through on the doSelect callback after this
                this.onDelete({ $ev: ev, $itemId: this.item.localNotebookItemId });
            }
        }
    }, {
        key: 'doRevive',
        value: function doRevive(ev) {
            if (this.onRevive) {
                ev.stopPropagation(); // don't follow-through on the doRevive callback after this
                this.onRevive({ $ev: ev, $itemId: this.item.localNotebookItemId });
            }
        }
    }, {
        key: 'doSelect',
        value: function doSelect(ev) {
            if (this.onSelect) {
                this.onSelect({ $ev: ev, $itemId: this.item.localNotebookItemId });
            }
        }
    }, {
        key: 'doShare',
        value: function doShare(ev) {
            ev.stopPropagation(); // don't follow-through on the doShare callback after this
            this.$rootScope.$broadcast('shareNote', { itemId: this.item.id, ev: ev });
        }
    }, {
        key: 'doUnshare',
        value: function doUnshare(ev) {
            ev.stopPropagation(); // don't follow-through on the doUnshare callback after this
            this.$rootScope.$broadcast('unshareNote', { itemId: this.item.id, ev: ev });
        }
    }, {
        key: 'canShareNotebookItem',
        value: function canShareNotebookItem() {
            return this.isMyNotebookItem() && this.item.serverDeleteTime == null && !this.isChooseMode && !this.isItemInGroup('public');
        }
    }, {
        key: 'canUnshareNotebookItem',
        value: function canUnshareNotebookItem() {
            return this.isMyNotebookItem() && this.item.serverDeleteTime == null && !this.isChooseMode && this.isItemInGroup('public');
        }
    }, {
        key: 'canDeleteNotebookItem',
        value: function canDeleteNotebookItem() {
            return this.isMyNotebookItem() && this.item.serverDeleteTime == null && !this.isChooseMode;
        }
    }, {
        key: 'canReviveNotebookItem',
        value: function canReviveNotebookItem() {
            return this.item.serverDeleteTime != null && !this.isChooseMode;
        }
    }, {
        key: 'isMyNotebookItem',
        value: function isMyNotebookItem() {
            return this.item.workgroupId === this.ConfigService.getWorkgroupId();
        }
    }]);

    return NotebookItemController;
}();

NotebookItemController.$inject = ["$injector", "$rootScope", "$scope", "$filter", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService", "UtilService"];

var NotebookItem = {
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
    template: '<md-card class="notebook-item"\n                  ng-mouseenter="focus=true;"\n                  ng-mouseleave="focus=false;"\n                  ng-class="{\'md-whiteframe-5dp\': focus}"\n                  ng-click="$ctrl.doSelect($event)">\n            <md-card-content aria-label="View"\n                             class="notebook-item__content notebook-item__edit"\n                             ng-class="{\'notebook-item__content--text-only\': !$ctrl.item.content.attachments.length}"\n                             md-ink-ripple\n                             flex\n                             layout="column"\n                             layout-align="center center">\n                <div ng-repeat="attachment in $ctrl.item.content.attachments"\n                     ng-if="$first"\n                     class="notebook-item__content__attachment"\n                     style="background: url(\'{{attachment.iconURL}}\')"></div>\n                <div ng-if="$ctrl.item.content.text"\n                     class="notebook-item__content__text notebook-item__edit md-body-1"\n                     style="color: {{$ctrl.label.color}}">\n                    {{$ctrl.item.content.text}}\n                </div>\n            </md-card-content>\n            <md-card-actions class="notebook-item__actions"\n                             layout="row"\n                             layout-align="start center"\n                             style="background-color: {{$ctrl.label.color}}">\n                <span class="notebook-item__content__location"><md-icon> place </md-icon><span class="md-body-1">{{$ctrl.getItemNodePosition()}}</span></span>\n                <span flex></span>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canShareNotebookItem()"\n                           aria-label="Share notebook item"\n                           ng-click="$ctrl.doShare($event)">\n                    <md-icon> cloud_upload </md-icon>\n                    <md-tooltip md-direction="top">{{ \'SHARE\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canUnshareNotebookItem()"\n                           aria-label="Unshare notebook item"\n                           ng-click="$ctrl.doUnshare($event)">\n                    <md-icon> cloud_off </md-icon>\n                    <md-tooltip md-direction="top">{{ \'UNSHARE\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canDeleteNotebookItem()"\n                           aria-label="Delete notebook item"\n                           ng-click="$ctrl.doDelete($event)">\n                    <md-icon> delete </md-icon>\n                    <md-tooltip md-direction="top">{{ \'DELETE\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canReviveNotebookItem()"\n                           aria-label="Revive notebook item"\n                           ng-click="$ctrl.doRevive($event)">\n                    <md-icon> undo </md-icon>\n                    <md-tooltip md-direction="top">{{ \'reviveNote\' | translate }}</md-tooltip>\n                </md-button>\n            </md-card-actions>\n        </md-card>',
    controller: NotebookItemController
};

exports.default = NotebookItem;
//# sourceMappingURL=notebookItem.js.map
