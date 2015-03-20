'use strict';

angular.module('multipleChoiceApp', [
    'ui.router'
]).

config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
    console.log('config');
    //console.log();
    
    $urlRouterProvider.otherwise('/abc');
    
    $stateProvider
        .state('abc', {
            url: '/abc',
            resolve: {

            }
        });
}]);