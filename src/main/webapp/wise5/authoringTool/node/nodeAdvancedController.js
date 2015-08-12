define(['../../test/app'], function(app) {
    app.$controllerProvider.register('NodeAdvancedController', 
        function($scope, $stateParams, ProjectService, NodeService) {
            this.nodeId = $stateParams.nodeId;
            
            var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
            
            if (nodeSrc != null) {
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    if (typeof nodeContent === 'object') {
                        /*
                         * the node content is an object so we will convert it
                         * into a JSON string
                         */
                        var nodeContentString = JSON.stringify(nodeContent, null, 4);
                        $('#nodeAdvancedTextarea').val(nodeContentString);
                    } else if (typeof nodeContent === 'string') {
                        /*
                         * the node content is a string so we will display
                         * it in the textarea without modifying it
                         */
                        $('#nodeAdvancedTextarea').val(nodeContent);
                    }
                }));
            }
        });
});