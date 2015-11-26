define(['configService', 'studentDataService'], function(configService, studentDataService) {

    var service = ['$http', '$q', '$rootScope', 'ConfigService', 'StudentDataService',
                                    function($http, $q, $rootScope, ConfigService, StudentDataService) {
        var serviceObject = {};
        
        serviceObject.vleStates = null;
        
        serviceObject.getVLEStates = function() {
            return this.vleStates;
        };
        
        serviceObject.retrieveStudentDataByNodeId = function(nodeId) {
            var nodeIds = [];
            var workgroupIds = [];
            
            var currentNodeId = StudentDataService.getCurrentNodeId();
            if (currentNodeId != null) {
                nodeIds.push(currentNodeId);
            }
            
            var classmateWorkgroupIds = ConfigService.getClassmateWorkgroupIds();
            
            if (classmateWorkgroupIds != null) {
                workgroupIds = classmateWorkgroupIds;
            }
            
            return this.retrieveStudentData(nodeIds, workgroupIds);
        };
        
        serviceObject.retrieveStudentDataByWorkgroupId = function() {
            
        };
        
        serviceObject.retrieveStudentData = function(nodeIds, workgroupIds) {
            var studentDataURL = ConfigService.getConfigParam('studentDataURL');
            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = studentDataURL;
            var params = {};
            //params.userId = ConfigService.getWorkgroupId();
            
            if (nodeIds != null) {
                params.nodeIds = nodeIds.join(':');
            }
            
            if (workgroupIds != null) {
                params.userId = workgroupIds.join(':');
            }
            
            params.runId = ConfigService.getRunId();
            params.getStudentWork = true;
            params.getEvents = true;
            params.getAnnotations = true;

            httpParams.params = params;
            return $http(httpParams).then(angular.bind(this, function(result) {
                var resultData = result.data;
                if (resultData != null) {

                    this.studentData = {};

                    // get student work
                    var componentStates = [];
                    var nodeStates = [];
                    var studentWorkList = resultData.studentWorkList;
                    for (var s = 0; s < studentWorkList.length; s++) {
                        var studentWork = studentWorkList[s];
                        if (studentWork.componentId != null) {
                            componentStates.push(studentWork);
                        } else {
                            nodeStates.push(studentWork);
                        }
                    }

                    // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId arrays
                    this.studentData.allComponentStates = componentStates;
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

                    // populate allAnnotations, annotationsByWorkgroupId, and annotationsByNodeId arrays
                    this.studentData.allAnnotations = resultData.annotations;
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
            }));
        };
        
        serviceObject.sortVLEStatesAlphabeticallyByUserName = function() {
            var vleStates = this.vleStates;
            
            if (vleStates != null) {
                vleStates.sort(this.sortVLEStatesAlphabeticallyByUserNameHelper);
            }
            
            return vleStates;
        };
        
        serviceObject.sortVLEStatesAlphabeticallyByUserNameHelper = function(a, b) {
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

        serviceObject.getComponentStatesByWorkgroupId = function(workgroupId) {
            var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
            if (componentStatesByWorkgroupId != null) {
                return componentStatesByWorkgroupId;
            } else {
                return [];
            }
        };

        serviceObject.getComponentStatesByNodeId = function(nodeId) {
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
        serviceObject.getComponentStatesByComponentId = function(componentId) {
            var componentStates = [];

            var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];

            if (componentStatesByComponentId != null) {
                componentStates = componentStatesByComponentId;
            }

            return componentStates;
        };

        serviceObject.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId = function(workgroupId, nodeId, componentId) {
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

        serviceObject.getComponentStatesByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {

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
        serviceObject.getComponentStatesByWorkgroupIdAndComponentId = function(workgroupId, componentId) {
            var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
            var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

            // find the intersect and return it
            return componentStatesByWorkgroupId.filter(function(n) {
                return componentStatesByComponentId.indexOf(n) != -1;
            });
        }

        serviceObject.getEventsByWorkgroupId = function(workgroupId) {
            var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
            if (eventsByWorkgroupId != null) {
                return eventsByWorkgroupId;
            } else {
                return [];
            }
        };

        serviceObject.getEventsByNodeId = function(nodeId) {
            var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
            if (eventsByNodeId != null) {
                return eventsByNodeId;
            } else {
                return [];
            }
        };

        serviceObject.getEventsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
            var eventsByNodeId = this.getEventsByNodeId(nodeId);

            // find the intersect and return it
            return eventsByWorkgroupId.filter(function(n) {
                return eventsByNodeId.indexOf(n) != -1;
            });
        };

        serviceObject.getAnnotationsToWorkgroupId = function(workgroupId) {
            var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
            if (annotationsToWorkgroupId != null) {
                return annotationsToWorkgroupId;
            } else {
                return [];
            }
        };

        serviceObject.getAnnotationsByNodeId = function(nodeId) {
            var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
            if (annotationsByNodeId != null) {
                return annotationsByNodeId;
            } else {
                return [];
            }
        };

        serviceObject.getAnnotationsToWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
            var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

            // find the intersect and return it
            return annotationsToWorkgroupId.filter(function(n) {
                return annotationsByNodeId.indexOf(n) != -1;
            });
        };

        return serviceObject;
    }];
    
    return service;
});