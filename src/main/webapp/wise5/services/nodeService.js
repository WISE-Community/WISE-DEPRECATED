define(['configService'], function(configService) {
    
    var service = ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
        var serviceObject = {};
        
        serviceObject.getNodeContentByNodeSrc = function(nodeSrc) {
            return $q(angular.bind(this, function(resolve, reject) {
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
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
        
        serviceObject.isWorkSubmitted = function(nodeVisits) {
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
        
        return serviceObject;
    }];
    
    return service;
});