'use strict';

class ConfigureStructureController {
  constructor($rootScope, $state, $stateParams, $scope) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.structure = $stateParams.structure;
  }

  chooseLocation() {
    this.$state.go('root.project.structure.location', { structure: this.structure });
  }

  cancel() {
    this.$state.go('root.project');
  }
}

ConfigureStructureController.$inject = ['$rootScope', '$state', '$stateParams', '$scope'];

export default ConfigureStructureController;
