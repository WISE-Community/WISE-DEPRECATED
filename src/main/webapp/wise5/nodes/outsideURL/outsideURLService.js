define(['nodeService'], function(nodeService) {
    
    var service = ['$http', 'NodeService', function($http, NodeService) {
        var serviceObject = Object.create(NodeService);
        
        
        
        return serviceObject;
    }];
    
    return service;
});