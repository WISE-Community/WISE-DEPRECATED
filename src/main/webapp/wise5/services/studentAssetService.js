define(['configService'], function(configService) {

    var service = ['$http', '$q', '$upload', '$rootScope', 'ConfigService', 
                                    function($http, $q, $upload, $rootScope, ConfigService) {
        var serviceObject = {};
        
        serviceObject.retrieveAssets = function() {
            var config = {};
            config.method = 'GET';
            config.url = ConfigService.getStudentAssetManagerURL();
            config.params = {};
            config.params.command = 'assetList';
            return $http(config).then(angular.bind(this, function(response) {
                // loop through the assets and make them into JSON object with more details
                var assets = [];
                var filenames = response.data;
                var config = response.config;
                var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                var runId = ConfigService.getRunId();
                var workgroupId = ConfigService.getWorkgroupId();
                var assetBaseURL = studentUploadsBaseURL + '/' + runId + '/' + workgroupId + '/unreferenced/';
                for (var f = 0; f < filenames.length; f++) {
                    var filename = filenames[f];
                    if (filename != '.DS_Store') {
                        var asset = {};
                        asset.name = filename;
                        asset.url = assetBaseURL + filename;
                        if (this.isImage(asset)) {
                            asset.iconURL = asset.url;
                        } else {
                            asset.iconURL = 'wise5/vle/portfolio/file.png';
                        }
                        assets.push(asset);
                    }
                }
                return assets;
            }));
        };
        
        serviceObject.isImage = function(asset) {
            var isImage = false;
            if (asset != null) {
                var assetURL = asset.url;
                if (assetURL != null && 
                        (assetURL.toLowerCase().indexOf(".png") != -1 || assetURL.toLowerCase().indexOf(".jpg") != -1)) {
                    isImage = true;
                }
            }
            return isImage;
        };
        
        serviceObject.uploadAssets = function(files) {
            var studentAssetManagerURL = ConfigService.getStudentAssetManagerURL();
            var promises = files.map(function(file) {
                return $upload.upload({
                    url: studentAssetManagerURL,
                    fields: {
                        'command': 'uploadAsset'
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
            var studentAssetFilename = studentAsset.name;
            var runId = ConfigService.getRunId();
            var config = {};
            config.method = 'POST';
            config.url = ConfigService.getStudentAssetManagerURL();
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var params = {};
            params.command = 'studentAssetCopyForReference';
            params.type = 'studentAssetManager';
            params.runId = runId;
            params.forward = 'assetmanager';
            params.assetFilename = studentAssetFilename;
            config.data = $.param(params);
            
            return $http(config).then(angular.bind(this, function(result) {
                var copiedAsset = null;
                var copyAssetResultData = result.data;
                if (copyAssetResultData != null && copyAssetResultData.result === 'SUCCESS') {
                    if (copyAssetResultData.newFilename != null) {
                        var newFilename = copyAssetResultData.newFilename;
                        var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                        var runId = ConfigService.getRunId();
                        var workgroupId = ConfigService.getWorkgroupId();
                        var assetBaseURL = studentUploadsBaseURL + '/' + runId + '/' + workgroupId + '/referenced/';
                        
                        var copiedAsset = {};
                        copiedAsset.name = newFilename;
                        copiedAsset.url = assetBaseURL + newFilename;
                        if (this.isImage(copiedAsset)) {
                            copiedAsset.iconURL = copiedAsset.url;
                        } else {
                            copiedAsset.iconURL = 'wise5/vle/portfolio/file.png';
                        }
                    }
                }
                return copiedAsset;
            }));
        };
        
        return serviceObject;
    }];
    
    return service;
});