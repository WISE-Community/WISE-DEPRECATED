define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService, 
                ProjectService, 
                StudentDataService) {
        this.currentGroup = null;
        this.groups = ProjectService.getGroups();
        this.currentNode = StudentDataService.getCurrentNode();
        
        $scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
            var previousNode = args.previousNode;
            var currentNode = args.currentNode;
            if (previousNode != null && previousNode.type === 'group') {
                var nodeId = previousNode.id;
                StudentDataService.endNodeVisitByNodeId(nodeId);
            }
            
            if (currentNode != null && currentNode.type === 'group') {
                var nodeId = currentNode.id;
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
                this.updateNavigation();
            }
            
        }));
        
        $scope.$on('nodeStatusesChanged', angular.bind(this, function() {
            
        }));
        
        $scope.$on('groupsChanged', angular.bind(this, function() {
            
        }));
        
        this.nodeClicked = function(nodeId) {
            StudentDataService.setCurrentNodeByNodeId(nodeId);
        };
        
        this.isNodeDisabled = function(nodeId) {
            var result = false;
            
            var nodeStatus = StudentDataService.getNodeStatusByNodeId(nodeId);
            
            if (nodeStatus != null) {
                if (nodeStatus.isVisitable != null) {
                    result = !nodeStatus.isVisitable;
                }
            }
            
            return result;
        };
        
        this.updateNavigation = function() {
            var currentNode = StudentDataService.getCurrentNode();
            
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var currentGroup = null;
                
                if (ProjectService.isGroupNode(currentNodeId)) {
                    // current node is a group node
                    currentGroup = currentNode;
                } else {
                    // current node is an application node
                    currentGroup = ProjectService.getParentGroup(currentNodeId);
                }
                
                if (currentGroup != null) {
                    this.currentGroupId = currentGroup.id;
                    var parentGroup = ProjectService.getParentGroup(this.currentGroupId);
                    
                    if (parentGroup != null) {
                        this.parentGroupId = parentGroup.id;
                    }
                }
            }
        };
        
        this.updateNavigation();
    });
});