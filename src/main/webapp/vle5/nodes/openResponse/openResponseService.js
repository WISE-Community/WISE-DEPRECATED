define(['angular'], function(angular) {

    angular.module('OpenResponseService', [])
    
    .service('OpenResponseService', ['$http', function($http) {
        this.config = null;
        
        this.callFunction = function(functionName, functionParams) {
            var result = null;
            
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            
            return result;
        };
        
        this.wordCountCompare = function(params) {
            var result = false;
            
            if (params != null) {
                var operator = params.operator;
                var count = params.count;
                var nodeVisits = params.nodeVisits;
                
                var latestNodeState = this.getLatestNodeState(nodeVisits);
                
                var wordCount = 0;
                
                if (latestNodeState != null) {
                    var response = latestNodeState.response;
                    
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

        this.getWordCount = function(response) {
            var wordCount = 0;
            
            if (response != null) {
                var regex = /\s+/gi;
                wordCount = response.trim().replace(regex, ' ').split(' ').length;
            }
            
            return wordCount;
        };
        
        this.getLatestNodeState = function(nodeVisits) {
            var result = null;
            
            if (nodeVisits != null) {
                for (var nv = nodeVisits.length - 1; nv >= 0; nv--) {
                    var nodeVisit = nodeVisits[nv];
                    
                    if (nodeVisit != null) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
                            var nodeState = nodeStates[ns];
                            
                            if (nodeState != null) {
                                result = nodeState;
                                break;
                            }
                        }
                        
                        if (result != null) {
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
    }]);
});