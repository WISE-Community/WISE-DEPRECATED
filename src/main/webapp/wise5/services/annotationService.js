'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnnotationService = function () {
    function AnnotationService($http, $rootScope, ConfigService, UtilService) {
        _classCallCheck(this, AnnotationService);

        this.$http = $http;
        this.$rootScope = $rootScope;
        this.ConfigService = ConfigService;
        this.UtilService = UtilService;

        this.annotations = null;
    }

    /**
     * Get all the annotations
     */


    _createClass(AnnotationService, [{
        key: 'getAnnotations',
        value: function getAnnotations() {
            return this.annotations;
        }

        /**
         * Get the latest annotation with the given params
         * @param params an object containing the params to match
         * @returns the latest annotation that matches the params
         */

    }, {
        key: 'getLatestAnnotation',
        value: function getLatestAnnotation(params) {
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

                            if (tempAnnotation.nodeId === nodeId && tempAnnotation.componentId === componentId && tempAnnotation.fromWorkgroupId === fromWorkgroupId && tempAnnotation.toWorkgroupId === toWorkgroupId && tempAnnotation.type === type) {

                                annotation = tempAnnotation;
                                break;
                            }
                        }
                    }
                }
            }

            return annotation;
        }
    }, {
        key: 'createAnnotation',


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
        value: function createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, annotationType, data, clientSaveTime) {

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
        }
    }, {
        key: 'saveAnnotation',


        /**
         * Save the annotation to the server
         * @param annotation the annotation object
         * @returns a promise
         */
        value: function saveAnnotation(annotation) {

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
                httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                httpParams.data = $.param(params);

                return this.$http(httpParams).then(angular.bind(this, function (result) {

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

                                        if (localAnnotation.requestToken != null && localAnnotation.requestToken === savedAnnotation.requestToken) {

                                            // we have found the matching local annotation so we will update it
                                            localAnnotation.id = savedAnnotation.id;
                                            localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
                                            localAnnotation.requestToken = null; // requestToken is no longer needed.

                                            this.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
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
        }
    }, {
        key: 'addOrUpdateAnnotation',


        /**
         * Add or update the annotation to our local collection
         * @param annotation the annotation object
         */
        value: function addOrUpdateAnnotation(annotation) {

            if (annotation != null) {

                var updated = false;

                var annotations = this.annotations;

                if (annotations != null) {

                    // loop through all the local annotations
                    for (var a = annotations.length - 1; a >= 0; a--) {
                        var tempAnnotation = annotations[a];

                        if (tempAnnotation != null) {

                            if (annotation.id == tempAnnotation.id && annotation.nodeId == tempAnnotation.nodeId && annotation.componentId == tempAnnotation.componentId && annotation.fromWorkgroupId == tempAnnotation.fromWorkgroupId && annotation.toWorkgroupId == tempAnnotation.toWorkgroupId && annotation.type == tempAnnotation.type && annotation.studentWorkId == tempAnnotation.studentWorkId && annotation.runId == tempAnnotation.runId && annotation.periodId == tempAnnotation.periodId) {

                                // the annotation matches so we will update it
                                tempAnnotation.data = annotation.data;
                                tempAnnotation.clientSaveTime = annotation.clientSaveTime;
                                tempAnnotation.serverSaveTime = annotation.serverSaveTime;
                                updated = true;
                            }
                        }
                    }
                }

                if (!updated) {
                    // we did not find a match so we will add it
                    annotations.push(annotation);
                }
            }
        }
    }, {
        key: 'setAnnotations',


        /**
         * Set the annotations
         * @param annotations the annotations aray
         */
        value: function setAnnotations(annotations) {
            this.annotations = annotations;
        }
    }, {
        key: 'getTotalScore',


        /**
         * Get the total score for a workgroup
         * @param annotations an array of annotations
         * @param workgroupId the workgroup id
         */
        value: function getTotalScore(annotations, workgroupId) {

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

        /**
         * Get the score for a workgroup for a node
         * @param workgroupId the workgroup id
         * @param nodeId the node id
         * @returns the score for a workgroup for a node
         */

    }, {
        key: 'getScore',
        value: function getScore(workgroupId, nodeId) {

            var score = null;

            /*
             * an array to keep track of the components that we have obtained a
             * score for. we do not want to double count components if the student
             * has received a score multiple times for a node from the teacher.
             */
            var scoresFound = [];

            // get all the annotations
            var annotations = this.annotations;

            if (workgroupId != null && nodeId != null) {
                // loop through all the annotations from newest to oldest
                for (var a = annotations.length - 1; a >= 0; a--) {

                    // get an annotation
                    var annotation = annotations[a];

                    // check that the annotation is for the workgroup id we are looking for
                    if (annotation != null && annotation.toWorkgroupId == workgroupId) {

                        // check that the annotation is a score annotation
                        if (annotation.type === 'score') {

                            var tempNodeId = annotation.nodeId;

                            // check that the annotation is for the node we are looking for
                            if (nodeId == tempNodeId) {
                                var componentId = annotation.componentId;
                                var data = annotation.data;

                                var scoreFound = tempNodeId + '-' + componentId;

                                // check if we have obtained a score from this component already
                                if (scoresFound.indexOf(scoreFound) == -1) {
                                    // we have not obtained a score from this component yet

                                    if (data != null) {
                                        var value = data.value;

                                        if (!isNaN(value)) {

                                            if (score == null) {
                                                score = value;
                                            } else {
                                                score += value;
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
            }

            return score;
        }

        /**
         * Create an auto score annotation
         * @param runId the run id
         * @param periodId the period id
         * @param nodeId the node id
         * @param componentId the component id
         * @param toWorkgroupId the student workgroup id
         * @param data the annotation data
         * @returns the auto score annotation
         */

    }, {
        key: 'createAutoScoreAnnotation',
        value: function createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data) {
            var annotationId = null;
            var fromWorkgroupId = null;
            var studentWorkId = null;
            var annotationType = 'autoScore';
            var clientSaveTime = Date.parse(new Date());

            var annotation = this.createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, annotationType, data, clientSaveTime);

            return annotation;
        }

        /**
         * Create an auto comment annotation
         * @param runId the run id
         * @param periodId the period id
         * @param nodeId the node id
         * @param componentId the component id
         * @param toWorkgroupId the student workgroup id
         * @param data the annotation data
         * @returns the auto comment annotation
         */

    }, {
        key: 'createAutoCommentAnnotation',
        value: function createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data) {
            var annotationId = null;
            var fromWorkgroupId = null;
            var studentWorkId = null;
            var annotationType = 'autoComment';
            var clientSaveTime = Date.parse(new Date());

            var annotation = this.createAnnotation(annotationId, runId, periodId, fromWorkgroupId, toWorkgroupId, nodeId, componentId, studentWorkId, annotationType, data, clientSaveTime);

            return annotation;
        }

        /**
         * Get the latest score annotation
         * @param nodeId the node id
         * @param componentId the component id
         * @param workgroupId the workgroup id
         * @param scoreType (optional) the type of score 
         * e.g.
         * 'autoScore' for auto graded score
         * 'score' for teacher graded score
         * 'any' for auto graded score or teacher graded score
         * @returns the latest score annotation
         */

    }, {
        key: 'getLatestScoreAnnotation',
        value: function getLatestScoreAnnotation(nodeId, componentId, workgroupId, scoreType) {

            var annotation = null;

            var annotations = this.getAnnotations();

            if (scoreType == null) {
                // default to 'any'
                scoreType = 'any';
            }

            // loop through all the annotations from newest to oldest
            for (var a = annotations.length - 1; a >= 0; a--) {
                var tempAnnotation = annotations[a];

                if (tempAnnotation != null) {
                    var acceptAnnotation = false;
                    var tempNodeId = tempAnnotation.nodeId;
                    var tempComponentId = tempAnnotation.componentId;
                    var tempToWorkgroupId = tempAnnotation.toWorkgroupId;
                    var tempAnnotationType = tempAnnotation.type;

                    // make sure the annotation values match what we are looking for
                    if (nodeId == tempNodeId && componentId == tempComponentId && workgroupId == tempToWorkgroupId) {

                        if (scoreType === 'any' && (tempAnnotationType === 'autoScore' || tempAnnotationType === 'score')) {
                            // we are looking for an auto score or teacher score and have found one
                            acceptAnnotation = true;
                        } else if (scoreType === 'autoScore' && tempAnnotationType === 'autoScore') {
                            // we are looking for an auto score and have found one
                            acceptAnnotation = true;
                        } else if (scoreType === 'score' && tempAnnotationType === 'score') {
                            // we are looking for a teacher score and have found one
                            acceptAnnotation = true;
                        }

                        if (acceptAnnotation) {
                            // we have found the latest score annotation of the type we want
                            annotation = tempAnnotation;
                            break;
                        }
                    }
                }
            }

            return annotation;
        }

        /**
         * Get the latest comment annotation
         * @param nodeId the node id
         * @param componentId the component id
         * @param workgroupId the workgroup id
         * @param commentType (optional) the type of comment 
         * e.g.
         * 'autoComment' for auto graded comment
         * 'comment' for teacher graded comment
         * 'any' for auto graded comment or teacher graded comment
         * @returns the latest comment annotation
         */

    }, {
        key: 'getLatestCommentAnnotation',
        value: function getLatestCommentAnnotation(nodeId, componentId, workgroupId, commentType) {

            var annotation = null;

            var annotations = this.getAnnotations();

            if (commentType == null) {
                // default to 'any'
                commentType = 'any';
            }

            // loop through all the annotations from newest to oldest
            for (var a = annotations.length - 1; a >= 0; a--) {
                var tempAnnotation = annotations[a];

                if (tempAnnotation != null) {
                    var acceptAnnotation = false;
                    var tempNodeId = tempAnnotation.nodeId;
                    var tempComponentId = tempAnnotation.componentId;
                    var tempToWorkgroupId = tempAnnotation.toWorkgroupId;
                    var tempAnnotationType = tempAnnotation.type;

                    // make sure the annotation values match what we are looking for
                    if (nodeId == tempNodeId && componentId == tempComponentId && workgroupId == tempToWorkgroupId) {

                        if (commentType === 'any' && (tempAnnotationType === 'autoComment' || tempAnnotationType === 'comment')) {
                            // we are looking for an auto comment or teacher comment and have found one
                            acceptAnnotation = true;
                        } else if (commentType === 'autoComment' && tempAnnotationType === 'autoComment') {
                            // we are looking for an auto comment and have found one
                            acceptAnnotation = true;
                        } else if (commentType === 'comment' && tempAnnotationType === 'comment') {
                            // we are looking for a teacher comment and have found one
                            acceptAnnotation = true;
                        }

                        if (acceptAnnotation) {
                            // we have found the latest comment annotation of the type we want
                            annotation = tempAnnotation;
                            break;
                        }
                    }
                }
            }

            return annotation;
        }

        /**
         * Get the score value from the score annotation
         * @param scoreAnnotation a score annotation
         * @returns the score value e.g. 5
         */

    }, {
        key: 'getScoreValueFromScoreAnnotation',
        value: function getScoreValueFromScoreAnnotation(scoreAnnotation) {
            var scoreValue = null;

            if (scoreAnnotation != null) {
                var data = scoreAnnotation.data;

                if (data != null) {
                    scoreValue = data.value;
                }
            }

            return scoreValue;
        }
    }]);

    return AnnotationService;
}();

AnnotationService.$inject = ['$http', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = AnnotationService;
//# sourceMappingURL=annotationService.js.map