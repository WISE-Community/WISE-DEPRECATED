define(['angular', 'configService'], function(angular, configService) {

    angular.module('StudentDataService', [])
    
    .service('StudentDataService', ['$http', 'ConfigService', function($http, ConfigService) {
        this.studentData = null;
        this.stackHistory = [];  // array of node id's
        
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
        
        this.retrieveStudentData = function() {
            var getStudentDataUrl = ConfigService.getConfigParam('getStudentDataUrl');
            
            return $http.get(getStudentDataUrl).then(angular.bind(this, function(result) {
                this.studentData = result.data;
                
                this.populateStackHistory(this.getNodeVisits());
                
                return this.studentData;
            }));
        };

        this.populateStackHistory = function(nodeVisits) {
            if (nodeVisits != null) {
                for (var i = 0; i < nodeVisits.length; i++) {
                    var nodeVisit = nodeVisits[i];
                    var nodeVisitNodeId = nodeVisit.nodeId;
                    this.updateStackHistory(nodeVisitNodeId);
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