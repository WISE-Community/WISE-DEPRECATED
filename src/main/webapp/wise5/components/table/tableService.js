define(['nodeService', 'studentDataService'], function(nodeService, studentDataService) {
    
    var service = ['$http', 'NodeService', 'StudentDataService', function($http, NodeService, StudentDataService) {
        var serviceObject = Object.create(NodeService);
        
        serviceObject.config = null;
        
        serviceObject.callFunction = function(functionName, functionParams) {
            var result = null;
            
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            
            return result;
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
                
                if (otherComponentType === 'Table') {
                    // the other component is an Table component
                    
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