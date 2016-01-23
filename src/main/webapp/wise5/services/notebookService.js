'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotebookService = function () {
    function NotebookService($http, $rootScope, ConfigService, StudentAssetService, StudentDataService) {
        _classCallCheck(this, NotebookService);

        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        this.filters = [{ 'name': 'all', 'label': 'All' },
        //{'name': 'work', 'label': 'Work'}, TODO: uncomment me when adding student work to notebook is styled and ready for use in a run
        { 'name': 'files', 'label': 'Files' }
        //{'name': 'ideas', 'label': 'Ideas'} TODO: Add when Idea Manager is active
        ];

        this.notebook = {};
        this.notebook.items = [];
        this.notebook.deletedItems = [];
    }

    _createClass(NotebookService, [{
        key: 'getFilters',
        value: function getFilters() {
            return this.filters;
        }
    }, {
        key: 'addItem',
        value: function addItem(notebookItem) {
            this.notebook.items.push(notebookItem);

            // the current node is about to change
            this.$rootScope.$broadcast('notebookUpdated', { notebook: this.notebook });
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
                _this.notebook.items = []; // clear local notebook items array
                var result = [];
                var allNotebookItems = response.data;
                for (var n = 0; n < allNotebookItems.length; n++) {
                    var notebookItem = allNotebookItems[n];
                    if (notebookItem.studentAssetId != null) {
                        // if this notebook item is a StudentAsset item, add the association here
                        notebookItem.studentAsset = _this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                    } else if (notebookItem.studentWorkId != null) {
                        // if this notebook item is a StudentWork item, add the association here
                        notebookItem.studentWork = _this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                    }
                    if (notebookItem.serverDeleteTime == null) {
                        _this.notebook.items.push(notebookItem);
                    } else {
                        _this.notebook.deletedItems.push(notebookItem);
                    }
                }
                _this.calculateTotalUsage();

                return _this.notebook;
            });
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
        key: 'addStudentWorkNotebookItem',
        value: function addStudentWorkNotebookItem(studentWork) {
            var _this2 = this;

            // don't allow duplicate student work notebook items
            if (this.hasStudentWorkNotebookItem(studentWork)) {
                this.$rootScope.$broadcast('notebookAddDuplicateAttempt');
                return;
            }

            var config = {};
            config.method = 'POST';
            config.url = this.ConfigService.getStudentNotebookURL();
            config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            var params = {};
            params.workgroupId = this.ConfigService.getWorkgroupId();
            params.periodId = this.ConfigService.getPeriodId();
            params.nodeId = studentWork.nodeId;
            params.componentId = studentWork.componentId;
            params.studentWorkId = studentWork.id;
            params.clientSaveTime = Date.parse(new Date());

            config.data = $.param(params);

            return this.$http(config).then(function (result) {
                var notebookItem = result.data;
                if (notebookItem != null) {
                    notebookItem.studentWork = studentWork;
                    _this2.notebook.items.push(notebookItem);
                }
                return null;
            });
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
                        _this3.notebook.items.push(notebookItem);
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

NotebookService.$inject = ['$http', '$rootScope', 'ConfigService', 'StudentAssetService', 'StudentDataService'];

exports.default = NotebookService;

//# sourceMappingURL=notebookService.js.map