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
                localNotebookItemId: this.UtilService.generateKey(10), // Id that is common across the same notebook item revisions.
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
            // student is trying to add a file to this notebook item.
            var files = [$scope.$parent.file]; // put the file into an array

            this.attachStudentAssetToNote(files);
        }

        this.showUpload = this.mode !== 'preview' && this.item.content.attachments != null && !this.item.content.attachments.length;
    }

    _createClass(NotebookItemController, [{
        key: "attachStudentAssetToNote",
        value: function attachStudentAssetToNote(files) {
            var _this = this;

            if (files != null) {
                var _loop = function _loop(f) {
                    var file = files[f];
                    // create a temporary attachment object
                    var attachment = {
                        studentAssetId: null,
                        iconURL: "",
                        file: file // add the file for uploading in the future
                    };
                    _this.item.content.attachments.push(attachment);
                    // read image data as URL and set it in the temp attachment src attribute so students can preview the image
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        attachment.iconURL = event.target.result;
                    };
                    reader.readAsDataURL(file);
                };

                for (var f = 0; f < files.length; f++) {
                    _loop(f);
                }
            }
        }
    }, {
        key: "getItemNodeId",
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
        key: "getItemNodeLink",
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
        key: "getItemNodePosition",
        value: function getItemNodePosition() {
            if (this.item == null) {
                return "";
            } else {
                return this.ProjectService.getNodePositionById(this.item.nodeId);
            }
        }
    }, {
        key: "getTemplateUrl",
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
        }
    }, {
        key: "doSelect",
        value: function doSelect(ev) {
            if (this.onSelect) {
                this.onSelect(ev, this.item.localNotebookItemId);
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