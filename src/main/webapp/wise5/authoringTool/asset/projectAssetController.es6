'use strict';

class ProjectAssetController {

    constructor($state, $stateParams, $scope, $timeout, $translate, ProjectAssetService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.projectId = this.$stateParams.projectId;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;


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
    };

    deleteAsset(assetItem) {
        this.ProjectAssetService.deleteAssetItem(assetItem).then((newProjectAssets) => {
            this.projectAssets = this.ProjectAssetService.projectAssets;
        });
    }

    uploadAssetItems(files) {
        this.ProjectAssetService.uploadAssets(files).then((uploadAssetsResults) => {
            if (uploadAssetsResults && uploadAssetsResults.length > 0) {
                let uploadedAssetsFilenames = [];
                for (var r = 0; r < uploadAssetsResults.length; r++) {
                    let uploadAssetsResult = uploadAssetsResults[r];
                    uploadedAssetsFilenames.push(uploadAssetsResult.config.file.name);
                }
                this.$translate('assetUploadSuccessful', { assetFilenames: uploadedAssetsFilenames.join(", ") }).then((assetUploadSuccessful) => {
                    // show a confirmation message for 7 seconds
                    this.assetMessage = assetUploadSuccessful;
                    this.$timeout(() => {
                            this.assetMessage = "";
                    }, 7000);
                });
            }
            this.projectAssets = this.ProjectAssetService.projectAssets;
        });
    }

    exit() {
        this.$state.go('root.project', {projectId: this.projectId});
    }
}

ProjectAssetController.$inject = ['$state', '$stateParams', '$scope', '$timeout', '$translate', 'ProjectAssetService'];

export default ProjectAssetController;