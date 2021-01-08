import { Component, Input } from '@angular/core';

@Component({
  selector: 'workgroup-node-status',
  template: `<span class="md-body-2 block center {{ statusClass }}">{{ statusText }}</span>`
})
export class WorkgroupNodeStatusComponent {
  @Input()
  statusClass: string = 'text-secondary';

  @Input()
  statusText: string;
}
