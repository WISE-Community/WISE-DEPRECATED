define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeGradingController', ['$state', 'AnnotationService', 'ConfigService', 'StudentDataService', 'StudentStatusService', 'TeacherDataService',
                                            function ($state, AnnotationService, ConfigService, StudentDataService, StudentStatusService, TeacherDataService) {
        this.title = 'Node Grading!!!';
        
        this.nodeId = StudentDataService.getCurrentNodeId();
        
        var vleStates = TeacherDataService.getVLEStates();
        
        this.workgroupIds = ConfigService.getClassmateWorkgroupIds();
        
        this.annotationMappings = {};
        
        this.getNodeVisitsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var nodeVisits = TeacherDataService.getNodeVisitsByWorkgroupIdAndNodeId(workgroupId, nodeId);
            
            AnnotationService.populateAnnotationMappings(this.annotationMappings, workgroupId, nodeVisits);
            
            return nodeVisits;
        };
        
        this.getUserNameByWorkgroupId = function(workgroupId) {
            var userName = null;
            var userInfo = ConfigService.getUserInfoByWorkgroupId(workgroupId);
            
            if (userInfo != null) {
                userName = userInfo.userName;
            }
            
            return userName;
        };
        
        this.getAnnotationByStepWorkIdAndType = function(stepWorkId, type) {
            var annotation = AnnotationService.getAnnotationByStepWorkIdAndType(stepWorkId, type);
            return annotation;
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