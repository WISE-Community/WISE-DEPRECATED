define(['configService', 'studentDataService'], function(configService, studentDataService) {
    
    var service = ['$http', '$q', 'ConfigService', 'StudentDataService',
                   function($http, $q, ConfigService, StudentDataService) {
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
        
        /**
         * Replace relative asset paths with absolute paths
         * e.g.
         * assets/myimage.jpg
         * will be replaced with
         * http://wise.berkeley.edu/curriculum/123456/assets/myimage.jpg
         * @param content a string or JSON object
         * @return the same type of object that was passed in as the content
         * but with relative asset paths replaced with absolute paths
         */
        serviceObject.injectAssetPaths = function(content) {
            
            if (content != null) {
                
                if (typeof content === 'object') {
                    
                    var contentString = JSON.stringify(content);
                    
                    if (contentString != null) {
                        
                        // replace the relative asset paths with the absolute paths
                        contentString = this.replaceAssetPaths(contentString);
                        
                        content = JSON.parse(contentString);
                    }
                } else if (typeof content === 'string') {
                    
                    // replace the relative asset paths with the absolute paths
                    content = this.replaceAssetPaths(content);
                }
            }
            
            return content;
        };
        
        /**
         * Replace the relative asset paths with absolute paths
         * @param contentString the content string
         * @return the content string with relative asset paths replaced
         * with absolute asset paths
         */
        serviceObject.replaceAssetPaths = function(contentString) {
            
            if (contentString != null) {
                
                // get the content base url e.g. http://wise.berkeley.edu/curriculum/123456
                var contentBaseUrl = ConfigService.getConfigParam('projectBaseURL');
                
                // replace instances of 'assets/myimage.jpg' with 'http://wise.berkeley.edu/curriculum/123456/assets/myimage.jpg'
                contentString = contentString.replace(new RegExp('\'(\\.)*(/)*assets', 'g'), '\''+contentBaseUrl + 'assets');
                
                // replace instances of "assets/myimage.jpg" with "http://wise.berkeley.edu/curriculum/123456/assets/myimage.jpg"
                contentString = contentString.replace(new RegExp('\"(\\.)*(/)*assets', 'g'), '\"'+contentBaseUrl + 'assets');
                
            }
            
            return contentString
        };
        
        serviceObject.injectNodeLinks = function(content) {
            if (content != null) {
                /*
                if (text.indexOf("{{studentFirstNames}}") >= 0) {
                    var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
                    var studentFirstNamesArray = this.getUserAndClassInfo().getStudentFirstNamesByWorkgroupId(workgroupId);
                    var studentFirstNames = studentFirstNamesArray.join(' & ');
                    text = text.replace(/{{studentFirstNames}}/g, studentFirstNames);
                }
                */
                
                if (typeof content === 'object') {
                    var contentString = JSON.stringify(content);
                    //contentString = this.replaceWithLink(contentString);
                    if (contentString != null && contentString.indexOf("{{link") >= 0) {
                        contentString = contentString.replace(/{{link\|([^}}]*)\|([^}}]*)}}/g, "<a ng-click=\'nodeController.buttonClicked(\\\"$1\\\")\'>$2</a>");
                    }
                    
                    content = JSON.parse(contentString);
                } else if (typeof content === 'string') {
                    //content = this.replaceWithLink(content);
                    
                    if (content != null && content.indexOf("{{link") >= 0) {
                        content = content.replace(/{{link\|([^}}]*)\|([^}}]*)}}/g, "<a ng-click=\'nodeController.buttonClicked(\"$1\")\'>$2</a>");
                    }
                }
            }
            return content;
        };
        
        serviceObject.injectStudentData = function(content) {
            if (content != null) {
                var regex = /{{work\|([^}}]*)}}/g;
                
                if (typeof content === 'object') {
                    var contentString = JSON.stringify(content);
                    var matchResult = contentString.match(regex);
                    
                    var nodeId = RegExp.$1;
                    
                    if (nodeId === '1.1') {
                        nodeId = 'node1';
                    }
                    
                    var studentWork = StudentDataService.getLatestStudentWorkForNodeAsHTML(nodeId);
                    
                    if (studentWork != null) {
                        contentString = contentString.replace(regex, studentWork);
                    } else {
                        contentString = contentString.replace(regex, '');
                    }
                    
                    content = JSON.parse(contentString);
                } else if (typeof content === 'string') {
                    
                    if (content != null && content.indexOf("{{work") >= 0) {
                        var matchResult = content.match(regex);
                        
                        var nodeId = RegExp.$1;
                        
                        if (nodeId === '1.1') {
                            nodeId = 'node1';
                        }
                        
                        var studentWork = StudentDataService.getLatestStudentWorkForNodeAsHTML(nodeId);
                        
                        if (studentWork != null) {
                            content = content.replace(regex, studentWork);
                        } else {
                            content = content.replace(regex, '');
                        }
                    }
                }
            }
            return content;
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
                        
                        var isSubmit = componentState.isSubmit;
                        
                        // check if the isSubmit flag is true
                        if (isSubmit) {
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