'use strict';

import { Component, Input } from '@angular/core';
import { NodeService } from '../../../../services/nodeService';

@Component({
  selector: 'help-icon',
  styleUrls: ['help-icon.component.scss'],
  templateUrl: 'help-icon.component.html'
})
export class HelpIconComponent {
  @Input()
  color: string;

  @Input()
  customClass: string;

  @Input()
  icon: string;

  @Input()
  iconClass: string;

  @Input()
  label: string;

  @Input()
  pulse: boolean;

  @Input()
  rubricId: string;

  constructor(private NodeService: NodeService) {}

  showRubric() {
    this.NodeService.showRubric(this.rubricId);
  }
}
