'use strict';

define(['app'], function (app) {

    app.$controllerProvider.register('StudentGradingController', ['$state', '$stateParams', 'AnnotationService', 'ConfigService', 'ProjectService', 'TeacherDataService', function ($state, $stateParams, AnnotationService, ConfigService, ProjectService, TeacherDataService) {

        this.annotationMappings = {};

        this.workgroupId = parseInt($stateParams.workgroupId);

        this.userName = ConfigService.getUserNameByWorkgroupId(this.workgroupId);

        this.nodeIds = ProjectService.getFlattenedProjectAsNodeIds();

        this.branches = ProjectService.getBranches();

        this.teacherWorkgroupId = ConfigService.getWorkgroupId();

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
        this.showNodeIdForStudent = function (nodeId) {
            var result = false;

            if (ProjectService.isNodeIdInABranch(this.branches, nodeId)) {
                /*
                 * node is in a branch so we will check if we should show
                 * the node for this student. if the student has work in any
                 * step in the branch path, we will show all the nodes in the
                 * branch.
                 */

                // get the branches this node id is in
                var branchPaths = ProjectService.getBranchPathsByNodeId(this.branches, nodeId);

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
                        var componentStates = TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(this.workgroupId, nodeIdInBranch);

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
        };

        this.getNodePositionAndTitleByNodeId = function (nodeId) {
            return ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        };

        this.getEventsByWorkgroupId = function (workgroupId) {
            return TeacherDataService.getEventsByWorkgroupId(workgroupId);
        };

        this.getEventsByWorkgroupIdAndNodeId = function (workgroupId, nodeId) {
            return TeacherDataService.getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId);
        };

        this.getAnnotationsToWorkgroupId = function (workgroupId) {
            return TeacherDataService.getAnnotationsToWorkgroupId(workgroupId);
        };

        this.getAnnotationsToWorkgroupIdAndNodeId = function (workgroupId, nodeId) {
            return TeacherDataService.getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId);
        };

        this.getComponentStatesByWorkgroupIdAndNodeId = function (workgroupId, nodeId) {
            return TeacherDataService.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);
        };

        this.scoreChanged = function (stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-score'];
            AnnotationService.saveAnnotation(annotation);
        };

        this.commentChanged = function (stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-comment'];
            AnnotationService.saveAnnotation(annotation);
        };

        this.getComponentsByNodeId = function (nodeId) {
            return ProjectService.getComponentsByNodeId(nodeId);
        };

        /**
         * Get the student data for a specific student for a specific component
         * @param workgroupId the workgroupId id of Workgroup who created the component state
         * @param nodeId the node id
         * @param componentId the componentId the component id
         * @return the student data for the given component
         */
        this.getLatestComponentStateByWorkgroupIdAndNodeIdAndComponentId = function (workgroupId, nodeId, componentId) {
            var componentState = null;

            if (workgroupId != null && nodeId != null && componentId != null) {

                // get the latest component state for the component
                componentState = TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId);
            }

            return componentState;
        };

        // scroll to the top of the page when the page loads
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }]);
});
//# sourceMappingURL=studentGradingController.js.map