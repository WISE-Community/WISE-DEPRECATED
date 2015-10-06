define(['app'], function(app) {
    app
    .$controllerProvider
    .register('AuthoringToolController',
    function($scope,
             $rootScope,
             $state,
             $stateParams,
             ConfigService,
             NotebookService,
             ProjectService,
             NodeService,
             SessionService,
             TeacherDataService,
             $mdDialog) {

        $scope.$on('showSessionWarning', angular.bind(this, function() {
            // Appending dialog to document.body
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Session Timeout')
                .content('You have been inactive for a long time. Do you want to stay logged in?')
                .ariaLabel('Session Timeout')
                .ok('YES')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                SessionService.renewSession();
            }, function() {
                SessionService.forceLogOut();
            });
        }));

        this.exit = function() {
            //get the context path e.g. /wise
            var contextPath = ConfigService.getConfigParam('contextPath');
            // send the user to the teacher home page
            homePageURL = contextPath + '/teacher';
            window.location = homePageURL;
        }
    });
});