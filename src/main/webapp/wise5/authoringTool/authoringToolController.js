'use strict';

class AuthoringToolController {
  constructor(
    $anchorScroll,
    $filter,
    $location,
    $mdDialog,
    $rootScope,
    $scope,
    $state,
    $transitions,
    $timeout,
    ConfigService,
    ProjectService,
    SessionService,
    TeacherDataService
  ) {
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$location = $location;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$transitions = $transitions;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.SessionService = SessionService;
    this.TeacherDataService = TeacherDataService;
    this.numberProject = true; // TODO: make dynamic or remove
    this.isMenuOpen = false;
    this.views = {
      'root.project': {
        id: 'projectHomeButton',
        name: this.$translate('projectHome'),
        label: this.$translate('projectHome'),
        icon: 'home',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.project.notebook': {
        id: 'notebookButton',
        name: this.$translate('notebookSettings'),
        label: this.$translate('notebookSettings'),
        icon: 'book',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.project.asset': {
        id: 'assetButton',
        name: this.$translate('fileManager'),
        label: this.$translate('fileManager'),
        icon: 'attach_file',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.project.info': {
        id: 'infoButton',
        name: this.$translate('PROJECT_INFO'),
        label: this.$translate('PROJECT_INFO'),
        icon: 'info',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.main': {
        id: 'projectListButton',
        name: this.$translate('projectsList'),
        label: this.$translate('projectsList'),
        icon: 'reorder',
        type: 'primary',
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
      },
      'root.project.nodeConstraints': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.project.nodeEditPaths': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.project.advanced': {
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

    $transitions.onSuccess({}, $transition => {
      this.isMenuOpen = false;
      this.processUI();
      if ($transition.name === 'root.main') {
        this.saveEvent('projectListViewed', 'Navigation');
      }
    });

    $scope.$on('showSessionWarning', () => {
      const confirm = this.$mdDialog
        .confirm()
        .parent(angular.element(document.body))
        .title(this.$translate('sessionTimeout'))
        .content(this.$translate('autoLogoutMessage'))
        .ariaLabel(this.$translate('sessionTimeout'))
        .ok(this.$translate('yes'))
        .cancel(this.$translate('no'));
      this.$mdDialog.show(confirm).then(
        () => {
          this.SessionService.closeWarningAndRenewSession();
        },
        () => {
          this.SessionService.forceLogOut();
        }
      );
    });

    this.$scope.$on('showRequestLogout', ev => {
      const alert = this.$mdDialog
        .confirm()
        .parent(angular.element(document.body))
        .title(this.$translate('serverUpdate'))
        .textContent(this.$translate('serverUpdateRequestLogoutMessage'))
        .ariaLabel(this.$translate('serverUpdate'))
        .targetEvent(ev)
        .ok(this.$translate('ok'));
      this.$mdDialog.show(alert);
    });

    /*
     * Listen for the savingProject event which means the authoring tool
     * is in the process of saving the project and display this information
     * globally.
     */
    this.$scope.$on('savingProject', () => {
      this.setGlobalMessage(this.$translate('saving'), true, null);
    });

    /*
     * Listen for the projectSaved event which means the project has just
     * been saved to the server
     */
    this.$scope.$on('projectSaved', () => {
      /*
       * Wait half a second before changing the message to 'Saved' so that
       * the 'Saving...' message stays up long enough for the author to
       * see that the project is saving. If we don't perform this wait,
       * it will always say 'Saved' and authors may wonder whether the
       * project ever gets saved.
       */
      this.$timeout(() => {
        this.setGlobalMessage(this.$translate('SAVED'), false, new Date().getTime());
      }, 500);
    });

    this.$scope.$on('errorSavingProject', () => {
      this.setGlobalMessage(this.$translate('errorSavingProject'), false, null);
    });

    this.$scope.$on('notLoggedInProjectNotSaved', () => {
      this.setGlobalMessage(this.$translate('notLoggedInProjectNotSaved'), false, null);
    });

    this.$scope.$on('notAllowedToEditThisProject', () => {
      this.setGlobalMessage(this.$translate('notAllowedToEditThisProject'), false, null);
    });

    this.$scope.$on('openAssetChooser', (event, params) => {
      const stateParams = {
        isPopup: params.isPopup,
        projectId: params.projectId,
        nodeId: params.nodeId,
        componentId: params.componentId,
        target: params.target,
        targetObject: params.targetObject
      };
      this.$mdDialog.show({
        templateUrl: 'wise5/authoringTool/asset/asset.html',
        controller: 'ProjectAssetController',
        controllerAs: 'projectAssetController',
        $stateParams: stateParams,
        clickOutsideToClose: true,
        escapeToClose: true
      });
    });

    this.$scope.$on('openWISELinkChooser', (event, params) => {
      const stateParams = {
        projectId: params.projectId,
        nodeId: params.nodeId,
        componentId: params.componentId,
        target: params.target
      };
      this.$mdDialog.show({
        templateUrl: 'wise5/authoringTool/wiseLink/wiseLinkAuthoring.html',
        controller: 'WISELinkAuthoringController',
        controllerAs: 'wiseLinkAuthoringController',
        $stateParams: stateParams,
        clickOutsideToClose: true,
        escapeToClose: true
      });
    });

    if (this.$state.current.name === 'root.main') {
      this.saveEvent('projectListViewed', 'Navigation');
    }

    if (!this.ConfigService.getConfigParam('canEditProject')) {
      this.$timeout(() => {
        this.setGlobalMessage(this.$translate('notAllowedToEditThisProject'), false, null);
      }, 1000);
    }
  }

  /**
   * Update UI items based on state, show or hide relevant menus and toolbars
   * TODO: remove/rework this and put items in their own ui states?
   */
  processUI() {
    this.$anchorScroll('top');
    this.showStepTools = [
      'root.project',
      'root.project.node',
      'root.project.nodeConstraints',
      'root.project.nodeEditPaths'
    ].includes(this.$state.$current.name);
    const view = this.views[this.$state.$current.name];
    if (view) {
      this.currentViewName = view.name;
      this.showToolbar = view.showToolbar;
    } else {
      this.currentViewName = '';
      this.showToolbar = false;
    }
    this.projectId = this.ConfigService.getProjectId();
    this.runId = this.ConfigService.getRunId();
    if (this.projectId) {
      this.projectTitle = this.ProjectService.getProjectTitle();
    } else {
      this.projectTitle = null;
    }
    this.turnOffJSONValidMessage();
  }

  turnOffJSONValidMessage() {
    this.$rootScope.$broadcast('setIsJSONValid', { isJSONValid: null });
  }

  goToMyProjects() {
    this.$location.url('/author');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  mouseMoved() {
    this.SessionService.mouseMoved();
  }

  exit() {
    this.ProjectService.notifyAuthorProjectEnd().then(() => {
      window.location = `${this.ConfigService.getWISEBaseURL()}/teacher`;
    });
  }

  setGlobalMessage(message, isProgressIndicatorVisible, time) {
    const globalMessage = {
      text: message,
      isProgressIndicatorVisible: isProgressIndicatorVisible,
      time: time
    };
    this.$rootScope.$broadcast('setGlobalMessage', { globalMessage: globalMessage });
  }

  /**
   * Save an Authoring Tool event
   * @param eventName the name of the event
   * @param category the category of the event
   * example 'Navigation' or 'Authoring'
   */
  saveEvent(eventName, category) {
    const context = 'AuthoringTool';
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const data = {};
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data
    );
  }
}

AuthoringToolController.$inject = [
  '$anchorScroll',
  '$filter',
  '$location',
  '$mdDialog',
  '$rootScope',
  '$scope',
  '$state',
  '$transitions',
  '$timeout',
  'ConfigService',
  'ProjectService',
  'SessionService',
  'TeacherDataService'
];

export default AuthoringToolController;
