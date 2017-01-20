'use strict';

class ClassroomMonitorController {

    constructor($filter,
                $mdDialog,
                $rootScope,
                $scope,
                $state,
                $stateParams,
                ConfigService,
                NotebookService,
                NotificationService,
                ProjectService,
                SessionService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$filter = $filter;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.$translate = this.$filter('translate');

        this.projectName = this.ProjectService.getProjectTitle();
        this.runId = this.ConfigService.getRunId();

        this.numberProject = true; // TODO: make dynamic or remove

        this.menuOpen = false; // boolean to indicate whether monitor nav menu is open
        this.showSideMenu = true; // boolean to indicate whether to show the monitor side menu
        this.showMonitorToolbar = true; // boolean to indicate whether to show the monitor toolbar
        this.showStepToolbar = false; // boolean to indicate whether to show the step toolbar

        // ui-views and their corresponding names, labels, and icons
        this.views = {
            'root.dashboard': {
                name: this.$translate('dashboardView'),
                label: this.$translate('dashboardViewLabel'),
                icon: 'dashboard',
                type: 'primary',
                active: false
            },
            'root.nodeProgress': {
                name: this.$translate('projectView'),
                label: this.$translate('projectViewLabel'),
                icon: 'assignment_turned_in',
                type: 'primary',
                active: true
            },
            'root.studentProgress': {
                name: this.$translate('studentView'),
                label: this.$translate('studentViewLabel'),
                icon: 'people',
                type: 'primary',
                active: true
            },
            'root.notebooks': {
                name: this.$translate('notebookView'),
                label: this.$translate('notebookViewLabel'),
                icon: 'chrome_reader_mode',
                type: 'primary',
                active: this.NotebookService.isNotebookEnabled()
            },
            'root.export': {
                name: this.$translate('exportView'),
                label: this.$translate('exportViewLabel'),
                icon: 'file_download',
                type: 'secondary',
                active: true
            },
            'root.notes': {
                name: this.$translate('notesTipsView'),
                label: this.$translate('notesTipsViewLabel'),
                icon: 'speaker_notes',
                type: 'secondary',
                active: false
            }
        };

        this.$scope.$on('showSessionWarning', () => {
            // Appending dialog to document.body
            let confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Session Timeout')
                .content('You have been inactive for a long time. Do you want to stay logged in?')
                .ariaLabel('Session Timeout')
                .ok('YES')
                .cancel('No');
            $mdDialog.show(confirm).then(() => {
                this.SessionService.renewSession();
            }, () => {
                this.SessionService.forceLogOut();
            });
        });

        // alert user when inactive for a long time
        this.$scope.$on('showRequestLogout', (ev) => {
            let alert = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title(translations.serverUpdate)
                .textContent(this.$translate('serverUpdateRequestLogoutMessage'))
                .ariaLabel(this.$translate('serverUpdate'))
                .targetEvent(ev)
                .ok(this.$translate('ok'));

            $mdDialog.show(alert).then(() => {
                // do nothing
            }, () => {
                // do nothing
            });
        });

        // listen for state change events
        this.$rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            // close the menu when the state changes
            this.menuOpen = false;

            this.processUI();
        });

        // update UI items; TODO: remove eventually
        this.processUI();

        this.themePath = this.ProjectService.getThemePath();

        this.notifications = this.NotificationService.notifications;
        // watch for changes in notifications
        this.$scope.$watch(
            () => {
                return this.NotificationService.notifications.length;
            },
            (newValue, oldValue) => {
                this.notifications = this.NotificationService.notifications;
            }
        );

        // save event when classroom monitor session is started
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "Navigation", event = "sessionStarted", data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    /**
     * Update UI items based on state, show or hide relevant menus and toolbars
     * TODO: remove/rework this and put items in their own ui states
     */
    processUI() {
        if (this.$state.$current.name === 'root.nodeProgress') {
            let nodeId = this.$state.params.nodeId;
            let showMenu = true;
            let showMonitorToolbar = true;
            let showStepToolbar = false;
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
    };

    /**
     * Returns true iff there are new notifications
     * TODO: move to TeacherDataService
     */
    hasNewNotifications() {
        return this.getNewNotifications().length > 0;
    }

    /**
     * Returns all teacher notifications that have not been dismissed yet
     * TODO: move to TeacherDataService, take into account shared teacher users
     */
    getNewNotifications() {
        return this.notifications.filter(
            notification => {
                return (notification.timeDismissed == null && notification.toWorkgroupId === this.ConfigService.getWorkgroupId());
            }
        );
    }

    /**
     * Show confirmation dialog before dismissing all notifications
     */
    confirmDismissAllNotifications(ev) {
        if (this.getNewNotifications().length > 1) {
            let confirm = this.$mdDialog.confirm()
                .parent(angular.element($('._md-open-menu-container._md-active')))// TODO: hack for now (showing md-dialog on top of md-menu)
                .ariaLabel(this.$translate('dismissNotificationsTitle'))
                .textContent(this.$translate('dismissNotificationsMessage'))
                .targetEvent(ev)
                .ok(this.$translate('yes'))
                .cancel(this.$translate('no'));

            this.$mdDialog.show(confirm).then(() => {
                this.dismissAllNotifications();
            });
        } else {
            this.dismissAllNotifications();
        }
    }

    /**
     * Dismiss all new notifications
     */
    dismissAllNotifications() {
        let newNotifications = this.getNewNotifications();
        newNotifications.map((newNotification) => {
            this.dismissNotification(newNotification);
        });
    }

    /**
     * Dismiss the specified notification
     * @param notification
     */
    dismissNotification(notification) {
        this.NotificationService.dismissNotification(notification);
    }
    /**
     * The user has moved the mouse so we will notify the Session Service
     * so that it can refresh the session
     */
    mouseMoved() {
        /*
         * notify the Session Service that the user has moved the mouse
         * so we can refresh the session
         */
        this.SessionService.mouseMoved();
    }
}

ClassroomMonitorController.$inject = [
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    'ConfigService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'SessionService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default ClassroomMonitorController;
