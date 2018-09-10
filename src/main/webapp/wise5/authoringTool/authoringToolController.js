'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthoringToolController = function () {
  function AuthoringToolController($anchorScroll, $filter, $location, $mdDialog, $rootScope, $scope, $state, $timeout, ConfigService, ProjectService, SessionService, TeacherDataService) {
    var _this = this;

    _classCallCheck(this, AuthoringToolController);

    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$location = $location;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.SessionService = SessionService;
    this.TeacherDataService = TeacherDataService;

    this.numberProject = true; // TODO: make dynamic or remove
    this.isMenuOpen = false;

    // ui-views and their corresponding names, labels, and icons
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
      }
    };

    this.logoPath = this.ProjectService.getThemePath() + '/images/WISE-logo-ffffff.svg';
    this.processUI();

    // listen for state change events and close the menu
    this.$scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      _this.isMenuOpen = false;
      _this.processUI();
    });

    $scope.$on('showSessionWarning', function () {
      var confirm = _this.$mdDialog.confirm().parent(angular.element(document.body)).title(_this.$translate('sessionTimeout')).content(_this.$translate('autoLogoutMessage')).ariaLabel(_this.$translate('sessionTimeout')).ok(_this.$translate('yes')).cancel(_this.$translate('no'));
      _this.$mdDialog.show(confirm).then(function () {
        _this.SessionService.renewSession();
      }, function () {
        _this.SessionService.forceLogOut();
      });
    });

    // alert user when they're inactive for a long time
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
     * is in the process of saving the project and display this information
     * globally.
     */
    this.$scope.$on('savingProject', function () {
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
        _this.setGlobalMessage(_this.$translate('SAVED'), new Date().getTime());
      }, 500);
    });

    /*
     * Open the asset chooser to let the author insert an asset into the
     * specified target
     */
    this.$scope.$on('openAssetChooser', function (event, params) {
      // create the params for opening the asset chooser
      var stateParams = {
        isPopup: params.isPopup,
        projectId: params.projectId,
        nodeId: params.nodeId,
        componentId: params.componentId,
        target: params.target,
        targetObject: params.targetObject
      };

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
      var stateParams = {
        projectId: params.projectId,
        nodeId: params.nodeId,
        componentId: params.componentId,
        target: params.target
      };

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

    this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (toState != null && toState.name == 'root.main') {
        _this.saveEvent('projectListViewed', 'Navigation');
      }
    });

    if (this.$state.current.name == 'root.main') {
      this.saveEvent('projectListViewed', 'Navigation');
    }
  }

  /**
   * Update UI items based on state, show or hide relevant menus and toolbars
   * TODO: remove/rework this and put items in their own ui states?
   */


  _createClass(AuthoringToolController, [{
    key: 'processUI',
    value: function processUI() {
      // scroll to the top of the page
      this.$anchorScroll('top');

      // set current view and whether to show the toolbars and step tools
      this.showStepTools = this.$state.$current.name === 'root.project' || this.$state.$current.name === 'root.project.node' || this.$state.$current.name === 'root.project.nodeConstraints' || this.$state.$current.name === 'root.project.nodeEditPaths';
      var view = this.views[this.$state.$current.name];
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
  }, {
    key: 'turnOffJSONValidMessage',
    value: function turnOffJSONValidMessage() {
      this.$rootScope.$broadcast('setIsJSONValid', { isJSONValid: null });
    }

    /**
     * Navigate the user to the My Projects page in the Authoring Tool
     */

  }, {
    key: 'goToMyProjects',
    value: function goToMyProjects() {
      this.$location.url('/author');
    }

    /**
     * Toggle the authoring tool main menu
     */

  }, {
    key: 'toggleMenu',
    value: function toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    }

    /**
     * Notify Session to renew when user moves the mouse
     */

  }, {
    key: 'mouseMoved',
    value: function mouseMoved() {
      this.SessionService.mouseMoved();
    }
  }, {
    key: 'exit',
    value: function exit() {
      var _this2 = this;

      this.ProjectService.notifyAuthorProjectEnd().then(function () {
        var wiseBaseURL = _this2.ConfigService.getWISEBaseURL();
        window.location = wiseBaseURL + '/teacher';
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
      var globalMessage = {
        text: message,
        time: time
      };
      this.$rootScope.$broadcast('setGlobalMessage', { globalMessage: globalMessage });
    }
  }, {
    key: 'saveEvent',


    /**
     * Save an Authoring Tool event
     * @param eventName the name of the event
     * @param category the category of the event
     * example 'Navigation' or 'Authoring'
     */
    value: function saveEvent(eventName, category) {
      var context = 'AuthoringTool';
      var nodeId = null;
      var componentId = null;
      var componentType = null;
      var data = {};

      this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, eventName, data);
    }
  }]);

  return AuthoringToolController;
}();

AuthoringToolController.$inject = ['$anchorScroll', '$filter', '$location', '$mdDialog', '$rootScope', '$scope', '$state', '$timeout', 'ConfigService', 'ProjectService', 'SessionService', 'TeacherDataService', 'moment'];

exports.default = AuthoringToolController;
//# sourceMappingURL=authoringToolController.js.map
