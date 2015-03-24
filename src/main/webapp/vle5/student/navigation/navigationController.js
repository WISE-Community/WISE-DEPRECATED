define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController', 
        function($scope, 
                $state, 
                $stateParams, 
                ConfigService, 
                ProjectService, 
                StudentDataService) {
            
            this.message = 'hello from navigationController!';
        });
});