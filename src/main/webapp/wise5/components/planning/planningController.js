define(['app'], function(app) {
    app.$controllerProvider.register('PlanningController', 
            function($rootScope,
                    $scope, 
                    $state, 
                    $stateParams, 
                    ConfigService,
                    CurrentNodeService,
                    NodeService,
                    OpenResponseService,
                    ProjectService, 
                    StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // the component id
        this.componentId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
        this.studentNodes = [];
        
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;
                
            }
            
            // register this controller to listen for the exit event
            this.registerExitListener();
        };
        
        //this.componentContent = $scope.$parent.nodeController.componentContent;
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
                var transitionIdToReplace = this.componentContent.transitionToReplace;
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
                var componentContent = this.componentContent;
                var studentNode = {};
                studentNode.id = nextStudentNodeId;
                studentNode.type = nodeToCopy.type;
                studentNode.title = nodeToCopy.title;
                studentNode.src = nodeToCopy.src;
                studentNode.copyOf = nodeToCopy.id;
                studentNode.groupId = componentContent.groupToPlace;

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
        
        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        this.isLockAfterSubmit = function() {
            var result = false;
            
            if (this.componentContent != null) {
                
                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }
            
            return result;
        };

        // get the node content
        this.componentContent = ProjectService.getNodeContentByNodeId(this.nodeId);

        this.populateStudentData();
        $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        
        this.populateStudentData = function() {
            var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
            
            if (nodeState != null) {
                var studentNodes = nodeState.studentNodes;
                this.studentNodes = studentNodes;
            }
        };
        
        /*
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            var nodeToExit = args.nodeToExit;
            if (nodeToExit.id === this.nodeId) {
                $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
            }
        }));
        */
        
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
    });
});
