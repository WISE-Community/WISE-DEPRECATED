'use strict';

import ConfigureStructureController from '../configureStructureController';

class PeerReviewAndRevisionController extends ConfigureStructureController {
  static $inject = [
    '$filter',
    '$http',
    '$rootScope',
    '$state',
    '$stateParams',
    '$scope',
    'UtilService'
  ];

  constructor($filter, $http, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $http, $rootScope, $state, $stateParams, $scope, UtilService);
    this.groupsPath = `peerReviewAndRevision/groups.json`;
    this.nodesPath = `peerReviewAndRevision/nodes.json`;
  }
}

export default PeerReviewAndRevisionController;
