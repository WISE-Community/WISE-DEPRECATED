'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotificationService = function () {
    function NotificationService($http, $rootScope, ConfigService, ProjectService) {
        var _this = this;

        _classCallCheck(this, NotificationService);

        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.notifications = []; // an array of notifications that students haven't seen yet.

        /**
         * We received a new notification.
         */
        this.$rootScope.$on('newNotification', function (event, notification) {
            if (notification != null) {
                if (_this.ConfigService.getWorkgroupId() === notification.toWorkgroupId) {
                    notification.nodePosition = _this.ProjectService.getNodePositionById(notification.nodeId);
                    notification.nodePositionAndTitle = _this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                    _this.notifications.push(notification);
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


    _createClass(NotificationService, [{
        key: 'createNewNotification',
        value: function createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, message) {
            var data = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];

            var nodePosition = this.ProjectService.getNodePositionById(nodeId);
            var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
            var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
            var componentType = null;
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

    }, {
        key: 'retrieveNotifications',
        value: function retrieveNotifications() {
            var _this2 = this;

            var toWorkgroupId = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];


            var notificationURL = this.ConfigService.getNotificationURL();

            if (notificationURL == null) {
                // the notification url is null most likely because we are in preview mode
                return Promise.resolve(this.notifications);
            } else {
                // the notification url is not null so we will retrieve the notifications
                var config = {};
                config.method = 'GET';
                config.url = this.ConfigService.getNotificationURL();
                config.params = {};
                if (toWorkgroupId != null) {
                    config.params.toWorkgroupId = toWorkgroupId;
                } else {
                    config.params.toWorkgroupId = this.ConfigService.getWorkgroupId();
                    config.params.periodId = this.ConfigService.getPeriodId();
                }

                return this.$http(config).then(function (response) {
                    _this2.notifications = response.data;
                    // populate nodePosition and nodePositionAndTitle, where applicable
                    _this2.notifications.map(function (notification) {
                        if (notification.nodeId != null) {
                            notification.nodePosition = _this2.ProjectService.getNodePositionById(notification.nodeId);
                            notification.nodePositionAndTitle = _this2.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                        }
                    });

                    return _this2.notifications;
                });
            }
        }

        /**
         * Saves the notification for the logged-in user
         * @param notification
         */

    }, {
        key: 'saveNotificationToServer',
        value: function saveNotificationToServer(notification) {

            var config = {};
            config.method = 'POST';
            config.url = this.ConfigService.getNotificationURL();
            config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

            var params = {};
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

            return this.$http(config).then(function (result) {
                var notification = result.data;
                return notification;
            });
        }
    }]);

    return NotificationService;
}();

NotificationService.$inject = ['$http', '$rootScope', 'ConfigService', 'ProjectService'];

exports.default = NotificationService;
//# sourceMappingURL=notificationService.js.map