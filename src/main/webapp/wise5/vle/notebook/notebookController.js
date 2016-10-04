'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookController = function () {
    function NotebookController($injector, $rootScope, $scope, $translate, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NotebookController);

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.mode = this.ConfigService.getMode();
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        this.notebook = null;
        this.itemId = null;
        this.item = null;
        this.notebookConfig = this.NotebookService.config;

        $scope.$on('notebookUpdated', function (event, args) {
            _this.notebook = args.notebook;
        });
        //this.notebook = this.NotebookService.notebook;

        this.logOutListener = $scope.$on('logOut', function (event, args) {
            _this.logOutListener();
            _this.$rootScope.$broadcast('componentDoneUnloading');
        });

        // retrieve assets when notebook is opened
        this.retrieveNotebookItems();
    }

    _createClass(NotebookController, [{
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.templateUrl;
        }
    }, {
        key: 'retrieveNotebookItems',
        value: function retrieveNotebookItems() {
            var _this2 = this;

            // fetch all assets first because a subset of it will be referenced by a notebook item
            if (!this.ConfigService.isPreview()) {
                this.StudentAssetService.retrieveAssets().then(function (studentAssets) {
                    _this2.NotebookService.retrieveNotebookItems().then(function (notebook) {
                        _this2.notebook = notebook;
                    });
                });
            } else {
                this.notebook = this.NotebookService.notebook;
            }
        }
    }, {
        key: 'deleteStudentAsset',
        value: function deleteStudentAsset(studentAsset) {
            alert('delete student asset from note book not implemented yet');
            /*
             StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
             // remove studentAsset
             this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
             this.calculateTotalUsage();
             }));
             */
        }
    }, {
        key: 'deleteItem',
        value: function deleteItem(item) {
            this.NotebookService.deleteItem(item);
        }
    }, {
        key: 'editItem',
        value: function editItem(ev, itemId) {
            //this.NotebookService.editItem(ev, itemId);
            this.$rootScope.$broadcast('editNote', { itemId: itemId, ev: ev });
        }
    }, {
        key: 'notebookItemSelected',
        value: function notebookItemSelected($event, notebookItem) {
            this.selectedNotebookItem = notebookItem;
        }
    }, {
        key: 'attachNotebookItemToComponent',
        value: function attachNotebookItemToComponent($event, notebookItem) {
            this.componentController.attachNotebookItemToComponent(notebookItem);
            this.selectedNotebookItem = null; // reset selected notebook item
            // TODO: add some kind of unobtrusive confirmation to let student know that the notebook item has been added to current component
            $event.stopPropagation(); // prevents parent notebook list item from getting the onclick event so this item won't be re-selected.
        }
    }]);

    return NotebookController;
}();

NotebookController.$inject = ["$injector", "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService"];

exports.default = NotebookController;
//# sourceMappingURL=notebookController.js.map