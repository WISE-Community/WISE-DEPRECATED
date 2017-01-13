"use strict";

class WorkgroupItemController {
    constructor($scope,
                $translate,
                AnnotationService,
                ConfigService,
                NotificationService,
                ProjectService,
                StudentStatusService,
                TeacherDataService) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = () => {
            this.statusClass = '';
            this.statusText = '';
            this.score = null;
            this.alertStatus = null;
            this.latestWorkTime = null;
            this.hasMaxScore = (typeof this.maxScore === 'number');
            this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);
            this.getAlertNotifications();
        };

        this.$onChanges = (changesObj) => {

            if (changesObj.hiddenComponents) {
                this.hiddenComponents = angular.copy(changesObj.hiddenComponents.currentValue);
            }
        };

        this.$scope.$on('notificationAdded', (event, notification) => {
            if (notification.toWorkgroupId === this.workgroupId && notification.type === 'CRaterResult') {
                // there is a new notification for this workgroup and it is a CRaterResult
                // TODO: expand to encompass other notification types that should be shown to teacher
                this.alertNotifications.push(notification);
                this.updateModel();
            }
        });

        this.$scope.$on('notificationChanged', (event, notification) => {
            if (notification.toWorkgroupId === this.workgroupId && notification.type === 'CRaterResult') {
                // a CRaterResult notification for this workgroup has changed
                // TODO: expand to encompass other notification types that should be shown to teacher
                this.getAlertNotifications();
            }
        });

        this.$scope.$on('studentStatusReceived', (event, status) => {
            let workgroupId = status.workgroupId;
            let nodeId = status.previousComponentState.nodeId;
            if (workgroupId === this.workgroupId && nodeId === this.nodeId) {
                // workgroup has a new componentState for this node
                this.updateModel();
            }
        });

        this.$scope.$on('annotationReceived', (event, args) => {
            let annotation = args.annotation;

            if (annotation) {
                let workgroupId = annotation.toWorkgroupId;
                let nodeId = annotation.nodeId;
                if (workgroupId === this.workgroupId && nodeId === this.nodeId) {
                    // workgroup has a new annotation for this node
                    this.updateModel();
                }
            }
        });

        this.$scope.$on('studentWorkReceived', (event, args) => {
            let studentWork = args.studentWork;

            if (studentWork != null) {
                let workgroupId = studentWork.workgroupId;
                let nodeId = studentWork.nodeId;
                if (workgroupId === this.workgroupId && nodeId === this.nodeId) {
                    // workgroup has a new componentState for this node
                    this.updateModel();
                }
            }
        });
    };

    getAlertNotifications() {
        let args = {};
        args.nodeId = this.nodeId;
        args.workgroupId = this.workgroupId;
        this.alertNotifications = this.NotificationService.getAlertNotifications(args);
        this.updateModel();
    }

    updateModel() {
        let isCompleted = this.isCompleted();
        let hasWork = this.hasWork();
        let hasNewWork = this.hasNewWork();
        let hasAlert = (this.alertNotifications.length > 0);
        let hasNewAlert = this.hasNewAlert();
        this.score = this.getNodeScoreByWorkgroupIdAndNodeId(this.workgroupId, this.nodeId);

        if (hasNewWork) {
            this.statusClass = 'info';
            this.$translate('newWork').then(newWork => {
                this.statusText = newWork;
            });
        } else if (isCompleted) {
            this.statusClass = 'success';
            if (this.hasMaxScore) {
                this.$translate('completed').then(completed => {
                    this.statusText = completed;
                });
            } else {
                this.$translate('visited').then(visited => {
                    this.statusText = visited;
                });
            }
        } else if (hasWork) {
            this.$translate('partiallyCompleted').then(partiallyCompleted => {
                this.statusText = partiallyCompleted;
            });
        } else {
            if (this.node) {
                this.$translate('noWork').then(noWork => {
                    this.statusText = noWork;
                });
            } else {
                this.$translate('notVisited').then(notVisited => {
                    this.statusText = notVisited;
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

    hasNewAlert() {
        let result = false;

        let nAlerts = this.alertNotifications.length;
        for (let i = 0; i < nAlerts; i++) {
            let alert = this.alertNotifications[i];
            if (!alert.timeDismissed) {
                result = true;
                break;
            }
        }

        return result;
    }

    hasWork() {
        // TODO: store this info in the nodeStatus so we don't have to calculate every time?
        let result = false;

        let componentStates = this.TeacherDataService.getComponentStatesByNodeId(this.nodeId);
        let n = componentStates.length-1;

        // loop through component states for this node, starting with most recent
        for (let i = n; i > -1; i--) {
            let componentState = componentStates[i];
            if (componentState.workgroupId === this.workgroupId) {
                result = true;
                this.latestWorkTime = componentState.serverSaveTime;
                break;
            }
        }

        return result;
    }

    hasNewWork() {
        // TODO: store this info in the nodeStatus so we don't have to calculate every time?
        let result = false;
        let latestAnnotationTime = null;

        let annotations = this.TeacherDataService.getAnnotationsByNodeId(this.nodeId);
        let n = annotations.length-1;

        // loop through annotations for this node, starting with most recent
        for (let i = n; i > -1; i--) {
            let annotation = annotations[i];
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

    isCompleted() {
        let result = false;
        let studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(this.workgroupId);
        let nodeStatus = studentStatus.nodeStatuses[this.nodeId];

        if (nodeStatus) {
            result = nodeStatus.isCompleted;
        }

        return result;
    }

    getNodeScoreByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        let score = this.AnnotationService.getScore(workgroupId, nodeId);
        return (typeof score === 'number' ? score : '-');
    }

    updateHiddenComponents(value, event) {
        this.onUpdate({value: value, event: event});
    }
}

WorkgroupItemController.$inject = [
    '$scope',
    '$translate',
    'AnnotationService',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
];

const WorkgroupItem = {
    bindings: {
        canViewStudentNames: '<',
        canGradeStudentWork: '<',
        maxScore: '<',
        nodeId: '<',
        workgroupId: '<',
        showWork: '<',
        hiddenComponents: '<',
        onUpdate: '&'
    },
    controller: WorkgroupItemController,
    template:
        `<md-list-item class="list-item list-item-condensed md-whiteframe-z1"
                       ng-class="{'list-item--warn': $ctrl.statusClass === 'warn', 'list-item--info': $ctrl.statusClass === 'info', 'list-item--expanded': $ctrl.showWork}"
                       ng-click="$ctrl.showWork = !$ctrl.showWork"
                       layout-wrap>
            <div class="md-list-item-text" layout="row" flex>
                <div flex layout="row" layout-align="start center">
                    <workgroup-info workgroup-id="$ctrl.workgroupId" can-view-student-names="$ctrl.canViewStudentNames" alert-status="{{$ctrl.alertStatus}}"></workgroup-info>
                </div>
                <div flex="30" layout="row" layout-align="center center">
                    <workgroup-node-status status-text="{{$ctrl.statusText}}" status-class="{{$ctrl.statusClass}}"></workgroup-node-status>
                </div>
                <div ng-if="$ctrl.hasMaxScore" flex="20" layout="row" layout-align="center center">
                    <workgroup-node-score score="{{$ctrl.score}}" max-score="{{$ctrl.maxScore}}"></workgroup-node-score>
                </div>
            </div>
        </md-list-item>
        <workgroup-node-grading workgroup-id="$ctrl.workgroupId"
                                node-id="{{$ctrl.nodeId}}"
                                latest-work-time="$ctrl.latestWorkTime"
                                ng-if="$ctrl.showWork"
                                hidden-components="$ctrl.hiddenComponents"
                                on-update="$ctrl.updateHiddenComponents(value, event)"></workgroup-node-grading>`
};

export default WorkgroupItem;
