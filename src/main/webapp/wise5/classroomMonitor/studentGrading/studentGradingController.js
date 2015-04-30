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