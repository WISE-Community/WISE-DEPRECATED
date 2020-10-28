import { Component } from "@angular/core";
import { TeacherDataService } from "../../../../services/teacherDataService";
import { TeacherProjectService } from "../../../../services/teacherProjectService";

@Component({
  templateUrl: 'node-advanced-general-authoring.component.html'
})
export class NodeAdvancedGeneralAuthoringComponent {

  node: any;

  constructor(private ProjectService: TeacherProjectService,
      private TeacherDataService: TeacherDataService) {
  }

  ngOnInit() {
    const nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(nodeId);
  }

  saveProject() {
    return this.ProjectService.saveProject();
  }
}
