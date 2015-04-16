define(['nodeService'], function(nodeService) {
    
    var service = ['$http', 'NodeService', function($http, NodeService) {
        var serviceObject = Object.create(NodeService);
        
        serviceObject.config = null;
        
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = null;
            
            if (nodeState != null) {
                var response = nodeState.response;
                
                if (response != null) {
                    studentWorkAsHTML = '';
                    
                    for (var x = 0; x < response.length; x++) {
                        var choice = response[x];
                        
                        if (choice != null) {
                            var text = choice.text;
                            
                            if (studentWorkAsHTML != '') {
                                studentWorkAsHTML += '<br/>';
                            }
                            
                            studentWorkAsHTML += text;
                        }
                    }
                }
                
            }
            
            return studentWorkAsHTML;
        };
        
        return serviceObject;
    }];
    
    return service;
});