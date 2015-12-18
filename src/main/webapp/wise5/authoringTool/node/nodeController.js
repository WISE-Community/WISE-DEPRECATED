define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope,
                 $state,
                 $stateParams,
                 ProjectService) {
            this.nodeId = $stateParams.nodeId;

            // get the node
            this.node = ProjectService.getNodeById(this.nodeId);

            // get the components in the node
            this.components = ProjectService.getComponentsByNodeId(this.nodeId);

            this.showNormal = function() {
                $state.go('root.node.normal', {nodeId: nodeId});
            };
            
            this.showPreview = function() {
                $state.go('root.node.preview', {nodeId: nodeId});
            };
            
            this.showAdvanced = function() {
                $state.go('root.node.advanced', {nodeId: nodeId});
            };
            
            this.close = function() {
                $state.go('root.project.normal');
            };

            /**
             * The node has changed in the authoring view
             */
            this.authoringViewNodeChanged = function() {
                ProjectService.saveProject();
            }
        });
});