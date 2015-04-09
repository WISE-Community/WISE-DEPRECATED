define(['app'], 
        function(app) {
    app.$controllerProvider.register('PortfolioController', 
            function($scope,
                    $rootScope,
                    $state,
                    $stateParams, 
                    ConfigService, 
                    NodeApplicationService,
                    PortfolioService,
                    ProjectService, 
                    NodeService, 
                    StudentDataService) {
        
    });
});