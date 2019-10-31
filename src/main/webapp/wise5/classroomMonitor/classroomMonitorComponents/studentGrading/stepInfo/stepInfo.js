"use strict";

class StepInfoController {
  constructor($filter,
        ProjectService) {
    this.$filter = $filter;
    this.ProjectService = ProjectService;

    this.$translate = this.$filter('translate');

    this.$onInit = () => {
      this.stepTitle = this.showPosition ? (this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.nodeTitle) : this.nodeTitle;
      this.icon = this.ProjectService.getNodeIconByNodeId(this.nodeId);
      if (this.hasAlert) {
        this.alertIconClass = this.hasNewAlert ? 'warn' : 'text-disabled';
        this.alertIconName = 'notifications';
        this.alertIconLabel = this.hasNewAlert ? this.$translate('HAS_ALERTS_NEW') : this.$translate('HAS_ALERTS_DISMISSED');
      }
      this.hasRubrics = this.ProjectService.getNumberOfRubricsByNodeId(this.nodeId) > 0;
      this.rubricIconLabel = this.$translate('STEP_HAS_RUBRICS_TIPS');
      this.rubricIconClass = 'info';
      this.rubricIconName = 'info';
    }
  };
}

StepInfoController.$inject = [
  '$filter',
  'ProjectService'
];

const StepInfo = {
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
  template:
  `<div layout="row" layout-align="start center">
    <node-icon node-id="$ctrl.nodeId" size="18" hide-xs></node-icon>
    <span hide-xs>&nbsp;&nbsp;</span>
    <div class="heavy">
      {{ ::$ctrl.stepTitle }}
      <status-icon ng-if="$ctrl.hasAlert"
                   icon-class="$ctrl.alertIconClass"
                   icon-name="$ctrl.alertIconName"
                   icon-label="$ctrl.alertIconLabel"
                   icon-tooltip="$ctrl.alertIconLabel"></status-icon>
      <status-icon ng-if="$ctrl.hasRubrics"
                   icon-class="$ctrl.rubricIconClass"
                   icon-name="$ctrl.rubricIconName"
                   icon-label="$ctrl.rubricIconLabel"
                   icon-tooltip="$ctrl.rubricIconLabel"></status-icon>
      <span ng-if="$ctrl.hasNewWork" class="badge badge--info
            animate-fade">{{ ::'NEW' | translate }}</span>
    </div>
  </div>`
};

export default StepInfo;
