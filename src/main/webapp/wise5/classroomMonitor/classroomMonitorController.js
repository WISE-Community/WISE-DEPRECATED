'use strict';

class ClassroomMonitorController {

    constructor($filter,
                $mdDialog,
                $mdToast,
                $rootScope,
                $scope,
                $state,
                $window,
                ConfigService,
                NodeService,
                NotebookService,
                NotificationService,
                ProjectService,
                SessionService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$filter = $filter;
        this.$mdToast = $mdToast;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$window = $window;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.SessionService = SessionService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.$translate = this.$filter('translate');

        this.projectTitle = this.ProjectService.getProjectTitle();
        this.runId = this.ConfigService.getRunId();

        this.numberProject = true; // TODO: make dynamic or remove

        this.menuOpen = false; // boolean to indicate whether monitor nav menu is open
        this.showSideMenu = true; // boolean to indicate whether to show the monitor side menu
        this.showToolbar = true; // boolean to indicate whether to show the monitor toolbar
        this.showGradeByStepTools = false; // boolean to indicate whether to show the step toolbar
        this.showPeriodSelect = false; // boolean to indicate whether to show the period select
        this.enableProjectAchievements = this.ProjectService.getAchievements().isEnabled;

        // ui-views and their corresponding names and icons
        this.views = {
            'root.dashboard': {
                name: this.$translate('dashboard'),
                icon: 'dashboard',
                type: 'primary',
                active: false
            },
            'root.milestones': {
                name: this.$translate('milestones'),
                icon: 'flag',
                type: 'primary',
                active: this.enableProjectAchievements
            },
            'root.project': {
                name: this.$translate('gradeByStep'),
                icon: 'view_list',
                type: 'primary',
                action: () => {
                    let currentView = this.$state.current.name;
                    if (currentView === 'root.project') {
                        // if we're currently grading a step, close the node when a nodeProgress menu button is clicked
                        this.NodeService.closeNode();
                    }
                },
                active: true
            },
            'root.teamLanding': {
                name: this.$translate('gradeByTeam'),
                icon: 'people',
                type: 'primary',
                active: true
            },
            'root.manageStudents': {
                name: this.$translate('manageStudents'),
                icon: 'face',
                type: 'primary',
                active: true
            },
            'root.notebooks': {
                name: this.$translate('studentNotebooks'),
                icon: 'chrome_reader_mode',
                type: 'primary',
                active: this.NotebookService.isNotebookEnabled()
            },
            'root.export': {
                name: this.$translate('dataExport'),
                icon: 'file_download',
                type: 'secondary',
                active: true
            }
        };

        // build server disconnect display
        this.connectionLostDisplay = this.$mdToast.build({
            template: `<md-toast>
                        <span>{{ ::'ERROR_CHECK_YOUR_INTERNET_CONNECTION' | translate }}</span>
                      </md-toast>`,
            hideDelay: 0
        });
        this.connectionLostShown = false;

        // alert user when inactive for a long time
        this.$scope.$on('showSessionWarning', () => {
            // Appending dialog to document.body
            let confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title(this.$translate('SESSION_TIMEOUT'))
                .content(this.$translate('SESSION_TIMEOUT_MESSAGE'))
                .ariaLabel(this.$translate('SESSION_TIMEOUT'))
                .ok(this.$translate('YES'))
                .cancel(this.$translate('NO'));
            $mdDialog.show(confirm).then(() => {
                this.SessionService.closeWarningAndRenewSession();
            }, () => {
                this.SessionService.forceLogOut();
            });
        });

        // alert user when server is going to be updated
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

        // alert user when server loses connection
        this.$scope.$on('serverDisconnected', () => {
            this.handleServerDisconnect();
        });

        // remove alert when server regains connection
        this.$scope.$on('serverConnected', () => {
            this.handleServerReconnect();
        });

        // TODO: make dynamic, set somewhere like in config?
        this.logoPath = this.ProjectService.getThemePath() + '/images/WISE-logo-ffffff.svg';

        this.processUI();

        this.themePath = this.ProjectService.getThemePath();

        this.notifications = this.NotificationService.notifications;

        // save event when classroom monitor session is started
        let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
            category = "Navigation", event = "sessionStarted", data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);

        // perform cleanup before the clasroom monitor tab closes
        this.$window.onbeforeunload = () => {
            const periods = this.TeacherDataService.getRunStatus().periods;
            if (periods != null) {
                for (var p = 0; p < periods.length; p++) {
                    const period = periods[p];
                    if (period != null && period.periodId !== -1 && period.paused) {
                        this.TeacherDataService.pauseScreensChanged(period.periodId, false);
                    }
                }
            }
        };
    }

    /**
     * Update UI items based on state, show or hide relevant menus and toolbars
     * TODO: remove/rework this and put items in their own ui states?
     */
    processUI() {
        let viewName = this.$state.$current.name;
        let currentView = this.views[viewName];
        if (currentView) {
            this.currentViewName = currentView.name;
        }

        this.showGradeByStepTools = false;
        this.showGradeByTeamTools = false;
        this.showPeriodSelect = true;
        this.workgroupId = null;

        if (viewName === 'root.project') {
            let nodeId = this.$state.params.nodeId;
            this.showGradeByStepTools = this.ProjectService.isApplicationNode(nodeId);
        } else if (viewName === 'root.team') {
            this.workgroupId = parseInt(this.$state.params.workgroupId);
            this.showGradeByTeamTools = true;
        } else if (viewName === 'root.export') {
            this.showPeriodSelect = false;
        }
    };

    /**
     * Toggle the classroom monitor main menu
     */
    toggleMenu() {
        this.menuOpen = !this.menuOpen;
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

    // show server error alert when connection is lost
    handleServerDisconnect() {
        if (!this.connectionLostShown) {
          this.$mdToast.show(this.connectionLostDisplay);
          this.connectionLostShown = true;
        }
    }

    // hide server error alert when connection is restored
    handleServerReconnect() {
        this.$mdToast.hide(this.connectionLostDisplay);
        this.connectionLostShown = false;
    }
}

ClassroomMonitorController.$inject = [
    '$filter',
    '$mdDialog',
    '$mdToast',
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'SessionService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

export default ClassroomMonitorController;
