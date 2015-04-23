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
                                var dNode = {};
                                dNode.x = node.x;
                                dNode.y = node.y;
                                dNode.r = node.r;
                                dNode.id = node.id;
                                dNode.title = node.title;
                                nodes.push(dNode);
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
                                
                                var fromExists = false;
                                var toExists = false;
                                
                                for (var n = 0; n < nodes.length; n++) {
                                    var tempNode = nodes[n];
                                    
                                    if (tempNode != null) {
                                        var tempNodeId = tempNode.id;
                                        
                                        if (from == tempNodeId) {
                                            fromExists = true;
                                        }
                                        
                                        if (to == tempNodeId) {
                                            toExists = true;
                                        }
                                    }
                                }
                                
                                if (fromExists && toExists) {
                                    var fromNode = ProjectService.getNodeById(from);
                                    var toNode = ProjectService.getNodeById(to);
                                    
                                    var link = {};
                                    
                                    var dFromNode = {};
                                    dFromNode.x = fromNode.x;
                                    dFromNode.y = fromNode.y;
                                    dFromNode.r = fromNode.r;
                                    dFromNode.id = fromNode.id;
                                    dFromNode.title = fromNode.title;
                                    
                                    var dToNode = {};
                                    dToNode.x = toNode.x;
                                    dToNode.y = toNode.y;
                                    dToNode.r = toNode.r;
                                    dToNode.id = toNode.id;
                                    dToNode.title = toNode.title;
                                    
                                    link.source = dFromNode;
                                    link.target = dToNode;
                                    
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
                    goToParentNode.x = 20;
                    goToParentNode.y = 20;
                    goToParentNode.r = 20;
                    goToParentNode.title = 'Parent';
                    
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
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; })
                .on('click', function(d) {
                    //console.log('nodeId=' + d.id);
                });

                var gnodes = svg.selectAll('g.gnode')
                .data(nodes)
                .enter().append('g')
                .classed('gnode', true);
                
                var circles = gnodes.append('circle')
                .attr('class', 'node')
                .attr('r', function(d) { return d.r; })
                .on('click', angular.bind(this, function(d) {
                    var nodeId = d.id;
                    
                    StudentDataService.setCurrentNodeByNodeId(nodeId);
                }));
                
                var labels = gnodes.append('text')
                .text(function(d) {
                    var title = d.title;
                    return title;
                });
                
                gnodes.attr('transform', function(d) {
                    var x = d.x;
                    var y = d.y;
                    return 'translate(' + [x, y] + ')';
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