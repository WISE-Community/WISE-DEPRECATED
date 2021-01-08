'use strict';

import { ProjectService } from '../../../../services/projectService';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'node-icon',
  templateUrl: 'node-icon.component.html',
  styleUrls: ['node-icon.component.scss']
})
export class NodeIconComponent {
  @Input()
  customClass: string;

  @Input()
  icon: any;

  isGroup: boolean;

  @Input()
  nodeId: string;

  @Input()
  size: any;

  sizeClass: any;

  constructor(private ProjectService: ProjectService) {}

  ngOnChanges() {
    this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
    if (this.icon == null) {
      this.icon = this.ProjectService.getNodeIconByNodeId(this.nodeId);
    }
    if (this.size) {
      this.sizeClass = `mat-${this.size}`;
    }
  }

  isFont() {
    return this.icon.type === 'font';
  }

  isImage() {
    return this.icon.type === 'img';
  }
}
