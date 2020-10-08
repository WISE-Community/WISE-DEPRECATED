import { TeacherDataService } from "../../../../services/teacherDataService";
import { TeacherProjectService } from "../../../../services/teacherProjectService";
import * as angular from 'angular';
import { NotificationService } from "../../../../services/notificationService";

class NodeAdvancedJsonAuthoringController {

  nodeContentJSONString: string;
  node: any;
  nodeId: string;

  constructor(private NotificationService: NotificationService,
      private ProjectService: TeacherProjectService,
      private TeacherDataService: TeacherDataService) {
  }

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.nodeContentJSONString = angular.toJson(this.node, 4);
    this.NotificationService.showJSONValidMessage();
  }

  autoSaveJSON() {
    try {
      const updatedNode = angular.fromJson(this.nodeContentJSONString);
      this.node = updatedNode;
      this.ProjectService.setNode(this.nodeId, updatedNode);
      this.ProjectService.saveProject().then(() => {
        this.ProjectService.refreshProject();
      });
      this.NotificationService.showJSONValidMessage();
    } catch (e) {
      this.NotificationService.showJSONInvalidMessage();
    }
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }
}

export const NodeAdvancedJsonAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/json/node-advanced-json-authoring.component.html`,
  controller: NodeAdvancedJsonAuthoringController
}
