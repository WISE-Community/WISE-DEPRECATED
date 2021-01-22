'use strict';

import ConfigureStructureController from '../configureStructureController';

class KICycleUSINGOERController extends ConfigureStructureController {
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
    this.groupsPath = `kiCycleUsingOER/groups.json`;
    this.nodesPath = `kiCycleUsingOER/nodes.json`;
  }
}

export default KICycleUSINGOERController;
