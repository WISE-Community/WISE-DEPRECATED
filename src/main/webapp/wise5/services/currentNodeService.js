define(['projectService'], function(projectService) {

    var service = ['$rootScope', 'ProjectService', function($rootScope, ProjectService) {
        var serviceObject = {};
        
        serviceObject.currentNode = null;
        
        serviceObject.getCurrentNode = function() {
            return this.currentNode;
        };
        
        serviceObject.getCurrentNodeId = function() {
            var currentNodeId = null;
            
            if (this.currentNode != null) {
                currentNodeId = this.currentNode.id;
            }
            
            return currentNodeId;
        };
        
        serviceObject.setCurrentNodeByNodeId = function(nodeId) {
            if (nodeId != null) {
                var node = ProjectService.getNodeById(nodeId);
                
                this.setCurrentNode(node);
            }
        };
        
        serviceObject.setCurrentNode = function(node) {
            var previousCurrentNode = this.currentNode;
            
            if (previousCurrentNode !== node) {
                // the current node is about to change
                $rootScope.$broadcast('nodeOnExit', {nodeToExit: previousCurrentNode});
                
                this.currentNode = node;
                
                $rootScope.$broadcast('currentNodeChanged', {previousNode: previousCurrentNode, currentNode: this.currentNode});
            }
        };
        
        return serviceObject;
    }];
    
    return service;
});