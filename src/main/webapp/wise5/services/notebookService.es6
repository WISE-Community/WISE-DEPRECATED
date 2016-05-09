class NotebookService {
    constructor($http,
                $q,
                $rootScope,
                ConfigService,
                ProjectService,
                StudentAssetService,
                StudentDataService) {

        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        this.filters = [
            {'name': 'all', 'type': 'all', 'label': 'All'},
            {'name': 'notes', 'type': 'all', 'label': 'Notes'}
            /*,
            {'name': 'bookmarks', 'label': 'Bookmarks'},
            {'name': 'questions', 'label': 'Questions'}
            */
        ];

        this.notebook = {};
        this.notebook.items = [];
        this.notebook.deletedItems = [];

        if (this.ProjectService.project != null) {
            this.notebookConfig = this.ProjectService.project.notebook;
            if (this.notebookConfig != null) {
                if (this.notebookConfig.report != null && this.notebookConfig.report.enabled) {
                    let reportNotes = this.notebookConfig.report.notes;
                    for (let i = 0; i < reportNotes.length; i++) {
                        let reportNote = reportNotes[i];
                        this.filters.push({
                            "name": reportNote.id,
                            "type": "report",
                            "label": reportNote.title
                        });
                    }
                }
            }
        }
    }

    addItem(notebookItem) {
        this.notebook.items.push(notebookItem);

        // the current node is about to change
        this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
    };

    deleteItem(itemToDelete) {
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

    getNotebookItemById(itemId) {
        let notebookItem = null;
        var items = this.notebook.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.id === itemId) {
                notebookItem = item;
                break;
            }
        }
        return notebookItem;
    }

    calculateTotalUsage() {
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
        this.notebook.totalSizeMax = this.ConfigService.getStudentMaxTotalAssetsSize();
        this.notebook.usagePercentage = this.notebook.totalSize / this.notebook.totalSizeMax * 100;
    };

    isNotebookEnabled() {
        return this.notebookConfig != null && this.notebookConfig.enabled;
    };

    retrieveNotebookItems() {
        var config = {};
        config.method = 'GET';
        config.url = this.ConfigService.getStudentNotebookURL();
        config.params = {};
        config.params.periodId = this.ConfigService.getPeriodId();
        config.params.workgroupId = this.ConfigService.getWorkgroupId();
        return this.$http(config).then((response) => {
            // loop through the assets and make them into JSON object with more details
            this.notebook.items = [];  // clear local notebook items array
            var allNotebookItems = response.data;
            for (var n = 0; n < allNotebookItems.length; n++) {
                var notebookItem = allNotebookItems[n];
                if (notebookItem.studentAssetId != null) {
                    // if this notebook item is a StudentAsset item, add the association here
                    notebookItem.studentAsset = this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                } else if (notebookItem.studentWorkId != null) {
                    // if this notebook item is a StudentWork item, add the association here
                    notebookItem.studentWork = this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                } else if (notebookItem.type === "note") {
                    notebookItem.content = angular.fromJson(notebookItem.content);
                }
                if (notebookItem.serverDeleteTime == null) {
                    this.notebook.items.push(notebookItem);
                } else {
                    this.notebook.deletedItems.push(notebookItem)
                }
            }
            this.calculateTotalUsage();

            return this.notebook;
        });
    };

    hasStudentWorkNotebookItem(studentWork) {
        for (var i = 0; i < this.notebook.items.length; i++) {
            var notebookItem = this.notebook.items[i];
            if (notebookItem.studentWorkId === studentWork.id) {
                return true;
            }
        }
        return false;
    };

    saveNotebookItem(notebookItemId, nodeId, type, title, content) {
        if (this.ConfigService.isPreview()) {
            return this.$q((resolve, reject) => {
                let notebookItem = {
                    type: type,
                    content: content
                };
                this.notebook.items.push(notebookItem);
                this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
                resolve();
            });
        } else {
            var config = {};
            config.method = 'POST';
            config.url = this.ConfigService.getStudentNotebookURL();
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var params = {};
            params.workgroupId = this.ConfigService.getWorkgroupId();
            params.periodId = this.ConfigService.getPeriodId();
            params.notebookItemId = notebookItemId;
            params.nodeId = nodeId;
            params.type = type;
            params.title = title;
            params.content = angular.toJson(content);
            params.clientSaveTime = Date.parse(new Date());
            config.data = $.param(params);

            return this.$http(config).then((result) => {
                var notebookItem = result.data;
                if (notebookItem != null) {
                    if (notebookItem.type === "note") {
                        notebookItem.content = angular.fromJson(notebookItem.content);
                    }
                    // add/update notebook
                    let notebookItemExists = false;
                    for (let n = 0; n < this.notebook.items.length; n++) {
                        let localNotebookItem = this.notebook.items[n];
                        if (localNotebookItem.id === notebookItem.id) {
                            this.notebook.items[n] = notebookItem;
                            notebookItemExists = true;
                            break;
                        }
                    }
                    if (!notebookItemExists) {
                        this.notebook.items.push(notebookItem);
                    }

                    this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
                }
                return null;
            });
        }
    };

    uploadStudentAssetNotebookItem(file) {
        this.StudentAssetService.uploadAsset(file).then((studentAsset) => {

            var config = {};
            config.method = 'POST';
            config.url = this.ConfigService.getStudentNotebookURL();
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var params = {};
            params.workgroupId = this.ConfigService.getWorkgroupId();
            params.periodId = this.ConfigService.getPeriodId();
            params.studentAssetId = studentAsset.id;
            params.clientSaveTime = Date.parse(new Date());

            config.data = $.param(params);

            return this.$http(config).then((result) => {
                var notebookItem = result.data;
                if (notebookItem != null) {
                    notebookItem.studentAsset = this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                    this.notebook.items.push(notebookItem);
                }
                this.calculateTotalUsage();
                return notebookItem;
            });
        });
    }

    saveNotebookToggleEvent(isOpen, currentNode) {
        var nodeId = null;
        var componentId = null;
        var componentType = null;
        var category = "Notebook";
        var eventData = {};
        eventData.curentNodeId = currentNode == null ? null : currentNode.id;

        var event = isOpen ? "notebookOpened" : "notebookClosed";

        // save notebook open/close event
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    };
}

NotebookService.$inject = [
    '$http',
    '$q',
    '$rootScope',
    'ConfigService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService'
];

export default NotebookService;
