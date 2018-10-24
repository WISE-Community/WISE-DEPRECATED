'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ManageStudentsController = function ManageStudentsController(ConfigService) {
    _classCallCheck(this, ManageStudentsController);

    var runId = ConfigService.getRunId();
    var contextPath = ConfigService.getConfigParam('contextPath');
    this.iframeSrc = contextPath + '/teacher/management/viewmystudents?runId=' + runId;
};

ManageStudentsController.$inject = ['ConfigService'];

exports.default = ManageStudentsController;
//# sourceMappingURL=manageStudentsController.js.map
