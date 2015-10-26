define(['app'], function(app) {
    app.$controllerProvider.register('OutsideURLController', 
        function($rootScope,
            $scope,
            $sce,
            $state, 
            $stateParams,
            ConfigService,
            NodeService,
            OutsideURLService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // the component id
        this.componentId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
        // the url to the web page to display
        this.url = null;

        // the max width of the iframe
        this.maxWidth = null;

        // the max height of the iframe
        this.maxHeight = null;
        
        /**
         * Perform setup of the component
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;
                
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

                // register this component with the parent node
                $scope.$parent.registerComponentController($scope, this.componentContent);
            }
        };
        
        /**
         * Set the url
         * @param url the url
         */
        this.setURL = function(url) {
            if (url != null) {
                var trustedURL = $sce.trustAsResourceUrl(url);
                this.url = trustedURL;
            }
        };
        
        /**
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            var studentWork = null;
            
            return studentWork;
        };
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            
            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = $scope.$on('exit', angular.bind(this, function(event, args) {
                
            }));
        };
        
        // perform setup of this component
        this.setup();
    })
});