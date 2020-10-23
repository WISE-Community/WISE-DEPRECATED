import { NodeService } from "../../../services/nodeService";

class PreviewComponentController {

  componentContent: any;
  componentId: string;
  nodeId: string;

  static $inject = ['$scope', '$compile', '$element', 'NodeService'];

  constructor(private $scope: any, private $compile: any, private $element: any,
      private NodeService: NodeService) {
  }

  $onInit() {
    this.$scope.mode = 'authoringComponentPreview';
    this.$scope.componentContent = this.componentContent;
    this.$scope.componentTemplatePath =
        this.NodeService.getComponentTemplatePath(this.componentContent.type);
    this.$scope.nodeId = this.nodeId;
    this.$scope.type = this.componentContent.type;
    this.$scope.$watch(
       () => { return this.componentContent; },
       () => {
          this.$scope.componentContent = this.componentContent;
          this.compileComponent();
       });
  }

  compileComponent() {
    const componentHTML =
        `<div class="component__wrapper">
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
