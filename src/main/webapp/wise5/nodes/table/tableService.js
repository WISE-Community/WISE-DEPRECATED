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
                
                if (otherNodeType === 'Table') {
                    nodeState.studentData = nodeStateFromOtherNode.studentData;
                }
            }
            
            return nodeState;
        };
        
        return serviceObject;
    }];
    
    return service;
});