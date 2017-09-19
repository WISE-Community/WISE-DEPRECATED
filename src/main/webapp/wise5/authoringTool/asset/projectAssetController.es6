'use strict';

class ProjectAssetController {

  constructor($filter,
        $mdDialog,
        $rootScope,
        $state,
        $stateParams,
        $scope,
        $timeout,
        ConfigService,
        ProjectAssetService,
        UtilService) {
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.ConfigService = ConfigService;
    this.ProjectAssetService = ProjectAssetService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');

    this.projectId = this.$stateParams.projectId;
    this.projectAssets = ProjectAssetService.projectAssets;
    this.projectAssetTotalSizeMax =
        ProjectAssetService.projectAssetTotalSizeMax;
    this.projectAssetUsagePercentage =
        ProjectAssetService.projectAssetUsagePercentage;

    // the amount of space the unused files use
    this.totalUnusedFilesSize = 0;

    /*
     * the amount of space the unused files use as a percentage of the
     * total amount of allowed space for the project
     */
    this.unusedFilesPercentage = 0;

    // whether the asset page is being displayed in a popup
    this.popup = false;

    // the project id that opened this popup
    this.projectId = null;

    // the node id that opened this popup
    this.nodeId = null;

    // the component id that opened this popup
    this.componentId = null;

    // the target to put the asset in
    this.target = null;

    // the target object to put the asset in
    this.targetObject = null;

    if (this.$stateParams != null) {
      let stateParams = this.$stateParams;
      if (stateParams.popup != null) {
        this.popup = true;
      }

      if (stateParams.projectId != null) {
        this.projectId = stateParams.projectId;
      }

      if (stateParams.nodeId != null) {
        this.nodeId = stateParams.nodeId;
      }

      if (stateParams.componentId != null) {
        this.componentId = stateParams.componentId;
      }

      if (stateParams.target != null) {
        this.target = stateParams.target;
      }

      if (stateParams.targetObject != null) {
        this.targetObject = stateParams.targetObject;
      }
    }

    // initially, sort assets alphabetically
    this.assetSortBy = 'aToZ';
    this.assetMessage = '';

    this.$scope.$watch(
        () => {
          return this.projectAssets;
        },
        () => {
          this.projectAssetUsagePercentage =
              this.projectAssets.totalFileSize / this.projectAssetTotalSizeMax * 100;
          this.sortAssets(this.assetSortBy);
        }
    );

    // when the user changes the sort assets by field, also nperform the sort
    this.$scope.$watch(
      () => {
        return this.assetSortBy;
      },
      () => {
        this.sortAssets(this.assetSortBy);
      }
    );

    // calculate whether the assets are used in the project
    this.ProjectAssetService.calculateAssetUsage()
        .then((totalUnusedFilesSize) => {
      this.setTotalUnusedFilesSize(totalUnusedFilesSize);
    });
  }

  sortAssets(sortBy) {
    if (sortBy === 'aToZ') {
      this.projectAssets.files.sort(this.sortAssetsAToZ);
    } else if (sortBy === 'zToA') {
      let files = this.projectAssets.files;
      this.projectAssets.files = files.sort(this.sortAssetsAToZ).reverse();
    } else if (sortBy === 'smallToLarge') {
      this.projectAssets.files.sort(this.sortAssetsSmallToLarge);
    } else if (sortBy === 'largeToSmall') {
      let files = this.projectAssets.files;
      this.projectAssets.files = files.sort(this.sortAssetsSmallToLarge).reverse();
    }
  };

  sortAssetsAToZ(a, b) {
    let aFileName = a.fileName.toLowerCase();
    let bFileName = b.fileName.toLowerCase();
    let result = 0;

    if (aFileName < bFileName) {
      result = -1;
    } else if (aFileName > bFileName) {
      result = 1;
    }
    return result;
  };

  sortAssetsSmallToLarge(a, b) {
    let aFileSize = a.fileSize;
    let bFileSize = b.fileSize;
    let result = 0;

    if (aFileSize < bFileSize) {
      result = -1;
    } else if (aFileSize > bFileSize) {
      result = 1;
    }
    return result;
  }

  /**
   * Delete an asset from the project after confirming with the user
   * @param assetItem the asset to delete
   */
  deleteAsset(assetItem) {
    let deleteConfirmMessage =
      this.$translate('areYouSureYouWantToDeleteThisFile')
      + '\n\n' + assetItem.fileName;
    let doDelete = confirm(deleteConfirmMessage);
    if (doDelete) {
      this.ProjectAssetService.deleteAssetItem(assetItem)
        .then((newProjectAssets) => {
        this.projectAssets = this.ProjectAssetService.projectAssets;
        // calculate whether the assets are used in the project
        this.ProjectAssetService.calculateAssetUsage()
          .then((totalUnusedFilesSize) => {
        this.setTotalUnusedFilesSize(totalUnusedFilesSize);
        });
      });
    }
  }

  downloadAsset(assetItem) {
    this.ProjectAssetService.downloadAssetItem(assetItem);
  }

  /**
   * Show asset image in a popup dialog and give author an option to delete it.
   */
  viewAsset(assetItem) {
    // Append dialog to document.body
    let assetFullURL = this.ProjectAssetService.getFullAssetItemURL(assetItem);
    let appropriateFileSize =
        this.$filter('appropriateSizeText')(assetItem.fileSize);
    let confirm = this.$mdDialog.confirm()
      .parent(angular.element(document.body))
      .title(assetItem.fileName + ' (' + appropriateFileSize + ')')
      .htmlContent('<img src="' + assetFullURL + '" />')
      .ok(this.$translate('CLOSE'))
    this.$mdDialog.show(confirm).then(() => {
      // Author wants to simply close the dialog
    }, () => {
      // Author wants to simply close the dialog
    });
  }

  /**
   * The user has chosen an asset to use, so notify listeners
   * @param assetItem the asset the user chose
   */
  chooseAsset(assetItem) {
    let params = {
      assetItem: assetItem,
      projectId: this.projectId,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: this.target,
      targetObject: this.targetObject
    };
    this.$rootScope.$broadcast('assetSelected', params);
  }

  uploadAssetItems(files) {
    this.ProjectAssetService.uploadAssets(files).then((uploadAssetsResults) => {
      if (uploadAssetsResults && uploadAssetsResults.length > 0) {
        let uploadedAssetsFilenames = [];
        for (let uploadAssetsResult of uploadAssetsResults) {
          if (typeof uploadAssetsResult.data === 'string') {
            // there was an error uploading this file, so don't add
          } else {
            uploadedAssetsFilenames.push(uploadAssetsResult.config.file.name);
          }
        }
        if (uploadedAssetsFilenames.length > 0) {
          // show which files were uploaded for 7 seconds
          this.assetMessage = this.$translate('assetUploadSuccessful',
              { assetFilenames: uploadedAssetsFilenames.join(', ') });
          this.$timeout(() => {
            this.assetMessage = '';
          }, 7000);
        }
      }
      this.projectAssets = this.ProjectAssetService.projectAssets;
      // calculate whether the assets are used in the project
      this.ProjectAssetService.calculateAssetUsage()
          .then((totalUnusedFilesSize) => {
        this.setTotalUnusedFilesSize(totalUnusedFilesSize);
      });
    });
  }

  /**
   * Preview an asset in the right panel
   * @param $event The event that caused the asset to be previewed. This will
   * either be a mouseover or click event.
   * @param assetItem the asset item to preview
   */
  previewAsset($event, assetItem) {
    if (assetItem != null) {
      this.selectedAssetItem = assetItem;
      let assetFileName = assetItem.fileName;
      let assetsDirectoryPath =
          this.ConfigService.getProjectAssetsDirectoryPath();

      // set the url of the asset so we can preview it
      this.previewAssetURL = assetsDirectoryPath + '/' + assetFileName;

      // clear these flags
      this.assetIsImage = false;
      this.assetIsVideo = false;

      if (this.UtilService.isImage(assetFileName)) {
        this.assetIsImage = true;
      } else if(this.UtilService.isVideo(assetFileName)) {
        this.assetIsVideo = true;
        $('video').load();
      }
    }
  }

  /**
   * Close the asset view
   */
  exit() {
    if (this.popup) {
      // this asset view was opened in a popup
      this.$mdDialog.hide();
    } else {
      // this asset view was opened as a page
      this.$state.go('root.project', {projectId: this.projectId});
    }
  }

  /**
   * Set the total amount of space the unused files use
   * @param totalUnusedFilesSize the total amount of space the unused files
   * use
   */
  setTotalUnusedFilesSize(totalUnusedFilesSize) {
    // set the total amount of space the unused files use
    this.totalUnusedFilesSize = totalUnusedFilesSize;

    /*
     * calculate the amount of space the unused files use as a
     * percentage of the total amount of allowed space for the project
     */
    this.unusedFilesPercentage =
        this.totalUnusedFilesSize / this.projectAssetTotalSizeMax * 100;
  }
}

ProjectAssetController.$inject = [
  '$filter',
  '$mdDialog',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  '$timeout',
  'ConfigService',
  'ProjectAssetService',
  'UtilService'
];

export default ProjectAssetController;
