'use strict';

class ManageStudentsController {
  iframeSrc: string;
  static $inject = ['ConfigService'];
  constructor(ConfigService) {
    const runId = ConfigService.getRunId();
    const contextPath = ConfigService.getConfigParam('contextPath');
    this.iframeSrc = `${contextPath}/teacher/management/viewmystudents?runId=${runId}`;
  }
}

export default ManageStudentsController;
