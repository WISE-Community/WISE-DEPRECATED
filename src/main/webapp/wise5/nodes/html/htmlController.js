define(['app'], function(app) {
    app.$controllerProvider.register('HTMLController', 
        function($scope, 
                $state, 
                $stateParams,
                $sce,
                ConfigService, 
                CurrentNodeService,
                NodeService,
                ProjectService, 
                StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
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
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.nodeContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this part is showing previous work
                    this.isShowPreviousWork = true;
                    
                    // get the node src for the node we want previous work from
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                    
                    // get the show previous work part id if it is provided
                    var showPreviousWorkPartId = this.nodeContent.showPreviousWorkPartId;
                    
                    // get the node content for the show previous work node
                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                        
                        // check if we are show previous work from a part
                        if (showPreviousWorkPartId != null) {
                            // we are showing previous work from a part
                            
                            // get the part from the node content
                            part = NodeService.getNodeContentPartById(showPreviousWorkNodeContent, showPreviousWorkPartId);
                            
                            if (part != null) {
                                // set the content
                                this.nodeContent = part.html;
                            }
                        } else {
                            // set the show previous work node content
                            this.nodeContent = showPreviousWorkNodeContent;
                        }
                        
                        // get the part
                        var part = $scope.part;
                        
                        /*
                         * register this node with the parent node which will most  
                         * likely be a Questionnaire node
                         */
                        $scope.$parent.registerPartController($scope, part);
                    }));
                } else {
                    // this is a node part
                    
                    // get the part
                    var part = $scope.part;
                    
                    if (part != null) {
                        // set the content
                        this.nodeContent = part.html;
                    }
                    
                    /*
                     * register this node with the parent node which will most  
                     * likely be a Questionnaire node
                     */
                    $scope.$parent.registerPartController($scope, part);
                }
            } else {
                // this is a regular standalone node
                var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
                
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    this.nodeContent = nodeContent;
                    
                    // tell the parent controller that this node has loaded
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                }));
            }
        };
        
        // perform setup of this node
        this.setup();
    });
});