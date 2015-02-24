define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope, ConfigService, NodeApplicationService, ProjectService, NodeService, StudentDataService) {
        this.globalTools = ['hideNavigation', 'showNavigation', 'next', 'prev', 'portfolio', 'home', 'sign out'];
        this.currentNode = null;

        this.receiveMessage = angular.bind(this, function(event) {
            // Do we trust the sender of this message?  (might be
            // different from what we originally opened, for example).
            //if (event.origin !== 'http://example.org')
            //    return;
             
        });
        
        this.globalToolButtonClicked = function(globalToolName) {
            if (globalToolName === 'hideNavigation') {
                $('#navigation').hide();
                $('#nodeIFrame').show();
            } else if (globalToolName === 'showNavigation') {
                $('#navigation').show();
                $('#nodeIFrame').hide();
            }
        }
        var wiseBaseURL = ConfigService.getConfigParam('wiseBaseURL');
        
        $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
            console.log('received message in viewMapController.js');
            var msg = data;
            console.log('in view map controller, received message:'+JSON.stringify(msg));
            
            //getWISEStudentDataRequest
            //getWISEStudentDataResponse
            //postWISEStudentDataRequest
            //postWISEStudentDataResponse
            
            //getWISENodeContentRequest
            //getWISENodeContentResponse
            //postWISENodeContentRequest
            //postWISENodeContentResponse
            
            //getWISEDataRequest
            //getWISEDataResponse
            //postWISEDataRequest
            //postWISEDataResponse
            
            var action = msg.action;
            
            if (action === 'getWISEDataRequest') {
                var nodeId = msg.nodeId;
                var loadingParams = msg.loadingParams;
                
                var studentData = null;
                
                if (loadingParams && loadingParams.loadAllNodeStates) {
                    studentData = StudentDataService.getAllNodeStatesByNodeId(nodeId);
                } else {
                    studentData = [StudentDataService.getLatestNodeStateByNodeId(nodeId)];
                }
                
                var nodeSrc = ProjectService.getNodeSrcByNodeId(nodeId);
                
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
                
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    var postMessage = {
                        'action': 'getWISEDataResponse',
                        'messageType': 'wiseData',
                        'viewType': 'student',
                        'content': nodeContent,
                        'globalStyle': '#title {color:purple;} body {background-color:yellow}',
                        'studentData': studentData
                    };
                    this.postMessageToNodeIFrame(postMessage);
                }));

            } else if (action === 'requestNavigationStateFromWISE') {
                var project = ProjectService.project;

                var postMessage = {
                    'viewType': 'studentNavigation',
                    'project': project,
                    'globalStyle': '#title {color:purple;} body {background-color:yellow}'
                };
                
                this.postMessageToNavigationIFrame(postMessage);
            } else if (action === 'postWISEStudentDataRequest') {
                //var nodeIFrame = document.getElementById('nodeIFrame');
                //nodeIFrame.contentWindow
                //    .postMessage({'viewType':'student','content':null,'globalStyle':null,'stepState':msg}, 
                //         '*');
                
                var nodeId = msg.nodeId;
                var wiseData = msg.wiseData;
                var studentData = wiseData.studentData;
                
                StudentDataService.addNodeStateToLatestNodeVisit(nodeId, studentData);
                
                var postMessage = {
                    'action': 'postWISEStudentDataResponse',
                    'viewType': 'student'
                }
                
                this.postMessageToNodeIFrame(postMessage);
            } else if (action === 'getWISEStudentDataResponse') {
                var nodeId = msg.nodeId;
                var wiseData = msg.wiseData;
                var studentData = wiseData.studentData;
                
                StudentDataService.addNodeStateToLatestNodeVisit(nodeId, studentData);
            } else if (action === 'navigation_moveToNode') {
                
                /*
                 * wiseOnExit
                 * wiseIntermediate
                 * node
                 */
                
                var postMessage = {
                    'viewType': 'student',
                    'action': 'getWISEStudentDataRequest',
                    'saveTriggeredBy': 'wiseOnStepExit'
                };
                
                this.postMessageToNodeIFrame(postMessage);
                
                var nodeId = msg.nodeId;
                
                var node = ProjectService.getNodeByNodeId(nodeId);
                
                if(node !== null) {
                    this.currentNode = node;
                    var nodeType = node.type
                    var nodeIFrameSrc = NodeApplicationService.getNodeURL(nodeType) + '?nodeId=' + nodeId;
                    $('#nodeIFrame').attr('src', nodeIFrameSrc);
                    $('#navigation').hide();
                    $('#nodeIFrame').show();
                }
            } else if (action === 'postNodeStatusRequest') {
                var nodeStatus = msg.nodeStatus;
                var nodeId = msg.nodeId;
                
                var currentNodeId = this.currentNode.id;
                
                if (nodeId === currentNodeId) {
                    var isLoadingComplete = nodeStatus.isLoadingComplete;
                    
                    if (isLoadingComplete) {
                        setInterval(angular.bind(this, function() {
                            console.log('hello');
                            
                            var postMessage = {
                                'viewType': 'student',
                                'action': 'getWISEStudentDataRequest',
                                'saveTriggeredBy': 'wiseIntermediate'
                            };
                            
                            this.postMessageToNodeIFrame(postMessage);
                        }), 5000);
                    }
                }
                
            }
        }));
        
        $scope.sendMessage = function() {
            this.$emit('$messageOutgoing', angular.toJson({"response": "hi"}))
        };
        
        this.postMessageToIFrame = function(iFrameId, message) {
            var iFrame = $('#' + iFrameId);
            iFrame[0].contentWindow.postMessage(message, '*');
        };
        
        this.postMessageToNodeIFrame = function(message) {
            this.postMessageToIFrame('nodeIFrame', message);
        };
        
        this.postMessageToNavigationIFrame = function(message) {
            this.postMessageToIFrame('navigationIFrame', message);
        };

        var knownNavigationApplications = ConfigService.getConfigParam('navigationApplications');
        var projectNavigationApplications = ProjectService.project.navigationApplications;
        var defaultNavigationApplication = projectNavigationApplications[0];
        for (var i = 0; i < knownNavigationApplications.length; i++) {
            var knownNavigationApplication = knownNavigationApplications[i];
            if (knownNavigationApplication.name === defaultNavigationApplication) {
                var navigationApplicationURL = knownNavigationApplication.url;
                $('#navigation').html('<iframe id="navigationIFrame" ' + 
                    'src="' + navigationApplicationURL + '"></iframe>');
            }
        }
    });
});