"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemController = function () {
  function NotebookItemController($injector, $mdDialog, $rootScope, $scope, $filter, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, NotebookItemController);

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

    if (this.group != null && this.group != 'private') {
      this.item = this.NotebookService.getPublicNotebookItem(this.group, this.itemId, this.workgroupId);
    } else {
      this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId, this.workgroupId);
    }

    this.type = this.item ? this.item.type : null;
    this.label = this.config.itemTypes[this.type].label;
    if (this.group == 'public') {
      this.color = 'orange';
    } else {
      this.color = this.label.color;
    }

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
  }, {
    key: 'getItemNodeLink',
    value: function getItemNodeLink() {
      if (this.item == null) {
        return "";
      } else {
        return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
      }
    }
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
      var _this2 = this;

      ev.stopPropagation();
      var confirm = this.$mdDialog.confirm().title(this.$translate('deleteNoteConfirmMessage')).ariaLabel('delete note confirmation').targetEvent(ev).ok(this.$translate('delete')).cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(function () {
        _this2.NotebookService.deleteItem(_this2.item.localNotebookItemId);
      }, function () {
        // they chose not to delete. Do nothing, the dialog will close.
      });
    }
  }, {
    key: 'doRevive',
    value: function doRevive(ev) {
      var _this3 = this;

      ev.stopPropagation();
      var confirm = this.$mdDialog.confirm().title(this.$translate('reviveNoteConfirmMessage')).ariaLabel('revive note confirmation').targetEvent(ev).ok(this.$translate('revive')).cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(function () {
        _this3.NotebookService.reviveItem(_this3.item.localNotebookItemId);
      }, function () {
        // they chose not to delete. Do nothing, the dialog will close.
      });
    }
  }, {
    key: 'doSelect',
    value: function doSelect(ev) {
      if (this.onSelect) {
        this.onSelect({ $ev: ev, $itemId: this.item.id });
      }
    }
  }, {
    key: 'doCopy',
    value: function doCopy(ev) {
      var _this4 = this;

      ev.stopPropagation();
      var confirm = this.$mdDialog.confirm().title('copyNoteConfirmMessage').ariaLabel('copy note confirmation').ok(this.$translate('copy')).cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(function () {
        _this4.NotebookService.copyNotebookItem(_this4.item.id);
      });
    }
  }, {
    key: 'doShare',
    value: function doShare(ev) {
      var _this5 = this;

      ev.stopPropagation();
      var confirm = this.$mdDialog.confirm().title('shareNoteConfirmMessage').ariaLabel('share note confirmation').ok(this.$translate('share')).cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(function () {
        _this5.NotebookService.addNotebookItemToGroup(_this5.item.id, 'public');
      });
    }
  }, {
    key: 'doUnshare',
    value: function doUnshare(ev) {
      var _this6 = this;

      ev.stopPropagation();
      var confirm = this.$mdDialog.confirm().title('unshareNoteConfirmMessage').ariaLabel('unshare note confirmation').ok(this.$translate('unshare')).cancel(this.$translate('cancel'));
      this.$mdDialog.show(confirm).then(function () {
        _this6.NotebookService.removeNotebookItemFromGroup(_this6.item.id, 'public');
      });
    }
  }, {
    key: 'canCopyNotebookItem',
    value: function canCopyNotebookItem() {
      return this.ProjectService.isSpaceExists("public") && !this.isMyNotebookItem() && !this.isChooseMode;
    }
  }, {
    key: 'canShareNotebookItem',
    value: function canShareNotebookItem() {
      return this.ProjectService.isSpaceExists("public") && this.isMyNotebookItem() && this.item.serverDeleteTime == null && !this.isChooseMode && !this.isItemInGroup('public');
    }
  }, {
    key: 'canUnshareNotebookItem',
    value: function canUnshareNotebookItem() {
      return this.ProjectService.isSpaceExists("public") && this.isMyNotebookItem() && this.item.serverDeleteTime == null && !this.isChooseMode && this.isItemInGroup('public');
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

NotebookItemController.$inject = ["$injector", "$mdDialog", "$rootScope", "$scope", "$filter", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService", "UtilService"];

var NotebookItem = {
  bindings: {
    itemId: '<',
    group: '@',
    isChooseMode: '<',
    config: '<',
    componentController: '<',
    workgroupId: '<',
    onSelect: '&'
  },
  template: '<md-card class="notebook-item"\n                  ng-mouseenter="focus=true;"\n                  ng-mouseleave="focus=false;"\n                  ng-class="{\'md-whiteframe-5dp\': focus}"\n                  ng-click="$ctrl.doSelect($event)">\n            <md-card-content aria-label="View"\n                             class="notebook-item__content notebook-item__edit"\n                             ng-class="{\'notebook-item__content--text-only\': !$ctrl.item.content.attachments.length}"\n                             md-ink-ripple\n                             flex\n                             layout="column"\n                             layout-align="center center">\n                <div ng-repeat="attachment in $ctrl.item.content.attachments"\n                     ng-if="$first"\n                     class="notebook-item__content__attachment"\n                     style="background: url(\'{{attachment.iconURL}}\')"></div>\n                <div ng-if="$ctrl.item.content.text"\n                     class="notebook-item__content__text notebook-item__edit md-body-1"\n                     style="color: {{$ctrl.label.color}}">\n                    {{$ctrl.item.content.text}}\n                </div>\n            </md-card-content>\n            <md-card-actions class="notebook-item__actions"\n                             layout="row"\n                             layout-align="start center"\n                             style="background-color: {{$ctrl.color}}">\n                <span class="notebook-item__content__location"><md-icon> place </md-icon><span class="md-body-1">{{$ctrl.getItemNodePosition()}}</span></span>\n                <span flex></span>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canShareNotebookItem()"\n                           aria-label="Share notebook item"\n                           ng-click="$ctrl.doShare($event)">\n                    <md-icon> cloud_upload </md-icon>\n                    <md-tooltip md-direction="top">{{ \'SHARE\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canUnshareNotebookItem()"\n                           aria-label="Unshare notebook item"\n                           ng-click="$ctrl.doUnshare($event)">\n                    <md-icon> cloud_off </md-icon>\n                    <md-tooltip md-direction="top">{{ \'UNSHARE\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canCopyNotebookItem()"\n                           aria-label="Copy notebook item"\n                           ng-click="$ctrl.doCopy($event)">\n                    <md-icon> cloud_download </md-icon>\n                    <md-tooltip md-direction="top">{{ \'COPY\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canDeleteNotebookItem()"\n                           aria-label="Delete notebook item"\n                           ng-click="$ctrl.doDelete($event)">\n                    <md-icon> delete </md-icon>\n                    <md-tooltip md-direction="top">{{ \'DELETE\' | translate }}</md-tooltip>\n                </md-button>\n                <md-button class="md-icon-button"\n                           ng-if="$ctrl.canReviveNotebookItem()"\n                           aria-label="Revive notebook item"\n                           ng-click="$ctrl.doRevive($event)">\n                    <md-icon> undo </md-icon>\n                    <md-tooltip md-direction="top">{{ \'reviveNote\' | translate }}</md-tooltip>\n                </md-button>\n            </md-card-actions>\n        </md-card>',
  controller: NotebookItemController
};

exports.default = NotebookItem;
//# sourceMappingURL=notebookItem.js.map
