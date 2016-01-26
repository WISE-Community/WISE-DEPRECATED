'use strict';

class ProjectAssetController {

    constructor($state, $scope, ProjectAssetService) {
        this.$state = $state;
        this.$scope = $scope;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
        this.projectAssetUsagePercentage = ProjectAssetService.projectAssetUsagePercentage;

        this.$scope.$watch(
            () => { return this.projectAssets },
            angular.bind(this, function() {
              this.projectAssetUsagePercentage = this.projectAssets.totalFileSize / this.projectAssetTotalSizeMax * 100;
            }
        ));
    }

    deleteAsset(assetItem) {
        this.ProjectAssetService.deleteAssetItem(assetItem).then((newProjectAssets) => {
            this.projectAssets = this.ProjectAssetService.projectAssets;
        });
    }

    uploadAssetItems(files) {
        this.ProjectAssetService.uploadAssets(files).then((newProjectAssets) => {
            this.projectAssets = this.ProjectAssetService.projectAssets;
        });
    }

    exit() {
        this.$state.go('root.project', {});
    }
}

ProjectAssetController.$inject = ['$state', '$scope', 'ProjectAssetService'];

export default ProjectAssetController