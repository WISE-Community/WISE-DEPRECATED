'use strict';
import AuthoringToolProjectService from '../authoringTool/authoringToolProjectService';

class ClassroomMonitorProjectService extends AuthoringToolProjectService {
  static $inject = [
    '$filter',
    '$http',
    '$injector',
    '$q',
    '$rootScope',
    'ConfigService',
    'UtilService'
  ];

  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    super($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService);
  }

  getNodeIdsAndComponentIds(nodeId) {
    const nodeIdAndComponentIds = [];
    const node = this.getNodeById(nodeId);
    for (const component of node.components) {
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

export default ClassroomMonitorProjectService;
