define(['configService', 'projectService'], function(configService, projectService) {

    var service = ['$http', 
                   '$injector', 
                   '$q', 
                   '$rootScope', 
                   'ConfigService', 
                   'ProjectService',
                       function($http, 
                               $injector, 
                               $q, 
                               $rootScope, 
                               ConfigService, 
                               ProjectService) {
        var serviceObject = {};
        
        serviceObject.studentData = null;
        serviceObject.stackHistory = null;  // array of node id's
        serviceObject.visitedNodesHistory = null;
        serviceObject.nodeStatuses = null;
        
        serviceObject.currentNode = null;
        
        serviceObject.getCurrentNode = function() {
            return this.currentNode;
        };
        
        serviceObject.getCurrentNodeId = function() {
            var currentNodeId = null;
            var currentNode = this.currentNode;
            
            if (currentNode != null) {
                currentNodeId = currentNode.id;
            }
            
            return currentNodeId;
        };
        /*
        serviceObject.setCurrentNodeByNodeId = function(nodeId) {
            if (nodeId != null) {
                var node = ProjectService.getNodeById(nodeId);
                
                this.setCurrentNode(node);
            }
        };
        
        serviceObject.setCurrentNode = function(node) {
            var previousCurrentNode = this.currentNode;
            
            if (previousCurrentNode !== node) {
                // the current node is about to change
                $rootScope.$broadcast('nodeOnExit', {nodeToExit: previousCurrentNode});
                
                this.currentNode = node;
                
                $rootScope.$broadcast('currentNodeChanged', {previousNode: previousCurrentNode, currentNode: this.currentNode});
            }
        };
        */
        serviceObject.getCurrentParentNode = function() {
            var currentNode = this.getCurrentNode();
            
            if (currentNode != null) {
                
            }
        };
        
        serviceObject.updateCurrentNode = function(latestNodeVisit) {
            if (latestNodeVisit != null) {
                nodeId = latestNodeVisit.nodeId;
                
                var node = ProjectService.getNodeById(nodeId);
                this.setCurrentNode(node);
            }
        };
        
        serviceObject.getNodeVisits = function() {
            var nodeVisits = null;
            var studentData = this.studentData;
            
            if (studentData != null) {
                nodeVisits = studentData.nodeVisits;
            }
            
            return nodeVisits;
        };
        
        serviceObject.getNodeVisitAtIndex = function(index) {
            var nodeVisitResult = null;
            var nodeVisits = this.getNodeVisits();
            
            if (index < 0) {
                index = nodeVisits.length + index;
            }
            
            if (nodeVisits != null && nodeVisits.length > 0) {
                nodeVisitResult = nodeVisits[index];
            }
            return nodeVisitResult;
        };
        
        serviceObject.getLatestNodeVisit = function() {
            return this.getNodeVisitAtIndex(-1);
        };
        
        /**
         * Retrieve the student data from the server
         */
        serviceObject.retrieveStudentData = function() {
            
            // get the mode
            var mode = ConfigService.getConfigParam('mode');
            
            if (mode === 'preview') {
                // we are previewing the project
                
                // initialize dummy student data
                this.studentData = {};
                this.studentData.nodeVisits = [];
                this.studentData.userName = 'Preview Student';
                this.studentData.userId = '0';
                
                // populate the student history
                this.populateHistories(this.studentData.nodeVisits);
                
                // update the node statuses
                this.updateNodeStatuses();
            } else {
                // we are in a run
                
                // get the url to get the student data
                var studentDataURL = ConfigService.getConfigParam('studentDataURL');
                
                var httpParams = {};
                httpParams.method = 'GET';
                httpParams.url = studentDataURL;
                
                // set the workgroup id and run id
                var params = {};
                params.userId = ConfigService.getWorkgroupId();
                params.runId = ConfigService.getRunId();
                httpParams.params = params;
                
                // make the request for the student data
                return $http(httpParams).then(angular.bind(this, function(result) {
                    var vleStates = result.data.vleStates;
                    if (vleStates != null) {
                        
                        // obtain the student data
                        this.studentData = vleStates[0];
                        
                        // get the node visits
                        var nodeVisits = this.getNodeVisits();
                        var latestNodeVisit = this.getLatestNodeVisit();
                        
                        // load the student planning nodes
                        this.loadStudentNodes();
                        
                        // populate the student history
                        this.populateHistories(nodeVisits);
                        
                        // update the node statuses
                        this.updateNodeStatuses();
                    }
                    return this.studentData;
                }));
            }
        };
        
        /**
         * Save the node visit to the server
         * @param nodeVisit the node visit to save to the server
         */
        serviceObject.saveNodeVisitToServer = function(nodeVisit) {
            
            // get the mode
            var mode = ConfigService.getConfigParam('mode');
            
            if (mode === 'preview') {
                // we are in preview mode
                
                var deferred = $q.defer();
                
                // create a fake node visit
                var date = new Date();
                
                nodeVisit.id = 1; // TODO: update this id with a counter
                nodeVisit.visitPostTime = date.getTime();
                
                deferred.resolve(nodeVisit);
                
                return deferred.promise;
            } else {
                // we are in a run
                
                // get the student data url used to save the student data
                var studentDataURL = ConfigService.getConfigParam('studentDataURL');
                
                var httpConfig = {};
                httpConfig.method = 'POST';
                httpConfig.url = studentDataURL;
                httpConfig.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
                
                // set the params for the request
                var params = {};
                if (nodeVisit != null && nodeVisit.id != null) {
                    params.id = nodeVisit.id;
                }
                params.userId = ConfigService.getWorkgroupId();
                params.runId = ConfigService.getRunId();
                params.periodId = ConfigService.getPeriodId();
                params.data = angular.toJson(nodeVisit);
                params.nodeVisit = nodeVisit;
                httpConfig.data = $.param(params);
                
                // make the request to save the student data
                return $http(httpConfig).then(angular.bind(this, function(nodeVisit, result) {
                    
                    // get the response from saving the student data
                    var postNodeVisitResult = result.data;
                    
                    // get the node visit post time
                    var visitPostTime = postNodeVisitResult.visitPostTime;
                    
                    // get the node visit id
                    var nodeVisitId = postNodeVisitResult.id;
                    
                    // save the values to our local node visit
                    nodeVisit.id = nodeVisitId;
                    nodeVisit.visitPostTime = visitPostTime;
                    
                    $rootScope.$broadcast('nodeVisitSavedToServer', {nodeVisit: nodeVisit});
                    
                    return nodeVisit;
                }, nodeVisit));
            }
        };
        
        serviceObject.loadStudentNodes = function() {
            var nodes = ProjectService.getApplicationNodes();
            
            if (nodes != null) {
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    if (node != null) {
                        if (node.type === 'Planning') {
                            var nodeId = node.id;
                            
                            var latestNodeState = this.getLatestNodeStateByNodeId(nodeId);
                            
                            if (latestNodeState != null) {
                                var latestStateStudentNodes = latestNodeState.studentNodes;
                                var latestTransitions = latestNodeState.studentTransition;
                                
                                ProjectService.loadNodes(latestStateStudentNodes);
                                ProjectService.loadTransitions(latestTransitions);
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Get the latest node visit that has non-null visitStartTime and
         * non-null visitEndTime
         * @return the latest NODE_VISIT that has a visitStartTime and visitEndTime
         */
        serviceObject.getLatestCompletedNodeVisit = function() {
            var latestCompletedVisit = null;
            
            var nodeVisits = this.getNodeVisits();

            //loop through the node visits backwards
            for (var n = nodeVisits.length - 1; n >= 0; n--) {
                //get a node visit
                var nodeVisit = nodeVisits[n];

                //check that visitStartTime and visitEndTime are not null
                if (nodeVisit.visitStartTime != null && nodeVisit.visitEndTime != null) {
                    //we found a node visit with visitStartTime and visitEndTime
                    latestCompletedVisit = nodeVisit;

                    //break out of the for loop since we found what a node visit
                    break;
                }
            }

            return latestCompletedVisit;
        };
        
        serviceObject.getNodeStatuses = function() {
            return this.nodeStatuses;
        };
        
        serviceObject.getNodeStatusByNodeId = function(nodeId) {
            var result = null;
            
            if (nodeId != null && this.nodeStatuses != null) {
                for (var n = 0; n < this.nodeStatuses.length; n++) {
                    var nodeStatus = this.nodeStatuses[n];
                    if(nodeStatus != null && nodeStatus.nodeId === nodeId) {
                        result = nodeStatus;
                        break;
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.updateNodeStatuses = function() {
            this.nodeStatuses = [];
            var nodes = ProjectService.getNodes();
            
            if (nodes != null) {
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    var nodeStatusesByNodePromise = this.updateNodeStatusesByNode(node);
                    nodeStatusesByNodePromise.then(angular.bind(this, function(nodeStatusesByNode) {
                        this.nodeStatuses.push(nodeStatusesByNode);
                    }));
                }
            }
            
            $rootScope.$broadcast('nodeStatusesChanged');
        };
        
        serviceObject.updateNodeStatusesByNode = function(node) {
            return $q(angular.bind(this, function(resolve, reject) {
                
            var nodeStatus = null;
            var allPromises = [];
            
            if (node != null) {
                var nodeId = node.id;
                
                nodeStatus = {};
                nodeStatus.nodeId = nodeId;
                nodeStatus.isVisitable = false;
                
                // get the constraints that affect this node
                var constraintsForNode = ProjectService.getConstraintsForNode(node);
                
                if (constraintsForNode == null || constraintsForNode.length == 0) {
                    // this node does not have any constraints so it is clickable
                    nodeStatus.isVisitable = true;
                } else {
                    
                    // loop through all the constraints that affect this node
                    for (var c = 0; c < constraintsForNode.length; c++) {
                        var constraintForNode = constraintsForNode[c];
                        
                        if (constraintForNode != null) {
                            var constraintLogic = constraintForNode.constraintLogic;
                            
                            if (constraintLogic == 'guidedNavigation') {
                                if (this.isNodeVisited(nodeId)) {
                                    // the node has been visited before so it should be clickable
                                    nodeStatus.isVisitable = true;
                                } else {
                                    /*
                                     * the node has not been visited before so we will determine
                                     * if the node is clickable by looking at the transitions
                                     */
                                    var currentNode = this.currentNode;
                                    
                                    if (currentNode != null) {
                                        // there is a current node
                                        var currentNodeId = currentNode.id;
                                        
                                        // get the transitions from the current node
                                        var transitions = ProjectService.getTransitionsByFromNodeId(currentNodeId);
                                        
                                        if (transitions != null) {
                                            
                                            // get the transitions from the current node to the node status node
                                            var transitionsToNodeId = ProjectService.getTransitionsByFromAndToNodeId(currentNodeId, nodeId);
                                            
                                            if (transitionsToNodeId != null && transitionsToNodeId.length > 0) {
                                                // there is a transition between the current node and the node status node
                                                
                                                // check if the current node has branches
                                                
                                                if (transitions.length > 1) {
                                                    // the current node has branches so the node status node is not clickable
                                                    nodeStatus.isVisitable |= false;
                                                } else {
                                                    // the current node does not have branches so the node status node is clickable
                                                    nodeStatus.isVisitable = true;
                                                }
                                            } else {
                                                /*
                                                 * there is no transition between the current node and the node status node
                                                 * so the node we will set the node to be not clickable
                                                 */
                                                nodeStatus.isVisitable |= false;
                                            }
                                        }
                                    } else {
                                        // there is no current node because the student has just started the project
                                    }
                                    
                                    if (ProjectService.isStartNode(node)) {
                                        /*
                                         * the node is the start node of the project or a start node of a group
                                         * so we will make it clickable
                                         */
                                        nodeStatus.isVisitable = true;
                                    }
                                }
                            } else if (constraintLogic === 'transition') {
                                var criteria = constraintForNode.criteria;
                                if (criteria != null && criteria.length > 0) {
                                    var firstCriteria = criteria[0];
                                    var criteriaNodeId = firstCriteria.nodeId;
                                    
                                    var nodeVisits = this.getNodeVisitsByNodeId(criteriaNodeId);
                                    if (nodeVisits != null && nodeVisits.length > 0) {
                                        var functionName = firstCriteria.functionName;
                                        var functionParams = firstCriteria.functionParams;
                                        functionParams.nodeVisits = nodeVisits;
                                        
                                        var result = null;
                                        
                                        // get the node type
                                        var nodeType = node.type;
                                        
                                        // get the service for the node type
                                        var service = $injector.get(nodeType + 'Service');
                                        
                                        if (service != null) {
                                            
                                            // call the function in the service
                                            result = service.callFunction(functionName, functionParams);
                                        }
                                        
                                        if (result) {
                                            nodeStatus.isVisitable = true;
                                        }
                                    }
                                }
                            } else if (constraintLogic === 'lockAfterSubmit') {
                                var targetId = constraintForNode.targetId;
                                var nodeVisits = this.getNodeVisitsByNodeId(targetId);
                                
                                if (nodeId === targetId) {
                                    var isWorkSubmitted = NodeService.isWorkSubmitted(nodeVisits);
                                    
                                    if (isWorkSubmitted) {
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $q.all(allPromises).then(function() {
                resolve(nodeStatus);
            })
            }));
        };

        serviceObject.populateHistories = function(nodeVisits) {
            if (nodeVisits != null) {
                this.stackHistory = [];
                this.visitedNodesHistory = [];
                
                for (var i = 0; i < nodeVisits.length; i++) {
                    var nodeVisit = nodeVisits[i];
                    var nodeVisitNodeId = nodeVisit.nodeId;
                    this.updateStackHistory(nodeVisitNodeId);
                    this.updateVisitedNodesHistory(nodeVisitNodeId);
                }
            }
        };
        
        serviceObject.getStackHistoryAtIndex = function(index) {
            if (index < 0) {
                index = this.stackHistory.length + index;
            }
            var stackHistoryResult = null;
            if (this.stackHistory != null && this.stackHistory.length > 0) {
                stackHistoryResult = this.stackHistory[index];
            }
            return stackHistoryResult;
        };
        
        serviceObject.getStackHistory = function() {
            return this.stackHistory;
        };
        
        serviceObject.updateStackHistory = function(nodeId) {
            var indexOfNodeId = this.stackHistory.indexOf(nodeId);
            if (indexOfNodeId === -1) {
                this.stackHistory.push(nodeId);
            } else {
                this.stackHistory.splice(indexOfNodeId + 1, this.stackHistory.length);
            }
        };
        
        serviceObject.updateVisitedNodesHistory = function(nodeId) {
            var indexOfNodeId = this.visitedNodesHistory.indexOf(nodeId);
            if (indexOfNodeId === -1) {
                this.visitedNodesHistory.push(nodeId);
            }
        };
        
        serviceObject.getVisitedNodesHistory = function() {
            return this.visitedNodesHistory;
        };
        
        serviceObject.isNodeVisited = function(nodeId) {
            var result = false;
            var visitedNodesHistory = this.visitedNodesHistory;
            
            if (visitedNodesHistory != null) {
                var indexOfNodeId = visitedNodesHistory.indexOf(nodeId);
                
                if (indexOfNodeId !== -1) {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.getNodeVisits = function() {
            return this.studentData.nodeVisits;
        };
        
        serviceObject.addNodeVisit = function(nodeVisit) {
            var nodeVisits = this.getNodeVisits();
            
            if (nodeVisits !== null) {
                nodeVisits.push(nodeVisit);
                
                $rootScope.$broadcast('studentDataChanged');
            }
            
            return nodeVisit;
        };
        
        serviceObject.createNodeVisit = function(nodeId) {
            /*
             *         {
            "visitPostTime": 1424728225000,
            "visitStartTime": 1424728201000,
            "hintStates": [],
            "nodeType": "OutsideURLNode",
            "nodeStates": [],
            "nodeId": "node_2.json",
            "visitEndTime": 1424728224000,
            "id": 123
        }
             */
            
            var newNodeVisit = {};
            newNodeVisit.visitPostTime = null;
            newNodeVisit.visitStartTime = new Date().getTime();
            newNodeVisit.visitEndTime = null;
            newNodeVisit.hintStates = null;
            newNodeVisit.nodeStates = [];
            newNodeVisit.nodeId = nodeId;
            var node = ProjectService.getNodeById(nodeId);
            if (node != null) {
                newNodeVisit.nodeType = node.type;
            }
            newNodeVisit.id = null;
            
            this.addNodeVisit(newNodeVisit);
            
            return newNodeVisit;
        };
        
        serviceObject.endNodeVisitByNodeId = function(nodeId) {
            var latestNodeVisitByNodeId = this.getLatestNodeVisitByNodeId(nodeId);
            if (latestNodeVisitByNodeId != null) {
                latestNodeVisitByNodeId.visitEndTime = new Date().getTime();
            }
        };
        
        serviceObject.getNodeVisitsByNodeId = function(nodeId) {
            var nodeVisitsForNode = [];
            var nodeVisits = this.getNodeVisits();
            
            for (var x = 0; x < nodeVisits.length; x++) {
                var nodeVisit = nodeVisits[x];
                
                if (nodeVisit !== null) {
                    var tempNodeId = nodeVisit.nodeId;
                    
                    if (nodeId === tempNodeId) {
                        nodeVisitsForNode.push(nodeVisit);
                    }
                }
            }
            
            return nodeVisitsForNode;
        };
        
        serviceObject.getNodeVisitsByNodeType = function(nodeType) {
            var nodeVisitsByNodeType = [];
            var nodeVisits = this.getNodeVisits();
            
            for (var x = 0; x < nodeVisits.length; x++) {
                var nodeVisit = nodeVisits[x];
                
                if (nodeVisit !== null) {
                    var nodeId = nodeVisit.nodeId;
                    
                    var node = ProjectService.getNodeById(nodeId);
                    
                    if (node != null) {
                        var tempNodeType = node.type;
                        
                        if (tempNodeType === nodeType) {
                            nodeVisitsByNodeType.push(nodeVisit);
                        }
                    }
                }
            }
            
            return nodeVisitsByNodeType;
        };
        
        serviceObject.getLatestNodeStateByNodeId = function(nodeId) {
            var latestNodeState = null;
            var nodeVisits = this.getNodeVisits();
            
            for (var x = nodeVisits.length - 1; x >= 0; x--) {
                var nodeVisit = nodeVisits[x];
                
                if (nodeVisit !== null) {
                    var tempNodeId = nodeVisit.nodeId;
                    
                    if (nodeId === tempNodeId) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        if (nodeStates !== null) {
                            if (nodeStates.length > 0) {
                                latestNodeState = nodeStates[nodeStates.length - 1];
                                break;
                            }
                        }
                    }
                }
            }
            
            return latestNodeState;
        };
        
        serviceObject.getAllNodeStatesByNodeId = function(nodeId) {
            var allNodeStates = [];
            
            var nodeVisits = this.getNodeVisits();
            
            for (var x = 0; x < nodeVisits.length; x++) {
                var nodeVisit = nodeVisits[x];
                
                if (nodeVisit !== null) {
                    var tempNodeId = nodeVisit.nodeId;
                    
                    if (nodeId === tempNodeId) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        if (nodeStates != null) {
                            allNodeStates = allNodeStates.concat(nodeStates);
                        }
                    }
                }
            }
            
            return allNodeStates;
        };
        
        serviceObject.getLatestNodeVisitByNodeId = function(nodeId) {
            var latestNodeVisit = null;
            var nodeVisits = this.getNodeVisits();
            
            for (var x = nodeVisits.length - 1; x >= 0; x--) {
                var tempNodeVisit = nodeVisits[x];
                
                if (tempNodeVisit !== null) {
                    var tempNodeId = tempNodeVisit.nodeId;
                    
                    if (nodeId === tempNodeId) {
                        latestNodeVisit = tempNodeVisit;
                        break;
                    }
                }
            }
            
            return latestNodeVisit;
        };
        
        serviceObject.addNodeStateToLatestNodeVisit = function(nodeId, nodeState) {
            var latestNodeVisit = this.getLatestNodeVisitByNodeId(nodeId);
            
            return this.addNodeStateToNodeVisit(nodeState, latestNodeVisit);
        };
        
        serviceObject.addNodeStateToNodeVisit = function(nodeState, nodeVisit) {
            if (nodeState != null && nodeVisit != null) {
                if (nodeVisit.nodeStates == null) {
                    nodeVisit.nodeStates = [];
                }
                nodeVisit.nodeStates.push(nodeState);
                
                $rootScope.$broadcast('studentDataChanged');
            }
        };
        
        serviceObject.getLatestStudentWorkForNodeAsHTML = function(nodeId) {
            var studentWorkAsHTML = null;
            
            var node = ProjectService.getNodeById(nodeId);
            
            if (node != null) {
                var nodeType = node.type;
                var latestNodeState = this.getLatestNodeStateByNodeId(nodeId);
                
                // TODO: make this dynamically call the correct {{nodeType}}Service
                if (nodeType === 'OpenResponse') {
                    //studentWorkAsHTML = OpenResponseService.getStudentWorkAsHTML(latestNodeState);
                }
            }
            
            return studentWorkAsHTML;
        };
        
        serviceObject.createNodeState = function() {
            var nodeState = {};
            
            nodeState.timestamp = Date.parse(new Date());
            
            return nodeState;
        };
        
        return serviceObject;
    }];
    
    return service;
});