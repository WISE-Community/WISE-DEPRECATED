define(['../../test/app'], function(app) {
    app.$controllerProvider.register('NodeAdvancedController', 
        function($scope, $stateParams, ProjectService, NodeService) {
            this.nodeId = $stateParams.nodeId;
        });
});