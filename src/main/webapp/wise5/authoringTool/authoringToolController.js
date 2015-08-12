define(['app'], function(app) {
    app
    .$controllerProvider
    .register('AuthoringToolController',
    function($scope,
                     $rootScope,
                     $state,
                     $stateParams,
                     ConfigService,
                     PortfolioService,
                     ProjectService,
                     NodeService,
                     TeacherDataService) {
        this.exit = function() {
            window.location = "/wise/teacher";
        }
    });
});