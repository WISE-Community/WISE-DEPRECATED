define(['app'], function(app) {

    app
    .$controllerProvider
    .register('StudentGradingController', ['$state', '$stateParams', 'AnnotationService', 'ConfigService', 'ProjectService', 'TeacherDataService',
                                            function ($state, $stateParams, AnnotationService, ConfigService, ProjectService, TeacherDataService) {
        this.title = 'Student Grading';
        
        this.annotationMappings = {};
        
        this.workgroupId = parseInt($stateParams.workgroupId);
        
        this.userName = ConfigService.getUserNameByWorkgroupId(this.workgroupId);
        
        this.nodeIds = ProjectService.getFlattenedProjectAsNodeIds();
        
        this.branches = ProjectService.getBranches();
        
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
        this.showNodeIdForStudent = function(nodeId) {
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
                        var nodeVisits = TeacherDataService.getNodeVisitsByWorkgroupIdAndNodeId(this.workgroupId, nodeIdInBranch);
                        
                        if (nodeVisits != null && nodeVisits.length > 0) {
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
        
        this.getNodeTitleByNodeId = function(nodeId) {
            return ProjectService.getNodeTitleByNodeId(nodeId);
        };
        
        this.getNodeVisitsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var nodeVisits = TeacherDataService.getNodeVisitsByWorkgroupIdAndNodeId(workgroupId, nodeId);
            
            AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, nodeVisits);
            
            return nodeVisits;
        };
        
        this.scoreChanged = function(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-score'];
            AnnotationService.saveAnnotation(annotation);
        };
        
        this.commentChanged = function(stepWorkId) {
            var annotation = this.annotationMappings[stepWorkId + '-comment'];
            AnnotationService.saveAnnotation(annotation);
        }
    }]);
    
});