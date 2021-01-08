import ConfigureStructureController from '../configureStructureController';

export default class AutomatedAssessmentConfigureController extends ConfigureStructureController {
  node: any;
  importFromProjectId: number;

  static $inject = [
    '$filter',
    '$http',
    '$rootScope',
    '$state',
    '$stateParams',
    '$scope',
    'UtilService',
    'ProjectService'
  ];

  constructor(
    $filter,
    $http,
    $rootScope,
    $state,
    $stateParams,
    $scope,
    UtilService,
    ProjectService
  ) {
    super($filter, $http, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  $onInit() {
    this.node = this.$stateParams.node;
    this.importFromProjectId = this.$stateParams.importFromProjectId;
  }

  back() {
    window.history.back();
  }

  next() {
    this.$state.go('root.at.project.import-step.choose-location', {
      importFromProjectId: this.importFromProjectId,
      selectedNodes: [this.node]
    });
  }
}
