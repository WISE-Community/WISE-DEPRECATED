import { Directive, Input } from '@angular/core';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';

@Directive()
export abstract class EditAdvancedComponentComponent {
  authoringComponentContent: any;
  @Input()
  componentId: string;
  @Input()
  nodeId: string;

  constructor(protected ProjectService: TeacherProjectService) {}

  ngOnInit() {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
  }
}
