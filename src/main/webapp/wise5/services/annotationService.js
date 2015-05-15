define([], function() {

    var service = ['$http', 'ConfigService', 'CurrentNodeService', function($http, ConfigService, CurrentNodeService) {
        var serviceObject = {};
        
        serviceObject.annotations = null;
        
        serviceObject.retrieveAnnotationsForStudent = function() {
            var params = {};
            params.toWorkgroup = ConfigService.getWorkgroupId();
            params.fromWorkgroups = ConfigService.getTeacherWorkgroupId();
            params.periodId = ConfigService.getPeriodId();
            return this.retrieveAnnotations(params);
        };
        
        serviceObject.retrieveAnnotationsByNodeId = function() {
            var nodeId = null;
            var workgroupIds = null;
            
            var params = {};
            var currentNodeId = CurrentNodeService.getCurrentNodeId();
            if (currentNodeId != null) {
                nodeId = currentNodeId;
            }
            
            params.nodeId = nodeId;
            
            if (workgroupIds != null) {
                params.userId = workgroupIds.join(':');
            }
            
            return this.retrieveAnnotations(params);
        };
        
        serviceObject.retrieveAnnotations = function(params) {
            
            // get the mode
            var mode = ConfigService.getConfigParam('mode');
            
            if (mode === 'preview') {
                // we are previewing the project
                this.annotations = [];
            } else {
                // we are in a run
                
                // get the annotations url
                var annotationsURL = ConfigService.getConfigParam('annotationsURL');
                
                var httpParams = {};
                httpParams.method = 'GET';
                httpParams.url = annotationsURL;
                httpParams.params = params;
                
                // make the request for the annotations
                return $http(httpParams).then(angular.bind(this, function(result) {
                    
                    if (result != null && result.data != null) {
                        
                        // get the annotations array
                        var annotationsArray = result.data.annotationsArray;
                        
                        if (annotationsArray == null) {
                            this.annotations = [];
                        } else {
                            this.annotations = annotationsArray;
                        }
                    }
                }));
            }
        };
        
        serviceObject.getAnnotationByStepWorkIdAndType = function(stepWorkId, type) {
            var annotation = null;
            
            if (stepWorkId != null && type != null) {
                var annotations = this.annotations;
                
                if (annotations != null) {
                    for (var a = 0; a < annotations.length; a++) {
                        var tempAnnotation = annotations[a];
                        
                        if (tempAnnotation != null) {
                            var tempStepWorkId = tempAnnotation.stepWorkId;
                            var tempType = tempAnnotation.type;
                            
                            if (stepWorkId === tempStepWorkId && type === tempType) {
                                annotation = tempAnnotation;
                                break;
                            }
                        }
                    }
                }
            }
            
            return annotation;
        };
        
        serviceObject.createAnnotation = function(type, nodeId, value, stepWorkId, runId, fromWorkgroup, toWorkgroup, postTime) {
            var annotation = {};
            
            annotation.type = type;
            annotation.nodeId = nodeId;
            annotation.value = value;
            annotation.stepWorkId = stepWorkId;
            annotation.runId = runId;
            annotation.fromWorkgroup = fromWorkgroup;
            annotation.toWorkgroup = toWorkgroup;
            annotation.postTime = postTime;
            
            return annotation;
        };
        
        serviceObject.addOrUpdateAnnotation = function(annotation) {
            if (annotation != null) {
                var stepWorkId = annotation.stepWorkId;
                var type = annotation.type;
                
                var existingAnnotation = this.getAnnotationByStepWorkIdAndType(stepWorkId, type);
                
                if (existingAnnotation == null) {
                    // the annotation does not already exist so we will add it
                    this.annotations.push(annotation);
                } else {
                    // the annotation already exists so we will update it
                    
                    // find the index of the existing annotation
                    var index = this.annotations.indexOf(existingAnnotation);
                    
                    // remove the existing annotation
                    this.annotations.splice(index, 1);
                    
                    // add the new annotation
                    this.annotations.push(annotation);
                }
            }
            
            
        };
        
        serviceObject.saveAnnotation = function(annotation) {
            var annotationsURL = ConfigService.getConfigParam('annotationsURL');
            
            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = annotationsURL;
            var params = {};
            
            params.runId = annotation.runId;
            params.toWorkgroup = annotation.toWorkgroup;
            params.fromWorkgroup = annotation.fromWorkgroup;
            params.annotationType = annotation.type;
            params.value = annotation.value;
            params.nodeId = annotation.nodeId;
            params.stepWorkId = annotation.stepWorkId;
            
            httpParams.params = params;
            return $http(httpParams).then(angular.bind(this, function(result) {
                if (result != null && result.data != null) {
                    var postTime = result.data;
                    
                    annotation.postTime = postTime;
                    
                    this.addOrUpdateAnnotation(annotation);
                }
            }));
        };
        
        serviceObject.populateAnnotationMappings = function(annotationMappings, workgroupId, nodeVisits) {
            
            if (annotationMappings != null && workgroupId != null && nodeVisits != null) {
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
                            scoreAnnotation = this.createAnnotation(type, nodeId, value, stepWorkId, runId, fromWorkgroup, toWorkgroup);
                        }
                        
                        if (commentAnnotation == null) {
                            var type = 'comment';
                            commentAnnotation = this.createAnnotation(type, nodeId, value, stepWorkId, runId, fromWorkgroup, toWorkgroup);
                        }
                        
                        annotationMappings[nodeVisitId + '-score'] = scoreAnnotation;
                        annotationMappings[nodeVisitId + '-comment'] = commentAnnotation;
                    }
                }
            }
            
            return annotationMappings;
        };
        
        return serviceObject;
    }];
    
    return service;
});