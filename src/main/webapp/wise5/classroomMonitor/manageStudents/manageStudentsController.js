'use strict'

class ManageStudentsController {

    constructor(ConfigService) {
        const runId = ConfigService.getRunId();
        const contextPath = ConfigService.getConfigParam('contextPath');
        this.iframeSrc = `${contextPath}/teacher/management/viewmystudents?runId=${runId}`;
    }
}

ManageStudentsController.$inject = [
  'ConfigService'
];

export default ManageStudentsController;
