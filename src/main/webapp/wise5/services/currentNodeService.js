define(['projectService'], function(projectService) {

    var service = ['$rootScope', 'ProjectService', function($rootScope, ProjectService) {
        var serviceObject = {};
        
        serviceObject.currentNode = null;

        /**
         * Get the current node
         * @returns the current node object
         */
        serviceObject.getCurrentNode = function() {
            return this.currentNode;
        };

        /**
         * Get the current node id
         * @returns the current node id
         */
        serviceObject.getCurrentNodeId = function() {
            var currentNodeId = null;
            
            if (this.currentNode != null) {
                currentNodeId = this.currentNode.id;
            }
            
            return currentNodeId;
        };

        /**
         * Set the current node
         * @param nodeId the node id
         */
        serviceObject.setCurrentNodeByNodeId = function(nodeId) {
            if (nodeId != null) {
                var node = ProjectService.getNodeById(nodeId);
                
                this.setCurrentNode(node);
            }
        };

        /**
         * Set the current node
         * @param node the node object
         */
        serviceObject.setCurrentNode = function(node) {
            var previousCurrentNode = this.currentNode;
            
            if (previousCurrentNode !== node) {
                // the current node is about to change

                // set the current node to the new node
                this.currentNode = node;

                // broadcast the event that the current node has changed
                $rootScope.$broadcast('currentNodeChanged', {previousNode: previousCurrentNode, currentNode: this.currentNode});
            }
        };

        /**
         * End the current node
         */
        serviceObject.endCurrentNode = function() {

            // get the current node
            var previousCurrentNode = this.currentNode;

            if (previousCurrentNode != null) {

                // tell the node to exit
                $rootScope.$broadcast('exitNode', {nodeToExit: previousCurrentNode});
            }
        };

        /**
         * End the current node and set the current node
         * @param nodeId the node id of the new current node
         */
        serviceObject.endCurrentNodeAndSetCurrentNodeByNodeId = function(nodeId) {

            // end the current node
            this.endCurrentNode();

            // set the current node
            this.setCurrentNodeByNodeId(nodeId);
        };

        /**
         * End the current node and set the current node
         * @param node the node of the new current node
         */
        serviceObject.endCurrentNodeAndSetCurrentNode = function(node) {

            // end the current node
            this.endCurrentNode();

            // set the current node
            this.setCurrentNode(node);
        };
        
        return serviceObject;
    }];
    
    return service;
});