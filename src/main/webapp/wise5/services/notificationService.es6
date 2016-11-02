class NotificationService {
    constructor($http, $q, $rootScope, ConfigService, ProjectService, StudentWebSocketService, UtilService) {

        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentWebSocketService = StudentWebSocketService;
        this.UtilService = UtilService;
        this.notifications = [];  // an array of notifications that students haven't seen yet.

        /**
         * We received a new notification.
         */
        this.$rootScope.$on('newNotification', (event, notification) => {
            if (notification != null) {
                let workgroupId = this.ConfigService.getWorkgroupId();
                let mode = this.ConfigService.getMode();
                if (mode === 'classroomMonitor' || workgroupId === notification.toWorkgroupId) {
                    notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
                    notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                    // check if this notification is new or is an update
                    var isNotificationNew = true;
                    for (var n = 0; n < this.notifications.length; n++) {
                        var currentNotification = this.notifications[n];
                        if (currentNotification.id == notification.id) {
                            // existing notification (with same id) found, so it's an update
                            this.notifications[n] = notification;
                            isNotificationNew = false;
                            this.$rootScope.$broadcast('notificationChanged', notification);
                            break;
                        }
                    }
                    if (isNotificationNew) {
                        // this is a new notification
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
    createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, message, data=null, groupId=null) {
        let nodePosition = this.ProjectService.getNodePositionById(nodeId);
        let nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        let component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
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

        var notificationURL = this.ConfigService.getNotificationURL();

        if (notificationURL == null) {
            // the notification url is null most likely because we are in preview mode
            return Promise.resolve(this.notifications);
        } else {
            // the notification url is not null so we will retrieve the notifications
            let config = {};
            config.method = 'GET';
            config.url = this.ConfigService.getNotificationURL();
            config.params = {};
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

                            if (notification.data != null) {
                                // parse the data string into a JSON object
                                notification.data = angular.fromJson(notification.data);
                            }
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
        let notificationType = notificationForScore.notificationType;
        if (notificationForScore.isNotifyTeacher || notificationForScore.isNotifyStudent) {
            // notify both teacher and student at the same time
            let fromWorkgroupId = this.ConfigService.getWorkgroupId();
            let notificationGroupId = this.ConfigService.getRunId() + "_" + this.UtilService.generateKey(10);  // links student and teacher notifications together
            let notificationData = {};
            if (notificationForScore.isAmbient) {
                notificationData.isAmbient = true;
            }
            if (notificationForScore.dismissCode != null) {
                notificationData.dismissCode = notificationForScore.dismissCode;
            }
            if (notificationForScore.isNotifyStudent) {
                // send notification to student
                let toWorkgroupId = this.ConfigService.getWorkgroupId();
                let notificationMessageToStudent = notificationForScore.notificationMessageToStudent;
                // replace variables like {{score}} and {{dismissCode}} with actual values
                notificationMessageToStudent = notificationMessageToStudent.replace("{{username}}", this.ConfigService.getUserNameByWorkgroupId(fromWorkgroupId));
                notificationMessageToStudent = notificationMessageToStudent.replace("{{score}}", notificationForScore.score);
                notificationMessageToStudent = notificationMessageToStudent.replace("{{dismissCode}}", notificationForScore.dismissCode);

                let notificationToStudent = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId,
                    fromWorkgroupId, toWorkgroupId, notificationMessageToStudent, notificationData, notificationGroupId);
                this.saveNotificationToServer(notificationToStudent).then((savedNotification) => {
                    // show local notification
                    this.$rootScope.$broadcast('newNotification', savedNotification);
                });
            }

            if (notificationForScore.isNotifyTeacher) {
                // send notification to teacher
                let toWorkgroupId = this.ConfigService.getTeacherWorkgroupId();
                let notificationMessageToTeacher = notificationForScore.notificationMessageToTeacher;
                // replace variables like {{score}} and {{dismissCode}} with actual values
                notificationMessageToTeacher = notificationMessageToTeacher.replace("{{username}}", this.ConfigService.getUserNameByWorkgroupId(fromWorkgroupId));
                notificationMessageToTeacher = notificationMessageToTeacher.replace("{{score}}", notificationForScore.score);
                notificationMessageToTeacher = notificationMessageToTeacher.replace("{{dismissCode}}", notificationForScore.dismissCode);

                let notificationToTeacher = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId,
                    fromWorkgroupId, toWorkgroupId, notificationMessageToTeacher, notificationData, notificationGroupId);
                this.saveNotificationToServer(notificationToTeacher).then((savedNotification) => {
                    // send notification in real-time so teacher sees this right away
                    let messageType = "CRaterResultNotification";
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
            let deferred = this.$q.defer();
            deferred.resolve(notification);
            return deferred.promise;

        } else {

            let config = {};
            config.method = 'POST';
            config.url = this.ConfigService.getNotificationURL();
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

            let params = {};
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
                let notification = result.data;
                if (notification.data != null) {
                    // parse the data string into a JSON object
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
            let deferred = this.$q.defer();
            deferred.resolve(notification);
            return deferred.promise;

        } else {
            if (notification.id == null) {
                // cannot dismiss a notification that hasn't been saved to db yet
                return;
            }

            let config = {};
            config.method = 'POST';
            config.url = this.ConfigService.getNotificationURL() + "/dismiss";
            config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

            let params = {};
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
                let notification = result.data;
                if (notification.data != null) {
                    // parse the data string into a JSON object
                    notification.data = angular.fromJson(notification.data);
                }
                return notification;
            })
        }
    }

    /**
     * Returns all notifications for a given nodeId and workgroupId
     * @param nodeId the nodeId to look for (optional)
     * @param workgroupId the workgroupId to look for (optional)
     * TODO: update this to allow for more parameters (like periodId, maybe componentID?)
     */
    getNotifications(nodeId, workgroupId) {
        if (nodeId || workgroupId) {
            return this.notifications.filter(
                notification => {
                    if (nodeId && workgroupId) {
                        return (notification.nodeId === nodeId && notification.toWorkgroupId === workgroupId);
                    } else if (nodeId) {
                        return (notification.nodeId === nodeId);
                    } else if (workgroupId) {
                        return (notification.toWorkgroupId === workgroupId);
                    }
                }
            );
        } else {
            return this.notifications;
        }

    }

    /**
     * Returns all CRaterResult notifications for given workgroup and node
     * TODO: expand to encompass other notification types that should be shown in classroom monitor
     * @param args object of optional parameters to filter on (nodeId, workgroupId, periodId)
     * @returns array of cRater notificaitons
     */
    getAlertNotifications(args) {
        // get all CRaterResult notifications for the giver parameters
        // TODO: expand to encompass other notification types that should be shown to teacher
        let notifications = [];
        let alertNotifications = [];
        let nodeId = args.nodeId;
        let workgroupId = args.workgroupId;
        let periodId = args.periodId;

        if (nodeId && this.ProjectService.isGroupNode(nodeId)) {
            let groupNode = this.ProjectService.getNodeById(nodeId);
            let children = groupNode.ids;
            let n = children.length;

            for (let i = 0; i < n; i++) {
                let childId = children[i];
                let childAlerts = this.getAlertNotifications({nodeId: childId, workgroupId: workgroupId, periodId: periodId});
                alertNotifications = alertNotifications.concat(childAlerts);
            }
        } else {
            notifications = this.getNotifications(nodeId, workgroupId);
            alertNotifications = notifications.filter(
                notification => {
                    if (periodId && periodId !== -1) {
                        return (notification.type === 'CRaterResult' && notification.periodId === periodId);
                    } else {
                        return (notification.type === 'CRaterResult');
                    }
                }
            );
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
