console.log('TestService');
define(['angular'], function(angular) {
    console.log('TestService2');
    var app = angular.module('app');

    var service = function() {
        var serviceObject = {};
        
        serviceObject.name = 'TestTestTest';
        
        return serviceObject;
    };
    
    app.factory('TestService', service);
    
    //return service;
});