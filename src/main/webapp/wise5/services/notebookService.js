"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
      icon: "book",
      enableAddNew: true,
      addIcon: "note_add",
      itemTypes: {
        note: {
          enabled: true,
          requireTextOnEveryNote: false,
          enableLink: true,
          enableClipping: true,
          enableStudentUploads: true,
          type: "note",
          label: {
            singular: "note",
            plural: "notes",
            link: "Manage Notes",
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
            link: "Manage Questions",
            icon: "live_help",
            color: "#F57C00"
          }
        },
        report: {
          enabled: false,
          enableLink: true,
          type: "report",
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

    this.notebookConfig = {};
    if (this.ProjectService.project) {
      this.notebookConfig = this.ProjectService.project.notebook;
      // update local notebook config, preserving any defaults that aren't overriden
      if (this.notebookConfig !== null && _typeof(this.notebookConfig) === 'object') {
        this.config = angular.merge(this.config, this.notebookConfig);
      }
    }
    this.publicNotebookItems = {};
  }

  _createClass(NotebookService, [{
    key: "editItem",
    value: function editItem(ev, itemId) {
      this.$rootScope.$broadcast('editNote', { itemId: itemId, ev: ev });
    }
  }, {
    key: "addNote",
    value: function addNote(ev, file) {
      var text = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var studentWorkIds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var isEditTextEnabled = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      var isFileUploadEnabled = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;

      this.$rootScope.$broadcast('addNote', { ev: ev, file: file, text: text, studentWorkIds: studentWorkIds,
        isEditTextEnabled: isEditTextEnabled, isFileUploadEnabled: isFileUploadEnabled });
    }
  }, {
    key: "deleteItem",
    value: function deleteItem(itemId) {
      var noteCopy = angular.copy(this.getLatestNotebookItemByLocalNotebookItemId(itemId));
      noteCopy.id = null; // set to null so we're creating a new notebook item
      noteCopy.content.clientSaveTime = Date.parse(new Date());
      var clientDeleteTime = Date.parse(new Date());
      return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
    }
  }, {
    key: "reviveItem",
    value: function reviveItem(itemId) {
      var noteCopy = angular.copy(this.getLatestNotebookItemByLocalNotebookItemId(itemId));
      noteCopy.id = null; // set to null so we're creating a new notebook item
      noteCopy.content.clientSaveTime = Date.parse(new Date());
      var clientDeleteTime = null; // if delete timestamp is null, then we are in effect un-deleting this note item
      return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
    }

    // looks up notebook item by local notebook item id, including deleted notes

  }, {
    key: "getLatestNotebookItemByLocalNotebookItemId",
    value: function getLatestNotebookItemByLocalNotebookItemId(itemId) {
      var workgroupId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.getNotebookByWorkgroup(workgroupId).items.hasOwnProperty(itemId)) {
        var items = this.getNotebookByWorkgroup(workgroupId).items[itemId];
        return items.last();
      } else if (this.getNotebookByWorkgroup(workgroupId).deletedItems.hasOwnProperty(itemId)) {
        var _items = this.getNotebookByWorkgroup(workgroupId).deletedItems[itemId];
        return _items.last();
      } else {
        return null;
      }
    }

    // returns student's report item if they've done work, or the template if they haven't

  }, {
    key: "getLatestNotebookReportItemByReportId",
    value: function getLatestNotebookReportItemByReportId(reportId) {
      var workgroupId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      return this.getLatestNotebookItemByLocalNotebookItemId(reportId, workgroupId);
    }

    // returns the authored report item

  }, {
    key: "getTemplateReportItemByReportId",
    value: function getTemplateReportItemByReportId(reportId) {
      var reportNotes = this.notebookConfig.itemTypes.report.notes;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = reportNotes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var reportNote = _step.value;

          if (reportNote.reportId == reportId) {
            var templateReportItem = {
              id: null,
              type: "report",
              localNotebookItemId: reportId,
              content: reportNote
            };
            return templateReportItem;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return null;
    }
  }, {
    key: "calculateTotalUsage",
    value: function calculateTotalUsage() {
      // get the total size
      /*
      let totalSizeSoFar = 0;
      for (let i = 0; i < this.getNotebookByWorkgroup().items.length; i++) {
          const notebookItem = this.getNotebookByWorkgroup().items[i];
          if (notebookItem.studentAsset != null) {
              const notebookItemSize = notebookItem.studentAsset.fileSize;
              totalSizeSoFar += notebookItemSize;
          }
      }
      this.getNotebookByWorkgroup().totalSize = totalSizeSoFar;
      this.getNotebookByWorkgroup().totalSizeMax = this.ConfigService.getStudentMaxTotalAssetsSize();
      this.getNotebookByWorkgroup().usagePercentage = this.notebook.totalSize / this.notebook.totalSizeMax * 100;
      */
    }
  }, {
    key: "getNotebookConfig",
    value: function getNotebookConfig() {
      return this.config;
    }
  }, {
    key: "getReportNoteContentByReportId",


    /**
     * Returns the report content for the specified reportId, or null if not exists.
     * @param reportId
     */
    value: function getReportNoteContentByReportId(reportId) {
      var reportNotes = this.notebookConfig.itemTypes.report.notes;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = reportNotes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var reportNote = _step2.value;

          if (reportNote.reportId === reportId) {
            return reportNote;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return null;
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

      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var periodId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.ConfigService.isPreview()) {
        // we are previewing the project, initialize dummy student data
        var _workgroupId = this.ConfigService.getWorkgroupId();
        this.notebooksByWorkgroup = {};
        this.notebooksByWorkgroup[_workgroupId] = {};
        this.notebooksByWorkgroup[_workgroupId].allItems = [];
        this.notebooksByWorkgroup[_workgroupId].items = [];
        this.notebooksByWorkgroup[_workgroupId].deletedItems = [];
        this.groupNotebookItems();
        // if we're in preview, don't make any request to the server but pretend we did
        var deferred = this.$q.defer();
        deferred.resolve(this.notebooksByWorkgroup[_workgroupId]);
        return deferred.promise;
      } else {
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
          _this.notebooksByWorkgroup = {};
          var allNotebookItems = response.data;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = allNotebookItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var notebookItem = _step3.value;

              try {
                if (notebookItem.studentAssetId != null) {
                  // if this notebook item is a StudentAsset item, add the association here
                  notebookItem.studentAsset = _this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
                } else if (notebookItem.studentWorkId != null) {
                  // if this notebook item is a StudentWork item, add the association here
                  notebookItem.studentWork = _this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
                } else if (notebookItem.type === "note" || notebookItem.type === "report") {
                  notebookItem.content = angular.fromJson(notebookItem.content);
                }
                var _workgroupId2 = notebookItem.workgroupId;
                if (_this.notebooksByWorkgroup.hasOwnProperty(_workgroupId2)) {
                  // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
                  _this.notebooksByWorkgroup[_workgroupId2].allItems.push(notebookItem);
                } else {
                  // otherwise, we'll create a new notebook field and add the item to the array
                  _this.notebooksByWorkgroup[_workgroupId2] = { allItems: [notebookItem] };
                }
              } catch (e) {
                // keep going, ignore this error
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          _this.groupNotebookItems(); // group notebook items based on item.localNotebookItemId
          _this.calculateTotalUsage();

          return _this.notebooksByWorkgroup;
        });
      }
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
      for (var workgroupId in this.notebooksByWorkgroup) {
        if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
          var notebookByWorkgroup = this.notebooksByWorkgroup[workgroupId];
          notebookByWorkgroup.items = {};
          notebookByWorkgroup.deletedItems = {}; // reset deleted items
          for (var ni = 0; ni < notebookByWorkgroup.allItems.length; ni++) {
            var notebookItem = notebookByWorkgroup.allItems[ni];
            var notebookItemLocalNotebookItemId = notebookItem.localNotebookItemId;
            if (notebookByWorkgroup.items.hasOwnProperty(notebookItemLocalNotebookItemId)) {
              // if this was already added before, we'll append this notebook item to the array
              notebookByWorkgroup.items[notebookItemLocalNotebookItemId].push(notebookItem);
            } else {
              // otherwise, we'll create a new field and add the item to the array
              notebookByWorkgroup.items[notebookItemLocalNotebookItemId] = [notebookItem];
            }
          }
          // now go through the items and look at the last revision of each item. If it's deleted, then move the entire item array to deletedItems
          for (var notebookItemLocalNotebookItemIdKey in notebookByWorkgroup.items) {
            if (notebookByWorkgroup.items.hasOwnProperty(notebookItemLocalNotebookItemIdKey)) {
              // get the last note revision
              var allRevisionsForThisLocalNotebookItemId = notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
              if (allRevisionsForThisLocalNotebookItemId != null) {
                var lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
                if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                  // the last revision for this not deleted, so move the entire note (with all its revisions) to deletedItems
                  notebookByWorkgroup.deletedItems[notebookItemLocalNotebookItemIdKey] = allRevisionsForThisLocalNotebookItemId;
                  delete notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey]; // then remove it from the items array
                }
              }
            }
          }
        }
      }
    }

    /**
     * Returns the notebook item with the specified notebook item id.
     */

  }, {
    key: "getPrivateNotebookItemById",
    value: function getPrivateNotebookItemById(notebookItemId) {
      var workgroupId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var notebookByWorkgroup = this.getNotebookByWorkgroup(workgroupId);
      if (notebookByWorkgroup != null) {
        var allNotebookItems = notebookByWorkgroup.allItems;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = allNotebookItems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var notebookItem = _step4.value;

            if (notebookItem.id === notebookItemId) {
              return notebookItem;
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }
  }, {
    key: "getNotebookItemById",
    value: function getNotebookItemById(notebookItemId) {
      var workgroupId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var notebookItem = this.getPrivateNotebookItemById(notebookItemId, workgroupId);
      if (notebookItem == null) {
        notebookItem = this.getPublicNotebookItemById(notebookItemId);
      }
      return notebookItem;
    }
  }, {
    key: "getPublicNotebookItem",
    value: function getPublicNotebookItem(group, localNotebookItemId, workgroupId) {
      var publicNotebookItemsInGroup = this.publicNotebookItems[group];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = publicNotebookItemsInGroup[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var publicNotebookItemInGroup = _step5.value;

          if (publicNotebookItemInGroup.localNotebookItemId === localNotebookItemId && publicNotebookItemInGroup.workgroupId === workgroupId) {
            return publicNotebookItemInGroup;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return null;
    }
  }, {
    key: "getPublicNotebookItemById",
    value: function getPublicNotebookItemById(id) {
      for (var group in this.publicNotebookItems) {
        var itemsInGroup = this.publicNotebookItems[group];
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = itemsInGroup[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var itemInGroup = _step6.value;

            if (id == itemInGroup.id) {
              return itemInGroup;
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
      return null;
    }
  }, {
    key: "getNotebookByWorkgroup",
    value: function getNotebookByWorkgroup() {
      var workgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (workgroupId == null) {
        workgroupId = this.ConfigService.getWorkgroupId();
      }
      var notebookByWorkgroup = this.notebooksByWorkgroup[workgroupId];
      if (notebookByWorkgroup == null) {
        notebookByWorkgroup = {
          allItems: [],
          items: {},
          deletedItems: {}
        };
      }
      return notebookByWorkgroup;
    }
  }, {
    key: "retrievePublicNotebookItems",
    value: function retrievePublicNotebookItems() {
      var _this2 = this;

      var group = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var periodId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.ConfigService.isPreview()) {
        // // we are previewing the project, initialize dummy student data
        // const workgroupId = this.ConfigService.getWorkgroupId();
        // this.notebooksByWorkgroup = {};
        // this.notebooksByWorkgroup[workgroupId] = {};
        // this.notebooksByWorkgroup[workgroupId].allItems = [];
        // this.notebooksByWorkgroup[workgroupId].items = [];
        // this.notebooksByWorkgroup[workgroupId].deletedItems = [];
        // this.groupNotebookItems();
        // // if we're in preview, don't make any request to the server but pretend we did
        var deferred = this.$q.defer();
        deferred.resolve({});
        return deferred.promise;
      } else {
        var config = {
          method: 'GET',
          url: this.ConfigService.getStudentNotebookURL() + ("/group/" + group),
          params: {}
        };
        if (periodId != null) {
          config.params.periodId = periodId;
        }
        return this.$http(config).then(function (response) {
          var publicNotebookItemsForGroup = response.data;
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = publicNotebookItemsForGroup[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var publicNotebookItemForGroup = _step7.value;

              publicNotebookItemForGroup.content = angular.fromJson(publicNotebookItemForGroup.content);
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          _this2.publicNotebookItems[group] = publicNotebookItemsForGroup;
          _this2.$rootScope.$broadcast("publicNotebookItemsRetrieved", { publicNotebookItems: _this2.publicNotebookItems });
          return _this2.publicNotebookItems;
        });
      }
    }
  }, {
    key: "saveNotebookItem",
    value: function saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content) {
      var groups = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [];

      var _this3 = this;

      var clientSaveTime = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
      var clientDeleteTime = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : null;

      if (this.ConfigService.isPreview()) {
        return this.$q(function (resolve, reject) {
          var notebookItem = {
            content: content,
            localNotebookItemId: localNotebookItemId,
            nodeId: nodeId,
            notebookItemId: notebookItemId,
            title: title,
            type: type,
            workgroupId: _this3.ConfigService.getWorkgroupId(),
            groups: angular.toJson(groups),
            clientSaveTime: clientSaveTime,
            clientDeleteTime: clientDeleteTime
          };
          if (clientDeleteTime != null) {
            // preview user wants to delete this note, so mock the server deletion by setting the server delete time
            notebookItem.serverDeleteTime = clientDeleteTime;
          } else {
            notebookItem.serverDeleteTime = null;
          }
          // add/update notebook
          var workgroupId = notebookItem.workgroupId;
          if (_this3.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
            // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
            _this3.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
          } else {
            // otherwise, we'll create a new notebook field and add the item to the array
            _this3.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
          }

          _this3.groupNotebookItems();
          _this3.$rootScope.$broadcast('notebookUpdated', { notebook: _this3.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem });
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
          groups: angular.toJson(groups),
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
            var workgroupId = notebookItem.workgroupId;
            if (_this3.isNotebookItemPrivate(notebookItem)) {
              _this3.updatePrivateNotebookItem(notebookItem, workgroupId);
            }
            _this3.$rootScope.$broadcast('notebookUpdated', { notebook: _this3.notebooksByWorkgroup[workgroupId],
              notebookItem: notebookItem });
          }
          return result.data;
        });
      }
    }
  }, {
    key: "updatePrivateNotebookItem",
    value: function updatePrivateNotebookItem(notebookItem, workgroupId) {
      if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
        // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
        this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
      } else {
        // otherwise, we'll create a new notebook field and add the item to the array
        this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
      }
      this.groupNotebookItems();
    }
  }, {
    key: "isNotebookItemPublic",
    value: function isNotebookItemPublic(notebookItem) {
      return !this.isNotebookItemPrivate(notebookItem);
    }
  }, {
    key: "isNotebookItemPrivate",
    value: function isNotebookItemPrivate(notebookItem) {
      return notebookItem.groups == null;
    }
  }, {
    key: "copyNotebookItem",
    value: function copyNotebookItem(notebookItemId) {
      var _this4 = this;

      if (this.ConfigService.isPreview()) {} else {
        var config = {
          method: "POST",
          url: this.ConfigService.getStudentNotebookURL() + '/parent/' + notebookItemId,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        var params = {
          workgroupId: this.ConfigService.getWorkgroupId(),
          clientSaveTime: Date.parse(new Date())
        };
        config.data = $.param(params);
        return this.$http(config).then(function (result) {
          var notebookItem = result.data;
          return _this4.handleNewNotebookItem(notebookItem);
        });
      }
    }
  }, {
    key: "addNotebookItemToGroup",
    value: function addNotebookItemToGroup(notebookItemId, group) {
      var _this5 = this;

      if (this.ConfigService.isPreview()) {} else {
        var config = {
          method: "POST",
          url: this.ConfigService.getStudentNotebookURL() + '/group/' + group,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        var params = {
          workgroupId: this.ConfigService.getWorkgroupId(),
          notebookItemId: notebookItemId,
          clientSaveTime: Date.parse(new Date())
        };
        config.data = $.param(params);
        return this.$http(config).then(function (result) {
          var notebookItem = result.data;
          return _this5.handleNewNotebookItem(notebookItem);
        });
      }
    }
  }, {
    key: "removeNotebookItemFromGroup",
    value: function removeNotebookItemFromGroup(notebookItemId, group) {
      var _this6 = this;

      if (this.ConfigService.isPreview()) {} else {
        var config = {
          method: "DELETE",
          url: this.ConfigService.getStudentNotebookURL() + '/group/' + group,
          params: {
            workgroupId: this.ConfigService.getWorkgroupId(),
            notebookItemId: notebookItemId,
            clientSaveTime: Date.parse(new Date())
          }
        };
        return this.$http(config).then(function (result) {
          var notebookItem = result.data;
          return _this6.handleNewNotebookItem(notebookItem);
        });
      }
    }
  }, {
    key: "handleNewNotebookItem",
    value: function handleNewNotebookItem(notebookItem) {
      if (notebookItem.type === "note" || notebookItem.type === "report") {
        notebookItem.content = angular.fromJson(notebookItem.content);
      }
      var workgroupId = notebookItem.workgroupId;
      this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
      this.groupNotebookItems();
      this.$rootScope.$broadcast('notebookUpdated', { notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem });
      return notebookItem;
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
      this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    }
  }]);

  return NotebookService;
}();

NotebookService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = NotebookService;
//# sourceMappingURL=notebookService.js.map
