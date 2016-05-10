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
                type: "note", // the notebook item type, TODO: once questions are enabled, don't hard code
                nodeId: currentNodeId, // Id of the node this note was created on
                title: "Note from " + currentNodeTitle,  // Title of the node this note was created on
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
        return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
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
                        this.update();
                    });
                });
            }
        }
    }

    removeAttachment(attachment) {
        if (this.item.content.attachments.indexOf(attachment) != -1) {
            this.item.content.attachments.splice(this.item.content.attachments.indexOf(attachment), 1);
            this.update();
        }
    }

    update() {
        // update local notebook item
        this.item.content.clientSaveTime = Date.parse(new Date());  // set save timestamp
        this.onUpdate({item: this.item});
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
