import { TeacherProjectService } from '../../services/teacherProjectService';
import { ConfigService } from '../../services/configService';
import { TeacherDataService } from '../../services/teacherDataService';

class ChooseComponentController {
  importLibraryProjectId: number;
  importMyProjectId: number;
  importProject: any = null;
  importProjectId: number;
  importProjectIdToOrder: any;
  importProjectItems: any = [];
  libraryProjectsList: any = [];
  myProjectsList: any = [];

  static $inject = ['$state', 'ConfigService', 'ProjectService', 'TeacherDataService'];

  constructor(
    private $state: any,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {}

  $onInit() {
    this.importProjectIdToOrder = {};
    this.importProjectItems = [];
    this.importMyProjectId = null;
    this.importLibraryProjectId = null;
    this.importProjectId = null;
    this.importProject = null;
    this.myProjectsList = this.ConfigService.getAuthorableProjects();
    this.ProjectService.getLibraryProjects().then((libraryProjects) => {
      this.libraryProjectsList = this.ProjectService.sortAndFilterUniqueLibraryProjects(
        libraryProjects
      );
    });
  }

  showMyImportProject(importProjectId) {
    this.importLibraryProjectId = null;
    this.showImportProject(importProjectId);
  }

  showLibraryImportProject(importProjectId) {
    this.importMyProjectId = null;
    this.showImportProject(importProjectId);
  }

  showImportProject(importProjectId) {
    this.importProjectId = importProjectId;
    this.ProjectService.retrieveProjectById(this.importProjectId).then((projectJSON) => {
      this.importProjectIdToOrder = {};
      this.importProject = projectJSON;
      const result = this.ProjectService.getNodeOrderOfProject(this.importProject);
      this.importProjectIdToOrder = result.idToOrder;
      this.importProjectItems = result.nodes.filter((nodeOrder) => {
        return nodeOrder.node.type !== 'group';
      });
    });
  }

  importComponents() {
    const selectedComponents = this.getSelectedComponentsToImport();
    if (selectedComponents.length === 0) {
      alert('Please select a component to import.');
    } else {
      this.$state.go('root.at.project.node.import-component.choose-location', {
        importFromProjectId: this.importProjectId,
        selectedComponents: selectedComponents
      });
    }
  }

  getSelectedComponentsToImport() {
    const selectedComponents = [];
    for (const item of this.importProjectItems) {
      for (const component of item.node.components) {
        if (component.checked) {
          delete component.checked;
          selectedComponents.push(component);
        }
      }
    }
    return selectedComponents;
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}`);
  }

  previewImportNode(node) {
    window.open(`${this.importProject.previewProjectURL}/${node.id}`);
  }

  cancel() {
    this.$state.go('root.at.project.node', {
      projectId: this.ConfigService.getProjectId(),
      nodeId: this.TeacherDataService.getCurrentNodeId()
    });
  }
}

export const ChooseComponent = {
  templateUrl: `/wise5/authoringTool/importComponent/choose-component.component.html`,
  controller: ChooseComponentController
};
