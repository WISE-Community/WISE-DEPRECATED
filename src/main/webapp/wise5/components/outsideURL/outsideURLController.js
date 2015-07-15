define(['app'], function(app) {
    app.$controllerProvider.register('OutsideURLController', 
        function($rootScope,
            $scope,
            $sce,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            NodeService,
            OutsideURLService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
        // the url to the web page to display
        this.url = null;
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;
                    
                    // get the node src for the node we want previous work from
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                    
                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;
                    
                    // get the node content for the show previous work node
                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                        
                        // get the node content for the component we are showing previous work for
                        this.componentContent = NodeService.getNodeContentPartById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        if (this.componentContent != null) {
                            // set the url
                            this.setURL(this.componentContent.url);
                        }
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;
                        
                        // get the component
                        var component = $scope.component;
                        
                        // register this component with the parent node
                        $scope.$parent.registerPartController($scope, component);
                    }));
                } else {
                    // this is a regular component
                    
                    if (this.componentContent != null) {
                        // set the url
                        this.setURL(this.componentContent.url);
                    }
                    
                    // get the component from the scope
                    var component = $scope.component;
                    
                    // register this component with the parent node
                    $scope.$parent.registerPartController($scope, component);
                }
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
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
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
        
        // perform setup of this node
        this.setup();
    })
});