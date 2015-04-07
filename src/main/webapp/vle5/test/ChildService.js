define(['app', 'parentService'], function(app, ParentService) {
    //var app = angular.module('app');
    
    var service = function(ParentService) {
        var serviceObject = Object.create(ParentService);
        
        serviceObject.name = 'Child';
        
        return serviceObject;
    };
    
    return app.$provide.service('ChildService', service);
    //return service;
});