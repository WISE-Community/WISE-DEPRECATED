class ProjectAssetService {
    constructor($q, $http, $rootScope, ConfigService, ProjectService, Upload, UtilService) {
        this.$q = $q;
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.Upload = Upload;
        this.UtilService = UtilService;
        this.projectAssets = {};
        this.projectAssetTotalSizeMax = this.ConfigService.getConfigParam('projectAssetTotalSizeMax');
        this.projectAssetUsagePercentage = 0;
    }

    deleteAssetItem(assetItem) {

        let params = {
            assetFileName: assetItem.fileName
        };

        let httpParams = {
            method: 'POST',
            url: this.ConfigService.getConfigParam('projectAssetURL'),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param(params)
        };

        return this.$http(httpParams).then((result) => {
            let projectAssetsJSON = result.data;
            this.projectAssets = projectAssetsJSON;
            return projectAssetsJSON;
        });
    }

    downloadAssetItem(assetItem) {
      let assetFileName = assetItem.fileName;

      // ask the browser to download this asset by setting the location
      window.location = this.ConfigService.getConfigParam('projectAssetURL') + "/download?assetFileName=" + assetFileName;
    }

    getFullAssetItemURL(assetItem) {
        return this.ConfigService.getConfigParam('projectBaseURL') + "assets/" + assetItem.fileName;
    }

    retrieveProjectAssets() {
        var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

        return this.$http.get(projectAssetURL).then((result) => {
            var projectAssetsJSON = result.data;
            this.projectAssets = projectAssetsJSON;
            this.calculateAssetUsage();
            return projectAssetsJSON;
        });
    }

    uploadAssets(files) {
        var projectAssetURL = this.ConfigService.getConfigParam('projectAssetURL');

        var promises = files.map((file) => {
            return this.Upload.upload({
                url: projectAssetURL,
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

    /**
     * Calculate which assets are used or not used
     */
    calculateAssetUsage() {

        /*
         * a list of all the project assets. each element in the list is an
         * object that contains the file name and file size
         */
        var assets = this.projectAssets;

        // get the project content as a string
        var projectJSONString = angular.toJson(this.ProjectService.project);

        // an array to hold the html files that the project uses
        var usedHtmlFiles = [];

        if (assets != null && assets.files != null) {

            /*
             * loop through all the asset files to find the html files that
             * are actually used in the project
             */
            for (var a = 0; a < assets.files.length; a++) {
                var asset = assets.files[a];

                if (asset != null) {
                    var fileName = asset.fileName;

                    // check if the file is an html file
                    if (this.UtilService.endsWith(fileName, ".html") || this.UtilService.endsWith(fileName, ".htm")) {
                        // the file is an html file

                        // check if the html file is used in the project
                        if (projectJSONString.indexOf(fileName) != -1) {
                            // the file is used in the project
                            usedHtmlFiles.push(fileName);
                        }
                    }
                }
            }
        }

        /*
         * Retrieve all the html files that are used in the project. If there
         * are not html files that are used in the project, then then() will
         * still be called.
         */
        this.getHtmlFiles(usedHtmlFiles).then((htmlFiles) => {

            /*
             * this variable will hold the project json string as well as
             * the html file content so we can look for assets that are used
             * in the project
             */
            var allContent = projectJSONString;

            // loop through all the html files that are used in the project
            for (var h = 0; h < htmlFiles.length; h++) {
                var htmlFile = htmlFiles[h];

                if (htmlFile != null) {

                    // get the html file content
                    var htmlFileContent = htmlFile.data;

                    // add the html file content to our allContent variable
                    allContent += '\n';
                    allContent += htmlFileContent;
                }
            }

            if (assets != null && assets.files != null) {

                // loop through all the assets
                for (var a = 0; a < assets.files.length; a++) {
                    var asset = assets.files[a];

                    if (asset != null) {
                        var fileName = asset.fileName;

                        if (allContent.indexOf(fileName) != -1) {
                            // the file is used in the project
                            asset.used = true;
                        } else {
                            // the file is not used in the project
                            asset.used = false;
                        }
                    }
                }
            }
        });
    }

    /**
     * Retrieve html files using a promise all
     * @param htmlFileNames a list of html file names
     * @return a promise that will retrieve all the html files
     */
    getHtmlFiles(htmlFileNames) {

        var promises = [];

        // get the project assets path e.g. /wise/curriculum/3/assets
        var projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();

        // loop through all the html file names
        for (var h = 0; h < htmlFileNames.length; h++) {

            // get an html file name
            var htmlFileName = htmlFileNames[h];

            // create a promise that will return the contents of the html file
            var promise = this.$http.get(projectAssetsDirectoryPath + '/' + htmlFileName);

            // add the promise to our list of promises
            promises.push(promise);
        }

        return this.$q.all(promises);
    }
}

ProjectAssetService.$inject = [
    '$q',
    '$http',
    '$rootScope',
    'ConfigService',
    'ProjectService',
    'Upload',
    'UtilService'
];

export default ProjectAssetService;
