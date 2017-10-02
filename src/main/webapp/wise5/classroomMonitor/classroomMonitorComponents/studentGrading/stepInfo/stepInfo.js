"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepInfoController = function StepInfoController($filter, ProjectService) {
  var _this = this;

  _classCallCheck(this, StepInfoController);

  this.$filter = $filter;
  this.ProjectService = ProjectService;

  this.$translate = this.$filter('translate');

  this.$onInit = function () {
    _this.stepTitle = _this.showPosition ? _this.ProjectService.nodeIdToNumber[_this.nodeId] + ': ' + _this.nodeTitle : _this.nodeTitle;
    _this.icon = _this.ProjectService.getNodeIconByNodeId(_this.nodeId);
    if (_this.hasAlert) {
      _this.alertIconClass = _this.hasNewAlert ? 'warn' : 'text-disabled';
      _this.alertIconName = 'notifications';
      _this.alertIconLabel = _this.hasNewAlert ? _this.$translate('HAS_ALERTS_NEW') : _this.$translate('HAS_ALERTS_DISMISSED');
    }
    _this.hasRubrics = _this.ProjectService.getNumberOfRubricsByNodeId(_this.nodeId) > 0;
    _this.rubricIconLabel = _this.$translate('STEP_HAS_RUBRICS_TIPS');
    _this.rubricIconClass = 'info';
    _this.rubricIconName = 'info';
  };
};

StepInfoController.$inject = ['$filter', 'ProjectService'];

var StepInfo = {
  bindings: {
    hasAlert: '<',
    hasNewAlert: '<',
    hasNewWork: '<',
    hasRubrics: '<',
    nodeId: '<',
    nodeTitle: '@',
    showPosition: '<'
  },
  controller: StepInfoController,
  template: '<div layout="row" layout-align="start center">\n    <node-icon node-id="$ctrl.nodeId" size="18" hide-xs></node-icon>\n    <span hide-xs>&nbsp;&nbsp;</span>\n    <div class="heavy">\n      {{ $ctrl.stepTitle }}\n      <status-icon ng-if="$ctrl.hasAlert"\n                   icon-class="$ctrl.alertIconClass"\n                   icon-name="$ctrl.alertIconName"\n                   icon-label="$ctrl.alertIconLabel"\n                   icon-tooltip="$ctrl.alertIconLabel"></status-icon>\n      <status-icon ng-if="$ctrl.hasRubrics"\n                   icon-class="$ctrl.rubricIconClass"\n                   icon-name="$ctrl.rubricIconName"\n                   icon-label="$ctrl.rubricIconLabel"\n                   icon-tooltip="$ctrl.rubricIconLabel"></status-icon>\n      <span ng-if="$ctrl.hasNewWork" class="badge badge--info\n            animate-fade">{{ \'NEW\' | translate }}</span>\n    </div>\n  </div>'
};

exports.default = StepInfo;
//# sourceMappingURL=stepInfo.js.map
