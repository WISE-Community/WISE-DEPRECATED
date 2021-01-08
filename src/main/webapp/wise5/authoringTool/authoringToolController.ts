'use strict';
import { Directive } from '@angular/core';
import * as angular from 'angular';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/configService';
import { NotificationService } from '../services/notificationService';
import { SessionService } from '../services/sessionService';
import { TeacherDataService } from '../services/teacherDataService';
import { TeacherProjectService } from '../services/teacherProjectService';

@Directive()
class AuthoringToolController {
  $anchorScroll: any;
  $filter: any;
  $mdDialog: any;
  $rootScope: any;
  $scope: any;
  $state: any;
  $transitions: any;
  $translate: any;
  $timeout: any;
  currentViewName: string;
  isMenuOpen: boolean = false;
  logoPath: string;
  numberProject: boolean = true;
  projectId: number;
  projectTitle: string;
  runId: number;
  runCode: string;
  showStepTools: boolean = false;
  showToolbar: boolean = true;
  views: any;
  ConfigService: ConfigService;
  NotificationService: NotificationService;
  ProjectService: TeacherProjectService;
  SessionService: SessionService;
  TeacherDataService: TeacherDataService;
  errorSavingProjectSubscription: Subscription;
  notAllowedToEditThisProjectSubscription: Subscription;
  notLoggedInProjectNotSavedSubscription: Subscription;
  projectSavedSubscription: Subscription;
  savingProjectSubscription: Subscription;
  showSessionWarningSubscription: Subscription;

  static $inject = [
    '$anchorScroll',
    '$filter',
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    '$transitions',
    '$timeout',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'SessionService',
    'TeacherDataService'
  ];

  constructor(
    $anchorScroll,
    $filter,
    $mdDialog,
    $rootScope,
    $scope,
    $state,
    $transitions,
    $timeout,
    ConfigService,
    NotificationService,
    ProjectService,
    SessionService,
    TeacherDataService
  ) {
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$transitions = $transitions;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.ConfigService = ConfigService;
    this.NotificationService = NotificationService;
    this.ProjectService = ProjectService;
    this.SessionService = SessionService;
    this.TeacherDataService = TeacherDataService;
    this.logoPath = ProjectService.getThemePath() + '/images/WISE-logo-ffffff.svg';
    this.views = {
      'root.at.project': {
        id: 'projectHomeButton',
        name: this.$translate('projectHome'),
        label: this.$translate('projectHome'),
        icon: 'home',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.at.project.info': {
        id: 'infoButton',
        name: this.$translate('PROJECT_INFO'),
        label: this.$translate('PROJECT_INFO'),
        icon: 'info',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.at.project.asset': {
        id: 'assetButton',
        name: this.$translate('fileManager'),
        label: this.$translate('fileManager'),
        icon: 'attach_file',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.at.project.notebook': {
        id: 'notebookButton',
        name: this.$translate('notebookSettings'),
        label: this.$translate('notebookSettings'),
        icon: 'book',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.at.project.milestones': {
        id: 'milestonesButton',
        name: this.$translate('MILESTONES'),
        label: this.$translate('MILESTONES'),
        icon: 'flag',
        type: 'primary',
        showToolbar: true,
        active: true
      },
      'root.at.main': {
        id: 'projectListButton',
        name: this.$translate('projectsList'),
        label: this.$translate('projectsList'),
        icon: 'reorder',
        type: 'primary',
        showToolbar: false,
        active: true
      },
      'root.at.project.node': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.advanced.branch': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.advanced.constraint': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.advanced.path': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.advanced': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.advanced.general': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.advanced.json': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.advanced': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.rubric': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      },
      'root.at.project.node.edit-rubric': {
        name: '',
        label: '',
        icon: '',
        type: 'secondary',
        showToolbar: true,
        active: false
      }
    };
    this.processUI();

    $transitions.onSuccess({}, ($transition) => {
      this.isMenuOpen = false;
      this.processUI();
      if ($transition.name === 'root.at.main') {
        this.saveEvent('projectListViewed', 'Navigation');
      }
    });

    this.showSessionWarningSubscription = this.SessionService.showSessionWarning$.subscribe(() => {
      const confirm = this.$mdDialog
        .confirm()
        .parent(angular.element(document.body))
        .theme('at')
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
          this.logOut();
        }
      );
    });

    this.SessionService.logOut$.subscribe(() => {
      this.logOut();
    });

    this.savingProjectSubscription = this.ProjectService.savingProject$.subscribe(() => {
      this.setGlobalMessage(this.$translate('saving'), true, null);
    });

    this.projectSavedSubscription = this.ProjectService.projectSaved$.subscribe(() => {
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

    this.errorSavingProjectSubscription = this.ProjectService.errorSavingProject$.subscribe(() => {
      this.setGlobalMessage(this.$translate('errorSavingProject'), false, null);
    });

    this.notLoggedInProjectNotSavedSubscription = this.ProjectService.notLoggedInProjectNotSaved$.subscribe(
      () => {
        this.setGlobalMessage(this.$translate('notLoggedInProjectNotSaved'), false, null);
      }
    );

    this.notAllowedToEditThisProjectSubscription = this.ProjectService.notAllowedToEditThisProject$.subscribe(
      () => {
        this.setGlobalMessage(this.$translate('notAllowedToEditThisProject'), false, null);
      }
    );

    if (this.$state.current.name === 'root.at.main') {
      this.saveEvent('projectListViewed', 'Navigation');
    }

    if (!this.ConfigService.getConfigParam('canEditProject')) {
      this.$timeout(() => {
        this.setGlobalMessage(this.$translate('notAllowedToEditThisProject'), false, null);
      }, 1000);
    }

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.errorSavingProjectSubscription.unsubscribe();
    this.notAllowedToEditThisProjectSubscription.unsubscribe();
    this.notLoggedInProjectNotSavedSubscription.unsubscribe();
    this.projectSavedSubscription.unsubscribe();
    this.savingProjectSubscription.unsubscribe();
    this.showSessionWarningSubscription.unsubscribe();
  }

  /**
   * Update UI items based on state, show or hide relevant menus and toolbars
   * TODO: remove/rework this and put items in their own ui states?
   */
  processUI() {
    this.$anchorScroll('top');
    this.showStepTools = [
      'root.at.project',
      'root.at.project.node',
      'root.at.project.node.advanced',
      'root.at.project.node.advanced.branch',
      'root.at.project.node.advanced.constraint',
      'root.at.project.node.advanced.general',
      'root.at.project.node.advanced.json',
      'root.at.project.node.advanced.path'
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
    this.runCode = this.ConfigService.getRunCode();
    if (this.projectId) {
      this.projectTitle = this.ProjectService.getProjectTitle();
    } else {
      this.projectTitle = null;
    }
    this.turnOffJSONValidMessage();
  }

  turnOffJSONValidMessage() {
    this.NotificationService.hideJSONValidMessage();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  mouseMoved() {
    this.SessionService.mouseMoved();
  }

  exit() {
    this.ProjectService.notifyAuthorProjectEnd().then(() => {
      window.location.href = `${this.ConfigService.getWISEBaseURL()}/teacher`;
    });
  }

  setGlobalMessage(message, isProgressIndicatorVisible, time) {
    const globalMessage = {
      text: message,
      isProgressIndicatorVisible: isProgressIndicatorVisible,
      time: time
    };
    this.NotificationService.broadcastSetGlobalMessage({ globalMessage: globalMessage });
  }

  logOut() {
    this.saveEvent('logOut', 'Navigation').then(() => {
      this.SessionService.logOut();
    });
  }

  saveEvent(eventName, category): any {
    const context = 'AuthoringTool';
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const data = {};
    return this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data
    ).then((result) => {
      return result;
    });
  }
}

export default AuthoringToolController;
