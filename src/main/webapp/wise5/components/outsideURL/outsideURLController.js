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
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
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
            
            // check if the node is part of another node
            if ($scope.part != null) {
                // the node is part of another node
                this.isNodePart = true;
                
                // set the content
                this.nodeContent = $scope.part;
                
                if (this.nodeContent != null) {
                    this.setURL(this.nodeContent.url);
                }
                
                // get the latest node state
                //var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                
                // populate the student work into this node
                //this.setStudentWork(nodeState);
                
                // check if we need to lock this node
                //this.calculateDisabled();
                
                // check if we need to lock this node
                //this.calculateDisabled();
                
                // get the part
                var part = $scope.part;
                
                /*
                 * register this node with the parent node which will most  
                 * likely be a Questionnaire node
                 */
                $scope.$parent.registerPartController($scope, part);
            } else {
                // this is a regular standalone node
                var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
                
                // get the node content for this node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    this.nodeContent = nodeContent;
                    
                    if (this.nodeContent != null) {
                        this.setURL(this.nodeContent.url);
                    }
                    
                    // get the latest node state
                    //var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    // popualte the student work into this node
                    //this.setStudentWork(nodeState);
                    
                    // check if we need to lock this node
                    //this.calculateDisabled();
                    
                    // import any work if necessary
                    //this.importWork();
                    
                    // tell the parent controller that this node has loaded
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                    
                    // start the auto save interval
                    //this.startAutoSaveInterval();
                    
                    // register this controller to listen for the exit event
                    this.registerExitListener();
                }));
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
                
                /*
                 * Check if this node is part of another node such as a
                 * Questionnaire node. If this is part of another node we do
                 * not need to perform any saving because the parent will
                 * handle the saving.
                 */
                if (!this.isNodePart) {
                    // this is a standalone node so we will save
                    
                    //var saveTriggeredBy = 'exit';
                    
                    // create and add a node state to the latest node visit
                    //this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    //this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                    
                    // call this function to remove the listener
                    this.exitListener();
                    
                    /*
                     * tell the session service that this listener is done
                     * performing everything it needs to do before exiting
                     */
                    $rootScope.$broadcast('doneExiting');
                }
            }));
        };
        
        // perform setup of this node
        this.setup();
    })
});