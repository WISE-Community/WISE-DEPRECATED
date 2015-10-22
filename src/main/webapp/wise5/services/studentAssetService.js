define(['configService'], function(configService) {

    var service = ['$http', '$q', 'Upload', '$rootScope', 'ConfigService',
                                    function($http, $q, Upload, $rootScope, ConfigService) {
        var serviceObject = {};

        serviceObject.allAssets = [];  // keep track of student's assets

        serviceObject.getAssetById = function(assetId) {
            for (var a = 0; a < this.allAssets.length; a++) {
                var asset = this.allAssets[a];
                if (asset.id === assetId) {
                    return asset;
                }
            }
            return null;
        };

        serviceObject.retrieveAssets = function() {
            var config = {};
            config.method = 'GET';
            config.url = ConfigService.getStudentAssetsURL();
            config.params = {};
            config.params.workgroupId = ConfigService.getWorkgroupId();
            return $http(config).then(angular.bind(this, function(response) {
                // loop through the assets and make them into JSON object with more details
                var result = [];
                var assets = response.data;
                var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                for (var a = 0; a < assets.length; a++) {
                    var asset = assets[a];
                    if (!asset.isReferenced && asset.serverDeleteTime === null && asset.fileName !== '.DS_Store') {
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
        
        serviceObject.isImage = function(asset) {
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
        
        serviceObject.isAudio = function(asset) {
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
        
        serviceObject.uploadAsset = function(file) {
            var studentAssetsURL = ConfigService.getStudentAssetsURL();
            var deferred = $q.defer();

            Upload.upload({
                url: studentAssetsURL,
                fields: {
                    'runId': ConfigService.getRunId(),
                    'workgroupId': ConfigService.getWorkgroupId(),
                    'periodId': ConfigService.getPeriodId(),
                    'clientSaveTime': Date.parse(new Date())
                },
                file: file
            }).success(angular.bind(this, function (asset, status, headers, config) {
                var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
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
                $rootScope.$broadcast('studentAssetsUpdated');
                deferred.resolve(asset);
            }));

            return deferred.promise;
        };
        
        serviceObject.uploadAssets = function(files) {
            var studentAssetsURL = ConfigService.getStudentAssetsURL();
            var promises = files.map(function(file) {
                return Upload.upload({
                    url: studentAssetsURL,
                    fields: {
                        'runId': ConfigService.getRunId(),
                        'workgroupId': ConfigService.getWorkgroupId(),
                        'periodId': ConfigService.getPeriodId(),
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
            return $q.all(promises);
        };
        
        // given asset, makes a copy of it so steps can use for reference. Returns newly-copied asset.
        serviceObject.copyAssetForReference = function(studentAsset) {
            var config = {};
            config.method = 'POST';
            config.url = ConfigService.getStudentAssetsURL() + '/copy';
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var params = {};
            params.studentAssetId = studentAsset.id;
            params.workgroupId = ConfigService.getWorkgroupId();
            params.periodId = ConfigService.getPeriodId();
            params.clientSaveTime = Date.parse(new Date());

            config.data = $.param(params);
            
            return $http(config).then(angular.bind(this, function(result) {
                var copiedAsset = result.data;
                if (copiedAsset != null) {
                    var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
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
                        //$rootScope.$broadcast('studentAssetsUpdated');
                        return copiedAsset;
                    }
                }
                return null;
            }));
        };
        
        serviceObject.deleteAsset = function(studentAsset) {
            var config = {};
            config.method = 'POST';
            config.url = ConfigService.getStudentAssetsURL() + '/remove';
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var params = {};
            params.studentAssetId = studentAsset.id;
            params.workgroupId = ConfigService.getWorkgroupId();
            params.periodId = ConfigService.getPeriodId();
            params.clientDeleteTime = Date.parse(new Date());
            config.data = $.param(params);

            return $http(config).then(angular.bind(this, function(result) {
                //var deletedAsset = result.data;
                // also remove from local copy of all assets
                this.allAssets = this.allAssets.splice(this.allAssets.indexOf(studentAsset), 1);
                $rootScope.$broadcast('studentAssetsUpdated');
                return studentAsset;
            }));
        };
        return serviceObject;
    }];
    
    return service;
});