'use strict';

import { ConfigService } from '../../services/configService';
import { StudentAssetService } from '../../services/studentAssetService';
import { SessionService } from '../../services/sessionService';

class StudentAssetController {
  $translate: any;
  componentController: any;
  item: any;
  itemId: string;
  logOutListener: any;
  mode: string;
  studentAssets: any;
  templateUrl: string;

  static $inject = [
    '$filter',
    '$rootScope',
    '$scope',
    'ConfigService',
    'SessionService',
    'StudentAssetService'
  ];

  constructor(
    $filter: any,
    private $rootScope: any,
    $scope: any,
    private ConfigService: ConfigService,
    private SessionService: SessionService,
    private StudentAssetService: StudentAssetService
  ) {
    this.$rootScope = $rootScope;
    this.mode = this.ConfigService.getMode();
    this.SessionService = SessionService;
    this.StudentAssetService = StudentAssetService;
    this.$translate = $filter('translate');
    this.studentAssets = this.StudentAssetService.allAssets;
    this.itemId = null;
    this.item = null;

    this.SessionService.logOut$.subscribe(() => {
      this.logOutListener();
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
      $event.stopPropagation(); // prevents parent student asset list item from getting the onclick event so this item won't be re-selected.
    }
  }
}

export default StudentAssetController;
