import { UtilService } from "../../../../../../wise5/services/utilService";
import { ProjectService } from "../../../../../../wise5/services/projectService";
import { TeacherDataService } from "../../../../../../wise5/services/teacherDataService";
import { ConfigService } from "../../../../../../wise5/services/configService";
import { Component } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";

@Component({
  selector: 'choose-new-component-location',
  templateUrl: 'choose-new-component-location.component.html'
})
export class ChooseNewComponentLocation {

  components: any;
  nodeId: string;

  constructor(private upgrade: UpgradeModule, private ConfigService: ConfigService,
     private ProjectService: ProjectService, private TeacherDataService: TeacherDataService,
     private UtilService: UtilService) {
  }

  ngOnInit() {
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
        this.upgrade.$injector.get('$stateParams').componentType, insertAfterComponentId);
    this.ProjectService.saveProject().then(() => {
      this.saveAddComponentEvent(newComponent);
      this.upgrade.$injector.get('$state').go('root.at.project.node',
          { projectId: this.ConfigService.getProjectId(),
          nodeId: this.nodeId, newComponents: [newComponent]})
    });
  }

  saveAddComponentEvent(newComponent: any) {
    this.TeacherDataService.saveEvent('AuthoringTool', this.nodeId, null, null, 'Authoring',
        'componentCreated', { componentId: newComponent.id, componentType: newComponent.type });
  }

  goToChooseNewComponent() {
    this.upgrade.$injector.get('$state').go('root.at.project.node.add-component.choose-component',
        this.upgrade.$injector.get('$stateParams'));
  }

  cancel() {
    this.upgrade.$injector.get('$state').go('root.at.project.node',
        { projectId: this.ConfigService.getProjectId(), nodeId: this.nodeId });
  }
}
