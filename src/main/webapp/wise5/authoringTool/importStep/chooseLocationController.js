'use strict';

class ChooseLocationController {
  constructor($rootScope, $state, $stateParams, ProjectService) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
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
        this.$rootScope.$broadcast('parseProject');
        this.$state.go('root.project');
      });
    });
  }

  cancel() {
    this.$state.go('root.project');
  }
}

ChooseLocationController.$inject = [
  '$rootScope',
  '$state',
  '$stateParams',
  'ProjectService'
];

export default ChooseLocationController;
