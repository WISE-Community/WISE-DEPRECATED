'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentGradingController = function () {
    function StudentGradingController($filter, $mdDialog, $mdMedia, $scope, $stateParams, AnnotationService, ConfigService, NotificationService, ProjectService, StudentStatusService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, StudentGradingController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        $scope.$mdMedia = $mdMedia;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;

        // scroll to the top of the page
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        this.$translate = this.$filter('translate');

        this.sort = this.TeacherDataService.nodeGradingSort;
        //this.hiddenComponents = [];
        this.permissions = this.ConfigService.getPermissions();
        this.workgroupId = parseInt(this.$stateParams.workgroupId);
        this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
        this.branches = this.ProjectService.getBranches();
        this.avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(this.workgroupId);
        this.displayNames = this.ConfigService.getDisplayNamesByWorkgroupId(this.workgroupId);
        var maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(this.workgroupId);
        this.maxScore = maxScore ? maxScore : 0;
        this.totalScore = this.TeacherDataService.getTotalScoreByWorkgroupId(this.workgroupId);
        this.projectCompletion = this.StudentStatusService.getStudentProjectCompletion(this.workgroupId, true);

        this.$scope.$on('projectSaved', function (event, args) {
            // update project maxScore
            _this.maxScore = _this.StudentStatusService.getMaxScoreForWorkgroupId(_this.workgroupId);

            // update max scores for all nodes
            //this.updateNodeMaxScores();
        });

        this.$scope.$on('notificationAdded', function (event, notification) {
            if (notification.type === 'CRaterResult') {
                // there is a new CRaterResult notification
                // TODO: expand to encompass other notification types that should be shown to teacher
                var workgroupId = notification.toWorkgroupId;
                var _nodeId = notification.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId]) {
                    // update the node with the new notification
                    //this.updateNode(nodeId);
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
                    // update the node with the new notification
                    //this.updateNode(nodeId);
                }
            }
        });

        this.$scope.$on('annotationReceived', function (event, args) {
            var annotation = args.annotation;

            if (annotation) {
                var workgroupId = annotation.toWorkgroupId;
                var _nodeId3 = annotation.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId3]) {
                    // update the total score for the workgroup
                    _this.totalScore = _this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);

                    // update the node with the new annotation
                    //this.updateNode(nodeId);
                }
            }
        });

        // listen for the studentStatusReceived event
        this.$scope.$on('studentStatusReceived', function (event, args) {
            // get the workgroup id
            var studentStatus = args.studentStatus;
            var workgroupId = studentStatus.workgroupId;

            if (workgroupId === _this.workgroupId) {
                // update project completion for workgroup
                _this.projectCompletion = _this.StudentStatusService.getStudentProjectCompletion(_this.workgroupId, true);
            }
        });

        this.$scope.$on('studentWorkReceived', function (event, args) {
            var studentWork = args.studentWork;

            if (studentWork != null) {
                var workgroupId = studentWork.workgroupId;
                var _nodeId4 = studentWork.nodeId;
                if (workgroupId === _this.workgroupId && _this.nodesById[_nodeId4]) {
                    // update the node with the new componentState
                    //this.updateNode(nodeId);
                }
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
     * Check if we should show the given node id for the student. We will
     * determine whether to show a node id or not by checking to see if
     * the node id is in a branch. If the node id is not in a branch we
     * will show it. If the node id is in a branch, we need to check which
     * branch paths the node id is in. If the node id is in a branch path
     * and the student has work for any node id in the branch path, we will
     * show the node id passed into this function.
     * @param nodeId the node id
     * @return whether to show the node for this student
     */


    _createClass(StudentGradingController, [{
        key: 'showNodeIdForStudent',
        value: function showNodeIdForStudent(nodeId) {
            var result = false;

            if (this.ProjectService.isNodeIdInABranch(this.branches, nodeId)) {
                /*
                 * node is in a branch so we will check if we should show
                 * the node for this student. if the student has work in any
                 * step in the branch path, we will show all the nodes in the
                 * branch.
                 */

                // get the branches this node id is in
                var branchPaths = this.ProjectService.getBranchPathsByNodeId(this.branches, nodeId);

                // loop through all the branch paths that this node id is in
                for (var bp = 0; bp < branchPaths.length; bp++) {
                    var branchPathHasWork = false;

                    // get a branch path
                    var branchPath = branchPaths[bp];

                    // loop through all the node ids in the branch path
                    for (var n = 0; n < branchPath.length; n++) {

                        // get a node id in the branch path
                        var nodeIdInBranch = branchPath[n];

                        // get the work for this student for the node id
                        var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(this.workgroupId, nodeIdInBranch);

                        if (componentStates != null && componentStates.length > 0) {
                            /*
                             * the student has work for the step so we will say
                             * the branch path has work and that the node id
                             * passed into the function should be shown
                             */
                            result = true;
                        }
                    }
                }
            } else {
                // node is not in a branch so we will show it
                result = true;
            }

            return result;
        }
    }, {
        key: 'getNodePositionAndTitleByNodeId',
        value: function getNodePositionAndTitleByNodeId(nodeId) {
            return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        }
    }, {
        key: 'getEventsByWorkgroupId',
        value: function getEventsByWorkgroupId(workgroupId) {
            return this.TeacherDataService.getEventsByWorkgroupId(workgroupId);
        }
    }, {
        key: 'getEventsByWorkgroupIdAndNodeId',
        value: function getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
            return this.TeacherDataService.getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId);
        }
    }, {
        key: 'getAnnotationsToWorkgroupId',
        value: function getAnnotationsToWorkgroupId(workgroupId) {
            return this.TeacherDataService.getAnnotationsToWorkgroupId(workgroupId);
        }
    }, {
        key: 'getAnnotationsToWorkgroupIdAndNodeId',
        value: function getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
            return this.TeacherDataService.getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId);
        }
    }, {
        key: 'getComponentStatesByWorkgroupIdAndNodeId',
        value: function getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {
            return this.TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);
        }
    }, {
        key: 'scoreChanged',
        value: function scoreChanged(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-score'];
            this.AnnotationService.saveAnnotation(annotation);
        }
    }, {
        key: 'commentChanged',
        value: function commentChanged(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-comment'];
            this.AnnotationService.saveAnnotation(annotation);
        }
    }, {
        key: 'getComponentsByNodeId',
        value: function getComponentsByNodeId(nodeId) {
            return this.ProjectService.getComponentsByNodeId(nodeId);
        }

        /**
         * Get the student data for a specific student for a specific component
         * @param workgroupId the workgroupId id of Workgroup who created the component state
         * @param nodeId the node id
         * @param componentId the componentId the component id
         * @return the student data for the given component
         */

    }, {
        key: 'getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId',
        value: function getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId(workgroupId, nodeId, componentId) {
            var componentState = null;

            if (workgroupId != null && nodeId != null && componentId != null) {

                // get the latest component state for the component
                componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
            }

            return componentState;
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
    }]);

    return StudentGradingController;
}();

StudentGradingController.$inject = ['$filter', '$mdDialog', '$mdMedia', '$scope', '$stateParams', 'AnnotationService', 'ConfigService', 'NotificationService', 'ProjectService', 'StudentStatusService', 'TeacherDataService'];

exports.default = StudentGradingController;
//# sourceMappingURL=studentGradingController.js.map
