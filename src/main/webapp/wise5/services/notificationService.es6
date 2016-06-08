class NotificationService {
    constructor($http, $rootScope, ConfigService, ProjectService) {

        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.notifications = [];  // an array of notifications that students haven't seen yet.

        /**
         * We received a new notification.
         */
        this.$rootScope.$on('newNotification', (event, notification) => {
            if (notification != null) {
                if (this.ConfigService.getWorkgroupId() === notification.toWorkgroupId) {
                    notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
                    notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                    this.notifications.push(notification);
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
     * @returns newly created notification object
     */
    createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, message, data=null) {
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
        let config = {};
        config.method = 'GET';
        config.url = this.ConfigService.getNotificationURL();
        config.params = {};
        if (toWorkgroupId != null) {
            config.params.toWorkgroupId = toWorkgroupId;
        } else {
            config.params.toWorkgroupId = this.ConfigService.getWorkgroupId();
            config.params.periodId = this.ConfigService.getPeriodId();
        }
        return this.$http(config).then((response) => {
            this.notifications = response.data;
            // populate nodePosition and nodePositionAndTitle, where applicable
            this.notifications.map((notification) => {
                if (notification.nodeId != null) {
                    notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
                    notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                }
            });

            return this.notifications;
        });
    }

    /**
     * Saves the notification for the logged-in user
     * @param notification
     */
    saveNotificationToServer(notification) {

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
        params.timeGenerated = notification.timeGenerated;
        if (notification.timeDismissed != null) {
            params.timeDismissed = notification.timeDismissed;
        }
        config.data = $.param(params);

        return this.$http(config).then((result) => {
            let notification = result.data;
            return notification;
        })
    }
}

NotificationService.$inject = [
    '$http',
    '$rootScope',
    'ConfigService',
    'ProjectService'
];

export default NotificationService;
