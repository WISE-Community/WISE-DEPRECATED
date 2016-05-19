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
                type: "note", // the notebook item type, TODO: once questions are enabled, don't hard code
                nodeId: currentNodeId, // Id of the node this note was created on
                title: "Note from " + currentNodeTitle, // Title of the node this note was created on
                content: {
                    text: "",
                    attachments: []
                }
            };
        } else {
            this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId);
            this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
        }

        // set the type in the controller
        this.type = this.item ? this.item.type : null;

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.notebookConfig.itemTypes[this.type].label;

        if ($scope.$parent.file != null) {
            // put the file into an array
            var files = [$scope.$parent.file];

            // add the file(s) as a student asset
            this.attachStudentAssetToNote(files);
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
         * Returns this NotebookItem's location link
         */

    }, {
        key: "getItemNodeLink",
        value: function getItemNodeLink() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
            }
        }
    }, {
        key: "getTemplateUrl",
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
        }
    }, {
        key: "editNotebookItem",
        value: function editNotebookItem(ev, itemId) {
            this.NotebookService.editItem(ev, itemId);
        }
    }, {
        key: "attachStudentAssetToNote",
        value: function attachStudentAssetToNote(files) {
            var _this = this;

            if (files != null) {
                for (var f = 0; f < files.length; f++) {
                    var file = files[f];
                    this.StudentAssetService.uploadAsset(file).then(function (studentAsset) {
                        _this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                            if (copiedAsset != null) {
                                var attachment = {
                                    studentAssetId: copiedAsset.id,
                                    iconURL: copiedAsset.iconURL
                                };

                                _this.item.content.attachments.push(attachment);
                            }
                            _this.update();
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
                this.update();
            }
        }
    }, {
        key: "update",
        value: function update() {
            // update local notebook item
            this.item.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
            this.onUpdate({ item: this.item });
        }
    }]);

    return NotebookItemController;
}();

NotebookItemController.$inject = ["$injector", "$rootScope", "$scope", "$translate", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService", "UtilService"];

exports.default = NotebookItemController;
//# sourceMappingURL=notebookItemController.js.map