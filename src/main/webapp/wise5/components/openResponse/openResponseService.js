define(['nodeService'], function(nodeService) {
    
    var service = ['$http', 'NodeService', function($http, NodeService) {
        var serviceObject = Object.create(NodeService);
        
        serviceObject.config = null;
        
        serviceObject.callFunction = function(functionName, functionParams) {
            var result = null;
            
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            
            return result;
        };
        
        serviceObject.wordCountCompare = function(params) {
            var result = false;
            
            if (params != null) {
                var operator = params.operator;
                var count = params.count;
                var nodeVisits = params.nodeVisits;
                
                var latestNodeState = this.getLatestNodeState(nodeVisits);
                
                var wordCount = 0;
                
                if (latestNodeState != null) {
                    var response = latestNodeState.studentData;
                    
                    if (response != null) {
                        wordCount = this.getWordCount(response);
                        
                        if (operator === '<') {
                            if (wordCount < count) {
                                result = true;
                            }
                        } else if (operator === '>=') {
                            if (wordCount >= count) {
                                result = true;
                            }
                        }
                    }
                }
            }
            
            return result;
        };

        serviceObject.getWordCount = function(response) {
            var wordCount = 0;
            
            if (response != null) {
                var regex = /\s+/gi;
                wordCount = response.trim().replace(regex, ' ').split(' ').length;
            }
            
            return wordCount;
        };
        
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = null;
            
            if (nodeState != null) {
                var response = nodeState.studentData;
                
                if (response != null) {
                    studentWorkAsHTML = '<p>' + response + '</p>';
                }
            }
            
            return studentWorkAsHTML;
        };
        
        serviceObject.populateNodeState = function(nodeStateFromOtherNode, otherNodeType) {
            var nodeState = null;
            
            if (nodeStateFromOtherNode != null && otherNodeType != null) {
                nodeState = StudentDataService.createNodeState();
                
                if (otherNodeType === 'OpenResponse') {
                    nodeState.studentData = nodeStateFromOtherNode.studentData;
                } else if (otherNodeType === 'Planning') {
                    nodeState.studentData = JSON.stringify(nodeStateFromOtherNode.studentNodes);
                } 
            }
            
            return nodeState;
        };
        
        return serviceObject;
    }];
    
    return service;
});