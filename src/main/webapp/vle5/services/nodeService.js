define(['angular', 'configService'], function(angular, configService) {

    angular.module('NodeService', [])
    
    .service('NodeService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
        
        this.getNodeContentByNodeSrc = function(nodeSrc) {
            return $q(angular.bind(this, function(resolve, reject) {
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
                    nodeContent = this.injectNodeLinks(nodeContent);
                    resolve(nodeContent);
                }));
            }));
        };
        
        this.retrieveNode = function() {
            var projectFileUrl = ConfigService.getConfigParam('projectURL');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.project = projectJSON;
                return projectJSON;
            }));
        };
        
        this.injectNodeLinks = function(content) {
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
                        contentString = contentString.replace(/{{link\|([^}}]*)\|([^}}]*)}}/g, "<a ng-click=\'nodeController.buttonClicked(\\\"$1\\\")\'>$2</a>")
                    }
                    
                    content = JSON.parse(contentString);
                } else if (typeof content === 'string') {
                    //content = this.replaceWithLink(content);
                    
                    if (content != null && content.indexOf("{{link") >= 0) {
                        content = content.replace(/{{link\|([^}}]*)\|([^}}]*)}}/g, "<a ng-click=\'nodeController.buttonClicked(\"$1\")\'>$2</a>")
                    }
                }
            }
            return content;
        };
        
        this.replaceWithLink = function(text) {
            if (text != null && text.indexOf("{{link") >= 0) {
                text = text.replace(/{{link\|([^}}]*)\|([^}}]*)}}/g, "<a ng-click=\'nodeController.buttonClicked(\\\"$1\\\")\'>$2</a>")
            }
            
            return text;
        };
    }]);
    
});