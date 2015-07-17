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
        
        // field that will hold the component content
        this.componentContent = null;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        /**
         * Perform setup of the component
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
                        this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        if (this.componentContent != null) {
                            this.componentContent = component.html;
                        }
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;
                        
                        // get the component
                        var component = $scope.component;
                        
                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, component);
                    }));
                } else {
                    // this is a regular component
                    
                    // get the component from the scope
                    var component = $scope.component;
                    
                    if (component != null) {
                        this.componentContent = component.html;
                    }
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, component);
                }
            }
        };
        
        // perform setup of this node
        this.setup();
    });
});