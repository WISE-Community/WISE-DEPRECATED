define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope,
                    $rootScope,
                    $state,
                    $stateParams, 
                    ConfigService, 
                    NodeApplicationService,
                    PortfolioService,
                    ProjectService, 
                    NodeService, 
                    StudentDataService) {
        this.mode = 'student';
        this.layoutLogic = ConfigService.layoutLogic;
        this.globalTools = ['hideNavigation', 'showNavigation', 'home', 'sign out'];
        this.currentNode = null;
        this.isPortfolioVisible = false;
        
        $scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            var currentNode = StudentDataService.getCurrentNode();
            var nodeId = currentNode.id;
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
        }));
        
        $scope.$on('nodeVisitsChanged', angular.bind(this, function() {
            StudentDataService.updateNodeStatuses();
        }));
        
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
        
        this.showPortfolio = function() {
            this.isPortfolioVisible = true;
        };
        

        this.hidePortfolio = function() {
            this.isPortfolioVisible = false;
        };

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
                    StudentDataService.setCurrentNodeByNodeId(toNodeId);
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
                        StudentDataService.setCurrentNodeByNodeId(fromNodeId);
                    }
                } else {
                    var stackHistory = StudentDataService.getStackHistory();
                    var prevNodeId = null;
                    if (stackHistory.length > 1) {
                        prevNodeId = StudentDataService.getStackHistoryAtIndex(-2);
                        //var mode = this.mode;
                        //this.loadNode(prevNodeId, mode);
                        StudentDataService.setCurrentNodeByNodeId(prevNodeId);
                    }
                }
            }
        };
        
        var nodeId = null;
        var stateParams = null;
        var stateParamNodeId = null;
        
        if ($state != null) {
            stateParams = $state.params;
        }
        
        if (stateParams != null) {
            stateParamNodeId = stateParams.nodeId;
        }
        
        //var stateParamNodeId = $stateParams.nodeId;
        if (stateParamNodeId != null && stateParamNodeId !== '') {
            nodeId = stateParamNodeId;
        } else {
            var latestNodeVisit = StudentDataService.getLatestNodeVisit();
            if (latestNodeVisit != null) {
                nodeId = latestNodeVisit.nodeId;
            }
        }
        
        if (nodeId == null || nodeId === '') {
            nodeId = ProjectService.getStartNodeId();
        }

        StudentDataService.setCurrentNodeByNodeId(nodeId);
        window.StudentDataService = StudentDataService;
        window.PortfolioService = PortfolioService;
        window.ProjectService = ProjectService;
    });
});