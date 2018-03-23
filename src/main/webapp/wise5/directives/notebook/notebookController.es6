'use strict';

class NotebookController {
  constructor($injector,
              $rootScope,
              $scope,
              $filter,
              ConfigService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService) {
    this.$injector = $injector;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$filter = $filter;
    this.ConfigService = ConfigService;
    this.mode = this.ConfigService.getMode();
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.$translate = this.$filter('translate');
    this.notebook = null;
    this.itemId = null;
    this.item = null;
    this.notebookConfig = this.NotebookService.config;

    $scope.$on('notebookUpdated', (event, args) => {
      this.notebook = args.notebook;
    });

    this.logOutListener = $scope.$on('logOut', (event, args) => {
      this.logOutListener();
      this.$rootScope.$broadcast('componentDoneUnloading');
    });

    // by this time, the notebook and student assets have been retrieved.
    this.notebook = this.NotebookService.getNotebookByWorkgroup(this.workgroupId);
  }

  getTemplateUrl() {
    return this.templateUrl;
  }

  deleteStudentAsset(studentAsset) {
    alert(this.$translate('deleteStudentAssetFromNotebookNotImplementedYet'));
  }

  deleteItem(ev, itemId) {
    this.$rootScope.$broadcast('deleteNote', {itemId: itemId, ev: ev});
  }

  editItem(ev, itemId) {
    this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
  }

  reviveItem(ev, itemId) {
    this.$rootScope.$broadcast('reviveNote', {itemId: itemId, ev: ev});
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

  getNotebook() {
    return this.notebook;
  }

  getNotes() {
    let notes = [];
    let notebookItems = this.getNotebook().items;
    for (let notebookItemKey in notebookItems) {
      let notebookItem = notebookItems[notebookItemKey];
      if (notebookItem.last().type === 'note') {
        notes.push(notebookItem);
      }
    }
    return notes;
  }
}

NotebookController.$inject = [
  "$injector",
  "$rootScope",
  "$scope",
  "$filter",
  "ConfigService",
  "NotebookService",
  "ProjectService",
  "StudentAssetService",
  "StudentDataService"
];

export default NotebookController;
