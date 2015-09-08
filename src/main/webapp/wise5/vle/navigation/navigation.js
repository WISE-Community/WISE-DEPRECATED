define(['angular', /*'annotationService',*/ 'configService', 'currentNodeService', 'projectService',
        'studentDataService'],
    function(angular, /*AnnotationService,*/ ConfigService, CurrentNodeService, ProjectService, StudentDataService) {

        angular.module('navigation', [])
            .directive('navItem', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
                        nodeClicked: '&'
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: 'NavigationItemController'
                };
            })
            .controller('NavigationController',
                function($scope,
                         $state,
                         $stateParams,
                         ConfigService,
                         CurrentNodeService,
                         ProjectService,
                         StudentDataService) {

                    this.currentGroup = null;
                    this.currentChildren = [];
                    this.currentParentGroups = [];
                    this.currentGroupIcon = null;
                    this.groups = ProjectService.getGroups();
                    this.currentNode = CurrentNodeService.getCurrentNode();
                    this.layoutState = null;
                    this.layoutView = 'card'; // TODO: set this dynamically from theme settings ('card' or 'list')

                    $scope.$on('currentNodeChanged', angular.bind(this, function(event, args) {
                        var previousNode = args.previousNode;
                        var currentNode = args.currentNode;
                        if (previousNode != null && previousNode.type === 'group') {
                            var nodeId = previousNode.id;
                            //StudentDataService.endNodeVisitByNodeId(nodeId);
                        }

                        if (currentNode != null && currentNode.type === 'group') {
                            var nodeId = currentNode.id;
                            //var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
                            if(this.currentGroupId !== nodeId){
                                this.updateNavigation();
                            }

                            // TODO: also update navigation if currentNode is a step that is in a different group from this.currentGroup
                        }

                    }));

                    $scope.$on('nodeStatusesChanged', angular.bind(this, function() {

                    }));

                    $scope.$on('groupsChanged', angular.bind(this, function() {

                    }));

                    this.nodeClicked = function(nodeId) {
                        // check if the node is visitable
                        if (this.isVisitable(nodeId)) {
                            // the node is visitable
                            CurrentNodeService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
                        } else {
                            // the node is not visitable
                            alert('You are not allowed to visit this step right now.');
                        }
                    };

                    this.isVisitable = function(nodeId) {
                        var result = false;

                        var nodeStatus = StudentDataService.getNodeStatusByNodeId(nodeId);

                        if (nodeStatus != null) {
                            if (nodeStatus.isVisitable != null) {
                                result = nodeStatus.isVisitable;
                            }
                        }

                        return result;
                    };

                    this.isVisible = function(nodeId) {
                        var result = false;

                        var nodeStatus = StudentDataService.getNodeStatusByNodeId(nodeId);

                        if (nodeStatus != null) {
                            if (nodeStatus.isVisible != null) {
                                result = nodeStatus.isVisible;
                            }
                        }

                        return result;
                    };


                    this.updateNavigation = function() {
                        var currentNode = CurrentNodeService.getCurrentNode();

                        if (currentNode != null) {
                            var currentNodeId = currentNode.id;
                            var currentGroup = null;

                            if (ProjectService.isGroupNode(currentNodeId)) {
                                // current node is a group node
                                currentGroup = currentNode;
                            } else {
                                // current node is an application node, so get parent group node
                                currentGroup = ProjectService.getParentGroup(currentNodeId);
                            }

                            if (currentGroup != null) {
                                this.currentGroupId = currentGroup.id;
                                var parentGroup = ProjectService.getParentGroup(this.currentGroupId);

                                if (parentGroup != null) {
                                    this.parentGroupId = parentGroup.id;
                                    this.layoutState = 'group';
                                } else {
                                    this.layoutState = 'root';
                                }
                            }

                            this.currentGroup = currentGroup;
                            this.currentGroupIcon = ProjectService.getNodeIconByNodeId(this.currentGroupId);
                            //this.currentGroupId = this.currentGroup.id;

                            var childIds = this.currentGroup.ids;
                            this.currentChildren = [];
                            if (childIds != null) {
                                for (var c = 0; c < childIds.length; c++) {
                                    var childId = childIds[c];

                                    var node = ProjectService.getNodeById(childId);
                                    this.currentChildren.push(node); // TODO: figure out how to order based on transitions?
                                }
                            }

                            this.currentParentGroups = [];
                            this.currentParentGroups = this.getCurrentParentGroups(this.currentGroup);
                        }
                    };

                    this.filterByName = function(filter){
                        return true; // TODO: create filter
                    };

                    this.getCurrentParentGroups = function(node){
                        var parents = [];
                        if(this.layoutState !== 'root'){
                            parents.push(node);
                        }

                        var getParent = function(id){
                            var parentGroup = ProjectService.getParentGroup(id);
                            if (parentGroup != null) {
                                parents.push(parentGroup);
                                getParent(parentGroup.id)
                            }
                        };

                        getParent(node.id);

                        // reverse array order to top->bottom
                        //parents.pop();
                        return parents.reverse();
                    };

                    this.updateNavigation();
            })
            .controller('NavigationItemController',
                function($scope,
                         $state,
                         $stateParams,
                         ConfigService,
                         ProjectService,
                         StudentDataService) {

                    $scope.getTemplateUrl = function(){
                        return $scope.templateUrl;
                    };

                    $scope.isGroup = ProjectService.isGroupNode($scope.item.id);

                    $scope.icon = ProjectService.getNodeIconByNodeId($scope.item.id);
            });
        });
