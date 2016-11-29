'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemController = function () {
    function NotebookItemController($injector, $rootScope, $scope, $translate, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, NotebookItemController);

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.mode = this.ConfigService.getMode();

        this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId);
        this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.

        // set the type in the controller
        this.type = this.item ? this.item.type : null;

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.notebookConfig.itemTypes[this.type].label;

        this.$rootScope.$on('notebookUpdated', function (event, args) {
            var notebook = args.notebook;
            if (notebook.items[_this.itemId]) {
                _this.item = notebook.items[_this.itemId].last();
            }
        });
    }

    _createClass(NotebookItemController, [{
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
        key: 'doSelect',
        value: function doSelect(ev) {
            if (this.onSelect) {
                this.onSelect({ $ev: ev, $itemId: this.item.localNotebookItemId });
            }
        }
    }, {
        key: 'doDelete',
        value: function doDelete(ev) {
            if (this.onDelete) {
                ev.stopPropagation(); // don't follow-through on the doSelect callback after this
                this.onDelete({ $ev: ev, $itemId: this.item.localNotebookItemId });
            }
        }
    }]);

    return NotebookItemController;
}();

NotebookItemController.$inject = ["$injector", "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService", "UtilService"];

exports.default = NotebookItemController;
//# sourceMappingURL=notebookItemController.js.map