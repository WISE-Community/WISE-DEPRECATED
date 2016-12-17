'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClassroomMonitorController = function () {
    function ClassroomMonitorController($mdDialog, $rootScope, $scope, $state, $stateParams, $translate, ConfigService, NotificationService, ProjectService, SessionService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, ClassroomMonitorController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.projectName = this.ProjectService.getProjectTitle();
        this.runId = this.ConfigService.getRunId();

        this.numberProject = true; // TODO: make dynamic or remove

        this.menuOpen = false; // boolean to indicate whether monitor nav menu is open
        this.showSideMenu = true; // boolean to indicate whether to show the monitor side menu
        this.showMonitorToolbar = true; // boolean to indicate whether to show the monitor toolbar
        this.showStepToolbar = false; // boolean to indicate whether to show the step toolbar

        // ui-views and their corresponding names, labels, and icons
        this.$translate(['dashboardView', 'dashboardViewLabel', 'projectView', 'projectViewLabel', 'studentView', 'studentViewLabel', 'notebookView', 'notebookViewLabel', 'exportView', 'exportViewLabel', 'notesTipsView', 'notesTipsViewLabel']).then(function (translation) {
            _this.views = {
                'root.dashboard': {
                    name: translation.dashboardView,
                    label: translation.dashboardViewLabel,
                    icon: 'dashboard',
                    type: 'primary',
                    active: false
                },
                'root.nodeProgress': {
                    name: translation.projectView,
                    label: translation.projectViewLabel,
                    icon: 'assignment_turned_in',
                    type: 'primary',
                    active: true
                },
                'root.studentProgress': {
                    name: translation.studentView,
                    label: translation.studentViewLabel,
                    icon: 'people',
                    type: 'primary',
                    active: true
                },
                'root.notebooks': {
                    name: translation.notebookView,
                    label: translation.notebookViewLabel,
                    icon: 'chrome_reader_mode',
                    type: 'secondary',
                    active: false
                },
                'root.export': {
                    name: translation.exportView,
                    label: translation.exportViewLabel,
                    icon: 'file_download',
                    type: 'secondary',
                    active: true
                },
                'root.notes': {
                    name: translation.notesTipsView,
                    label: translation.notesTipsViewLabel,
                    icon: 'speaker_notes',
                    type: 'secondary',
                    active: false
                }
            };
        });

        this.$scope.$on('showSessionWarning', function () {
            // Appending dialog to document.body
            var confirm = $mdDialog.confirm().parent(angular.element(document.body)).title('Session Timeout').content('You have been inactive for a long time. Do you want to stay logged in?').ariaLabel('Session Timeout').ok('YES').cancel('No');
            $mdDialog.show(confirm).then(function () {
                _this.SessionService.renewSession();
            }, function () {
                _this.SessionService.forceLogOut();
            });
        });

        // alert user when inactive for a long time
        this.$scope.$on('showRequestLogout', function (ev) {
            _this.$translate(["serverUpdate", "serverUpdateRequestLogoutMessage", "ok"]).then(function (translations) {

                var alert = $mdDialog.confirm().parent(angular.element(document.body)).title(translations.serverUpdate).textContent(translations.serverUpdateRequestLogoutMessage).ariaLabel(translations.serverUpdate).targetEvent(ev).ok(translations.ok);

                $mdDialog.show(alert).then(function () {
                    // do nothing
                }, function () {
                    // do nothing
                });
            });
        });

        // listen for state change events
        this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            // close the menu when the state changes
            _this.menuOpen = false;

            _this.processUI();
        });

        // update UI items; TODO: remove eventually
        this.processUI();

        this.themePath = this.ProjectService.getThemePath();

        this.notifications = this.NotificationService.notifications;
        // watch for changes in notifications
        this.$scope.$watch(function () {
            return _this.NotificationService.notifications.length;
        }, function (newValue, oldValue) {
            _this.notifications = _this.NotificationService.notifications;
        });

        // save event when classroom monitor session is started
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "sessionStarted",
            data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    /**
     * Update UI items based on state, show or hide relevant menus and toolbars
     * TODO: remove/rework this and put items in their own ui states
     */


    _createClass(ClassroomMonitorController, [{
        key: 'processUI',
        value: function processUI() {
            if (this.$state.$current.name === 'root.nodeProgress') {
                var nodeId = this.$state.params.nodeId;
                var showMenu = true;
                var showMonitorToolbar = true;
                var showStepToolbar = false;
                if (nodeId) {
                    if (this.ProjectService.isApplicationNode(nodeId)) {
                        showMenu = false;
                        showMonitorToolbar = false;
                        showStepToolbar = true;
                    }
                }
                this.showSideMenu = showMenu;
                this.showMonitorToolbar = showMonitorToolbar;
                this.showStepToolbar = showStepToolbar;
            }
        }
    }, {
        key: 'hasNewNotifications',


        /**
         * Returns true iff there are new notifications
         * TODO: move to TeacherDataService
         */
        value: function hasNewNotifications() {
            return this.getNewNotifications().length > 0;
        }

        /**
         * Returns all teacher notifications that have not been dismissed yet
         * TODO: move to TeacherDataService, take into account shared teacher users
         */

    }, {
        key: 'getNewNotifications',
        value: function getNewNotifications() {
            var _this2 = this;

            return this.notifications.filter(function (notification) {
                return notification.timeDismissed == null && notification.toWorkgroupId === _this2.ConfigService.getWorkgroupId();
            });
        }

        /**
         * Show confirmation dialog before dismissing all notifications
         */

    }, {
        key: 'confirmDismissAllNotifications',
        value: function confirmDismissAllNotifications(ev) {
            var _this3 = this;

            if (this.getNewNotifications().length > 1) {
                this.$translate(["dismissNotificationsTitle", "dismissNotificationsMessage", "yes", "no"]).then(function (translations) {
                    var confirm = _this3.$mdDialog.confirm().parent(angular.element($('._md-open-menu-container._md-active'))) // TODO: hack for now (showing md-dialog on top of md-menu)
                    .ariaLabel(translations.dismissNotificationsTitle).textContent(translations.dismissNotificationsMessage).targetEvent(ev).ok(translations.yes).cancel(translations.no);

                    _this3.$mdDialog.show(confirm).then(function () {
                        _this3.dismissAllNotifications();
                    });
                });
            } else {
                this.dismissAllNotifications();
            }
        }

        /**
         * Dismiss all new notifications
         */

    }, {
        key: 'dismissAllNotifications',
        value: function dismissAllNotifications() {
            var _this4 = this;

            var newNotifications = this.getNewNotifications();
            newNotifications.map(function (newNotification) {
                _this4.dismissNotification(newNotification);
            });
        }

        /**
         * Dismiss the specified notification
         * @param notification
         */

    }, {
        key: 'dismissNotification',
        value: function dismissNotification(notification) {
            this.NotificationService.dismissNotification(notification);
        }
        /**
         * The user has moved the mouse so we will notify the Session Service
         * so that it can refresh the session
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
    }]);

    return ClassroomMonitorController;
}();

ClassroomMonitorController.$inject = ['$mdDialog', '$rootScope', '$scope', '$state', '$stateParams', '$translate', 'ConfigService', 'NotificationService', 'ProjectService', 'SessionService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = ClassroomMonitorController;
//# sourceMappingURL=classroomMonitorController.js.map