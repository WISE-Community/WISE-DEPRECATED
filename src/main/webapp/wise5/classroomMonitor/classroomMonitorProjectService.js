'use strict';
import ProjectService from '../services/projectService';

class ClassroomMonitorProjectService extends ProjectService {
  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    super($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService);
  }

  /**
   * Get the node ids and component ids in a node
   * @param nodeId get the node ids and component ids in this node
   * @returns an array of objects. the objects contain a node id
   * and component id.
   */
  getNodeIdsAndComponentIds(nodeId) {
    const nodeIdAndComponentIds = [];
    if (nodeId != null) {
      const nodeContent = this.getNodeContentByNodeId(nodeId);
      if (nodeContent != null) {
        const components = nodeContent.components;
        if (components != null) {
          for (let component of components) {
            if (component != null) {
              const componentId = component.id;
              const nodeIdAndComponentId = {};
              nodeIdAndComponentId.nodeId = nodeId;
              nodeIdAndComponentId.componentId = componentId;
              nodeIdAndComponentIds.push(nodeIdAndComponentId);
            }
          }
        }
      }
    }
    return nodeIdAndComponentIds;
  }

  /**
   * Get the branch letter in the node position string if the node is in a
   * branch path
   * @param nodeId the node id we want the branch letter for
   * @return the branch letter in the node position if the node is in a branch
   * path
   */
  getBranchLetter(nodeId) {
    if (nodeId != null) {
      // get the node position e.g. "1.8" or "1.9 A"
      const nodePosition = this.getNodePositionById(nodeId);

      if (nodePosition != null) {
        // regex for extracting the branch letter
        const branchLetterRegex = /.*([A-Z])/;

        // run the regex on the node position string
        const match = branchLetterRegex.exec(nodePosition);

        if (match != null) {
          /*
           * the node position has a branch letter so we will get it
           * from the matched group
           */
          return match[1];
        }
      }
    }
    return null;
  }

  /**
   * Recursively calculates the node order.
   * @param node
   */
  calculateNodeOrder(node) {
    this.idToOrder[node.id] = {'order': this.nodeCount};
    this.nodeCount++;
    if (this.isGroupNode(node.id)) {
      const childIds = node.ids;
      for (let childId of childIds) {
        const child = this.getNodeById(childId);
        this.calculateNodeOrder(child);
      }
      const planningIds = node.availablePlanningNodes;
      if (planningIds) {
        for (let planningId of planningIds) {
          const child = this.getNodeById(planningId.nodeId);
          this.calculateNodeOrder(child);
        }
      }
    }
  };
}

ClassroomMonitorProjectService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$q',
  '$rootScope',
  'ConfigService',
  'UtilService'
];

export default ClassroomMonitorProjectService;
