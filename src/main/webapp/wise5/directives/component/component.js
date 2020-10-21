class ComponentController {

    constructor($scope, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService) {
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
    }

    $onInit() {
        if (this.mode) {
            this.$scope.mode = this.mode;
        } else {
            this.$scope.mode = 'student';
        }

        if (this.workgroupId != null) {
            try {
                this.workgroupId = parseInt(this.workgroupId);
            } catch(e) {

            }
        }

        if (this.teacherWorkgroupId) {
            try {
                this.teacherWorkgroupId = parseInt(this.teacherWorkgroupId);
            } catch(e) {

            }
        }

        if (this.componentState == null || this.componentState === '') {
            this.componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        } else {
            this.componentState = angular.fromJson(this.componentState);
            this.nodeId = this.componentState.nodeId;
            this.componentId = this.componentState.componentId;
        }

        let componentContent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
        componentContent = this.ProjectService.injectAssetPaths(componentContent);
        componentContent = this.ConfigService.replaceStudentNames(componentContent);
        if (this.NotebookService.isNotebookEnabled() && this.NotebookService.isStudentNoteClippingEnabled()) {
            componentContent = this.ProjectService.injectClickToSnipImage(componentContent);
        }

        this.$scope.componentTemplatePath = this.NodeService.getComponentTemplatePath(componentContent.type);
        this.$scope.componentContent = componentContent;
        this.$scope.componentState = this.componentState;
        this.$scope.nodeId = this.nodeId;
        this.$scope.workgroupId = this.workgroupId;
        this.$scope.teacherWorkgroupId = this.teacherWorkgroupId;
        this.$scope.type = componentContent.type;
        this.$scope.nodeController = this.$scope.$parent.nodeController;
    }
}
ComponentController.$inject = ['$scope', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentDataService'];

const Component = {
    bindings: {
        componentId: '@',
        componentState: '@',
        mode: '@',
        nodeId: '@',
        teacherWorkgroupId: '@',
        workgroupId: '@'
    },
    scope: true,
    controller: ComponentController,
    template:
        `<div class="component__wrapper">
          <div ng-include="::componentTemplatePath" class="component__content component__content--{{::type}}"></div>
        </div>`
};

export default Component;
