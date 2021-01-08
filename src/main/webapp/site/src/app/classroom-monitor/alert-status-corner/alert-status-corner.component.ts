import { Component, Input } from '@angular/core';

@Component({
  selector: 'alert-status-corner',
  templateUrl: 'alert-status-corner.component.html'
})
export class AlertStatusCornerComponent {
  @Input()
  hasNewAlert: boolean;

  @Input()
  hasAlert: boolean;

  @Input()
  message: string;
}
