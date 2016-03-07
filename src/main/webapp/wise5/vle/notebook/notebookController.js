'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
        key: 'attachStudentAssetToNewNote',
        value: function attachStudentAssetToNewNote(files) {
            var _this3 = this;

            if (files != null) {
                for (var f = 0; f < files.length; f++) {
                    var file = files[f];
                    this.StudentAssetService.uploadAsset(file).then(function (studentAsset) {
                        _this3.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                            if (copiedAsset != null) {
                                var attachment = {
                                    studentAssetId: copiedAsset.id,
                                    iconURL: copiedAsset.iconURL
                                };

                                _this3.newNote.content.attachments.push(attachment);
                            }
                        });
                    });
                }
            }
        }
    }, {
        key: 'removeAttachment',
        value: function removeAttachment(attachment) {
            if (this.newNote.content.attachments.indexOf(attachment) != -1) {
                this.newNote.content.attachments.splice(this.newNote.content.attachments.indexOf(attachment), 1);
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
        key: 'showAddNote',
        value: function showAddNote() {
            // setting this will show the add note div
            var currentNodeId = this.StudentDataService.getCurrentNodeId();
            var currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);
            this.newNote = {
                type: "note",
                nodeId: currentNodeId, // Id of the node this note was created on
                title: "Note on " + currentNodeTitle, // Title of the node this note was created on
                content: {
                    text: "Type your note here...",
                    attachments: []
                }
            };
        }
    }, {
        key: 'cancelAddNote',
        value: function cancelAddNote() {
            this.newNote = null; // this will hide the add note div
        }
    }, {
        key: 'addNote',
        value: function addNote() {
            var _this4 = this;

            var newNoteContent = {
                text: this.newNote.content.text,
                attachments: this.newNote.content.attachments
            };
            this.NotebookService.saveNotebookItem(this.newNote.nodeId, this.newNote.type, this.newNote.title, newNoteContent).then(function () {
                _this4.newNote = null; // this will hide the add note div
            });
        }
    }, {
        key: 'addBookmark',
        value: function addBookmark() {
            // TODO: implement me
            this.newNote = null; // this will hide the add note div
        }
    }, {
        key: 'addQuestion',
        value: function addQuestion() {
            // TODO: implement me
            this.newNote = null; // this will hide the add note div
        }
    }]);

    return NotebookController;
}();

NotebookController.$inject = ["$injector", "$rootScope", "$scope", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService"];

exports.default = NotebookController;
//# sourceMappingURL=notebookController.js.map