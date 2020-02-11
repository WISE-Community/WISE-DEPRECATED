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
    const newGroup = this.ProjectService.createGroup(this.structure.label);
    this.ProjectService.createNodeInside(newGroup, this.ProjectService.getStartGroupId());
    this.ProjectService.parseProject();
    this.addStepsToGroup(newGroup);
    return newGroup;
  }

  insertAfterGroup(groupId) {
    const newGroup = this.ProjectService.createGroup(this.structure.label);
    this.ProjectService.createNodeAfter(newGroup, groupId);
    this.ProjectService.parseProject();
    this.addStepsToGroup(newGroup);
    return newGroup;
  }

  addStepsToGroup(group) {
    const node1 = this.ProjectService.createNodeAndAddToLocalStorage('Instructions');
    this.ProjectService.addNodeToGroup(node1, group);
    const htmlComponent = this.ProjectService.createComponent(node1.id, 'HTML');
    htmlComponent.html =
      'Here are your instructions. Do this activity and discuss with your peers.';
    const node2 = this.ProjectService.createNodeAndAddToLocalStorage('Gather Evidence');
    this.ProjectService.addNodeToGroup(node2, group);
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
