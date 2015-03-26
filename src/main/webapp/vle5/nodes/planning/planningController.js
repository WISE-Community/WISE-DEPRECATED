define(['app'], function(app) {
    app.$controllerProvider.register('PlanningController', 
            function($scope, 
                    $state, 
                    $stateParams, 
                    ConfigService,
                    NodeService,
                    OpenResponseService,
                    ProjectService, 
                    StudentDataService) {
        
        this.nodeContent = null;
        this.planningResults = [];
        
        $scope.$watch(function() {
            return $scope.$parent.nodeController.nodeContent;
        }, angular.bind(this, function(newNodeContent, oldNodeContent) {
            console.log('nodeController.js nodeContent changed');
            if (newNodeContent != null) {
                this.nodeContent = newNodeContent;
                //this.calculateDisabled();
                $scope.$parent.nodeController.nodeLoaded(this.nodeId);
            }
        }));
        
        this.nodeClicked = function(nodeId) {
            //this.planningResults.push(nodeId);
            
            var nodeToCopy = ProjectService.getNodeById(nodeId);
            
            if (nodeToCopy != null) {
                var studentNode = {};
                studentNode.id ='';
                studentNode.type = nodeToCopy.type;
                studentNode.title = nodeToCopy.title;
                studentNode.src = nodeToCopy.src;
                studentNode.copyOf = nodeToCopy.id;
            }
            

            
            var studentData = {};
            studentData.nodes = [];
            
            
            
            
        };
        
        this.getNextStudentNodeId = function() {
            var studentNodeIdNumbersSoFar = [];
            
            var nodeVisits = StudentDataService.getNodeVisitsByNodeType('Planning');
            
            if (nodeVisits != null) {
                for (var nv = 0; nv < nodeVisits.length; nv++) {
                    var nodeVisit = nodeVisits[nv];
                    
                    if (nodeVisit != null) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        for (var ns = 0; ns < nodeStates.length; ns++) {
                            var nodeState = nodeStates[ns];
                            
                            if (nodeState != null) {
                                var nodes = nodeState.nodes;
                                
                                if (nodes != null) {
                                    for (var n = 0; n < nodes.length; n++) {
                                        var node = nodes[n];
                                        
                                        if (node != null) {
                                            var nodeId = node.id;
                                            
                                            if (nodeId != null) {
                                                var studentNodeNumber = nodeId.replace('studentNode', '');
                                                studentNodeIdNumbersSoFar.push(studentNodeNumber);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        
    })
});
