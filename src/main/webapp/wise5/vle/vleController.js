define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope,
                    $rootScope,
                    $state,
                    $stateParams,
                    ConfigService,
                    CurrentNodeService,
                    NotebookService,
                    ProjectService,
                    NodeService,
                    SessionService,
                    StudentDataService,
                    StudentWebSocketService,
                    $mdDialog,
                    $mdSidenav,
                    $mdComponentRegistry,
                    $ocLazyLoad) {
        this.mode = 'student';
        this.layoutLogic = ConfigService.layoutLogic;
        this.currentNode = null;

        this.setLayoutState = function() {
            var layoutState = 'nav'; // default layout state
            var node = CurrentNodeService.getCurrentNode();

            if(node){
                var id = node.id;
                if (ProjectService.isApplicationNode(id)) {
                    layoutState = 'node';
                } else if (ProjectService.isGroupNode(id)) {
                    layoutState = 'nav';
                }
            }

            this.layoutState = layoutState;
        };

        // alert user when inactive for a long time
        $scope.$on('showSessionWarning', angular.bind(this, function() {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Session Timeout')
                .content('You have been inactive for a long time. Do you want to stay logged in?')
                .ariaLabel('Session Timeout')
                .ok('YES')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                SessionService.renewSession();
            }, function() {
                SessionService.forceLogOut();
            });
        }));
        
        $scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            var currentNode = CurrentNodeService.getCurrentNode();
            var nodeId = currentNode.id;

            StudentDataService.updateStackHistory(nodeId);
            StudentDataService.updateVisitedNodesHistory(nodeId);
            StudentDataService.updateNodeStatuses();

            this.setLayoutState();
            
            StudentWebSocketService.sendStudentStatus();
            $state.go('root.vle', {nodeId:nodeId});
        }));
        
        $scope.$on('componentStudentDataChanged', angular.bind(this, function() {
            StudentDataService.updateNodeStatuses();
        }));

        this.updateLayout = function() {
            if (this.project != null) {
                ProjectService.getProject();
            }
        };

        this.showNavigation = function() {
            this.layoutState = 'nav';
        };
        this.navFilters = ProjectService.getFilters();
        this.navFilter = this.navFilters[0].name;

        this.goHome = function() {
            // save goHome event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "goHomeButtonClicked";
            var eventData = {};
            StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            $rootScope.$broadcast('goHome');
        };
        
        this.logOut = function() {
            // save logOut event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "logOutButtonClicked";
            var eventData = {};
            StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            $rootScope.$broadcast('logOut');
        };

        // capture notebook open/close events
        $mdComponentRegistry.when('notebook').then(function(it){
            $scope.$watch(function() {
                return it.isOpen();
            }, function(isOpen) {
                var nodeId = null;
                var componentId = null;
                var componentType = null;
                var category = "Notebook";
                var eventData = {};
                var currentNode = CurrentNodeService.getCurrentNode();
                eventData.curentNodeId = currentNode == null ? null : currentNode.id;

                var event = isOpen ? "notebookOpened" : "notebookClosed";

                // save notebook open/close event
                StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
            });
        });
          
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
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var transitions = ProjectService.getTransitionsByFromNodeId(currentNodeId);
                var transition = this.chooseTransition(transitions);
                if (transition != null) {
                    var toNodeId = transition.to;
                    //var mode = this.mode;
                    //this.loadNode(toNodeId, mode);
                    CurrentNodeService.setCurrentNodeByNodeId(toNodeId);
                }
            }
        };
       
        this.goToPrevNode = function() {
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var transitions = ProjectService.getTransitionsByToNodeId(currentNodeId);
                
                if (transitions != null && transitions.length === 1) {
                    var transition = transitions[0];
                    
                    if (transition != null) {
                        var fromNodeId = transition.from;
                        CurrentNodeService.setCurrentNodeByNodeId(fromNodeId);
                    }
                } else {
                    var stackHistory = StudentDataService.getStackHistory();
                    var prevNodeId = null;
                    if (stackHistory.length > 1) {
                        prevNodeId = StudentDataService.getStackHistoryAtIndex(-2);
                        //var mode = this.mode;
                        //this.loadNode(prevNodeId, mode);
                        CurrentNodeService.setCurrentNodeByNodeId(prevNodeId);
                    }
                }
            }
        };
        
        this.notebookDragStartCallback = function(event, ui) {
            console.log('vleController.notebookDragStartCallback');
            //$(ui.helper.context).data('importWorkNodeState', StudentDataService.getLatestNodeStateByNodeId(nodeId));
            //$(ui.helper.context).data('importWorkNodeType', nodeType);
        };
        
        this.notebookDropCallback = angular.bind(this, function(event, ui) {
            console.log('vleController.notebookDropCallback');
            //var importWorkNodeState = $(ui.helper.context).data('importWorkNodeState');
            //var importWorkNodeType = $(ui.helper.context).data('importWorkNodeType');
            //var populatedNodeState = OpenResponseService.populateNodeState(importWorkNodeState, importWorkNodeType);
            
            //this.setStudentWork(populatedNodeState);
        });

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
            var latestComponentState = StudentDataService.getLatestComponentState();
            
            if (latestComponentState != null) {
                nodeId = latestComponentState.nodeId;
            }
        }
        
        if (nodeId == null || nodeId === '') {
            nodeId = ProjectService.getStartNodeId();
        }
        
        this.projectStyle = ProjectService.getStyle();
        this.projectName = ProjectService.getName();

        CurrentNodeService.setCurrentNodeByNodeId(nodeId);

        this.notebookFilters = NotebookService.getFilters();
        this.notebookFilter = this.notebookFilters[0].name;
        this.notebookOpen = false;

        this.toggleNotebook = function() {
            this.notebookOpen = !this.notebookOpen;
        };
        
        /**
         * The user has moved the mouse on the page
         */
        this.mouseMoved = function() {
            /*
             * tell the session service a mouse event occurred so it
             * can reset the session timeout timers
             */
            SessionService.mouseEventOccurred();
        };
                
        // Make sure if we drop something on the page we don't navigate away
        // https://developer.mozilla.org/En/DragDrop/Drag_Operations#drop
        $(document.body).on('dragover', function(e) {
            e.preventDefault();
            return false;
       });

       $(document.body).on('drop', function(e){
            e.preventDefault();
            return false;
        });

        this.theme = ProjectService.getTheme();
        this.themePath = "wise5/vle/themes/" + this.theme;
        var scope = this;
        // load theme navigation module + files
        $ocLazyLoad.load([
            this.themePath + '/navigation/navigation.js'
        ]).then(function(){
            scope.setLayoutState();
            scope.updateLayout();
        });
    });
});