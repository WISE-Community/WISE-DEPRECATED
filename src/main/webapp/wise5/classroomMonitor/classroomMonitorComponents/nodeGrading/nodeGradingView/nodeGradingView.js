'use strict';

class NodeGradingViewController {

    constructor($filter,
                $mdDialog,
                $scope,
                AnnotationService,
                ConfigService,
                NodeService,
                NotificationService,
                ProjectService,
                StudentStatusService,
                TeacherDataService) {

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService,
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.$translate = this.$filter('translate');
        this.nodeContent = null;
    }

    $onInit() {
        this.maxScore = this.getMaxScore();
        this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);
        this.sort = this.TeacherDataService.nodeGradingSort;
        this.nodeContent = this.ProjectService.getNodeById(this.nodeId);
        if (this.componentId) {
            this.hiddenComponents = this.getHiddenComponents();
        }

        // TODO: add loading indicator
        this.TeacherDataService.retrieveStudentDataByNodeId(this.nodeId).then(result => {
            this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();
            this.workgroups = this.ConfigService.getClassmateUserInfos();
            this.workgroupsById = {}; // object that will hold workgroup names, statuses, scores, notifications, etc.
            this.workVisibilityById = {}; // object that specifies whether student work is visible for each workgroup
            this.workgroupInViewById = {}; // object that holds whether the workgroup is in view or not
            const permissions = this.ConfigService.getPermissions();
            this.canViewStudentNames = permissions.canViewStudentNames;
            this.setWorkgroupsById();
            this.nRubrics = this.ProjectService.getNumberOfRubricsByNodeId(this.nodeId);

            // scroll to the top of the page when the page loads
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });

        this.$scope.$on('projectSaved', (event, args) => {
            this.maxScore = this.getMaxScore();
        });

        this.$scope.$on('notificationChanged', (event, notification) => {
            if (notification.type === 'CRaterResult') {
                // TODO: expand to encompass other notification types that should be shown to teacher
                const workgroupId = notification.toWorkgroupId;
                if (this.workgroupsById[workgroupId]) {
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        this.$scope.$on('annotationReceived', (event, args) => {
            const annotation = args.annotation;
            if (annotation) {
                const workgroupId = annotation.toWorkgroupId;
                const nodeId = annotation.nodeId;
                if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        this.$scope.$on('studentWorkReceived', (event, args) => {
            const studentWork = args.studentWork;
            if (studentWork != null) {
                const workgroupId = studentWork.workgroupId;
                const nodeId = studentWork.nodeId;
                if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        // save event when node grading view is displayed and save the nodeId that is displayed
        const context = "ClassroomMonitor", nodeId = this.nodeId, componentId = null, componentType = null,
            category = "Navigation", event = "nodeGradingViewDisplayed", data = { nodeId: this.nodeId };
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    getMaxScore() {
        if (this.componentId) {
            const component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
            if (component && component.maxScore) {
                return component.maxScore;
            } else {
                return 0;
            }
        } else {
            return this.ProjectService.getMaxScoreForNode(this.nodeId);
        }
    }

    getHiddenComponents() {
        let hiddenComponents = [];
        if (this.nodeContent) {
            for (const component of this.nodeContent.components) {
                if (component.id !== this.componentId) {
                    hiddenComponents.push(component.id);
                }
            }
        }
        return hiddenComponents;
    }

    /**
     * Build the workgroupsById object
     */
    setWorkgroupsById() {
        let l = this.workgroups.length;
        for (let i = 0; i < l; i++) {
            let id = this.workgroups[i].workgroupId;
            this.workgroupsById[id] = this.workgroups[i];
            this.workVisibilityById[id] = false;
            this.updateWorkgroup(id, true);
        }
    }

    /**
     * Update statuses, scores, notifications, etc. for a workgroup object. Also check if we need to hide student
     * names because logged-in user does not have the right permissions
     * @param workgroupID a workgroup ID number
     * @param init Boolean whether we're in controller initialization or not
     */
    updateWorkgroup(workgroupId, init) {
        const workgroup = this.workgroupsById[workgroupId];
        if (workgroup) {
            const alertNotifications = this.getAlertNotificationsByWorkgroupId(workgroupId);
            workgroup.hasAlert = alertNotifications.length;
            workgroup.hasNewAlert = this.workgroupHasNewAlert(alertNotifications);
            const completionStatus = this.getCompletionStatusByWorkgroupId(workgroupId);
            workgroup.hasNewWork = completionStatus.hasNewWork;
            workgroup.isVisible = completionStatus.isVisible ? 1 : 0;
            workgroup.completionStatus = this.getWorkgroupCompletionStatus(completionStatus);
            workgroup.score = this.getScoreByWorkgroupId(workgroupId);
            if (!init) {
                this.workgroupsById[workgroupId] = angular.copy(workgroup);
            }
        }
    }

    getAlertNotificationsByWorkgroupId(workgroupId) {
        let args = {};
        args.nodeId = this.nodeId;
        args.toWorkgroupId = workgroupId;
        return this.NotificationService.getAlertNotifications(args);
    }

    workgroupHasNewAlert(alertNotifications) {
        let newAlert = false;
        let l = alertNotifications.length;
        for (let i = 0; i < l; i++) {
            let alert = alertNotifications[i];
            if (!alert.timeDismissed) {
                newAlert = true;
                break;
            }
        }

        return newAlert;
    }

    getCompletionStatusByWorkgroupId(workgroupId) {
        let isCompleted = false;
        let isVisible = false;
        const latestWorkTime = this.getLatestWorkTimeByWorkgroupId(workgroupId); // TODO: store this info in the nodeStatus so we don't have to calculate every time?
        const latestAnnotationTime = this.getLatestAnnotationTimeByWorkgroupId(workgroupId);
        const studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(workgroupId);
        if (studentStatus != null) {
            let nodeStatus = studentStatus.nodeStatuses[this.nodeId];
            if (nodeStatus) {
                isVisible = nodeStatus.isVisible;
                if (!this.ProjectService.nodeHasWork(this.nodeId)) {
                    isCompleted = nodeStatus.isVisited;
                } else if (latestWorkTime) {
                    isCompleted = nodeStatus.isCompleted;
                }
            }
        }
        return {
            isCompleted: isCompleted,
            isVisible: isVisible,
            latestWorkTime: latestWorkTime,
            latestAnnotationTime: latestAnnotationTime
        };
    }

    getLatestWorkTimeByWorkgroupId(workgroupId) {
        let time = null;
        const componentStates = this.TeacherDataService.getComponentStatesByNodeId(this.nodeId);
        const n = componentStates.length-1;
        for (let i = n; i > -1; i--) {
            let componentState = componentStates[i];
            if (componentState.workgroupId === workgroupId) {
                time = componentState.serverSaveTime;
                break;
            }
        }
        return time;
    }

    getLatestAnnotationTimeByWorkgroupId(workgroupId) {
        let time = null;
        let annotations = this.TeacherDataService.getAnnotationsByNodeId(this.nodeId);
        let n = annotations.length-1;

        // loop through annotations for this node, starting with most recent
        for (let i = n; i > -1; i--) {
            let annotation = annotations[i];
            // TODO: support checking for annotations from shared teachers
            if (annotation.toWorkgroupId === workgroupId && annotation.fromWorkgroupId === this.ConfigService.getWorkgroupId()) {
                time = annotation.serverSaveTime;
                break;
            }
        }

        return time;
    }

    /**
     * Returns the score for the current node for a given workgroupID
     * @param workgroupId a workgroup ID number
     * @returns Number score value (defaults to -1 if workgroup has no score)
     */
    getScoreByWorkgroupId(workgroupId) {
        let score = null;
        if (this.componentId) {
            const latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(this.nodeId, this.componentId, workgroupId);
            if (latestScoreAnnotation) {
                score = this.AnnotationService.getScoreValueFromScoreAnnotation(latestScoreAnnotation);
            }
        } else {
            score = this.AnnotationService.getScore(workgroupId, this.nodeId);
        }
        return (typeof score === 'number' ? score : -1);
    }

    /**
     * Returns a numerical status value for a given completion status object depending on node completion
     * Available status values are: 0 (not visited/no work; default), 1 (partially completed), 2 (completed)
     * @param completionStatus Object
     * @returns Integer status value
     */
    getWorkgroupCompletionStatus(completionStatus) {
        let hasWork = completionStatus.latestWorkTime !== null;
        let isCompleted = completionStatus.isCompleted;
        let isVisible = completionStatus.isVisible;

        // TODO: store this info in the nodeStatus so we don't have to calculate every time (and can use more widely)?
        let status = 0; // default

        if (!isVisible) {
            status = -1;
        } else if (isCompleted) {
            status = 2;
        } else if (!this.componentId && hasWork) {
            status = 1;
        }

        return status;
    }

    /**
     * Get the student data for a specific part
     * @param the componentId
     * @param the workgroupId id of Workgroup who created the component state
     * @return the student data for the given component
     */
    getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId,  componentId) {
        var componentState = null;

        if (workgroupId != null && componentId != null) {
            // get the latest component state for the component
            componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, this.nodeId, componentId);
        }

        return componentState;
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    }

    /**
     * Get the percentage of the class or period that has completed the node
     * @param nodeId the node id
     * @returns the percentage of the class or period that has completed the node
     */
    getNodeCompletion(nodeId) {
        // get the currently selected period
        let currentPeriod = this.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the percentage of the class or period that has completed the node
        let completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId).completionPct;

        return completionPercentage;
    }

    /**
     * Get the average score for the node
     * @param nodeId the node id
     * @returns the average score for the node
     */
    getNodeAverageScore() {
        // get the currently selected period
        let currentPeriod = this.TeacherDataService.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the average score for the node
        let averageScore = this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);

        if (averageScore === null) {
            averageScore = 'N/A';
        } else {
            averageScore = this.$filter('number')(averageScore, 1);
        }

        return averageScore;
    }

    /**
     * Checks whether a workgroup should be shown
     * @param workgroupId the workgroupId to look for
     * @returns boolean whether the workgroup should be shown
     */
    isWorkgroupShown(workgroupId) {
        let show = false;

        let currentPeriodId = this.getCurrentPeriod().periodId;
        let workgroup = this.workgroupsById[workgroupId];
        let periodId = workgroup.periodId;

        if (currentPeriodId === -1 || currentPeriodId === periodId) {
            // workgroup is in current period
            let currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
            if (currentWorkgroup) {
                // there is a currently selected workgroup, so check if this one matches
                if (currentWorkgroup.workgroupId === parseInt(workgroupId)) {
                    // workgroupIds match, so show this one
                    show = true;
                }
            } else {
                // there is no currently selected workgroup, so show this one
                show = true;
            }
        }

        return show;
    }

    updateScroll(target, viewportOffsetTop) {
        let newViewportOffsetTop = target.getBoundingClientRect().top;
        let delta = viewportOffsetTop - newViewportOffsetTop;
        let scrollTop = content.scrollTop;
        content.scrollTop = scrollTop - delta;
    }

    /**
     * Show the rubric in the grading view. We will show the step rubric and the
     * component rubrics.
     */
    showRubric($event) {
        this.NodeService.showNodeInfo(this.nodeId, $event);
    }

    setSort(value) {

        switch (value) {
            case 'team':
                if (this.sort === 'team') {
                    this.sort = '-team';
                } else {
                    this.sort = 'team';
                }
                break;
            case 'status':
                if (this.sort === 'status') {
                    this.sort = '-status';
                } else {
                    this.sort = 'status';
                }
                break;
            case 'score':
                if (this.sort === 'score') {
                    this.sort = '-score';
                } else {
                    this.sort = 'score';
                }
                break;
        }

        // update value in the teacher data service so we can persist across view instances and current node changes
        this.TeacherDataService.nodeGradingSort = this.sort;
    }

    getOrderBy() {
        let orderBy = [];

        switch (this.sort) {
            case 'team':
                orderBy = ['-isVisible', 'workgroupId'];
                break;
            case '-team':
                orderBy = ['-isVisible', '-workgroupId'];
                break;
            case 'status':
                orderBy = ['-isVisible', 'completionStatus', 'workgroupId'];
                break;
            case '-status':
                orderBy = ['-isVisible', '-completionStatus', 'workgroupId'];
                break;
            case 'score':
                orderBy = ['-isVisible', 'score', 'workgroupId'];
                break;
            case '-score':
                orderBy = ['-isVisible', '-score', 'workgroupId'];
                break;
        }

        return orderBy;
    }

    /**
     * Expand all workgroups to show student work
     */
    expandAll() {

        // loop through all the workgroups
        for (let i = 0; i < this.workgroups.length; i++) {

            // get a workgroup id
            let id = this.workgroups[i].workgroupId;

            // check if the workgroup is currently in view
            if (this.workgroupInViewById[id]) {
                // the workgroup is currently in view so we will expand it
                this.workVisibilityById[id] = true;
            }
        }

        /*
         * set the boolean flag to denote that we are currently expanding
         * all the workgroups
         */
        this.isExpandAll = true;
    }

    /**
     * Collapse all workgroups to hide student work
     */
    collapseAll() {
        let n = this.workgroups.length;

        for (let i = 0; i < n; i++) {
            let id = this.workgroups[i].workgroupId;
            this.workVisibilityById[id] = false;
        }

        /*
         * set the boolean flag to denote that we are not currently expanding
         * all the workgroups
         */
        this.isExpandAll = false;
    }

    onUpdateExpand(workgroupId, value) {
        this.workVisibilityById[workgroupId] = value;
    }

    onUpdateHiddenComponents(value) {
        this.hiddenComponents = angular.copy(value);
    }

    /**
     * A workgroup row has either come into view or gone out of view
     * @param workgroupId the workgroup id that has come into view or gone out
     * of view
     * @param inview whether the row is in view or not
     */
    workgroupInView(workgroupId, inview) {

        // remember whether the workgroup is in view or not
        this.workgroupInViewById[workgroupId] = inview;

        if (this.isExpandAll) {
            // we are currently in expand all mode

            if (inview) {
                // the workgroup row is in view so we will expand it
                this.workVisibilityById[workgroupId] = true;
            }
        }
    }
}

NodeGradingViewController.$inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
];

const NodeGradingView = {
  bindings: {
      nodeId: '<',
      componentId: '<'
  },
  controller: NodeGradingViewController,
  templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/nodeGrading/nodeGradingView/nodeGradingView.html'
};

export default NodeGradingView;
