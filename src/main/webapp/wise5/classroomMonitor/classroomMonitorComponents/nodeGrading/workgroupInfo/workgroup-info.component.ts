'use strict';

import { Component, Input } from '@angular/core';
import { ConfigService } from '../../../../services/configService';

@Component({
  selector: 'workgroup-info',
  templateUrl: 'workgroup-info.component.html'
})
export class WorkgroupInfoComponent {
  alertIconClass: string;
  alertIconName: string;
  alertLabel: string;
  avatarColor: any;

  @Input()
  hasAlert: boolean;

  @Input()
  hasNewAlert: boolean;

  @Input()
  hasNewWork: boolean;

  @Input()
  usernames: string;

  @Input()
  workgroupId: number;

  constructor(private ConfigService: ConfigService) {}

  ngOnInit() {
    this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
    this.alertIconClass = this.hasNewAlert ? 'warn' : 'text-disabled';
    this.alertIconName = 'notifications';
    this.alertLabel = this.hasNewAlert
      ? $localize`Has new alert(s)`
      : $localize`Has dismissed alert(s)`;
  }
}
