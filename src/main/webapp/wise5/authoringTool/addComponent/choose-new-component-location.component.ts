import { UtilService } from "../../services/utilService";
import { ProjectService } from "../../services/projectService";
import { TeacherDataService } from "../../services/teacherDataService";
import { ConfigService } from "../../services/configService";

class ChooseNewComponentLocationController {

  components: any;
  nodeId: string;

  static $inject = ['$state', '$stateParams', 'ConfigService', 'ProjectService',
      'TeacherDataService', 'UtilService'];

  constructor(private $state: any, private $stateParams: any, private ConfigService: ConfigService,
     private ProjectService: ProjectService, private TeacherDataService: TeacherDataService,
     private UtilService: UtilService) {
  }

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
  }

  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  insertComponentAsFirst() {
    this.insertComponentAfter(null);
  }

  insertComponentAfter(insertAfterComponentId = null) {
    const newComponent = this.ProjectService.createComponent(this.nodeId,
        this.$stateParams.componentType, insertAfterComponentId);
    this.ProjectService.saveProject().then(() => {
      this.saveAddComponentEvent(newComponent);
      this.$state.go('root.at.project.node', { projectId: this.ConfigService.getProjectId(),
        nodeId: this.nodeId, newComponents: [newComponent]})
    });
  }

  saveAddComponentEvent(newComponent: any) {
    this.TeacherDataService.saveEvent('AuthoringTool', this.nodeId, null, null, 'Authoring',
        'componentCreated', { componentId: newComponent.id, componentType: newComponent.type });
  }

  goToChooseNewComponent() {
    this.$state.go('root.at.project.node.add-component.choose-component', this.$stateParams);
  }

  cancel() {
    this.$state.go('root.at.project.node', { projectId: this.ConfigService.getProjectId(),
        nodeId: this.nodeId });
  }
}

export const ChooseNewComponentLocation = {
  templateUrl: `/wise5/authoringTool/addComponent/choose-new-component-location.component.html`,
  controller: ChooseNewComponentLocationController
}
