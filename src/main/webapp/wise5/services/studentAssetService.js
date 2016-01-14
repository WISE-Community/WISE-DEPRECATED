class StudentAssetService {
    constructor($http, $q, Upload, $rootScope, ConfigService) {
        this.$http = $http;
        this.$q = $q;
        this.Upload = Upload;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;

        this.allAssets = [];  // keep track of student's assets
    }

    getAssetById(assetId) {
        for (var a = 0; a < this.allAssets.length; a++) {
            var asset = this.allAssets[a];
            if (asset.id === assetId) {
                return asset;
            }
        }
        return null;
    };

    retrieveAssets() {
        var config = {};
        config.method = 'GET';
        config.url = this.ConfigService.getStudentAssetsURL();
        config.params = {};
        config.params.workgroupId = this.ConfigService.getWorkgroupId();
        return this.$http(config).then(angular.bind(this, function(response) {
            // loop through the assets and make them into JSON object with more details
            var result = [];
            var assets = response.data;
            var studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
            for (var a = 0; a < assets.length; a++) {
                var asset = assets[a];
                if (!asset.isReferenced && asset.serverDeleteTime == null && asset.fileName !== '.DS_Store') {
                    asset.url = studentUploadsBaseURL + asset.filePath;
                    if (this.isImage(asset)) {
                        asset.type = 'image';
                        asset.iconURL = asset.url;
                    } else if (this.isAudio(asset)) {
                        asset.type = 'audio';
                        asset.iconURL = 'wise5/vle/notebook/audio.png';
                    } else {
                        asset.type = 'file';
                        asset.iconURL = 'wise5/vle/notebook/file.png';
                    }
                    result.push(asset);
                }
            }
            this.allAssets = result;
            return result;
        }));
    };

    getAssetContent(asset) {
        var assetContentURL = asset.url;

        // retrieve the csv file and parse it
        var config = {};
        config.method = 'GET';
        config.url = assetContentURL;
        return this.$http(config).then(angular.bind(this, function(response) {
            return response.data;
        }));
    };

    isImage(asset) {
        var isImage = false;
        var imageFileExtensions = ['png', 'jpg', 'jpeg', 'gif'];
        if (asset != null) {
            var assetURL = asset.url;
            if (assetURL != null && assetURL.lastIndexOf('.') !== -1) {
                var assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
                if (imageFileExtensions.indexOf(assetExtension.toLowerCase()) != -1) {
                    isImage = true;
                }
            }
        }
        return isImage;
    };

    isAudio(asset) {
        var isAudio = false;
        var imageFileExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'm4p', 'raw', 'aiff'];
        if (asset != null) {
            var assetURL = asset.url;
            if (assetURL != null && assetURL.lastIndexOf('.') != -1) {
                var assetExtension = assetURL.substring(assetURL.lastIndexOf('.') + 1);
                if (imageFileExtensions.indexOf(assetExtension.toLowerCase()) != -1) {
                    isAudio = true;
                }
            }
        }
        return isAudio;
    };

    uploadAsset(file) {
        var studentAssetsURL = this.ConfigService.getStudentAssetsURL();
        var deferred = this.$q.defer();

        this.Upload.upload({
            url: studentAssetsURL,
            fields: {
                'runId': this.ConfigService.getRunId(),
                'workgroupId': this.ConfigService.getWorkgroupId(),
                'periodId': this.ConfigService.getPeriodId(),
                'clientSaveTime': Date.parse(new Date())
            },
            file: file
        }).success(angular.bind(this, function (asset, status, headers, config) {
            if (asset === "error") {
                alert("There was an error uploading.");
            } else {
                var studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
                asset.url = studentUploadsBaseURL + asset.filePath;
                if (this.isImage(asset)) {
                    asset.type = 'image';
                    asset.iconURL = asset.url;
                } else if (this.isAudio(asset)) {
                    asset.type = 'audio';
                    asset.iconURL = 'wise5/vle/notebook/audio.png';
                } else {
                    asset.type = 'file';
                    asset.iconURL = 'wise5/vle/notebook/file.png';
                }
                this.allAssets.push(asset);
                this.$rootScope.$broadcast('studentAssetsUpdated');
                deferred.resolve(asset);
            }
        })).error(angular.bind(this, function(asset, status, headers, config) {
            alert("There was an error uploading. You might have reached your file upload limit or the file you tried to upload was too large. Please ask your teacher for help.");
        }));

        return deferred.promise;
    };

    uploadAssets(files) {
        var studentAssetsURL = this.ConfigService.getStudentAssetsURL();
        var promises = files.map(function(file) {
            return this.Upload.upload({
                url: studentAssetsURL,
                fields: {
                    'runId': this.ConfigService.getRunId(),
                    'workgroupId': this.ConfigService.getWorkgroupId(),
                    'periodId': this.ConfigService.getPeriodId(),
                    'clientSaveTime': Date.parse(new Date())
                },
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
            });
        });
        return this.$q.all(promises);
    };

    // given asset, makes a copy of it so steps can use for reference. Returns newly-copied asset.
    copyAssetForReference(studentAsset) {
        var config = {};
        config.method = 'POST';
        config.url = this.ConfigService.getStudentAssetsURL() + '/copy';
        config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        var params = {};
        params.studentAssetId = studentAsset.id;
        params.workgroupId = this.ConfigService.getWorkgroupId();
        params.periodId = this.ConfigService.getPeriodId();
        params.clientSaveTime = Date.parse(new Date());

        config.data = $.param(params);

        return this.$http(config).then(angular.bind(this, function(result) {
            var copiedAsset = result.data;
            if (copiedAsset != null) {
                var studentUploadsBaseURL = this.ConfigService.getStudentUploadsBaseURL();
                if (copiedAsset.isReferenced && copiedAsset.fileName !== '.DS_Store') {
                    copiedAsset.url = studentUploadsBaseURL + copiedAsset.filePath;
                    if (this.isImage(copiedAsset)) {
                        copiedAsset.type = 'image';
                        copiedAsset.iconURL = copiedAsset.url;
                    } else if (this.isAudio(copiedAsset)) {
                        copiedAsset.type = 'audio';
                        copiedAsset.iconURL = 'wise5/vle/notebook/audio.png';
                    } else {
                        copiedAsset.type = 'file';
                        copiedAsset.iconURL = 'wise5/vle/notebook/file.png';
                    }
                    //this.$rootScope.$broadcast('studentAssetsUpdated');
                    return copiedAsset;
                }
            }
            return null;
        }));
    };

    deleteAsset(studentAsset) {
        var config = {};
        config.method = 'POST';
        config.url = this.ConfigService.getStudentAssetsURL() + '/remove';
        config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        var params = {};
        params.studentAssetId = studentAsset.id;
        params.workgroupId = this.ConfigService.getWorkgroupId();
        params.periodId = this.ConfigService.getPeriodId();
        params.clientDeleteTime = Date.parse(new Date());
        config.data = $.param(params);

        return this.$http(config).then(angular.bind(this, function(result) {
            //var deletedAsset = result.data;
            // also remove from local copy of all assets
            this.allAssets = this.allAssets.splice(this.allAssets.indexOf(studentAsset), 1);
            this.$rootScope.$broadcast('studentAssetsUpdated');
            return studentAsset;
        }));
    };
}

StudentAssetService.$inject = ['$http', '$q', 'Upload', '$rootScope', 'ConfigService'];

export default StudentAssetService;
