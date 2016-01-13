'use strict';

define(['configService', 'studentDataService'], function (configService, studentDataService) {

    var service = ['$http', '$q', '$rootScope', 'ConfigService', 'StudentAssetService', 'StudentDataService', function ($http, $q, $rootScope, ConfigService, StudentAssetService, StudentDataService) {

        var serviceObject = {};

        // filtering options for notebook displays
        // TODO: make dynamic based on project settings
        serviceObject.filters = [{ 'name': 'all', 'label': 'All' },
        //{'name': 'work', 'label': 'Work'}, TODO: uncomment me when adding student work to notebook is styled and ready for use in a run
        { 'name': 'files', 'label': 'Files' }
        //{'name': 'ideas', 'label': 'Ideas'} TODO: Add when Idea Manager is active
        ];

        serviceObject.getFilters = function () {
            return this.filters;
        };

        serviceObject.notebook = {};
        serviceObject.notebook.items = [];
        serviceObject.notebook.deletedItems = [];

        serviceObject.addItem = function (notebookItem) {
            this.notebook.items.push(notebookItem);

            // the current node is about to change
            $rootScope.$broadcast('notebookUpdated', { notebook: this.notebook });
        };

        serviceObject.deleteItem = function (itemToDelete) {
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

        serviceObject.calculateTotalUsage = function () {
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

        serviceObject.retrieveNotebookItems = function () {
            var config = {};
            config.method = 'GET';
            config.url = ConfigService.getStudentNotebookURL();
            config.params = {};
            config.params.periodId = ConfigService.getPeriodId();
            config.params.workgroupId = ConfigService.getWorkgroupId();
            return $http(config).then(angular.bind(this, function (response) {
                // loop through the assets and make them into JSON object with more details
                this.notebook.items = []; // clear local notebook items array
                var result = [];
                var allNotebookItems = response.data;
                for (var n = 0; n < allNotebookItems.length; n++) {
                    var notebookItem = allNotebookItems[n];
                    if (notebookItem.studentAssetId != null) {
                        // if this notebook item is a StudentAsset item, add the association here
                        notebookItem.studentAsset = StudentAssetService.getAssetById(notebookItem.studentAssetId);
                    } else if (notebookItem.studentWorkId != null) {
                        // if this notebook item is a StudentWork item, add the association here
                        notebookItem.studentWork = StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                    }
                    if (notebookItem.serverDeleteTime == null) {
                        this.notebook.items.push(notebookItem);
                    } else {
                        this.notebook.deletedItems.push(notebookItem);
                    }
                }
                this.calculateTotalUsage();

                return this.notebook;
            }));
        };

        serviceObject.hasStudentWorkNotebookItem = function (studentWork) {
            for (var i = 0; i < this.notebook.items.length; i++) {
                var notebookItem = this.notebook.items[i];
                if (notebookItem.studentWorkId === studentWork.id) {
                    return true;
                }
            }
            return false;
        };

        serviceObject.addStudentWorkNotebookItem = function (studentWork) {
            // don't allow duplicate student work notebook items
            if (this.hasStudentWorkNotebookItem(studentWork)) {
                $rootScope.$broadcast('notebookAddDuplicateAttempt');
                return;
            }

            var config = {};
            config.method = 'POST';
            config.url = ConfigService.getStudentNotebookURL();
            config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            var params = {};
            params.workgroupId = ConfigService.getWorkgroupId();
            params.periodId = ConfigService.getPeriodId();
            params.nodeId = studentWork.nodeId;
            params.componentId = studentWork.componentId;
            params.studentWorkId = studentWork.id;
            params.clientSaveTime = Date.parse(new Date());

            config.data = $.param(params);

            return $http(config).then(angular.bind(this, function (result) {
                var notebookItem = result.data;
                if (notebookItem != null) {
                    notebookItem.studentWork = studentWork;
                    this.notebook.items.push(notebookItem);
                }
                return null;
            }));
        };

        serviceObject.uploadStudentAssetNotebookItem = function (file) {
            StudentAssetService.uploadAsset(file).then(angular.bind(this, function (studentAsset) {

                var config = {};
                config.method = 'POST';
                config.url = ConfigService.getStudentNotebookURL();
                config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                var params = {};
                params.workgroupId = ConfigService.getWorkgroupId();
                params.periodId = ConfigService.getPeriodId();
                params.studentAssetId = studentAsset.id;
                params.clientSaveTime = Date.parse(new Date());

                config.data = $.param(params);

                return $http(config).then(angular.bind(this, function (result) {
                    var notebookItem = result.data;
                    if (notebookItem != null) {
                        notebookItem.studentAsset = StudentAssetService.getAssetById(notebookItem.studentAssetId);
                        this.notebook.items.push(notebookItem);
                    }
                    this.calculateTotalUsage();
                    return notebookItem;
                }));
            }));
        };

        serviceObject.saveNotebookToggleEvent = function (isOpen, currentNode) {
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Notebook";
            var eventData = {};
            eventData.curentNodeId = currentNode == null ? null : currentNode.id;

            var event = isOpen ? "notebookOpened" : "notebookClosed";

            // save notebook open/close event
            StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
        };

        return serviceObject;
    }];

    return service;
});