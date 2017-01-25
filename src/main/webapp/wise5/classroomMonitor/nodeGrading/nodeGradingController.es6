'use strict';

class NodeGradingController {

    constructor($filter,
                $scope,
                $state,
                $stateParams,
                $timeout,
                AnnotationService,
                ConfigService,
                NodeService,
                NotificationService,
                ProjectService,
                StudentStatusService,
                TeacherDataService) {

        this.$filter = $filter;
        this.$state = $state;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        this.$translate = this.$filter('translate');

        this.nodeId = this.$stateParams.nodeId;

        // the max score for the node
        this.maxScore = this.ProjectService.getMaxScoreForNode(this.nodeId);
        this.hasMaxScore = (typeof this.maxScore === 'number');

        let startNodeId = this.ProjectService.getStartNodeId();
        this.rootNode = this.ProjectService.getRootNode(startNodeId);

        this.sort = this.TeacherDataService.nodeGradingSort;

        this.hiddenComponents = [];

        // TODO: add loading indicator
        this.TeacherDataService.retrieveStudentDataByNodeId(this.nodeId).then(result => {

            // field that will hold the node content
            this.nodeContent = null;

            this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

            this.periods = [];

            var node = this.ProjectService.getNodeById(this.nodeId);

            if (node != null) {

                // field that will hold the node content
                this.nodeContent = node;
            }

            this.workgroupIds = this.ConfigService.getClassmateWorkgroupIds();
            this.workgroupsById = {}; // object that will hold workgroup names, statuses, scores, notifications, etc.
            this.workVisibilityById = {}; // object that specifies whether student work is visible for each workgroup

            this.canViewStudentNames = true;
            this.canGradeStudentWork = true;

            // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
            var role = this.ConfigService.getTeacherRole(this.teacherWorkgroupId);

            if (role === 'owner') {
                // the teacher is the owner of the run and has full access
                this.canViewStudentNames = true;
                this.canGradeStudentWork = true;
            } else if (role === 'write') {
                // the teacher is a shared teacher that can grade the student work
                this.canViewStudentNames = true;
                this.canGradeStudentWork = true;
            } else if (role === 'read') {
                // the teacher is a shared teacher that can only view the student work
                this.canViewStudentNames = false;
                this.canGradeStudentWork = false;
            }

            this.annotationMappings = {};

            this.componentStateHistory = [];

            this.setWorkgroupsById();

            // scroll to the top of the page when the page loads
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });

        this.$scope.$on('notificationAdded', (event, notification) => {
            if (notification.type === 'CRaterResult') {
                // there is a new CRaterResult notification
                // TODO: expand to encompass other notification types that should be shown to teacher
                let workgroupId = notification.toWorkgroupId;
                if (this.workgroupsById[workgroupId]) {
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        this.$scope.$on('notificationChanged', (event, notification) => {
            if (notification.type === 'CRaterResult') {
                // a CRaterResult notification has changed
                // TODO: expand to encompass other notification types that should be shown to teacher
                let workgroupId = notification.toWorkgroupId;
                if (this.workgroupsById[workgroupId]) {
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        this.$scope.$on('studentStatusReceived', (event, status) => {
            // new student status received
            let workgroupId = status.workgroupId;
            let nodeId = status.previousComponentState.nodeId;
            if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
                // a workgroup has a new componentState for this node
                this.updateWorkgroup(workgroupId);
            }
        });

        this.$scope.$on('annotationReceived', (event, args) => {
            let annotation = args.annotation;

            if (annotation) {
                let workgroupId = annotation.toWorkgroupId;
                let nodeId = annotation.nodeId;
                if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
                    // a workgroup has a new annotation for this node
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        this.$scope.$on('studentWorkReceived', (event, args) => {
            let studentWork = args.studentWork;

            if (studentWork != null) {
                let workgroupId = studentWork.workgroupId;
                let nodeId = studentWork.nodeId;
                if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
                    // a workgroup has a new componentState for this node
                    this.updateWorkgroup(workgroupId);
                }
            }
        });

        // save event when node grading view is displayed and save the nodeId that is displayed
        let context = "ClassroomMonitor", nodeId = this.nodeId, componentId = null, componentType = null,
            category = "Navigation", event = "nodeGradingViewDisplayed", data = { nodeId: this.nodeId };
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    /**
     * Build the workgroupsById object
     */
    setWorkgroupsById() {
        let l = this.workgroupIds.length;
        for (let i = 0; i < l; i++) {
            let id = this.workgroupIds[i];
            this.workgroupsById[id] = {};
            this.workVisibilityById[id] = false;

            this.updateWorkgroup(id, true);
        }
    }

    /**
     * Update statuses, scores, notifications, etc. for a workgroup object
     * @param workgroupID a workgroup ID number
     * @param init Boolean whether we're in controller initialization or not
     */
    updateWorkgroup(workgroupId, init) {
        let workgroup = this.workgroupsById[workgroupId];

        if (workgroup) {
            let alertNotifications = this.getAlertNotificationsByWorkgroupId(workgroupId);
            workgroup.hasAlert = alertNotifications.length;
            workgroup.hasNewAlert = this.workgroupHasNewAlert(alertNotifications);
            let completionStatus = this.getNodeCompletionStatusByWorkgroupId(workgroupId);
            workgroup.hasNewWork = completionStatus.hasNewWork;
            workgroup.completionStatus = this.getWorkgroupCompletionStatus(completionStatus);
            workgroup.score = this.getNodeScoreByWorkgroupId(workgroupId);
            workgroup.usernames = this.getUsernamesByWorkgroupId(workgroupId);

            if (!init) {
                this.workgroupsById[workgroupId] = angular.copy(workgroup);
            }
        }
    }

    getAlertNotificationsByWorkgroupId(workgroupId) {
        let args = {};
        args.nodeId = this.nodeId;
        args.workgroupId = workgroupId;
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

    /**
     * Returns an object with node completion status, latest work time, and latest annotation time
     * for a workgroup for the current node
     * @param workgroupId a workgroup ID number
     * @returns Object with completion, latest work time, latest annotation time
     */
    getNodeCompletionStatusByWorkgroupId(workgroupId) {
        let isCompleted = false;

        // TODO: store this info in the nodeStatus so we don't have to calculate every time?
        let latestWorkTime = this.getLatestWorkTimeByWorkgroupId(workgroupId);


        let latestAnnotationTime = this.getLatestAnnotationTimeByWorkgroupId(workgroupId);

        if (latestWorkTime) {
            // workgroup has at least one componentState for this node, so check if node is completed
            let studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(workgroupId);
            let nodeStatus = studentStatus.nodeStatuses[this.nodeId];

            if (nodeStatus) {
                isCompleted = nodeStatus.isCompleted;
            }
        }

        return {
            isCompleted: isCompleted,
            latestWorkTime: latestWorkTime,
            latestAnnotationTime: latestAnnotationTime
        };
    }

    getLatestWorkTimeByWorkgroupId(workgroupId) {
        let time = null;
        let componentStates = this.TeacherDataService.getComponentStatesByNodeId(this.nodeId);
        let n = componentStates.length-1;

        // loop through component states for this node, starting with most recent
        for (let i = n; i > -1; i--) {
            let componentState = componentStates[i];
            if (componentState.workgroupId === workgroupId) {
                // componentState is for given workgroupId
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
    getNodeScoreByWorkgroupId(workgroupId) {
        let score = this.AnnotationService.getScore(workgroupId, this.nodeId);
        return (typeof score === 'number' ? score : -1);
    }

    /**
     * Returns the usernames for a given workgroupId
     * @param workgroupId a workgroup ID number
     * @returns String the workgroup usernames
     */
    getUsernamesByWorkgroupId(workgroupId) {
        let usernames = '';
        if (this.canViewStudentNames) {
            let names = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
            let l = names.length;
            for (let i = 0; i < l; i++) {
                let name = names[0].name;
                usernames += name;

                if (i < (l-1)) {
                    usernames += ', ';
                }
            }
        } else {
            // current user is not allowed to view student names, so return string with workgroupId
            usernames = this.$translate('teamId', {workgroupId: this.workgroupId});
        }

        return usernames;
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
        
        // TODO: store this info in the nodeStatus so we don't have to calculate every time (and can use more widely)?
        let status = 0; // default

        if (isCompleted) {
            status = 2;
        } else if (hasWork) {
            status = 1;
        }

        return status;
    }

    /**
     * Get the html template for the component
     * @param componentType the component type
     * @return the path to the html template for the component
     */
    getComponentTemplatePath(componentType) {
        return this.NodeService.getComponentTemplatePath(componentType);
    }

    /**
     * Get the components for this node.
     * @return an array that contains the content for the components
     */
    getComponents() {
        var components = null;

        if (this.nodeContent != null) {
            components = this.nodeContent.components;
        }

        if (components != null && this.isDisabled) {
            for (var c = 0; c < components.length; c++) {
                var component = components[c];

                component.isDisabled = true;
            }
        }

        if (components != null && this.nodeContent.lockAfterSubmit) {
            for (c = 0; c < components.length; c++) {
                component = components[c];

                component.lockAfterSubmit = true;
            }
        }

        return components;
    }

    getComponentById(componentId) {
        var component = null;

        if (componentId != null) {
            var components = this.getComponents();

            if (components != null) {
                for (var c = 0; c < components.length; c++) {
                    var tempComponent = components[c];

                    if (tempComponent != null) {
                        if (componentId === tempComponent.id) {
                            component = tempComponent;
                            break;
                        }
                    }
                }
            }
        }

        return component;
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
     * Get the student data for a specific part
     * @param the componentId
     * @param the workgroupId id of Workgroup who created the component state
     * @return the student data for the given component
     */
    getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId(workgroupId, nodeId, componentId) {
        var componentState = null;

        if (workgroupId != null && nodeId != null && componentId != null) {

            // get the latest component state for the component
            componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
        }

        return componentState;
    }

    getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

        //AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, componentStates);

        return componentStates;
    }

    getUserNameByWorkgroupId(workgroupId) {
        return this.ConfigService.getUserNameByWorkgroupId(workgroupId);
    }

    getAnnotationByStepWorkIdAndType(stepWorkId, type) {
        return this.AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
    }

    getNodeScoreByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        let score = this.AnnotationService.getScore(workgroupId, nodeId);
        return (typeof score === 'number' ? score : '-');
    }

    scoreChanged(stepWorkId) {
        var annotation = this.annotationMappings[stepWorkId + '-score'];
        this.AnnotationService.saveAnnotation(annotation);
    }

    commentChanged(stepWorkId) {
        var annotation = this.annotationMappings[stepWorkId + '-comment'];
        this.AnnotationService.saveAnnotation(annotation);
    }

    setupComponentStateHistory() {
        this.getComponentStatesByWorkgroupIdAndNodeId()
    }

    /**
     * Get the period id for a workgroup id
     * @param workgroupId the workgroup id
     * @returns the period id for the workgroup id
     */
    getPeriodIdByWorkgroupId(workgroupId) {
        return this.ConfigService.getPeriodIdByWorkgroupId(workgroupId);
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
        let completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId);

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

        return (averageScore === null ? 'N/A' : this.$filter('number')(averageScore, 1));
    }

    /**
     * Get the number of students in the current period
     * @returns the number of students that are in the period
     */
    getNumberOfStudentsInPeriod() {
        // get the currently selected period
        let currentPeriod = this.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the number of students that are on the node in the period
        let count = this.StudentStatusService.getWorkgroupIdsOnNode(this.rootNode.id, periodId).length;

        return count;
    }

    /**
     * Checks whether a workgroup is in the current period
     * @param workgroupId the workgroupId to look for
     * @returns boolean whether the workgroup is in the current period
     */
    isWorkgroupInCurrentPeriod(workgroupId) {
        return (this.getCurrentPeriod().periodName === "All" ||
            this.getPeriodIdByWorkgroupId(workgroupId) === this.getCurrentPeriod().periodId);
    }

    onUpdateExpand(workgroupId, value) {
        this.workVisibilityById[workgroupId] = !this.workVisibilityById[workgroupId];
    }

    onUpdateHiddenComponents(value, event) {
        let target = event.target;
        let viewportOffsetTop = target.getBoundingClientRect().top;

        this.hiddenComponents = value;
        this.hiddenComponents = angular.copy(this.hiddenComponents);

        this.$timeout(() => {
            this.updateScroll(target, viewportOffsetTop);
        }, 100);

    }

    updateScroll(target, viewportOffsetTop) {
        let newViewportOffsetTop = target.getBoundingClientRect().top;
        let delta = viewportOffsetTop - newViewportOffsetTop;
        let scrollTop = content.scrollTop;
        content.scrollTop = scrollTop - delta; 
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
                orderBy = ['usernames'];
                break;
            case '-team':
                orderBy = ['-usernames'];
                break;
            case 'status':
                orderBy = ['completionStatus', 'score'];
                break;
            case '-status':
                orderBy = ['-completionStatus', 'score'];
                break;
            case 'score':
                orderBy = ['score', 'usernames'];
                break;
            case '-score':
                orderBy = ['-score', 'usernames'];
                break;
        }

        return orderBy;
    }
}

NodeGradingController.$inject = [
    '$filter',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
];

export default NodeGradingController;
