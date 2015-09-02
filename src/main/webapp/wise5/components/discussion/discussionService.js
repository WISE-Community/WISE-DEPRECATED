define(['nodeService'], function(nodeService) {
    
    var service = ['$http',
                   '$q',
                   'ConfigService',
                   'NodeService',
                   function($http,
                           $q,
                           ConfigService,
                           NodeService) {
        var serviceObject = Object.create(NodeService);
        
        serviceObject.config = null;
        
        serviceObject.callFunction = function(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;
            
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            
            return result;
        };
        
        serviceObject.wordCountCompare = function(params) {
            var result = false;
            
            if (params != null) {
                var operator = params.operator;
                var count = params.count;
                var nodeVisits = params.nodeVisits;
                
                var latestNodeState = this.getLatestNodeState(nodeVisits);
                
                var wordCount = 0;
                
                if (latestNodeState != null) {
                    var response = latestNodeState.studentData;
                    
                    if (response != null) {
                        wordCount = this.getWordCount(response);
                        
                        if (operator === '<') {
                            if (wordCount < count) {
                                result = true;
                            }
                        } else if (operator === '>=') {
                            if (wordCount >= count) {
                                result = true;
                            }
                        }
                    }
                }
            }
            
            return result;
        };

        serviceObject.getWordCount = function(response) {
            var wordCount = 0;
            
            if (response != null) {
                var regex = /\s+/gi;
                wordCount = response.trim().replace(regex, ' ').split(' ').length;
            }
            
            return wordCount;
        };
        
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = null;
            
            if (nodeState != null) {
                var response = nodeState.studentData;
                
                if (response != null) {
                    studentWorkAsHTML = '<p>' + response + '</p>';
                }
            }
            
            return studentWorkAsHTML;
        };
        
        serviceObject.populateComponentState = function(componentStateFromOtherComponent, otherComponentType) {
            var componentState = null;
            
            if (componentStateFromOtherComponent != null && otherComponentType != null) {
                componentState = StudentDataService.createComponentState();
                
                if (otherComponentType === 'OpenResponse') {
                    componentState.studentData = componentStateFromOtherComponent.studentData;
                }
            }
            
            return componentState;
        };
        
        serviceObject.getClassmateResponses = function(runId, periodId, nodeId, componentId) {
            
            if (runId != null && periodId != null && nodeId != null && componentId != null) {
                return $q(angular.bind(this, function(resolve, reject) {
                    
                    var httpParams = {};
                    httpParams.method = 'GET';
                    httpParams.url = ConfigService.getConfigParam('studentDataURL');
                    
                    var params = {};
                    params.runId = runId;
                    params.periodId = periodId;
                    params.nodeId = nodeId;
                    params.componentId = componentId;
                    params.getComponentStates = true;
                    httpParams.params = params;
                    
                    $http(httpParams).then(angular.bind(this, function(result) {
                        var classmateData = result.data;
                        
                        //console.log(classmateData);
                        
                        resolve(classmateData);
                    }));
                }));
            }
        };

        /**
        * Check if the component was completed
        * @param component the component object
        * @param componentStates the component states for the specific component
        * @param componentEvents the events for the specific component
        * @param nodeEvents the events for the parent node of the component
        * @returns whether the component was completed
        */
        serviceObject.isCompleted = function(component, componentStates, componentEvents, nodeEvents) {
            var result = false;

            if (componentStates != null) {

                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {

                    // the component state
                    var componentState = componentStates[c];

                    // get the student data from the component state
                    var studentData = componentState.studentData;

                    if (studentData != null) {
                        var response = studentData.studentResponse;

                        if (response != null) {
                            // there is a response so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        };


        
        return serviceObject;
    }];
    
    return service;
});