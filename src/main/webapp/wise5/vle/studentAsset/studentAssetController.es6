'use strict';

class StudentAssetController {
  constructor(
      $filter,
      $injector,
      $rootScope,
      $scope,
      ConfigService,
      ProjectService,
      StudentAssetService) {
    this.$filter = $filter;
    this.$injector = $injector;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.ConfigService = ConfigService;
    this.mode = this.ConfigService.getMode();
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.$translate = this.$filter('translate');
    this.studentAssets = this.StudentAssetService.allAssets;
    this.itemId = null;
    this.item = null;

    this.logOutListener = $scope.$on('logOut', (event, args) => {
      this.logOutListener();
      this.$rootScope.$broadcast('componentDoneUnloading');
    });

    if (!this.ConfigService.isPreview()) {
      this.retrieveStudentAssets();
    }
  }

  getTemplateUrl() {
    return this.templateUrl;
  }

  retrieveStudentAssets() {
    this.StudentAssetService.retrieveAssets().then((studentAssets) => {
      this.studentAssets = studentAssets;
    });
  }

  // TODO can we ensure files is not null?
  uploadStudentAssets(files) {
    if (files != null) {
      for (const file of files) {
        this.StudentAssetService.uploadAsset(file).then((studentAsset) => {
          if (this.componentController != null) {
            // If the student asset dialog is a part of a component (e.g. attaching image to OR or Discussion)
            // Also attach the file(s) to the componentstate's attachments
            this.componentController.attachStudentAsset(studentAsset);
          }
          this.studentAssets = this.StudentAssetService.allAssets;
        });
      }
    }
  }

  deleteStudentAsset(studentAsset) {
    alert(this.$translate('deleteStudentAssetNotImplementedYet'));
  }

  attachStudentAssetToComponent($event, studentAsset) {
    if (this.componentController != null) {
      // If the student asset dialog is a part of a component (e.g. attaching image to OR or Discussion)
      // Also attach the file(s) to the componentstate's attachments
      this.componentController.attachStudentAsset(studentAsset);
      // TODO: add some kind of unobtrusive confirmation to let student know that the student asset has been added to current component
      $event.stopPropagation();  // prevents parent student asset list item from getting the onclick event so this item won't be re-selected.
    }
  }
}

StudentAssetController.$inject = [
  '$filter',
  '$injector',
  '$rootScope',
  '$scope',
  'ConfigService',
  'ProjectService',
  'StudentAssetService'
];

export default StudentAssetController;
