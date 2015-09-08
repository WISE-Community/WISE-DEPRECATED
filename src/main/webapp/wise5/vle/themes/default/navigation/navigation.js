define(['angular', /*'annotationService',*/ 'configService', 'currentNodeService', 'projectService',
        'studentDataService'],
    function(angular, /*AnnotationService,*/ ConfigService, CurrentNodeService, ProjectService, StudentDataService) {

        angular.module('navigation', [])
            .directive('navItem', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
                        nodeClicked: '&',
                        type: '='
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: function($scope,
                                         $state,
                                         $stateParams,
                                         ConfigService,
                                         ProjectService,
                                         StudentDataService) {

                        $scope.getTemplateUrl = function(){
                            return $scope.templateUrl;
                        };

                        $scope.isGroup = ProjectService.isGroupNode($scope.item.id);

                        $scope.nodeStatus = StudentDataService.nodeStatuses[$scope.item.id];
                    }
                };
            })
            .directive('groupInfo', function() {
                return {
                    scope: {
                        templateUrl: '=',
                        item: '=',
                        close: '&'
                    },
                    template: '<ng-include src="getTemplateUrl()"></ng-include>',
                    controller: function($scope,
                                         $state,
                                         $stateParams,
                                         ConfigService,
                                         ProjectService,
                                         StudentDataService) {

                        $scope.getTemplateUrl = function(){
                            return $scope.templateUrl;
                        };

                        $scope.nodeStatus = StudentDataService.nodeStatuses[$scope.item.id];
                    }
                };
            })
            .controller('NavigationController',
                function($scope,
                         $state,
                         $stateParams,
                         ConfigService,
                         CurrentNodeService,
                         ProjectService,
                         StudentDataService,
                         $mdDialog) {

                    this.currentGroup = null;
                    this.currentChildren = [];
                    this.currentParentGroups = [];
                    this.groups = ProjectService.getGroups();
                    this.currentNode = CurrentNodeService.getCurrentNode();
                    this.layoutState = null;
                    this.layoutView = 'card'; // TODO: set this dynamically from theme settings ('card' or 'list'); do we want a list view at all?
                    this.nodeStatuses = StudentDataService.nodeStatuses;
                    this.currentGroupStatus = {};

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
                        }

                    }));

                    $scope.$on('nodeStatusesChanged', angular.bind(this, function() {

                    }));

                    $scope.$on('groupsChanged', angular.bind(this, function() {

                    }));

                    this.nodeClicked = function(nodeId, ev) {
                        // check if the node is visitable
                        if (this.nodeStatuses[nodeId].isVisitable) {
                            // the node is visitable
                            CurrentNodeService.setCurrentNodeByNodeId(nodeId);
                        } else {
                            // the node is not visitable
                            // TODO: customize alert with constraint details, correct node term
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .title('Item Locked')
                                    .content('Sorry, you cannot view this item.')
                                    .ariaLabel('Item Locked')
                                    .clickOutsideToClose(true)
                                    .ok('OK')
                                    .targetEvent(ev)
                            );
                        }
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
                            this.currentGroupStatus = this.nodeStatuses[this.currentGroupId];

                            var childIds = ProjectService.getChildNodeIdsById(this.currentGroupId);
                            this.currentChildren = [];
                            if (childIds != null) {
                                for (var c = 0; c < childIds.length; c++) {
                                    var childId = childIds[c];

                                    var node = ProjectService.getNodeById(childId);
                                    this.currentChildren.push(node);
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
            });
        });
