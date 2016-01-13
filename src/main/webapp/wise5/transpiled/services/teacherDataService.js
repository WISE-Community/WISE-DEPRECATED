'use strict';

define(['annotationService', 'configService'], function (annotationService, configService) {

    var service = ['$http', '$q', '$rootScope', 'AnnotationService', 'ConfigService', 'StudentDataService', function ($http, $q, $rootScope, AnnotationService, ConfigService) {

        var serviceObject = {};

        serviceObject.studentData = {};

        serviceObject.currentPeriod = null;

        /**
         * Retrieves the export given the export Type
         * @param exportType
         */
        serviceObject.getExport = function (exportType) {
            var exportURL = ConfigService.getConfigParam('runDataExportURL');
            var runId = ConfigService.getRunId();
            exportURL += "/" + runId + "/" + exportType;

            var params = {};
            params.getStudentWork = true;
            params.getEvents = false;
            params.getAnnotations = true;

            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = exportURL;
            httpParams.params = params;

            return $http(httpParams).then(angular.bind(this, function (result) {
                return result.data;
            }));
        };

        /**
         * Retrieve the student data for a node id
         * @param nodeId the node id
         * @returns the student data for the node id
         */
        serviceObject.retrieveStudentDataByNodeId = function (nodeId) {

            var periodId = null;

            if (this.currentPeriod != null && this.currentPeriod.periodName != 'All') {
                periodId = this.currentPeriod.periodId;
            }

            var params = {};
            params.runId = ConfigService.getRunId();
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
        serviceObject.retrieveStudentDataByWorkgroupId = function (workgroupId) {

            var params = {};
            params.runId = ConfigService.getRunId();
            params.periodId = null;
            params.nodeId = null;
            params.workgroupId = workgroupId;
            params.toWorkgroupId = workgroupId;

            return this.retrieveStudentData(params);
        };

        /**
         * Retrieve the student data
         * @param params the params that specify what student data we want
         * @returns a promise
         */
        serviceObject.retrieveStudentData = function (params) {
            var studentDataURL = ConfigService.getConfigParam('teacherDataURL');

            params.getStudentWork = true;
            params.getEvents = false;
            params.getAnnotations = true;

            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = studentDataURL;
            httpParams.params = params;

            return $http(httpParams).then(angular.bind(this, function (result) {
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

                    AnnotationService.setAnnotations(this.studentData.annotations);
                }
            }));
        };

        serviceObject.sortVLEStatesAlphabeticallyByUserName = function () {
            var vleStates = this.vleStates;

            if (vleStates != null) {
                vleStates.sort(this.sortVLEStatesAlphabeticallyByUserNameHelper);
            }

            return vleStates;
        };

        serviceObject.sortVLEStatesAlphabeticallyByUserNameHelper = function (a, b) {
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

        serviceObject.getComponentStatesByWorkgroupId = function (workgroupId) {
            var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
            if (componentStatesByWorkgroupId != null) {
                return componentStatesByWorkgroupId;
            } else {
                return [];
            }
        };

        serviceObject.getComponentStatesByNodeId = function (nodeId) {
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
        serviceObject.getComponentStatesByComponentId = function (componentId) {
            var componentStates = [];

            var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];

            if (componentStatesByComponentId != null) {
                componentStates = componentStatesByComponentId;
            }

            return componentStates;
        };

        serviceObject.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId = function (workgroupId, nodeId, componentId) {
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
                        if (nodeId == componentStateNodeId && componentId == componentStateComponentId) {
                            latestComponentState = componentState;
                            break;
                        }
                    }
                }
            }

            return latestComponentState;
        };

        serviceObject.getComponentStatesByWorkgroupIdAndNodeId = function (workgroupId, nodeId) {

            var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
            var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

            // find the intersect and return it
            return componentStatesByWorkgroupId.filter(function (n) {
                return componentStatesByNodeId.indexOf(n) != -1;
            });
        };

        /**
         * Get component states for a workgroup id and component id
         * @param workgroupId the workgroup id
         * @param componentId the component id
         * @returns an array of component states
         */
        serviceObject.getComponentStatesByWorkgroupIdAndComponentId = function (workgroupId, componentId) {
            var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
            var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

            // find the intersect and return it
            return componentStatesByWorkgroupId.filter(function (n) {
                return componentStatesByComponentId.indexOf(n) != -1;
            });
        };

        serviceObject.getEventsByWorkgroupId = function (workgroupId) {
            var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
            if (eventsByWorkgroupId != null) {
                return eventsByWorkgroupId;
            } else {
                return [];
            }
        };

        serviceObject.getEventsByNodeId = function (nodeId) {
            var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
            if (eventsByNodeId != null) {
                return eventsByNodeId;
            } else {
                return [];
            }
        };

        serviceObject.getEventsByWorkgroupIdAndNodeId = function (workgroupId, nodeId) {
            var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
            var eventsByNodeId = this.getEventsByNodeId(nodeId);

            // find the intersect and return it
            return eventsByWorkgroupId.filter(function (n) {
                return eventsByNodeId.indexOf(n) != -1;
            });
        };

        serviceObject.getAnnotationsToWorkgroupId = function (workgroupId) {
            var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
            if (annotationsToWorkgroupId != null) {
                return annotationsToWorkgroupId;
            } else {
                return [];
            }
        };

        serviceObject.getAnnotationsByNodeId = function (nodeId) {
            var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
            if (annotationsByNodeId != null) {
                return annotationsByNodeId;
            } else {
                return [];
            }
        };

        serviceObject.getAnnotationsToWorkgroupIdAndNodeId = function (workgroupId, nodeId) {
            var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
            var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

            // find the intersect and return it
            return annotationsToWorkgroupId.filter(function (n) {
                return annotationsByNodeId.indexOf(n) != -1;
            });
        };

        serviceObject.setCurrentPeriod = function (period) {
            this.currentPeriod = period;
        };

        serviceObject.getCurrentPeriod = function () {
            return this.currentPeriod;
        };

        return serviceObject;
    }];

    return service;
});