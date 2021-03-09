import { NodeService } from '../../../services/nodeService';
import { ProjectService } from '../../../services/projectService';

class PreviewComponentController {
  componentContent: any;
  componentId: string;
  isDirty: boolean;
  nodeId: string;
  updateInterval: any;

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
    this.compileComponent();
    this.$scope.$watch(
      () => {
        return this.componentContent;
      },
      () => {
        this.isDirty = true;
      },
      true
    );
    this.updateInterval = setInterval(() => {
      if (this.isDirty) {
        this.compileComponent();
        this.isDirty = false;
      }
    }, 3000);
  }

  $onDestroy() {
    clearInterval(this.updateInterval);
  }

  compileComponent() {
    this.$scope.componentContent = this.ProjectService.injectAssetPaths(this.componentContent);
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
