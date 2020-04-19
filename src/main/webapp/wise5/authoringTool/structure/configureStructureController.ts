'use strict';

import UtilService from '../../services/utilService';

abstract class ConfigureStructureController {
  $translate: any;
  structure: any;

  static $inject = ['$filter', '$rootScope', '$state', '$stateParams', '$scope', 'UtilService'];

  constructor(
    protected $filter: any,
    protected $rootScope: any,
    protected $state: any,
    protected $stateParams: any,
    protected $scope: any,
    protected UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
    this.structure = {};
  }

  $onInit() {
    this.injectGroupAndNodes();
  }

  injectGroupAndNodes() {
    this.injectGroup();
    this.injectNodes();
  }

  abstract injectGroup();

  abstract injectNodes();

  chooseLocation() {
    this.$state.go('root.project.structure.location', { structure: this.structure });
  }

  goToChooseStructure() {
    this.$state.go('root.project.structure.choose');
  }

  cancel() {
    this.$state.go('root.project');
  }
}

export default ConfigureStructureController;
