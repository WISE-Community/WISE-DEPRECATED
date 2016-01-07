class EmbeddedController {
    constructor($scope,
                $sce,
                $window,
                NodeService,
                EmbeddedService,
                ProjectService,
                StudentDataService) {

        this.$scope = $scope;
        this.$sce = $sce;
        this.$window = $window;
        this.NodeService = NodeService;
        this.EmbeddedService = EmbeddedService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the component type
        this.componentType = null;

        // the url to the web page to display
        this.url = null;

        // the max width of the iframe
        this.maxWidth = null;

        // the max height of the iframe
        this.maxHeight = null;

        // whether we have data to save
        this.isDirty = false;

        this.messageEventListener = angular.bind(this, function(messageEvent) {
            // handle messages received from iframe
            var messageEventData = messageEvent.data;
            if (messageEventData.messageType === "event") {
                // save event to WISE
                var nodeId = this.nodeId;
                var componentId = this.componentId;
                var componentType = this.componentType;
                var category = messageEventData.eventCategory;
                var event = messageEventData.event;
                var eventData = messageEventData.eventData;

                // save notebook open/close event
                this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
            } else if (messageEventData.messageType === "studentWork") {
                // save student work to WISE
                // create a new component state
                this.componentState = this.NodeService.createNewComponentState();

                // set the student data into the component state
                this.componentState.studentData = messageEventData.studentData;

                this.componentState.isSubmit = false;
                if (messageEventData.isSubmit) {
                    this.componentState.isSubmit = messageEventData.isSubmit;
                }

                this.componentState.isAutoSave = false;
                if (messageEventData.isAutoSave) {
                    this.componentState.isAutoSave = messageEventData.isAutoSave;
                }

                this.isDirty = true;

                // tell the parent node that this component wants to save
                this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});

            }
        });

        // listen for message events from embedded iframe application
        this.$window.addEventListener('message', this.messageEventListener);

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.component;

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            this.componentType = this.componentContent.type;

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
            var componentState = null;

            if (this.$scope.embeddedController.isDirty) {
                // create a component state populated with the student data
                componentState = this.$scope.embeddedController.componentState;

                // set isDirty to false since this student work is about to be saved
                this.$scope.embeddedController.isDirty = false;
                this.$scope.embeddedController.componentState = null;
            }

            return componentState;
        };


        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
            // unregister messageEventListener
            this.$window.removeEventListener('message', this.messageEventListener);
        }));
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
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    registerExitListener() {

        /*
         * Listen for the 'exit' event which is fired when the student exits
         * the VLE. This will perform saving before the VLE exits.
         */
        this.exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

        }));
    };

}

EmbeddedController.$inject = [
    '$scope',
    '$sce',
    '$window',
    'NodeService',
    'EmbeddedService',
    'ProjectService',
    'StudentDataService'
];

export default EmbeddedController;

