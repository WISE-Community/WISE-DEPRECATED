define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope, $stateParams, ConfigService, NodeApplicationService, ProjectService, NodeService, StudentDataService) {
        this.mode = 'student';
        this.layoutLogic = ConfigService.layoutLogic;
        this.globalTools = ['hideNavigation', 'showNavigation', 'portfolio', 'home', 'sign out'];
        this.currentNode = null;
        this.callbackListeners = [];
        this.wiseMessageId = 0;
            
        $scope.$watch(function() {
            return StudentDataService.getCurrentNode();
        }, function(newCurrentNode, oldCurrentNode) {
            if (newCurrentNode != null) {
                var nodeId = newCurrentNode.id;
                StudentDataService.updateStackHistory(nodeId);
            }
        });
        
        this.layoutStates = ['layout1', 'layout2', 'layout3', 'layout4'];
        this.layoutState = this.layoutStates[0];
        
        this.showProjectDiv = true;
        this.showNodeDiv = true;

        this.updateLayout = function() {
            if (this.project != null) {
                ProjectService.getProject();
            }
            this.projectDivClass = this.layoutState;
            this.nodeDivClass = this.layoutState;
        }
        this.updateLayout();

        this.globalToolButtonClicked = function(globalToolName) {
            if (globalToolName === 'hideNavigation') {
                this.layoutState = 'layout3';
            } else if (globalToolName === 'showNavigation') {
                this.layoutState = 'layout3';
                var layoutLogic = ProjectService.getLayoutLogic();
                // var layoutLogicFunction = layoutLogicService.getLayoutLogicFunction(layoutLogic);
                // layoutLogicFunction(this.stateOfVLE)
                //this.layoutLogicStarMap({state: 'showNavigationClicked'});
            }
        }
        
        this.layoutLogicStarMap = function(VLEState) {
            if (VLEState.state === 'initial') {
                this.showProjectDiv = true;
                this.showNodeDiv = false;
            } else if (VLEState.state === 'showNavigationClicked') {
                this.showProjectDiv = true;
                this.showNodeDiv = false;
            }
        }
        
        this.chooseTransition = function(transitions) {
            var transitionResult = null;
            if (transitions.length > 0) {
                transitionResult = transitions[0];
            }
            return transitionResult;
        }
        
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
        } 
       
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
        }
        
        this.postMessageToIFrame = function(iFrameId, message, callback) {
            if (callback != null) {
                message.wiseMessageId = this.wiseMessageId;
                this.callbackListeners.push({wiseMessageId:this.wiseMessageId, callback:callback});
                this.wiseMessageId++;
            }
            var iFrame = $('#' + iFrameId);
            iFrame[0].contentWindow.postMessage(message, '*');
        };
        
        this.setCurrentNodeByNodeId = function(nodeId) {
            var node = ProjectService.getNodeByNodeId(nodeId);
            StudentDataService.setCurrentNode(node);
        };
        
        
        $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
            var msg = data;
            var wiseMessageId = msg.wiseMessageId;
            if (wiseMessageId != null) {
                for (var i = 0; i < this.callbackListeners.length; i++) {
                    var callbackListener = this.callbackListeners[i];
                    if (callbackListener && callbackListener.wiseMessageId === wiseMessageId) {
                        callbackListener.callback(callbackListener.callbackArgs);
                    }
                }
            }
        }));
        
        var nodeId = ProjectService.getStartNodeId();
        var stackHistory = StudentDataService.getStackHistory();
        if (stackHistory != null) {
            var lastNodeIdFromStackHistory = StudentDataService.getStackHistoryAtIndex(-1);
            if (lastNodeIdFromStackHistory != null) {
                nodeId = lastNodeIdFromStackHistory;
            }
        }
        
        this.setCurrentNodeByNodeId(nodeId);
        
        //this.loadNode(nodeId, this.mode);
        
        //this.layoutLogicStarMap({"state":"initial"});
    });
});