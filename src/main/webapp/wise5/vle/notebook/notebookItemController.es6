'use strict';

class NotebookItemController {

    constructor($injector,
                $rootScope,
                $scope,
                $translate,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentAssetService,
                StudentDataService) {
        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.mode = this.ConfigService.getMode();

        if (this.itemId == null) {
            let currentNodeId = this.StudentDataService.getCurrentNodeId();
            let currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);
            this.latestNotebookItemContentRevision = {
                text: "",
                attachments: []
            };

            this.item = {
                id: null,       // null id means we're creating a new notebook item.
                type: "note",
                nodeId: currentNodeId, // Id of the node this note was created on
                title: "Note on " + currentNodeTitle,  // Title of the node this note was created on
                content: []
            };
        } else {
            this.item = this.NotebookService.getNotebookItemById(this.itemId);
            this.latestNotebookItemContentRevision = {
                text: this.item.content.last().text,
                attachments: this.item.content.last().attachments
            };
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
     * Returns this NotebookItem's position and title.
     */
    getItemNodePositionAndTitle() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
        }
    }

    getTemplateUrl() {
        return this.templateUrl;
    }

    editNotebookItem() {
        // the actual closing of the dialog will be performed by the vleController.
        this.$rootScope.$broadcast('openNoteDialog', {notebookItem: this.item});
    }

    saveNotebookItem() {
        // add new notebook item content revision
        this.latestNotebookItemContentRevision.clientSaveTime = Date.parse(new Date());  // set save timestamp
        this.item.content.push(this.latestNotebookItemContentRevision)
        this.NotebookService.saveNotebookItem(this.item.id, this.item.nodeId, this.item.type, this.item.title, this.item.content)
            .then(() => {
                this.closeNoteDialog();
            });
    }

    closeNoteDialog() {
        // the actual closing of the dialog will be performed by the vleController.
        this.$rootScope.$broadcast('closeNoteDialog');
    }

    attachStudentAssetToNote(files) {
        if (files != null) {
            for (var f = 0; f < files.length; f++) {
                var file = files[f];
                this.StudentAssetService.uploadAsset(file).then((studentAsset) => {
                    this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
                        if (copiedAsset != null) {
                            var attachment = {
                                studentAssetId: copiedAsset.id,
                                iconURL: copiedAsset.iconURL
                            };

                            this.latestNotebookItemContentRevision.attachments.push(attachment);
                        }
                    });
                });
            }
        }
    }

    removeAttachment(attachment) {
        if (this.latestNotebookItemContentRevision.attachments.indexOf(attachment) != -1) {
            this.latestNotebookItemContentRevision.attachments.splice(this.latestNotebookItemContentRevision.attachments.indexOf(attachment), 1);
        }
    }
}

NotebookItemController.$inject = [
    "$injector",
    "$rootScope",
    "$scope",
    "$translate",
    "ConfigService",
    "NotebookService",
    "ProjectService",
    "StudentAssetService",
    "StudentDataService"
];

export default NotebookItemController;