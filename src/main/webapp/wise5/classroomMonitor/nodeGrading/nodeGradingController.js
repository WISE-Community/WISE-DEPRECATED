define(['app'], function(app) {

    app
    .$controllerProvider
    .register('NodeGradingController', ['$state', 'AnnotationService', 'ConfigService', 'CurrentNodeService', 'StudentStatusService', 'TeacherDataService',
                                            function ($state, AnnotationService, ConfigService, CurrentNodeService, StudentStatusService, TeacherDataService) {
        this.title = 'Node Grading!!!';
        
        this.nodeId = CurrentNodeService.getCurrentNodeId();
        
        var vleStates = TeacherDataService.getVLEStates();
        
        this.workgroupIds = ConfigService.getClassmateWorkgroupIds();
        
        this.annotationMappings = {};
        
        this.populateAnnotationMappings = function(workgroupId, nodeVisits) {
            
            if (nodeVisits != null) {
                for (var nv = 0; nv < nodeVisits.length; nv++) {
                    var nodeVisit = nodeVisits[nv];
                    
                    if (nodeVisit != null) {
                        var nodeVisitId = nodeVisit.id;
                        
                        var scoreAnnotation = this.getAnnotationByStepWorkIdAndType(nodeVisitId, 'score');
                        var commentAnnotation = this.getAnnotationByStepWorkIdAndType(nodeVisitId, 'comment');
                        
                        var nodeId = this.nodeId;
                        var value = '';
                        var stepWorkId = nodeVisitId;
                        var runId = ConfigService.getRunId();
                        var fromWorkgroup = ConfigService.getWorkgroupId();
                        var toWorkgroup = workgroupId;
                        
                        if (scoreAnnotation == null) {
                            var type = 'score';
                            scoreAnnotation = AnnotationService.createAnnotation(type, nodeId, value, stepWorkId, runId, fromWorkgroup, toWorkgroup);
                        }
                        
                        if (commentAnnotation == null) {
                            var type = 'comment';
                            commentAnnotation = AnnotationService.createAnnotation(type, nodeId, value, stepWorkId, runId, fromWorkgroup, toWorkgroup);;
                        }
                        
                        this.annotationMappings[nodeVisitId + '-score'] = scoreAnnotation;
                        this.annotationMappings[nodeVisitId + '-comment'] = commentAnnotation;
                    }
                 }
            }
        };
        
        this.getNodeVisitsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var nodeVisits = TeacherDataService.getNodeVisitsByWorkgroupIdAndNodeId(workgroupId, nodeId);
            
            this.populateAnnotationMappings(workgroupId, nodeVisits);
            
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