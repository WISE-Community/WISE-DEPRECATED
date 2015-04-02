define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService, 
                ProjectService, 
                StudentDataService) {

        this.currentNode = null;
        this.groups = ProjectService.getGroups();
        
        $scope.$on('currentNodeChanged', angular.bind(this, function() {
            
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
    });
});