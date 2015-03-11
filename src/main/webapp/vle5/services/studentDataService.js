define(['angular', 'configService'], function(angular, configService) {

    angular.module('StudentDataService', [])
    
    .service('StudentDataService', ['$http', 'ConfigService', 'ProjectService', function($http, ConfigService, ProjectService) {
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
        
        this.setCurrentNode = function(node) {
            this.currentNode = node;
        };
        
        this.updateCurrentNode = function(latestNodeVisit) {
            if (latestNodeVisit != null) {
                nodeId = latestNodeVisit.nodeId;
                
                var node = ProjectService.getNodeByNodeId(nodeId);
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
                
                this.updateCurrentNode(latestNodeVisit);
                this.populateHistories(nodeVisits);
                this.updateNodeStatuses();
                
                return this.studentData;
            }));
        };
        
        this.updateNodeStatuses = function() {
            this.nodeStatuses = [];
            var nodes = ProjectService.getProjectNodes();
            
            if (nodes != null) {
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    var nodeStatusesByNode = this.getNodeStatusesByNode(node);
                    
                    this.nodeStatuses.push(nodeStatusesByNode);
                }
            }
        };
        
        this.getNodeStatuses = function() {
            return this.nodeStatuses;
        };
        
        this.getNodeStatusesByNode = function(node) {
            var nodeStatuses = null;
            
            if (node != null) {
                var nodeId = node.id;
                
                nodeStatuses = {};
                nodeStatuses.nodeId = nodeId;
                nodeStatuses.statuses = [];
                
                var isNodeVisitableStatus = {};
                isNodeVisitableStatus.statusType = 'isVisitable';
                
                if (this.isNodeVisited(nodeId)) {
                    isNodeVisitableStatus.statusValue = true;
                } else {
                    var currentNode = this.currentNode;
                    
                    if (currentNode != null) {
                        var currentNodeId = currentNode.id;
                        
                        var transitions = ProjectService.getTransitionsByFromNodeId(currentNodeId);
                        
                        if (transitions != null) {
                            var transitionsToNodeId = ProjectService.getTransitionsByFromAndToNodeId(currentNodeId, nodeId);
                            
                            if (transitions.length > 1) {
                                // the current node has branches
                                
                                // get all the transitions from the current node to the node status node
                                
                                
                                if (transitionsToNodeId != null && transitionsToNodeId.length > 0) {
                                    /*
                                     * there is a transition between the two nodes so the node status node
                                     * is not visitable
                                     */
                                    isNodeVisitableStatus.statusValue = false;
                                }
                            } else {
                                //the current node does not have branches
                                if (transitionsToNodeId != null && transitionsToNodeId.length > 0) {
                                    /*
                                     * there is a transition between the two nodes so the node status node
                                     * is not visitable
                                     */
                                    isNodeVisitableStatus.statusValue = true;
                                }
                            }
                        }
                        
                        /*
                        if (transitions != null && transitions.length === 1) {
                            isNodeVisitableStatus.statusValue = true;
                        }
                        */
                    }
                }
                
                nodeStatuses.statuses.push(isNodeVisitableStatus);
            }
            
            return nodeStatuses;
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
            newNodeVisit.nodeStates = null;
            newNodeVisit.nodeId = null;
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
                        nodeVisitsForNode.append(nodeVisit);
                    }
                }
            }
            
            return nodeVisitsForNode;
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