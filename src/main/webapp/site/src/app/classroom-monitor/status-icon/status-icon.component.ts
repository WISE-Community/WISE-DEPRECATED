import { Component, Input } from '@angular/core';

@Component({
  selector: 'status-icon',
  styleUrls: ['status-icon.component.scss'],
  templateUrl: 'status-icon.component.html'
})
export class StatusIconComponent {
  @Input()
  iconClass: string;

  @Input()
  iconLabel: string;

  @Input()
  iconName: string;

  @Input()
  iconTooltip: string;

  constructor() {}
}
