'use strict';

import { ConfigService } from '../../../../services/configService';

class WorkgroupInfoController {
  $translate: any;
  alertIconClass: string;
  alertIconName: string;
  alertLabel: string;
  avatarColor: any;
  hasNewAlert: boolean;
  workgroupId: number;

  static $inject = ['$filter', 'ConfigService'];
  constructor($filter: any, private ConfigService: ConfigService) {
    this.ConfigService = ConfigService;
    this.$translate = $filter('translate');
  }

  $onInit() {
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.alertIconClass = this.hasNewAlert ? 'warn' : 'text-disabled';
    this.alertIconName = 'notifications';
    this.alertLabel = this.hasNewAlert
      ? this.$translate('HAS_ALERTS_NEW')
      : this.$translate('HAS_ALERTS_DISMISSED');
  }
}

const WorkgroupInfo = {
  bindings: {
    hasAlert: '<',
    hasNewAlert: '<',
    workgroupId: '<',
    usernames: '@'
  },
  template: `<div layout="row" layout-align="start center">
            <div class="md-avatar" hide-xs>
                <md-icon class="md-36" style="color: {{ ::$ctrl.avatarColor }};"> account_circle </md-icon>
            </div>
            <div class="heavy">
                {{ ::$ctrl.usernames }} <span class="md-caption text-secondary more">({{ ::'teamId' | translate:{ id: $ctrl.workgroupId} }})</span>
                <status-icon ng-if="$ctrl.hasAlert"
                             icon-label="$ctrl.alertLabel"
                             icon-tooltip="$ctrl.alertLabel"
                             icon-tooltip="$ctrl.alertMsg"
                             icon-name="$ctrl.alertIconName"
                             icon-class="$ctrl.alertIconClass"></status-icon>
                <span ng-if="$ctrl.hasNewWork" class="badge badge--info animate-fade">{{ ::'NEW' | translate }}</span>
            </div>
        </div>`,
  controller: WorkgroupInfoController
};

export default WorkgroupInfo;
