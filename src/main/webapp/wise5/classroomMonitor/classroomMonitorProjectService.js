'use strict';
import ProjectService from '../services/projectService';

class ClassroomMonitorProjectService extends ProjectService {
  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    super($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService);
  }
  
  /**
   * Get the node ids and component ids in a node
   * @param nodeId get the node ids and component ids in this node
   * @returns an array of objects. each object contains a node id and component id.
   */
  getNodeIdsAndComponentIds(nodeId) {
    const nodeIdAndComponentIds = [];
    const nodeContent = this.getNodeContentByNodeId(nodeId);
    for (const component of nodeContent.components) {
      const nodeIdAndComponentId = {
        nodeId: nodeId,
        componentId: component.id
      };
      nodeIdAndComponentIds.push(nodeIdAndComponentId);
    }
    return nodeIdAndComponentIds;
  }

  /**
   * Get the branch letter in the node position string if the node is in a branch path
   * @param nodeId the node id we want the branch letter for
   * @return the branch letter in the node position if the node is in a branch path
   */
  getBranchLetter(nodeId) {
    const nodePosition = this.getNodePositionById(nodeId);
    const branchLetterRegex = /.*([A-Z])/;
    const match = branchLetterRegex.exec(nodePosition);
    if (match != null) {
      return match[1];
    }
    return null;
  }
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
