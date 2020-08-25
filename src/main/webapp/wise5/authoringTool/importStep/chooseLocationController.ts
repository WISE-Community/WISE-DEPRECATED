'use strict';

import { TeacherProjectService } from '../../services/teacherProjectService';

class ChooseLocationController {
  groupNodes: any;
  importFromProjectId: number;
  projectId: number;
  selectedNodes: any[];

  static $inject = ['$state', '$stateParams', 'ProjectService'];
  constructor(
    private $state: any,
    $stateParams: any,
    private ProjectService: TeacherProjectService
  ) {
    this.ProjectService = ProjectService;
    this.groupNodes = this.ProjectService.getGroupNodesIdToOrder();
    this.projectId = $stateParams.projectId;
    this.importFromProjectId = $stateParams.importFromProjectId;
    this.selectedNodes = $stateParams.selectedNodes;
  }

  importSelectedNodes(nodeIdToInsertInsideOrAfter) {
    this.ProjectService.copyNodes(
      this.selectedNodes,
      this.importFromProjectId,
      this.projectId,
      nodeIdToInsertInsideOrAfter
    ).then(() => {
      this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        this.ProjectService.refreshProject();
        this.$state.go('root.at.project');
      });
    });
  }

  cancel() {
    this.$state.go('root.at.project');
  }
}

export default ChooseLocationController;
