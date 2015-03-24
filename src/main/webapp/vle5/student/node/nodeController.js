define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, 
                $state, 
                $stateParams, 
                NodeApplicationService, 
                NodeService, 
                ProjectService, 
                StudentDataService) {
        
            this.nodeId = null;
            this.nodeType = null;
            this.nodeContent = null;
            
            $scope.$watch(function() {
                return StudentDataService.getCurrentNode();
            }, angular.bind(this, function(newCurrentNode, oldCurrentNode) {
                console.log('nodeController.js currentNode changed');
                if (newCurrentNode != null) {
                    var node = newCurrentNode;
                    var mode = $scope.vleController.mode;
                    this.loadNode(node, mode);
                }
            }));
            
            this.loadNode = function(node, mode) {
                if (node != null) {
                    var nodeType = ProjectService.getNodeTypeByNode(node);
                    console.log('nodeController.js, nodeType:' + nodeType);
                    if (nodeType != null) {
                        this.nodeType = nodeType;
                    }
                    
                    this.nodeId = node.id;
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                        this.nodeContent = nodeContent;
                        //$route.reload();
                        //this.nodeLoaded(this.nodeId);
                    }));
                    
                }
            };
            
            this.nodeLoaded = function(nodeId) {
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
            }
            
        });
});