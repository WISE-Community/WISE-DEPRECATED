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
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;

        // whether the asset page is being displayed in a popup
        this.popup = false;
        this.nodeId = null;
        this.componentId = null;

        if (this.$stateParams != null) {
            if (this.$stateParams.popup) {
                // this asset page is being displayed in a popup
                this.popup = true;
            }

            if (this.$stateParams.nodeId) {
                // get the node id that opened this popup
                this.nodeId = this.$stateParams.nodeId;
            }

            if (this.$stateParams.componentId) {
                // get the component id that opened this popup
                this.componentId = this.$stateParams.componentId;
            }
        }

        this.assetSortBy = "aToZ";  // initially sort assets alphabetically
        this.assetMessage = "";

        this.$scope.$watch(
            () => {
                return this.projectAssets;
            },
            () => {
                this.projectAssetUsagePercentage = this.projectAssets.totalFileSize / this.projectAssetTotalSizeMax * 100;
                this.sortAssets(this.assetSortBy);  // make sure the assets are sorted by current sort field
            }
        );

        // When user changes sort assets by
        this.$scope.$watch(
            () => {
                return this.assetSortBy;
            },
            () => {
                this.sortAssets(this.assetSortBy);
            }
        );
    }

    sortAssets(sortBy) {
        if (sortBy === "aToZ") {
            this.projectAssets.files.sort(this.sortAssetsAToZ);
        } else if (sortBy === "zToA") {
            let files = this.projectAssets.files;
            this.projectAssets.files = files.sort(this.sortAssetsAToZ).reverse();
        } else if (sortBy === "smallToLarge") {
            this.projectAssets.files.sort(this.sortAssetsSmallToLarge);
        } else if (sortBy === "largeToSmall") {
            let files = this.projectAssets.files;
            this.projectAssets.files = files.sort(this.sortAssetsSmallToLarge).reverse();
        }
    };

    sortAssetsAToZ(a, b) {
        var aFileName = a.fileName.toLowerCase();
        var bFileName = b.fileName.toLowerCase();
        var result = 0;

        if (aFileName < bFileName) {
            result = -1;
        } else if (aFileName > bFileName) {
            result = 1;
        }
        return result;
    };

    sortAssetsSmallToLarge(a, b) {
        var aFileSize = a.fileSize;
        var bFileSize = b.fileSize;
        var result = 0;

        if (aFileSize < bFileSize) {
            result = -1;
        } else if (aFileSize > bFileSize) {
            result = 1;
        }
        return result;
    }

    /**
     * Delete an asset from the project
     * @param assetItem the asset to delete
     */
    deleteAsset(assetItem) {

        // ask the user if they are sure they want to delete the file
        var message = this.$translate("areYouSureYouWantToDeleteThisFile") + "\n\n" + assetItem.fileName;
        var answer = confirm(message);

        if (answer) {
            // the user answered yes to delete the file
            this.ProjectAssetService.deleteAssetItem(assetItem).then((newProjectAssets) => {
                this.projectAssets = this.ProjectAssetService.projectAssets;
            });
        }
    }

    /**
     * Show asset image in a popup dialog and give author an option to delete it.
     */
    viewAsset(assetItem) {
        // Append dialog to document.body
        let assetFullURL = this.ProjectAssetService.getFullAssetItemURL(assetItem);
        let appropriateFileSize = this.$filter('appropriateSizeText')(assetItem.fileSize);
        let confirm = this.$mdDialog.confirm()
            .parent(angular.element(document.body))
            .title(assetItem.fileName + " (" + appropriateFileSize + ")")
            .htmlContent("<img src=\"" + assetFullURL + "\" />")
            .ok(this.$translate('CLOSE'))
        this.$mdDialog.show(confirm).then(() => {
            // Author wants to simply close the dialog
        }, () => {
            // Author wants to simply close the dialog
        });
    }

    /**
     * The user has chosen an asset to use
     * @param assetItem the asset the user chose
     */
    chooseAsset(assetItem) {
        // fire the event to notify listeners that an asset was selected
        var params = {
            assetItem: assetItem,
            nodeId: this.nodeId,
            componentId: this.componentId
        };
        this.$rootScope.$broadcast('assetSelected', params);
    }

    uploadAssetItems(files) {
        this.ProjectAssetService.uploadAssets(files).then((uploadAssetsResults) => {
            if (uploadAssetsResults && uploadAssetsResults.length > 0) {
                let uploadedAssetsFilenames = [];
                for (var r = 0; r < uploadAssetsResults.length; r++) {
                    let uploadAssetsResult = uploadAssetsResults[r];
                    if (typeof uploadAssetsResult.data === 'string') {
                        // there was an error uploading this file, so don't add
                    } else {
                        uploadedAssetsFilenames.push(uploadAssetsResult.config.file.name);
                    }
                }
                if (uploadedAssetsFilenames.length > 0) {
                    // show a confirmation message for 7 seconds
                    this.assetMessage = this.$translate('assetUploadSuccessful', { assetFilenames: uploadedAssetsFilenames.join(", ") });
                    this.$timeout(() => {
                        this.assetMessage = "";
                    }, 7000);
                }
            }
            this.projectAssets = this.ProjectAssetService.projectAssets;
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

            // get the file name
            var fileName = assetItem.fileName;

            // get the project assets directory path
            var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();

            // get the absolute path to the asset file
            var absolutePath = assetsDirectoryPath + '/' + fileName;

            // set the url of the asset so we can preview it
            this.previewAssetURL = absolutePath;

            // clear these flags
            this.assetIsImage = false;
            this.assetIsVideo = false;

            if (this.UtilService.isImage(fileName)) {
                // the asset in an image
                this.assetIsImage = true;
            } else if(this.UtilService.isVideo(fileName)) {
                // the asset is a video
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
