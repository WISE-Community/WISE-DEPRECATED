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
            params.grading = true;
            params.getRevisions = true;
            params.usedCachedWork = false;
            
            httpParams.params = params;
            return $http(httpParams).then(angular.bind(this, function(result) {
                
                if (result != null && result.data != null) {
                    var vleStates = result.data.vleStates;
                    
                    if (vleStates != null) {
                        this.vleStates = vleStates;
                        this.sortVLEStatesAlphabeticallyByUserName();
                    }
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
        
        serviceObject.getVLEStateByWorkgroupId = function(workgroupId) {
            var vleState = null;
            var vleStates = this.vleStates;
            
            for (var v = 0; v < vleStates.length; v++) {
                var tempVLEState = vleStates[v];
                
                if (tempVLEState != null) {
                    var userId = tempVLEState.userId;
                    
                    if (workgroupId === userId) {
                        vleState = tempVLEState;
                    }
                }
            }
            
            return vleState;
        };
        
        serviceObject.getNodeVisitsByWorkgroupIdAndNodeId = function(workgroupId, nodeId) {
            var resultNodeVisits = [];
            
            var vleState = this.getVLEStateByWorkgroupId(workgroupId);
            
            if (vleState != null) {
                var nodeVisits = vleState.nodeVisits;
                
                if (nodeVisits != null) {
                    for (var v = 0; v < nodeVisits.length; v++) {
                        var nodeVisit = nodeVisits[v];
                        
                        if (nodeVisit != null) {
                            var tempNodeId = nodeVisit.nodeId;
                            
                            if (nodeId === tempNodeId) {
                                resultNodeVisits.push(nodeVisit);
                            }
                        }
                    }
                }
            }
            
            return resultNodeVisits;
        };
        
        return serviceObject;
    }];
    
    return service;
});