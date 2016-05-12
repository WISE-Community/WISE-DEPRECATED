class HTMLController {
    constructor($scope,
                $state,
                $stateParams,
                $sce,
                ConfigService,
                NodeService,
                ProjectService,
                StudentDataService,
                UtilService) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$sce = $sce;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        this.mode = $scope.mode;

        // perform setup of this component

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = $scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = $scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        this.mode = $scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            }

            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

            if (showPreviousWorkNodeId != null) {
                // this component is showing previous work
                this.isShowPreviousWork = true;

                // get the show previous work component id if it is provided
                var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                // get the node content for the other node
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                // get the component content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

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
        
        /*
         * Listen for the requestImage event which is fired when something needs
         * an image representation of the student data from a specific
         * component.
         */
        this.$scope.$on('requestImage', (event, args) => {
            // get the node id and component id from the args
            var nodeId = args.nodeId;
            var componentId = args.componentId;
            
            // check if the image is being requested from this component
            if (this.nodeId === nodeId && this.componentId === componentId) {
                
                // obtain the image objects
                var imageObjects = this.getImageObjects();
                
                if (imageObjects != null) {
                    var args = {};
                    args.nodeId = nodeId;
                    args.componentId = componentId;
                    args.imageObjects = imageObjects;
                    
                    // fire an event that contains the image objects
                    this.$scope.$emit('requestImageCallback', args);
                }
            }
        });
    }


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
    authoringViewComponentChanged() {

        // update the JSON string in the advanced authoring view textarea
        this.updateAdvancedAuthoringView();

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeController.authoringViewNodeChanged();
    };

    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    advancedAuthoringViewComponentChanged() {

        try {
            /*
             * create a new component by converting the JSON string in the advanced
             * authoring view into a JSON object
             */
            var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

            // replace the component in the project
            this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

            // set the new component into the controller
            this.componentContent = editedComponentContent;

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
        } catch(e) {

        }
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    };
    
    /**
     * Get the image object representation of the student data
     * @returns an image object
     */
    getImageObjects() {
        var imageObjects = [];
        
        // get the image elements in the scope
        let componentId = this.componentId;
        var imageElements = angular.element('#' + componentId + ' img');
        
        if (imageElements != null) {
            
            // loop through all the image elements
            for (var i = 0; i < imageElements.length; i++) {
                var imageElement = imageElements[i];
                
                if (imageElement != null) {

                    // create an image object
                    var imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);
                    imageObjects.push(imageObject);
                }
            }
        }
        
        return imageObjects;
    }
}

HTMLController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$sce',
    'ConfigService',
    'NodeService',
    'ProjectService',
    'StudentDataService',
    'UtilService'
];

export default HTMLController;
