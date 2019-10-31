
class ComponentController {
    constructor($injector, $scope, $compile, $element, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService, UtilService) {
        this.$injector = $injector;
        this.$scope = $scope;
        this.$element = $element;
        this.$compile = $compile;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
    }

    $onInit() {
        if (this.mode) {
            this.$scope.mode = this.mode;
        } else {
            this.$scope.mode = 'student';
        }

        /**
         * Snip an image from the VLE
         * @param $event the click event from the student clicking on the image
         */
        this.$scope.$on('snipImage', (event, $eventArgs) => {
            // get the target that was clicked
            var imageElement = $eventArgs.target;

            if (imageElement != null) {

                // create an image object
                var imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);

                if (imageObject != null) {

                    // create a notebook item with the image populated into it
                    this.NotebookService.addNote($eventArgs, imageObject);
                }
            }
        });

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

        var authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
        var componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

        // replace any student names in the component content
        componentContent = this.ConfigService.replaceStudentNames(componentContent);

        if (this.NotebookService.isNotebookEnabled() && this.NotebookService.isStudentNoteClippingEnabled()) {
            // inject the click attribute that will snip the image when the image is clicked
            componentContent = this.ProjectService.injectClickToSnipImage(componentContent);
        }

        if (this.$scope.mode === 'authoring') {
            this.$scope.authoringComponentContent = authoringComponentContent;
            this.$scope.nodeAuthoringController = this.$scope.$parent.nodeAuthoringController;
            this.$scope.componentTemplatePath = this.NodeService.getComponentAuthoringTemplatePath(componentContent.type);
        } else {
            this.$scope.componentTemplatePath = this.NodeService.getComponentTemplatePath(componentContent.type);
        }

        this.$scope.componentContent = componentContent;
        this.$scope.componentState = this.componentState;
        this.$scope.nodeId = this.nodeId;
        this.$scope.workgroupId = this.workgroupId;
        this.$scope.teacherWorkgroupId = this.teacherWorkgroupId;
        this.$scope.type = componentContent.type;
        this.$scope.nodeController = this.$scope.$parent.nodeController;

        var componentHTML =
            `<div class="component__wrapper">
                <div ng-include="::componentTemplatePath" class="component__content component__content--{{::type}}"></div>
            </div>`;

        if (componentHTML != null) {
            this.$element.html(componentHTML);
            this.$compile(this.$element.contents())(this.$scope);
        }
    }
}

ComponentController.$inject = ['$injector', '$scope', '$compile', '$element', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentDataService', 'UtilService'];

const Component = {
    bindings: {
        componentContent: '@',
        componentId: '@',
        componentState: '@',
        mode: '@',
        nodeId: '@',
        teacherWorkgroupId: '@',
        workgroupId: '@'
    },
    scope: true,
    controller: ComponentController
};

export default Component;
