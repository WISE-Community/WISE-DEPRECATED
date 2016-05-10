'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookItemController = function () {
    function NotebookItemController($injector, $rootScope, $scope, $translate, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
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

        if (this.itemId == null) {
            var currentNodeId = this.StudentDataService.getCurrentNodeId();
            var currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);

            this.item = {
                id: null, // null id means we're creating a new notebook item.
                localNotebookItemId: this.UtilService.generateKey(10), // this is the id that is common across the same notebook item revisions.
                type: "note",
                nodeId: currentNodeId, // Id of the node this note was created on
                title: "Note on " + currentNodeTitle, // Title of the node this note was created on
                content: {
                    text: "",
                    attachments: []
                }
            };
        } else {
            this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId);
            this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
        }
    }

    _createClass(NotebookItemController, [{
        key: "getItemNodeId",
        value: function getItemNodeId() {
            if (this.item == null) {
                return null;
            } else {
                return this.item.nodeId;
            }
        }

        /**
         * Returns this NotebookItem's position and title.
         */

    }, {
        key: "getItemNodePositionAndTitle",
        value: function getItemNodePositionAndTitle() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
            }
        }
    }, {
        key: "getTemplateUrl",
        value: function getTemplateUrl() {
            return this.templateUrl;
        }
    }, {
        key: "editNotebookItem",
        value: function editNotebookItem() {
            // the actual closing of the dialog will be performed by the vleController.
            this.$rootScope.$broadcast('openNoteDialog', { notebookItem: this.item });
        }
    }, {
        key: "saveNotebookItem",
        value: function saveNotebookItem() {
            var _this = this;

            // add new notebook item
            this.item.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
            this.NotebookService.saveNotebookItem(this.item.id, this.item.nodeId, this.item.localNotebookItemId, this.item.type, this.item.title, this.item.content).then(function () {
                _this.closeNoteDialog();
            });
        }
    }, {
        key: "closeNoteDialog",
        value: function closeNoteDialog() {
            // the actual closing of the dialog will be performed by the vleController.
            this.$rootScope.$broadcast('closeNoteDialog');
        }
    }, {
        key: "attachStudentAssetToNote",
        value: function attachStudentAssetToNote(files) {
            var _this2 = this;

            if (files != null) {
                for (var f = 0; f < files.length; f++) {
                    var file = files[f];
                    this.StudentAssetService.uploadAsset(file).then(function (studentAsset) {
                        _this2.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                            if (copiedAsset != null) {
                                var attachment = {
                                    studentAssetId: copiedAsset.id,
                                    iconURL: copiedAsset.iconURL
                                };

                                _this2.item.content.attachments.push(attachment);
                            }
                        });
                    });
                }
            }
        }
    }, {
        key: "removeAttachment",
        value: function removeAttachment(attachment) {
            if (this.item.content.attachments.indexOf(attachment) != -1) {
                this.item.content.attachments.splice(this.item.content.attachments.indexOf(attachment), 1);
            }
        }
    }]);

    return NotebookItemController;
}();

NotebookItemController.$inject = ["$injector", "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService", "UtilService"];

exports.default = NotebookItemController;
//# sourceMappingURL=notebookItemController.js.map