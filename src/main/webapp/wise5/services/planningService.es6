'use strict';

class PlanningService {
  constructor(ProjectService) {
    this.ProjectService = ProjectService;
  };

  getPlanningNodes() {
    return this.ProjectService.project.planningNodes;
  };

  /**
   * Check if a node is a planning node
   * @param nodeId the node id
   * @returns whether the node is a planning node
   */
  isPlanning(nodeId) {
    const node = this.ProjectService.getNodeById(nodeId);
    return node != null && node.planning;
  }

  /**
   * Check if a node is a planning node instance
   * @param nodeId the node id
   * @returns whether the node is a planning node instance
   */
  isPlanningInstance(nodeId) {
    const node = this.ProjectService.getNodeById(nodeId);
    return node != null && node.planningNodeTemplateId;
  }

  /**
   * Get the available planning nodes for a given group
   * @param nodeId the node id of the group
   * @returns an array of planning node templates
   */
  getAvailablePlanningNodes(nodeId) {
    const availablePlanningNodesSoFar = [];
    const node = this.ProjectService.getNodeById(nodeId);
    if (node != null && node.availablePlanningNodes != null) {
      const availablePlanningNodes = node.availablePlanningNodes;
      for (let availablePlanningNode of availablePlanningNodes) {
        const availablePlanningNodeActual =
          this.ProjectService.getNodeById(availablePlanningNode.nodeId);
        if (availablePlanningNodeActual != null) {
          if (availablePlanningNode.max != null) {
            availablePlanningNodeActual.max = availablePlanningNode.max;
          }
          availablePlanningNodesSoFar.push(availablePlanningNodeActual);
        }
      }
    }
    return availablePlanningNodesSoFar;
  }

  /**
   * Create a planning node instance and add it to the project
   * @param nodeId the node id of the planning node template
   * @param nextAvailablePlanningNodeId the node id of the planning node instance
   */
  createPlanningNodeInstance(nodeId, nextAvailablePlanningNodeId) {
    const planningNodeInstance = this.ProjectService.copyNode(nodeId);
    planningNodeInstance.planningNodeTemplateId = nodeId;
    planningNodeInstance.id = nextAvailablePlanningNodeId;
    return planningNodeInstance;
  }

  /**
   * Add a planning node instance inside a group node
   * @param nodeIdToInsertInside the group id to insert into
   * @param planningNodeInstance the planning node instance to add
   */
  addPlanningNodeInstanceInside(nodeIdToInsertInside, planningNodeInstance) {
    const planningNodeInstanceNodeId = planningNodeInstance.id;
    this.ProjectService.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
    this.ProjectService.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);
    this.ProjectService.addNode(planningNodeInstance);
    this.ProjectService.insertNodeInsideOnlyUpdateTransitions(planningNodeInstanceNodeId, nodeIdToInsertInside);
    this.ProjectService.insertNodeInsideInGroups(planningNodeInstanceNodeId, nodeIdToInsertInside);
    this.ProjectService.recalculatePositionsInGroup(nodeIdToInsertInside);
    this.ProjectService.calculateNodeOrderOfProject();
  }

  /**
   * Add a planning node instance after a node
   * @param nodeIdToInsertAfter the node to insert after
   * @param planningNodeInstance the planning node instance to add
   */
  addPlanningNodeInstanceAfter(nodeIdToInsertAfter, planningNodeInstance) {
    const planningNodeInstanceNodeId = planningNodeInstance.id;
    this.ProjectService.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
    this.ProjectService.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);
    this.ProjectService.addNode(planningNodeInstance);
    this.ProjectService.insertNodeAfterInTransitions(planningNodeInstance, nodeIdToInsertAfter);
    this.ProjectService.insertNodeAfterInGroups(planningNodeInstanceNodeId, nodeIdToInsertAfter);
    const parentGroup = this.ProjectService.getParentGroup(nodeIdToInsertAfter);
    this.ProjectService.recalculatePositionsInGroup(parentGroup.id);
    this.ProjectService.calculateNodeOrderOfProject();
  }

  /**
   * Move a planning node instance inside a group
   * @param nodeIdToMove the node to move
   * @param nodeIdToInsertInside the group to move the node into
   */
  movePlanningNodeInstanceInside(nodeIdToMove, nodeIdToInsertInside) {
    this.ProjectService.moveNodesInside([nodeIdToMove], nodeIdToInsertInside);
    this.ProjectService.recalculatePositionsInGroup(nodeIdToInsertInside);
    this.ProjectService.calculateNodeOrderOfProject();
  }

  /**
   * Move a planning node instance after a node
   * @param nodeIdToMove the node to move
   * @param nodeIdToInsertAfter the other node to move the node after
   */
  movePlanningNodeInstanceAfter(nodeIdToMove, nodeIdToInsertAfter) {
    this.ProjectService.moveNodesAfter([nodeIdToMove], nodeIdToInsertAfter);
    const parentGroup = this.ProjectService.getParentGroup(nodeIdToInsertAfter);
    this.ProjectService.recalculatePositionsInGroup(parentGroup.id);
    this.ProjectService.calculateNodeOrderOfProject();
  }
}

PlanningService.$inject = [
  'ProjectService'
];

export default PlanningService;
