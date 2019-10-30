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
    this.notifications = [];

    this.$rootScope.$on('newNotificationReceived', (event, notification) => {
      this.setNotificationNodePositionAndTitle(notification);
      let isNotificationNew = true;
      for (let n = 0; n < this.notifications.length; n++) {
        const currentNotification = this.notifications[n];
        if (currentNotification.id === notification.id) {
          this.notifications[n] = notification;
          isNotificationNew = false;
          this.$rootScope.$broadcast('notificationChanged', notification);
          break;
        }
      }
      if (isNotificationNew) {
        this.notifications.push(notification);
        this.$rootScope.$broadcast('notificationChanged', notification);
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


  retrieveNotifications(toWorkgroupId = null) {
    if (this.ConfigService.isPreview()) {
      return Promise.resolve(this.notifications);
    } else {
      const config = {
        method: 'GET',
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
        this.notifications.map((notification) => {
          this.setNotificationNodePositionAndTitle(notification);
          if (notification.data != null) {
            notification.data = angular.fromJson(notification.data);
          }
        });
        return this.notifications;
      });
    }
  }

  setNotificationNodePositionAndTitle(notification) {
    notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
    notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
  }

  dismissNotification(notification) {
    this.dismissNotificationToServer(notification);
  }

  sendNotificationForScore(notificationForScore) {
    const notificationType = notificationForScore.notificationType;
    if (notificationForScore.isNotifyTeacher || notificationForScore.isNotifyStudent) {
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
        const toWorkgroupId = this.ConfigService.getWorkgroupId();
        let notificationMessageToStudent = notificationForScore.notificationMessageToStudent;
        notificationMessageToStudent = notificationMessageToStudent.replace('{{username}}', this.ConfigService.getUsernameByWorkgroupId(fromWorkgroupId));
        notificationMessageToStudent = notificationMessageToStudent.replace('{{score}}', notificationForScore.score);
        notificationMessageToStudent = notificationMessageToStudent.replace('{{dismissCode}}', notificationForScore.dismissCode);

        const notificationToStudent = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId,
            fromWorkgroupId, toWorkgroupId, notificationMessageToStudent, notificationData, notificationGroupId);
        this.saveNotificationToServer(notificationToStudent);
      }

      if (notificationForScore.isNotifyTeacher) {
        const toWorkgroupId = this.ConfigService.getTeacherWorkgroupId();
        let notificationMessageToTeacher = notificationForScore.notificationMessageToTeacher;
        notificationMessageToTeacher = notificationMessageToTeacher.replace('{{username}}', this.ConfigService.getUsernameByWorkgroupId(fromWorkgroupId));
        notificationMessageToTeacher = notificationMessageToTeacher.replace('{{score}}', notificationForScore.score);
        notificationMessageToTeacher = notificationMessageToTeacher.replace('{{dismissCode}}', notificationForScore.dismissCode);

        const notificationToTeacher = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId,
            fromWorkgroupId, toWorkgroupId, notificationMessageToTeacher, notificationData, notificationGroupId);
        this.saveNotificationToServer(notificationToTeacher);
      }
    }
  }

  saveNotificationToServer(notification) {
    if (this.ConfigService.isPreview()) {
      return this.pretendServerRequest(notification);
    } else {
      const params = {
        periodId: this.ConfigService.getPeriodId(),
        fromWorkgroupId: notification.fromWorkgroupId,
        toWorkgroupId: notification.toWorkgroupId,
        nodeId: notification.nodeId,
        componentId: notification.componentId,
        componentType: notification.componentType,
        type: notification.type,
        message: notification.message
      };
      if (notification.id != null) {
        params.notificationId = notification.id;
      }
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
      const config = {
        method: 'POST',
        url: this.ConfigService.getNotificationURL(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $.param(params)
      };
      return this.$http(config).then((result) => {
        const notification = result.data;
        if (notification.data != null) {
          notification.data = angular.fromJson(notification.data);
        }
        return notification;
      });
    }
  }

  dismissNotificationToServer(notification) {
    notification.timeDismissed = Date.parse(new Date());

    if (this.ConfigService.isPreview()) {
      return this.pretendServerRequest(notification);
    }

    if (notification.id == null) {
      return; // cannot dismiss a notification that hasn't been saved to db yet
    }

    const params = {
      notificationId: notification.id,
      fromWorkgroupId: notification.fromWorkgroupId,
      toWorkgroupId: notification.toWorkgroupId,
      type: notification.type,
      timeDismissed: notification.timeDismissed
    };
    if (notification.groupId != null) {
      params.groupId = notification.groupId;
    }
    const config = {
      method: 'POST',
      url: this.ConfigService.getNotificationURL() + '/dismiss',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: $.param(params)
    };
    return this.$http(config).then((result) => {
      const notification = result.data;
      if (notification.data != null) {
        notification.data = angular.fromJson(notification.data);
      }
      this.$rootScope.$broadcast('notificationChanged', notification);
      return notification;
    });
  }

  pretendServerRequest(notification) {
    const deferred = this.$q.defer();
    deferred.resolve(notification);
    return deferred.promise;
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
