define(['configService'], function(configService) {
    
    var service = ['$http', '$q', '$rootScope', 'ConfigService', 'StudentAssetService',
        function($http, $q, $rootScope, ConfigService, StudentAssetService) {

        var serviceObject = {};

        // filtering options for notebook displays
        // TODO: make dynamic based on project settings
        serviceObject.filters = [
            {'name': 'all', 'label': 'All'},
            {'name': 'work', 'label': 'Work'},
            {'name': 'files', 'label': 'Files'},
            {'name': 'ideas', 'label': 'Ideas'} // TODO: Add when Idea Manager is active
        ];

        serviceObject.getFilters = function(){
            return this.filters;
        };

        serviceObject.notebook = {};
        serviceObject.notebook.items = [];
        serviceObject.notebook.deletedItems = [];

        serviceObject.addItem = function(notebookItem) {
          this.notebook.items.push(notebookItem);
          
          // the current node is about to change
          $rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
        };
        
        serviceObject.deleteItem = function(itemToDelete) {
            var items = this.notebook.items;
            var deletedItems = this.notebook.deletedItems;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item === itemToDelete) {
                    items.splice(i, 1);
                    deletedItems.push(itemToDelete);
                }
            }
        };

        serviceObject.calculateTotalUsage = function() {
            // get the total size
            var totalSizeSoFar = 0;
            for (var i = 0; i < this.notebook.items.length; i++) {
                var notebookItem = this.notebook.items[i];
                if (notebookItem.studentAsset != null) {
                    var notebookItemSize = notebookItem.studentAsset.fileSize;
                    totalSizeSoFar += notebookItemSize;
                }
            }
            this.notebook.totalSize = totalSizeSoFar;
            this.notebook.totalSizeMax = ConfigService.getStudentMaxTotalAssetsSize();
            this.notebook.usagePercentage = this.notebook.totalSize / this.notebook.totalSizeMax * 100;
        };

        serviceObject.retrieveNotebookItems = function() {
            var config = {};
            config.method = 'GET';
            config.url = ConfigService.getStudentNotebookURL();
            config.params = {};
            config.params.periodId = ConfigService.getPeriodId();
            config.params.workgroupId = ConfigService.getWorkgroupId();
            return $http(config).then(angular.bind(this, function(response) {
                // loop through the assets and make them into JSON object with more details
                var result = [];
                var allNotebookItems = response.data;
                for (var n = 0; n < allNotebookItems.length; n++) {
                    var notebookItem = allNotebookItems[n];
                    // if this notebook item is a StudentAsset item, add the association here
                    if (notebookItem.studentAssetId != null) {
                        notebookItem.studentAsset = StudentAssetService.getAssetById(notebookItem.studentAssetId);
                    }
                    if (notebookItem.serverDeleteTime == null) {
                        this.notebook.items.push(notebookItem);
                    } else {
                        this.notebook.deletedItems.push(notebookItem)
                    }
                }
                this.calculateTotalUsage();

                return this.notebook;
            }));
        };

        serviceObject.uploadStudentAssetNotebookItem = function(file) {
            StudentAssetService.uploadAsset(file).then(angular.bind(this, function(studentAsset) {

                var config = {};
                config.method = 'POST';
                config.url = ConfigService.getStudentNotebookURL();
                config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
                var params = {};
                params.workgroupId = ConfigService.getWorkgroupId();
                params.periodId = ConfigService.getPeriodId();
                params.studentAssetId = studentAsset.id;
                params.clientSaveTime = Date.parse(new Date());

                config.data = $.param(params);

                return $http(config).then(angular.bind(this, function(result) {
                    var notebookItem = result.data;
                    if (notebookItem != null) {
                        notebookItem.studentAsset = StudentAssetService.getAssetById(notebookItem.studentAssetId);
                        this.notebook.items.push(notebookItem);

                        /*
                        var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                        if (copiedAsset.isReferenced && copiedAsset.fileName != '.DS_Store') {
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
                            return copiedAsset;
                        }
                        */
                    }
                    return null;
                }));

                // make a request to copy asset for reference and save for current node visit

                /*
                 StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                 if (copiedAsset != null) {
                 if (this.studentResponse == null) {
                 this.studentResponse = [];
                 }
                 this.studentResponse.push(copiedAsset);
                 this.studentDataChanged();
                 }
                 }));
                 */
                //$rootScope.$broadcast('studentAssetsUpdated');
            }));
        }
        
        return serviceObject;
    }];
    
    return service;
});