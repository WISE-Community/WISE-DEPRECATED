'use strict';

class ProjectAssetController {

    constructor($state, $stateParams, $scope, ProjectAssetService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.projectId = this.$stateParams.projectId;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;

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
        this.ProjectAssetService.uploadAssets(files).then((uploadAssetsResult) => {
            this.projectAssets = this.ProjectAssetService.projectAssets;
        });
    }

    exit() {
        this.$state.go('root.project', {projectId: this.projectId});
    }
}

ProjectAssetController.$inject = ['$state', '$stateParams', '$scope', 'ProjectAssetService'];

export default ProjectAssetController;