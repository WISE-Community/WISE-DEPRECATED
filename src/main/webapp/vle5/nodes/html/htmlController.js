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
        this.message = 'message from HTMLController';
        console.log('HTMLController hhhhhhhhhhhhhhhhhhhhh');
        var objectEquality = true;
        $scope.$watch(function() {
            return $scope.$parent.nodeController.nodeContent;
        }, angular.bind(this, function(newNodeContent, oldNodeContent) {
            if (newNodeContent != null) {
                this.htmlContent = $sce.trustAsHtml($scope.$parent.nodeController.nodeContent);
                $scope.$parent.nodeController.nodeLoaded(this.nodeId);
            }
    }), objectEquality);
    });
});