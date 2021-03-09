'use strict';

class EditNotebookItemController {
  constructor($filter,
              $mdDialog,
              $q,
              $injector,
              $rootScope,
              $scope,
              ConfigService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService,
              note,
              isEditMode,
              file,
              text,
              studentWorkIds,
              isEditTextEnabled,
              isFileUploadEnabled) {
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
    this.note = note;
    this.isEditMode = isEditMode;
    this.file = file;
    this.text = text;
    this.studentWorkIds = studentWorkIds;
    this.isEditTextEnabled = isEditTextEnabled;
    this.isFileUploadEnabled = isFileUploadEnabled;
  }

  $onInit() {
    if (this.note == null) {
      const currentNodeId = this.StudentDataService.getCurrentNodeId();
      const currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);

      this.item = {
        id: null, // null id means we're creating a new notebook item.
        localNotebookItemId: this.UtilService.generateKey(10), // Id that is common across the same notebook item revisions.
        type: 'note', // the notebook item type, TODO: once questions are enabled, don't hard code
        nodeId: currentNodeId, // Id of the node this note was created on
        title: this.$translate('noteFrom', { currentNodeTitle: currentNodeTitle }),  // Title of the node this note was created on
        content: {
          text: '',
          attachments: []
        }
      };
    } else {
      this.item = angular.copy(this.note);
      this.itemId = this.item.id;
      this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
      if (this.NotebookService.isNotebookItemPublic(this.item) &&
          this.item.workgroupId != this.ConfigService.getWorkgroupId()) {
        this.isEditMode = false;
      }
    }

    this.notebookConfig = this.NotebookService.getNotebookConfig();
    this.color = this.notebookConfig.itemTypes[this.item.type].label.color;

    let label = this.notebookConfig.itemTypes[this.item.type].label.singular;
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
      const files = [this.file];
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

  isSharedWithClass() {
    return this.item.groups != null && this.item.groups.includes('public');
  }

  toggleMakeNotePublic() {
    if (this.item.groups == null) {
      this.item.groups = [];
    }
    if (!this.item.groups.includes('public')) {
      this.item.groups.push('public');
    } else {
      for (let i = 0; i < this.item.groups.length; i++) {
        if (this.item.groups[i] === 'public') {
          this.item.groups.splice(i, 1);
          break;
        }
      }
    }
    this.update();
  }

  copyPublicNotebookItem(ev) {
    ev.stopPropagation();
    this.NotebookService.copyNotebookItem(this.itemId);
    this.$mdDialog.hide();
  }

  attachStudentAssetToNote(files = []) {
    for (let file of files) {
      const attachment = {
        studentAssetId: null,
        iconURL: '',
        file: file
      };

      /*
       * read image data as URL and set it in the attachment iconURL attribute
       * so students can preview the image
       */
      const reader = new FileReader();
      reader.onload = (event) => {
        attachment.iconURL = event.target.result;
        this.item.content.attachments.push(attachment);
        this.update();
        this.$scope.$apply();
      };
      reader.readAsDataURL(file);
    }
  }

  getItemNodeId() {
    if (this.item == null) {
      return null;
    } else {
      return this.item.nodeId;
    }
  }

  getItemNodeLink() {
    if (this.item == null) {
      return '';
    } else {
      return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
    }
  }

  getItemNodePosition() {
    if (this.item == null) {
      return '';
    } else {
      return this.ProjectService.getNodePositionById(this.item.nodeId);
    }
  }

  getTemplateUrl() {
    return this.ProjectService.getThemePath() + '/notebook/editNotebookItem.html';
  }

  removeAttachment(attachment) {
    if (this.item.content.attachments.indexOf(attachment) != -1) {
      this.item.content.attachments.splice(this.item.content.attachments.indexOf(attachment), 1);
      this.update();
    }
  }

  delete(ev) {
    // TODO: add archiving/deleting notebook items
  }

  cancel() {
    this.$mdDialog.hide();
  }

  close() {
    this.$mdDialog.hide();
  }

  save() {
    // go through the notebook item's attachments and look for any attachments that need to be uploaded and made into StudentAsset.
    let uploadAssetPromises = [];
    if (this.item.content.attachments != null) {
      for (let i = 0; i < this.item.content.attachments.length; i++) {
        let attachment = this.item.content.attachments[i];
        if (attachment.studentAssetId == null && attachment.file != null) {
          // this attachment hasn't been uploaded yet, so we'll do that now.
          let file = attachment.file;
          var deferred = this.$q.defer();
          this.StudentAssetService.uploadAsset(file).then((studentAsset) => {
            this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
              if (copiedAsset != null) {
                var newAttachment = {
                  studentAssetId: copiedAsset.id,
                  iconURL: copiedAsset.iconURL
                };
                this.item.content.attachments[i] = newAttachment;
                deferred.resolve();
              }
            });
          });
          uploadAssetPromises.push(deferred.promise);
        }
      }
    }

    // make sure all the assets are created before saving the notebook item.
    this.$q.all(uploadAssetPromises).then(() => {
      this.NotebookService.saveNotebookItem(
          this.item.id, this.item.nodeId, this.item.localNotebookItemId,
          this.item.type, this.item.title, this.item.content, this.item.groups,
          Date.parse(new Date().toString()))
        .then(() => {
          this.$mdDialog.hide();
        });
    });
  }

  update() {
    this.saveEnabled = this.item.content.text ||
        (!this.isRequireTextOnEveryNote() &&
        this.item.content.attachments.length);
    this.setShowUpload();
  }

  isRequireTextOnEveryNote() {
    return this.notebookConfig.itemTypes != null &&
      this.notebookConfig.itemTypes.note != null &&
      this.notebookConfig.itemTypes.note.requireTextOnEveryNote;
  }

  setShowUpload() {
    this.showUpload = this.notebookConfig.itemTypes != null &&
      this.notebookConfig.itemTypes.note != null &&
      this.notebookConfig.itemTypes.note.enableStudentUploads &&
      this.item.content.attachments &&
      this.item.content.attachments.length < 1;
  }

  canShareWithClass() {
    return this.ProjectService.isSpaceExists('public');
  }

  canCopyPublicNotebookItem() {
    return !this.ConfigService.isClassroomMonitor() && 
        this.ProjectService.isSpaceExists('public') && !this.isMyNotebookItem();
  }

  isMyNotebookItem() {
    return this.item.workgroupId === this.ConfigService.getWorkgroupId();
  }
}

EditNotebookItemController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$injector',
  '$rootScope',
  '$scope',
  'ConfigService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService',
  'note',
  'isEditMode',
  'file',
  'text',
  'studentWorkIds',
  'isEditTextEnabled',
  'isFileUploadEnabled'
];

export default EditNotebookItemController;
