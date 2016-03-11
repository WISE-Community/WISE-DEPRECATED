class OutsideURLController {
    constructor($scope,
                $sce,
                NodeService,
                OutsideURLService,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.$sce = $sce;
        this.NodeService = NodeService;
        this.OutsideURLService = OutsideURLService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // the url to the web page to display
        this.url = null;

        // the max width of the iframe
        this.maxWidth = null;

        // the max height of the iframe
        this.maxHeight = null;

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(() => {
                    return this.authoringComponentContent;
                }, (newValue, oldValue) => {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);

                    // set the url
                    this.setURL(this.authoringComponentContent.url);
                }, true);
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
                    // set the url
                    this.setURL(this.componentContent.url);
                }

                // disable the component since we are just showing previous work
                this.isDisabled = true;
            } else {
                // this is a regular component

                if (this.componentContent != null) {
                    // set the url
                    this.setURL(this.componentContent.url);
                }
            }

            // get the max width
            this.maxWidth = this.componentContent.maxWidth ? this.componentContent.maxWidth : "none";

            // get the max height
            this.maxHeight = this.componentContent.maxHeight ? this.componentContent.maxHeight : "none";

            if (this.$scope.$parent.registerComponentController != null) {
                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function() {
            var studentWork = null;

            return studentWork;
        }.bind(this);
    }

    /**
     * Set the url
     * @param url the url
     */
    setURL(url) {
        if (url != null) {
            var trustedURL = this.$sce.trustAsResourceUrl(url);
            this.url = trustedURL;
        }
    };

    /**
     * The component has changed in the regular authoring view so we will save the project
     */
    authoringViewComponentChanged() {

        // set the url
        //this.setURL(this.authoringComponentContent.url);

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
            var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

            // replace the component in the project
            this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

            // set the new authoring component content
            this.authoringComponentContent = authoringComponentContent;

            // set the component content
            this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
        } catch(e) {
            console.error(e.toString());
        }
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    };

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    registerExitListener() {

        /*
         * Listen for the 'exit' event which is fired when the student exits
         * the VLE. This will perform saving before the VLE exits.
         */
        this.exitListener = this.$scope.$on('exit', (event, args) => {

        });
    };
}

OutsideURLController.$inject = [
    '$scope',
    '$sce',
    'NodeService',
    'OutsideURLService',
    'ProjectService',
    'StudentDataService'
];

export default OutsideURLController;
