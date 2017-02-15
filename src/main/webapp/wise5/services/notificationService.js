'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotificationService = function () {
    function NotificationService($http, $q, $rootScope, ConfigService, ProjectService, StudentWebSocketService, UtilService) {
        var _this = this;

        _classCallCheck(this, NotificationService);

        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentWebSocketService = StudentWebSocketService;
        this.UtilService = UtilService;
        this.notifications = []; // an array of notifications that students haven't seen yet.

        /**
         * We received a new notification.
         */
        this.$rootScope.$on('newNotification', function (event, notification) {
            if (notification != null) {
                var workgroupId = _this.ConfigService.getWorkgroupId();
                var mode = _this.ConfigService.getMode();
                if (mode === 'classroomMonitor' || workgroupId === notification.toWorkgroupId) {
                    notification.nodePosition = _this.ProjectService.getNodePositionById(notification.nodeId);
                    notification.nodePositionAndTitle = _this.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                    // check if this notification is new or is an update
                    var isNotificationNew = true;
                    for (var n = 0; n < _this.notifications.length; n++) {
                        var currentNotification = _this.notifications[n];
                        if (currentNotification.id == notification.id) {
                            // existing notification (with same id) found, so it's an update
                            _this.notifications[n] = notification;
                            isNotificationNew = false;
                            _this.$rootScope.$broadcast('notificationChanged', notification);
                            break;
                        }
                    }
                    if (isNotificationNew) {
                        // this is a new notification
                        _this.notifications.push(notification);
                        _this.$rootScope.$broadcast('notificationAdded', notification);
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


    _createClass(NotificationService, [{
        key: 'createNewNotification',
        value: function createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, message) {
            var data = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
            var groupId = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;

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

    }, {
        key: 'retrieveNotifications',
        value: function retrieveNotifications() {
            var _this2 = this;

            var toWorkgroupId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


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
                } else if (this.ConfigService.getMode() !== 'classroomMonitor') {
                    config.params.toWorkgroupId = this.ConfigService.getWorkgroupId();
                    config.params.periodId = this.ConfigService.getPeriodId();
                }

                return this.$http(config).then(function (response) {
                    _this2.notifications = response.data;
                    // populate nodePosition and nodePositionAndTitle, where applicable
                    if (_this2.notifications != null) {
                        _this2.notifications.map(function (notification) {
                            if (notification.nodeId != null) {
                                notification.nodePosition = _this2.ProjectService.getNodePositionById(notification.nodeId);
                                notification.nodePositionAndTitle = _this2.ProjectService.getNodePositionAndTitleByNodeId(notification.nodeId);
                            }
                            if (notification.data != null) {
                                // parse the data string into a JSON object
                                notification.data = angular.fromJson(notification.data);
                            }
                        });
                    } else {
                        _this2.notifications = [];
                    }

                    return _this2.notifications;
                });
            }
        }

        /**
         * Dismisses the specified notification
         * @param notification
         */

    }, {
        key: 'dismissNotification',
        value: function dismissNotification(notification) {
            this.dismissNotificationToServer(notification);
        }

        /**
         * Handle creating notification for score
         * @param notificationForScore
         */

    }, {
        key: 'sendNotificationForScore',
        value: function sendNotificationForScore(notificationForScore) {
            var _this3 = this;

            var notificationType = notificationForScore.notificationType;
            if (notificationForScore.isNotifyTeacher || notificationForScore.isNotifyStudent) {
                // notify both teacher and student at the same time
                var fromWorkgroupId = this.ConfigService.getWorkgroupId();
                var notificationGroupId = this.ConfigService.getRunId() + "_" + this.UtilService.generateKey(10); // links student and teacher notifications together
                var notificationData = {};
                if (notificationForScore.isAmbient) {
                    notificationData.isAmbient = true;
                }
                if (notificationForScore.dismissCode != null) {
                    notificationData.dismissCode = notificationForScore.dismissCode;
                }
                if (notificationForScore.isNotifyStudent) {
                    // send notification to student
                    var toWorkgroupId = this.ConfigService.getWorkgroupId();
                    var notificationMessageToStudent = notificationForScore.notificationMessageToStudent;
                    // replace variables like {{score}} and {{dismissCode}} with actual values
                    notificationMessageToStudent = notificationMessageToStudent.replace("{{username}}", this.ConfigService.getUserNameByWorkgroupId(fromWorkgroupId));
                    notificationMessageToStudent = notificationMessageToStudent.replace("{{score}}", notificationForScore.score);
                    notificationMessageToStudent = notificationMessageToStudent.replace("{{dismissCode}}", notificationForScore.dismissCode);

                    var notificationToStudent = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId, fromWorkgroupId, toWorkgroupId, notificationMessageToStudent, notificationData, notificationGroupId);
                    this.saveNotificationToServer(notificationToStudent).then(function (savedNotification) {
                        // show local notification
                        _this3.$rootScope.$broadcast('newNotification', savedNotification);
                    });
                }

                if (notificationForScore.isNotifyTeacher) {
                    // send notification to teacher
                    var _toWorkgroupId = this.ConfigService.getTeacherWorkgroupId();
                    var notificationMessageToTeacher = notificationForScore.notificationMessageToTeacher;
                    // replace variables like {{score}} and {{dismissCode}} with actual values
                    notificationMessageToTeacher = notificationMessageToTeacher.replace("{{username}}", this.ConfigService.getUserNameByWorkgroupId(fromWorkgroupId));
                    notificationMessageToTeacher = notificationMessageToTeacher.replace("{{score}}", notificationForScore.score);
                    notificationMessageToTeacher = notificationMessageToTeacher.replace("{{dismissCode}}", notificationForScore.dismissCode);

                    var notificationToTeacher = this.createNewNotification(notificationType, notificationForScore.nodeId, notificationForScore.componentId, fromWorkgroupId, _toWorkgroupId, notificationMessageToTeacher, notificationData, notificationGroupId);
                    this.saveNotificationToServer(notificationToTeacher).then(function (savedNotification) {
                        // send notification in real-time so teacher sees this right away
                        var messageType = "CRaterResultNotification";
                        _this3.StudentWebSocketService.sendStudentToTeacherMessage(messageType, savedNotification);
                    });
                }
            }
        }

        /**
         * Saves the notification for the logged-in user
         * @param notification
         */

    }, {
        key: 'saveNotificationToServer',
        value: function saveNotificationToServer(notification) {

            if (this.ConfigService.isPreview()) {

                // if we're in preview, don't make any request to the server but pretend we did
                var deferred = this.$q.defer();
                deferred.resolve(notification);
                return deferred.promise;
            } else {

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
                if (notification.groupId != null) {
                    params.groupId = notification.groupId;
                }
                params.timeGenerated = notification.timeGenerated;
                if (notification.timeDismissed != null) {
                    params.timeDismissed = notification.timeDismissed;
                }
                config.data = $.param(params);

                return this.$http(config).then(function (result) {
                    var notification = result.data;
                    if (notification.data != null) {
                        // parse the data string into a JSON object
                        notification.data = angular.fromJson(notification.data);
                    }
                    return notification;
                });
            }
        }

        /**
         * Saves the notification for the logged-in user
         * @param notification
         */

    }, {
        key: 'dismissNotificationToServer',
        value: function dismissNotificationToServer(notification) {
            var _this4 = this;

            notification.timeDismissed = Date.parse(new Date()); // set dismissed time to now.

            if (this.ConfigService.isPreview()) {

                // if we're in preview, don't make any request to the server but pretend we did
                var deferred = this.$q.defer();
                deferred.resolve(notification);
                return deferred.promise;
            } else {
                if (notification.id == null) {
                    // cannot dismiss a notification that hasn't been saved to db yet
                    return;
                }

                var config = {};
                config.method = 'POST';
                config.url = this.ConfigService.getNotificationURL() + "/dismiss";
                config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

                var params = {};
                params.notificationId = notification.id;
                params.fromWorkgroupId = notification.fromWorkgroupId;
                params.toWorkgroupId = notification.toWorkgroupId;
                params.type = notification.type;
                if (notification.groupId != null) {
                    params.groupId = notification.groupId;
                }
                params.timeDismissed = notification.timeDismissed;
                config.data = $.param(params);

                return this.$http(config).then(function (result) {
                    var notification = result.data;
                    if (notification.data != null) {
                        // parse the data string into a JSON object
                        notification.data = angular.fromJson(notification.data);
                    }
                    _this4.$rootScope.$broadcast('notificationChanged', notification);
                    return notification;
                });
            }
        }

        /**
         * Returns all notifications for a given nodeId and workgroupId
         * @param nodeId the nodeId to look for (optional)
         * @param workgroupId the workgroupId to look for (optional)
         * TODO: update this to allow for more parameters (like periodId, maybe componentID?)
         */

    }, {
        key: 'getNotifications',
        value: function getNotifications(nodeId, workgroupId) {
            if (nodeId || workgroupId) {
                return this.notifications.filter(function (notification) {
                    if (nodeId && workgroupId) {
                        return notification.nodeId === nodeId && notification.toWorkgroupId === workgroupId;
                    } else if (nodeId) {
                        return notification.nodeId === nodeId;
                    } else if (workgroupId) {
                        return notification.toWorkgroupId === workgroupId;
                    }
                });
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

    }, {
        key: 'getAlertNotifications',
        value: function getAlertNotifications(args) {
            // get all CRaterResult notifications for the giver parameters
            // TODO: expand to encompass other notification types that should be shown to teacher
            var notifications = [];
            var alertNotifications = [];
            var nodeId = args.nodeId;
            var workgroupId = args.workgroupId;
            var periodId = args.periodId;

            if (nodeId && this.ProjectService.isGroupNode(nodeId)) {
                var groupNode = this.ProjectService.getNodeById(nodeId);
                var children = groupNode.ids;
                var n = children.length;

                for (var i = 0; i < n; i++) {
                    var childId = children[i];
                    var childAlerts = this.getAlertNotifications({ nodeId: childId, workgroupId: workgroupId, periodId: periodId });
                    alertNotifications = alertNotifications.concat(childAlerts);
                }
            } else {
                notifications = this.getNotifications(nodeId, workgroupId);
                alertNotifications = notifications.filter(function (notification) {
                    if (periodId && periodId !== -1) {
                        return notification.type === 'CRaterResult' && notification.periodId === periodId;
                    } else {
                        return notification.type === 'CRaterResult';
                    }
                });
            }

            return alertNotifications;
        }
    }]);

    return NotificationService;
}();

NotificationService.$inject = ['$http', '$q', '$rootScope', 'ConfigService', 'ProjectService', 'StudentWebSocketService', 'UtilService'];

exports.default = NotificationService;
//# sourceMappingURL=notificationService.js.map