define(['angular', 'configService'], function(angular, configService) {

    angular.module('NodeService', [])
    
    .service('NodeService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
        
        this.getNodeContentByNodeSrc = function(nodeSrc) {
            return $q(function(resolve, reject) {
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
                    console.log('nodeContent=' + nodeContent);
                    this.nodeContent = nodeContent;
                    resolve(nodeContent);
                }));
            })
        };
        
        this.getNodeContentByNodeSrc0 = function(nodeSrc) {
            return ['$q', function($q) {
                var deferred = $q.defer();
                
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
                    this.nodeContent = nodeContent;
                    //return nodeContent;
                    
                    deferred.resolve(nodeContent);
                }));
                /*
                require([controllerName], function() {
                    deferred.resolve();
                });
                */
                return deferred.promise;
            }];
        };
        
        this.getNodeContentByNodeSrc1 = function(nodeSrc) {
            return $http.get(nodeSrc).then(angular.bind(this, function(result) {
                var nodeContent = result.data;
                this.nodeContent = nodeContent;
                return nodeContent;
            }));
        };
        
        this.retrieveNode = function() {
            var projectFileUrl = ConfigService.getConfigParam('getContentUrl');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.project = projectJSON;
                return projectJSON;
            }));
        };
        
        this.getNodeTitleFromNodeId = function(nodeId) {
            var title = null;
            
            //see if the node id is for a step and get the title if it is
            title = this.getStepTitleFromNodeId(nodeId);
            
            if(title === null) {
                /*
                 * we couldn't find a step with the node id so we will now
                 * search the sequences
                 */
                title = this.getSequenceTitleFromNodeId(nodeId);
            }
            
            return title;
        };
    }]);
    
});