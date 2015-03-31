define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope,
                    $state,
                    $stateParams, 
                    ConfigService, 
                    NodeApplicationService,
                    ProjectService, 
                    NodeService, 
                    StudentDataService) {
        this.mode = 'student';
        this.layoutLogic = ConfigService.layoutLogic;
        this.globalTools = ['hideNavigation', 'showNavigation', 'portfolio', 'home', 'sign out'];
        this.currentNode = null;
        //this.callbackListeners = [];
        //this.wiseMessageId = 0;
            
        $scope.$watch(function() {
            return StudentDataService.getCurrentNode();
        }, angular.bind(this, function(newCurrentNode, oldCurrentNode) {
            if (newCurrentNode != null) {
                var nodeId = newCurrentNode.id;
                StudentDataService.updateStackHistory(nodeId);
                StudentDataService.updateVisitedNodesHistory(nodeId);

                var layoutClass = null;
                
                if (ProjectService.isApplicationNode(nodeId)) {
                    layoutClass = ProjectService.getStudentIsOnApplicationNodeClass();
                } else if (ProjectService.isGroupNode(nodeId)) {
                    layoutClass = ProjectService.getStudentIsOnGroupNodeClass();
                }
                
                if (layoutClass != null) {
                    this.layoutState = layoutClass;
                }
                
                $state.go('root.vle', {nodeId:nodeId});
            }
        }));
        
        var objectEquality = true;
        // why does getNodeVisits() not trigger a change
        $scope.$watch(function() {
            var nodeVisits = StudentDataService.getNodeVisits();
            return nodeVisits;
        }, angular.bind(this, function(newNodeVisits, oldNodeVisits) {
            if (newNodeVisits != null) {
                StudentDataService.updateNodeStatuses();
            }
        }), objectEquality);
        
        this.layoutStates = ['layout1', 'layout2', 'layout3', 'layout4'];
        this.layoutState = this.layoutStates[0];
        
        this.showProjectDiv = true;
        this.showNodeDiv = true;

        this.updateLayout = function() {
            if (this.project != null) {
                ProjectService.getProject();
            }
        };
        
        this.updateLayout();

        this.globalToolButtonClicked = function(globalToolName) {
            if (globalToolName === 'hideNavigation') {
                this.layoutState = 'layout4';
            } else if (globalToolName === 'showNavigation') {
                this.layoutState = 'layout3';
            }
        };
        
        this.layoutLogicStarMap = function(VLEState) {
            if (VLEState.state === 'initial') {
                this.showProjectDiv = true;
                this.showNodeDiv = false;
            } else if (VLEState.state === 'showNavigationClicked') {
                this.showProjectDiv = true;
                this.showNodeDiv = false;
            }
        };
        
        this.chooseTransition = function(transitions) {
            var transitionResult = null;
            if (transitions != null) {
                for (var t = 0; t < transitions.length; t++) {
                    var transition = transitions[t];
                    var toNodeId = transition.to;
                    if (toNodeId != null) {
                        var toNodeNodeStatus = StudentDataService.getNodeStatusByNodeId(toNodeId);
                        if (toNodeNodeStatus != null && toNodeNodeStatus.isVisitable) {
                            transitionResult = transition;
                            break;
                        }
                    }
                }
            }
            return transitionResult;
        };
        
        this.goToNextNode = function() {
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var transitions = ProjectService.getTransitionsByFromNodeId(currentNodeId);
                var transition = this.chooseTransition(transitions);
                if (transition != null) {
                    var toNodeId = transition.to;
                    //var mode = this.mode;
                    //this.loadNode(toNodeId, mode);
                    this.setCurrentNodeByNodeId(toNodeId);
                }
            }
        };
       
        this.goToPrevNode = function() {
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var transitions = ProjectService.getTransitionsByToNodeId(currentNodeId);
                
                if (transitions != null && transitions.length === 1) {
                    var transition = transitions[0];
                    
                    if (transition != null) {
                        var fromNodeId = transition.from;
                        this.setCurrentNodeByNodeId(fromNodeId);
                    }
                } else {
                    var stackHistory = StudentDataService.getStackHistory();
                    var prevNodeId = null;
                    if (stackHistory.length > 1) {
                        prevNodeId = StudentDataService.getStackHistoryAtIndex(-2);
                        //var mode = this.mode;
                        //this.loadNode(prevNodeId, mode);
                        this.setCurrentNodeByNodeId(prevNodeId);
                    }
                }
            }
        };
        
        this.setCurrentNodeByNodeId = function(nodeId) {
            var node = ProjectService.getNodeById(nodeId);
            StudentDataService.setCurrentNode(node);
        };
        
        //$scope.$on('$messageIncoming', angular.bind(PostMessageService, PostMessageService.handleMessageIncoming));
        
        var nodeId = $stateParams.nodeId;
        if (nodeId == null || nodeId === '') {
            nodeId = ProjectService.getStartNodeId();
        }
        
        var currentNode = StudentDataService.getCurrentNode();
        
        if (currentNode != null) {
            nodeId = currentNode.id;
        }

        this.setCurrentNodeByNodeId(nodeId);
    });
});