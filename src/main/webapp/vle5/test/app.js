define(['angular', 'angularUIRouter'], function(angular, angularUIRouter) {
    var app = angular.module('app', ['ui.router']);
    
    app.init = function() {
        angular.bootstrap(document, ['app']);
    };
    
    app.loadController = function(controllerName) {
        return ['$q', function($q) {
            var deferred = $q.defer();
            require([controllerName], function() {
                deferred.resolve();
            });
            return deferred.promise;
        }];
    };
    
    app.config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', function($urlRouterProvider, $stateProvider, $controllerProvider) {
        $urlRouterProvider.otherwise('/vle');
        
        app.$controllerProvider = $controllerProvider;
        
        $stateProvider
            .state('vle', {
                url: '/vle',
                templateUrl: './view1.html',
                controller: 'TestController',
                controllerAs: 'testController',
                resolve: {
                    loadTestController: app.loadController('testController')
                }
            });
    }]);
    
    return app;
});