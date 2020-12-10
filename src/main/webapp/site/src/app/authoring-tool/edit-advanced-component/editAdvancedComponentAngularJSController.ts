import { TeacherProjectService } from "../../../../../wise5/services/teacherProjectService";

export class EditAdvancedComponentAngularJSController {

  authoringComponentContent: any;
  componentId: string;
  nodeId: string;

  static $inject = ['ProjectService'];

  constructor(protected ProjectService: TeacherProjectService) {
  }

  $onInit() {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId, this.componentId);
  }
}
