'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

        this.filters = [
        //{'name': 'all', 'type': 'all', 'label': 'All'},
        { 'name': 'notes', 'type': 'all', 'label': 'Notes' }
        /*,
        {'name': 'questions', 'label': 'Questions'}
        */
        ];

        this.reports = [];

        this.notebook = {};
        this.notebook.allItems = [];
        this.notebook.items = {};
        this.notebook.deletedItems = [];
        this.notebookConfig = {};

        if (this.ProjectService.project != null) {
            this.notebookConfig = this.ProjectService.project.notebook;
            if (this.notebookConfig != null) {
                if (this.notebookConfig.report != null && this.notebookConfig.report.enabled) {
                    var reportNotes = this.notebookConfig.report.notes;
                    for (var i = 0; i < reportNotes.length; i++) {
                        var reportNote = reportNotes[i];
                        this.filters.push({
                            "name": reportNote.reportId,
                            "type": "report",
                            "label": reportNote.title
                        });
                    }
                }
            }
        }
    }

    _createClass(NotebookService, [{
        key: 'toggleNotebook',
        value: function toggleNotebook(ev) {
            this.$rootScope.$broadcast('toggleNotebook', { ev: ev });
        }
    }, {
        key: 'addItem',
        value: function addItem(notebookItem) {
            this.notebook.allItems.push(notebookItem);

            this.groupNotebookItems();

            // the current node is about to change
            this.$rootScope.$broadcast('notebookUpdated', { notebook: this.notebook });
        }
    }, {
        key: 'editItem',
        value: function editItem(itemId, ev) {
            // boradcast edit notebook item event
            this.$rootScope.$broadcast('editNote', { item: itemId, ev: ev });
        }
    }, {
        key: 'addNewItem',
        value: function addNewItem(ev, file) {
            // boradcast create new notebook item event
            this.$rootScope.$broadcast('addNewNote', { ev: ev, file: file });
        }
    }, {
        key: 'deleteItem',
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
        key: 'getLatestNotebookItemByLocalNotebookItemId',
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
        key: 'getLatestNotebookReportItemByReportId',
        value: function getLatestNotebookReportItemByReportId(reportId) {
            return this.getLatestNotebookItemByLocalNotebookItemId(reportId);
        }

        // returns the authored report item

    }, {
        key: 'getTemplateReportItemByReportId',
        value: function getTemplateReportItemByReportId(reportId) {
            var templateReportItem = null;
            var reportNotes = this.notebookConfig.report.notes;
            for (var i = 0; i < reportNotes.length; i++) {
                var reportNote = reportNotes[i];
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
    }, {
        key: 'calculateTotalUsage',
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
        key: 'getNotebookConfig',
        value: function getNotebookConfig() {
            return this.notebookConfig;
        }
    }, {
        key: 'isNotebookEnabled',
        value: function isNotebookEnabled() {
            return this.notebookConfig.enabled;
        }
    }, {
        key: 'retrieveNotebookItems',
        value: function retrieveNotebookItems() {
            var _this = this;

            var config = {};
            config.method = 'GET';
            config.url = this.ConfigService.getStudentNotebookURL();
            config.params = {};
            config.params.periodId = this.ConfigService.getPeriodId();
            config.params.workgroupId = this.ConfigService.getWorkgroupId();
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
                    if (notebookItem.serverDeleteTime == null) {
                        _this.notebook.allItems.push(notebookItem);
                    } else {
                        _this.notebook.deletedItems.push(notebookItem);
                    }
                }
                _this.calculateTotalUsage();

                // now group notebook items based on item.localNotebookItemId
                _this.groupNotebookItems();

                return _this.notebook;
            });
        }
    }, {
        key: 'groupNotebookItems',


        /**
         * Groups the notebook items together in to a map-like structure inside this.notebook.items.
         * {
         *    "abc123": [{localNotebookItemId:"abc123", "text":"first revision"}, {localNotebookItemId:"abc123", "text":"second revision"}],
         *    "def456": [{localNotebookItemId:"def456", "text":"hello"}, {localNotebookItemId:"def456", "text":"hello my friend"}]
         * }
         */
        value: function groupNotebookItems() {
            this.notebook.items = {};
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
        }
    }, {
        key: 'hasStudentWorkNotebookItem',
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
        key: 'saveNotebookItem',
        value: function saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content) {
            var _this2 = this;

            if (this.ConfigService.isPreview()) {
                return this.$q(function (resolve, reject) {
                    var notebookItem = {
                        type: type,
                        content: content
                    };
                    _this2.notebook.items.push(notebookItem);
                    _this2.$rootScope.$broadcast('notebookUpdated', { notebook: _this2.notebook });
                    resolve();
                });
            } else {
                var config = {};
                config.method = 'POST';
                config.url = this.ConfigService.getStudentNotebookURL();
                config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
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
                    return null;
                });
            }
        }
    }, {
        key: 'uploadStudentAssetNotebookItem',
        value: function uploadStudentAssetNotebookItem(file) {
            var _this3 = this;

            this.StudentAssetService.uploadAsset(file).then(function (studentAsset) {

                var config = {};
                config.method = 'POST';
                config.url = _this3.ConfigService.getStudentNotebookURL();
                config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                var params = {};
                params.workgroupId = _this3.ConfigService.getWorkgroupId();
                params.periodId = _this3.ConfigService.getPeriodId();
                params.studentAssetId = studentAsset.id;
                params.clientSaveTime = Date.parse(new Date());

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
        key: 'saveNotebookToggleEvent',
        value: function saveNotebookToggleEvent(isOpen, currentNode) {
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Notebook";
            var eventData = {};
            eventData.curentNodeId = currentNode == null ? null : currentNode.id;

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