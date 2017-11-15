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
      // get notebook config from project
      this.notebookConfig = this.ProjectService.project.notebook;
      // update local notebook config, preserving any defaults that aren't overriden
      if (this.notebookConfig !== null && typeof this.notebookConfig === 'object') {
        this.config = angular.merge(this.config, this.notebookConfig);
      }
    }
  }

  editItem(ev, itemId) {
    // broadcast edit notebook item event
    this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
  };

  addNewItem(ev, file) {
    // broadcast create new notebook item event
    this.$rootScope.$broadcast('addNewNote', {ev: ev, file: file});
  };

  deleteItem(itemToDelete) {
    let items = this.getNotebookByWorkgroup().items;
    let deletedItems = this.getNotebookByWorkgroup().deletedItems;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item === itemToDelete) {
        items.splice(i, 1);
        deletedItems.push(itemToDelete);
      }
    }
  };

  // looks up notebook item by local notebook item id, including deleted notes
  getLatestNotebookItemByLocalNotebookItemId(itemId, workgroupId = null) {
    if (this.getNotebookByWorkgroup(workgroupId).items.hasOwnProperty(itemId)) {
      let items = this.getNotebookByWorkgroup(workgroupId).items[itemId];
      return items.last();
    } else if (this.getNotebookByWorkgroup(workgroupId).deletedItems.hasOwnProperty(itemId)) {
      let items = this.getNotebookByWorkgroup(workgroupId).deletedItems[itemId];
      return items.last();
    } else {
      return null;
    }
  }

  // returns student's report item if they've done work, or the template if they haven't.
  getLatestNotebookReportItemByReportId(reportId, workgroupId = null) {
    return this.getLatestNotebookItemByLocalNotebookItemId(reportId, workgroupId);
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
    /*
    let totalSizeSoFar = 0;
    for (let i = 0; i < this.getNotebookByWorkgroup().items.length; i++) {
        let notebookItem = this.getNotebookByWorkgroup().items[i];
        if (notebookItem.studentAsset != null) {
            let notebookItemSize = notebookItem.studentAsset.fileSize;
            totalSizeSoFar += notebookItemSize;
        }
    }
    this.getNotebookByWorkgroup().totalSize = totalSizeSoFar;
    this.getNotebookByWorkgroup().totalSizeMax = this.ConfigService.getStudentMaxTotalAssetsSize();
    this.getNotebookByWorkgroup().usagePercentage = this.notebook.totalSize / this.notebook.totalSizeMax * 100;
    */
  };

  getNotebookConfig() {
    return this.config;
  };

  /**
   * Returns the report content for the specified reportId, or null if not exists.
   * @param reportId
   */
  getReportNoteContentByReportId(reportId) {
    let result = null;
    let reportNotes = this.notebookConfig.itemTypes.report.notes;
    for (let i = 0; i < reportNotes.length; i++) {
      let reportNote = reportNotes[i];
      if (reportNote.reportId === reportId) {
        result = reportNote;
        break;
      }
    }
    return result;
  }

  isNotebookEnabled() {
    return this.config.enabled;
  };

  retrieveNotebookItems(workgroupId = null, periodId = null) {
    if (this.ConfigService.isPreview()) {
      // we are previewing the project, initialize dummy student data
      let workgroupId = this.ConfigService.getWorkgroupId();
      this.notebooksByWorkgroup = {};
      this.notebooksByWorkgroup[workgroupId] = {};
      this.notebooksByWorkgroup[workgroupId].allItems = [];
      this.notebooksByWorkgroup[workgroupId].items = [];
      this.notebooksByWorkgroup[workgroupId].deletedItems = [];
      this.groupNotebookItems();
      // if we're in preview, don't make any request to the server but pretend we did
      let deferred = this.$q.defer();
      deferred.resolve(this.notebooksByWorkgroup[workgroupId]);
      return deferred.promise;
    } else {
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
        this.notebooksByWorkgroup = {};
        let allNotebookItems = response.data;
        for (let n = 0; n < allNotebookItems.length; n++) {
          let notebookItem = allNotebookItems[n];
          try {
            if (notebookItem.studentAssetId != null) {
              // if this notebook item is a StudentAsset item, add the association here
              notebookItem.studentAsset = this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
            } else if (notebookItem.studentWorkId != null) {
              // if this notebook item is a StudentWork item, add the association here
              notebookItem.studentWork = this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
            } else if (notebookItem.type === "note" || notebookItem.type === "report") {
              notebookItem.content = angular.fromJson(notebookItem.content);
            }
            let workgroupId = notebookItem.workgroupId;
            if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
              // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
              this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
            } else {
              // otherwise, we'll create a new notebook field and add the item to the array
              this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
            }
          } catch (e) {
            // keep going, ignore this error
          }
        }
        this.groupNotebookItems(); // group notebook items based on item.localNotebookItemId
        this.calculateTotalUsage();

        return this.notebooksByWorkgroup;
      });
    }
  };

  /**
   * Groups the notebook items together in to a map-like structure inside this.notebook.items.
   * {
     *    "abc123": [{localNotebookItemId:"abc123", "text":"first revision"}, {localNotebookItemId:"abc123", "text":"second revision"}],
     *    "def456": [{localNotebookItemId:"def456", "text":"hello"}, {localNotebookItemId:"def456", "text":"hello my friend"}]
     * }
   */
  groupNotebookItems() {
    for (let workgroupId in this.notebooksByWorkgroup) {
      if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
        let notebookByWorkgroup = this.notebooksByWorkgroup[workgroupId];
        notebookByWorkgroup.items = {};
        notebookByWorkgroup.deletedItems = {};  // reset deleted items
        for (let ni = 0; ni < notebookByWorkgroup.allItems.length; ni++) {
          let notebookItem = notebookByWorkgroup.allItems[ni];
          let notebookItemLocalNotebookItemId = notebookItem.localNotebookItemId;
          if (notebookByWorkgroup.items.hasOwnProperty(notebookItemLocalNotebookItemId)) {
            // if this was already added before, we'll append this notebook item to the array
            notebookByWorkgroup.items[notebookItemLocalNotebookItemId].push(notebookItem);
          } else {
            // otherwise, we'll create a new field and add the item to the array
            notebookByWorkgroup.items[notebookItemLocalNotebookItemId] = [notebookItem];
          }
        }
        // now go through the items and look at the last revision of each item. If it's deleted, then move the entire item array to deletedItems
        for (let notebookItemLocalNotebookItemIdKey in notebookByWorkgroup.items) {
          if (notebookByWorkgroup.items.hasOwnProperty(notebookItemLocalNotebookItemIdKey)) {
            // get the last note revision
            let allRevisionsForThisLocalNotebookItemId = notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
            if (allRevisionsForThisLocalNotebookItemId != null) {
              let lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
              if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                // the last revision for this not deleted, so move the entire note (with all its revisions) to deletedItems
                notebookByWorkgroup.deletedItems[notebookItemLocalNotebookItemIdKey] = allRevisionsForThisLocalNotebookItemId;
                delete notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];  // then remove it from the items array
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
  getNotebookItemByNotebookItemId(notebookItemId, workgroupId = null) {
    let notebookByWorkgroup = this.getNotebookByWorkgroup(workgroupId);
    if (notebookByWorkgroup != null) {
      let allNotebookItems = notebookByWorkgroup.allItems;
      for (let a = 0; a < allNotebookItems.length; a++) {
        let notebookItem = allNotebookItems[a];
        if (notebookItem.id === notebookItemId) {
          return notebookItem;
        }
      }
    }
  }

  getNotebookByWorkgroup(workgroupId = null) {
    if (workgroupId == null) {
      workgroupId = this.ConfigService.getWorkgroupId();
    }
    let notebookByWorkgroup = this.notebooksByWorkgroup[workgroupId];
    if (notebookByWorkgroup == null) {
      notebookByWorkgroup = {
        allItems: [],
        items: {},
        deletedItems: {}
      }
    }
    return notebookByWorkgroup;
  }

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
          workgroupId: this.ConfigService.getWorkgroupId(),
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
        let workgroupId = notebookItem.workgroupId;
        if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
          // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
          this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
        } else {
          // otherwise, we'll create a new notebook field and add the item to the array
          this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
        }

        this.groupNotebookItems();
        this.groupNotebookItems();
        this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebooksByWorkgroup[workgroupId]});
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
          let workgroupId = notebookItem.workgroupId;
          if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
            // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
            this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
          } else {
            // otherwise, we'll create a new notebook field and add the item to the array
            this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
          }

          this.groupNotebookItems();

          this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebooksByWorkgroup[workgroupId]});
        }
        return result.data;
      });
    }
  };

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
