define([
    'angular',
    'jquery',
    'angularUIRouter',
    'angularPostMessage',
    'configService',
    'projectService',
    'nodeApplicationService',
    'nodeService',
    'studentDataService'
    ], function(angular, $) {

    var app = angular.module('app', [
                                     'ui.router',
                                     'ngPostMessage',
                                     'ConfigService',
                                     'ProjectService',
                                     'NodeApplicationService',
                                     'NodeService',
                                     'StudentDataService'
                                     ]);
    
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
    
    app.config(['$urlRouterProvider', '$stateProvider', '$controllerProvider', 
                function($urlRouterProvider, $stateProvider, $controllerProvider) {
        
        $urlRouterProvider.otherwise('/project/normal');
        
        app.$controllerProvider = $controllerProvider;
        
        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                templateUrl: 'vle5/teacher/authoringTool/root.html',
                controller: 'RootController',
                controllerAs: 'rootController',
                resolve: {
                    loadController: app.loadController('rootController'),
                    config: function(ConfigService) {
                        var configUrl = window.configUrl;
                        return ConfigService.retrieveConfig(configUrl);
                    },
                    project: function(ProjectService, config) {
                        return ProjectService.retrieveProject();
                    },
                    nodeApplication: function(NodeApplicationService, config) {
                        return NodeApplicationService.intializeNodeApplications();
                    },
                    studentData: function(StudentDataService, config) {
                        return StudentDataService.retrieveStudentData();
                    }
                }
            })
            .state('root.project', {
                url: '/project',
                templateUrl: 'vle5/teacher/authoringTool/project/project.html',
                controller: 'ProjectController',
                controllerAs: 'projectController',
                resolve: {
                    loadController: app.loadController('projectController')
                }
            })
            .state('root.project.normal', {
                url: '/normal',
                templateUrl: 'vle5/teacher/authoringTool/project/projectNormal.html',
                controller: 'ProjectNormalController',
                controllerAs: 'projectNormalController',
                resolve: {
                    loadController: app.loadController('projectNormalController')
                }
            })
            .state('root.project.advanced', {
                url: '/advanced',
                templateUrl: 'vle5/teacher/authoringTool/project/projectAdvanced.html',
                controller: 'ProjectAdvancedController',
                controllerAs: 'projectAdvancedController',
                resolve: {
                    loadController: app.loadController('projectAdvancedController')
                }
            })
            .state('root.node', {
                url: '/node',
                params: {nodeId: null},
                templateUrl: 'vle5/teacher/authoringTool/node/node.html',
                controller: 'NodeController',
                controllerAs: 'nodeController',
                resolve: {
                    loadController: app.loadController('nodeController')
                }
            })
            .state('root.node.normal', {
                url: '/normal/:nodeId',
                templateUrl: 'vle5/teacher/authoringTool/node/nodeNormal.html',
                controller: 'NodeNormalController',
                controllerAs: 'nodeNormalController',
                resolve: {
                    loadController: app.loadController('nodeNormalController')
                }
            })
            .state('root.node.advanced', {
                url: '/advanced/:nodeId',
                templateUrl: 'vle5/teacher/authoringTool/node/nodeAdvanced.html',
                controller: 'NodeAdvancedController',
                controllerAs: 'nodeAdvancedController',
                resolve: {
                    loadController: app.loadController('nodeAdvancedController')
                }
            })
            .state('root.node.preview', {
                url: '/preview/:nodeId',
                templateUrl: 'vle5/teacher/authoringTool/node/nodePreview.html',
                controller: 'NodePreviewController',
                controllerAs: 'nodePreviewController',
                resolve: {
                    loadController: app.loadController('nodePreviewController')
                }
            })
    }]);
    
    return app;
});