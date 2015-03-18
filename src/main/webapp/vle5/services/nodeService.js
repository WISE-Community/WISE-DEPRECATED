define(['angular', 'configService'], function(angular, configService) {

    angular.module('NodeService', [])
    
    .service('NodeService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
        
        this.getNodeContentByNodeSrc = function(nodeSrc) {
            return $q(function(resolve, reject) {
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
                    this.nodeContent = nodeContent;
                    resolve(nodeContent);
                }));
            });
        };
        
        this.getNodeContentByNodeSrc0 = function(nodeSrc) {
            return ['$q', function($q) {
                var deferred = $q.defer();
                
                $http.get(nodeSrc).then(angular.bind(this, function(result) {
                    var nodeContent = result.data;
                    this.nodeContent = nodeContent;
                    deferred.resolve(nodeContent);
                }));
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
            var projectFileUrl = ConfigService.getConfigParam('projectURL');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.project = projectJSON;
                return projectJSON;
            }));
        };
    }]);
    
});