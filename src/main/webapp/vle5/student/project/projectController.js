define(['app'], function(app) {
    app.$controllerProvider.register('ProjectController', 
        function($scope, $state, $stateParams, ConfigService, ProjectService, StudentDataService) {
            
            $scope.$watch(function() {
                return StudentDataService.getCurrentNode();
            }, angular.bind(this, function(newCurrentNode, oldCurrentNode) {
                
                if (newCurrentNode != null) {
                    var nodeId = newCurrentNode.id;
                    
                    var wiseData = {};
                    wiseData.nodeId = nodeId;
                    
                    var postMessage = {
                        'action': 'postMoveToNodeRequest',
                        'wiseData': wiseData
                    };
                    
                    this.postMessageToProjectIFrame(postMessage);
                }
            }));
            
            $scope.$watch(function() {
                var nodeVisits = StudentDataService.getNodeVisits();
                return nodeVisits.length;
            }, angular.bind(this, function(newNodeVisits, oldNodeVisits) {
                if (newNodeVisits != null) {
                    StudentDataService.updateNodeStatuses();
                    var nodeId = StudentDataService.getCurrentNodeId();
                    
                    var wiseData = {};
                    wiseData.nodeId = nodeId;
                    wiseData.nodeStatuses = StudentDataService.getNodeStatuses();
                    
                    var postMessage = {
                        'action': 'postStudentDataRequest',
                        'wiseData': wiseData
                    };
                    
                    this.postMessageToProjectIFrame(postMessage);
                }
            }));
            
            $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
                var msg = data;
                
                var action = msg.action;
                
                if (action === 'getWISEProjectRequest') {
                    var project = ProjectService.getProject();

                    var wiseData = {};
                    wiseData.project = project;
                    wiseData.currentNodeId = StudentDataService.getCurrentNodeId();
                    wiseData.nodeStatuses = StudentDataService.getNodeStatuses();
                    wiseData.applicationNodes = ProjectService.getApplicationNodes();
                    wiseData.groupNodes = ProjectService.getGroupNodes();
                    wiseData.idToNode = ProjectService.getIdToNode();
                    
                    var postMessage = {
                        'action': 'getWISEProjectResponse',
                        'wiseData': wiseData,
                        'globalStyle': '#title {color:purple;} body {background-color:yellow}'
                    };
                    
                    this.postMessageToProjectIFrame(postMessage);
                } else if (action === 'postMoveToNodeRequest') {
                    var nodeId = msg.nodeId;
                    var mode = this.mode;
                    
                    var node = ProjectService.getNodeById(nodeId);
                    StudentDataService.setCurrentNode(node);
                    
                    var wiseData = {};
                    wiseData.nodeId = nodeId;
                    
                    var postMessage = {
                        'action': 'postMoveToNodeResponse',
                        'wiseData': wiseData
                    };
                    
                    this.postMessageToProjectIFrame(postMessage);
                    //this.loadNode(nodeId, mode);
                    //this.updateLayout();
                }
            }));
            
            this.postMessageToProjectIFrame = function(message, callback) {
                $scope.vleController.postMessageToIFrame('projectIFrame', message, callback);
            };
            
            var knownNavigationApplications = ConfigService.getConfigParam('navigationApplications');
            var projectNavigationApplications = ProjectService.getNavigationApplications();
            if (projectNavigationApplications != null && projectNavigationApplications.length > 0) {
                var defaultNavigationApplication = projectNavigationApplications[0];
                for (var i = 0; i < knownNavigationApplications.length; i++) {
                    var knownNavigationApplication = knownNavigationApplications[i];
                    if (knownNavigationApplication.name === defaultNavigationApplication) {
                        var navigationApplicationURL = knownNavigationApplication.url + '?mode=' + $scope.vleController.mode;
                        this.projectIFrameSrc = navigationApplicationURL;
                        break;
                    }
                }            
            }
        });
});