class ProjectAssetService {
    constructor($q, $http, $rootScope, ConfigService, Upload) {
        this.$q = $q;
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.Upload = Upload;
        this.projectAssets = {};
        this.projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');
        this.projectAssetTotalSizeMax = this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
        this.projectAssetUsagePercentage = 0;
    }

    deleteAssetItem(assetItem) {

        var httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = this.projectAssetURL;
        httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

        var params = {};
        params.assetFileName = assetItem.fileName;
        httpParams.data = $.param(params);

        return this.$http(httpParams).then((result) => {
            var projectAssetsJSON = result.data;
            this.projectAssets = projectAssetsJSON;
            return projectAssetsJSON;
        });
    }

    retrieveProjectAssets() {

        return this.$http.get(this.projectAssetURL).then((result) => {
            var projectAssetsJSON = result.data;
            this.projectAssets = projectAssetsJSON;
            return projectAssetsJSON;
        });
    }

    uploadAssets(files) {
        var promises = files.map((file) => {
            return this.Upload.upload({
                url: this.projectAssetURL,
                fields: {
                },
                file: file
            }).progress((evt) => {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success((result, status, headers, config) => {
                // Only set the projectAssets if the result is an object.
                // Sometimes it's an error message string.
                if (typeof result === 'object') {
                    // upload was successful.
                    this.projectAssets = result;
                    let uploadedFilename = config.file.name;
                    return uploadedFilename;
                } else if (typeof result === 'string') {
                    // This is an error and should be displayed to the user.
                    alert(result);
                }

                return result;
            });
        });
        return this.$q.all(promises);
    }
}

ProjectAssetService.$inject = ['$q', '$http', '$rootScope', 'ConfigService', 'Upload'];

export default ProjectAssetService;