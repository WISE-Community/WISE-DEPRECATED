define(['nodeService', 'studentDataService'], function(nodeService, studentDataService) {
    
    var service = ['$http',
                   '$q',
                   'ConfigService',
                   'NodeService',
                   'StudentDataService',
                   function($http,
                           $q,
                           ConfigService,
                           NodeService,
                           StudentDataService) {
        var serviceObject = Object.create(NodeService);
        
        serviceObject.config = null;
        
        serviceObject.callFunction = function(functionName, functionParams) {
            var result = null;
            
            /*
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            */
            
            return result;
        };
        
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = '';
            
            if (nodeState != null) {
                var studentData = nodeState.studentData;
                
                if (studentData != null) {
                    var buckets = studentData.buckets;
                    
                    if (buckets != null) {
                        for (var b = 0; b < buckets.length; b++) {
                            var bucket = buckets[b];
                            
                            if (bucket != null) {
                                var bucketValue = bucket.value;
                                var items = bucket.items;
                                
                                studentWorkAsHTML += bucketValue;
                                studentWorkAsHTML += '<br/>';
                                
                                if (items != null) {
                                    for (var i = 0; i < items.length; i++) {
                                        var item = items[i];
                                        
                                        if (item != null) {
                                            var itemValue = item.value;
                                            
                                            studentWorkAsHTML += itemValue;
                                            studentWorkAsHTML += '<br/>';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            return studentWorkAsHTML;
        };
        
        /**
         * Populate a component state with the data from another component state
         * @param componentStateFromOtherComponent the component state to obtain the data from
         * @return a new component state that contains the student data from the other
         * component state
         */
        serviceObject.populateComponentState = function(componentStateFromOtherComponent) {
            var componentState = null;
            
            if (componentStateFromOtherComponent != null) {
                
                // create an empty component state
                componentState = StudentDataService.createComponentState();
                
                // get the component type of the other component state
                var otherComponentType = componentStateFromOtherComponent.componentType;
                
                if (otherComponentType === 'Match') {
                    // the other component is an Match component
                    
                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;
                    
                    // create a copy of the student data
                    var studentDataCopy = StudentDataService.makeCopyOfJSONObject(studentData);
                    
                    // set the student data into the new component state
                    componentState.studentData = studentDataCopy;
                }
            }
            
            return componentState;
        };
        
        return serviceObject;
    }];
    
    return service;
});