define(['configService', 'projectService', 'studentDataService'], function(configService, projectService, studentDataService) {
    
    var service = ['$http', '$injector', '$q', 'ConfigService', 'ProjectService', 'StudentDataService',
                   function($http, $injector, $q, ConfigService, ProjectService, StudentDataService) {
        var serviceObject = {};

        serviceObject.getNodeContentByNodeSrc = function(nodeSrc) {
            return $q(angular.bind(this, function(resolve, reject) {
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
                    nodeContent = this.injectAssetPaths(nodeContent);
                    nodeContent = this.injectNodeLinks(nodeContent);
                    nodeContent = this.injectStudentData(nodeContent);
                    resolve(nodeContent);
                }));
            }));
        };

        serviceObject.retrieveNode = function() {
            var projectFileUrl = ConfigService.getConfigParam('projectURL');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.project = projectJSON;
                return projectJSON;
            }));
        };
        
        serviceObject.isWorkSubmitted0 = function(nodeVisits) {
            var result = false;
            
            if (nodeVisits != null) {
                for (var nv = 0; nv < nodeVisits.length; nv++) {
                    var nodeVisit = nodeVisits[nv];
                    
                    if (nodeVisit != null) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        if (nodeStates != null) {
                            for (var ns = 0; ns < nodeStates.length; ns++) {
                                var nodeState = nodeStates[ns];
                                
                                if (nodeState != null) {
                                    var isSubmit = nodeState.isSubmit;
                                    
                                    if (isSubmit != null) {
                                        result = isSubmit;
                                        
                                        if (result) {
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            if (isSubmit != null) {
                                break;
                            }
                        }
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getLatestNodeState = function(nodeVisits) {
            var result = null;
            
            if (nodeVisits != null) {
                for (var nv = nodeVisits.length - 1; nv >= 0; nv--) {
                    var nodeVisit = nodeVisits[nv];
                    
                    if (nodeVisit != null) {
                        var nodeStates = nodeVisit.nodeStates;
                        
                        for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
                            var nodeState = nodeStates[ns];
                            
                            if (nodeState != null) {
                                result = nodeState;
                                break;
                            }
                        }
                        
                        if (result != null) {
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getStudentWorkAsHTML = function(nodeState) {
            var studentWorkAsHTML = null;
            
            if (nodeState != null) {
                var response = nodeState.response;
                
                studentWorkAsHTML = '<p>' + response + '</p>';
            }
            
            return studentWorkAsHTML;
        };
        
        /**
         * Create a new empty node state
         * @return a new empty node state
         */
        serviceObject.createNewComponentState = function() {
            var nodeState = {};
            
            // set the timestamp
            nodeState.clientSaveTime = Date.parse(new Date());
            
            return nodeState;
        };
        
        
        /**
         * Get the node type in camel case
         * @param nodeType the node type e.g. OpenResponse
         * @return the node type in camel case
         * e.g.
         * openResponse
         */
        serviceObject.toCamelCase = function(nodeType) {
            var nodeTypeCamelCased = null;
            
            if (nodeType != null && nodeType.length > 0) {
                
                // get the first character
                var firstChar = nodeType.charAt(0);
                
                if(firstChar != null) {
                    
                    // make the first character lower case
                    var firstCharLowerCase = firstChar.toLowerCase();
                    
                    if (firstCharLowerCase != null) {
                        
                        /*
                         * replace the first character with the lower case 
                         * character
                         */
                        nodeTypeCamelCased = firstCharLowerCase + nodeType.substr(1);
                    }
                }
            }
            
            return nodeTypeCamelCased;
        };
        
        /**
         * Check if the string is in all uppercase
         * @param str the string to check
         * @return whether the string is in all uppercase
         */
        serviceObject.isStringUpperCase = function(str) {
            var result = false;
            
            if (str != null) {
                if (str === str.toUpperCase()) {
                    // the string is in all uppercase
                    result = true;
                }
            }
            
            return result;
        };
        
        /**
         * Get the component content
         * @param componentContent the component content
         * @param componentId the component id
         * @return the component content
         */
        serviceObject.getComponentContentById = function(nodeContent, componentId) {
            var componentContent = null;
            
            if (nodeContent != null && componentId != null) {
                
                // get the components
                var components = nodeContent.components;
                
                if (components != null) {
                    
                    // loop through the components
                    for (var c = 0; c < components.length; c++) {
                        var tempComponent = components[c];
                        
                        if (tempComponent != null) {
                            var tempComponentId = tempComponent.id;
                            
                            if (tempComponentId === componentId) {
                                // we have found the component with the component id we want
                                componentContent = tempComponent;
                                break;
                            }
                        }
                    }
                }
            }
            
            return componentContent;
        };
        
        /**
         * Check if any of the component states were submitted
         * @param componentStates an array of component states
         * @return whether any of the component states were submitted
         */
        serviceObject.isWorkSubmitted = function(componentStates) {
            var result = false;
            
            if (componentStates != null) {
                
                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {
                    var componentState = componentStates[c];
                    
                    if (componentState != null) {

                        // get the student data
                        var studentData = componentState.studentData;

                        if (studentData != null) {

                            var isSubmit = studentData.isSubmit;

                            // check if the isSubmit flag is true
                            if (isSubmit) {
                                result = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            return result;
        };

        serviceObject.callFunction = function(functionName, functionParams) {
            var result = null;

            if (functionName === 'isCompleted') {
                result = this.isCompleted(functionParams);
            }

            return result;
        };

        /**
         * Check if the node or component is completed
         * @param functionParams the params that will specify which node or component
         * to check for completion
         * @returns whether the specified node or component is completed
         */
        serviceObject.isCompleted = function(functionParams) {

            var result = false;

            if (functionParams != null) {
                var nodeId = functionParams.nodeId;
                var componentId = functionParams.componentId;

                result = StudentDataService.isCompleted(nodeId, componentId);
            }

            return result;
        };
        
        return serviceObject;
    }];
    
    return service;
});