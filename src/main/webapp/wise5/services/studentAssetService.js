define(['configService'], function(configService) {

    var service = ['$http', '$q', '$rootScope', 'ConfigService', 
                                    function($http, $q, $rootScope, ConfigService) {
        var serviceObject = {};
        
        serviceObject.getStudentAssets = function() {
            var config = {};
            config.method = 'GET';
            config.url = ConfigService.getStudentAssetManagerURL();
            config.params = {};
            config.params.command = 'assetList';
            $http(config).then(function(data) {
                return data;  
            });
        };
        
        serviceObject.uploadStudentAsset = function() {
            var config = {};
            config.method = 'POST';
            config.url = ConfigService.getStudentAssetManagerURL();
            config.params = {};
            config.params.command = 'uploadAssets';
            config.params.transformRequest = angular.identity;
            config.params.headers = { 'Content-Type': undefined };
            
            $http(config).then(function(data) {
                return data;
            });
        };
        
        return serviceObject;
    }];
    
    return service;
});