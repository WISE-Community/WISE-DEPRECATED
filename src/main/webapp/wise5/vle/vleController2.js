//import theme from './themes/default/theme2.js';

class VLEController {
    constructor($scope,
                $rootScope,
                $state,
                ConfigService,
                NotebookService,
                ProjectService,
                SessionService,
                StudentDataService,
                StudentWebSocketService,
                $ocLazyLoad) {

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.StudentDataService = StudentDataService;
        this.StudentWebSocketService = StudentWebSocketService;
        this.$ocLazyLoad = $ocLazyLoad;

        this.mode = 'student';
        this.layoutLogic = this.ConfigService.layoutLogic;
        this.currentNode = null;
        this.themeLoaded = false;

        this.navFilters = this.ProjectService.getFilters();
        this.navFilter = this.navFilters[0].name;

        var nodeId = null;
        var stateParams = null;
        var stateParamNodeId = null;

        if (this.$state != null) {
            stateParams = this.$state.params;
        }

        if (stateParams != null) {
            stateParamNodeId = stateParams.nodeId;
        }

        if (stateParamNodeId != null && stateParamNodeId !== '') {
            nodeId = stateParamNodeId;
        } else {
            var latestComponentState = this.StudentDataService.getLatestComponentState();

            if (latestComponentState != null) {
                nodeId = latestComponentState.nodeId;
            }
        }

        if (nodeId == null || nodeId === '') {
            nodeId = this.ProjectService.getStartNodeId();
        }

        this.projectStyle = this.ProjectService.getStyle();
        this.projectName = this.ProjectService.getName();

        this.StudentDataService.setCurrentNodeByNodeId(nodeId);

        this.notebookFilters = this.NotebookService.getFilters();
        this.notebookFilter = this.notebookFilters[0].name;
        this.notebookOpen = false;

        this.toggleNotebook = function() {
            this.notebookOpen = !this.notebookOpen;
        };

        this.$scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
            var previousNode = args.previousNode;
            //var currentNode = args.currentNode;
            var currentNode = this.StudentDataService.getCurrentNode();
            var currentNodeId = currentNode.id;

            this.StudentDataService.updateStackHistory(currentNodeId);
            this.StudentDataService.updateVisitedNodesHistory(currentNodeId);
            this.StudentDataService.updateNodeStatuses();

            this.setLayoutState();

            this.StudentWebSocketService.sendStudentStatus();
            this.$state.go('root.vle', {nodeId:currentNodeId});

            var componentId, componentType, category, eventName, eventData, eventNodeId;
            if (previousNode != null && this.ProjectService.isGroupNode(previousNode.id)) {
                // going from group to node or group to group
                componentId = null;
                componentType = null;
                category = "Navigation";
                eventName = "nodeExited";
                eventData = {};
                eventData.nodeId = previousNode.id;
                eventNodeId = previousNode.id;
                this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }

            if (this.ProjectService.isGroupNode(currentNodeId)) {
                // save nodeEntered event if this is a group
                componentId = null;
                componentType = null;
                category = "Navigation";
                eventName = "nodeEntered";
                eventData = {};
                eventData.nodeId = currentNode.id;
                eventNodeId = currentNode.id;
                this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }
        }));

        this.$scope.$on('componentStudentDataChanged', angular.bind(this, function() {
            this.StudentDataService.updateNodeStatuses();
        }));

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

        this.themePath = this.ProjectService.getThemePath();
        var scope = this;
        // load theme module + files
        /*
        this.$ocLazyLoad.load([
            this.themePath + '/theme3.js'
        ]).then(function(){
            scope.themeLoaded = true;
            scope.setLayoutState();
            scope.updateLayout();
        });
        */
        scope.themeLoaded = true;
        scope.setLayoutState();
        scope.updateLayout();
    }

    setLayoutState() {
        var layoutState = 'nav'; // default layout state
        var node = this.StudentDataService.getCurrentNode();

        if(node) {
            var id = node.id;
            if (this.ProjectService.isApplicationNode(id)) {
                layoutState = 'node';
            } else if (this.ProjectService.isGroupNode(id)) {
                layoutState = 'nav';
            }
        }

        this.layoutState = layoutState;
    };

    updateLayout() {
        if (this.project != null) {
            this.ProjectService.getProject();
        }
    };

    showNavigation() {
        this.layoutState = 'nav';
    };

    goHome() {
        // save goHome event
        var nodeId = null;
        var componentId = null;
        var componentType = null;
        var category = "Navigation";
        var event = "goHomeButtonClicked";
        var eventData = {};
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

        this.$rootScope.$broadcast('goHome');
    };

    logOut() {
        // save logOut event
        var nodeId = null;
        var componentId = null;
        var componentType = null;
        var category = "Navigation";
        var event = "logOutButtonClicked";
        var eventData = {};
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

        this.$rootScope.$broadcast('logOut');
    };

    loadRoot() {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.ProjectService.rootNode.id);
    };

    layoutLogicStarMap(VLEState) {
        if (VLEState.state === 'initial') {
            this.showProjectDiv = true;
            this.showNodeDiv = false;
        } else if (VLEState.state === 'showNavigationClicked') {
            this.showProjectDiv = true;
            this.showNodeDiv = false;
        }
    };

    chooseTransition(transitions) {
        var transitionResult = null;
        if (transitions != null) {
            for (var t = 0; t < transitions.length; t++) {
                var transition = transitions[t];
                var toNodeId = transition.to;
                if (toNodeId != null) {
                    var toNodeNodeStatus = this.StudentDataService.getNodeStatusByNodeId(toNodeId);
                    if (toNodeNodeStatus != null && toNodeNodeStatus.isVisitable) {
                        transitionResult = transition;
                        break;
                    }
                }
            }
        }
        return transitionResult;
    };

    /**
     * The user has moved the mouse on the page
     */
    mouseMoved() {
        /*
         * tell the session service a mouse event occurred so it
         * can reset the session timeout timers
         */
        this.SessionService.mouseEventOccurred();
    };
}

VLEController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    'ConfigService',
    'NotebookService',
    'ProjectService',
    'SessionService',
    'StudentDataService',
    'StudentWebSocketService',
    '$ocLazyLoad'
];

export default VLEController;
