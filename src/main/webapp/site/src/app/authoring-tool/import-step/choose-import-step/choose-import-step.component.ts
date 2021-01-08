import { Component } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { ConfigService } from '../../../../../../wise5/services/configService';
import { TeacherProjectService } from '../../../../../../wise5/services/teacherProjectService';

@Component({
  styleUrls: ['choose-import-step.component.scss'],
  templateUrl: 'choose-import-step.component.html'
})
export class ChooseImportStepComponent {
  $state: any;
  importLibraryProjectId: number;
  importMyProjectId: number;
  importProject: any;
  importProjectId: number;
  importProjectIdToOrder: any;
  importProjectItems: any[];
  libraryProjectsList: any[];
  myProjectsList: any[];

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService
  ) {
    this.$state = this.upgrade.$injector.get('$state');
  }

  ngOnInit() {
    this.myProjectsList = this.ConfigService.getAuthorableProjects();
    this.ProjectService.getLibraryProjects().then((libraryProjects) => {
      this.libraryProjectsList = this.ProjectService.sortAndFilterUniqueLibraryProjects(
        libraryProjects
      );
    });
  }

  showMyProject() {
    this.importLibraryProjectId = null;
    this.showProject(this.importMyProjectId);
  }

  showLibraryProject() {
    this.importMyProjectId = null;
    this.showProject(this.importLibraryProjectId);
  }

  showProject(importProjectId) {
    this.importProjectId = importProjectId;
    this.ProjectService.retrieveProjectById(this.importProjectId).then((projectJSON) => {
      this.importProject = projectJSON;
      const nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.importProject);
      this.importProjectIdToOrder = Object.values(nodeOrderOfProject.idToOrder);
      this.importProjectItems = nodeOrderOfProject.nodes;
    });
  }

  previewImportNode(node) {
    window.open(`${this.importProject.previewProjectURL}/${node.id}`);
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}`);
  }

  importSteps() {
    this.$state.go('root.at.project.import-step.choose-location', {
      importFromProjectId: this.importProjectId,
      selectedNodes: this.getSelectedNodesToImport()
    });
  }

  getSelectedNodesToImport() {
    const selectedNodes = [];
    if (this.importProjectItems != null) {
      for (const item of this.importProjectItems) {
        if (item.checked) {
          selectedNodes.push(item.node);
        }
      }
    }
    return selectedNodes;
  }

  cancel() {
    this.$state.go('root.at.project');
  }
}
