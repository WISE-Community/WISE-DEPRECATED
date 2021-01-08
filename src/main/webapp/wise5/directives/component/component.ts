import { ConfigService } from '../../services/configService';
import { NodeService } from '../../services/nodeService';
import { NotebookService } from '../../services/notebookService';
import { ProjectService } from '../../services/projectService';
import { StudentDataService } from '../../services/studentDataService';
import * as angular from 'angular';

class ComponentController {
  componentId: string;
  componentState: any;
  mode: string;
  nodeId: string;
  teacherWorkgroupId: number;
  workgroupId: number;

  static $inject = [
    '$scope',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'ProjectService',
    'StudentDataService'
  ];

  constructor(
    private $scope: any,
    private ConfigService: ConfigService,
    private NodeService: NodeService,
    private NotebookService: NotebookService,
    private ProjectService: ProjectService,
    private StudentDataService: StudentDataService
  ) {}

  $onInit() {
    this.$scope.mode = this.mode;

    if (this.componentState == null || this.componentState === '') {
      this.componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        this.nodeId,
        this.componentId
      );
    } else {
      this.componentState = angular.fromJson(this.componentState);
      this.nodeId = this.componentState.nodeId;
      this.componentId = this.componentState.componentId;
    }

    let componentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
    componentContent = this.ProjectService.injectAssetPaths(componentContent);
    componentContent = this.ConfigService.replaceStudentNames(componentContent);
    if (
      this.NotebookService.isNotebookEnabled() &&
      this.NotebookService.isStudentNoteClippingEnabled()
    ) {
      componentContent = this.ProjectService.injectClickToSnipImage(componentContent);
    }

    this.$scope.componentTemplatePath = this.NodeService.getComponentTemplatePath(
      componentContent.type
    );
    this.$scope.componentContent = componentContent;
    this.$scope.componentState = this.componentState;
    this.$scope.nodeId = this.nodeId;
    this.$scope.workgroupId = this.workgroupId;
    this.$scope.teacherWorkgroupId = this.teacherWorkgroupId;
    this.$scope.type = componentContent.type;
    this.$scope.nodeController = this.$scope.$parent.nodeController;
  }
}

const Component = {
  bindings: {
    componentId: '@',
    componentState: '@',
    mode: '@',
    nodeId: '@',
    teacherWorkgroupId: '<',
    workgroupId: '<'
  },
  scope: true,
  controller: ComponentController,
  template: `<div class="component__wrapper">
          <div ng-include="::componentTemplatePath" class="component__content component__content--{{::type}}"></div>
        </div>`
};

export default Component;
