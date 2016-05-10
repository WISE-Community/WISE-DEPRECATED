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
                StudentDataService,
                UtilService) {
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
                id: null,       // null id means we're creating a new notebook item.
                localNotebookItemId: this.UtilService.generateKey(10),   // this is the id that is common across the same notebook item revisions.
                type: "note",
                nodeId: currentNodeId, // Id of the node this note was created on
                title: "Note on " + currentNodeTitle,  // Title of the node this note was created on
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
        // add new notebook item
        this.item.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
        this.NotebookService.saveNotebookItem(this.item.id, this.item.nodeId, this.item.localNotebookItemId, this.item.type, this.item.title, this.item.content)
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

                            this.item.content.attachments.push(attachment);
                        }
                    });
                });
            }
        }
    }

    removeAttachment(attachment) {
        if (this.item.content.attachments.indexOf(attachment) != -1) {
            this.item.content.attachments.splice(this.item.content.attachments.indexOf(attachment), 1);
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
    "StudentDataService",
    "UtilService"
];

export default NotebookItemController;