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
                var result = [];
                var assets = response.data;
                var config = response.config;
                var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                var runId = ConfigService.getRunId();
                var workgroupId = ConfigService.getWorkgroupId();
                var assetBaseURL = studentUploadsBaseURL + '/' + runId + '/' + workgroupId + '/unreferenced/';
                for (var a = 0; a < assets.length; a++) {
                    var asset = assets[a];
                    var assetFilename = asset.fileName;
                    if (assetFilename != '.DS_Store') {
                        asset.name = assetFilename;
                        asset.url = assetBaseURL + assetFilename;
                        if (this.isImage(asset)) {
                            asset.type = 'image';
                            asset.iconURL = asset.url;
                        } else if (this.isAudio(asset)) {
                            asset.type = 'audio';
                            asset.iconURL = 'wise5/vle/portfolio/audio.png';
                        } else {
                            asset.type = 'file';
                            asset.iconURL = 'wise5/vle/portfolio/file.png';
                        }
                        result.push(asset);
                    }
                }
                return result;
            }));
        };
        
        serviceObject.isImage = function(asset) {
            var isImage = false;
            var imageFileExtensions = ['png', 'jpg'];
            if (asset != null) {
                var assetURL = asset.url;
                if (assetURL != null && assetURL.lastIndexOf('.') != -1) {
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
            var imageFileExtensions = ['wav', 'mp3', 'ogg'];
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
                        } else if (this.isAudio(copiedAsset)) {
                            copiedAsset.iconURL = 'wise5/vle/portfolio/audio.png';
                        } else {
                            copiedAsset.iconURL = 'wise5/vle/portfolio/file.png';
                        }
                    }
                }
                return copiedAsset;
            }));
        };
        
        serviceObject.deleteAsset = function(asset) {
            
            var runId = ConfigService.getRunId();
            var config = {};
            config.method = 'POST';
            config.url = ConfigService.getStudentAssetManagerURL();
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var params = {};
            params.command = 'remove';
            params.type = 'studentAssetManager';
            params.runId = runId;
            params.forward = 'assetmanager';
            params.asset =  asset.name;
            config.data = $.param(params);
            
            return $http(config).then(function() {
                return asset; 
            });
        };
            
            /*
            var remove = function(){
                var parent = document.getElementById('assetSelect');
                var ndx = parent.selectedIndex;
                if(ndx!=-1){
                    var opt = parent.options[parent.selectedIndex];
                    var name = opt.value;

                    var success = function(text, xml, o) {
                        if(text.status==401){
                            xml.notificationManager.notify(this.getI18NString("student_assets_remove_file_warning"),3, 'uploadMessage', 'notificationDiv');
                        } else {
                            parent.removeChild(opt);
                            o.notificationManager.notify(text, 3, 'uploadMessage', 'notificationDiv');

                            o.checkStudentAssetSizeLimit();
                        }
                    };
                    view.connectionManager.request('POST', 1, view.getConfig().getConfigParam("studentAssetManagerUrl"), {forward:'assetmanager', command: 'remove', asset: name, cmd: 'studentAssetUpload'}, success, view, success);
                }
            };
            */
        
        return serviceObject;
    }];
    
    return service;
});