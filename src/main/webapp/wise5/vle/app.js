define([
        'angular',
        'd3',
        'jquery',
        'jqueryUI',
        'angularAnimate',
        'angularDragDrop',
        'angularFileUpload',
        'angularSortable',
        'angularUIRouter',
        'angularWebSocket',
        'configService',
        'multipleChoiceService',
        'nodeService',
        'openResponseService',
        'portfolioService',
        'projectService',
        'sessionService',
        'studentAssetService',
        'studentDataService',
        'studentStatusService',
        'studentWebSocketService'
        ], function(
                angular,
                d3,
                $,
                jqueryUI,
                angularAnimate,
                angularDragDrop,
                angularFileUpload,
                angularSortable,
                angularUIRouter,
                angularWebSocket,
                configService,
                multipleChoiceService,
                nodeService,
                openResponseService,
                portfolioService,
                projectService,
                sessionService,
                studentAssetService,
                studentDataService,
                studentStatusService,
                studentWebSocketService
                ) {

    var app = angular.module('app', [
                                     'angularFileUpload',
                                     'ui.router',
                                     'ui.sortable',
                                     'ngAnimate',
                                     'ngDragDrop',
                                     'ngWebSocket'
                                     ]);
    
    // core services
    app.factory('ConfigService', configService);
    app.factory('NodeService', nodeService);
    app.factory('PortfolioService', portfolioService);
    app.factory('ProjectService', projectService);
    app.factory('SessionService', sessionService);
    app.factory('StudentAssetService', studentAssetService);
    app.factory('StudentDataService', studentDataService);
    app.factory('StudentStatusService', studentStatusService);
    app.factory('StudentWebSocketService', studentWebSocketService);
    
    // node services
    app.factory('OpenResponseService', openResponseService);
    app.factory('MultipleChoiceService', multipleChoiceService);
    
    app.directive('compile', function($compile) {
        return function(scope, ele, attrs) {
            scope.$watch(
                    function(scope) {
                        return scope.$eval(attrs.compile);
                    },
                    function(value) {
                        ele.html(value);
                        $compile(ele.contents())(scope);
                    }
            );
        };
    });
    
    /**
     * Directive for making an element into a jquery dialog
     */
    app.directive('jqueryDialog', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                
                var options = {};
                
                if (attrs != null) {
                    // try to get the jquery dialog options if any
                    jqueryDialogOptions = attrs.jqueryDialogOptions;
                    
                    if (jqueryDialogOptions != null) {
                        // create the options object
                        options = $scope.$eval(jqueryDialogOptions);
                        
                        if (options != null && options.hideTitlebarClose) {
                            options.open = function(event, ui) {
                                // hide the close button
                                $(this).parent().find(".ui-dialog-titlebar-close").hide();
                            };
                        }
                    }
                }
                
                // create the dialog
                element.dialog(options)
            }
        }
    });
    
    app.directive('group', function() {
        return {
            restrict: 'E',
            link: function($scope, element, attrs) {
                
                var width = 1000,
                height = 480;
                
                var nodes = [];
                var links = [];
                
                var group = $scope.navigationController.currentGroup;
                
                if (group != null) {
                    var groupId = group.id;
                    var childIds = group.ids;
                    
                    if (childIds != null) {
                        for (var c = 0; c < childIds.length; c++) {
                            var childId = childIds[c];
                            
                            var node = ProjectService.getNodeById(childId);
                            
                            if (node != null) {
                                nodes.push(node);
                            }
                        }
                    }
                    
                    var transitions = ProjectService.getTransitionsByGroupId(groupId);
                    
                    if (transitions != null) {
                        for (var t = 0; t < transitions.length; t++) {
                            var transition = transitions[t];
                            
                            if (transition != null) {
                                var from = transition.from;
                                var to = transition.to;
                                
                                var fromNode = ProjectService.getNodeById(from);
                                var toNode = ProjectService.getNodeById(to);
                                
                                if (nodes.indexOf(fromNode) != -1 && nodes.indexOf(toNode) != -1) {
                                    var link = {};
                                    link.source = fromNode;
                                    link.target = toNode;
                                    
                                    links.push(link);
                                }
                            }
                        }
                    }
                }
                
                var parentGroupId = $scope.navigationController.parentGroupId;
                
                if (parentGroupId != null) {
                    var goToParentNode = {};
                    goToParentNode.id = parentGroupId;
                    goToParentNode.cx = 20;
                    goToParentNode.cy = 20;
                    goToParentNode.r = 20;
                    
                    nodes.push(goToParentNode);
                }
                
                
                var svg = d3.select(element[0]).append('svg')
                .attr('width', width)
                .attr('height', height);
                
                var force = d3.layout.force()
                .size([width, height])
                .nodes(nodes)
                .links(links);
                
                force.linkDistance(width/2);
                
                var link = svg.selectAll('.link')
                .data(links)
                .enter().append('line')
                .attr('class', 'link')
                .attr('x1', function(d) { return d.source.cx; })
                .attr('y1', function(d) { return d.source.cy; })
                .attr('x2', function(d) { return d.target.cx; })
                .attr('y2', function(d) { return d.target.cy; })
                .on('click', function(d) {
                    console.log('nodeId=' + d.id);
                });

                var node = svg.selectAll('.node')
                .data(nodes)
                .enter().append('g')
                .append('circle')
                .attr('class', 'node')
                .attr('r', function(d) { return d.r; })
                .attr('cx', function(d) { return d.cx; })
                .attr('cy', function(d) { return d.cy; })
                .on('click', angular.bind(this, function(d) {
                    var nodeId = d.id;
                    
                    StudentDataService.setCurrentNodeByNodeId(nodeId);
                }));
                
                node = svg.selectAll('.node')
                .data(nodes)
                .append('text')
                .attr('dx', 12)
                .attr('dy', '.35em')
                .text(function(d) {
                    var title = d.title;
                    console.log('title=' + title);
                    return title;
                });
                
                force.start();
            }
            
        };
    });
    
    app.filter('sanitizeHTML', ['$sce', function($sce) {
        return function(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }]);
    
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
        
        $urlRouterProvider.otherwise('/vle/');
        
        app.$controllerProvider = $controllerProvider;
        
        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                templateUrl: 'wise5/vle/vle.html',
                resolve: {
                    vleController: app.loadController('vleController'),
                    portfolioController: app.loadController('portfolioController'),
                    config: function(ConfigService) {
                        var configUrl = window.configUrl;
                        
                        return ConfigService.retrieveConfig(configUrl);
                    },
                    project: function(ProjectService, config) {
                        return ProjectService.retrieveProject();
                    },
                    sessionTimers: function(SessionService, config) {
                        return SessionService.initializeSession();
                    },
                    studentData: function(StudentDataService, config, project) {
                        return StudentDataService.retrieveStudentData();
                    },
                    webSocket: function(StudentWebSocketService, config) {
                        return StudentWebSocketService.initialize();
                    }
                }              
            })
            .state('root.vle', {
                url: '/vle/:nodeId',
                views: {
                    'navigationView': {
                        templateUrl: 'wise5/vle/navigation/navigation.html',
                        resolve: {
                            navigationController: app.loadController('navigationController')
                        }
                    },
                    'nodeView': {
                        templateUrl: 'wise5/vle/node/node.html',
                        resolve: {
                            nodeController: app.loadController('nodeController'),
                            openResponseController: app.loadController('openResponseController'),
                            multipleChoiceController: app.loadController('multipleChoiceController'),
                            htmlController: app.loadController('htmlController'),
                            planningController: app.loadController('planningController')
                        }
                    }
                }
            });
            
    }]);
    
    return app;
});