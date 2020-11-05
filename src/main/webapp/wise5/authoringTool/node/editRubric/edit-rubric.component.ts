import { ConfigService } from "../../../services/configService";
import { ProjectService } from "../../../services/projectService";
import { TeacherDataService } from "../../../services/teacherDataService";
import { UtilService } from "../../../services/utilService";

class EditRubricComponentController {

  node: any;
  nodeId: string;
  rubric: string;

  static $inject = [
    '$state',
    'ConfigService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
      private $state: any,
      private ConfigService: ConfigService,
      private ProjectService: ProjectService,
      private TeacherDataService: TeacherDataService,
      private UtilService: UtilService
  ) {}

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.rubric = this.ProjectService.replaceAssetPaths(this.node.rubric);
  }

  rubricChanged() {
    let html = this.ConfigService.removeAbsoluteAssetPaths(this.rubric);
    html = this.UtilService.insertWISELinks(html);
    this.node.rubric = html;
    this.ProjectService.saveProject();
  }

  goBack() {
    this.$state.go('root.at.project.node', { projectId: this.ConfigService.getProjectId(),
        nodeId: this.nodeId });
  }
}

export const EditRubricComponent = {
  templateUrl: `/wise5/authoringTool/node/editRubric/edit-rubric.component.html`,
  controller: EditRubricComponentController
}
