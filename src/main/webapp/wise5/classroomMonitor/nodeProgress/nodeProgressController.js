define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeProgressController', ['$state', 'ConfigService', 'ProjectService', 'StudentStatusService',
                                            function ($state, ConfigService, ProjectService, StudentStatusService) {
        this.title = 'Node Progress!!!';
        //console.log('start');
        this.currentGroup = null;
        //this.currentGroupId = null;
        
        var startNodeId = ProjectService.getStartNodeId();
        var rootNode = ProjectService.getRootNode(startNodeId);
        
        this.currentGroup = rootNode;
        
        
        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
        }
        
        //console.log('end');
        /*
        this.nodeClicked = function(node) {
            var nodeId = node.nodeId;
    
            $state.go('nodeGrading', {nodeId:nodeId});
        };
        */
    }]);
    
});