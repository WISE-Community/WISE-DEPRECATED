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
            enabled: false,
            label: "Notebook",
            enableAddNew: true,
            itemTypes: {
                note: {
                    enabled: true,
                    enableLink: true,
                    enableClipping: true,
                    enableStudentUploads: true,
                    type: "note",
                    label: {
                        singular: "note",
                        plural: "notes",
                        link: "Notes",
                        icon: "note",
                        color: "#1565C0"
                    }
                },
                question: {
                    enabled: false,
                    enableLink: true,
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
        this.notebook.deletedItems = {};

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
        // broadcast edit notebook item event
        this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
    };

    addNewItem(ev, file) {
        // broadcast create new notebook item event
        this.$rootScope.$broadcast('addNewNote', {ev: ev, file: file});
    };

    deleteItem(itemToDelete) {
        let items = this.notebook.items;
        let deletedItems = this.notebook.deletedItems;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item === itemToDelete) {
                items.splice(i, 1);
                deletedItems.push(itemToDelete);
            }
        }
    };

    // looks up notebook item by local notebook item id, including deleted notes
    getLatestNotebookItemByLocalNotebookItemId(itemId) {
        if (this.notebook.items.hasOwnProperty(itemId)) {
            let items = this.notebook.items[itemId];
            return items.last();
        } else if (this.notebook.deletedItems.hasOwnProperty(itemId)) {
            let items = this.notebook.deletedItems[itemId];
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
                templateReportItem = {
                    id: null,
                    type: "report",
                    localNotebookItemId: reportId,
                    content: reportNote
                };
                break;
            }
        }
        return templateReportItem;
    }

    calculateTotalUsage() {
        // get the total size
        let totalSizeSoFar = 0;
        for (let i = 0; i < this.notebook.items.length; i++) {
            let notebookItem = this.notebook.items[i];
            if (notebookItem.studentAsset != null) {
                let notebookItemSize = notebookItem.studentAsset.fileSize;
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

    retrieveNotebookItems(workgroupId = null, periodId = null) {
        let config = {
            method : 'GET',
            url : this.ConfigService.getStudentNotebookURL(),
            params : {}
        };
        if (workgroupId != null) {
            config.params.workgroupId = workgroupId;
        }
        if (periodId != null) {
            config.params.periodId = periodId;
        }
        return this.$http(config).then((response) => {
            // loop through the assets and make them into JSON object with more details
            this.notebook.allItems = [];  // clear local notebook items array
            let allNotebookItems = response.data;
            for (let n = 0; n < allNotebookItems.length; n++) {
                let notebookItem = allNotebookItems[n];
                if (notebookItem.studentAssetId != null) {
                    // if this notebook item is a StudentAsset item, add the association here
                    notebookItem.studentAsset = this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                } else if (notebookItem.studentWorkId != null) {
                    // if this notebook item is a StudentWork item, add the association here
                    notebookItem.studentWork = this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                } else if (notebookItem.type === "note" || notebookItem.type === "report") {
                    notebookItem.content = angular.fromJson(notebookItem.content);
                }
                this.notebook.allItems.push(notebookItem);
            }
            this.calculateTotalUsage();
            this.groupNotebookItems(); // group notebook items based on item.localNotebookItemId

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
        this.notebook.items = {}; // reset items
        this.notebook.deletedItems = {};  // reset deleted items
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
        // now go through the items and look at the last revision of each item. If it's deleted, then move the entire item array to deletedItems
        for (let notebookItemLocalNotebookItemIdKey in this.notebook.items) {
            if (this.notebook.items.hasOwnProperty(notebookItemLocalNotebookItemIdKey)) {
                // get the last note revision
                let allRevisionsForThisLocalNotebookItemId = this.notebook.items[notebookItemLocalNotebookItemIdKey];
                if (allRevisionsForThisLocalNotebookItemId != null) {
                    let lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
                    if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                        // the last revision for this not deleted, so move the entire note (with all its revisions) to deletedItems
                        this.notebook.deletedItems[notebookItemLocalNotebookItemIdKey] = allRevisionsForThisLocalNotebookItemId;
                        delete this.notebook.items[notebookItemLocalNotebookItemIdKey];  // then remove it from the items array
                    }
                }
            }
        }
    }

    hasStudentWorkNotebookItem(studentWork) {
        for (let i = 0; i < this.notebook.items.length; i++) {
            let notebookItem = this.notebook.items[i];
            if (notebookItem.studentWorkId === studentWork.id) {
                return true;
            }
        }
        return false;
    };

    saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content, clientSaveTime = null, clientDeleteTime = null) {
        if (this.ConfigService.isPreview()) {
            return this.$q((resolve, reject) => {
                let notebookItem = {
                    content: content,
                    localNotebookItemId: localNotebookItemId,
                    nodeId: nodeId,
                    notebookItemId: notebookItemId,
                    title: title,
                    type: type,
                    clientSaveTime: clientSaveTime,
                    clientDeleteTime: clientDeleteTime
                };
                this.notebook.allItems.push(notebookItem);
                this.groupNotebookItems();
                this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebook});
                resolve();
            });
        } else {
            let config = {
                method: "POST",
                url: this.ConfigService.getStudentNotebookURL(),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            };
            let params = {
                workgroupId: this.ConfigService.getWorkgroupId(),
                periodId: this.ConfigService.getPeriodId(),
                notebookItemId: notebookItemId,
                localNotebookItemId: localNotebookItemId,
                nodeId: nodeId,
                type: type,
                title: title,
                content: angular.toJson(content),
                clientSaveTime: Date.parse(new Date()),
                clientDeleteTime: clientDeleteTime
            };
            if (params.clientSaveTime == null) {
                params.clientSaveTime = Date.parse(new Date());
            }
            config.data = $.param(params);

            return this.$http(config).then((result) => {
                let notebookItem = result.data;
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

            let config = {
                method: 'POST',
                url: this.ConfigService.getStudentNotebookURL(),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            };
            let params = {
                workgroupId: this.ConfigService.getWorkgroupId(),
                periodId: this.ConfigService.getPeriodId(),
                studentAssetId: studentAsset.id,
                clientSaveTime: Date.parse(new Date())
            };
            config.data = $.param(params);

            return this.$http(config).then((result) => {
                let notebookItem = result.data;
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
        let nodeId = null, componentId = null, componentType = null, category = "Notebook";
        let eventData = {
            curentNodeId: currentNode == null ? null : currentNode.id
        };
        let event = isOpen ? "notebookOpened" : "notebookClosed";

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
