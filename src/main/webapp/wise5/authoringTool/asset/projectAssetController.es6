'use strict';

class ProjectAssetController {

  constructor(
      $filter,
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
    this.isPopup = false;

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
      if (stateParams.isPopup != null) {
        this.isPopup = true;
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

    // sort assets alphabetically at the beginning
    this.assetSortBy = 'aToZ';
    this.assetMessage = '';

    this.$scope.$watch(() => {
          return this.projectAssets;
        }, () => {
          this.projectAssetUsagePercentage =
              this.projectAssets.totalFileSize / this.projectAssetTotalSizeMax * 100;
          this.sortAssets(this.assetSortBy);
        }
    );

    // when the user changes the sort assets by field, also nperform the sort
    this.$scope.$watch(() => {
        return this.assetSortBy;
      }, () => {
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
      this.projectAssets.files =
          files.sort(this.sortAssetsSmallToLarge).reverse();
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
    if (confirm(deleteConfirmMessage)) {
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
   * The user has chosen an asset to use, so notify listeners
   * @param assetItem the asset the user chose
   */
  chooseAsset(assetItem) {
    let params = {
      "assetItem": assetItem,
      "projectId": this.projectId,
      "nodeId": this.nodeId,
      "componentId": this.componentId,
      "target": this.target,
      "targetObject": this.targetObject
    };
    this.$rootScope.$broadcast('assetSelected', params);
  }

  /**
   * Upload all the small files. If there are any large files, we will confirm with the author
   * that they want to upload those files.
   * @param files An array of file objects.
   */
  uploadAssetItems(files) {
    let performUploadOfAllFiles = true;
    let largeAndSmallFiles = this.separateLargeAndSmallFiles(files);
    let largeFiles = largeAndSmallFiles.largeFiles;
    let smallFiles = largeAndSmallFiles.smallFiles;
    if (largeFiles.length > 0) {
      performUploadOfAllFiles = confirm(this.getLargeFileMessage(files, largeFiles));
    }
    if (performUploadOfAllFiles) {
      this.uploadAssets(files);
    } else if (smallFiles.length > 0) {
      this.uploadAssets(smallFiles);
    }
  }

  /**
   * @param files An array of file objects.
   * @returns {Object} An object that contains an array of large files and an array
   * of small files.
   */
  separateLargeAndSmallFiles(files) {
    let largeFiles = [];
    let smallFiles = [];
    for (let file of files) {
      if (this.isFileLarge(file)) {
        largeFiles.push(file);
      } else {
        smallFiles.push(file);
      }
    }
    return { largeFiles: largeFiles, smallFiles: smallFiles };
  }

  /**
   * @param file A file object.
   * @returns {boolean} Whether the file is larger than 500 KB.
   */
  isFileLarge(file) {
    return file.size > 500000;
  }

  /**
   * Get the confirm message to display to the author because they are trying
   * to upload at least one large file.
   * @param files All the files they are trying to upload.
   * @param largeFiles All the large files they are trying to upload.
   * @returns {string} The message to show to the author.
   */
  getLargeFileMessage(files, largeFiles) {
    let message = '';
    if (files.length == 1 && largeFiles.length == 1) {
      message = this.$translate('areYouSureYouWantToUploadThisLargeFile') + '\n';
    } else if (largeFiles.length == 1) {
      message = this.$translate('areYouSureYouWantToUploadThisLargeFileWhileUploadingMultipleFiles') + '\n';
    } else if (largeFiles.length > 1) {
      message = this.$translate('areYouSureYouWantToUploadTheseLargeFilesWhileUploadingMultipleFiles', { fileCount: largeFiles.length }) + '\n';
    }
    for (let largeFile of largeFiles) {
      message += '\n' + largeFile.name + ' (' + Math.floor(largeFile.size / 1000) + ' KB)';
    }
    return message;
  }

  /**
   * @param files An array of file objects.
   */
  uploadAssets(files) {
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
      if (this.hasTarget()) {
        const assetItem = {
          fileName: files[0].name,
          fileSize: files[0].size
        };
        this.chooseAsset(assetItem);
      }
    });
  }

  hasTarget() {
    return (this.nodeId != null && this.componentId != null && this.target != null) || this.target === 'projectIcon';
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
   * Exits the asset view. If this was opened in a popup, closes the
   * popup and reveal the activity below.
   */
  exit() {
    if (this.isPopup) {
      this.$mdDialog.hide();
    } else {
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
