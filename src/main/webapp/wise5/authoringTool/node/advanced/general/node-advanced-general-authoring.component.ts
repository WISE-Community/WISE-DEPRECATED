import { Component } from '@angular/core';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

@Component({
  templateUrl: 'node-advanced-general-authoring.component.html'
})
export class NodeAdvancedGeneralAuthoringComponent {
  node: any;

  constructor(
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {}

  ngOnInit() {
    this.node = this.TeacherDataService.getCurrentNode();
  }

  saveProject() {
    return this.ProjectService.saveProject();
  }
}
