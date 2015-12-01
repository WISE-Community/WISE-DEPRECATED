define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeProgressController', [
            '$scope',
            '$state',
            'ConfigService',
            'ProjectService',
            'StudentStatusService',
            function ($scope,
                      $state,
                      ConfigService,
                      ProjectService,
                      StudentStatusService) {

        this.title = 'Grade By Step';

        this.currentGroup = null;

        this.items = null;

        this.getNodeTitleByNodeId = function(nodeId) {
            return ProjectService.getNodeTitleByNodeId(nodeId);
        };

        this.isGroupNode = function(nodeId) {
            return ProjectService.isGroupNode(nodeId);
        };

        this.getNodePositionById = function(nodeId) {
            return ProjectService.getNodePositionById(nodeId);
        };

        //this.nodeIds = ProjectService.getFlattenedProjectAsNodeIds();
        this.items = ProjectService.idToOrder;
        
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
        
        var flattenedProjectNodeIds = ProjectService.getFlattenedProjectAsNodeIds();
        //console.log(JSON.stringify(flattenedProjectNodeIds, null, 4));
        
        var branches = ProjectService.getBranches();
        //console.log(JSON.stringify(branches, null, 4));
        
        //console.log('end');

        this.nodeClicked = function(nodeId) {

            $state.go('root.nodeGrading', {nodeId:nodeId});
        };

    }]);
    
});