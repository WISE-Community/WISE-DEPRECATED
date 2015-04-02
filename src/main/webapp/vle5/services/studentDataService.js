define(['angular', 'configService'], function(angular, configService) {

    angular.module('StudentDataService', [])
    
    .service('StudentDataService', ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'OpenResponseService', 
                                    function($http, $q, $rootScope, ConfigService, ProjectService, OpenResponseService) {
        this.studentData = null;
        this.stackHistory = null;  // array of node id's
        this.visitedNodesHistory = null;
        this.nodeStatuses = null;
        
        this.currentNode = null;
        
        this.getCurrentNode = function() {
            return this.currentNode;
        };
        
        this.getCurrentNodeId = function() {
            var currentNodeId = null;
            var currentNode = this.currentNode;
            
            if (currentNode != null) {
                currentNodeId = currentNode.id;
            }
            
            return currentNodeId;
        };
        
        this.setCurrentNodeByNodeId = function(nodeId) {
            if (nodeId != null) {
                var node = ProjectService.getNodeById(nodeId);
                
                this.setCurrentNode(node);
            }
        };
        
        this.setCurrentNode = function(node) {
            var previousCurrentNode = this.currentNode;
            
            if (previousCurrentNode !== node) {
                // the current node has changed
                this.currentNode = node;
                
                $rootScope.$broadcast('currentNodeChanged');
            }
        };
        
        this.updateCurrentNode = function(latestNodeVisit) {
            if (latestNodeVisit != null) {
                nodeId = latestNodeVisit.nodeId;
                
                var node = ProjectService.getNodeById(nodeId);
                this.setCurrentNode(node);
            }
        };
        
        this.getNodeVisits = function() {
            var nodeVisits = null;
            var studentData = this.studentData;
            
            if (studentData != null) {
                nodeVisits = studentData.nodeVisits;
            }
            
            return nodeVisits;
        };
        
        this.getNodeVisitAtIndex = function(index) {
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
        
        this.getLatestNodeVisit = function() {
            return this.getNodeVisitAtIndex(-1);
        };
        
        this.retrieveStudentData = function() {
            var getStudentDataUrl = ConfigService.getConfigParam('getStudentDataUrl');
            
            return $http.get(getStudentDataUrl).then(angular.bind(this, function(result) {
                this.studentData = result.data;
                var nodeVisits = this.getNodeVisits();
                var latestNodeVisit = this.getLatestNodeVisit();
                
                this.loadStudentNodes();
                
                this.updateCurrentNode(latestNodeVisit);
                this.populateHistories(nodeVisits);
                this.updateNodeStatuses();
                
                return this.studentData;
            }));
        };
        
        this.loadStudentNodes = function() {
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
        
        this.getNodeStatuses = function() {
            return this.nodeStatuses;
        };
        
        this.getNodeStatusByNodeId = function(nodeId) {
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
        
        this.updateNodeStatuses = function() {
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
        
        this.updateNodeStatusesByNode = function(node) {
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
    
                                        // TODO: replace hard-code below with $injector.get('node.applicationType'+Service);
                                        var result = OpenResponseService.callFunction(functionName, functionParams);
                                        if (result) {
                                            nodeStatus.isVisitable = true;
                                        }
                                    }
                                }
                            } else if (constraintLogic === 'lockAfterSubmit') {
                                var targetId = constraintForNode.targetId;
                                var nodeVisits = this.getNodeVisitsByNodeId(targetId);
                                
                                if (nodeId === targetId) {
                                    var isWorkSubmitted = OpenResponseService.isWorkSubmitted(nodeVisits);
                                    
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

        this.populateHistories = function(nodeVisits) {
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
        
        this.getStackHistoryAtIndex = function(index) {
            if (index < 0) {
                index = this.stackHistory.length + index;
            }
            var stackHistoryResult = null;
            if (this.stackHistory != null && this.stackHistory.length > 0) {
                stackHistoryResult = this.stackHistory[index];
            }
            return stackHistoryResult;
        };
        
        this.getStackHistory = function() {
            return this.stackHistory;
        };
        
        this.updateStackHistory = function(nodeId) {
            var indexOfNodeId = this.stackHistory.indexOf(nodeId);
            if (indexOfNodeId === -1) {
                this.stackHistory.push(nodeId);
            } else {
                this.stackHistory.splice(indexOfNodeId + 1, this.stackHistory.length);
            }
        };
        
        this.updateVisitedNodesHistory = function(nodeId) {
            var indexOfNodeId = this.visitedNodesHistory.indexOf(nodeId);
            if (indexOfNodeId === -1) {
                this.visitedNodesHistory.push(nodeId);
            }
        };
        
        this.getVisitedNodesHistory = function() {
            return this.visitedNodesHistory;
        };
        
        this.isNodeVisited = function(nodeId) {
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
        
        this.getNodeVisits = function() {
            return this.studentData.nodeVisits;
        };
        
        this.addNodeVisit = function(nodeVisit) {
            var nodeVisits = this.getNodeVisits();
            
            if (nodeVisits !== null) {
                nodeVisits.push(nodeVisit);
                
                $rootScope.$broadcast('nodeVisitsChanged');
            }
            
            return nodeVisit;
        };
        
        this.createNodeVisit = function(nodeId) {
            /*
             *         {
            "visitPostTime": 1424728225000,
            "visitStartTime": 1424728201000,
            "hintStates": [],
            "nodeType": "OutsideURLNode",
            "nodeStates": [],
            "nodeId": "node_2.json",
            "visitEndTime": 1424728224000,
            "stepWorkId": "8752274"
        }
             */
            
            var newNodeVisit = {};
            newNodeVisit.visitPostTime = null;
            newNodeVisit.visitStartTime = null;
            newNodeVisit.visitEndTime = null;
            newNodeVisit.hintStates = null;
            newNodeVisit.nodeType = null;
            newNodeVisit.nodeStates = [];
            newNodeVisit.nodeId = nodeId;
            newNodeVisit.stepWorkId = null;
            
            this.addNodeVisit(newNodeVisit);
            
            return newNodeVisit;
        };
        
        this.getNodeVisitsByNodeId = function(nodeId) {
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
        
        this.getNodeVisitsByNodeType = function(nodeType) {
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
        
        this.getLatestNodeStateByNodeId = function(nodeId) {
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
        
        this.getAllNodeStatesByNodeId = function(nodeId) {
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
        
        this.getLatestNodeVisitByNodeId = function(nodeId) {
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
        
        this.addNodeStateToLatestNodeVisit = function(nodeId, nodeState) {
            var latestNodeVisit = this.getLatestNodeVisitByNodeId(nodeId);
            
            this.addNodeStateToNodeVisit(nodeState, latestNodeVisit);
        };
        
        this.addNodeStateToNodeVisit = function(nodeState, nodeVisit) {
            if (nodeState != null && nodeVisit != null) {
                var nodeStates = nodeVisit.nodeStates;
                
                if(nodeStates != null) {
                    nodeStates.push(nodeState);
                }
            }
        };
        
    }]);
    
});