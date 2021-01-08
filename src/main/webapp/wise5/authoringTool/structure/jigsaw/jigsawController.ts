'use strict';

import ConfigureStructureController from '../configureStructureController';

class JigsawController extends ConfigureStructureController {
  numGroups: string = '2';
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
  }

  $onInit() {
    this.$scope.$watch(
      () => {
        return this.numGroups;
      },
      (numGroups) => {
        this.injectGroupAndNodes(numGroups);
      }
    );
  }

  fetchGroups(numGroups: string) {
    super.fetchGroups(`jigsaw/groups-${numGroups}.json`);
  }

  fetchNodes(numGroups: string) {
    super.fetchNodes(`jigsaw/nodes-${numGroups}.json`);
  }

  injectGroupAndNodes(numGroups: string = '2') {
    this.fetchGroups(numGroups);
    this.fetchNodes(numGroups);
  }

  chooseLocation() {
    this.$state.go('root.at.project.structure.location', { structure: this.structure });
  }
}

export default JigsawController;
