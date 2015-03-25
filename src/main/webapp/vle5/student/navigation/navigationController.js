define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService, 
                ProjectService, 
                StudentDataService) {

        this.currentNode = null;
        
        $scope.$watch(function() {
            return StudentDataService.getCurrentNode();
        }, angular.bind(this, function(newCurrentNode, oldCurrentNode) {

            if (newCurrentNode != null) {
                this.currentNode = newCurrentNode;
            }
        }));

        var objectEquality = true;
        $scope.$watch(function() {
            var nodeStatuses = StudentDataService.getNodeStatuses();
            return nodeStatuses;
        }, angular.bind(this, function(newNodeStatuses, oldNodeStatuses) {
            console.log('nodeStatus Changed');
            if (newNodeStatuses != null) {
                var nodeId = StudentDataService.getCurrentNodeId();

                this.nodeStatuses = StudentDataService.getNodeStatuses();
            }
        }), objectEquality);

        this.groups = ProjectService.getGroups();

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
        }
    });
});