define(['nodeService'], function(nodeService) {
    
    var service = ['$http',
                   '$q',
                   'ConfigService',
                   'NodeService',
                   function($http,
                           $q,
                           ConfigService,
                           NodeService) {
        var serviceObject = Object.create(NodeService);
        
        serviceObject.config = null;
        
        serviceObject.callFunction = function(functionName, functionParams) {
            var result = null;
            
            /*
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            */
            
            return result;
        };
        
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = '';
            
            if (nodeState != null) {
                var studentData = nodeState.studentData;
                
                if (studentData != null) {
                    var buckets = studentData.buckets;
                    
                    if (buckets != null) {
                        for (var b = 0; b < buckets.length; b++) {
                            var bucket = buckets[b];
                            
                            if (bucket != null) {
                                var bucketValue = bucket.value;
                                var items = bucket.items;
                                
                                studentWorkAsHTML += bucketValue;
                                studentWorkAsHTML += '<br/>';
                                
                                if (items != null) {
                                    for (var i = 0; i < items.length; i++) {
                                        var item = items[i];
                                        
                                        if (item != null) {
                                            var itemValue = item.value;
                                            
                                            studentWorkAsHTML += itemValue;
                                            studentWorkAsHTML += '<br/>';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            return studentWorkAsHTML;
        };
        
        serviceObject.populateNodeState = function(nodeStateFromOtherNode, otherNodeType) {
            var nodeState = null;
            
            if (nodeStateFromOtherNode != null && otherNodeType != null) {
                nodeState = StudentDataService.createNodeState();
                
                if (otherNodeType === 'Match') {
                    nodeState.studentData = nodeStateFromOtherNode.studentData;
                }
            }
            
            return nodeState;
        };
        
        return serviceObject;
    }];
    
    return service;
});