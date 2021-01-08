'use strict';

import { NotebookService } from '../../../../services/notebookService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

class NotebookWorkgroupGradingController {
  expand: boolean;
  onUpdateExpand: any;
  maxScore: number;
  notebook: any;
  notebookConfig: any;
  reportEnabled: boolean;
  reportHasWork: boolean;
  themePath: string;
  workgroup: any;

  static $inject = ['NotebookService', 'ProjectService'];

  constructor(
    private NotebookService: NotebookService,
    private ProjectService: TeacherProjectService
  ) {}

  $onInit() {
    this.themePath = this.ProjectService.getThemePath();
    if (this.reportEnabled) {
      const reportId = this.notebookConfig.itemTypes.report.notes[0].reportId;
      this.maxScore = this.NotebookService.getMaxScoreByReportId(reportId);
    }
    this.notebook = this.NotebookService.getNotebookByWorkgroup(this.workgroup.workgroupId);
  }

  $onChanges() {
    this.reportHasWork = this.workgroup.report ? true : false;
  }

  toggleExpand() {
    const expand = !this.expand;
    this.onUpdateExpand({ workgroupId: this.workgroup.workgroupId, value: expand });
  }

  getNumActiveNotes() {
    return this.workgroup.notes.filter((note) => {
      return note.serverDeleteTime == null;
    }).length;
  }
}

const NotebookWorkgroupGrading = {
  bindings: {
    workgroup: '<',
    expand: '<',
    notebookConfig: '<',
    notesEnabled: '<',
    reportEnabled: '<',
    reportTitle: '@',
    onUpdateExpand: '&'
  },
  templateUrl:
    'wise5/classroomMonitor/classroomMonitorComponents/notebook/notebookWorkgroupGrading/notebookWorkgroupGrading.html',
  controller: NotebookWorkgroupGradingController,
  controllerAs: '$ctrl'
};

export default NotebookWorkgroupGrading;
