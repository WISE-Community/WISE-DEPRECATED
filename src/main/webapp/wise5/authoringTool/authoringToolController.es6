'use strict';

class AuthoringToolController {

    constructor($location,
                $mdDialog,
                $scope,
                $translate,
                ConfigService,
                ProjectService,
                SessionService
                ) {

        this.$location = $location;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
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

        // alert user when inactive for a long time
        this.$scope.$on('showRequestLogout', (ev) => {
            this.$translate(["serverUpdate", "serverUpdateRequestLogoutMessage", "ok"]).then((translations) => {
                let alert = this.$mdDialog.confirm()
                    .parent(angular.element(document.body))
                    .title(translations.serverUpdate)
                    .textContent(translations.serverUpdateRequestLogoutMessage)
                    .ariaLabel(translations.serverUpdate)
                    .targetEvent(ev)
                    .ok(translations.ok);

                this.$mdDialog.show(alert).then(() => {
                    // do nothing
                }, () => {
                    // do nothing
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
    
    /**
     * The user has moved the mouse so
     */
    mouseMoved() {
        /*
         * notify the Session Service that the user has moved the mouse
         * so we can refresh the session
         */
        this.SessionService.mouseMoved();
    }

    exit() {
        // notify others that we've finished authoring
        this.ProjectService.notifyAuthorProjectEnd().then(() => {
            // send the user to the teacher home page
            let wiseBaseURL = this.ConfigService.getWISEBaseURL();
            let teacherHomePageURL = wiseBaseURL + '/teacher';
            window.location = teacherHomePageURL;
        })
    }
}

AuthoringToolController.$inject = ['$location', '$mdDialog', '$scope', '$translate', 'ConfigService', 'ProjectService', 'SessionService'];

export default AuthoringToolController;
