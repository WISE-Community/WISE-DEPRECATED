'use strict';

class VLEController {
  constructor(
      $anchorScroll,
      $scope,
      $rootScope,
      $filter,
      $mdDialog,
      $mdMenu,
      $state,
      AnnotationService,
      ConfigService,
      NotebookService,
      NotificationService,
      ProjectService,
      SessionService,
      StudentDataService,
      UtilService) {
    this.$anchorScroll = $anchorScroll;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$mdMenu = $mdMenu;
    this.$state = $state;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NotebookService = NotebookService;
    this.NotificationService = NotificationService;
    this.ProjectService = ProjectService;
    this.SessionService = SessionService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');

    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.currentNode = null;
    this.pauseDialog = null;
    this.noteDialog = null;

    this.navFilters = this.ProjectService.getFilters();
    this.navFilter = this.navFilters[0].name;

    this.projectStyle = this.ProjectService.getStyle();
    this.projectName = this.ProjectService.getProjectTitle();
    this.totalScore = this.StudentDataService.getTotalScore();
    this.maxScore = this.StudentDataService.maxScore;
    this.notebookEnabled = this.NotebookService.isNotebookEnabled();

    this.notebookConfig = this.NotebookService.getNotebookConfig();
    // Get report, if enabled; assume only one report for now
    this.reportItem = this.notebookConfig.itemTypes.report.notes[0];

    this.constraintsDisabled = false;

    let userType = this.ConfigService.getConfigParam('userType');
    let contextPath = this.ConfigService.getConfigParam('contextPath');
    if (userType == 'student') {
      this.homePath = contextPath + '/student';
    } else  if (userType == 'teacher') {
      this.homePath = contextPath + '/teacher';
    } else {
      this.homePath = contextPath;
    }

    if (this.ConfigService.getConfigParam('constraints') == false) {
      this.constraintsDisabled = true;
    }

    let script = this.ProjectService.getProjectScript();
    if (script != null) {
      this.ProjectService.retrieveScript(script).then((script) => {
        new Function(script).call(this);
      });
    }

    this.$scope.$on('currentNodeChanged', (event, args) => {
      let previousNode = args.previousNode;
      let currentNode = this.StudentDataService.getCurrentNode();
      let currentNodeId = currentNode.id;

      this.StudentDataService.updateStackHistory(currentNodeId);
      this.StudentDataService.updateVisitedNodesHistory(currentNodeId);

      let componentId, componentType, category, eventName, eventData, eventNodeId;
      if (previousNode != null && this.ProjectService.isGroupNode(previousNode.id)) {
        // going from group to node or group to group
        componentId = null;
        componentType = null;
        category = "Navigation";
        eventName = "nodeExited";
        eventData = {
          nodeId: previousNode.id
        };
        eventNodeId = previousNode.id;
        this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
      }

      if (this.ProjectService.isGroupNode(currentNodeId)) {
        componentId = null;
        componentType = null;
        category = "Navigation";
        eventName = "nodeEntered";
        eventData = {
          nodeId: currentNode.id
        };
        eventNodeId = currentNode.id;
        this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
      }
    });

    this.$scope.$on('$stateChangeSuccess',
        (event, toState, toParams, fromState, fromParams) => {
      this.$anchorScroll('node');
    });

    this.notifications = this.NotificationService.notifications;
    this.newNotifications = this.getNewNotifications();

    this.$scope.$on('notificationChanged', (event, notification) => {
      // update new notifications
      this.notifications = this.NotificationService.notifications;
      this.newNotifications = this.getNewNotifications();
    });

    this.$scope.$on('componentStudentDataChanged', () => {

    });

    this.$scope.$on('pauseScreen', (event, args) => {
      this.pauseScreen();
    });

    this.$scope.$on('unPauseScreen', (event, args) => {
      this.unPauseScreen();
    });

    this.$scope.$on('requestImageCallback', (event, args) => {
      if (this.snippableItems == null) {
        this.snippableItems = [];
      }

      if (args.imageObject != null) {
        this.snippableItems.push(args.imageObject);
      }

      if (args.imageObjects != null) {
        for (const imageObject of args.imageObjects) {
          if (imageObject != null) {
            this.snippableItems.push(imageObject);
          }
        }
      }
    });

    // Make sure if we drop something on the page we don't navigate away
    // https://developer.mozilla.org/En/DragDrop/Drag_Operations#drop
    $(document.body).on('dragover', function(e) {
      e.preventDefault();
      return false;
    });

    $(document.body).on('drop', function(e){
      e.preventDefault();
      return false;
    });

    this.themePath = this.ProjectService.getThemePath();
    this.notebookItemPath = this.themePath + '/notebook/notebookItem.html';

    let nodeId = null;
    let stateParams = null;
    let stateParamNodeId = null;

    if (this.$state != null) {
      stateParams = this.$state.params;
    }

    if (stateParams != null) {
      stateParamNodeId = stateParams.nodeId;
    }

    if (stateParamNodeId != null && stateParamNodeId !== '') {
      nodeId = stateParamNodeId;
    } else {
      /*
       * get the node id for the latest node entered event for an active
       * node that exists in the project
       */
      nodeId = this.StudentDataService.getLatestNodeEnteredEventNodeIdWithExistingNode();
    }

    if (nodeId == null || nodeId === '') {
      nodeId = this.ProjectService.getStartNodeId();
    }

    this.StudentDataService.setCurrentNodeByNodeId(nodeId);

    const runStatus = this.StudentDataService.getRunStatus();
    if (runStatus != null) {
      let pause = false;
      const periodId = this.ConfigService.getPeriodId();
      if (periodId != null) {
        const periods = runStatus.periods;
        if (periods != null) {
          for (const tempPeriod of periods) {
            if (periodId === tempPeriod.periodId) {
              if (tempPeriod.paused) {
                pause = true;
                break;
              }
            }
          }
        }
      }

      if (pause) {
        this.pauseScreen();
      }
    }
  }

  // TODO: remove and use inline clipping (with guidance)
  snipNewNote($event) {
    // Ask all of the components on the page for snippable items
    let templateUrl = this.themePath + '/notebook/contentSnipper.html';

    let currentNodeId = this.StudentDataService.getCurrentNodeId();
    let currentComponents = this.ProjectService.getComponentsByNodeId(currentNodeId);

    /*
     * initialize the snippable items array that will become populated
     * with snippable items
     */
    this.snippableItems = [];

    for (const currentComponent of currentComponents) {
      const args = {};
      args.nodeId = currentNodeId;
      args.componentId = currentComponent.id;
      this.$rootScope.$broadcast('requestImage', args);
    }
    this.$mdDialog.show({
      parent: angular.element(document.body),
      targetEvent: $event,
      templateUrl: templateUrl,
      clickOutsideToClose: true,
      locals: {
        snippableItems: this.snippableItems
      },
      controller: NotebookContentSnippetController,
      controllerAs: 'notebookContentSnippetController',
      bindToController: true
    });
    function NotebookContentSnippetController($rootScope, $scope, $mdDialog, snippableItems, NotebookService, StudentDataService, ProjectService) {
      $scope.NotebookService = NotebookService;
      $scope.StudentDataService = StudentDataService;
      $scope.ProjectService = ProjectService;
      $scope.snippableItems = snippableItems;

      for (const snippableItem of snippableItems) {
        if (snippableItem != null) {
          /*
           * create a local browser URL for the snippable item so
           * we can display it as an image
           */
          snippableItem.url = URL.createObjectURL(snippableItem);
        }
      }

      $scope.close = () => {
        $mdDialog.hide();
      };
      $scope.chooseSnippet = (snippableItem) => {
        $scope.NotebookService.addNote($event, snippableItem);
        $mdDialog.hide();
      };
    }

    NotebookContentSnippetController.$inject = ["$rootScope", "$scope", "$mdDialog", "snippableItems", "NotebookService", "StudentDataService", "ProjectService"];
  }

  goHome() {
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const category = "Navigation";
    const event = "goHomeButtonClicked";
    const eventData = {};
    this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

    this.$rootScope.$broadcast('goHome');
  }

  logOut() {
    const nodeId = null;
    const componentId = null;
    const componentType = null;
    const category = "Navigation";
    const event = "logOutButtonClicked";
    const eventData = {};
    this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

    this.$rootScope.$broadcast('logOut');
  }

  loadRoot() {
    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.ProjectService.rootNode.id);
  }

  /**
   * The user moved the mouse on the page
   */
  mouseMoved() {
    // tell the session service a mouse event occurred
    // so it can reset the session timeout timers
    this.SessionService.mouseEventOccurred();
  }

  /**
   * Returns true iff there are new notifications
   */
  hasNewNotifications() {
    return this.newNotifications.length > 0;
  }

  /**
   * Returns true iff there are new notifications of type 'ambient'
   */
  hasNewAmbientNotifications() {
    return this.getNewAmbientNotifications().length > 0;
  }

  /**
   * Returns all notifications that have not been dismissed yet
   * The newNotifications is an array of notification aggregate objects that looks like this:
   * [
   *  {
     *    "nodeId": "node2",
     *    "type": "DiscussionReply",   // ["DiscussionReply", "teacherToStudent"]
     *    "notifications": [{ id: 1117} , { id: 1120 }]      // array of actual undismissed notifications with this nodeId and type
     *  },
   *  ...
   * ]
   * The annotation aggregates will be sorted by latest first -> oldest last
   */
  getNewNotifications() {
    let newNotificationAggregates = [];
    for (let notification of this.notifications) {
      if (notification.timeDismissed == null) {
        let notificationNodeId = notification.nodeId;
        let notificationType = notification.type;
        let newNotificationForNodeIdAndTypeExists = false;
        for (let newNotificationAggregate of newNotificationAggregates) {
          if (newNotificationAggregate.nodeId == notificationNodeId && newNotificationAggregate.type == notificationType) {
            newNotificationForNodeIdAndTypeExists = true;
            newNotificationAggregate.notifications.push(notification);
            if (notification.timeGenerated > newNotificationAggregate.latestNotificationTimestamp) {
              newNotificationAggregate.latestNotificationTimestamp = notification.timeGenerated;
            }
          }
        }
        let notebookItemId = null;  // if this notification was created because teacher commented on a notebook report.
        if (!newNotificationForNodeIdAndTypeExists) {
          let message = "";
          if (notificationType === "DiscussionReply") {
            message = this.$translate('newRepliesOnDiscussionPost');
          } else if (notificationType === "teacherToStudent") {
            message = this.$translate('newFeedbackFromTeacher');
            if (notification.data != null) {
              if (typeof notification.data === 'string') {
                notification.data = angular.fromJson(notification.data);
              }

              if (notification.data.annotationId != null) {
                let annotation = this.AnnotationService.getAnnotationById(notification.data.annotationId);
                if (annotation != null && annotation.notebookItemId != null) {
                  notebookItemId = annotation.notebookItemId;
                }
              }
            }
          } else if (notificationType === "CRaterResult") {
            message = this.$translate('newFeedback');
          }
          let newNotificationAggregate = {
            latestNotificationTimestamp: notification.timeGenerated,
            message: message,
            nodeId: notificationNodeId,
            notebookItemId: notebookItemId,
            notifications: [notification],
            type: notificationType
          };
          newNotificationAggregates.push(newNotificationAggregate);
        }
      }
    }

    // sort the aggregates by latestNotificationTimestamp, latest -> oldest
    newNotificationAggregates.sort((n1, n2) => {
      return n2.latestNotificationTimestamp - n1.latestNotificationTimestamp;
    });
    return newNotificationAggregates;
  }

  /**
   * Returns all ambient notifications that have not been dismissed yet
   */
  getNewAmbientNotifications() {
    return this.notifications.filter(
      function(notification) {
        let isAmbient = notification.data ? notification.data.isAmbient : false;
        return (notification.timeDismissed == null && isAmbient);
      }
    );
  }

  /**
   * Dismiss the specified notification
   * @param notification
   */
  dismissNotification(event, notification) {
    if (notification.data == null || notification.data.dismissCode == null) {
      this.NotificationService.dismissNotification(notification);
    } else {
      // ask user to input dimiss code before dimissing it
      let args = {
        event: event,
        notification: notification
      };
      this.$rootScope.$broadcast('viewCurrentAmbientNotification', args);
      this.$mdMenu.hide();
    }
  }

  /**
   * View the most recent ambient notification and allow teacher to input
   * dismiss code
   */
  viewCurrentAmbientNotification(event) {
    let ambientNotifications = this.getNewAmbientNotifications();
    if (ambientNotifications.length) {
      let currentNotification = ambientNotifications[0];
      let args = {};
      args.event = event;
      args.notification = currentNotification;
      this.$rootScope.$broadcast('viewCurrentAmbientNotification', args);
    }
  }

  /**
   * Dismiss the notification aggregate object, which effectively dismisses all notifications
   * for the nodeId and type of the aggregate object.
   * @param event
   * @param notificationAggregate
   */
  dismissNotificationAggregate(event, notificationAggregate) {
    if (notificationAggregate != null && notificationAggregate.notifications != null) {
      for (let notification of notificationAggregate.notifications) {
        this.dismissNotification(event, notification);
      }
    }
  }

  /**
   * Dismiss the specified notification aggregate object and visit the node
   * @param notificationAggregate, which contains nodeId, type, and notifications of that nodeId and type
   */
  dismissNotificationAggregateAndVisitNode(event, notificationAggregate) {
    if (notificationAggregate != null && notificationAggregate.notifications != null) {
      for (let notification of notificationAggregate.notifications) {
        if (notification.data == null || notification.data.dismissCode == null) {
          // only dismiss notifications that don't require a dismiss code,
          // but still allow them to move to the node
          this.dismissNotification(event, notification);
        }
      }
    }

    let goToNodeId = notificationAggregate.nodeId;
    let notebookItemId = notificationAggregate.notebookItemId;
    if (goToNodeId != null) {
      this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(goToNodeId);
    } else if (notebookItemId != null) {
      // assume notification with notebookItemId is for the report for now,
      // as we don't currently support annotations on notes
      this.$rootScope.$broadcast('showReportAnnotations', {ev: event});
    }
  }

  pauseScreen() {
    // TODO: i18n
    this.pauseDialog = this.$mdDialog.show({
      template: '<md-dialog aria-label="Screen Paused"><md-dialog-content><div class="md-dialog-content">' + this.$translate('yourTeacherHasPausedAllTheScreensInTheClass') + '</div></md-dialog-content></md-dialog>',
      escapeToClose: false
    });
  }

  unPauseScreen() {
    this.$mdDialog.hide();
    this.pauseDialog = null;
  }

  isPreview() {
    return this.ConfigService.isPreview();
  }

  /**
   * Check if there are any constraints in the project
   * @return whether there are any constraints in the project
   */
  hasConstraints() {
    let hasActiveConstraints = false;
    const activeConstraints = this.ProjectService.activeConstraints;
    if (activeConstraints != null && activeConstraints.length > 0) {
      hasActiveConstraints = true;
    }
    return hasActiveConstraints;
  }

  /**
   * Disable all the constraints
   */
  disableConstraints() {
    if (this.ConfigService.isPreview()) {
      this.constraintsDisabled = true;
      this.ProjectService.activeConstraints = [];
      /*
       * update the node statuses so that they are re-evaluated now that
       * all the constraints have been removed
       */
      this.StudentDataService.updateNodeStatuses();
    }
  }

  /**
   * Returns WISE API
   */
  getWISEAPI() {
    return {
      /**
       * Registers a function that will be invoked before the componentState is saved to the server
       * @param nodeId the node id
       * @param componentId the component id
       * @param additionalProcessingFunction the function to register for the specified node and component
       */
      registerAdditionalProcessingFunction: (nodeId, componentId, additionalProcessingFunction) => {
        this.ProjectService.addAdditionalProcessingFunction(nodeId, componentId, additionalProcessingFunction);
      },
      /**
       * Create an auto score annotation
       * @param runId the run id
       * @param periodId the period id
       * @param nodeId the node id
       * @param componentId the component id
       * @param toWorkgroupId the student workgroup id
       * @param data the annotation data
       * @returns the auto score annotation
       */
      createAutoScoreAnnotation: (nodeId, componentId, data) => {
        let runId = this.ConfigService.getRunId();
        let periodId = this.ConfigService.getPeriodId();
        let toWorkgroupId = this.ConfigService.getWorkgroupId();

        return this.AnnotationService.createAutoScoreAnnotation(
            runId, periodId, nodeId, componentId, toWorkgroupId, data);
      },
      /**
       * Create an auto comment annotation
       * @param runId the run id
       * @param periodId the period id
       * @param nodeId the node id
       * @param componentId the component id
       * @param toWorkgroupId the student workgroup id
       * @param data the annotation data
       * @returns the auto comment annotation
       */
      createAutoCommentAnnotation: (nodeId, componentId, data) => {
        let runId = this.ConfigService.getRunId();
        let periodId = this.ConfigService.getPeriodId();
        let toWorkgroupId = this.ConfigService.getWorkgroupId();

        return this.AnnotationService.createAutoCommentAnnotation(
            runId, periodId, nodeId, componentId, toWorkgroupId, data);
      },
      /**
       * Gets the latest annotation for the specified node, component, and type
       * @param nodeId
       * @param componentId
       * @param annotationType
       * @returns {the|Object}
       */
      getLatestAnnotationForComponent: (nodeId, componentId, annotationType) => {
        let params = {
          "nodeId": nodeId,
          "componentId": componentId,
          "type": annotationType
        };
        return this.AnnotationService.getLatestAnnotation(params);
      },
      /**
       * Updates the annotation locally and on the server
       * @param annotation
       */
      updateAnnotation: (annotation) => {
        this.AnnotationService.saveAnnotation(annotation);
      },
      /**
       * Returns the maxScore for the specified node and component
       * @param nodeId the node id
       * @param componentId the component id
       * @returns the max score for the component
       */
      getMaxScoreForComponent: (nodeId, componentId) => {
        return this.ProjectService.getMaxScoreForComponent(nodeId, componentId);
      }
    };
  }
}

VLEController.$inject = [
  '$anchorScroll',
  '$scope',
  '$rootScope',
  '$filter',
  '$mdDialog',
  '$mdMenu',
  '$state',
  'AnnotationService',
  'ConfigService',
  'NotebookService',
  'NotificationService',
  'ProjectService',
  'SessionService',
  'StudentDataService',
  'UtilService'
];

export default VLEController;
