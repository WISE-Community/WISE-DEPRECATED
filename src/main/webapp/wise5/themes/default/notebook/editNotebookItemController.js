'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditNotebookItemController = function () {
  function EditNotebookItemController($filter, $mdDialog, $q, $injector, $rootScope, $scope, ConfigService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, EditNotebookItemController);

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$injector = $injector;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.ConfigService = ConfigService;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.showUpload = false;

    if (this.itemId == null) {
      var currentNodeId = this.StudentDataService.getCurrentNodeId();
      var currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);

      this.item = {
        id: null, // null id means we're creating a new notebook item.
        localNotebookItemId: this.UtilService.generateKey(10), // Id that is common across the same notebook item revisions.
        type: "note", // the notebook item type, TODO: once questions are enabled, don't hard code
        nodeId: currentNodeId, // Id of the node this note was created on
        title: this.$translate('noteFrom', { currentNodeTitle: currentNodeTitle }), // Title of the node this note was created on
        content: {
          text: "",
          attachments: []
        }
      };
    } else {
      this.item = angular.copy(this.NotebookService.getNotebookItemById(this.itemId));
      this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
      if (this.NotebookService.isNotebookItemPublic(this.item) && this.item.workgroupId != this.ConfigService.getWorkgroupId()) {
        this.isEditMode = false;
      }
    }

    this.notebookConfig = this.NotebookService.getNotebookConfig();
    this.color = this.notebookConfig.itemTypes[this.item.type].label.color;

    var label = this.notebookConfig.itemTypes[this.item.type].label.singular;
    if (this.isEditMode) {
      if (this.itemId) {
        this.title = this.$translate('editNote', { noteLabel: label });
      } else {
        this.title = this.$translate('addNote', { noteLabel: label });
      }
    } else {
      this.title = this.$translate('viewNote', { noteLabel: label });
    }
    this.saveEnabled = false;

    if (this.file != null) {
      // student is trying to add a file to this notebook item.
      var files = [this.file];
      this.attachStudentAssetToNote(files);
    } else {
      this.setShowUpload();
    }

    if (this.text != null) {
      this.item.content.text = this.text;
      this.saveEnabled = true;
    }
    if (!this.isFileUploadEnabled) {
      this.showUpload = false;
    }

    if (this.studentWorkIds != null) {
      this.item.content.studentWorkIds = this.studentWorkIds;
    }
  }

  _createClass(EditNotebookItemController, [{
    key: 'toggleMakeNotePublic',
    value: function toggleMakeNotePublic() {
      if (this.item.groups == null) {
        this.item.groups = [];
      }
      if (!this.item.groups.includes("public")) {
        this.item.groups.push("public");
      } else {
        for (var i = 0; i < this.item.groups.length; i++) {
          if (this.item.groups[i] === "public") {
            this.item.groups.splice(i, 1);
            break;
          }
        }
      }
    }
  }, {
    key: 'attachStudentAssetToNote',
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
          _this.update();
        };

        for (var f = 0; f < files.length; f++) {
          _loop(f);
        }
      }
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
      return this.ProjectService.getThemePath() + '/notebook/editNotebookItem.html';
    }
  }, {
    key: 'removeAttachment',
    value: function removeAttachment(attachment) {
      if (this.item.content.attachments.indexOf(attachment) != -1) {
        this.item.content.attachments.splice(this.item.content.attachments.indexOf(attachment), 1);
        this.update();
      }
    }
  }, {
    key: 'delete',
    value: function _delete(ev) {
      // TODO: add archiving/deleting notebook items
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.$mdDialog.hide();
    }
  }, {
    key: 'close',
    value: function close() {
      this.$mdDialog.hide();
    }
  }, {
    key: 'save',
    value: function save() {
      var _this2 = this;

      // go through the notebook item's attachments and look for any attachments that need to be uploaded and made into StudentAsset.
      var uploadAssetPromises = [];
      this.item.content.clientSaveTime = Date.parse(new Date()); // set save timestamp
      if (this.item.content.attachments != null) {
        var _loop2 = function _loop2(i) {
          var attachment = _this2.item.content.attachments[i];
          if (attachment.studentAssetId == null && attachment.file != null) {
            // this attachment hasn't been uploaded yet, so we'll do that now.
            var file = attachment.file;
            deferred = _this2.$q.defer();

            _this2.StudentAssetService.uploadAsset(file).then(function (studentAsset) {
              _this2.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                if (copiedAsset != null) {
                  var newAttachment = {
                    studentAssetId: copiedAsset.id,
                    iconURL: copiedAsset.iconURL
                  };
                  _this2.item.content.attachments[i] = newAttachment;
                  deferred.resolve();
                }
              });
            });
            uploadAssetPromises.push(deferred.promise);
          }
        };

        for (var i = 0; i < this.item.content.attachments.length; i++) {
          var deferred;

          _loop2(i);
        }
      }

      // make sure all the assets are created before saving the notebook item.
      this.$q.all(uploadAssetPromises).then(function () {
        _this2.NotebookService.saveNotebookItem(_this2.item.id, _this2.item.nodeId, _this2.item.localNotebookItemId, _this2.item.type, _this2.item.title, _this2.item.content, _this2.item.groups, _this2.item.content.clientSaveTime).then(function () {
          _this2.$mdDialog.hide();
        });
      });
    }
  }, {
    key: 'update',
    value: function update() {
      var saveEnabled = false;
      if (this.item.content.text || !this.isRequireTextOnEveryNote() && this.item.content.attachments.length) {
        saveEnabled = true;
      }
      this.saveEnabled = saveEnabled;
      this.setShowUpload();
    }
  }, {
    key: 'isRequireTextOnEveryNote',
    value: function isRequireTextOnEveryNote() {
      return this.notebookConfig.itemTypes != null && this.notebookConfig.itemTypes.note != null && this.notebookConfig.itemTypes.note.requireTextOnEveryNote;
    }
  }, {
    key: 'setShowUpload',
    value: function setShowUpload() {
      this.showUpload = this.notebookConfig.itemTypes != null && this.notebookConfig.itemTypes.note != null && this.notebookConfig.itemTypes.note.enableStudentUploads && this.item.content.attachments && this.item.content.attachments.length < 1;
    }
  }, {
    key: 'canShareWithClass',
    value: function canShareWithClass() {
      return this.ProjectService.isSpaceExists("public");
    }
  }]);

  return EditNotebookItemController;
}();

EditNotebookItemController.$inject = ['$filter', "$mdDialog", "$q", "$injector", "$rootScope", "$scope", "ConfigService", "NotebookService", "ProjectService", "StudentAssetService", "StudentDataService", "UtilService"];

exports.default = EditNotebookItemController;
//# sourceMappingURL=editNotebookItemController.js.map
