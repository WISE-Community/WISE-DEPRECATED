import { ConfigService } from "../../../services/configService";
import { NodeService } from "../../../services/nodeService";
import { TeacherProjectService } from "../../../services/teacherProjectService";

class EditComponentController {

  componentId: string;
  nodeId: string;

  static $inject = ['$scope', 'ConfigService', 'NodeService', 'ProjectService'];

  constructor(private $scope: any, private ConfigService: ConfigService,
      private NodeService: NodeService, private ProjectService: TeacherProjectService) {
  }

  $onInit() {
    this.$scope.mode = 'authoring';
    const authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
    const componentContent = this.ConfigService.replaceStudentNames(
        this.ProjectService.injectAssetPaths(authoringComponentContent));
    this.$scope.authoringComponentContent = authoringComponentContent;
    this.$scope.nodeAuthoringController = this.$scope.$parent.nodeAuthoringController;
    this.$scope.componentTemplatePath = this.NodeService.getComponentAuthoringTemplatePath(componentContent.type);
    this.$scope.componentContent = componentContent;
    this.$scope.nodeId = this.nodeId;
    this.$scope.type = componentContent.type;
  }
}

const EditComponent = {
  bindings: {
    componentId: '@',
    nodeId: '@'
  },
  scope: true,
  controller: EditComponentController,
  template:
      `<div class="component__wrapper">
        <div ng-include="::componentTemplatePath" class="component__content component__content--{{::type}}"></div>
      </div>`
};

export default EditComponent;
