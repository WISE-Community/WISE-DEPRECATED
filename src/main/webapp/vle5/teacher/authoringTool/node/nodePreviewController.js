define(['app'], function(app) {
    app.$controllerProvider.register('NodePreviewController', 
        function($scope, $stateParams, ProjectService, NodeApplicationService) {
            this.nodeId = $stateParams.nodeId;
            var mode = 'student';
            
            //console.log('nodeId=' + this.nodeId);
            
            var node = ProjectService.getNodeByNodeId(this.nodeId);
            
            if(node !== null) {
                this.currentNode = node;
                var nodeType = node.type
                var nodeIFrameSrc = NodeApplicationService.getNodeURL(nodeType) + '?nodeId=' + this.nodeId + '&mode=' + mode;
                $('#nodeIFrame').attr('src', nodeIFrameSrc);
            };
        });
});