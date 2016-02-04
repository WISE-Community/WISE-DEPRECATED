'use strict';

class TeacherDataService {
    constructor($http,
                $rootScope,
                AnnotationService,
                ConfigService) {
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;

        this.studentData = {};

        this.currentPeriod = null;
    }

    /**
     * Retrieves the export given the export Type
     * @param exportType
     */
    getExport(exportType) {
        var exportURL = this.ConfigService.getConfigParam('runDataExportURL');
        var runId = this.ConfigService.getRunId();
        exportURL += "/" + runId + "/" + exportType;

        var params = {};
        params.getStudentWork = true;
        params.getEvents = false;
        params.getAnnotations = true;

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.url = exportURL;
        httpParams.params = params;

        return this.$http(httpParams).then(angular.bind(this, function(result) {
            return result.data;
        }));
    };



    /**
     * Retrieve the student data for a node id
     * @param nodeId the node id
     * @returns the student data for the node id
     */
    retrieveStudentDataByNodeId(nodeId) {

        var periodId = null;

        if (this.currentPeriod != null && this.currentPeriod.periodName != 'All') {
            periodId = this.currentPeriod.periodId;
        }

        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.periodId = periodId;
        params.nodeId = nodeId;
        params.workgroupId = null;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the student data for the workgroup id
     * @param workgroupId the workgroup id
     * @returns the student data for the workgroup id
     */
    retrieveStudentDataByWorkgroupId(workgroupId) {

        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.periodId = null;
        params.nodeId = null;
        params.workgroupId = workgroupId;
        params.toWorkgroupId = workgroupId;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the annotations for the run
     * @returns the annotations for the run
     */
    retrieveAnnotations() {
        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.periodId = null;
        params.nodeId = null;
        params.workgroupId = null;
        params.toWorkgroupId = null;
        params.getStudentWork = false;
        params.getEvents = false;
        params.getAnnotations = true;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the student data
     * @param params the params that specify what student data we want
     * @returns a promise
     */
    retrieveStudentData(params) {
        var studentDataURL = this.ConfigService.getConfigParam('teacherDataURL');

        if (params.getStudentWork == null) {
            params.getStudentWork = true;
        }

        if (params.getEvents == null) {
            params.getEvents = false;
        }

        if (params.getAnnotations == null) {
            params.getAnnotations = true;
        }

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.url = studentDataURL;
        httpParams.params = params;

        return this.$http(httpParams).then(angular.bind(this, function(result) {
            var resultData = result.data;
            if (resultData != null) {

                this.studentData = {};

                if (resultData.studentWorkList != null) {
                    var componentStates = resultData.studentWorkList;

                    // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId arrays
                    this.studentData.componentStates = componentStates;
                    this.studentData.componentStatesByWorkgroupId = {};
                    this.studentData.componentStatesByNodeId = {};
                    this.studentData.componentStatesByComponentId = {};

                    for (var i = 0; i < componentStates.length; i++) {
                        var componentState = componentStates[i];

                        var componentStateWorkgroupId = componentState.workgroupId;
                        if (this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] == null) {
                            this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] = new Array();
                        }
                        this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].push(componentState);

                        var componentStateNodeId = componentState.nodeId;
                        if (this.studentData.componentStatesByNodeId[componentStateNodeId] == null) {
                            this.studentData.componentStatesByNodeId[componentStateNodeId] = new Array();
                        }
                        this.studentData.componentStatesByNodeId[componentStateNodeId].push(componentState);

                        var componentId = componentState.componentId;
                        if (this.studentData.componentStatesByComponentId[componentId] == null) {
                            this.studentData.componentStatesByComponentId[componentId] = new Array();
                        }
                        this.studentData.componentStatesByComponentId[componentId].push(componentState);
                    }
                }

                if (resultData.events != null) {
                    // populate allEvents, eventsByWorkgroupId, and eventsByNodeId arrays
                    this.studentData.allEvents = resultData.events;
                    this.studentData.eventsByWorkgroupId = {};
                    this.studentData.eventsByNodeId = {};
                    for (var i = 0; i < resultData.events.length; i++) {
                        var event = resultData.events[i];
                        var eventWorkgroupId = event.workgroupId;
                        if (this.studentData.eventsByWorkgroupId[eventWorkgroupId] == null) {
                            this.studentData.eventsByWorkgroupId[eventWorkgroupId] = new Array();
                        }
                        this.studentData.eventsByWorkgroupId[eventWorkgroupId].push(event);

                        var eventNodeId = event.nodeId;
                        if (this.studentData.eventsByNodeId[eventNodeId] == null) {
                            this.studentData.eventsByNodeId[eventNodeId] = new Array();
                        }
                        this.studentData.eventsByNodeId[eventNodeId].push(event);
                    }
                }

                if (resultData.annotations != null) {
                    // populate annotations, annotationsByWorkgroupId, and annotationsByNodeId arrays
                    this.studentData.annotations = resultData.annotations;
                    this.studentData.annotationsToWorkgroupId = {};
                    this.studentData.annotationsByNodeId = {};
                    for (var i = 0; i < resultData.annotations.length; i++) {
                        var annotation = resultData.annotations[i];
                        var annotationWorkgroupId = annotation.toWorkgroupId;
                        if (this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] == null) {
                            this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
                        }
                        this.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);

                        var annotationNodeId = annotation.nodeId;
                        if (this.studentData.annotationsByNodeId[annotationNodeId] == null) {
                            this.studentData.annotationsByNodeId[annotationNodeId] = new Array();
                        }
                        this.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
                    }
                }

                this.AnnotationService.setAnnotations(this.studentData.annotations);
            }
        }));
    };

    sortVLEStatesAlphabeticallyByUserName() {
        var vleStates = this.vleStates;

        if (vleStates != null) {
            vleStates.sort(this.sortVLEStatesAlphabeticallyByUserNameHelper);
        }

        return vleStates;
    };

    sortVLEStatesAlphabeticallyByUserNameHelper(a, b) {
        var aUserId = a.userId;
        var bUserId = b.userId;
        var result = 0;

        if (aUserId < bUserId) {
            result = -1;
        } else if (aUserId > bUserId) {
            result = 1;
        }

        return result;
    };

    getComponentStatesByWorkgroupId(workgroupId) {
        var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
        if (componentStatesByWorkgroupId != null) {
            return componentStatesByWorkgroupId;
        } else {
            return [];
        }
    };

    getComponentStatesByNodeId(nodeId) {
        var componentStatesByNodeId = this.studentData.componentStatesByNodeId[nodeId];
        if (componentStatesByNodeId != null) {
            return componentStatesByNodeId;
        } else {
            return [];
        }
    };

    /**
     * Get the component stats for a component id
     * @param componentId the component id
     * @returns an array containing component states for a component id
     */
    getComponentStatesByComponentId(componentId) {
        var componentStates = [];

        var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];

        if (componentStatesByComponentId != null) {
            componentStates = componentStatesByComponentId;
        }

        return componentStates;
    };

    getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId) {
        var latestComponentState = null;

        var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

        if (componentStates != null) {

            // loop through all the component states from newest to oldest
            for (var c = componentStates.length - 1; c >= 0; c--) {
                var componentState = componentStates[c];

                if (componentState != null) {
                    var componentStateNodeId = componentState.nodeId;
                    var componentStateComponentId = componentState.componentId;

                    // compare the node id and component id
                    if (nodeId == componentStateNodeId &&
                        componentId == componentStateComponentId) {
                        latestComponentState = componentState;
                        break;
                    }
                }
            }
        }

        return latestComponentState;
    };

    getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {

        var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
        var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

        // find the intersect and return it
        return componentStatesByWorkgroupId.filter(function(n) {
            return componentStatesByNodeId.indexOf(n) != -1;
        });
    };

    /**
     * Get component states for a workgroup id and component id
     * @param workgroupId the workgroup id
     * @param componentId the component id
     * @returns an array of component states
     */
    getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
        var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
        var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

        // find the intersect and return it
        return componentStatesByWorkgroupId.filter(function(n) {
            return componentStatesByComponentId.indexOf(n) != -1;
        });
    }

    getEventsByWorkgroupId(workgroupId) {
        var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
        if (eventsByWorkgroupId != null) {
            return eventsByWorkgroupId;
        } else {
            return [];
        }
    };

    getEventsByNodeId(nodeId) {
        var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
        if (eventsByNodeId != null) {
            return eventsByNodeId;
        } else {
            return [];
        }
    };

    getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
        var eventsByNodeId = this.getEventsByNodeId(nodeId);

        // find the intersect and return it
        return eventsByWorkgroupId.filter(function(n) {
            return eventsByNodeId.indexOf(n) != -1;
        });
    };

    getAnnotationsToWorkgroupId(workgroupId) {
        var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
        if (annotationsToWorkgroupId != null) {
            return annotationsToWorkgroupId;
        } else {
            return [];
        }
    };

    getAnnotationsByNodeId(nodeId) {
        var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
        if (annotationsByNodeId != null) {
            return annotationsByNodeId;
        } else {
            return [];
        }
    };

    getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
        var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

        // find the intersect and return it
        return annotationsToWorkgroupId.filter(function(n) {
            return annotationsByNodeId.indexOf(n) != -1;
        });
    };

    setCurrentPeriod(period) {
        this.currentPeriod = period;
    };

    getCurrentPeriod() {
        return this.currentPeriod;
    };

    /**
     * Get the total score for a workgroup
     * @param workgroupId the workgroup id
     * @returns the total score for the workgroup
     */
    getTotalScoreByWorkgroupId(workgroupId) {

        var totalScore = null;

        if (this.studentData.annotationsToWorkgroupId != null) {

            // get all the annotations for a workgroup
            var annotations = this.studentData.annotationsToWorkgroupId[workgroupId];

            var scoresFound = [];

            // loop through all the annotations from newest to oldest
            for (var a = annotations.length - 1; a >= 0; a--) {

                // get an annotation
                var annotation = annotations[a];

                if (annotation != null) {

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

TeacherDataService.$inject = ['$http',
    '$rootScope',
    'AnnotationService',
    'ConfigService'];

export default TeacherDataService;