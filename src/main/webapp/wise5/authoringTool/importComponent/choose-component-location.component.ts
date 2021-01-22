import { ConfigService } from '../../services/configService';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { TeacherDataService } from '../../services/teacherDataService';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { UtilService } from '../../services/utilService';

class ChooseComponentLocationController {
  components: any = [];
  nodeId: string;

  static $inject = [
    '$state',
    '$stateParams',
    'ConfigService',
    'ProjectAssetService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    private $state: any,
    private $stateParams: any,
    private ConfigService: ConfigService,
    private ProjectAssetService: ProjectAssetService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {}

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
  }

  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  insertComponentAsFirst() {
    this.importComponentAfter(null);
  }

  importComponentAfter(insertAfterComponentId: string) {
    this.importComponents(this.nodeId, insertAfterComponentId).then((newComponents) => {
      this.ProjectService.saveProject();
      // refresh the project assets in case any of the imported components also imported assets
      this.ProjectAssetService.retrieveProjectAssets();
      this.$state.go('root.at.project.node', {
        projectId: this.ConfigService.getProjectId(),
        nodeId: this.nodeId,
        newComponents: newComponents
      });
    });
  }

  importComponents(nodeId: string, insertAfterComponentId: string) {
    return this.ProjectService.importComponents(
      this.$stateParams.selectedComponents,
      this.$stateParams.importFromProjectId,
      nodeId,
      insertAfterComponentId
    ).then((newComponents) => {
      this.saveImportedComponentsEvent(newComponents);
      return newComponents;
    });
  }

  saveImportedComponentsEvent(newComponents: any) {
    const importedComponents = this.getImportedComponents();
    for (let c = 0; c < importedComponents.length; c++) {
      importedComponents[c].toComponentId = newComponents[c].id;
    }
    this.TeacherDataService.saveEvent(
      'AuthoringTool',
      this.nodeId,
      null,
      null,
      'Authoring',
      'componentImported',
      { componentsImported: importedComponents }
    );
  }

  getImportedComponents() {
    const importedComponents = [];
    for (const component of this.$stateParams.selectedComponents) {
      const importedComponent = {
        fromProjectId: this.$stateParams.importFromProjectId,
        fromComponentId: component.id,
        type: component.type
      };
      importedComponents.push(importedComponent);
    }
    return importedComponents;
  }

  cancel() {
    this.$state.go('root.at.project.node', {
      projectId: this.ConfigService.getProjectId(),
      nodeId: this.TeacherDataService.getCurrentNodeId()
    });
  }
}

export const ChooseComponentLocation = {
  templateUrl: `/wise5/authoringTool/importComponent/choose-component-location.component.html`,
  controller: ChooseComponentLocationController
};
