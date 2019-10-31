'use strict';

class ThemeController {
  constructor($scope,
              $state,
              $filter,
              ConfigService,
              ProjectService,
              StudentDataService,
              StudentStatusService,
              NotebookService,
              SessionService,
              $mdDialog,
              $mdMedia,
              $mdToast,
              $mdComponentRegistry) {
    this.$scope = $scope;
    this.$state = $state;
    this.$filter = $filter;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.NotebookService = NotebookService;
    this.SessionService = SessionService;
    this.StudentStatusService = StudentStatusService;
    this.$mdDialog = $mdDialog;
    this.$mdMedia = $mdMedia;
    this.$mdToast = $mdToast;
    this.$mdComponentRegistry = $mdComponentRegistry;
    this.$translate = this.$filter('translate');

    // TODO: set these variables dynamically from theme settings
    this.layoutView = 'list'; // 'list' or 'card'
    this.numberProject = true;

    this.themePath = this.ProjectService.getThemePath();
    this.themeSettings = this.ProjectService.getThemeSettings();
    this.hideTotalScores = this.themeSettings.hideTotalScores;

    this.nodeStatuses = this.StudentDataService.nodeStatuses;
    this.idToOrder = this.ProjectService.idToOrder;

    this.rootNode = this.ProjectService.rootNode;
    this.rootNodeStatus = this.nodeStatuses[this.rootNode.id];

    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.workgroupUsernames = this.ConfigService.getUsernamesByWorkgroupId(this.workgroupId);

    this.notebookOpen = false;
    this.notebookConfig = this.NotebookService.getNotebookConfig();
    this.notebookFilter = '';
    this.currentNode = this.StudentDataService.getCurrentNode();
    this.planningMode = false;

    // set current notebook type filter to first enabled type
    if (this.notebookConfig.enabled) {
      for (var type in this.notebookConfig.itemTypes) {
        let prop = this.notebookConfig.itemTypes[type];
        if (this.notebookConfig.itemTypes.hasOwnProperty(type) && prop.enabled) {
          this.notebookFilter = type;
          break;
        }
      }
    }

    // build server disconnect display
    this.connectionLostDisplay = $mdToast.build({
      template: "<md-toast>\
                      <span>{{ 'ERROR_CHECK_YOUR_INTERNET_CONNECTION' | translate }}</span>\
                      </md-toast>",
      hideDelay: 0
    });
    this.connectionLostShown = false;

    this.setLayoutState();

    // update layout state when current node changes
    this.$scope.$on('currentNodeChanged', (event, args) => {
      this.currentNode = this.StudentDataService.getCurrentNode();
      this.setLayoutState();
    });

    // alert user when a locked node has been clicked
    this.$scope.$on('nodeClickLocked', (event, args) => {
      var message = this.$translate('sorryYouCannotViewThisItemYet');
      let nodeId = args.nodeId;
      var node = this.ProjectService.getNodeById(nodeId);
      if (node != null) {
        // get the constraints that affect this node
        var constraints = this.ProjectService.getConstraintsForNode(node);
        this.ProjectService.orderConstraints(constraints);

        if (constraints != null && constraints.length > 0) {
          // get the node title the student is trying to go to
          let nodeTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
          message = this.$translate('toVisitNodeTitleYouNeedTo', { nodeTitle: nodeTitle });
        }

        // loop through all the constraints that affect this node
        for (var c = 0; c < constraints.length; c++) {
          var constraint = constraints[c];

          // check if the constraint has been satisfied
          if (constraint != null && !this.StudentDataService.evaluateConstraint(node, constraint)) {
            // the constraint has not been satisfied and is still active

            if (message != '') {
              // separate multiple constraints with line breaks
              message += '<br/>';
            }

            // get the message that describes how to disable the constraint
            message += this.ProjectService.getConstraintMessage(nodeId, constraint);
          }
        }
      }

      this.$mdDialog.show(
        this.$mdDialog.alert()
          .parent(angular.element(document.body))
          .title(this.$translate('itemLocked'))
          .htmlContent(message)
          .ariaLabel(this.$translate('itemLocked'))
          .ok(this.$translate('ok'))
          .targetEvent(event)
      );
    });

    // alert user when inactive for a long time
    this.$scope.$on('showSessionWarning', (ev) => {
      let alert = this.$mdDialog.confirm()
        .parent(angular.element(document.body))
        .title(this.$translate('sessionTimeout'))
        .textContent(this.$translate('autoLogoutMessage'))
        .ariaLabel(this.$translate('sessionTimeout'))
        .targetEvent(ev)
        .ok(this.$translate('yes'))
        .cancel(this.$translate('no'));

      this.$mdDialog.show(alert).then(() => {
        this.SessionService.closeWarningAndRenewSession();
        alert = undefined;
      }, () => {
        this.SessionService.forceLogOut();
      });
    });

    // alert user when inactive for a long time
    this.$scope.$on('showRequestLogout', (ev) => {
      let alert = this.$mdDialog.confirm()
        .parent(angular.element(document.body))
        .title(this.$translate('serverUpdate'))
        .textContent(this.$translate('serverUpdateRequestLogoutMessage'))
        .ariaLabel(this.$translate('serverUpdate'))
        .targetEvent(ev)
        .ok(this.$translate('ok'));

      this.$mdDialog.show(alert).then(() => {
        // do nothing
      }, () => {
        // do nothing
      });
    });

    // alert user when server loses connection
    this.$scope.$on('serverDisconnected', () => {
      this.handleServerDisconnect();
    });

    // remove alert when server regains connection
    this.$scope.$on('serverConnected', () => {
      this.handleServerReconnect();
    });

    // show list of revisions in a dialog when user clicks the show revisions link for a component
    this.$scope.$on('showRevisions', (event, args) => {
      let revisions = args.revisions;
      let componentController = args.componentController;
      let allowRevert = args.allowRevert;
      let $event = args.$event;
      let revisionsTemplateUrl = this.themePath + '/templates/componentRevisions.html';

      this.$mdDialog.show({
        parent: angular.element(document.body),
        targetEvent: $event,
        templateUrl: revisionsTemplateUrl,
        locals: {
          items: revisions.reverse(),
          componentController: componentController,
          allowRevert: allowRevert
        },
        controller: RevisionsController
      });
      function RevisionsController($scope, $mdDialog, items, componentController, allowRevert) {
        $scope.items = items;
        $scope.componentController = componentController;
        $scope.allowRevert = allowRevert;
        $scope.close = () => {
          $mdDialog.hide();
        };
        $scope.revertWork = (componentState) => {
          $scope.componentController.setStudentWork(componentState);
          $scope.componentController.studentDataChanged();
          $mdDialog.hide();
        };
      }
      RevisionsController.$inject = ["$scope", "$mdDialog", "items", "componentController", "allowRevert"];
    });

    this.$scope.$on('showStudentAssets', (event, args) => {
      let componentController = args.componentController;
      let $event = args.$event;
      let studentAssetDialogTemplateUrl = this.themePath + '/templates/studentAssetDialog.html';
      let studentAssetTemplateUrl = this.themePath + '/studentAsset/studentAsset.html';

      this.$mdDialog.show({
        parent: angular.element(document.body),
        targetEvent: $event,
        templateUrl: studentAssetDialogTemplateUrl,
        locals: {
          studentAssetTemplateUrl: studentAssetTemplateUrl,
          componentController: componentController
        },
        controller: StudentAssetDialogController
      });
      function StudentAssetDialogController($scope, $mdDialog, componentController) {
        $scope.studentAssetTemplateUrl = studentAssetTemplateUrl;
        $scope.componentController = componentController;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }
      }
      StudentAssetDialogController.$inject = ["$scope", "$mdDialog", "componentController"];
    });

    // a group node has turned on or off planning mode
    this.$scope.$on('togglePlanningMode', (event, args) => {
      this.planningMode = args.planningMode;
    });

    // handle request for notification dismiss codes
    this.$scope.$on('viewCurrentAmbientNotification', (event, args) => {
      let notification = args.notification;
      let ev = args.event;
      let notificationDismissDialogTemplateUrl = this.themePath + '/templates/notificationDismissDialog.html';

      let dismissCodePrompt = {
        parent: angular.element(document.body),
        targetEvent: ev,
        templateUrl: notificationDismissDialogTemplateUrl,
        locals: {
          notification: notification
        },
        controller: DismissCodeDialogController
      };
      DismissCodeDialogController.$inject = ['$scope', '$mdDialog', '$filter', 'NotificationService', 'ProjectService', 'StudentDataService', 'notification'];

      function DismissCodeDialogController($scope, $mdDialog, $filter, NotificationService, ProjectService, StudentDataService, notification) {

        $scope.$translate = $filter('translate');

        $scope.input = {
          dismissCode: ""
        };
        $scope.message = "";
        $scope.notification = notification;
        $scope.hasDismissCode = false;
        if (notification.data) {
          if (notification.data.dismissCode) {
            $scope.hasDismissCode = true;
          }
        }
        $scope.nodePositionAndTitle = ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);

        $scope.checkDismissCode = function() {
          if (!$scope.hasDismissCode || ($scope.input.dismissCode == notification.data.dismissCode)) {
            NotificationService.dismissNotification(notification);
            $mdDialog.hide();
            // log currentAmbientNotificationDimissed event
            var nodeId = null;
            var componentId = null;
            var componentType = null;
            var category = "Notification";
            var event = "currentAmbientNotificationDimissedWithCode";
            var eventData = {};
            StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
          } else {
            $scope.errorMessage = $scope.$translate('dismissNotificationInvalidDismissCode');
          }
        };
        $scope.visitNode = function() {
          if (!$scope.hasDismissCode) {
            // only dismiss notifications that don't require a dismiss code, but still allow them to move to the node
            NotificationService.dismissNotification(null, $scope.notification);
          }

          let goToNodeId = $scope.notification.nodeId;
          if (goToNodeId != null) {
            StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(goToNodeId);
          }
        };

        $scope.closeDialog = function() {
          $mdDialog.hide();

          // log currentAmbientNotificationWindowClosed event
          var nodeId = null;
          var componentId = null;
          var componentType = null;
          var category = "Notification";
          var event = "currentAmbientNotificationWindowClosed";
          var eventData = {};
          StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
        }
      }

      this.$mdDialog.show(dismissCodePrompt);

      // log currentAmbientNotificationWindowOpened event
      var nodeId = null;
      var componentId = null;
      var componentType = null;
      var category = "Notification";
      var event = "currentAmbientNotificationWindowOpened";
      var eventData = {};
      this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    });
  }

  /**
   * Set the layout state of the vle
   * @param state string specifying state (e.g. 'notebook'; optional)
   */
  setLayoutState(state) {
    let layoutState = 'nav'; // default layout state
    if (state) {
      layoutState = state;
    } else {
      // no state was sent, so set based on current node
      if (this.currentNode) {
        var id = this.currentNode.id;
        if (this.ProjectService.isApplicationNode(id)) {
          // currently viewing step, so show step view
          layoutState = 'node';
        } else if (this.ProjectService.isGroupNode(id)) {
          // currently viewing group node, so show navigation view
          layoutState = 'nav';
        }
      }
    }

    if (layoutState === 'notebook') {
      this.$state.go('root.notebook', {nodeId: this.currentNode.id});
    } else {
      this.notebookNavOpen = false;
      if (this.ConfigService.isPreview()) {
        this.$state.go('root.preview.node',
            {projectId: this.ConfigService.getProjectId(),
             nodeId: this.currentNode.id});
      } else {
        this.$state.go('root.run.node',
            {runId: this.ConfigService.getRunId(),
             nodeId: this.currentNode.id});
      }
    }

    this.layoutState = layoutState;
  }

  handleServerDisconnect() {
    if (!this.connectionLostShown) {
      this.$mdToast.show(this.connectionLostDisplay);
      this.connectionLostShown = true;
    }
  }

  handleServerReconnect() {
    this.$mdToast.hide(this.connectionLostDisplay);
    this.connectionLostShown = false;
  }

  getAvatarColorForWorkgroupId(workgroupId) {
    return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
  }

  mouseMoved() {
    /*
     * notify the Session Service that the user has moved the mouse
     * so we can refresh the session
     */
    this.SessionService.mouseMoved();
  }
}

ThemeController.$inject = [
  '$scope',
  '$state',
  '$filter',
  'ConfigService',
  'ProjectService',
  'StudentDataService',
  'StudentStatusService',
  'NotebookService',
  'SessionService',
  '$mdDialog',
  '$mdMedia',
  '$mdToast',
  '$mdComponentRegistry'
];

export default ThemeController;
