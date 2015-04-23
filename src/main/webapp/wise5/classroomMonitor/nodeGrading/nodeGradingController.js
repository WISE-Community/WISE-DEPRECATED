define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeGradingController', ['$state', 'ConfigService', 'StudentStatusService', 
                                            function ($state, ConfigService, StudentStatusService) {
        this.title = 'Node Grading!!!';

        /*
        this.nodeClicked = function(node) {
            var nodeId = node.nodeId;
    
            $state.go('nodeGrading', {nodeId:nodeId});
        };
        */
    }]);
    
});