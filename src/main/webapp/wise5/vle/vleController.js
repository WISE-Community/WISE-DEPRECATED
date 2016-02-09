//import theme from './themes/default/theme2.js';
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VLEController = function () {
    function VLEController($scope, $rootScope, $state, ConfigService, NotebookService, ProjectService, SessionService, StudentDataService, StudentWebSocketService, $ocLazyLoad) {
        _classCallCheck(this, VLEController);

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

        this.projectStyle = this.ProjectService.getStyle();
        this.projectName = this.ProjectService.getName();

        this.notebookFilters = this.NotebookService.getFilters();
        this.notebookFilter = this.notebookFilters[0].name;
        this.notebookOpen = false;

        // get the total score for the workgroup
        this.totalScore = this.StudentDataService.getTotalScore();

        // get the max score for the project
        this.maxScore = this.ProjectService.getMaxScore();

        this.toggleNotebook = function () {
            this.notebookOpen = !this.notebookOpen;
        };

        this.$scope.$on('currentNodeChanged', angular.bind(this, function (event, args) {
            var previousNode = args.previousNode;
            //var currentNode = args.currentNode;
            var currentNode = this.StudentDataService.getCurrentNode();
            var currentNodeId = currentNode.id;

            this.StudentDataService.updateStackHistory(currentNodeId);
            this.StudentDataService.updateVisitedNodesHistory(currentNodeId);
            this.StudentDataService.updateNodeStatuses();

            this.setLayoutState();

            this.StudentWebSocketService.sendStudentStatus();
            this.$state.go('root.vle', { nodeId: currentNodeId });

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

        this.$scope.$on('componentStudentDataChanged', angular.bind(this, function () {
            this.StudentDataService.updateNodeStatuses();
        }));

        // Make sure if we drop something on the page we don't navigate away
        // https://developer.mozilla.org/En/DragDrop/Drag_Operations#drop
        $(document.body).on('dragover', function (e) {
            e.preventDefault();
            return false;
        });

        $(document.body).on('drop', function (e) {
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

        this.StudentDataService.setCurrentNodeByNodeId(nodeId);
    }

    _createClass(VLEController, [{
        key: 'setLayoutState',
        value: function setLayoutState() {
            var layoutState = 'nav'; // default layout state
            var node = this.StudentDataService.getCurrentNode();

            if (node) {
                var id = node.id;
                if (this.ProjectService.isApplicationNode(id)) {
                    layoutState = 'node';
                } else if (this.ProjectService.isGroupNode(id)) {
                    layoutState = 'nav';
                }
            }

            this.layoutState = layoutState;
        }
    }, {
        key: 'updateLayout',
        value: function updateLayout() {
            if (this.project != null) {
                this.ProjectService.getProject();
            }
        }
    }, {
        key: 'showNavigation',
        value: function showNavigation() {
            this.layoutState = 'nav';
        }
    }, {
        key: 'goHome',
        value: function goHome() {
            // save goHome event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "goHomeButtonClicked";
            var eventData = {};
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            this.$rootScope.$broadcast('goHome');
        }
    }, {
        key: 'logOut',
        value: function logOut() {
            // save logOut event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "logOutButtonClicked";
            var eventData = {};
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            this.$rootScope.$broadcast('logOut');
        }
    }, {
        key: 'loadRoot',
        value: function loadRoot() {
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.ProjectService.rootNode.id);
        }
    }, {
        key: 'layoutLogicStarMap',
        value: function layoutLogicStarMap(VLEState) {
            if (VLEState.state === 'initial') {
                this.showProjectDiv = true;
                this.showNodeDiv = false;
            } else if (VLEState.state === 'showNavigationClicked') {
                this.showProjectDiv = true;
                this.showNodeDiv = false;
            }
        }
    }, {
        key: 'chooseTransition',
        value: function chooseTransition(transitions) {
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
        }
    }, {
        key: 'mouseMoved',

        /**
         * The user has moved the mouse on the page
         */
        value: function mouseMoved() {
            /*
             * tell the session service a mouse event occurred so it
             * can reset the session timeout timers
             */
            this.SessionService.mouseEventOccurred();
        }
    }]);

    return VLEController;
}();

VLEController.$inject = ['$scope', '$rootScope', '$state', 'ConfigService', 'NotebookService', 'ProjectService', 'SessionService', 'StudentDataService', 'StudentWebSocketService', '$ocLazyLoad'];

exports.default = VLEController;
//# sourceMappingURL=vleController.js.map