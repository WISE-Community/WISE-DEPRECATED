define(['nodeService'], function(nodeService) {
    
    var service = ['$http', 'NodeService', function($http, NodeService) {
        
        // make this service inherit from NodeService
        var serviceObject = Object.create(NodeService);
        
        /**
         * Call a function in this service
         * @param functionName the name of the function
         * @param functionParams the params to pass to the function
         */
        serviceObject.callFunction = function(functionName, functionParams) {
            var result = null;
            
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            
            return result;
        };
        
        /**
         * Get the student work as HTML
         * @param nodeState the node state
         * @return the HTML view of the node state
         */
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = null;
            
            if (nodeState != null) {
                
                // get the parts
                var parts = nodeState.parts;
                
                if (parts != null) {
                    
                    studentWorkAsHTML = '';
                    
                    // loop through all the parts
                    for (var p = 0; p < parts.length; p++) {
                        
                        // get a part
                        var part = parts[p];
                        
                        if (part != null) {
                            // get the student data from the part
                            var studentData = part.studentData;
                            
                            if (studentData != null) {
                                studentWorkAsHTML += studentData;
                            }
                        }
                    }
                }
            }
            
            return studentWorkAsHTML;
        };
        
        /**
         * Populate a new node state with the work from another node state.
         * This will be used for importing work from one node to another node.
         */
        serviceObject.populateNodeState = function(nodeStateFromOtherNode, otherNodeType) {
            var nodeState = null;
            
            if (nodeStateFromOtherNode != null && otherNodeType != null) {
                nodeState = StudentDataService.createNodeState();
                
                /*
                if (otherNodeType === 'OpenResponse') {
                    nodeState.response = nodeStateFromOtherNode.response;
                } else if (otherNodeType === 'Planning') {
                    nodeState.response = JSON.stringify(nodeStateFromOtherNode.studentNodes);
                }
                */
            }
            
            return nodeState;
        };
        
        return serviceObject;
    }];
    
    return service;
});