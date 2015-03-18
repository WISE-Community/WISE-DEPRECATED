define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, $state, $stateParams, NodeApplicationService, NodeService, ProjectService, StudentDataService) {
            
            $scope.$watch(function() {
                return StudentDataService.getCurrentNode();
            }, angular.bind(this, function(newCurrentNode, oldCurrentNode) {
                if (newCurrentNode != null) {
                    var nodeId = newCurrentNode.id;
                    var mode = $scope.vleController.mode;
                    this.loadNode(nodeId, mode);
                }
            }));
            
            this.loadNode = function(nodeId, mode) {
                /*
                 * wiseOnExit
                 * wiseIntermediate
                 * node
                 */
                
                var postMessage = {
                    'action': 'getWISEStudentDataRequest',
                    'saveTriggeredBy': 'wiseOnStepExit',
                    'callbackArgs': {'nodeId':nodeId}
                };
                
                var moveToNode = angular.bind(this, function() {
                    var node = ProjectService.getNodeById(nodeId);
                    
                    if(node !== null) {
                        this.currentNode = node;
                        var applicationType = node.applicationType
                        var nodeIFrameSrc = NodeApplicationService.getNodeURL(applicationType) + '?nodeId=' + nodeId + '&mode=' + $scope.vleController.mode;
                        this.nodeIFrameSrc = nodeIFrameSrc;
                        
                        /*
                         * TODO: set a timeout or something to make sure the step has loaded
                         * or handle it if the step does not load
                         */
                    };
                });
                if (this.currentNode != null) {
                    this.postMessageToNodeIFrame(postMessage, moveToNode);
                } else {
                    moveToNode();
                }
                
            };
            
            $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
                var msg = data;
                //console.log('############### in nodeController, received message:'+JSON.stringify(msg));
                
                var action = msg.action;
                
                if (action === 'getWISEDataRequest') {
                    var nodeId = msg.nodeId;
                    var loadingParams = msg.loadingParams;
                    
                    var studentData = null;
                    
                    if (loadingParams && loadingParams.loadAllNodeStates) {
                        studentData = StudentDataService.getAllNodeStatesByNodeId(nodeId);
                    } else if (loadingParams && loadingParams.loadLatestState) {
                        studentData = [StudentDataService.getLatestNodeStateByNodeId(nodeId)];
                    }
                    
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(nodeId);
                    
                    var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
                    
                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                        var wiseData = {};
                        wiseData.nodeContent = nodeContent;
                        wiseData.studentData = studentData;
                        wiseData.globalStyle = '#title {color:purple;} body {background-color:yellow}';
                        var postMessage = {
                            'action': 'getWISEDataResponse',
                            'wiseData': wiseData
                        };
                        this.postMessageToNodeIFrame(postMessage);
                    }));
                } else if (action === 'postWISEStudentDataRequest') {
                    var nodeId = msg.nodeId;
                    var wiseData = msg.wiseData;
                    var studentData = wiseData.studentData;
                    
                    StudentDataService.addNodeStateToLatestNodeVisit(nodeId, studentData);
                    
                    var postMessage = {
                        'action': 'postWISEStudentDataResponse'
                    }
                    
                    this.postMessageToNodeIFrame(postMessage);
                } else if (action === 'getWISEStudentDataResponse') {
                    var nodeId = msg.nodeId;
                    var wiseData = msg.wiseData;
                    var studentData = wiseData.studentData;
                    
                    StudentDataService.addNodeStateToLatestNodeVisit(nodeId, studentData);
                }
            }));
            
            this.postMessageToNodeIFrame = function(message, callback) {
                $scope.vleController.postMessageToIFrame('nodeIFrame', message, callback);
            };
        });
});