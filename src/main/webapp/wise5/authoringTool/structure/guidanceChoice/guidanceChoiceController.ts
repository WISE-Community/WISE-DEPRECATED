'use strict';

import ConfigureStructureController from '../configureStructureController';

class GuidanceChoiceController extends ConfigureStructureController {
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
    this.groupsPath = `guidanceChoice/groups.json`;
    this.nodesPath = `guidanceChoice/nodes.json`;
  }
}

export default GuidanceChoiceController;
