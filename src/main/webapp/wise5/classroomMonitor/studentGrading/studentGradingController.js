'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentGradingController = function () {
    function StudentGradingController($filter, $mdDialog, $mdMedia, $scope, $state, $stateParams, AnnotationService, ConfigService, NotificationService, ProjectService, StudentStatusService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, StudentGradingController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        $scope.$mdMedia = $mdMedia;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.$translate = this.$filter('translate');

        // scroll to the top of the page
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        var sort = this.TeacherDataService.studentGradingSort;
        this.sort = sort ? sort : 'step';
        this.TeacherDataService.stepGradingSort = this.sort;
        this.permissions = this.ConfigService.getPermissions();
        this.workgroupId = parseInt(this.$stateParams.workgroupId);
        this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
        this.displayNames = this.ConfigService.getDisplayNamesByWorkgroupId(this.workgroupId);
        var maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(this.workgroupId);
        this.maxScore = maxScore ? maxScore : 0;
        this.totalScore = this.TeacherDataService.getTotalScoreByWorkgroupId(this.workgroupId);
        this.projectCompletion = this.StudentStatusService.getStudentProjectCompletion(this.workgroupId, true);
        this.showNonWorkNodes = false;
        this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        this.nodesById = {}; // object that will hold node names, statuses, scores, notifications, etc.
        this.nodeVisibilityById = {}; // object that specifies whether student work is visible for each node
        this.nodesInViewById = {}; // object that holds whether the node is in view or not

        this.setNodesById();

        this.$scope.$on('projectSaved', function (event, args) {
            // project info has changed, so update max scores
            _this.maxScore = _this.StudentStatusService.getMaxScoreForWorkgroupId(_this.workgroupId);
            _this.updateNodeMaxScores();
        });

        this.$scope.$on('notificationAdded', function (event, notification) {
            if (notification.type === 'CRaterResult') {
                // there is a new CRaterResult notification
                // TODO: expand to encompass other notification types that should be shown to teacher
                var workgroupId = notification.toWorkgroupId;
                var _nodeId = notification.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId]) {
                    _this.updateNode(_nodeId);
                }
            }
        });

        this.$scope.$on('notificationChanged', function (event, notification) {
            if (notification.type === 'CRaterResult') {
                // a CRaterResult notification has changed
                // TODO: expand to encompass other notification types that should be shown to teacher
                var workgroupId = notification.toWorkgroupId;
                var _nodeId2 = notification.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId2]) {
                    _this.updateNode(_nodeId2);
                }
            }
        });

        this.$scope.$on('annotationReceived', function (event, args) {
            // a new annotation has been received, so update corresponding node
            var annotation = args.annotation;
            if (annotation) {
                var workgroupId = annotation.toWorkgroupId;
                var _nodeId3 = annotation.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId3]) {
                    _this.totalScore = _this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
                    _this.updateNode(_nodeId3);
                }
            }
        });

        this.$scope.$on('studentWorkReceived', function (event, args) {
            // new student work has been received, so update corresponding node
            var studentWork = args.studentWork;
            if (studentWork != null) {
                var workgroupId = studentWork.workgroupId;
                var _nodeId4 = studentWork.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId4]) {
                    _this.updateNode(_nodeId4);
                }
            }
        });

        this.$scope.$on('currentWorkgroupChanged', function (event, args) {
            // the current workgroup has chnged, so reload the view
            var workgroup = args.currentWorkgroup;
            if (currentWorkgroup != null) {
                _this.$state.go('root.team', { workgroupId: workgroup.workgroupId });
            }
        });

        // save event when student grading view is displayed
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "studentGradingViewDisplayed",
            data = { workgroupId: this.workgroupId };
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    /**
     * Build the nodesById object; don't include group nodes
     */


    _createClass(StudentGradingController, [{
        key: 'setNodesById',
        value: function setNodesById() {
            var l = this.nodeIds.length;
            for (var i = 0; i < l; i++) {
                var id = this.nodeIds[i];
                var isApplicationNode = this.ProjectService.isApplicationNode(id);
                if (isApplicationNode) {
                    var node = this.ProjectService.getNodeById(id);
                    this.nodesById[id] = node;
                    this.nodeVisibilityById[id] = false;
                    this.updateNode(id, true);
                }
            }
        }

        /**
         * Update statuses, scores, notifications, etc. for a node object
         * @param nodeID a node ID number
         * @param init Boolean whether we're in controller initialization or not
         */

    }, {
        key: 'updateNode',
        value: function updateNode(nodeId, init) {
            var node = this.nodesById[nodeId];

            if (node) {
                var alertNotifications = this.getAlertNotificationsByNodeId(nodeId);
                node.hasAlert = alertNotifications.length > 0;
                node.hasNewAlert = this.nodeHasNewAlert(alertNotifications);
                var completionStatus = this.getNodeCompletionStatusByNodeId(nodeId);
                node.hasWork = this.ProjectService.nodeHasWork(nodeId);
                node.hasNewWork = completionStatus.hasNewWork;
                node.isVisible = completionStatus.isVisible ? 1 : 0;
                node.completionStatus = this.getNodeCompletionStatus(completionStatus);
                node.score = this.getNodeScoreByNodeId(nodeId);
                node.hasScore = node.score > -1;
                node.maxScore = this.ProjectService.getMaxScoreForNode(nodeId);
                if (node.maxScore > 0) {
                    node.hasMaxScore = true;
                    node.scorePct = node.score > -1 ? +(node.score / node.maxScore).toFixed(2) : 0;
                } else {
                    node.hasMaxScore = false;
                    node.scorePct = 0;
                }
                node.order = this.ProjectService.getOrderById(nodeId);
                node.show = this.isNodeShown(nodeId);

                if (!init) {
                    this.nodesById[nodeId] = angular.copy(node);
                }
            }
        }
    }, {
        key: 'getAlertNotificationsByNodeId',
        value: function getAlertNotificationsByNodeId(nodeId) {
            var args = {};
            args.nodeId = nodeId;
            args.toWorkgroupId = this.workgroupId;
            return this.NotificationService.getAlertNotifications(args);
        }
    }, {
        key: 'nodeHasNewAlert',
        value: function nodeHasNewAlert(alertNotifications) {
            var newAlert = false;

            var l = alertNotifications.length;
            for (var i = 0; i < l; i++) {
                var alert = alertNotifications[i];
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
         * @param nodeId a node ID number
         * @returns Object with completion, latest work time, latest annotation time
         */

    }, {
        key: 'getNodeCompletionStatusByNodeId',
        value: function getNodeCompletionStatusByNodeId(nodeId) {
            var isCompleted = false;
            var isVisible = false;

            // TODO: store this info in the nodeStatus so we don't have to calculate every time?
            var latestWorkTime = this.getLatestWorkTimeByNodeId(nodeId);

            var latestAnnotationTime = this.getLatestAnnotationTimeByNodeId(nodeId);
            var studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(this.workgroupId);
            if (studentStatus != null) {
                var nodeStatus = studentStatus.nodeStatuses[nodeId];
                if (nodeStatus) {
                    isVisible = nodeStatus.isVisible;
                    if (latestWorkTime) {
                        // workgroup has at least one componentState for this node, so check if node is completed
                        isCompleted = nodeStatus.isCompleted;
                    }

                    if (!this.ProjectService.nodeHasWork(nodeId)) {
                        // the step does not generate any work so completion = visited
                        isCompleted = nodeStatus.isVisited;
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

        /**
         * Returns a numerical status value for a given completion status object depending on node completion
         * Available status values are: 0 (not visited/no work; default), 1 (partially completed), 2 (completed)
         * @param completionStatus Object
         * @returns Integer status value
         */

    }, {
        key: 'getNodeCompletionStatus',
        value: function getNodeCompletionStatus(completionStatus) {
            var hasWork = completionStatus.latestWorkTime !== null;
            var isCompleted = completionStatus.isCompleted;
            var isVisible = completionStatus.isVisible;

            // TODO: store this info in the nodeStatus so we don't have to calculate every time (and can use more widely)?
            var status = 0; // default

            if (!isVisible) {
                status = -1;
            } else if (isCompleted) {
                status = 2;
            } else if (hasWork) {
                status = 1;
            }

            return status;
        }
    }, {
        key: 'getLatestWorkTimeByNodeId',
        value: function getLatestWorkTimeByNodeId(nodeId) {
            var time = null;
            var componentStates = this.TeacherDataService.getComponentStatesByNodeId(nodeId);
            var n = componentStates.length - 1;

            // loop through component states for this node, starting with most recent
            for (var i = n; i > -1; i--) {
                var componentState = componentStates[i];
                if (componentState.workgroupId === this.workgroupId) {
                    // componentState is for given workgroupId
                    time = componentState.serverSaveTime;
                    break;
                }
            }

            return time;
        }
    }, {
        key: 'getLatestAnnotationTimeByNodeId',
        value: function getLatestAnnotationTimeByNodeId(nodeId) {
            var time = null;
            var annotations = this.TeacherDataService.getAnnotationsByNodeId(nodeId);
            var n = annotations.length - 1;

            // loop through annotations for this node, starting with most recent
            for (var i = n; i > -1; i--) {
                var annotation = annotations[i];
                // TODO: support checking for annotations from shared teachers
                if (annotation.toWorkgroupId === this.workgroupId && annotation.fromWorkgroupId === this.ConfigService.getWorkgroupId()) {
                    time = annotation.serverSaveTime;
                    break;
                }
            }

            return time;
        }

        /**
         * Returns the score for the current workgroup for a given nodeId
         * @param nodeId a node ID number
         * @returns Number score value (defaults to -1 if node has no score)
         */

    }, {
        key: 'getNodeScoreByNodeId',
        value: function getNodeScoreByNodeId(nodeId) {
            var score = this.AnnotationService.getScore(this.workgroupId, nodeId);
            return typeof score === 'number' ? score : -1;
        }

        /**
         * Returns a numerical status value for a given completion status object depending on node completion
         * Available status values are: 0 (not visited/no work; default), 1 (partially completed), 2 (completed)
         * @param completionStatus Object
         * @returns Integer status value
         */

    }, {
        key: 'getWorkgroupCompletionStatus',
        value: function getWorkgroupCompletionStatus(completionStatus) {
            var hasWork = completionStatus.latestWorkTime !== null;
            var isCompleted = completionStatus.isCompleted;
            var isVisible = completionStatus.isVisible;

            // TODO: store this info in the nodeStatus so we don't have to calculate every time (and can use more widely)?
            var status = 0; // default

            if (!isVisible) {
                status = -1;
            } else if (isCompleted) {
                status = 2;
            } else if (hasWork) {
                status = 1;
            }

            return status;
        }

        /**
         * Get the student data for a specific part
         * @param the componentId
         * @param the nodeId id of node we're looking for
         * @return the student data for the given component
         */

    }, {
        key: 'getLatestComponentStateByNodeIdAndComponentId',
        value: function getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId) {
            var componentState = null;

            if (nodeId != null && componentId != null) {
                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(this.workgroupId, nodeId, componentId);
            }

            return componentState;
        }

        /**
         * Checks whether a node should be shown
         * @param nodeId the node Id to look for
         * @returns boolean whether the workgroup should be shown
         */

    }, {
        key: 'isNodeShown',
        value: function isNodeShown(nodeId) {
            var show = false;
            var node = this.nodesById[nodeId];

            if (node.isVisible && (node.hasWork || this.showNonWorkNodes)) {
                var currentStep = this.TeacherDataService.getCurrentStep();
                if (currentStep) {
                    // there is a currently selected step, so check if this one matches
                    if (currentStep.nodeId === parseInt(nodeId)) {
                        show = true;
                    }
                } else {
                    // there is no currently selected step, so show this one
                    show = true;
                }
            }

            return show;
        }

        /**
         * Gets and returns the total project score for the currently selected workgroup
         * @return score object or null
         */

    }, {
        key: 'getCurrentWorkgroupScore',
        value: function getCurrentWorkgroupScore() {
            return this.TeacherDataService.getTotalScoreByWorkgroupId(this.workgroupId);
        }
    }, {
        key: 'setSort',
        value: function setSort(value) {

            switch (value) {
                case 'step':
                    if (this.sort === 'step') {
                        this.sort = '-step';
                    } else {
                        this.sort = 'step';
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

            // update value in the teacher data service so we can persist across view instances and workgroup changes
            this.TeacherDataService.studentGradingSort = this.sort;
        }
    }, {
        key: 'getOrderBy',
        value: function getOrderBy() {
            var orderBy = [];

            switch (this.sort) {
                case 'step':
                    orderBy = ['-isVisible', 'order'];
                    break;
                case '-step':
                    orderBy = ['-isVisible', '-order'];
                    break;
                case 'status':
                    orderBy = ['-isVisible', 'completionStatus', 'order'];
                    break;
                case '-status':
                    orderBy = ['-isVisible', '-completionStatus', 'order'];
                    break;
                case 'score':
                    orderBy = ['-isVisible', '-hasScore', 'scorePct', 'score', '-hasMaxScore', '-maxScore', 'order'];
                    break;
                case '-score':
                    orderBy = ['-isVisible', '-hasScore', '-scorePct', 'score', '-hasMaxScore', '-maxScore', 'order'];
                    break;
            }

            return orderBy;
        }

        /**
         * Expand all nodes to show student work
         */

    }, {
        key: 'expandAll',
        value: function expandAll() {

            // loop through all the workgroups
            for (var i = 0; i < this.nodeIds.length; i++) {

                // get a node id
                var id = this.nodeIds[i];

                // check if the node is currently in view
                if (this.nodesInViewById[id]) {
                    // the node is currently in view so we will expand it
                    this.nodeVisibilityById[id] = true;
                }
            }

            /*
             * set the boolean flag to denote that we are currently expanding
             * all the nodes
             */
            this.isExpandAll = true;
        }

        /**
         * Collapse all nodes to hide student work
         */

    }, {
        key: 'collapseAll',
        value: function collapseAll() {
            var n = this.nodeIds.length;

            for (var i = 0; i < n; i++) {
                var id = this.nodeIds[i];
                this.nodeVisibilityById[id] = false;
            }

            /*
             * set the boolean flag to denote that we are not currently expanding
             * all the nodes
             */
            this.isExpandAll = false;
        }
    }, {
        key: 'onUpdateExpand',
        value: function onUpdateExpand(nodeId, value) {
            this.nodeVisibilityById[nodeId] = value;
        }

        /**
         * A node row has either come into view or gone out of view
         * @param nodeId the node id that has come into view or gone out
         * of view
         * @param inview whether the row is in view or not
         */

    }, {
        key: 'stepInView',
        value: function stepInView(nodeId, inview) {

            // remember whether the node is in view or not
            this.nodesInViewById[nodeId] = inview;

            // if we're in expand all mode, expand node row if it's in view
            if (this.isExpandAll) {
                if (inview) {
                    this.nodeVisibilityById[nodeId] = true;
                }
            }
        }
    }]);

    return StudentGradingController;
}();

StudentGradingController.$inject = ['$filter', '$mdDialog', '$mdMedia', '$scope', '$state', '$stateParams', 'AnnotationService', 'ConfigService', 'NotificationService', 'ProjectService', 'StudentStatusService', 'TeacherDataService'];

exports.default = StudentGradingController;
//# sourceMappingURL=studentGradingController.js.map
