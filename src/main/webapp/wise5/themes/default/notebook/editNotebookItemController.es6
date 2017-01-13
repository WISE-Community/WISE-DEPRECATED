'use strict';

class EditNotebookItemController {

    constructor($mdDialog,
                $q,
                $injector,
                $rootScope,
                $scope,
                $translate,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentAssetService,
                StudentDataService,
                UtilService) {
        this.$mdDialog = $mdDialog;
        this.$q = $q;
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
            let currentNodeId = this.StudentDataService.getCurrentNodeId();
            let currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);

            this.item = {
                id: null, // null id means we're creating a new notebook item.
                localNotebookItemId: this.UtilService.generateKey(10), // Id that is common across the same notebook item revisions.
                type: "note", // the notebook item type, TODO: once questions are enabled, don't hard code
                nodeId: currentNodeId, // Id of the node this note was created on
                title: this.$translate('noteFrom') + currentNodeTitle,  // Title of the node this note was created on
                content: {
                    text: "",
                    attachments: []
                }
            };
        } else {
            this.item = angular.copy(this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId));
            this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.
        }

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        let label = this.notebookConfig.itemTypes[this.item.type].label.singular;
        this.title = (this.isEditMode ? (this.itemId ? this.$translate('EDIT') + ' ' : this.$translate('add') + ' ') : this.$translate('view') + ' ') + label;
        this.saveEnabled = false;

        if (this.file != null) {
            // student is trying to add a file to this notebook item.
            var files = [this.file];  // put the file into an array

            this.attachStudentAssetToNote(files);
        }

        this.setShowUpload();
    }

    attachStudentAssetToNote(files) {
        if (files != null) {
            for (let f = 0; f < files.length; f++) {
                let file = files[f];
                // create a temporary attachment object
                let attachment = {
                    studentAssetId: null,
                    iconURL: "",
                    file: file  // add the file for uploading in the future
                };
                this.item.content.attachments.push(attachment);
                // read image data as URL and set it in the temp attachment src attribute so students can preview the image
                let reader = new FileReader();
                reader.onload = (event) => {
                    attachment.iconURL = event.target.result;
                };
                reader.readAsDataURL(file);
                this.update();
            }
        }
    }

    getItemNodeId() {
        if (this.item == null) {
            return null;
        } else {
            return this.item.nodeId;
        }
    }

    /**
     * Returns this NotebookItem's position link
     */
    getItemNodeLink() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
        }
    }

    /**
     * Returns this NotebookItem's position
     */
    getItemNodePosition() {
        if (this.item == null) {
            return "";
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

    save() {
        // go through the notebook item's attachments and look for any attachments that need to be uploaded and made into StudentAsset.
        let uploadAssetPromises = [];
        this.item.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
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
            this.NotebookService.saveNotebookItem(this.item.id, this.item.nodeId, this.item.localNotebookItemId, this.item.type, this.item.title, this.item.content, this.item.content.clientSaveTime)
                .then(() => {
                    this.$mdDialog.hide();
                });
        });
    }

    update() {
        // notebook item has changed
        // set whether save button should be enabled
        let saveEnabled = false;
        if (this.item.content.text || this.item.content.attachments.length) {
            // note has text and/or attachments, so we can save
            saveEnabled = true;
        }
        this.saveEnabled = saveEnabled;

        this.setShowUpload();
    }

    setShowUpload() {
        this.showUpload = this.mode !== 'preview' && (this.item.content.attachments && this.item.content.attachments.length < 1);
    }
}

EditNotebookItemController.$inject = [
    "$mdDialog",
    "$q",
    "$injector",
    "$rootScope",
    "$scope",
    "$translate",
    "ConfigService",
    "NotebookService",
    "ProjectService",
    "StudentAssetService",
    "StudentDataService",
    "UtilService"
];

export default EditNotebookItemController;
