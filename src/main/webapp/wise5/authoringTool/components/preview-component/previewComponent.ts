import { NodeService } from '../../../services/nodeService';
import { ProjectService } from '../../../services/projectService';

class PreviewComponentController {
  componentContent: any;
  componentId: string;
  nodeId: string;

  static $inject = ['$scope', '$compile', '$element', 'NodeService', 'ProjectService'];

  constructor(
    private $scope: any,
    private $compile: any,
    private $element: any,
    private NodeService: NodeService,
    private ProjectService: ProjectService
  ) {}

  $onInit() {
    this.$scope.mode = 'authoringComponentPreview';
    this.$scope.componentTemplatePath = this.NodeService.getComponentTemplatePath(
      this.componentContent.type
    );
    this.$scope.nodeId = this.nodeId;
    this.$scope.type = this.componentContent.type;
    this.$scope.$watch(
      () => {
        return this.componentContent;
      },
      () => {
        this.$scope.componentContent = this.ProjectService.injectAssetPaths(this.componentContent);
        this.compileComponent();
      },
      true
    );
  }

  compileComponent() {
    const componentHTML = `<div class="component__wrapper">
          <div ng-include="::componentTemplatePath" class="component__content component__content--{{::type}}"></div>
        </div>`;
    this.$element.html(componentHTML);
    this.$compile(this.$element.contents())(this.$scope);
  }
}

const PreviewComponent = {
  bindings: {
    componentContent: '<',
    componentId: '@',
    nodeId: '@'
  },
  scope: true,
  controller: PreviewComponentController
};

export default PreviewComponent;
