'use strict';

class AuthoringToolController {

    constructor($location,
                $mdDialog,
                $scope,
                $translate,
                ConfigService,
                SessionService
                ) {

        this.$location = $location;
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
    
    /**
     * Check if the author is on the My Projects page in the Authoring Tool
     * @returns whether the author is on the My Projects page in the Authoring
     * Tool
     */
    isAuthorOnMyProjectsPage() {
        var result = false;
        
        if (this.$location.url() == '/') {
            /*
             * the author is on the My Projects page. the url looks like
             * http://wise.berkeley.edu/author#/
             */
            result = true;
        }
        
        return result;
    }
    
    /**
     * Navigate the user to the My Projects page in the Authoring Tool
     */
    goToMyProjects() {
        // send the user to the My Projects page in the Authoring Tool
        this.$location.url('/author');
    }

    exit() {
        // Send the user to the teacher home page
        let wiseBaseURL = this.ConfigService.getWISEBaseURL();
        let teacherHomePageURL = wiseBaseURL + '/teacher';
        window.location = teacherHomePageURL;
    }
}

AuthoringToolController.$inject = ['$location', '$mdDialog', '$scope', '$translate', 'ConfigService', 'SessionService'];

export default AuthoringToolController;
