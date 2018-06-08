class NotebookService {
  constructor($http, $q, $rootScope, ConfigService, ProjectService,
      StudentAssetService, StudentDataService) {
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
      if (this.notebookConfig !== null && typeof this.notebookConfig === 'object') {
        this.config = angular.merge(this.config, this.notebookConfig);
      }
    }
    this.publicNotebookItems = {};
  }

  editItem(ev, itemId) {
    this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
  };

  addNote(ev, file, text = null, studentWorkIds = null, isEditTextEnabled = true, isFileUploadEnabled = true) {
    this.$rootScope.$broadcast('addNote',
        {ev: ev, file: file, text: text, studentWorkIds: studentWorkIds,
          isEditTextEnabled: isEditTextEnabled, isFileUploadEnabled: isFileUploadEnabled});
  };

  deleteItem(itemId) {
    const noteCopy = angular.copy(this.getLatestNotebookItemByLocalNotebookItemId(itemId));
    noteCopy.id = null; // set to null so we're creating a new notebook item
    noteCopy.content.clientSaveTime = Date.parse(new Date());
    let clientDeleteTime = Date.parse(new Date());
    return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type,
        noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
  }

  reviveItem(itemId) {
    const noteCopy = angular.copy(this.getLatestNotebookItemByLocalNotebookItemId(itemId));
    noteCopy.id = null; // set to null so we're creating a new notebook item
    noteCopy.content.clientSaveTime = Date.parse(new Date());
    let clientDeleteTime = null; // if delete timestamp is null, then we are in effect un-deleting this note item
    return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type,
        noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
  }

  // looks up notebook item by local notebook item id, including deleted notes
  getLatestNotebookItemByLocalNotebookItemId(itemId, workgroupId = null) {
    if (this.getNotebookByWorkgroup(workgroupId).items.hasOwnProperty(itemId)) {
      const items = this.getNotebookByWorkgroup(workgroupId).items[itemId];
      return items.last();
    } else if (this.getNotebookByWorkgroup(workgroupId).deletedItems.hasOwnProperty(itemId)) {
      const items = this.getNotebookByWorkgroup(workgroupId).deletedItems[itemId];
      return items.last();
    } else {
      return null;
    }
  }

  // returns student's report item if they've done work, or the template if they haven't
  getLatestNotebookReportItemByReportId(reportId, workgroupId = null) {
    return this.getLatestNotebookItemByLocalNotebookItemId(reportId, workgroupId);
  }

  // returns the authored report item
  getTemplateReportItemByReportId(reportId) {
    const reportNotes = this.notebookConfig.itemTypes.report.notes;
    for (let reportNote of reportNotes) {
      if (reportNote.reportId == reportId) {
        let templateReportItem = {
          id: null,
          type: "report",
          localNotebookItemId: reportId,
          content: reportNote
        };
        return templateReportItem;
      }
    }
    return null;
  }

  calculateTotalUsage() {
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
  };

  getNotebookConfig() {
    return this.config;
  };

  /**
   * Returns the report content for the specified reportId, or null if not exists.
   * @param reportId
   */
  getReportNoteContentByReportId(reportId) {
    const reportNotes = this.notebookConfig.itemTypes.report.notes;
    for (let reportNote of reportNotes) {
      if (reportNote.reportId === reportId) {
        return reportNote;
      }
    }
    return null;
  }

  isNotebookEnabled() {
    return this.config.enabled;
  };

  retrieveNotebookItems(workgroupId = null, periodId = null) {
    if (this.ConfigService.isPreview()) {
      // we are previewing the project, initialize dummy student data
      const workgroupId = this.ConfigService.getWorkgroupId();
      this.notebooksByWorkgroup = {};
      this.notebooksByWorkgroup[workgroupId] = {};
      this.notebooksByWorkgroup[workgroupId].allItems = [];
      this.notebooksByWorkgroup[workgroupId].items = [];
      this.notebooksByWorkgroup[workgroupId].deletedItems = [];
      this.groupNotebookItems();
      // if we're in preview, don't make any request to the server but pretend we did
      const deferred = this.$q.defer();
      deferred.resolve(this.notebooksByWorkgroup[workgroupId]);
      return deferred.promise;
    } else {
      const config = {
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
        this.notebooksByWorkgroup = {};
        const allNotebookItems = response.data;
        for (let notebookItem of allNotebookItems) {
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
            const workgroupId = notebookItem.workgroupId;
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
        const notebookByWorkgroup = this.notebooksByWorkgroup[workgroupId];
        notebookByWorkgroup.items = {};
        notebookByWorkgroup.deletedItems = {};  // reset deleted items
        for (let ni = 0; ni < notebookByWorkgroup.allItems.length; ni++) {
          const notebookItem = notebookByWorkgroup.allItems[ni];
          const notebookItemLocalNotebookItemId = notebookItem.localNotebookItemId;
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
            const allRevisionsForThisLocalNotebookItemId = notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
            if (allRevisionsForThisLocalNotebookItemId != null) {
              const lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
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
  getPrivateNotebookItemById(notebookItemId, workgroupId = null) {
    const notebookByWorkgroup = this.getNotebookByWorkgroup(workgroupId);
    if (notebookByWorkgroup != null) {
      const allNotebookItems = notebookByWorkgroup.allItems;
      for (let notebookItem of allNotebookItems) {
        if (notebookItem.id === notebookItemId) {
          return notebookItem;
        }
      }
    }
  }

  getPrivateNotebookItems(workgroupId = this.ConfigService.getWorkgroupId()) {
    const notebookByWorkgroup = this.getNotebookByWorkgroup(workgroupId);
    const privateNotebookItems = [];
    for (let notebookItem of notebookByWorkgroup.allItems) {
      if (notebookItem.groups == null || notebookItem.groups.length == 0) {
        privateNotebookItems.push(notebookItem);
      }
    }
    return privateNotebookItems;
  }

  getNotebookItemById(notebookItemId, workgroupId = null) {
    let notebookItem = this.getPrivateNotebookItemById(notebookItemId, workgroupId);
    if (notebookItem == null) {
      notebookItem = this.getPublicNotebookItemById(notebookItemId);
    }
    return notebookItem;
  }

  getPublicNotebookItem(group, localNotebookItemId, workgroupId) {
    const publicNotebookItemsInGroup = this.publicNotebookItems[group];
    for (let publicNotebookItemInGroup of publicNotebookItemsInGroup) {
      if (publicNotebookItemInGroup.localNotebookItemId === localNotebookItemId &&
          publicNotebookItemInGroup.workgroupId === workgroupId) {
        return publicNotebookItemInGroup;
      }
    }
    return null;
  }

  getPublicNotebookItemById(id) {
    for (let group in this.publicNotebookItems) {
      let itemsInGroup = this.publicNotebookItems[group];
      for (let itemInGroup of itemsInGroup) {
        if (id == itemInGroup.id) {
          return itemInGroup;
        }
      }
    }
    return null;
  }

  getNotebookByWorkgroup(workgroupId = this.ConfigService.getWorkgroupId()) {
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

  retrievePublicNotebookItems(group = null, periodId = null) {
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
      const deferred = this.$q.defer();
      deferred.resolve({});
      return deferred.promise;
    } else {
      const config = {
        method : 'GET',
        url : this.ConfigService.getStudentNotebookURL() + `/group/${group}`,
        params : {
        }
      };
      if (periodId != null) {
        config.params.periodId = periodId;
      }
      return this.$http(config).then((response) => {
        const publicNotebookItemsForGroup = response.data;
        for (let publicNotebookItemForGroup of publicNotebookItemsForGroup) {
          publicNotebookItemForGroup.content =
              angular.fromJson(publicNotebookItemForGroup.content);
        }
        this.publicNotebookItems[group] = publicNotebookItemsForGroup;
        this.$rootScope.$broadcast("publicNotebookItemsRetrieved", {publicNotebookItems: this.publicNotebookItems});
        return this.publicNotebookItems;
      });
    }
  }

  saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content, groups = [],
      clientSaveTime = null, clientDeleteTime = null) {
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
          groups: groups,
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
        this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem});
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
        groups: angular.toJson(groups),
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
          let workgroupId = notebookItem.workgroupId;
          if (this.isNotebookItemPrivate(notebookItem)) {
            this.updatePrivateNotebookItem(notebookItem, workgroupId);
          }
          this.$rootScope.$broadcast('notebookUpdated',
              {notebook: this.notebooksByWorkgroup[workgroupId],
               notebookItem: notebookItem});
        }
        return result.data;
      });
    }
  };

  updatePrivateNotebookItem(notebookItem, workgroupId) {
    if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
      // we already have create a notebook for this workgroup before, so we'll append this notebook item to the array
      this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    } else {
      // otherwise, we'll create a new notebook field and add the item to the array
      this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
    }
    this.groupNotebookItems();
  }

  isNotebookItemPublic(notebookItem) {
    return !this.isNotebookItemPrivate(notebookItem);
  }

  isNotebookItemPrivate(notebookItem) {
    return notebookItem.groups == null;
  }

  copyNotebookItem(notebookItemId) {
    if (this.ConfigService.isPreview()) {

    } else {
      let config = {
        method: "POST",
        url: this.ConfigService.getStudentNotebookURL() + '/parent/' + notebookItemId,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      };
      let params = {
        workgroupId: this.ConfigService.getWorkgroupId(),
        clientSaveTime: Date.parse(new Date())
      };
      config.data = $.param(params);
      return this.$http(config).then((result) => {
        let notebookItem = result.data;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  addNotebookItemToGroup(notebookItemId, group) {
    if (this.ConfigService.isPreview()) {

    } else {
      let config = {
        method: "POST",
        url: this.ConfigService.getStudentNotebookURL() + '/group/' + group,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      };
      let params = {
        workgroupId: this.ConfigService.getWorkgroupId(),
        notebookItemId: notebookItemId,
        clientSaveTime: Date.parse(new Date())
      };
      config.data = $.param(params);
      return this.$http(config).then((result) => {
        let notebookItem = result.data;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  removeNotebookItemFromGroup(notebookItemId, group) {
    if (this.ConfigService.isPreview()) {

    } else {
      let config = {
        method: "DELETE",
        url: this.ConfigService.getStudentNotebookURL() + '/group/' + group,
        params : {
          workgroupId: this.ConfigService.getWorkgroupId(),
          notebookItemId: notebookItemId,
          clientSaveTime: Date.parse(new Date())
        }
      };
      return this.$http(config).then((result) => {
        let notebookItem = result.data;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  handleNewNotebookItem(notebookItem) {
    if (notebookItem.type === "note" || notebookItem.type === "report") {
      notebookItem.content = angular.fromJson(notebookItem.content);
    }
    let workgroupId = notebookItem.workgroupId;
    this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    this.groupNotebookItems();
    this.$rootScope.$broadcast('notebookUpdated', {notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem});
    return notebookItem;
  }

  saveNotebookToggleEvent(isOpen, currentNode) {
    let nodeId = null, componentId = null, componentType = null, category = "Notebook";
    let eventData = {
      curentNodeId: currentNode == null ? null : currentNode.id
    };
    let event = isOpen ? "notebookOpened" : "notebookClosed";
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
