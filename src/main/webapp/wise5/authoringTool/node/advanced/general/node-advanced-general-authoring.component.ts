import { TeacherDataService } from "../../../../services/teacherDataService";
import { TeacherProjectService } from "../../../../services/teacherProjectService";

class NodeAdvancedGeneralAuthoringController {

  node: any;

  static $inject = ['ProjectService', 'TeacherDataService'];

  constructor(private ProjectService: TeacherProjectService,
      private TeacherDataService: TeacherDataService) {
  }

  $onInit() {
    const nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(nodeId);
  }

  saveProject() {
    return this.ProjectService.saveProject();
  }
}

export const NodeAdvancedGeneralAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/general/node-advanced-general-authoring.component.html`,
  controller: NodeAdvancedGeneralAuthoringController
}
