define(['app'], 
        function(app) {
    app.$controllerProvider.register('ClassroomMonitorController', 
            function($scope,
                    $rootScope,
                    $state,
                    $stateParams, 
                    ConfigService, 
                    PortfolioService,
                    ProjectService, 
                    NodeService, 
                    StudentDataService) {
    });
});