'use strict';

class AnnotationService {
    constructor($http, $rootScope, ConfigService, UtilService) {
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.UtilService = UtilService;

        this.annotations = null;
    }

    /**
     * Get the latest annotation with the given params
     * @param params an object containing the params to match
     * @returns the latest annotation that matches the params
     */
    getLatestAnnotation(params) {
        var annotation = null;

        if (params != null) {
            var nodeId = params.nodeId;
            var componentId = params.componentId;
            var fromWorkgroupId = params.fromWorkgroupId;
            var toWorkgroupId = params.toWorkgroupId;
            var type = params.type;

            var annotations = this.annotations;

            if (annotations != null) {
                for (var a = annotations.length - 1; a >= 0; a--) {
                    var tempAnnotation = annotations[a];

                    if (tempAnnotation != null) {

                        if (tempAnnotation.nodeId === nodeId &&
                            tempAnnotation.componentId === componentId &&
                            tempAnnotation.fromWorkgroupId === fromWorkgroupId &&
                            tempAnnotation.toWorkgroupId === toWorkgroupId &&
                            tempAnnotation.type === type) {

                            annotation = tempAnnotation;
                            break;
                        }
                    }
                }
            }
        }

        return annotation;
    };

    /**
     * Create an annotation object
     * @param annotationId the annotation id
     * @param runId the run id
     * @param periodId the period id
     * @param fromWorkgroupId the from workgroup id
     * @param toWorkgroupId the to workgroup id
     * @param nodeId the node id
     * @param componentId the component id
     * @param studentWorkId the student work id
     * @param annotationType the annotation type
     * @param data the data
     * @param clientSaveTime the client save time
     * @returns an annotation object
     */
    createAnnotation(
        annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId,
        nodeId, componentId, studentWorkId,
        annotationType, data, clientSaveTime) {

        var annotation = {};
        annotation.id = annotationId;
        annotation.runId = runId;
        annotation.periodId = periodId;
        annotation.fromWorkgroupId = fromWorkgroupId;
        annotation.toWorkgroupId = toWorkgroupId;
        annotation.nodeId = nodeId;
        annotation.componentId = componentId;
        annotation.studentWorkId = studentWorkId;
        annotation.type = annotationType;
        annotation.data = data;
        annotation.clientSaveTime = clientSaveTime;

        return annotation;
    };

    /**
     * Save the annotation to the server
     * @param annotation the annotation object
     * @returns a promise
     */
    saveAnnotation(annotation) {

        if (annotation != null) {
            var annotations = [];
            annotations.push(annotation);

            // loop through all the annotations and inject a request token
            if (annotations != null && annotations.length > 0) {
                for (var a = 0; a < annotations.length; a++) {
                    var annotation = annotations[a];

                    if (annotation != null) {
                        annotation.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved annotations.
                        this.addOrUpdateAnnotation(annotation);
                    }
                }
            } else {
                annotations = [];
            }

            var params = {};
            params.runId = this.ConfigService.getRunId();
            params.workgroupId = this.ConfigService.getWorkgroupId();
            params.annotations = angular.toJson(annotations);

            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = this.ConfigService.getConfigParam('teacherDataURL');
            httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            httpParams.data = $.param(params);

            return this.$http(httpParams).then(angular.bind(this, function(result) {

                var localAnnotation = null;

                if (result != null && result.data != null) {
                    var data = result.data;

                    if (data != null) {

                        // get the saved annotations
                        var savedAnnotations = data.annotations;

                        // get the local annotations
                        var localAnnotations = this.annotations;

                        if (savedAnnotations != null && localAnnotations != null) {

                            // loop through all the saved annotations
                            for (var x = 0; x < savedAnnotations.length; x++) {
                                var savedAnnotation = savedAnnotations[x];

                                // loop through all the local annotations
                                for (var y = localAnnotations.length - 1; y >= 0; y--) {
                                    localAnnotation = localAnnotations[y];

                                    if (localAnnotation.requestToken != null &&
                                        localAnnotation.requestToken === savedAnnotation.requestToken) {

                                        // we have found the matching local annotation so we will update it
                                        localAnnotation.id = savedAnnotation.id;
                                        localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
                                        localAnnotation.requestToken = null; // requestToken is no longer needed.

                                        this.$rootScope.$broadcast('annotationSavedToServer', {annotation: localAnnotation});
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                return localAnnotation;
            }));
        }
    };

    /**
     * Add or update the annotation to our local collection
     * @param annotation the annotation object
     */
    addOrUpdateAnnotation(annotation) {

        if (annotation != null) {

            var updated = false;

            var annotations = this.annotations;

            if (annotations != null) {

                // loop through all the local annotations
                for (var a = annotations.length - 1; a >= 0; a--) {
                    var tempAnnotation = annotations[a];

                    if (tempAnnotation != null) {

                        if (annotation.id == tempAnnotation.id &&
                            annotation.nodeId == tempAnnotation.nodeId &&
                            annotation.componentId == tempAnnotation.componentId &&
                            annotation.fromWorkgroupId == tempAnnotation.fromWorkgroupId &&
                            annotation.toWorkgroupId == tempAnnotation.toWorkgroupId &&
                            annotation.type == tempAnnotation.type &&
                            annotation.studentWorkId == tempAnnotation.studentWorkId &&
                            annotation.runId == tempAnnotation.runId &&
                            annotation.periodId == tempAnnotation.periodId) {

                            // the annotation matches so we will update it
                            tempAnnotation.data = annotation.data;
                            tempAnnotation.clientSaveTime = annotation.clientSaveTime;
                            tempAnnotation.serverSaveTime = annotation.serverSaveTime;
                        }
                    }
                }
            }

            if (!updated) {
                // we did not find a match so we will add it
                annotations.push(annotation);
            }
        }
    };

    /**
     * Set the annotations
     * @param annotations the annotations aray
     */
    setAnnotations(annotations) {
        this.annotations = annotations;
    };

    /**
     * Get the total score for a workgroup
     * @param annotations an array of annotations
     * @param workgroupId the workgroup id
     */
    getTotalScore(annotations, workgroupId) {

        var totalScore = 0;

        var scoresFound = [];

        if (annotations != null && workgroupId != null) {
            // loop through all the annotations from newest to oldest
            for (var a = annotations.length - 1; a >= 0; a--) {

                // get an annotation
                var annotation = annotations[a];

                // check that the annotation is for the workgroup id we are looking for
                if (annotation != null && annotation.toWorkgroupId == workgroupId) {

                    // check that the annotation is a score annotation
                    if (annotation.type === 'score') {

                        var nodeId = annotation.nodeId;
                        var componentId = annotation.componentId;
                        var data = annotation.data;

                        var scoreFound = nodeId + '-' + componentId;

                        // check if we have obtained a score from this component already
                        if (scoresFound.indexOf(scoreFound) == -1) {
                            // we have not obtained a score from this component yet

                            if (data != null) {
                                var value = data.value;

                                if (!isNaN(value)) {

                                    if (totalScore == null) {
                                        totalScore = value;
                                    } else {
                                        totalScore += value;
                                    }

                                    /*
                                     * remember that we have found a score for this component
                                     * so that we don't double count it if the teacher scored
                                     * the component more than once
                                     */
                                    scoresFound.push(scoreFound);
                                }
                            }
                        }
                    }
                }
            }
        }

        return totalScore;
    }
}

AnnotationService.$inject = ['$http', '$rootScope', 'ConfigService', 'UtilService'];

export default AnnotationService;
