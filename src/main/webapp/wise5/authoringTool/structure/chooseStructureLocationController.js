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
    this.structure = this.injectUniqueIds(this.structure);
  }

  insertAsFirstActivity() {
    this.addNodesToProject(this.structure.nodes);
    this.ProjectService.createNodeInside(
      this.structure.group,
      this.ProjectService.getStartGroupId()
    );
    this.saveAndGoBackToProjectHome();
  }

  insertAfterGroup(groupId) {
    this.addNodesToProject(this.structure.nodes);
    this.ProjectService.createNodeAfter(this.structure.group, groupId);
    this.saveAndGoBackToProjectHome();
  }

  addNodesToProject(nodes) {
    for (const node of nodes) {
      this.ProjectService.setIdToNode(node.id, node);
      this.ProjectService.addNode(node);
      this.ProjectService.applicationNodes.push(node);
    }
  }

  saveAndGoBackToProjectHome() {
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      this.$rootScope.$broadcast('parseProject');
      this.$state.go('root.project');
    });
  }

  injectUniqueIds(structure) {
    structure.group.id = this.ProjectService.getNextAvailableGroupId();
    const newNodeIds = [];
    const oldToNewNodeIds = {};
    for (const node of structure.nodes) {
      const oldNodeId = node.id;
      const newNodeId = this.ProjectService.getNextAvailableNodeId(newNodeIds);
      oldToNewNodeIds[oldNodeId] = newNodeId;
      newNodeIds.push(newNodeId);
    }
    return this.replaceOldNodeIds(structure, oldToNewNodeIds);
  }

  replaceOldNodeIds(structure, oldToNewNodeIds) {
    let structureJSONString = JSON.stringify(structure);
    for (const oldNodeId of Object.keys(oldToNewNodeIds).reverse()) {
      const newNodeId = oldToNewNodeIds[oldNodeId];
      structureJSONString = this.replaceNodeIds(structureJSONString, oldNodeId, newNodeId);
      structureJSONString = this.replaceConstraintIds(structureJSONString, oldNodeId, newNodeId);
    }
    return JSON.parse(structureJSONString);
  }

  replaceNodeIds(structureJSONString, oldNodeId, newNodeId) {
    const regex = new RegExp(`\"${oldNodeId}\"`, 'g');
    return structureJSONString.replace(regex, `"${newNodeId}"`);
  }

  replaceConstraintIds(structureJSONString, oldNodeId, newNodeId) {
    const regex = new RegExp(`\"${oldNodeId}Constraint`, 'g');
    return structureJSONString.replace(regex, `"${newNodeId}Constraint`);
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
