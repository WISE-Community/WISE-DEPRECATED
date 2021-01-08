'use strict';

import { UtilService } from '../../services/utilService';
import { ConfigService } from '../../services/configService';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import * as $ from 'jquery';

class ProjectAssetController {
  $translate: any;
  projectId: number;
  projectAssets: any;
  projectAssetTotalSizeMax: any;
  projectAssetUsagePercentage: any;
  totalFileSize = 0;
  totalUnusedFilesSize = 0;
  unusedFilesPercentage = 0;
  isPopup = false;
  nodeId = null;
  componentId = null;
  target = null;
  targetObject = null;
  assetSortBy = 'aToZ';
  uploadSuccessMessage = '';
  successFiles: any;
  errorFiles: any;
  uploadErrorMessage: any;
  selectedAssetItem: any;
  previewAssetURL: string;
  assetIsImage: boolean;
  assetIsVideo: boolean;
  allowedFileTypes: string[] = ['any'];
  getProjectAssetsSubscription: any;
  getTotalFileSizeSubscription: any;
  getTotalUnusedFileSizeSubscription: any;

  static $inject = [
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

  constructor(
    $filter: any,
    private $mdDialog: any,
    private $rootScope: any,
    private $state: any,
    private $stateParams: any,
    private $scope: any,
    private $timeout: any,
    private ConfigService: ConfigService,
    private ProjectAssetService: ProjectAssetService,
    private UtilService: UtilService
  ) {
    this.$translate = $filter('translate');
    this.projectId = this.$stateParams.projectId;
    this.totalFileSize = 0;
    this.totalUnusedFilesSize = 0;
    this.unusedFilesPercentage = 0;

    if (this.$stateParams != null) {
      const stateParams = this.$stateParams;
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

      if (stateParams.allowedFileTypes != null) {
        this.allowedFileTypes = this.$stateParams.allowedFileTypes;
      }
    }

    this.getProjectAssetsSubscription = this.ProjectAssetService.getProjectAssets().subscribe(
      (projectAssets) => {
        if (projectAssets != null) {
          this.projectAssets = projectAssets;
          this.sortAssets(this.assetSortBy);
          this.projectAssetTotalSizeMax = this.ProjectAssetService.totalSizeMax;
        }
      }
    );

    this.getTotalFileSizeSubscription = this.ProjectAssetService.getTotalFileSize().subscribe(
      (totalFileSize) => {
        this.setTotalFileSize(totalFileSize);
      }
    );

    this.getTotalUnusedFileSizeSubscription = this.ProjectAssetService.getTotalUnusedFileSize().subscribe(
      (totalUnusedFilesSize) => {
        this.setTotalUnusedFilesSize(totalUnusedFilesSize);
      }
    );

    if (this.ProjectAssetService.isProjectAssetsAvailable()) {
      this.ProjectAssetService.calculateAssetUsage();
    }

    this.$scope.$on('$destroy', () => {
      this.unsubscribeAll();
    });
  }

  unsubscribeAll() {
    this.getProjectAssetsSubscription.unsubscribe();
    this.getTotalFileSizeSubscription.unsubscribe();
    this.getTotalUnusedFileSizeSubscription.unsubscribe();
  }

  assetSortByChanged() {
    this.sortAssets(this.assetSortBy);
  }

  sortAssets(sortBy) {
    if (sortBy === 'aToZ') {
      this.projectAssets.files.sort(this.sortAssetsAToZ);
    } else if (sortBy === 'zToA') {
      this.projectAssets.files = this.projectAssets.files.sort(this.sortAssetsAToZ).reverse();
    } else if (sortBy === 'smallToLarge') {
      this.projectAssets.files.sort(this.sortAssetsSmallToLarge);
    } else if (sortBy === 'largeToSmall') {
      this.projectAssets.files = this.projectAssets.files
        .sort(this.sortAssetsSmallToLarge)
        .reverse();
    }
  }

  sortAssetsAToZ(a, b) {
    const aFileName = a.fileName.toLowerCase();
    const bFileName = b.fileName.toLowerCase();
    if (aFileName < bFileName) {
      return -1;
    } else if (aFileName > bFileName) {
      return 1;
    }
    return 0;
  }

  sortAssetsSmallToLarge(a, b) {
    const aFileSize = a.fileSize;
    const bFileSize = b.fileSize;
    if (aFileSize < bFileSize) {
      return -1;
    } else if (aFileSize > bFileSize) {
      return 1;
    }
    return 0;
  }

  /**
   * Delete an asset from the project after confirming with the user
   * @param assetItem the asset to delete
   */
  deleteAsset(assetItem) {
    const message = `${this.$translate('areYouSureYouWantToDeleteThisFile')}\n\n${
      assetItem.fileName
    }`;
    if (confirm(message)) {
      this.ProjectAssetService.deleteAssetItem(assetItem);
    }
  }

  downloadAsset(assetItem) {
    this.ProjectAssetService.downloadAssetItem(assetItem);
  }

  chooseAsset(assetItem) {
    const params = {
      assetItem: assetItem,
      projectId: this.projectId,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: this.target,
      targetObject: this.targetObject
    };
    this.$mdDialog.hide(params);
  }

  /**
   * Upload all the small files. If there are any large files, we will confirm with the author
   * that they want to upload those files.
   * @param files An array of file objects.
   */
  uploadAssetItems(files) {
    let performUploadOfAllFiles = true;
    const largeAndSmallFiles = this.separateLargeAndSmallFiles(files);
    const largeFiles = largeAndSmallFiles.largeFiles;
    const smallFiles = largeAndSmallFiles.smallFiles;
    if (largeFiles.length > 0) {
      performUploadOfAllFiles = confirm(this.getLargeFileMessage(files, largeFiles));
    }
    if (performUploadOfAllFiles) {
      this.uploadAssets(files);
    } else if (smallFiles.length > 0) {
      this.uploadAssets(smallFiles);
    }
  }

  separateLargeAndSmallFiles(files) {
    const largeFiles = [];
    const smallFiles = [];
    for (const file of files) {
      if (this.isFileLarge(file)) {
        largeFiles.push(file);
      } else {
        smallFiles.push(file);
      }
    }
    return { largeFiles: largeFiles, smallFiles: smallFiles };
  }

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
    let message = ``;
    if (files.length == 1 && largeFiles.length == 1) {
      message = `${this.$translate('areYouSureYouWantToUploadThisLargeFile')}\n`;
    } else if (largeFiles.length == 1) {
      message = `${this.$translate(
        'areYouSureYouWantToUploadThisLargeFileWhileUploadingMultipleFiles'
      )}\n`;
    } else if (largeFiles.length > 1) {
      message = `${this.$translate(
        'areYouSureYouWantToUploadTheseLargeFilesWhileUploadingMultipleFiles',
        { fileCount: largeFiles.length }
      )}\n`;
    }
    for (const largeFile of largeFiles) {
      message += `\n${largeFile.name} (${Math.floor(largeFile.size / 1000)} KB)`;
    }
    return message;
  }

  uploadAssets(files) {
    this.ProjectAssetService.uploadAssets(files).subscribe(
      ({ success, error, assetDirectoryInfo }) => {
        if (success.length > 0) {
          this.showUploadedFiles(success);
        }
        if (error.length > 0) {
          this.showError(error);
        }
        this.projectAssets = assetDirectoryInfo;
        if (this.hasTarget()) {
          this.chooseAsset({ fileName: files[0].name, fileSize: files[0].size });
        }
      }
    );
  }

  showUploadedFiles(uploadedFiles) {
    this.successFiles = uploadedFiles;
    this.uploadSuccessMessage = this.$translate('assetUploadSuccessful');
    this.$timeout(() => {
      this.uploadSuccessMessage = '';
      this.successFiles = [];
    }, 7000);
  }

  showError(error) {
    this.errorFiles = error;
    this.uploadErrorMessage = this.$translate('assetUploadError');
    this.$timeout(() => {
      this.uploadErrorMessage = '';
      this.errorFiles = [];
    }, 7000);
  }

  hasTarget() {
    return (
      (this.nodeId != null && this.componentId != null && this.target != null) ||
      this.target === 'projectIcon'
    );
  }

  previewAsset($event, assetItem) {
    this.selectedAssetItem = assetItem;
    const assetFileName = assetItem.fileName;
    const assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    this.previewAssetURL = `${assetsDirectoryPath}/${assetFileName}`;
    this.assetIsImage = false;
    this.assetIsVideo = false;
    if (this.UtilService.isImage(assetFileName)) {
      this.assetIsImage = true;
    } else if (this.UtilService.isVideo(assetFileName)) {
      this.assetIsVideo = true;
      $('video').load(this.previewAssetURL);
    }
  }

  exit() {
    if (this.isPopup) {
      this.$mdDialog.hide();
    } else {
      this.$state.go('root.at.project', { projectId: this.projectId });
    }
  }

  setTotalFileSize(totalFileSize) {
    this.totalFileSize = totalFileSize;
    this.projectAssetUsagePercentage = this.ProjectAssetService.getAssetUsagePercentage();
  }

  setTotalUnusedFilesSize(totalUnusedFilesSize) {
    this.totalUnusedFilesSize = totalUnusedFilesSize;
    this.unusedFilesPercentage = this.ProjectAssetService.getAssetUnusedPercentage();
  }
}

export default ProjectAssetController;
