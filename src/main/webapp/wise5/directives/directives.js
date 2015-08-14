define(['angular', 'projectService', 'currentNodeService'], function(angular, projectService, currentNodeService) {
    
    angular.module('directives', [])
    
    .filter('appropriateSizeText', function() {
        /**
         * Given a string of a number of bytes, returns a string of the size
         * in either: bytes, kilobytes or megabytes depending on the size.
         */
        return function(bytes) {
            /**
             * Returns the given number @param num to the nearest
             * given decimal place @param decimal. (e.g if called 
             * roundToDecimal(4.556, 1) it will return 4.6.
             */
            var roundToDecimal = function(num, decimal) {
                var rounder = 1;
                if (decimal) {
                    rounder = Math.pow(10, decimal);
                };

                return Math.round(num*rounder) / rounder;
            };
            
            if (bytes > 1048576) {
                return roundToDecimal(((bytes/1024) / 1024), 1) + ' mb';
            } else if (bytes > 1024) {
                return roundToDecimal((bytes/1024), 1) + ' kb';
            } else {
                return bytes + ' b';
            };
        };        
    })
    
    /**
     * Returns the given number @param num to the nearest
     * given decimal place @param decimal. (e.g if called 
     * roundToDecimal(4.556, 1) it will return 4.6.
     */
    .filter('roundToDecimal', function() {
        
        return function(num, decimal) {
            var rounder = 1;
            if (decimal) {
                rounder = Math.pow(10, decimal);
            };

            return Math.round(num*rounder) / rounder;
        };
    })
    
    .directive('compile', function($compile) {
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
    })

    .directive('group', function(CurrentNodeService, ProjectService, StudentDataService) {
        return {
            restrict: 'E',
            scope: {
                currentgroupid: '@'
            },
            link: function($scope, element, attrs) {
                
                $scope.$watch('currentgroupid', function(newValue, oldValue) {

                    var width = 1200,
                    height = 480;
                    
                    var nodes = [];
                    var links = [];
                    
                    var groupId = attrs.currentgroupid;
                    var group = ProjectService.getNodeById(groupId);
                    
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
                    
                    var parentGroup = ProjectService.getParentGroup(groupId);
                    var parentGroupId = null;
                    
                    if (parentGroup != null) {
                        parentGroupId = parentGroup.id;
                    }
                    
                    if (parentGroupId != null) {
                        var goToParentNode = {};
                        goToParentNode.id = parentGroupId;
                        goToParentNode.x = 20;
                        goToParentNode.y = 20;
                        goToParentNode.r = 20;
                        goToParentNode.title = 'Parent';
                        
                        nodes.push(goToParentNode);
                    }
                    
                    d3.select("svg").remove();
                    
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

                        if (StudentDataService.canVisitNode(nodeId)) {
                            CurrentNodeService.setCurrentNodeByNodeId(nodeId);
                        } else {
                            alert('You are not allowed to visit this step right now.');
                        }
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
                });
            }
        };
    })
    
    .directive('componentstatehtml', function($injector) {
        return {
            restrict: 'E',
            link: function($scope, element, attrs) {
                
                var componentState = JSON.parse(attrs.componentstate);
                var componentType = componentState.componentType;
                
                if (componentType != null) {
                    var childService = $injector.get(componentType + 'Service');
                    
                    if (childService != null) {
                        var studentWorkHTML = childService.getStudentWorkAsHTML(componentState);
                        
                        if (studentWorkHTML != null) {
                            element[0].innerHTML = studentWorkHTML;
                        }
                    }
                }
            }
        };
    })

});