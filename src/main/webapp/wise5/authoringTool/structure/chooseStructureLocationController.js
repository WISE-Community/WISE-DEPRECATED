'use strict';

class ChooseStructureLocationController {
  constructor($rootScope, $state, $stateParams, $scope, ProjectService) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.ProjectService = ProjectService;
    this.groupNodes = this.ProjectService.getGroupNodesIdToOrder();
    this.projectId = $stateParams.projectId;
    this.structure = $stateParams.structure;
  }

  insertAsFirstActivity() {
    this.$state.go('root.project');
  }

  insertAfter(afterGroupId) {
    const groupToAdd = this.ProjectService.createGroup(this.structure.label);
    this.ProjectService.createNodeAfter(groupToAdd, afterGroupId);
    this.ProjectService.parseProject();
    const node1 = this.ProjectService.createNodeAndAddToLocalStorage('Instructions');
    this.ProjectService.addNodeToGroup(node1, groupToAdd);
    const node2 = this.ProjectService.createNodeAndAddToLocalStorage('Gather Evidence');
    this.ProjectService.addNodeToGroup(node2, groupToAdd);
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      this.$rootScope.$broadcast('parseProject');
      this.$state.go('root.project');
    });
  }

  cancel() {
    this.$state.go('root.project');
  }
}

ChooseStructureLocationController.$inject = [
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'ProjectService'
];

export default ChooseStructureLocationController;
