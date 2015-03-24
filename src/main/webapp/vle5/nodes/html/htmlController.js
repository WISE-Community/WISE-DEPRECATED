define(['app'], function(app) {
    app.$controllerProvider.register('HTMLController', 
        function($scope, 
                $state, 
                $stateParams,
                $sce,
                ConfigService, 
                ProjectService, 
                StudentDataService) {
        this.nodeId = $stateParams.nodeId;
        console.log('htmlController.js nodeId: ' + this.nodeId);
        this.message = 'message from HTMLController';
        
        $scope.$watch(function() {
            return $scope.$parent.nodeController.nodeContent;
        }, angular.bind(this, function(newNodeContent, oldNodeContent) {
            console.log('nodeController.js nodeContent changed');
            if (newNodeContent != null) {
                this.htmlContent = $sce.trustAsHtml($scope.$parent.nodeController.nodeContent);
                $scope.$parent.nodeController.nodeLoaded(this.nodeId);
            }
    }));
    });
});