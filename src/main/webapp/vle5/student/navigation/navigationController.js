define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService, 
                ProjectService, 
                StudentDataService) {
        this.currentNode = null;
        this.currentGroup = null;
        this.groups = ProjectService.getGroups();
        this.currentNode = StudentDataService.getCurrentNode();
        
        $scope.$on('currentNodeChanged', angular.bind(this, function() {
            
        }));
        
        $scope.$on('nodeStatusesChanged', angular.bind(this, function() {
            
        }));
        
        $scope.$on('groupsChanged', angular.bind(this, function() {
            
        }));
        
        this.nodeClicked = function(nodeId) {
            StudentDataService.setCurrentNodeByNodeId(nodeId);
            this.updateNavigation();
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