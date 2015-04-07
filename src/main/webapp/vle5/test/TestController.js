define(['app', 'parentService', 'childService'], function(app, ParentService, ChildService) {
    //var app = angular.module('app');
    console.log('ChildService=' + ChildService);
    
    
    var controller = function($scope, ParentService, ChildService) {
        this.message = 'hello';
        console.log('Parent.name=' + ParentService.name);
        console.log('Parent.job=' + ParentService.job);
        ParentService.setNumber(1);
        console.log('Child.name=' + ChildService.name);
        console.log('Child.job=' + ChildService.job);
        ChildService.setNumber(2);
        
        console.log('Parent.number=' + ParentService.number);
        console.log('Child.number=' + ChildService.number);
        //ChildService.hello();
    };
    
    app.$controllerProvider.register('TestController', controller);
    
    //app.controller('TestController', controller);
    
    return controller;
    
    /*
    return app.$controllerProvider.register('TestController', ['$scope', 'TestService', function($scope, TestService) {
        this.message = 'hello';
        console.log('name=' + TestService.name);
    }]);
    */
    
    
    
    
    /*
    return app.controller('TestController', ['$scope', function($scope, TestService) {
        console.log('TestController2');
            console.log('TestService2=' + testService);
        }
    ]);
    */
});