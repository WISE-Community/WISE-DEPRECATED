'use strict';

import { UtilService } from '../../services/utilService';

abstract class ConfigureStructureController {
  $translate: any;
  structure: any;
  structureDir: string = 'wise5/authoringTool/structure';
  groupsPath: string;
  nodesPath: string;

  static $inject = [
    '$filter',
    '$http',
    '$rootScope',
    '$state',
    '$stateParams',
    '$scope',
    'UtilService'
  ];

  constructor(
    protected $filter: any,
    protected $http: any,
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

  injectGroup() {
    this.fetchGroups();
  }

  injectNodes() {
    this.fetchNodes();
  }

  fetchGroups(groupsPath: string = this.groupsPath) {
    this.$http.get(`${this.structureDir}/${groupsPath}`).then(({ data: group }) => {
      this.structure.group = group;
    });
  }

  fetchNodes(nodesPath: string = this.nodesPath) {
    this.$http.get(`${this.structureDir}/${nodesPath}`).then(({ data: nodes }) => {
      this.structure.nodes = nodes;
    });
  }

  chooseLocation() {
    this.$state.go('root.at.project.structure.location', { structure: this.structure });
  }

  goToChooseStructure() {
    this.$state.go('root.at.project.structure.choose');
  }

  cancel() {
    this.$state.go('root.at.project');
  }
}

export default ConfigureStructureController;
