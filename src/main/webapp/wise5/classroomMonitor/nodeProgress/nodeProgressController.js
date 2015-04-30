define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeProgressController', ['$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService',
                                            function ($scope, $state, ConfigService, ProjectService, StudentStatusService) {
        this.title = 'Node Progress!!!';
        this.currentGroup = null;
        
        $scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                var nodeId = previousNode.id;
                //StudentDataService.endNodeVisitByNodeId(nodeId);
            }
            
            if (currentNode != null) {
                //var nodeId = currentNode.id;
                //var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
                //this.updateNavigation();
                
                var currentNodeId = currentNode.id;
                
                if (ProjectService.isGroupNode(currentNodeId)) {
                    // current node is a group
                    
                    this.currentGroup = currentNode;
                    this.currentGroupId = this.currentGroup.id;
                    $scope.currentgroupid = this.currentGroupId;
                } else if (ProjectService.isApplicationNode(currentNodeId)) {
                    // current node is an application node
                    
                    // load the step grading view
                    
                    $state.go('root.nodeGrading', {nodeId: currentNodeId});
                }
            }
            
            $scope.$apply();
        }));
        
        var startNodeId = ProjectService.getStartNodeId();
        var rootNode = ProjectService.getRootNode(startNodeId);
        
        this.currentGroup = rootNode;
        
        
        if (this.currentGroup != null) {
            this.currentGroupId = this.currentGroup.id;
            $scope.currentgroupid = this.currentGroupId;
        }
        
        ProjectService.getFlattenedProjectAsNodeIds();
        
        //console.log('end');
        /*
        this.nodeClicked = function(node) {
            var nodeId = node.nodeId;
    
            $state.go('nodeGrading', {nodeId:nodeId});
        };
        */
    }]);
    
});