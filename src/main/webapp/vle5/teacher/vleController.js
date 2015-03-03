define(['app'], 
        function(app) {
    app.$controllerProvider.register('VLEController', 
            function($scope, ConfigService, NodeApplicationService, ProjectService, NodeService, StudentDataService) {
        this.mode = 'author';
        this.modes = ['author', 'classroomManager', 'studentManager'];
        this.globalTools = ['previewProject', 'home', 'sign out'];
        this.currentNode = null;
        this.callbackListeners = [];
        this.wiseMessageId = 0;

        this.modeButtonClicked = function(mode) {
            this.mode = mode;
            if (this.currentNode != null) {
                var nodeId = this.currentNode.id;
                this.exitNode(nodeId, mode);
            } else {
                this.loadNode(nodeId, mode);
            }
        }
        
        this.exitNode = function(nodeId, mode) {
            var postMessage = {
                    'action': 'nodeOnExitRequest'
                };
            this.postMessageToNodeIFrame(postMessage, angular.bind(this, function(callbackArgs) {
                this.loadNode(callbackArgs.nodeId, callbackArgs.mode);
            }, {nodeId: nodeId, mode: mode}));
        };
        
        this.globalToolButtonClicked = function(globalToolName) {
            if (globalToolName === 'previewStep') {
                var mode = 'student';
                var nodeId = this.currentNode.id;
                this.loadNode(nodeId, mode);
            } else if (globalToolName === 'authorStep') {
                var mode = 'author';
                var nodeId = this.currentNode.id;
                this.loadNode(nodeId, mode);
                $('#projectDiv').hide();
                $('#nodeDiv').show();
            } else if (globalToolName === 'previewProject') {
                window.open('student.html');
            } else if (globalToolName === 'advancedAuthorProject') {
                $('#navigationAdvancedDiv').show();
                $('#navigationDiv').hide();
                $('#nodeDiv').hide();
                
                $('#projectContentJSON').html(JSON.stringify(this.project, null, 4));
                $('#projectContentJSON').keyup(function() {
                    this.projectContentIsDirty = true;
                    $('#saveProjectContentButton').attr('disabled', false);
                });
                
                $('#saveProjectContentButton').click(function() {
                    var projectContentJSON = $('#projectContentJSON').val();
                    
                    // TODO: implement http POST to authoringToolEndPointURL 
                    $('#saveProjectContentButton').attr('disabled', true);
                    this.projectContentIsDirty = false;

                    /*
                    var callback = function() {
                        $('#saveProjectContentButton').attr('disabled', true);
                        this.projectContentIsDirty = false;
                    };
                    var callbackArgs = {};
                    saveProjectContent(projectContentJSON, callback, callbackArgs);
                    */
                });
                
                
            } else if (globalToolName === 'authorProject') {
                $('#projectDiv').show();
                $('#navigationDiv').show();
                $('#navigationAdvancedDiv').hide();
                $('#nodeDiv').hide();
            }
        }
        var wiseBaseURL = ConfigService.getConfigParam('wiseBaseURL');
        
        $scope.$on('$messageIncoming', angular.bind(this, function(event, data) {
            var msg = data;
            console.log('in teacher vle controller, received message:'+JSON.stringify(msg));
            
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
            var wiseMessageId = msg.wiseMessageId;
            if (wiseMessageId != null) {
                for (var i = 0; i < this.callbackListeners.length; i++) {
                    var callbackListener = this.callbackListeners[i];
                    if (callbackListener && callbackListener.wiseMessageId === wiseMessageId) {
                        callbackListener.callback(callbackListener.callbackArgs);
                    }
                }
            }
        
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
                        'wiseData': wiseData,
                        'viewType': 'teacher'
                    };
                    this.postMessageToNodeIFrame(postMessage);
                }));

            } else if (action === 'postWISENodeContentRequest') {
                var nodeMessageId = msg.nodeMessageId;
                var postMessage = {
                        'action': 'postWISENodeContentResponse',
                        'nodeMessageId': nodeMessageId
                    };
                    this.postMessageToNodeIFrame(postMessage);

            } else if (action === 'postWISEProjectContentRequest') {
                var navMessageId = msg.navMessageId;
                var postMessage = {
                        'action': 'postWISEProjectContentResponse',
                        'navMessageId': navMessageId
                    };
                    this.postMessageToNavigationIFrame(postMessage);

            } else if (action === 'getWISEProjectRequest') {
                var project = ProjectService.project;
                this.project = project;

                var wiseData = {};
                wiseData.project = project;
                
                var postMessage = {
                    'viewType': 'studentNavigation',
                    'action': 'getWISEProjectResponse',
                    'wiseData': wiseData,
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
                $('#projectDiv').hide();
                $('#nodeDiv').show();

                var nodeId = msg.nodeId;
                var mode = this.mode;
                
                var postMessage = {
                        'viewType': 'student',
                        'action': 'getWISEStudentDataRequest',
                        'saveTriggeredBy': 'wiseOnStepExit',
                        'callbackArgs': {'nodeId':nodeId}
                    };
                    
                    if (this.currentNode != null) {
                        this.postMessageToNodeIFrame(postMessage, angular.bind(this, function(callbackArgs) {
                            this.loadNode(callbackArgs.nodeId, callbackArgs.mode);
                        }, {nodeId: nodeId, mode: mode}));
                    } else {
                        this.loadNode(nodeId, mode);
                    }
            } else if (action === 'postNodeStatusRequest') {
                var nodeStatus = msg.nodeStatus;
                var nodeId = msg.nodeId;
                
                var currentNodeId = this.currentNode.id;
                
                if (nodeId === currentNodeId) {
                    var isLoadingComplete = nodeStatus.isLoadingComplete;
                    
                    if (isLoadingComplete) {
                        /*
                        setInterval(angular.bind(this, function() {
                            console.log('hello');
                            
                            var postMessage = {
                                'viewType': 'teacher',
                                'action': 'getWISEStudentDataRequest',
                                'saveTriggeredBy': 'wiseIntermediate'
                            };
                            
                            this.postMessageToNodeIFrame(postMessage);
                        }), 5000);
                        */
                    }
                }
                
            }
        }));
        
        $scope.sendMessage = function() {
            this.$emit('$messageOutgoing', angular.toJson({"response": "hi"}))
        };
       
        this.loadNode = function(nodeId, mode) {
            
            var node = ProjectService.getNodeByNodeId(nodeId);
            
            if(node !== null) {
                this.currentNode = node;
                var nodeType = node.type
                var nodeIFrameSrc = NodeApplicationService.getNodeURL(nodeType) + '?nodeId=' + nodeId + '&mode=' + mode;
                $('#nodeIFrame').attr('src', nodeIFrameSrc);
                $('#navigation').hide();
                $('#nodeIFrame').show();
            };

            /*
             * wiseOnExit
             * wiseIntermediate
             * node
             */
        };
        
        this.postMessageToIFrame = function(iFrameId, message, callback, callbackArgs) {
            message.wiseMessageId = this.wiseMessageId;
            if (callback != null) {
                this.callbackListeners.push({wiseMessageId:this.wiseMessageId, callback:callback, callbackArgs:callbackArgs});
            }
            var iFrame = $('#' + iFrameId);
            iFrame[0].contentWindow.postMessage(message, '*');
            
            this.wiseMessageId++;
        };
        
        this.postMessageToNodeIFrame = function(message, callback, callbackArgs) {
            this.postMessageToIFrame('nodeIFrame', message, callback, callbackArgs);
        };
        
        this.postMessageToNavigationIFrame = function(message, callback, callbackArgs) {
            this.postMessageToIFrame('navigationIFrame', message, callback, callbackArgs);
        };

        var knownNavigationApplications = ConfigService.getConfigParam('navigationApplications');
        var projectNavigationApplications = ProjectService.project.navigationApplications;
        var defaultNavigationApplication = projectNavigationApplications[0];
        for (var i = 0; i < knownNavigationApplications.length; i++) {
            var knownNavigationApplication = knownNavigationApplications[i];
            if (knownNavigationApplication.name === defaultNavigationApplication) {
                var navigationApplicationURL = knownNavigationApplication.url + '?mode=' + this.mode;
                $('#navigationIFrame').attr('src', navigationApplicationURL);
            }
        }
    });
});