'use strict';

import ConfigureStructureController from '../configureStructureController';

class SelfDirectedInvestigationController extends ConfigureStructureController {
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
    this.groupsPath = `selfDirectedInvestigation/groups.json`;
    this.nodesPath = `selfDirectedInvestigation/nodes.json`;
  }
}

export default SelfDirectedInvestigationController;
