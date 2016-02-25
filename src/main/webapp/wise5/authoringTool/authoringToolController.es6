'use strict';

class AuthoringToolController {

    constructor($scope,
                ConfigService,
                SessionService,
                $mdDialog) {
        this.ConfigService = ConfigService;
        this.SessionService = SessionService;

        $scope.$on('showSessionWarning', angular.bind(this, function() {
            // Appending dialog to document.body
            let confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Session Timeout')
                .content('You have been inactive for a long time. Do you want to stay logged in?')
                .ariaLabel('Session Timeout')
                .ok('YES')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                this.SessionService.renewSession();
            }.bind(this), function() {
                this.SessionService.forceLogOut();
            }.bind(this));
        }));
    }

    exit() {
        // Send the user to the teacher home page
        let wiseBaseURL = this.ConfigService.getWISEBaseURL();
        let teacherHomePageURL = wiseBaseURL + '/teacher';
        window.location = teacherHomePageURL;
    }
}

AuthoringToolController.$inject = ['$scope', 'ConfigService', 'SessionService', '$mdDialog'];

export default AuthoringToolController;
