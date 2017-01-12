'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolController = function () {
    function AuthoringToolController($filter, $location, $mdDialog, $scope, $timeout, ConfigService, ProjectService, SessionService) {
        var _this = this;

        _classCallCheck(this, AuthoringToolController);

        this.$filter = $filter;
        this.$location = $location;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$translate = this.$filter('translate');
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;

        // the global message that shows up at the top right of the authoring tool
        this.globalMessage = {
            text: '',
            time: ''
        };

        $scope.$on('showSessionWarning', function () {

            // Append dialog to document.body
            var confirm = _this.$mdDialog.confirm().parent(angular.element(document.body)).title(_this.$translate('sessionTimeout')).content(_this.$translate('autoLogoutMessage')).ariaLabel(_this.$translate('sessionTimeout')).ok(_this.$translate('yes')).cancel(_this.$translate('no'));
            _this.$mdDialog.show(confirm).then(function () {
                _this.SessionService.renewSession();
            }, function () {
                _this.SessionService.forceLogOut();
            });
        });

        // alert user when inactive for a long time
        this.$scope.$on('showRequestLogout', function (ev) {

            var alert = _this.$mdDialog.confirm().parent(angular.element(document.body)).title(_this.$translate('serverUpdate')).textContent(_this.$translate('serverUpdateRequestLogoutMessage')).ariaLabel(_this.$translate('serverUpdate')).targetEvent(ev).ok(_this.$translate('ok'));

            _this.$mdDialog.show(alert).then(function () {
                // do nothing
            }, function () {
                // do nothing
            });
        });

        /*
         * Listen for the savingProject event which means the authoring tool
         * is in the process of saving the project
         */
        this.$scope.$on('savingProject', function () {
            // display the message to show that the project is being saved
            _this.setGlobalMessage(_this.$translate('saving'), null);
        });

        /*
         * Listen for the projectSaved event which means the project has just
         * been saved to the server
         */
        this.$scope.$on('projectSaved', function () {

            /*
             * Wait half a second before changing the message to 'Saved' so that
             * the 'Saving...' message stays up long enough for the author to
             * see that the project is saving. If we don't perform this wait,
             * it will always say 'Saved' and authors may wonder whether the
             * project ever gets saved.
             */
            _this.$timeout(function () {
                // get the current time stamp and set the 'Saved' message
                var clientSaveTime = new Date().getTime();
                _this.setGlobalMessage(_this.$translate('SAVED'), clientSaveTime);
            }, 500);
        });
    }

    /**
     * Check if the author is on the My Projects page in the Authoring Tool
     * @returns whether the author is on the My Projects page in the Authoring
     * Tool
     */


    _createClass(AuthoringToolController, [{
        key: 'isAuthorOnMyProjectsPage',
        value: function isAuthorOnMyProjectsPage() {
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

    }, {
        key: 'goToMyProjects',
        value: function goToMyProjects() {
            // send the user to the My Projects page in the Authoring Tool
            this.$location.url('/author');
        }

        /**
         * The user has moved the mouse so
         */

    }, {
        key: 'mouseMoved',
        value: function mouseMoved() {
            /*
             * notify the Session Service that the user has moved the mouse
             * so we can refresh the session
             */
            this.SessionService.mouseMoved();
        }
    }, {
        key: 'exit',
        value: function exit() {
            var _this2 = this;

            // notify others that we've finished authoring
            this.ProjectService.notifyAuthorProjectEnd().then(function () {
                // send the user to the teacher home page
                var wiseBaseURL = _this2.ConfigService.getWISEBaseURL();
                var teacherHomePageURL = wiseBaseURL + '/teacher';
                window.location = teacherHomePageURL;
            });
        }

        /**
         * Set the global message at the top right
         * @param message the message to display
         * @param time the time to display
         */

    }, {
        key: 'setGlobalMessage',
        value: function setGlobalMessage(message, time) {
            this.globalMessage.text = message;
            this.globalMessage.time = time;
        }
    }]);

    return AuthoringToolController;
}();

AuthoringToolController.$inject = ['$filter', '$location', '$mdDialog', '$scope', '$timeout', 'ConfigService', 'ProjectService', 'SessionService', 'moment'];

exports.default = AuthoringToolController;
//# sourceMappingURL=authoringToolController.js.map