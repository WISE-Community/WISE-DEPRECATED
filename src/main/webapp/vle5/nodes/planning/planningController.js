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
        this.nodeId = null;
        this.studentNodes = [];
        
        var currentNode = StudentDataService.getCurrentNode();
        
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        }
        
        //this.nodeContent = $scope.$parent.nodeController.nodeContent;
        //$scope.$parent.nodeController.nodeLoaded(this.nodeId);

        this.submit = function() {
            var latestStateStudentNodes = this.studentNodes;
            var latestTransitions = this.makeTransitions(latestStateStudentNodes);
            var studentData = {};
            studentData.studentNodes = latestStateStudentNodes;
            studentData.studentTransitions = latestTransitions;
            studentData.isSubmit = true;
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);

            ProjectService.loadNodes(latestStateStudentNodes);
            ProjectService.loadTransitions(latestTransitions);
            var latestStateStudentNodeIds = [];
            for (var sn = 0; sn < latestStateStudentNodes.length; sn++) {
                var latestStateStudentNode = latestStateStudentNodes[sn];
                latestStateStudentNodeIds.push(latestStateStudentNode.id);
            }
            StudentDataService.updateNodeStatuses();
        };

        this.makeTransitions = function(studentNodes) {
            var result = [];
            if (studentNodes != null && studentNodes.length > 0) {
                var transitionIdToReplace = this.nodeContent.transitionToReplace;
                var transitionToReplace = ProjectService.getTransitionById(transitionIdToReplace);
                var replacedTransition = {};
                replacedTransition.id = transitionToReplace.id;
                replacedTransition.from = transitionToReplace.from;
                replacedTransition.to = transitionToReplace.to;
                replacedTransition.disabled = true;
                result.push(replacedTransition);

                var studentTransitionIndex = 1;
                var studentTransitionPrefix = 'studentTransition';
                if (studentNodes.length === 1) {
                    var studentNode = studentNodes[0];
                    var studentTransition1 = {};
                    studentTransition1.id = studentTransitionPrefix + studentTransitionIndex;
                    studentTransitionIndex++;
                    studentTransition1.from = transitionToReplace.from;
                    studentTransition1.to = studentNode.id;
                    result.push(studentTransition1);
                    
                    var studentTransition2 = {};
                    studentTransition2.id = studentTransitionPrefix + studentTransitionIndex;
                    studentTransitionIndex++;
                    studentTransition2.from = studentNode.id;
                    studentTransition2.to = transitionToReplace.to;
                    result.push(studentTransition2);
                } else {
                    for (var sn = 0; sn < studentNodes.length; sn++) {
                        var studentNode = studentNodes[sn];
                        if (sn === 0) {
                            var studentTransition = {};
                            studentTransition.id = studentTransitionPrefix + studentTransitionIndex;
                            studentTransitionIndex++;
                            studentTransition.from = transitionToReplace.from;
                            studentTransition.to = studentNode.id;
                            result.push(studentTransition);
                        } 
                        if (sn !== 0) {
                            var previousStudentNode = studentNodes[sn - 1];
                            var studentTransition = {};
                            studentTransition.id = studentTransitionPrefix + studentTransitionIndex;
                            studentTransitionIndex++;
                            studentTransition.from = previousStudentNode.id;
                            studentTransition.to = studentNode.id;
                            result.push(studentTransition);
                        }                        
                        if (sn === studentNodes.length - 1) {
                            var studentTransition = {};
                            studentTransition.id = studentTransitionPrefix + studentTransitionIndex;
                            studentTransitionIndex++;
                            studentTransition.from = studentNode.id;
                            studentTransition.to = transitionToReplace.to;
                            result.push(studentTransition);
                        }
                    }
                }
            }
            return result;
        };

        this.nodeClicked = function(nodeId) {
            //this.studentNodes.push(nodeId);

            var nodeToCopy = ProjectService.getNodeById(nodeId);

            if (nodeToCopy != null) {
                var nextStudentNodeId = this.getNextStudentNodeId();
                var nodeContent = this.nodeContent;
                var studentNode = {};
                studentNode.id = nextStudentNodeId;
                studentNode.type = nodeToCopy.type;
                studentNode.title = nodeToCopy.title;
                studentNode.src = nodeToCopy.src;
                studentNode.copyOf = nodeToCopy.id;
                studentNode.groupId = nodeContent.groupToPlace;

                var latestState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                var latestStateStudentNodes = [];
                if (latestState != null && latestState.studentNodes != null) {
                    latestStateStudentNodes = [].concat(latestState.studentNodes);
                }

                latestStateStudentNodes.push(studentNode);

                var studentData = {};
                studentData.studentNodes = latestStateStudentNodes;
                StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, studentData);

                this.studentNodes = latestStateStudentNodes;
            }
        };

        this.getNextStudentTransitionId = function() {
            maxStudentTransitionIdNumberSoFar = 0;
            var studentTransitionPrefix = 'studentTransition';

            var nodeVisits = StudentDataService.getNodeVisitsByNodeType('Planning');

            if (nodeVisits != null) {
                for (var nv = 0; nv < nodeVisits.length; nv++) {
                    var nodeVisit = nodeVisits[nv];

                    if (nodeVisit != null) {
                        var nodeStates = nodeVisit.nodeStates;

                        for (var ns = 0; ns < nodeStates.length; ns++) {
                            var nodeState = nodeStates[ns];

                            if (nodeState != null) {
                                var studentTransitions = nodeState.studentTransitions;

                                if (studentTransitions != null) {
                                    for (var n = 0; n < studentTransitions.length; n++) {
                                        var studentTransition = studentTransitions[n];

                                        if (studentTransition != null) {
                                            var studentTransitionId = studentTransition.id;

                                            if (studentTransitionId != null) {
                                                var studentTransitionNumber = parseInt(studentTransitionId.substring(studentTransitionPrefix.length));
                                                if (studentTransitionNumber > maxStudentTransitionIdNumberSoFar) {
                                                    maxStudentTransitionIdNumberSoFar = studentTransitionNumber;
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
                                var deletedStudentNodes = nodeState.deletedStudentNodes;

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

                                // also look in the deleted student nodes array
                                if (deletedStudentNodes != null) {
                                    for (var n = 0; n < deletedStudentNodes.length; n++) {
                                        var deletedStudentNode = deletedStudentNodes[n];

                                        if (deletedStudentNode != null) {
                                            var deletedStudentNodeId = deletedStudentNode.id;

                                            if (deletedStudentNodeId != null) {
                                                var deletedStudentNodeNumber = parseInt(deletedStudentNodeId.substring(studentNodePrefix.length));
                                                if (deletedStudentNodeNumber > maxStudentNodeIdNumberSoFar) {
                                                    maxStudentNodeIdNumberSoFar = deletedStudentNodeNumber;
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

        var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

        NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
            this.nodeContent = nodeContent;
            this.populateStudentData();
            $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        }));
        
        this.populateStudentData = function() {
            var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
            
            if (nodeState != null) {
                var studentNodes = nodeState.studentNodes;
                this.studentNodes = studentNodes;
            }
        };
    })
});
