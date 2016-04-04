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
        this.assetMessage = "";

        this.$scope.$watch(
            () => {
                return this.projectAssets
            },
            () => {
              this.projectAssetUsagePercentage = this.projectAssets.totalFileSize / this.projectAssetTotalSizeMax * 100;
            }
        );
    }

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