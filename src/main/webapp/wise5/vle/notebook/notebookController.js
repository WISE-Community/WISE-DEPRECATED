"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookController = function () {
    function NotebookController($injector, $rootScope, $scope, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NotebookController);

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.mode = this.ConfigService.getMode();
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        this.notebook = null;
        this.itemId = null;
        this.item = null;
        this.itemSource = false;
        this.applicationNodes = ProjectService.getApplicationNodes();

        $scope.$on('notebookUpdated', function (event, args) {
            _this.notebook = args.notebook;
        });

        this.logOutListener = $scope.$on('logOut', function (event, args) {
            _this.logOutListener();
            _this.$rootScope.$broadcast('componentDoneUnloading');
        });

        // retrieve assets when notebook is opened
        if (!this.ConfigService.isPreview()) {
            this.retrieveNotebookItems();
        }
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
            this.StudentAssetService.retrieveAssets().then(function (studentAssets) {
                _this2.NotebookService.retrieveNotebookItems().then(function (notebook) {
                    _this2.notebook = notebook;
                });
            });
        }
    }, {
        key: 'uploadStudentAssetNotebookItems',
        value: function uploadStudentAssetNotebookItems(files) {
            if (files != null) {
                for (var f = 0; f < files.length; f++) {
                    var file = files[f];
                    this.NotebookService.uploadStudentAssetNotebookItem(file);
                }
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
    }, {
        key: 'notebookItemDragStartCallback',
        value: function notebookItemDragStartCallback(event, ui, notebookItem) {
            //$(ui.helper.context).data('objectType', 'NotebookItem');
            //$(ui.helper.context).data('objectData', notebookItem);
        }
    }, {
        key: 'myWorkDragStartCallback',
        value: function myWorkDragStartCallback(event, ui, nodeId, nodeType) {
            //$(ui.helper.context).data('importType', 'NodeState');
            //$(ui.helper.context).data('importWorkNodeState', StudentDataService.getLatestNodeStateByNodeId(nodeId));
            //$(ui.helper.context).data('importWorkNodeType', nodeType);
        }
    }, {
        key: 'log',
        value: function log() {}
    }, {
        key: 'getLatestNodeStateByNodeId',
        value: function getLatestNodeStateByNodeId(nodeId) {
            return this.StudentDataService.getLatestNodeStateByNodeId(nodeId);
        }
    }, {
        key: 'showStudentWorkByNodeId',
        value: function showStudentWorkByNodeId(nodeId, nodeType) {
            var result = null;

            if (nodeId != null && nodeType != null) {
                var childService = this.$injector.get(nodeType + 'Service');

                if (childService != null) {
                    var latestNodeState = this.StudentDataService.getLatestNodeStateByNodeId(nodeId);
                    var studentWorkHTML = this.childService.getStudentWorkAsHTML(latestNodeState);
                    result = studentWorkHTML;
                }
            }
            return result;
        }
    }]);

    return NotebookController;
}();

NotebookController.$inject = ["$injector", "$rootScope", "$scope", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService"];

exports.default = NotebookController;
//# sourceMappingURL=notebookController.js.map