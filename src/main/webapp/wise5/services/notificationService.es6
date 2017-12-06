class NotificationService {
  constructor($http, $q, $rootScope, ConfigService, ProjectService,
      StudentWebSocketService, UtilService) {
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentWebSocketService = StudentWebSocketService;
    this.UtilService = UtilService;
    this.notifications = [];  // an array of notifications that students haven't seen yet.

    this.$rootScope.$on('newNotification', (event, notification) => {
      if (notification != null) {
        const workgroupId = this.ConfigService.getWorkgroupId();
        const mode = this.ConfigService.getMode();
        if (mode === 'classroomMonitor' || workgroupId === notification.toWorkgroupId) {
          notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
          notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
          // check if this notification is new or is an update
          let isNotificationNew = true;
          for (let n = 0; n < this.notifications.length; n++) {
            const currentNotification = this.notifications[n];
            if (currentNotification.id == notification.id) {
              // existing notification (with same id) found, so it's an update
              this.notifications[n] = notification;
              isNotificationNew = false;
              this.$rootScope.$broadcast('notificationChanged', notification);
              break;
            }
          }
          if (isNotificationNew) {
            this.notifications.push(notification);
            this.$rootScope.$broadcast('notificationAdded', notification);
          }
        }
      }
    });
  }

  /**
   * Creates a new notification object
   * @param notificationType type of notification [component, node, annotation, etc]
   * @param nodeId id of node
   * @param componentId id of component
   * @param fromWorkgroupId id of workgroup that created this notification
   * @param toWorkgroupId id of workgroup this notification is for
   * @param message notification message
   * @param data other extra information about this notification
   * @param groupId id that groups multiple notifications together
   * @returns newly created notification object
   */
  createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, message, data = null, groupId = null) {
    const nodePosition = this.ProjectService.getNodePositionById(nodeId);
    const nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    let componentType = null;
    if (component != null) {
      componentType = component.type;
    }
    return {
      id: null,
      type: notificationType,
      nodeId: nodeId,
      groupId: groupId,
      componentId: componentId,
      componentType: componentType,
      nodePosition: nodePosition,
      nodePositionAndTitle: nodePositionAndTitle,
      fromWorkgroupId: fromWorkgroupId,
      toWorkgroupId: toWorkgroupId,
      message: message,
      data: data,
      timeGenerated: Date.parse(new Date()),
      timeDismissed: null
    };
  }

  /**
   * Retrieves notifications from the server
   */
  retrieveNotifications(toWorkgroupId = null) {
    const notificationURL = this.ConfigService.getNotificationURL();
    if (notificationURL == null) {
      // the notification url is null most likely because we are in preview mode
      return Promise.resolve(this.notifications);
    } else {
      // the notification url is not null so we will retrieve the notifications
      const config = {
        method: "GET",
        url: this.ConfigService.getNotificationURL(),
        params: {}
      };
      if (toWorkgroupId != null) {
        config.params.toWorkgroupId = toWorkgroupId;
      } else if (this.ConfigService.getMode() !== 'classroomMonitor') {
        config.params.toWorkgroupId = this.ConfigService.getWorkgroupId();
        config.params.periodId = this.ConfigService.getPeriodId();
      }

      return this.$http(config).then((response) => {
        this.notifications = response.data;
        // populate nodePosition and nodePositionAndTitle, where applicable
        if (this.notifications != null) {
          this.notifications.map((notification) => {
            if (notification.nodeId != null) {
              notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
              notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
            }
            if (notification.data != null) {
              // parse the data string into a JSON object
              notification.data = angular.fromJson(notification.data);
            }
          });
        } else {
          this.notifications = [];
        }

        return this.notifications;
      });
    }
  }

  /**
   * Dismisses the specified notification
   * @param notification
   */
  dismissNotification(notification) {
    this.dismissNotificationToServer(notification);
  }

  /**
   * Handle creating notification for score
   * @param notificationForScore
   */
  sendNotificationForScore(notificationForScore) {
    const notificationType = notificationForScore.notificationType;
    if (notificationForScore.isNotifyTeacher || notificationForScore.isNotifyStudent) {
      // notify both teacher and student at the same time
      const fromWorkgroupId = this.ConfigService.getWorkgroupId();
      const notificationGroupId = this.ConfigService.getRunId() + "_" + this.UtilService.generateKey(10);  // links student and teacher notifications together
      const notificationData = {};
      if (notificationForScore.isAmbient) {
        notificationData.isAmbient = true;
      }
      if (notificationForScore.dismissCode != null) {
        notificationData.dismissCode = notificationForScore.dismissCode;
      }
      if (notificationForScore.isNotifyStudent) {
        // send notification to student
        const toWorkgroupId = this.ConfigService.getWorkgroupId();
        let notificationMessageToStudent = notificationForScore.notificationMessageToStudent;
        // replace variables like {{score}} and {{dismissCode}} with actual values
        notificationMessageToStudent = notificationMessageToStudent.replace("{{username}}", this.ConfigService.getUserNameByWorkgroupId(fromWorkgroupId));
        notificationMessageToStudent = notificationMessageToStudent.replace("{{score}}", notificationForScore.score);
        notificationMessageToStudent = notificationMessageToStudent.replace("{{dismissCode}}", notificationForScore.dismissCode);

        const notificationToStudent = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId,
          fromWorkgroupId, toWorkgroupId, notificationMessageToStudent, notificationData, notificationGroupId);
        this.saveNotificationToServer(notificationToStudent).then((savedNotification) => {
          // show local notification
          this.$rootScope.$broadcast('newNotification', savedNotification);
        });
      }

      if (notificationForScore.isNotifyTeacher) {
        // send notification to teacher
        const toWorkgroupId = this.ConfigService.getTeacherWorkgroupId();
        let notificationMessageToTeacher = notificationForScore.notificationMessageToTeacher;
        // replace variables like {{score}} and {{dismissCode}} with actual values
        notificationMessageToTeacher = notificationMessageToTeacher.replace("{{username}}", this.ConfigService.getUserNameByWorkgroupId(fromWorkgroupId));
        notificationMessageToTeacher = notificationMessageToTeacher.replace("{{score}}", notificationForScore.score);
        notificationMessageToTeacher = notificationMessageToTeacher.replace("{{dismissCode}}", notificationForScore.dismissCode);

        const notificationToTeacher = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId,
          fromWorkgroupId, toWorkgroupId, notificationMessageToTeacher, notificationData, notificationGroupId);
        this.saveNotificationToServer(notificationToTeacher).then((savedNotification) => {
          // send notification in real-time so teacher sees this right away
          const messageType = "CRaterResultNotification";
          this.StudentWebSocketService.sendStudentToTeacherMessage(messageType, savedNotification);
        });
      }
    }
  }

  /**
   * Saves the notification for the logged-in user
   * @param notification
   */
  saveNotificationToServer(notification) {
    if (this.ConfigService.isPreview()) {
      // if we're in preview, don't make any request to the server but pretend we did
      const deferred = this.$q.defer();
      deferred.resolve(notification);
      return deferred.promise;
    } else {
      const config = {
        method: "POST",
        url: this.ConfigService.getNotificationURL(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const params = {};
      if (notification.id != null) {
        params.notificationId = notification.id;
      }
      params.periodId = this.ConfigService.getPeriodId();
      params.fromWorkgroupId = notification.fromWorkgroupId;
      params.toWorkgroupId = notification.toWorkgroupId;
      params.nodeId = notification.nodeId;
      params.componentId = notification.componentId;
      params.componentType = notification.componentType;
      params.type = notification.type;
      params.message = notification.message;
      if (notification.data != null) {
        params.data = angular.toJson(notification.data);
      }
      if (notification.groupId != null) {
        params.groupId = notification.groupId;
      }
      params.timeGenerated = notification.timeGenerated;
      if (notification.timeDismissed != null) {
        params.timeDismissed = notification.timeDismissed;
      }
      config.data = $.param(params);

      return this.$http(config).then((result) => {
        const notification = result.data;
        if (notification.data != null) {
          notification.data = angular.fromJson(notification.data);
        }
        return notification;
      })
    }
  }

  /**
   * Saves the notification for the logged-in user
   * @param notification
   */
  dismissNotificationToServer(notification) {
    notification.timeDismissed = Date.parse(new Date());  // set dismissed time to now.

    if (this.ConfigService.isPreview()) {
      // if we're in preview, don't make any request to the server but pretend we did
      const deferred = this.$q.defer();
      deferred.resolve(notification);
      return deferred.promise;
    } else {
      if (notification.id == null) {
        // cannot dismiss a notification that hasn't been saved to db yet
        return;
      }

      const config = {
        method: "POST",
        url: this.ConfigService.getNotificationURL() + "/dismiss",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const params = {};
      params.notificationId = notification.id;
      params.fromWorkgroupId = notification.fromWorkgroupId;
      params.toWorkgroupId = notification.toWorkgroupId;
      params.type = notification.type;
      if (notification.groupId != null) {
        params.groupId = notification.groupId;
      }
      params.timeDismissed = notification.timeDismissed;
      config.data = $.param(params);

      return this.$http(config).then((result) => {
        const notification = result.data;
        if (notification.data != null) {
          // parse the data string into a JSON object
          notification.data = angular.fromJson(notification.data);
        }
        this.$rootScope.$broadcast('notificationChanged', notification);
        return notification;
      })
    }
  }

  /**
   * Returns all notifications for the given parameters
   * @param args object of optional parameters to filter on
   * (e.g. nodeId, componentId, toWorkgroupId, fromWorkgroupId, periodId, type)
   * @returns array of notificaitons
   */
  getNotifications(args) {
    let notifications = this.notifications;
    if (args) {
      for (let p in args) {
        if (args.hasOwnProperty(p) && args[p] !== null) {
          notifications = notifications.filter(
            notification => {
              return (notification[p] === args[p]);
            }
          );
        }
      }
    }
    return notifications;
  }

  /**
   * Returns all CRaterResult notifications for given parameters
   * TODO: expand to encompass other notification types that should be shown in classroom monitor
   * @param args object of optional parameters to filter on (e.g. nodeId, componentId, toWorkgroupId, fromWorkgroupId, periodId)
   * @returns array of cRater notificaitons
   */
  getAlertNotifications(args) {
    // get all CRaterResult notifications for the given parameters
    // TODO: expand to encompass other notification types that should be shown to teacher
    let alertNotifications = [];
    const nodeId = args.nodeId;
    const params = args;
    params.type = 'CRaterResult';

    if (args.periodId) {
      params.periodId = args.periodId === -1 ? null : args.periodId;
    }

    if (nodeId && this.ProjectService.isGroupNode(nodeId)) {
      const groupNode = this.ProjectService.getNodeById(nodeId);
      const children = groupNode.ids;
      for (let childId of children) {
        params.nodeId = childId;
        const childAlerts = this.getAlertNotifications(args);
        alertNotifications = alertNotifications.concat(childAlerts);
      }
    } else {
      alertNotifications = this.getNotifications(params);
    }
    return alertNotifications;
  }
}

NotificationService.$inject = [
  '$http',
  '$q',
  '$rootScope',
  'ConfigService',
  'ProjectService',
  'StudentWebSocketService',
  'UtilService'
];

export default NotificationService;
