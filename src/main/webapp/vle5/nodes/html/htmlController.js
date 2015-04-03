define(['app'], function(app) {
    app.$controllerProvider.register('HTMLController', 
        function($scope, 
                $state, 
                $stateParams,
                $sce,
                ConfigService, 
                NodeService,
                ProjectService, 
                StudentDataService) {
        this.nodeId = $stateParams.nodeId;
        this.message = 'message from HTMLController';
        
        var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);

        NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
            //this.htmlContent = $sce.trustAsHtml(this.nodeContent);
            this.htmlContent = nodeContent;
            $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        }));
    });
});