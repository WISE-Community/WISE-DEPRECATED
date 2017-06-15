'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolController = function () {
    function AuthoringToolController($filter, $location, $mdDialog, $scope, $state, $timeout, ConfigService, ProjectService, SessionService) {
        var _this = this;

        _classCallCheck(this, AuthoringToolController);

        this.$filter = $filter;
        this.$location = $location;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$state = $state;
        this.$timeout = $timeout;
        this.$translate = this.$filter('translate');
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;

        this.numberProject = true; // TODO: make dynamic or remove

        // the global message that shows up at the top right of the authoring tool
        this.globalMessage = {
            text: '',
            time: ''
        };

        this.menuOpen = false; // boolean to indicate whether authoring sidenav is open

        // ui-views and their corresponding names, labels, and icons
        this.views = {
            'root.project': {
                name: this.$translate('projectStructure'),
                label: this.$translate('projectStructure'),
                icon: 'view_list',
                type: 'primary',
                showToolbar: true,
                active: true
            },
            'root.project.notebook': {
                name: this.$translate('notebookSettings'),
                label: this.$translate('notebookSettings'),
                icon: 'book',
                type: 'primary',
                showToolbar: true,
                active: true
            },
            'root.project.asset': {
                name: this.$translate('fileManager'),
                label: this.$translate('fileManager'),
                icon: 'photo_library',
                type: 'primary',
                showToolbar: true,
                active: true
            },
            'root.project.info': {
                name: this.$translate('PROJECT_INFO'),
                label: this.$translate('PROJECT_INFO'),
                icon: 'info',
                type: 'primary',
                showToolbar: true,
                active: true
            },
            'root.main': {
                name: this.$translate('closeProject'),
                label: this.$translate('closeProject'),
                icon: 'close',
                type: 'secondary',
                showToolbar: false,
                active: true
            },
            'root.project.node': {
                name: '',
                label: '',
                icon: '',
                type: 'secondary',
                showToolbar: true,
                active: false
            }
        };

        this.logoPath = this.ProjectService.getThemePath() + '/images/WISE-logo-ffffff.svg';

        this.processUI();

        // listen for state change events
        this.$scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            // close the menu when the state changes
            _this.menuOpen = false;

            _this.processUI();
        });

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

        /*
         * Open the asset chooser to let the author insert an asset into the
         * specified target
         */
        this.$scope.$on('openAssetChooser', function (event, params) {
            // create the params for opening the asset chooser
            var stateParams = {};
            stateParams.popup = params.popup;
            stateParams.projectId = params.projectId;
            stateParams.nodeId = params.nodeId;
            stateParams.componentId = params.componentId;
            stateParams.target = params.target;
            stateParams.targetObject = params.targetObject;

            // open the dialog that will display the assets for the user to choose
            _this.$mdDialog.show({
                templateUrl: 'wise5/authoringTool/asset/asset.html',
                controller: 'ProjectAssetController',
                controllerAs: 'projectAssetController',
                $stateParams: stateParams,
                clickOutsideToClose: true,
                escapeToClose: true
            });
        });

        /*
         * Open the asset chooser to let the author insert an WISE Link into the
         * specified target
         */
        this.$scope.$on('openWISELinkChooser', function (event, params) {

            // create the params for opening the WISE Link authoring popup
            var stateParams = {};
            stateParams.projectId = params.projectId;
            stateParams.nodeId = params.nodeId;
            stateParams.componentId = params.componentId;
            stateParams.target = params.target;

            // open the WISE Link authoring popup
            _this.$mdDialog.show({
                templateUrl: 'wise5/authoringTool/wiseLink/wiseLinkAuthoring.html',
                controller: 'WISELinkAuthoringController',
                controllerAs: 'wiseLinkAuthoringController',
                $stateParams: stateParams,
                clickOutsideToClose: true,
                escapeToClose: true
            });
        });
    }

    /**
     * Update UI items based on state, show or hide relevant menus and toolbars
     * TODO: remove/rework this and put items in their own ui states?
     */


    _createClass(AuthoringToolController, [{
        key: 'processUI',
        value: function processUI() {
            // set current view and whether to show the toolbars and step tools
            this.showStepTools = this.$state.$current.name === 'root.project.node';
            var view = this.views[this.$state.$current.name];

            if (view) {
                this.currentViewName = view.name;
                this.showToolbar = view.showToolbar;
            } else {
                this.showToolbar = false;
                this.currentViewName = '';
            }

            this.projectId = this.ConfigService.getProjectId();
            this.runId = this.ConfigService.getRunId();

            if (this.projectId) {
                this.projectTitle = this.ProjectService.getProjectTitle();
            } else {
                this.projectTitle = null;
            }
        }

        /**
         * Check if the author is on the My Projects page in the Authoring Tool
         * @returns whether the author is on the My Projects page in the Authoring
         * Tool
         */

    }, {
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
         * Toggle the authoring tool main menu
         */

    }, {
        key: 'toggleMenu',
        value: function toggleMenu() {
            this.menuOpen = !this.menuOpen;
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

AuthoringToolController.$inject = ['$filter', '$location', '$mdDialog', '$scope', '$state', '$timeout', 'ConfigService', 'ProjectService', 'SessionService', 'moment'];

exports.default = AuthoringToolController;
//# sourceMappingURL=authoringToolController.js.map