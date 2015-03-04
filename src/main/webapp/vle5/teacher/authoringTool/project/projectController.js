define(['app'], function(app) {
    app.$controllerProvider.register('ProjectController', 
        function($scope, $state) {
            this.showNormal = function() {
                $state.go('root.project.normal');
            };
            
            this.showAdvanced = function() {
                $state.go('root.project.advanced');
            };
        });
});