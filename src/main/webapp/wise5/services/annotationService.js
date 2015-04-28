define([], function() {

    var service = ['$http', 'ConfigService', 'CurrentNodeService', function($http, ConfigService, CurrentNodeService) {
        var serviceObject = {};
        
        serviceObject.retrieveAnnotationsByNodeId = function() {
            var nodeId = null;
            var workgroupIds = null;
            
            var currentNodeId = CurrentNodeService.getCurrentNodeId();
            if (currentNodeId != null) {
                nodeId = currentNodeId;
            }
            /*
            var classmateWorkgroupIds = ConfigService.getClassmateWorkgroupIds();
            
            if (classmateWorkgroupIds != null) {
                workgroupIds = classmateWorkgroupIds;
            }
            */
            return this.retrieveAnnotations(nodeId, workgroupIds);
        };
        
        serviceObject.retrieveAnnotations = function(nodeId, workgroupIds) {
            var annotationsURL = ConfigService.getConfigParam('annotationsURL');
            
            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = annotationsURL;
            var params = {};
            
            if (nodeId != null) {
                params.nodeId = nodeId;
            }
            
            if (workgroupIds != null) {
                params.userId = workgroupIds.join(':');
            }
            
            httpParams.params = params;
            return $http(httpParams).then(angular.bind(this, function(result) {
                
                if (result != null && result.data != null) {
                    console.log('result.data=' + result.data);
                    /*
                    var vleStates = result.data.vleStates;
                    
                    if (vleStates != null) {
                        this.vleStates = vleStates;
                        this.sortVLEStatesAlphabeticallyByUserName();
                    }
                    */
                }
            }));
        };
        
        return serviceObject;
    }];
    
    return service;
});