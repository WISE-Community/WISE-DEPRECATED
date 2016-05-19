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

        // default notebook configuration
        // TODO: i18n
        // TODO: decide on desired defaults
        // TODO: allow wise instance to set default enabled/disabled for each type in wise config?
        this.config = {
            enabled: true,
            label: "Notebook",
            itemTypes: {
                note: {
                    enabled: true,
                    enableAddNote: true,
                    enableClipping: true,
                    enableStudentUploads: true,
                    type: "note",
                    label: {
                        singular: "note",
                        plural: "notes",
                        link: "Notes",
                        icon: "note",
                        color: "#1565C0"
                    },
                },
                question: {
                    enabled: false,
                    enableAddNote: true,
                    enableClipping: true,
                    enableStudentUploads: true,
                    type: "question",
                    label: {
                        singular: "question",
                        plural: "questions",
                        link: "Questions",
                        icon: "live_help",
                        color: "#F57C00"
                    }
                },
                report: {
                    enabled: false,
                    label: {
                        singular: "report",
                        plural: "reports",
                        link: "Report",
                        icon: "assignment",
                        color: "#AD1457"
                    },
                    notes: []
                }
            }
        };

        this.reports = [];
        this.notebook = {};
        this.notebook.allItems = [];
        this.notebook.items = {};
        this.notebook.deletedItems = [];

        this.notebookConfig = {};
        if (this.ProjectService.project) {
            // get notebook config from project
            this.notebookConfig = this.ProjectService.project.notebook;
            // update local notebook config, preserving any defaults that aren't overriden
            if (this.notebookConfig !== null && typeof this.notebookConfig === 'object') {
                this.config = angular.merge(this.config, this.notebookConfig);
            }
        }

    }

    addItem(notebookItem) {
        this.notebook.allItems.push(notebookItem);

        this.groupNotebookItems();

        // the current node is about to change
        this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
    };

    editItem(ev, itemId) {
        // boradcast edit notebook item event
        this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
    };

    addNewItem(ev, file) {
        // boradcast create new notebook item event
        this.$rootScope.$broadcast('addNewNote', {ev: ev, file: file});
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

    getLatestNotebookItemByLocalNotebookItemId(itemId) {
        if (this.notebook.items.hasOwnProperty(itemId)) {
            let items = this.notebook.items[itemId];
            return items.last();
        } else {
            return null;
        }
    }

    // returns student's report item if they've done work, or the template if they haven't.
    getLatestNotebookReportItemByReportId(reportId) {
        return this.getLatestNotebookItemByLocalNotebookItemId(reportId);
    }

    // returns the authored report item
    getTemplateReportItemByReportId(reportId) {
        let templateReportItem = null;
        let reportNotes = this.notebookConfig.itemTypes.report.notes;
        for (let i = 0; i < reportNotes.length; i++) {
            let reportNote = reportNotes[i];
            if (reportNote.reportId == reportId) {
                templateReportItem = {};
                templateReportItem.id = null;
                templateReportItem.type = "report";
                templateReportItem.localNotebookItemId = reportId;
                templateReportItem.content = reportNote;
                break;
            }
        }
        return templateReportItem;
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

    getNotebookConfig() {
        return this.config;
    };

    isNotebookEnabled() {
        return this.config.enabled;
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
            this.notebook.allItems = [];  // clear local notebook items array
            var allNotebookItems = response.data;
            for (var n = 0; n < allNotebookItems.length; n++) {
                var notebookItem = allNotebookItems[n];
                if (notebookItem.studentAssetId != null) {
                    // if this notebook item is a StudentAsset item, add the association here
                    notebookItem.studentAsset = this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                } else if (notebookItem.studentWorkId != null) {
                    // if this notebook item is a StudentWork item, add the association here
                    notebookItem.studentWork = this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                } else if (notebookItem.type === "note" || notebookItem.type === "report") {
                    notebookItem.content = angular.fromJson(notebookItem.content);
                }
                if (notebookItem.serverDeleteTime == null) {
                    this.notebook.allItems.push(notebookItem);
                } else {
                    this.notebook.deletedItems.push(notebookItem)
                }
            }
            this.calculateTotalUsage();

            // now group notebook items based on item.localNotebookItemId
            this.groupNotebookItems();

            return this.notebook;
        });
    };

    /**
     * Groups the notebook items together in to a map-like structure inside this.notebook.items.
     * {
     *    "abc123": [{localNotebookItemId:"abc123", "text":"first revision"}, {localNotebookItemId:"abc123", "text":"second revision"}],
     *    "def456": [{localNotebookItemId:"def456", "text":"hello"}, {localNotebookItemId:"def456", "text":"hello my friend"}]
     * }
     */
    groupNotebookItems() {
        this.notebook.items = {};
        for (let ni = 0; ni < this.notebook.allItems.length; ni++) {
            let notebookItem = this.notebook.allItems[ni];
            let notebookItemLocalNotebookItemId = notebookItem.localNotebookItemId;
            if (this.notebook.items.hasOwnProperty(notebookItemLocalNotebookItemId)) {
                // if this was already added before, we'll append this notebook item to the array
                this.notebook.items[notebookItemLocalNotebookItemId].push(notebookItem);
            } else {
                // otherwise, we'll create a new field and add the item to the array
                this.notebook.items[notebookItemLocalNotebookItemId] = [notebookItem];
            }
        }
    }

    hasStudentWorkNotebookItem(studentWork) {
        for (var i = 0; i < this.notebook.items.length; i++) {
            var notebookItem = this.notebook.items[i];
            if (notebookItem.studentWorkId === studentWork.id) {
                return true;
            }
        }
        return false;
    };

    saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content) {
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
            params.localNotebookItemId = localNotebookItemId;
            params.nodeId = nodeId;
            params.type = type;
            params.title = title;
            params.content = angular.toJson(content);
            params.clientSaveTime = Date.parse(new Date());
            config.data = $.param(params);

            return this.$http(config).then((result) => {
                var notebookItem = result.data;
                if (notebookItem != null) {
                    if (notebookItem.type === "note" || notebookItem.type === "report") {
                        notebookItem.content = angular.fromJson(notebookItem.content);
                    }
                    // add/update notebook
                    this.notebook.allItems.push(notebookItem);
                    this.groupNotebookItems();

                    this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
                }
                return result.data;
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
                    this.notebook.allItems.push(notebookItem);
                    this.groupNotebookItems();
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
