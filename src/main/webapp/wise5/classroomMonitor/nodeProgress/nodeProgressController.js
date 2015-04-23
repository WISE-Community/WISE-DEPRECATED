define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeProgressController', ['$state', 'ConfigService', 'StudentStatusService', 
                                            function ($state, ConfigService, StudentStatusService) {
        this.title = 'Node Progress!!!';

        /*
        this.nodeClicked = function(node) {
            var nodeId = node.nodeId;
    
            $state.go('nodeGrading', {nodeId:nodeId});
        };
        */
    }]);
    
});