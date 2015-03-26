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
        this.nodeId = $stateParams.nodeId;
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
                var nextStudentNodeId = this.getNextStudentNodeId();
                var studentNode = {};
                studentNode.id = nextStudentNodeId;
                studentNode.type = nodeToCopy.type;
                studentNode.title = nodeToCopy.title;
                studentNode.src = nodeToCopy.src;
                studentNode.copyOf = nodeToCopy.id;
                
                var latestState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                var latestStateStudentNodes = [];
                if (latestState != null && latestState.studentNodes != null) {
                    latestStateStudentNodes = [].concat(latestState.studentNodes);
                }
                
                latestStateStudentNodes.push(studentNode);
                
                var studentData = {};
                studentData.studentNodes = latestStateStudentNodes;
                
                StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);
                
                this.planningResults = latestStateStudentNodes;
            }
        };
        
        this.getNextStudentNodeId = function() {
            var maxStudentNodeIdNumberSoFar = 0;
            var studentNodePrefix = 'studentNode';
            
            var nodeVisits = StudentDataService.getNodeVisitsByNodeType('Planning');
            
            if (nodeVisits != null) {
                for (var nv = 0; nv < nodeVisits.length; nv++) {
                    var nodeVisit = nodeVisits[nv];
                    
                    if (nodeVisit != null) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        for (var ns = 0; ns < nodeStates.length; ns++) {
                            var nodeState = nodeStates[ns];
                            
                            if (nodeState != null) {
                                var studentNodes = nodeState.studentNodes;
                                
                                if (studentNodes != null) {
                                    for (var n = 0; n < studentNodes.length; n++) {
                                        var studentNode = studentNodes[n];
                                        
                                        if (studentNode != null) {
                                            var studentNodeId = studentNode.id;
                                            
                                            if (studentNodeId != null) {
                                                var studentNodeNumber = parseInt(studentNodeId.substring(studentNodePrefix.length));
                                                if (studentNodeNumber > maxStudentNodeIdNumberSoFar) {
                                                    maxStudentNodeIdNumberSoFar = studentNodeNumber;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return studentNodePrefix + (maxStudentNodeIdNumberSoFar+1);
        };
        
    })
});
