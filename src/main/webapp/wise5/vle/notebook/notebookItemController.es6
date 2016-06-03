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
                localNotebookItemId: this.UtilService.generateKey(10),   // Id that is common across the same notebook item revisions.
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

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.notebookConfig.itemTypes[this.type].label;

        if ($scope.$parent.file != null) {
            // student is trying to add a file to this notebook item.
            var files = [$scope.$parent.file];  // put the file into an array

            this.attachStudentAssetToNote(files);
        }

        this.showUpload = this.mode !== 'preview' && (this.item.content.attachments != null && !this.item.content.attachments.length);
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
        return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
    }

    doSelect(ev) {
        if (this.onSelect) {
            this.onSelect({$ev: ev, $itemId: this.item.localNotebookItemId});
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

    delete(ev) {
        // TODO: add archiving/deleting notebook items
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
