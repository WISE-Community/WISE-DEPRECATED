define(['configService', 'currentNodeService'], function(configService, currentNodeService) {

    var service = ['$http', '$q', '$rootScope', 'ConfigService', 'CurrentNodeService',
                                    function($http, $q, $rootScope, ConfigService, CurrentNodeService) {
        var serviceObject = {};
        
        serviceObject.vleStates = null;
        
        serviceObject.getVLEStates = function() {
            return this.vleStates;
        };
        
        serviceObject.retrieveStudentDataByNodeId = function() {
            var nodeIds = [];
            var workgroupIds = [];
            
            var currentNodeId = CurrentNodeService.getCurrentNodeId();
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
            params.getComponentStates = true;
            params.getEvents = true;
            params.getAnnotations = true;

            httpParams.params = params;
            return $http(httpParams).then(angular.bind(this, function(result) {
                var resultData = result.data;
                if (resultData != null) {

                    this.studentData = {};

                    // get student work and populate componentStates array
                    this.studentData.allComponentStates = resultData.componentStates;
                    this.studentData.componentStatesByWorkgroupId = {};
                    this.studentData.componentStatesByNodeId = {};
                    for (var i = 0; i < resultData.componentStates.length; i++) {
                        var componentState = resultData.componentStates[i];
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
                    }

                    // get events
                    this.studentData.events = resultData.events;

                    // get annotations
                    this.studentData.annotations = resultData.annotations;
                }
                /*
                var vleStates = result.data.vleStates;
                if (vleStates != null) {
                    this.studentData = vleStates[0];
                    var nodeVisits = this.getNodeVisits();
                    var latestNodeVisit = this.getLatestNodeVisit();
                    
                    this.loadStudentNodes();
                    this.populateHistories(nodeVisits);
                    this.updateNodeStatuses();
                }
                return this.studentData;
                */
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

        serviceObject.getComponentStatesByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {

            var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
            var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

            // find the intersect and return it
            return componentStatesByWorkgroupId.filter(function(n) {
                return componentStatesByNodeId.indexOf(n) != -1;
            });
        };
        
        return serviceObject;
    }];
    
    return service;
});