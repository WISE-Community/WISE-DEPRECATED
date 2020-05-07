'use strict';

import ClassroomMonitorProjectService from '../../../classroomMonitorProjectService';

class NotebookWorkgroupGradingController {
  workgroup: any;
  themePath: string;

  static $inject = ['ClassroomMonitorProjectService'];

  constructor(private ProjectService: ClassroomMonitorProjectService) {
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.themePath = this.ProjectService.getThemePath();
  }
}

const NotebookWorkgroupGrading = {
  bindings: {
    workgroup: '<',
    notesEnabled: '<',
    reportEnabled: '<',
    reportTitle: '@'
  },
  templateUrl: 'wise5/classroomMonitor/notebook/notebookWorkgroupGrading/notebookWorkgroupGrading.html',
  controller: NotebookWorkgroupGradingController,
  controllerAs: '$ctrl'
};

export default NotebookWorkgroupGrading;
