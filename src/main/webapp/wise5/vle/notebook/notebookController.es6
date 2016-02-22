'use strict';

class NotebookController {
    constructor($injector,
                $rootScope,
                $scope,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentAssetService,
                StudentDataService) {
        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.mode = this.ConfigService.getMode();
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        this.notebook = null;
        this.itemId = null;
        this.item = null;

        $scope.$on('notebookUpdated', (event, args) => {
            this.notebook = args.notebook;
        });

        this.logOutListener = $scope.$on('logOut', (event, args) => {
            this.logOutListener();
            this.$rootScope.$broadcast('componentDoneUnloading');
        });

        // retrieve assets when notebook is opened
        if (!this.ConfigService.isPreview()) {
            this.retrieveNotebookItems();
        }
    }

    getTemplateUrl() {
        return this.templateUrl;
    };

    retrieveNotebookItems() {
        // fetch all assets first because a subset of it will be referenced by a notebook item
        this.StudentAssetService.retrieveAssets().then((studentAssets) => {
            this.NotebookService.retrieveNotebookItems().then((notebook) => {
                this.notebook = notebook;
            });
        });
    };

    attachStudentAssetToNewNote(files) {
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

                            this.newNote.content.attachments.push(attachment);
                        }
                    });
                });
            }
        }
    };

    removeAttachment(attachment) {
        if (this.newNote.content.attachments.indexOf(attachment) != -1) {
            this.newNote.content.attachments.splice(this.newNote.content.attachments.indexOf(attachment), 1);
        }
    };

    deleteStudentAsset(studentAsset) {
        alert('delete student asset from note book not implemented yet');
        /*
         StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
         // remove studentAsset
         this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
         this.calculateTotalUsage();
         }));
         */
    };

    deleteItem(item) {
        this.NotebookService.deleteItem(item);
    };

    notebookItemSelected($event, notebookItem) {
        this.selectedNotebookItem = notebookItem;
    };

    attachNotebookItemToComponent($event, notebookItem) {
        this.componentController.attachNotebookItemToComponent(notebookItem);
        this.selectedNotebookItem = null;  // reset selected notebook item
        // TODO: add some kind of unobtrusive confirmation to let student know that the notebook item has been added to current component
        $event.stopPropagation();  // prevents parent notebook list item from getting the onclick event so this item won't be re-selected.
    };

    notebookItemDragStartCallback(event, ui, notebookItem) {
        //$(ui.helper.context).data('objectType', 'NotebookItem');
        //$(ui.helper.context).data('objectData', notebookItem);
    };

    myWorkDragStartCallback(event, ui, nodeId, nodeType) {
        //$(ui.helper.context).data('importType', 'NodeState');
        //$(ui.helper.context).data('importWorkNodeState', StudentDataService.getLatestNodeStateByNodeId(nodeId));
        //$(ui.helper.context).data('importWorkNodeType', nodeType);
    };

    showStudentWorkByNodeId(nodeId, nodeType) {
        var result = null;

        if (nodeId != null && nodeType != null) {
            var childService = this.$injector.get(nodeType + 'Service');

            if (childService != null) {
                var latestNodeState = this.StudentDataService.getLatestNodeStateByNodeId(nodeId);
                var studentWorkHTML = this.childService.getStudentWorkAsHTML(latestNodeState);
                result = studentWorkHTML;
            }
        }
        return result;
    };

    showAddNote() {
        // setting this will show the add note div
        let currentNodeId = this.StudentDataService.getCurrentNodeId();
        let currentNodeTitle = this.ProjectService.getNodeTitleByNodeId(currentNodeId);
        this.newNote = {
            type: "note",
            nodeId: currentNodeId, // Id of the node this note was created on
            title: "Note on " + currentNodeTitle,  // Title of the node this note was created on
            content: {
                text: "Type your note here...",
                attachments: []
            }
        };
    }

    cancelAddNote() {
        this.newNote = null; // this will hide the add note div
    }

    addNote() {
        let newNoteContent = {
            text: this.newNote.content.text,
            attachments: this.newNote.content.attachments
        };
        this.NotebookService.saveNotebookItem(this.newNote.nodeId, this.newNote.type, this.newNote.title, newNoteContent)
            .then(() => {
                this.newNote = null; // this will hide the add note div
            });
    }

    addBookmark() {
        // TODO: implement me
        this.newNote = null; // this will hide the add note div
    };

    addQuestion() {
        // TODO: implement me
        this.newNote = null; // this will hide the add note div
    };
}

NotebookController.$inject = [
    "$injector",
    "$rootScope",
    "$scope",
    "ConfigService",
    "NotebookService",
    "ProjectService",
    "StudentAssetService",
    "StudentDataService"
];

export default NotebookController;