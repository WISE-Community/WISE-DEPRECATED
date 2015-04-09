console.log('TestService');

/*
define(['app'], function(app) {
    console.log('before factory');
    return app.factory('TestService', function() {
        var serviceObject = {};
        
        serviceObject.name = 'TestTestTest';
        
        return serviceObject;
    });
    console.log('after factory');
    //return service;
});
*/

define(['app'], function(app) {
    console.log('ParentService2');
    //var app = angular.module('app');

    var service = function() {
        var serviceObject = {};
        
        serviceObject.number = 0;
        serviceObject.name = 'Parent';
        serviceObject.job = 'Space Invader';
        serviceObject.setNumber = function(number) {
            serviceObject.number = number;
        };
        
        return serviceObject;
    };
    
    //app.factory('TestService', service);
    
    return app.$provide.service('ParentService', service);
    
    //return service;
});
