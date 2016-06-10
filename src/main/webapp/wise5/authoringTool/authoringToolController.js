'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolController = function () {
    function AuthoringToolController($location, $mdDialog, $scope, $translate, ConfigService, ProjectService, SessionService) {
        var _this = this;

        _classCallCheck(this, AuthoringToolController);

        this.$location = $location;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;

        $scope.$on('showSessionWarning', function () {

            _this.$translate('autoLogoutMessage').then(function (autoLogoutMessage) {
                // Appending dialog to document.body
                var confirm = _this.$mdDialog.confirm().parent(angular.element(document.body)).title('Session Timeout').content(autoLogoutMessage).ariaLabel('Session Timeout').ok('YES').cancel('No');
                _this.$mdDialog.show(confirm).then(function () {
                    _this.SessionService.renewSession();
                }, function () {
                    _this.SessionService.forceLogOut();
                });
            });
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
    }]);

    return AuthoringToolController;
}();

AuthoringToolController.$inject = ['$location', '$mdDialog', '$scope', '$translate', 'ConfigService', 'ProjectService', 'SessionService'];

exports.default = AuthoringToolController;
//# sourceMappingURL=authoringToolController.js.map