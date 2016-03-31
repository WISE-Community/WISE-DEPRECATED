'use strict';

class AuthoringToolController {

    constructor($mdDialog,
                $scope,
                $translate,
                ConfigService,
                SessionService
                ) {

        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.SessionService = SessionService;

        $scope.$on('showSessionWarning', () => {

            this.$translate('autoLogoutMessage').then((autoLogoutMessage) => {
                // Appending dialog to document.body
                let confirm = this.$mdDialog.confirm()
                    .parent(angular.element(document.body))
                    .title('Session Timeout')
                    .content(autoLogoutMessage)
                    .ariaLabel('Session Timeout')
                    .ok('YES')
                    .cancel('No');
                this.$mdDialog.show(confirm).then(() => {
                    this.SessionService.renewSession();
                }, () => {
                    this.SessionService.forceLogOut();
                });

            });
        });
    }

    exit() {
        // Send the user to the teacher home page
        let wiseBaseURL = this.ConfigService.getWISEBaseURL();
        let teacherHomePageURL = wiseBaseURL + '/teacher';
        window.location = teacherHomePageURL;
    }
}

AuthoringToolController.$inject = ['$mdDialog', '$scope', '$translate', 'ConfigService', 'SessionService'];

export default AuthoringToolController;
