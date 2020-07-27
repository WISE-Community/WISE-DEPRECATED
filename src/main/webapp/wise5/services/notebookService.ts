'use strict';

import { Injectable } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import ConfigService from "./configService";
import { ProjectService } from "./projectService";
import { StudentAssetService } from "./studentAssetService";
import { StudentDataService } from "./studentDataService";
import { UtilService } from './utilService';

@Injectable()
export class NotebookService {
  // TODO: i18n
  // TODO: allow wise instance to set defaults, enabled/disabled for each type in wise config?
  config = {
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
  reports = [];
  publicNotebookItems = {};
  notebooksByWorkgroup = {};

  constructor(private upgrade: UpgradeModule,
      public http: HttpClient,
      private ConfigService: ConfigService,
      private ProjectService: ProjectService,
      private StudentAssetService: StudentAssetService,
      private StudentDataService: StudentDataService,
      private UtilService: UtilService) {
  }

  getStudentNotebookConfig() {
   return Object.assign(this.config, this.ProjectService.project.notebook);
  }

  getTeacherNotebookConfig() {
    return Object.assign(this.config, this.ProjectService.project.teacherNotebook);
  }

  editItem(ev, itemId) {
    this.UtilService.broadcastEventInRootScope('editNote', { itemId: itemId, ev: ev });
  }

  addNote(ev, file, text = null, studentWorkIds = null, 
      isEditTextEnabled = true, isFileUploadEnabled = true) {
    this.UtilService.broadcastEventInRootScope('addNote',
      {
        ev: ev, file: file, text: text, studentWorkIds: studentWorkIds,
        isEditTextEnabled: isEditTextEnabled, isFileUploadEnabled: isFileUploadEnabled
      });
  }

  deleteNote(note) {
    const noteCopy = {...note};
    noteCopy.id = null; // set to null so we're creating a new notebook item
    noteCopy.content.clientSaveTime = Date.parse(new Date().toString());
    const clientDeleteTime = Date.parse(new Date().toString());
    return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, 
        noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.groups, 
        noteCopy.content.clientSaveTime, clientDeleteTime);
  }

  reviveNote(note) {
    const noteCopy = {...note};
    noteCopy.id = null; // set to null so we're creating a new notebook item
    noteCopy.content.clientSaveTime = Date.parse(new Date().toString());
    const clientDeleteTime = null; // if delete timestamp is null, then we are in effect un-deleting this note item
    return this.saveNotebookItem(noteCopy.id, noteCopy.nodeId, noteCopy.localNotebookItemId, 
        noteCopy.type, noteCopy.title, noteCopy.content, noteCopy.groups, 
        noteCopy.content.clientSaveTime, clientDeleteTime);
  }

  // looks up notebook item by local notebook item id, including deleted notes
  getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 
      workgroupId = this.ConfigService.getWorkgroupId()) {
    const notebookByWorkgroup = this.getNotebookByWorkgroup(workgroupId);
    if (notebookByWorkgroup != null) {
      const allNotebookItems = [...notebookByWorkgroup.allItems].reverse();
      for (let notebookItem of allNotebookItems) {
        if (notebookItem.localNotebookItemId === localNotebookItemId) {
          return notebookItem;
        }
      }
    }
    return null;
  }

  // returns student's report item if they've done work, or the template if they haven't
  getLatestNotebookReportItemByReportId(reportId, 
      workgroupId = this.ConfigService.getWorkgroupId()) {
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
    return this.ProjectService.project.notebook != null && 
        this.ProjectService.project.notebook.enabled;
  }

  isTeacherNotebookEnabled() {
    return this.ProjectService.project.teacherNotebook != null && 
        this.ProjectService.project.teacherNotebook.enabled;
  }

  isStudentNoteEnabled() {
    return this.ProjectService.project.notebook != null &&
      this.ProjectService.project.notebook.itemTypes.note.enabled;
  }

  isStudentNoteClippingEnabled() {
    return this.isStudentNoteEnabled() &&
      this.ProjectService.project.notebook.itemTypes.note.enableClipping;
  }

  retrieveNotebookItems(workgroupId = null) {
    if (this.ConfigService.isPreview()) {
      // we are previewing the project, initialize dummy student data
      const workgroupId = this.ConfigService.getWorkgroupId();
      this.notebooksByWorkgroup[workgroupId] = {};
      this.notebooksByWorkgroup[workgroupId].allItems = [];
      this.notebooksByWorkgroup[workgroupId].items = [];
      this.notebooksByWorkgroup[workgroupId].deletedItems = [];
      this.groupNotebookItems();
      // pretend sending data to server
      return new Promise((resolve, reject) => {
        resolve(this.notebooksByWorkgroup[workgroupId]);
      });
    } else {
      return this.doRetrieveNotebookItems(workgroupId);
    }
  }

  doRetrieveNotebookItems(workgroupId) {
    let url = this.ConfigService.getNotebookURL();
    if (workgroupId != null) {
      url += `/workgroup/${workgroupId}`;
    }
    return this.http.get(url).toPromise().then(resultData => {
      const notebookItems = resultData;
      return this.handleRetrieveNotebookItems(notebookItems);
    });
  }

  handleRetrieveNotebookItems(notebookItems) {
    this.notebooksByWorkgroup = {};
    for (let notebookItem of notebookItems) {
      try {
        if (notebookItem.studentAssetId != null) {
          notebookItem.studentAsset = 
              this.StudentAssetService.getAssetById(notebookItem.studentAssetId);
        } else if (notebookItem.studentWorkId != null) {
          notebookItem.studentWork =
            this.StudentDataService.getStudentWorkByStudentWorkId(notebookItem.studentWorkId);
        } else if (notebookItem.type === 'note' || notebookItem.type === 'report') {
          notebookItem.content = JSON.parse(notebookItem.content);
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
            const allRevisionsForThisLocalNotebookItemId = 
                notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
            if (allRevisionsForThisLocalNotebookItemId != null) {
              const lastRevision = allRevisionsForThisLocalNotebookItemId[allRevisionsForThisLocalNotebookItemId.length - 1];
              if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                // the last revision for this was deleted,
                // so move the entire note (with all its revisions) to deletedItems
                notebookByWorkgroup.deletedItems[notebookItemLocalNotebookItemIdKey] = 
                    allRevisionsForThisLocalNotebookItemId;
                delete notebookByWorkgroup.items[notebookItemLocalNotebookItemIdKey];
              }
            }
          }
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
      return new Promise((resolve, reject) => {
        resolve({});
      });
    } else {
      return this.doRetrievePublicNotebookItems(group, periodId);
    }
  }

  doRetrievePublicNotebookItems(group, periodId) {
    const url = `${this.ConfigService.getNotebookURL()}/group/${group}`;
    const params = {};
    if (periodId != null) {
      params['periodId'] = periodId;
    }
    const options = {
      params: params
    }
    return this.http.get(url, options).toPromise().then(resultData => {
      const publicNotebookItemsForGroup = resultData;
      return this.handleRetrievePublicNotebookItems(publicNotebookItemsForGroup, group);
    });
  }

  handleRetrievePublicNotebookItems(publicNotebookItemsForGroup, group) {
    for (let publicNotebookItemForGroup of publicNotebookItemsForGroup) {
      publicNotebookItemForGroup.content =
          JSON.parse(publicNotebookItemForGroup.content);
    }
    this.publicNotebookItems[group] = publicNotebookItemsForGroup;
    this.UtilService.broadcastEventInRootScope('publicNotebookItemsRetrieved', 
        { publicNotebookItems: this.publicNotebookItems });
    return this.publicNotebookItems;
  }

  saveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content, groups = [],
      clientSaveTime = null, clientDeleteTime = null) {
    if (this.ConfigService.isPreview()) {
      return this.savePreviewNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, 
          content, groups, clientSaveTime, clientDeleteTime);
    } else {
      return this.doSaveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, 
          content, groups, clientDeleteTime);
    }
  }

  savePreviewNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content, groups, 
      clientSaveTime, clientDeleteTime) {
    return new Promise((resolve, reject) => {
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
        clientDeleteTime: clientDeleteTime,
        serverDeleteTime: clientDeleteTime ? clientDeleteTime : null
      };
      const workgroupId = notebookItem.workgroupId;
      if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
        this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
      } else {
        this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
      }
      this.groupNotebookItems();
      this.StudentDataService.updateNodeStatuses();
      this.UtilService.broadcastEventInRootScope('notebookUpdated',
          { notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem });
      resolve();
    });
  }

  doSaveNotebookItem(notebookItemId, nodeId, localNotebookItemId, type, title, content, groups, 
      clientDeleteTime) {
    const params = {
      workgroupId: this.ConfigService.getWorkgroupId(),
      notebookItemId: notebookItemId,
      localNotebookItemId: localNotebookItemId,
      nodeId: nodeId,
      type: type,
      title: title,
      content: JSON.stringify(content),
      groups: JSON.stringify(groups),
      clientSaveTime: Date.parse(new Date().toString()),
      clientDeleteTime: clientDeleteTime
    };
    if (this.ConfigService.getMode() !== 'classroomMonitor') {
      params['periodId'] = this.ConfigService.getPeriodId();
    }
    const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
    return this.http.post(this.ConfigService.getNotebookURL(), $.param(params),
        { headers: headers }).toPromise().then(
      resultData => {
        const notebookItem = resultData;
        this.handleSaveNotebookItem(notebookItem);
        return resultData;
      });
  }

  handleSaveNotebookItem(notebookItem) {
    if (notebookItem != null) {
      if (notebookItem.type === 'note' || notebookItem.type === 'report') {
        notebookItem.content = JSON.parse(notebookItem.content);
      }
      const workgroupId = notebookItem.workgroupId;
      if (this.isNotebookItemPrivate(notebookItem)) {
        this.updatePrivateNotebookItem(notebookItem, workgroupId);
      }
      this.StudentDataService.updateNodeStatuses();
      this.UtilService.broadcastEventInRootScope('notebookUpdated',
        {
          notebook: this.notebooksByWorkgroup[workgroupId],
          notebookItem: notebookItem
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
      const url = `${this.ConfigService.getNotebookURL()}/parent/${notebookItemId}`;
      const params = {
        workgroupId: this.ConfigService.getWorkgroupId(),
        clientSaveTime: Date.parse(new Date().toString())
      };
      const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
      return this.http.post(url, $.param(params), { headers: headers }).toPromise().then(
        resultData => {
          const notebookItem = resultData;
          return this.handleNewNotebookItem(notebookItem);
        });
    }
  }

  addNotebookItemToGroup(notebookItemId, group) {
    if (!this.ConfigService.isPreview()) {
      const url = `${this.ConfigService.getNotebookURL()}/group/${group}`;
      const params = {
        workgroupId: this.ConfigService.getWorkgroupId(),
        notebookItemId: notebookItemId,
        clientSaveTime: Date.parse(new Date().toString())
      };
      const headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});
      return this.http.post(url, $.param(params), { headers: headers }).toPromise().then(
        resultData => {
          const notebookItem = resultData;
          return this.handleNewNotebookItem(notebookItem);
        });
    }
  }

  removeNotebookItemFromGroup(notebookItemId, group) {
    if (!this.ConfigService.isPreview()) {
      const url = `${this.ConfigService.getNotebookURL()}/group/${group}`;
      const params = new HttpParams()
        .set('workgroupId', this.ConfigService.getWorkgroupId())
        .set('notebookItemId', notebookItemId)
        .set('clientSaveTime', Date.parse(new Date().toString()).toString())
      const options = {
        params: params
      };
      const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
      return this.http.delete(url, options).toPromise().then(resultData => {
        const notebookItem = resultData;
        return this.handleNewNotebookItem(notebookItem);
      });
    }
  }

  handleNewNotebookItem(notebookItem) {
    if (notebookItem.type === 'note' || notebookItem.type === 'report') {
      notebookItem.content = JSON.parse(notebookItem.content);
    }
    const workgroupId = notebookItem.workgroupId;
    this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    this.groupNotebookItems();
    this.StudentDataService.updateNodeStatuses();
    this.UtilService.broadcastEventInRootScope('notebookUpdated',
        { notebook: this.notebooksByWorkgroup[workgroupId], notebookItem: notebookItem });
    return notebookItem;
  }

  saveNotebookToggleEvent(isOpen, currentNode) {
    const nodeId = null, componentId = null, componentType = null, category = 'Notebook';
    const eventData = {
      curentNodeId: currentNode == null ? null : currentNode.id
    };
    const event = isOpen ? 'notebookOpened' : 'notebookClosed';
    this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, 
        eventData);
  }
}