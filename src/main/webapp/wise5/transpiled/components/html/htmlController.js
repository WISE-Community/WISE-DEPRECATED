'use strict';

define(['app'], function (app) {
    app.$controllerProvider.register('HTMLController', function ($scope, $state, $stateParams, $sce, ConfigService, NodeService, ProjectService, StudentDataService) {

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        /**
         * Perform setup of the component
         */
        this.setup = function () {

            // get the current node and node id
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            } else {
                this.nodeId = $scope.nodeId;
            }

            // get the component content from the scope
            this.componentContent = $scope.component;

            this.mode = $scope.mode;

            if (this.componentContent != null) {

                // get the component id
                this.componentId = this.componentContent.id;

                if (this.mode === 'authoring') {
                    this.updateAdvancedAuthoringView();
                }

                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;

                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                    // get the node content for the other node
                    var showPreviousWorkNodeContent = ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                    // get the component content for the component we are showing previous work for
                    this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    if (this.componentContent != null) {
                        this.componentContent = component.html;
                    }

                    // disable the component since we are just showing previous work
                    this.isDisabled = true;

                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                } else {
                    // this is a regular component

                    if (this.componentContent != null) {
                        this.html = this.componentContent.html;
                    }

                    if ($scope.$parent.registerComponentController != null) {
                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, this.componentContent);
                    }
                }
            }
        };

        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        this.authoringViewComponentChanged = function () {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            // save the project to the server
            ProjectService.saveProject();
        };

        /**
         * The component has changed in the advanced authoring view so we will update
         * the component and save the project.
         */
        this.advancedAuthoringViewComponentChanged = function () {

            try {
                /*
                 * create a new comopnent by converting the JSON string in the advanced
                 * authoring view into a JSON object
                 */
                var editedComponentContent = angular.fromJson(this.componentContentJSONString);

                // replace the component in the project
                ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

                // set the new component into the controller
                this.componentContent = editedComponentContent;

                // save the project to the server
                ProjectService.saveProject();
            } catch (e) {}
        };

        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        this.updateAdvancedAuthoringView = function () {
            this.componentContentJSONString = angular.toJson(this.componentContent, 4);
        };

        // perform setup of this component
        this.setup();
    });
});