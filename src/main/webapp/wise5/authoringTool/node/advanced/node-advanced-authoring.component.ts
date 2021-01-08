import { ConfigService } from '../../../services/configService';
import { TeacherDataService } from '../../../services/teacherDataService';
import { TeacherProjectService } from '../../../services/teacherProjectService';

class NodeAdvancedAuthoringController {
  node: any;
  nodeId: string;

  static $inject = ['$state', 'ConfigService', 'ProjectService', 'TeacherDataService'];

  constructor(
    private $state: any,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {}

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
  }

  goBack() {
    this.$state.go('root.at.project.node', {
      projectId: this.ConfigService.getProjectId(),
      nodeId: this.nodeId
    });
  }

  showCreateBranchView() {
    this.$state.go('root.at.project.node.advanced.branch');
  }

  showEditTransitionsView() {
    this.$state.go('root.at.project.node.advanced.path');
  }

  showEditConstraintsView() {
    this.$state.go('root.at.project.node.advanced.constraint');
  }

  showGeneralAdvancedView() {
    this.$state.go('root.at.project.node.advanced.general');
  }

  showJSONView() {
    this.$state.go('root.at.project.node.advanced.json');
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }
}

export const NodeAdvancedAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/node-advanced-authoring.component.html`,
  controller: NodeAdvancedAuthoringController
};
