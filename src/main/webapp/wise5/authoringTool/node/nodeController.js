define(['../../test/app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, $state, $stateParams) {
            var nodeId = $stateParams.nodeId;
            
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
        });
});