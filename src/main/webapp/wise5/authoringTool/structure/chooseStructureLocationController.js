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
    const groupToAdd = this.ProjectService.createGroup(this.createGroupTitle);
    this.ProjectService.createNodeAfter(groupToAdd, afterGroupId);
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
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
