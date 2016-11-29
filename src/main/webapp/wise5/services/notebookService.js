"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookService = function () {
    function NotebookService($http, $q, $rootScope, ConfigService, ProjectService, StudentAssetService, StudentDataService) {
        _classCallCheck(this, NotebookService);

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
            if (this.notebookConfig !== null && _typeof(this.notebookConfig) === 'object') {
                this.config = angular.merge(this.config, this.notebookConfig);
            }
        }
    }

    _createClass(NotebookService, [{
        key: "addItem",
        value: function addItem(notebookItem) {
            this.notebook.allItems.push(notebookItem);
            this.groupNotebookItems();

            // the current node is about to change
            this.$rootScope.$broadcast('notebookUpdated', { notebook: this.notebook });
        }
    }, {
        key: "editItem",
        value: function editItem(ev, itemId) {
            // broadcast edit notebook item event
            this.$rootScope.$broadcast('editNote', { itemId: itemId, ev: ev });
        }
    }, {
        key: "addNewItem",
        value: function addNewItem(ev, file) {
            // broadcast create new notebook item event
            this.$rootScope.$broadcast('addNewNote', { ev: ev, file: file });
        }
    }, {
        key: "deleteItem",
        value: function deleteItem(itemToDelete) {
            var items = this.notebook.items;
            var deletedItems = this.notebook.deletedItems;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item === itemToDelete) {
                    items.splice(i, 1);
                    deletedItems.push(itemToDelete);
                }
            }
        }
    }, {
        key: "getLatestNotebookItemByLocalNotebookItemId",
        value: function getLatestNotebookItemByLocalNotebookItemId(itemId) {
            if (this.notebook.items.hasOwnProperty(itemId)) {
                var items = this.notebook.items[itemId];
                return items.last();
            } else {
                return null;
            }
        }

        // returns student's report item if they've done work, or the template if they haven't.

    }, {
        key: "getLatestNotebookReportItemByReportId",
        value: function getLatestNotebookReportItemByReportId(reportId) {
            return this.getLatestNotebookItemByLocalNotebookItemId(reportId);
        }

        // returns the authored report item

    }, {
        key: "getTemplateReportItemByReportId",
        value: function getTemplateReportItemByReportId(reportId) {
            var templateReportItem = null;
            var reportNotes = this.notebookConfig.itemTypes.report.notes;
            for (var i = 0; i < reportNotes.length; i++) {
                var reportNote = reportNotes[i];
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
    }, {
        key: "calculateTotalUsage",
        value: function calculateTotalUsage() {
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
        }
    }, {
        key: "getNotebookConfig",
        value: function getNotebookConfig() {
            return this.config;
        }
    }, {
        key: "isNotebookEnabled",
        value: function isNotebookEnabled() {
            return this.config.enabled;
        }
    }, {
        key: "retrieveNotebookItems",
        value: function retrieveNotebookItems() {
            var _this = this;

            var workgroupId = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
            var periodId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            var config = {
                method: 'GET',
                url: this.ConfigService.getStudentNotebookURL(),
                params: {}
            };
            if (workgroupId != null) {
                config.params.workgroupId = workgroupId;
            }
            if (periodId != null) {
                config.params.periodId = periodId;
            }
            return this.$http(config).then(function (response) {
                // loop through the assets and make them into JSON object with more details
                _this.notebook.allItems = []; // clear local notebook items array
                var allNotebookItems = response.data;
                for (var n = 0; n < allNotebookItems.length; n++) {
                    var notebookItem = allNotebookItems[n];
                    if (notebookItem.studentAssetId != null) {
                        // if this notebook item is a StudentAsset item, add the association here
                        notebookItem.studentAsset = _this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                    } else if (notebookItem.studentWorkId != null) {
                        // if this notebook item is a StudentWork item, add the association here
                        notebookItem.studentWork = _this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                    } else if (notebookItem.type === "note" || notebookItem.type === "report") {
                        notebookItem.content = angular.fromJson(notebookItem.content);
                    }
                    _this.notebook.allItems.push(notebookItem);
                }
                _this.calculateTotalUsage();
                _this.groupNotebookItems(); // group notebook items based on item.localNotebookItemId

                return _this.notebook;
            });
        }
    }, {
        key: "groupNotebookItems",


        /**
         * Groups the notebook items together in to a map-like structure inside this.notebook.items.
         * {
         *    "abc123": [{localNotebookItemId:"abc123", "text":"first revision"}, {localNotebookItemId:"abc123", "text":"second revision"}],
         *    "def456": [{localNotebookItemId:"def456", "text":"hello"}, {localNotebookItemId:"def456", "text":"hello my friend"}]
         * }
         */
        value: function groupNotebookItems() {
            this.notebook.items = {}; // reset items
            this.notebook.deletedItems = {}; // reset deleted items
            for (var ni = 0; ni < this.notebook.allItems.length; ni++) {
                var notebookItem = this.notebook.allItems[ni];
                var notebookItemLocalNotebookItemId = notebookItem.localNotebookItemId;
                if (this.notebook.items.hasOwnProperty(notebookItemLocalNotebookItemId)) {
                    // if this was already added before, we'll append this notebook item to the array
                    this.notebook.items[notebookItemLocalNotebookItemId].push(notebookItem);
                } else {
                    // otherwise, we'll create a new field and add the item to the array
                    this.notebook.items[notebookItemLocalNotebookItemId] = [notebookItem];
                }
            }
            // now go through the items and look at the last revision of each item. If it's deleted, then move the entire item array to deletedItems
            for (var notebookItemLocalNotebookItemIdKey in this.notebook.items) {
                if (this.notebook.items.hasOwnProperty(notebookItemLocalNotebookItemIdKey)) {
                    // get the last note revision
                    var allRevisionsForThisLocalNotebookItemId = this.notebook.items[notebookItemLocalNotebookItemIdKey];
                    if (allRevisionsForThisLocalNotebookItemId != null) {
                        var lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
                        if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                            // the last revision for this not deleted, so move the entire note (with all its revisions) to deletedItems
                            this.notebook.deletedItems[notebookItemLocalNotebookItemIdKey] = allRevisionsForThisLocalNotebookItemId;
                            delete this.notebook.items[notebookItemLocalNotebookItemIdKey]; // then remove it from the items array
                        }
                    }
                }
            }
        }
    }, {
        key: "hasStudentWorkNotebookItem",
        value: function hasStudentWorkNotebookItem(studentWork) {
            for (var i = 0; i < this.notebook.items.length; i++) {
                var notebookItem = this.notebook.items[i];
                if (notebookItem.studentWorkId === studentWork.id) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: "saveNotebookItem",
        value: function saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content) {
            var _this2 = this;

            var clientSaveTime = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];
            var clientDeleteTime = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];

            if (this.ConfigService.isPreview()) {
                return this.$q(function (resolve, reject) {
                    var notebookItem = {
                        content: content,
                        localNotebookItemId: localNotebookItemId,
                        nodeId: nodeId,
                        notebookItemId: notebookItemId,
                        title: title,
                        type: type,
                        clientSaveTime: clientSaveTime,
                        clientDeleteTime: clientDeleteTime
                    };
                    _this2.notebook.allItems.push(notebookItem);
                    _this2.groupNotebookItems();
                    _this2.$rootScope.$broadcast('notebookUpdated', { notebook: _this2.notebook });
                    resolve();
                });
            } else {
                var config = {
                    method: "POST",
                    url: this.ConfigService.getStudentNotebookURL(),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                };
                var params = {
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

                return this.$http(config).then(function (result) {
                    var notebookItem = result.data;
                    if (notebookItem != null) {
                        if (notebookItem.type === "note" || notebookItem.type === "report") {
                            notebookItem.content = angular.fromJson(notebookItem.content);
                        }
                        // add/update notebook
                        _this2.notebook.allItems.push(notebookItem);
                        _this2.groupNotebookItems();

                        _this2.$rootScope.$broadcast('notebookUpdated', { notebook: _this2.notebook });
                    }
                    return result.data;
                });
            }
        }
    }, {
        key: "uploadStudentAssetNotebookItem",
        value: function uploadStudentAssetNotebookItem(file) {
            var _this3 = this;

            this.StudentAssetService.uploadAsset(file).then(function (studentAsset) {

                var config = {
                    method: 'POST',
                    url: _this3.ConfigService.getStudentNotebookURL(),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                };
                var params = {
                    workgroupId: _this3.ConfigService.getWorkgroupId(),
                    periodId: _this3.ConfigService.getPeriodId(),
                    studentAssetId: studentAsset.id,
                    clientSaveTime: Date.parse(new Date())
                };
                config.data = $.param(params);

                return _this3.$http(config).then(function (result) {
                    var notebookItem = result.data;
                    if (notebookItem != null) {
                        notebookItem.studentAsset = _this3.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                        _this3.notebook.allItems.push(notebookItem);
                        _this3.groupNotebookItems();
                    }
                    _this3.calculateTotalUsage();
                    return notebookItem;
                });
            });
        }
    }, {
        key: "saveNotebookToggleEvent",
        value: function saveNotebookToggleEvent(isOpen, currentNode) {
            var nodeId = null,
                componentId = null,
                componentType = null,
                category = "Notebook";
            var eventData = {
                curentNodeId: currentNode == null ? null : currentNode.id
            };
            var event = isOpen ? "notebookOpened" : "notebookClosed";

            // save notebook open/close event
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
        }
    }]);

    return NotebookService;
}();

NotebookService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = NotebookService;
//# sourceMappingURL=notebookService.js.map