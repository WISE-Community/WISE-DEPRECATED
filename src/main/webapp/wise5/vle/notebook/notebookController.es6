'use strict';

class NotebookController {

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
        this.mode = this.ConfigService.getMode();
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        this.notebook = null;
        this.itemId = null;
        this.item = null;
        this.notebookConfig = this.NotebookService.config;

        $scope.$on('notebookUpdated', (event, args) => {
            this.notebook = args.notebook;
        });
        //this.notebook = this.NotebookService.notebook;

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
    }

    retrieveNotebookItems() {
        // fetch all assets first because a subset of it will be referenced by a notebook item
        this.StudentAssetService.retrieveAssets().then((studentAssets) => {
            this.NotebookService.retrieveNotebookItems().then((notebook) => {
                this.notebook = notebook;
            });
        });
    }

    deleteStudentAsset(studentAsset) {
        alert('delete student asset from note book not implemented yet');
        /*
         StudentAssetService.deleteAsset(studentAsset).then(angular.bind(this, function(deletedStudentAsset) {
         // remove studentAsset
         this.studentAssets.splice(this.studentAssets.indexOf(deletedStudentAsset), 1);
         this.calculateTotalUsage();
         }));
         */
    }

    deleteItem(item) {
        this.NotebookService.deleteItem(item);
    }

    editItem(ev, itemId) {
        //this.NotebookService.editItem(ev, itemId);
        this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
    }

    notebookItemSelected($event, notebookItem) {
        this.selectedNotebookItem = notebookItem;
    }

    attachNotebookItemToComponent($event, notebookItem) {
        this.componentController.attachNotebookItemToComponent(notebookItem);
        this.selectedNotebookItem = null;  // reset selected notebook item
        // TODO: add some kind of unobtrusive confirmation to let student know that the notebook item has been added to current component
        $event.stopPropagation();  // prevents parent notebook list item from getting the onclick event so this item won't be re-selected.
    }
}

NotebookController.$inject = [
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

export default NotebookController;
