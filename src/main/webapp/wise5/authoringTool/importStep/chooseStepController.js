'use strict';

class ChooseStepController {
  constructor(
    $filter,
    $mdDialog,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    ConfigService,
    ProjectService,
    UtilService
  ) {
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$translate = $filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.projectId = $stateParams.projectId;
  }

  $onInit() {
    this.myProjectsList = this.ConfigService.getAuthorableProjects();
    this.ProjectService.getLibraryProjects().then(libraryProjects => {
      this.libraryProjectsList =
        this.ProjectService.sortAndFilterUniqueLibraryProjects(libraryProjects);
    });
  }

  showMyImportProject() {
    this.importLibraryProjectId = null;
    this.showImportProject(this.importMyProjectId);
  }

  showLibraryImportProject() {
    this.importMyProjectId = null;
    this.showImportProject(this.importLibraryProjectId);
  }

  showImportProject(importProjectId) {
    this.importProjectId = importProjectId;
    this.ProjectService.retrieveProjectById(this.importProjectId).then(projectJSON => {
      this.importProject = projectJSON;
      const nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.importProject);
      this.importProjectIdToOrder = nodeOrderOfProject.idToOrder;
      this.importProjectItems = nodeOrderOfProject.nodes;
    });
  }

  previewImportNode(node) {
    window.open(
      `${this.importProject.previewProjectURL}#!/project/${this.importProjectId}/${node.id}`
    );
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}#!/project/${this.importProjectId}`);
  }

  importSteps() {
    const selectedNodes = this.getSelectedNodesToImport();
    if (selectedNodes.length === 0) {
      alert(this.$translate('selectAStepToImport'));
    } else {
      this.$state.go('root.project.import-step.choose-location', {
        importFromProjectId: this.importProjectId,
        selectedNodes: selectedNodes,
      });
    }
  }

  getSelectedNodesToImport() {
    const selectedNodes = [];
    for (const item of this.importProjectItems) {
      if (item.checked) {
        selectedNodes.push(item.node);
      }
    }
    return selectedNodes;
  }

  goBack() {
    this.$state.go('root.project');
  }
}

ChooseStepController.$inject = [
  '$filter',
  '$mdDialog',
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  'ConfigService',
  'ProjectService',
  'UtilService'
];

export default ChooseStepController;
