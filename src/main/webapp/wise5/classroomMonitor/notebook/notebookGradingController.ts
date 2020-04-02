'use strict';

import ConfigService from '../../services/configService';
import NotebookService from '../../services/notebookService';
import ClassroomMonitorProjectService from '../classroomMonitorProjectService';
import TeacherDataService from '../../services/teacherDataService';

class NotebookGradingController {
  notebookConfig: any;
  showAllNotes: boolean = false;
  showAllReports: boolean = false;
  showNoteForWorkgroup: any;
  showReportForWorkgroup: any;
  teacherWorkgroupId: number;
  themePath: string;
  workgroups: any[];

  static $inject = ['ConfigService', 'NotebookService', 'ProjectService', 'TeacherDataService'];

  constructor(
    private ConfigService: ConfigService,
    private NotebookService: NotebookService,
    private ProjectService: ClassroomMonitorProjectService,
    private TeacherDataService: TeacherDataService
  ) {
    this.themePath = this.ProjectService.getThemePath();
    this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();
    this.workgroups = this.ConfigService.getClassmateUserInfos();
    this.notebookConfig = this.NotebookService.getStudentNotebookConfig();
    this.showNoteForWorkgroup = {};
    this.showReportForWorkgroup = {};
    for (let i = 0; i < this.workgroups.length; i++) {
      let workgroup = this.workgroups[i];
      this.showNoteForWorkgroup[workgroup.workgroupId] = false;
      this.showReportForWorkgroup[workgroup.workgroupId] = false;
    }

    // save event when notebook grading view is displayed
    let context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'notebookViewDisplayed',
      data = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  toggleDisplayNoteForWorkgroup(workgroupId) {
    this.showNoteForWorkgroup[workgroupId] = !this.showNoteForWorkgroup[workgroupId];
  }

  toggleDisplayReportForWorkgroup(workgroupId) {
    this.showReportForWorkgroup[workgroupId] = !this.showReportForWorkgroup[workgroupId];
  }

  toggleDisplayAllNotes() {
    this.showAllNotes = !this.showAllNotes;

    for (let workgroupId in this.showNoteForWorkgroup) {
      this.showNoteForWorkgroup[workgroupId] = this.showAllNotes;
    }
  }

  toggleDisplayAllReports() {
    this.showAllReports = !this.showAllReports;
    for (let workgroupId in this.showReportForWorkgroup) {
      this.showReportForWorkgroup[workgroupId] = this.showAllReports;
    }
  }

  viewNotes(workgroupId) {
    alert(workgroupId);
  }

  viewReport(workgroupId) {
    alert(workgroupId);
  }

  getCurrentPeriod() {
    return this.TeacherDataService.getCurrentPeriod();
  }

  getNotebookForWorkgroup(workgroupId) {
    return this.NotebookService.getNotebookByWorkgroup(workgroupId);
  }

  getNotebookConfigForWorkgroup(workgroupId) {
    if (
      this.ConfigService.isRunOwner(workgroupId) ||
      this.ConfigService.isRunSharedTeacher(workgroupId)
    ) {
      return this.NotebookService.getTeacherNotebookConfig();
    } else {
      return this.NotebookService.getStudentNotebookConfig();
    }
  }
}

export default NotebookGradingController;
