"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentController = function ComponentController($injector, $scope, $compile, $element, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, ComponentController);

    this.$injector = $injector;
    this.$compile = $compile;
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;

    if (this.mode) {
        $scope.mode = this.mode;
    } else {
        $scope.mode = "student";
    }

    /**
     * Snip an image from the VLE
     * @param $event the click event from the student clicking on the image
     */
    $scope.$on("snipImage", function (event, $eventArgs) {
        // get the target that was clicked
        var imageElement = $eventArgs.target;

        if (imageElement != null) {

            // create an image object
            var imageObject = _this.UtilService.getImageObjectFromImageElement(imageElement);

            if (imageObject != null) {

                // create a notebook item with the image populated into it
                _this.NotebookService.addNote($eventArgs, imageObject);
            }
        }
    });

    if (this.workgroupId != null) {
        try {
            this.workgroupId = parseInt(this.workgroupId);
        } catch (e) {}
    }

    if (this.teacherWorkgroupId) {
        try {
            this.teacherWorkgroupId = parseInt(this.teacherWorkgroupId);
        } catch (e) {}
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

    if (this.NotebookService.isNotebookEnabled()) {
        // inject the click attribute that will snip the image when the image is clicked
        componentContent = this.ProjectService.injectClickToSnipImage(componentContent);
    }

    if ($scope.mode === 'authoring') {
        $scope.authoringComponentContent = authoringComponentContent;
        $scope.authoringComponentContentJSONString = angular.toJson($scope.authoringComponentContent, 4);
        $scope.nodeAuthoringController = $scope.$parent.nodeAuthoringController;
    }

    if ($scope.mode === 'authoring' && (componentContent.type == 'Animation' || componentContent.type == 'ConceptMap' || componentContent.type == 'Discussion' || componentContent.type == 'HTML')) {
        $scope.componentTemplatePath = this.NodeService.getComponentAuthoringTemplatePath(componentContent.type);
    } else {
        $scope.componentTemplatePath = this.NodeService.getComponentTemplatePath(componentContent.type);
    }

    $scope.componentContent = componentContent;
    $scope.componentState = this.componentState;
    $scope.nodeId = this.nodeId;
    $scope.workgroupId = this.workgroupId;
    $scope.teacherWorkgroupId = this.teacherWorkgroupId;
    $scope.type = componentContent.type;
    $scope.nodeController = $scope.$parent.nodeController;

    if (this.originalNodeId != null && this.originalComponentId != null) {
        /*
         * set the original node id and component id. this is used
         * when we are showing previous work from another component.
         */
        $scope.originalNodeId = this.originalNodeId;
        $scope.originalComponentId = this.originalComponentId;

        // get the original component
        var originalComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(this.originalNodeId, this.originalComponentId);
        $scope.originalComponentContent = originalComponentContent;
    }

    var componentHTML = "<div class=\"component__wrapper\">\n                <div ng-include=\"componentTemplatePath\" class=\"component__content component__content--{{type}}\"></div>\n            </div>";

    if (componentHTML != null) {
        $element.html(componentHTML);
        this.$compile($element.contents())($scope);
    }
};

ComponentController.$inject = ['$injector', '$scope', '$compile', '$element', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentDataService', 'UtilService'];

var Component = {
    bindings: {
        componentContent: '@',
        componentId: '@',
        componentState: '@',
        mode: '@',
        nodeId: '@',
        originalNodeId: '@',
        originalComponentId: '@',
        teacherWorkgroupId: '@',
        workgroupId: '@'
    },
    scope: true,
    controller: ComponentController
};

exports.default = Component;
//# sourceMappingURL=component.js.map
