'use strict';

import { AuthoringToolProjectService } from '../authoringToolProjectService';
import { ConfigService } from '../../services/configService';

class ChooseStepController {
  $translate: any;
  importLibraryProjectId: number;
  importMyProjectId: number;
  importProject: any;
  importProjectId: number;
  importProjectIdToOrder: any;
  importProjectItems: any[];
  libraryProjectsList: any[];
  myProjectsList: any[];
  projectId: number;

  static $inject = ['$filter', '$state', '$stateParams', 'ConfigService', 'ProjectService'];

  constructor(
    $filter: any,
    private $state: any,
    $stateParams: any,
    private ConfigService: ConfigService,
    private ProjectService: AuthoringToolProjectService
  ) {
    this.$state = $state;
    this.$translate = $filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.projectId = $stateParams.projectId;
  }

  $onInit() {
    this.myProjectsList = this.ConfigService.getAuthorableProjects();
    this.ProjectService.getLibraryProjects().then(libraryProjects => {
      this.libraryProjectsList = this.ProjectService.sortAndFilterUniqueLibraryProjects(
        libraryProjects
      );
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
      `${this.importProject.previewProjectURL}/${node.id}`
    );
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}`);
  }

  importSteps() {
    const selectedNodes = this.getSelectedNodesToImport();
    if (selectedNodes.length === 0) {
      alert(this.$translate('selectAStepToImport'));
    } else {
      this.$state.go('root.at.project.import-step.choose-location', {
        importFromProjectId: this.importProjectId,
        selectedNodes: selectedNodes
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
    this.$state.go('root.at.project');
  }
}

export default ChooseStepController;
