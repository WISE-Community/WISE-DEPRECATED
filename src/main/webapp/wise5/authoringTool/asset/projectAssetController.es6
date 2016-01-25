'use strict';

class ProjectAssetController {

    constructor($state, ProjectAssetService) {
        this.$state = $state;
        this.ProjectAssetService = ProjectAssetService;
        this.projectAssets = ProjectAssetService.projectAssets;
        this.projectAssetTotalSizeMax = ProjectAssetService.projectAssetTotalSizeMax;
    }

    deleteAsset(assetItem) {
        this.ProjectAssetService.deleteAssetItem(assetItem).then((newProjectAssets) => {
            this.projectAssets = newProjectAssets;
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

ProjectAssetController.$inject = ['$state', 'ProjectAssetService'];

export default ProjectAssetController