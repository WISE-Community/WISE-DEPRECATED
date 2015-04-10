define(['app'], 
        function(app) {
    app.$controllerProvider.register('PortfolioController', 
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