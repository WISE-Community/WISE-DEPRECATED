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
      label: 'Notebook',
      icon: 'book',
      enableAddNew: true,
      addIcon: 'note_add',
      itemTypes: {
        note: {
          enabled: true,
          requireTextOnEveryNote: false,
          enableLink: true,
          enableClipping: true,
          enableStudentUploads: true,
          type: 'note',
          label: {
            singular: 'note',
            plural: 'notes',
            link: 'Manage Notes',
            icon: 'note',
            color: '#1565C0'
          }
        },
        question: {
          enabled: false,
          enableLink: true,
          enableClipping: true,
          enableStudentUploads: true,
          type: 'question',
          label: {
            singular: 'question',
            plural: 'questions',
            link: 'Manage Questions',
            icon: 'live_help',
            color: '#F57C00'
          }
        },
        report: {
          enabled: false,
          enableLink: true,
          type: 'report',
          label: {
            singular: 'report',
            plural: 'reports',
            link: 'Report',
            icon: 'assignment',
            color: '#AD1457'
          },
          notes: []
        }
      }
    };

    this.reports = [];
    this.publicNotebookItems = {};
  }

  getStudentNotebookConfig() {
    return angular.merge(this.config, this.ProjectService.project.notebook);
  }

  getTeacherNotebookConfig() {
    return angular.merge(this.config, this.ProjectService.project.teacherNotebook);
  }

  editItem(ev, itemId) {
    this.$rootScope.$broadcast('editNote', {itemId: itemId, ev: ev});
  }

  addNote(ev, file, text = null, studentWorkIds = null, isEditTextEnabled = true, isFileUploadEnabled = true) {
    this.$rootScope.$broadcast('addNote',
        {ev: ev, file: file, text: text, studentWorkIds: studentWorkIds,
          isEditTextEnabled: isEditTextEnabled, isFileUploadEnabled: isFileUploadEnabled});
  }

  deleteNote(note) {
    const noteCopy = angular.copy(note);
    noteCopy.id = null; // set to null so we're creating a new notebook item
    noteCopy.content.clientSaveTime = Date.parse(new Date());
    const clientDeleteTime = Date.parse(new Date());
    return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type,
        noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
  }

  reviveNote(note) {
    const noteCopy = angular.copy(note);
    noteCopy.id = null; // set to null so we're creating a new notebook item
    noteCopy.content.clientSaveTime = Date.parse(new Date());
    const clientDeleteTime = null; // if delete timestamp is null, then we are in effect un-deleting this note item
    return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, noteCopy.type,
        noteCopy.title, noteCopy.content, noteCopy.groups, noteCopy.content.clientSaveTime, clientDeleteTime);
  }

  // looks up notebook item by local notebook item id, including deleted notes
  getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, workgroupId = this.ConfigService.getWorkgroupId()) {
    const notebookByWorkgroup = this.getNotebookByWorkgroup(workgroupId);
    if (notebookByWorkgroup != null) {
      const allNotebookItems = notebookByWorkgroup.allItems;
      for (let notebookItem of allNotebookItems) {
        if (notebookItem.localNotebookItemId === localNotebookItemId) {
          return notebookItem;
        }
      }
    }
    return null;
  }

  // returns student's report item if they've done work, or the template if they haven't
  getLatestNotebookReportItemByReportId(reportId, workgroupId = this.ConfigService.getWorkgroupId()) {
    return this.getLatestNotebookItemByLocalNotebookItemId(reportId, workgroupId);
  }

  getTemplateReportItemByReportId(reportId) {
    const reportNotes = this.config.itemTypes.report.notes;
    for (let reportNote of reportNotes) {
      if (reportNote.reportId === reportId) {
        return {
          id: null,
          type: 'report',
          localNotebookItemId: reportId,
          content: reportNote
        };
      }
    }
    return null;
  }

  getMaxScoreByReportId(reportId) {
    const reportNoteContent = this.getReportNoteContentByReportId(reportId);
    if (reportNoteContent != null && reportNoteContent.maxScore != null) {
      return reportNoteContent.maxScore;
    }
    return 0;
  }

  getNotebookConfig() {
    return this.config;
  }

  /**
   * Returns the report content for the specified reportId, or null if not exists.
   * @param reportId
   */
  getReportNoteContentByReportId(reportId) {
    const reportNotes = this.config.itemTypes.report.notes;
    for (let reportNote of reportNotes) {
      if (reportNote.reportId === reportId) {
        return reportNote;
      }
    }
    return null;
  }

  isNotebookEnabled() {
    return this.ProjectService.project.notebook != null && this.ProjectService.project.notebook.enabled;
  }

  isTeacherNotebookEnabled() {
    return this.ProjectService.project.teacherNotebook != null && this.ProjectService.project.teacherNotebook.enabled;
  }

  isStudentNoteEnabled() {
    return this.ProjectService.project.notebook != null &&
        this.ProjectService.project.notebook.itemTypes.note.enabled;
  }

  isStudentNoteClippingEnabled() {
    return this.isStudentNoteEnabled() &&
      this.ProjectService.project.notebook.itemTypes.note.enableClipping;
  }

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
      // pretend sending data to server
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
              notebookItem.studentAsset = this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
            } else if (notebookItem.studentWorkId != null) {
              notebookItem.studentWork =
                  this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
            } else if (notebookItem.type === 'note' || notebookItem.type === 'report') {
              notebookItem.content = angular.fromJson(notebookItem.content);
            }
            const workgroupId = notebookItem.workgroupId;
            if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
              this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
            } else {
              this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
            }
          } catch (e) {
          }
        }
        this.groupNotebookItems();
        return this.notebooksByWorkgroup;
      });
    }
  }

  /**
   * Groups the notebook items together in to a map-like structure inside this.notebook.items.
   * {
   *    'abc123': [{localNotebookItemId:'abc123', 'text':'first revision'}, {localNotebookItemId:'abc123', 'text':'second revision'}],
   *    'def456': [{localNotebookItemId:'def456', 'text':'hello'}, {localNotebookItemId:'def456', 'text':'hello my friend'}]
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
            notebookByWorkgroup.items[notebookItemLocalNotebookItemId].push(notebookItem);
          } else {
            notebookByWorkgroup.items[notebookItemLocalNotebookItemId] = [notebookItem];
          }
        }
        // Go through the items and look at the last revision of each item.
        // If it's deleted, then move the entire item array to deletedItems
        for (let notebookItemLocalNotebookItemIdKey in notebookByWorkgroup.items) {
          if (notebookByWorkgroup.items.hasOwnProperty(notebookItemLocalNotebookItemIdKey)) {
            const allRevisionsForThisLocalNotebookItemId = notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
            if (allRevisionsForThisLocalNotebookItemId != null) {
              const lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
              if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                // the last revision for this was deleted,
                // so move the entire note (with all its revisions) to deletedItems
                notebookByWorkgroup.deletedItems[notebookItemLocalNotebookItemIdKey] = allRevisionsForThisLocalNotebookItemId;
                delete notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
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
        if (id === itemInGroup.id) {
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
      };
    }
    return notebookByWorkgroup;
  }

  retrievePublicNotebookItems(group = null, periodId = null) {
    if (this.ConfigService.isPreview()) {
      // pretend we made a request to server
      const deferred = this.$q.defer();
      deferred.resolve({});
      return deferred.promise;
    } else {
      const config = {
        method : 'GET',
        url : this.ConfigService.getStudentNotebookURL() + `/group/${group}`,
        params : {}
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
        this.$rootScope.$broadcast('publicNotebookItemsRetrieved', {publicNotebookItems: this.publicNotebookItems});
        return this.publicNotebookItems;
      });
    }
  }

  saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content, groups = [],
      clientSaveTime = null, clientDeleteTime = null) {
    if (this.ConfigService.isPreview()) {
      return this.$q((resolve, reject) => {
        const notebookItem = {
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
        const workgroupId = notebookItem.workgroupId;
        if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
          this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
        } else {
          this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
        }
        this.groupNotebookItems();
        this.$rootScope.$broadcast('notebookUpdated',
            {notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem});
        resolve();
      });
    } else {
      const config = {
        method: 'POST',
        url: this.ConfigService.getStudentNotebookURL(),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      };
      const params = {
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
      if (this.ConfigService.getMode() === 'classroomMonitor') {
        delete(params.periodId);
      }
      config.data = $.param(params);
      return this.$http(config).then((result) => {
        const notebookItem = result.data;
        if (notebookItem != null) {
          if (notebookItem.type === 'note' || notebookItem.type === 'report') {
            notebookItem.content = angular.fromJson(notebookItem.content);
          }
          const workgroupId = notebookItem.workgroupId;
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
  }

  updatePrivateNotebookItem(notebookItem, workgroupId) {
    if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
      this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    } else {
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
    if (!this.ConfigService.isPreview()) {
      const config = {
        method: 'POST',
        url: this.ConfigService.getStudentNotebookURL() + '/parent/' + notebookItemId,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      };
      const params = {
        workgroupId: this.ConfigService.getWorkgroupId(),
        clientSaveTime: Date.parse(new Date())
      };
      config.data = $.param(params);
      return this.$http(config).then((result) => {
        const notebookItem = result.data;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  addNotebookItemToGroup(notebookItemId, group) {
    if (!this.ConfigService.isPreview()) {
      const config = {
        method: 'POST',
        url: this.ConfigService.getStudentNotebookURL() + '/group/' + group,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      };
      const params = {
        workgroupId: this.ConfigService.getWorkgroupId(),
        notebookItemId: notebookItemId,
        clientSaveTime: Date.parse(new Date())
      };
      config.data = $.param(params);
      return this.$http(config).then((result) => {
        const notebookItem = result.data;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  removeNotebookItemFromGroup(notebookItemId, group) {
    if (!this.ConfigService.isPreview()) {
      const config = {
        method: 'DELETE',
        url: this.ConfigService.getStudentNotebookURL() + '/group/' + group,
        params : {
          workgroupId: this.ConfigService.getWorkgroupId(),
          notebookItemId: notebookItemId,
          clientSaveTime: Date.parse(new Date())
        }
      };
      return this.$http(config).then((result) => {
        const notebookItem = result.data;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  handleNewNotebookItem(notebookItem) {
    if (notebookItem.type === 'note' || notebookItem.type === 'report') {
      notebookItem.content = angular.fromJson(notebookItem.content);
    }
    const workgroupId = notebookItem.workgroupId;
    this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    this.groupNotebookItems();
    this.$rootScope.$broadcast('notebookUpdated',
        {notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem});
    return notebookItem;
  }

  saveNotebookToggleEvent(isOpen, currentNode) {
    const nodeId = null, componentId = null, componentType = null, category = 'Notebook';
    const eventData = {
      curentNodeId: currentNode == null ? null : currentNode.id
    };
    const event = isOpen ? 'notebookOpened' : 'notebookClosed';
    this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
  }
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
