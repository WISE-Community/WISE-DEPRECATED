define(['app'], 
        function(app) {
    app.$controllerProvider.register('ClassroomMonitorController', 
            function($scope,
                    $rootScope,
                    $state,
                    $stateParams, 
                    ConfigService, 
                    NoteBookService,
                    ProjectService, 
                    NodeService, 
                    TeacherDataService) {
    });
});