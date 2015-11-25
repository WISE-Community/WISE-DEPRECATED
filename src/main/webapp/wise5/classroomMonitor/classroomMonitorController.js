define(['app'], 
        function(app) {
    app.$controllerProvider.register('ClassroomMonitorController', 
            [
                '$scope',
                '$rootScope',
                '$state',
                '$stateParams',
                'ConfigService',
                'NotebookService',
                'ProjectService',
                'NodeService',
                'TeacherDataService',

                function($scope,
                    $rootScope,
                    $state,
                    $stateParams, 
                    ConfigService, 
                    NotebookService,
                    ProjectService, 
                    NodeService, 
                    TeacherDataService) {
    }]);
});