'use strict';

import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './configService';
import { ProjectService } from './projectService';
import { StudentAssetService } from './studentAssetService';
import { StudentDataService } from './studentDataService';
import { UtilService } from './utilService';
import { Subject } from 'rxjs';

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
  notebookItemAnnotationReceivedSubscription: any;
  private addNoteSource: Subject<any> = new Subject<any>();
  public addNote$ = this.addNoteSource.asObservable();
  private closeNotebookSource: Subject<any> = new Subject<any>();
  public closeNotebook$ = this.closeNotebookSource.asObservable();
  private editNoteSource: Subject<any> = new Subject<any>();
  public editNote$ = this.editNoteSource.asObservable();
  private notebookItemAnnotationReceivedSource: Subject<boolean> = new Subject<boolean>();
  public notebookItemAnnotationReceived$ = this.notebookItemAnnotationReceivedSource.asObservable();
  private notebookItemChosenSource: Subject<any> = new Subject<any>();
  public notebookItemChosen$ = this.notebookItemChosenSource.asObservable();
  private notebookUpdatedSource: Subject<any> = new Subject<any>();
  public notebookUpdated$ = this.notebookUpdatedSource.asObservable();
  private openNotebookSource: Subject<any> = new Subject<any>();
  public openNotebook$ = this.openNotebookSource.asObservable();
  private publicNotebookItemsRetrievedSource: Subject<any> = new Subject<any>();
  public publicNotebookItemsRetrieved$ = this.publicNotebookItemsRetrievedSource.asObservable();
  private showReportAnnotationsSource: Subject<any> = new Subject<any>();
  public showReportAnnotations$ = this.showReportAnnotationsSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    public http: HttpClient,
    private ConfigService: ConfigService,
    private ProjectService: ProjectService,
    private StudentAssetService: StudentAssetService,
    private StudentDataService: StudentDataService,
    private UtilService: UtilService
  ) {
    this.notebookItemAnnotationReceivedSubscription = this.StudentDataService.notebookItemAnnotationReceived$.subscribe(
      (args: any) => {
        this.notebookItemAnnotationReceivedSource.next(args);
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.notebookItemAnnotationReceivedSubscription.unsubscribe();
  }

  getStudentNotebookConfig() {
    return Object.assign(this.config, this.ProjectService.project.notebook);
  }

  getTeacherNotebookConfig() {
    return Object.assign(this.config, this.ProjectService.project.teacherNotebook);
  }

  editItem(ev, itemId) {
    this.broadcastEditNote({ itemId: itemId, ev: ev });
  }

  addNote(
    file,
    text = null,
    studentWorkIds = null,
    isEditTextEnabled = true,
    isFileUploadEnabled = true
  ) {
    this.broadcastAddNote({
      file: file,
      text: text,
      studentWorkIds: studentWorkIds,
      isEditTextEnabled: isEditTextEnabled,
      isFileUploadEnabled: isFileUploadEnabled
    });
  }

  deleteNote(note) {
    const noteCopy = { ...note };
    const clientTime = Date.parse(new Date().toString());
    noteCopy.clientDeleteTime = clientTime;
    return this.updateNote(noteCopy, clientTime);
  }

  reviveNote(note) {
    const noteCopy = { ...note };
    noteCopy.clientDeleteTime = null;
    return this.updateNote(noteCopy);
  }

  updateNote(note, clientSaveTime = Date.parse(new Date().toString())) {
    note.id = null; // set to null so we're creating a new notebook item
    return this.saveNotebookItem(
      note.id,
      note.nodeId,
      note.localNotebookItemId,
      note.type,
      note.title,
      note.content,
      note.groups,
      clientSaveTime,
      note.clientDeleteTime
    );
  }

  getLatestNotebookItemByLocalNotebookItemId(
    localNotebookItemId,
    workgroupId = this.ConfigService.getWorkgroupId()
  ) {
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

  getLatestNotebookReportItemByReportId(
    reportId,
    workgroupId = this.ConfigService.getWorkgroupId()
  ) {
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

  isNotebookEnabled(type: string = 'notebook') {
    return this.ProjectService.project[type] != null && this.ProjectService.project[type].enabled;
  }

  isStudentNoteEnabled() {
    return (
      this.ProjectService.project.notebook != null &&
      this.ProjectService.project.notebook.itemTypes.note.enabled
    );
  }

  isStudentNoteClippingEnabled() {
    return (
      this.isStudentNoteEnabled() &&
      this.ProjectService.project.notebook.itemTypes.note.enableClipping
    );
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
    return this.http
      .get(url)
      .toPromise()
      .then((resultData) => {
        const notebookItems = resultData;
        return this.handleRetrieveNotebookItems(notebookItems);
      });
  }

  handleRetrieveNotebookItems(notebookItems) {
    this.notebooksByWorkgroup = {};
    for (let notebookItem of notebookItems) {
      try {
        if (notebookItem.studentAssetId != null) {
          notebookItem.studentAsset = this.StudentAssetService.getAssetById(
            notebookItem.studentAssetId
          );
        } else if (notebookItem.studentWorkId != null) {
          notebookItem.studentWork = this.StudentDataService.getStudentWorkByStudentWorkId(
            notebookItem.studentWorkId
          );
        } else {
          notebookItem.content = JSON.parse(notebookItem.content);
        }
        const workgroupId = notebookItem.workgroupId;
        this.addToNotebooksByWorgkroup(notebookItem, workgroupId);
      } catch (e) {}
    }
    this.groupNotebookItems();
    return this.notebooksByWorkgroup;
  }

  addToNotebooksByWorgkroup(notebookItem, workgroupId) {
    if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
      this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    } else {
      this.notebooksByWorkgroup[workgroupId] = { allItems: [notebookItem] };
    }
  }

  /**
   * Groups the notebook items together in to a map-like structure by workgroup inside this.notebook.items.
   */
  groupNotebookItems() {
    for (let workgroupId in this.notebooksByWorkgroup) {
      if (this.notebooksByWorkgroup.hasOwnProperty(workgroupId)) {
        const notebookByWorkgroup = this.notebooksByWorkgroup[workgroupId];
        notebookByWorkgroup.items = {};
        notebookByWorkgroup.deletedItems = {}; // reset deleted items
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
              const lastRevision =
                allRevisionsForThisLocalNotebookItemId[
                  allRevisionsForThisLocalNotebookItemId.length - 1
                ];
              if (lastRevision != null && lastRevision.serverDeleteTime != null) {
                // the last revision for this was deleted,
                // so move the entire note (with all its revisions) to deletedItems
                notebookByWorkgroup.deletedItems[
                  notebookItemLocalNotebookItemIdKey
                ] = allRevisionsForThisLocalNotebookItemId;
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
    };
    return this.http
      .get(url, options)
      .toPromise()
      .then((resultData) => {
        const publicNotebookItemsForGroup = resultData;
        return this.handleRetrievePublicNotebookItems(publicNotebookItemsForGroup, group);
      });
  }

  handleRetrievePublicNotebookItems(publicNotebookItemsForGroup, group) {
    for (let publicNotebookItemForGroup of publicNotebookItemsForGroup) {
      publicNotebookItemForGroup.content = JSON.parse(publicNotebookItemForGroup.content);
    }
    this.publicNotebookItems[group] = publicNotebookItemsForGroup;
    this.broadcastPublicNotebookItemsRetrieved({ publicNotebookItems: this.publicNotebookItems });
    return this.publicNotebookItems;
  }

  saveNotebookItem(
    notebookItemId,
    nodeId,
    localNotebookItemId,
    type,
    title,
    content,
    groups = [],
    clientSaveTime = null,
    clientDeleteTime = null
  ) {
    if (this.ConfigService.isPreview()) {
      return this.savePreviewNotebookItem(
        notebookItemId,
        nodeId,
        localNotebookItemId,
        type,
        title,
        content,
        groups,
        clientSaveTime,
        clientDeleteTime
      );
    } else {
      return this.doSaveNotebookItem(
        notebookItemId,
        nodeId,
        localNotebookItemId,
        type,
        title,
        content,
        groups,
        clientDeleteTime
      );
    }
  }

  savePreviewNotebookItem(
    notebookItemId,
    nodeId,
    localNotebookItemId,
    type,
    title,
    content,
    groups,
    clientSaveTime,
    clientDeleteTime
  ) {
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
        serverSaveTime: clientSaveTime,
        clientDeleteTime: clientDeleteTime,
        serverDeleteTime: clientDeleteTime ? clientDeleteTime : null
      };
      const workgroupId = notebookItem.workgroupId;
      this.addToNotebooksByWorgkroup(notebookItem, workgroupId);
      this.groupNotebookItems();
      this.StudentDataService.updateNodeStatuses();
      this.broadcastNotebookUpdated({
        notebook: this.notebooksByWorkgroup[workgroupId],
        notebookItem: notebookItem
      });
      resolve(notebookItem);
    });
  }

  doSaveNotebookItem(
    notebookItemId,
    nodeId,
    localNotebookItemId,
    type,
    title,
    content,
    groups,
    clientDeleteTime
  ) {
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
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http
      .post(this.ConfigService.getNotebookURL(), $.param(params), { headers: headers })
      .toPromise()
      .then((resultData) => {
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
      this.broadcastNotebookUpdated({
        notebook: this.notebooksByWorkgroup[workgroupId],
        notebookItem: notebookItem
      });
    }
  }

  updatePrivateNotebookItem(notebookItem, workgroupId) {
    this.addToNotebooksByWorgkroup(notebookItem, workgroupId);
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
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      return this.http
        .post(url, $.param(params), { headers: headers })
        .toPromise()
        .then((resultData) => {
          const notebookItem = resultData;
          return this.handleNewNotebookItem(notebookItem);
        });
    }
  }

  handleNewNotebookItem(notebookItem) {
    notebookItem.content = JSON.parse(notebookItem.content);
    const workgroupId = notebookItem.workgroupId;
    this.notebooksByWorkgroup[workgroupId].allItems.push(notebookItem);
    this.groupNotebookItems();
    this.StudentDataService.updateNodeStatuses();
    this.broadcastNotebookUpdated({
      notebook: this.notebooksByWorkgroup[workgroupId],
      notebookItem: notebookItem
    });
    return notebookItem;
  }

  saveNotebookToggleEvent(isOpen, currentNode) {
    const nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Notebook';
    const eventData = {
      curentNodeId: currentNode == null ? null : currentNode.id
    };
    const event = isOpen ? 'notebookOpened' : 'notebookClosed';
    this.StudentDataService.saveVLEEvent(
      nodeId,
      componentId,
      componentType,
      category,
      event,
      eventData
    );
  }

  broadcastAddNote(args: any) {
    this.addNoteSource.next(args);
  }

  broadcastCloseNotebook() {
    this.closeNotebookSource.next();
  }

  broadcastEditNote(args: any) {
    this.editNoteSource.next(args);
  }

  broadcastNotebookItemChosen(args: any) {
    this.notebookItemChosenSource.next(args);
  }

  broadcastNotebookUpdated(args: any) {
    this.notebookUpdatedSource.next(args);
  }

  broadcastOpenNotebook(args: any) {
    this.openNotebookSource.next(args);
  }

  broadcastPublicNotebookItemsRetrieved(args: any) {
    this.publicNotebookItemsRetrievedSource.next(args);
  }

  broadcastShowReportAnnotations() {
    this.showReportAnnotationsSource.next();
  }
}
