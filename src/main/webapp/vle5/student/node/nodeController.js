define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, 
                $rootScope,
                $state, 
                $stateParams, 
                NodeApplicationService, 
                NodeService, 
                ProjectService, 
                StudentDataService) {
        
            this.nodeId = null;
            this.nodeType = null;
            this.nodeContent = null;
            console.log('NodeController nnnnnnnnnnnnnnnnnn');
            $scope.$on('testEvent', angular.bind(this, function() {
                console.log('received testEvent');
                
                var node = StudentDataService.getCurrentNode();
                var mode = $scope.vleController.mode;
                this.loadNode(node, mode);
            }));
            
            /*
            $scope.$watch(function() {
                console.log('nodeController: Checking currentNode');
                var currentNode = StudentDataService.getCurrentNode();
                return currentNode;
            }, angular.bind(this, function(newCurrentNode, oldCurrentNode) {
                console.log('nodeController: currentNode changed xxxxxxxxxxxxxxxxxxxxx');
                console.log('nodeController: newCurrentNode=' + newCurrentNode);
                console.log('nodeController: oldCurrentNode=' + oldCurrentNode);
                if (newCurrentNode != null) {
                    console.log('different');
                    var node = newCurrentNode;
                    var mode = $scope.vleController.mode;
                    this.loadNode(node, mode);
                } else {
                    console.log('same');
                }
            }));
            */
            
            this.loadNode = function(node, mode) {
                if (node != null) {
                    var nodeType = ProjectService.getNodeTypeByNode(node);
                    if (nodeType != null) {
                        this.nodeType = nodeType;
                    }
                    
                    
                    this.nodeId = node.id;
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                        this.nodeContent = nodeContent;
                        //$route.reload();
                        //this.nodeLoaded(this.nodeId);
                        
                        if (this.nodeType === 'OpenResponse') {
                            this.nodeHTMLPath = 'vle5/nodes/openResponse/index.html';
                        } else if (this.nodeType === 'HTML') {
                            this.nodeHTMLPath = 'vle5/nodes/html/index.html';
                        } else if (this.nodeType === 'Planning') {
                            this.nodeHTMLPath = 'vle5/nodes/planning/index.html';
                        }
                    }));
                    
                }
            };
            
            this.nodeLoaded = function(nodeId) {
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
            }
            
        });
});