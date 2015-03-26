console.log('TestController');
define(['angular', 'TestService'], function(angular, TestService) {
    console.log('TestController2');
    var app = angular.module('app');

    app.$controllerProvider.register('TestController', ['$scope', 'TestService', function($scope, TestService) {
        this.message = 'hello';
        console.log('name=' + TestService.name);
    }]);
});