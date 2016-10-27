"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupItemController = function () {
    function WorkgroupItemController($scope, $translate, AnnotationService, ConfigService, NotificationService, ProjectService, StudentStatusService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, WorkgroupItemController);

        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = function () {
            _this.statusClass = '';
            _this.statusText = '';
            _this.score = null;
            _this.alertStatus = null;
            _this.latestWorkTime = null;
            _this.hasMaxScore = typeof _this.maxScore === 'number';
            _this.nodeHasWork = _this.ProjectService.nodeHasWork(_this.nodeId);
            _this.getAlertNotifications();
        };

        this.$scope.$on('notificationAdded', function (event, notification) {
            if (notification.toWorkgroupId === _this.workgroupId && notification.type === 'CRaterResult') {
                // there is a new notification for this workgroup and it is a CRaterResult
                // TODO: expand to encompass other notification types that should be shown to teacher
                _this.alertNotifications.push(notification);
                _this.updateModel();
            }
        });

        this.$scope.$on('notificationChanged', function (event, notification) {
            if (notification.toWorkgroupId === _this.workgroupId && notification.type === 'CRaterResult') {
                // a CRaterResult notification for this workgroup has changed
                // TODO: expand to encompass other notification types that should be shown to teacher
                _this.getAlertNotifications();
            }
        });

        this.$scope.$on('studentStatusReceived', function (event, status) {
            var workgroupId = status.workgroupId;
            var nodeId = status.previousComponentState.nodeId;
            if (workgroupId === _this.workgroupId && nodeId === _this.nodeId) {
                // workgroup has a new componentState for this node
                _this.updateModel();
            }
        });

        this.$scope.$on('annotationReceived', function (event, args) {
            var annotation = args.annotation;

            if (annotation) {
                var workgroupId = annotation.toWorkgroupId;
                var nodeId = annotation.nodeId;
                if (workgroupId === _this.workgroupId && nodeId === _this.nodeId) {
                    // workgroup has a new componentState for this node
                    _this.updateModel();
                }
            }
        });
    }

    _createClass(WorkgroupItemController, [{
        key: 'getAlertNotifications',
        value: function getAlertNotifications() {
            var args = {};
            args.nodeId = this.nodeId;
            args.workgroupId = this.workgroupId;
            this.alertNotifications = this.NotificationService.getAlertNotifications(args);
            this.updateModel();
        }
    }, {
        key: 'updateModel',
        value: function updateModel() {
            var _this2 = this;

            var isCompleted = this.isCompleted();
            var hasWork = this.hasWork();
            var hasNewWork = this.hasNewWork();
            var hasAlert = this.alertNotifications.length > 0;
            var hasNewAlert = this.hasNewAlert();
            this.score = this.getNodeScoreByWorkgroupIdAndNodeId(this.workgroupId, this.nodeId);

            if (hasNewWork) {
                this.statusClass = 'info';
                this.$translate('newWork').then(function (newWork) {
                    _this2.statusText = newWork;
                });
            } else if (isCompleted) {
                this.statusClass = 'success';
                if (this.hasMaxScore) {
                    this.$translate('completed').then(function (completed) {
                        _this2.statusText = completed;
                    });
                } else {
                    this.$translate('visited').then(function (visited) {
                        _this2.statusText = visited;
                    });
                }
            } else if (hasWork) {
                this.$translate('partiallyCompleted').then(function (partiallyCompleted) {
                    _this2.statusText = partiallyCompleted;
                });
            } else {
                if (this.nodeHasWork) {
                    this.$translate('noWork').then(function (noWork) {
                        _this2.statusText = noWork;
                    });
                } else {
                    this.$translate('notVisited').then(function (notVisited) {
                        _this2.statusText = notVisited;
                    });
                }
            }

            if (hasNewAlert) {
                this.statusClass = 'warn';
                this.alertStatus = 'new';
            } else if (hasAlert) {
                this.alertStatus = 'dismissed';
            }
        }
    }, {
        key: 'hasNewAlert',
        value: function hasNewAlert() {
            var result = false;

            var nAlerts = this.alertNotifications.length;
            for (var i = 0; i < nAlerts; i++) {
                var alert = this.alertNotifications[i];
                if (!alert.timeDismissed) {
                    result = true;
                    break;
                }
            }

            return result;
        }
    }, {
        key: 'hasWork',
        value: function hasWork() {
            // TODO: store this info in the nodeStatus so we don't have to calculate every time?
            var result = false;

            var componentStates = this.TeacherDataService.getComponentStatesByNodeId(this.nodeId);
            var n = componentStates.length - 1;

            // loop through component states for this node, starting with most recent
            for (var i = n; i > -1; i--) {
                var componentState = componentStates[i];
                if (componentState.workgroupId === this.workgroupId) {
                    result = true;
                    this.latestWorkTime = componentState.serverSaveTime;
                    break;
                }
            }

            return result;
        }
    }, {
        key: 'hasNewWork',
        value: function hasNewWork() {
            // TODO: store this info in the nodeStatus so we don't have to calculate every time?
            var result = false;
            var latestAnnotationTime = null;

            var annotations = this.TeacherDataService.getAnnotationsByNodeId(this.nodeId);
            var n = annotations.length - 1;

            // loop through annotations for this node, starting with most recent
            for (var i = n; i > -1; i--) {
                var annotation = annotations[i];
                // TODO: support checking for annotations from shared teachers?
                if (annotation.toWorkgroupId === this.workgroupId && annotation.fromWorkgroupId === this.ConfigService.getWorkgroupId()) {
                    latestAnnotationTime = annotation.serverSaveTime;
                    break;
                }
            }

            if (this.latestWorkTime > latestAnnotationTime) {
                result = true;
            }

            return result;
        }
    }, {
        key: 'isCompleted',
        value: function isCompleted() {
            var result = false;
            var studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(this.workgroupId);
            var nodeStatus = studentStatus.nodeStatuses[this.nodeId];

            if (nodeStatus) {
                result = nodeStatus.isCompleted;
            }

            return result;
        }
    }, {
        key: 'getNodeScoreByWorkgroupIdAndNodeId',
        value: function getNodeScoreByWorkgroupIdAndNodeId(workgroupId, nodeId) {
            var score = this.AnnotationService.getScore(workgroupId, nodeId);
            return typeof score === 'number' ? score : '-';
        }
    }]);

    return WorkgroupItemController;
}();

WorkgroupItemController.$inject = ['$scope', '$translate', 'AnnotationService', 'ConfigService', 'NotificationService', 'ProjectService', 'StudentStatusService', 'TeacherDataService'];

var WorkgroupItem = {
    bindings: {
        canViewStudentNames: '<',
        canGradeStudentWork: '<',
        maxScore: '<',
        nodeId: '<',
        workgroupId: '<',
        showWork: '<'
    },
    controller: WorkgroupItemController,
    template: '<md-list-item class="list-item list-item-condensed md-whiteframe-z1"\n                       ng-class="{\'list-item--warn\': $ctrl.statusClass === \'warn\', \'list-item--info\': $ctrl.statusClass === \'info\', \'list-item--expanded\': $ctrl.showWork}"\n                       ng-click="$ctrl.showWork = !$ctrl.showWork"\n                       layout-wrap>\n            <div class="md-list-item-text" layout="row" flex>\n                <div flex layout="row" layout-align="start center">\n                    <workgroup-info workgroup-id="$ctrl.workgroupId" can-view-student-names="$ctrl.canViewStudentNames" alert-status="{{$ctrl.alertStatus}}"></workgroup-info>\n                </div>\n                <div flex="30" layout="row" layout-align="center center">\n                    <workgroup-node-status status-text="{{$ctrl.statusText}}" status-class="{{$ctrl.statusClass}}"></workgroup-node-status>\n                </div>\n                <div ng-if="$ctrl.hasMaxScore" flex="20" layout="row" layout-align="center center">\n                    <workgroup-node-score score="{{$ctrl.score}}" max-score="{{$ctrl.maxScore}}"></workgroup-node-score>\n                </div>\n            </div>\n        </md-list-item>\n        <workgroup-node-grading workgroup-id="$ctrl.workgroupId"\n                                node-id="{{$ctrl.nodeId}}"\n                                latest-work-time="$ctrl.latestWorkTime"\n                                ng-show="$ctrl.showWork"></workgroup-node-grading>'
};

exports.default = WorkgroupItem;
//# sourceMappingURL=workgroupItem.js.map