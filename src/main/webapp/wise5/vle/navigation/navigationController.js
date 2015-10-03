define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController',
        function ($rootScope,
                  $scope,
                  $state,
                  $stateParams,
                  ConfigService,
                  ProjectService,
                  StudentDataService) {

            this.currentGroup = null;
            this.currentGroupId = null;
            this.currentChildren = [];
            this.currentParentGroups = [];
            this.groups = ProjectService.getGroups();
            this.currentNode = StudentDataService.getCurrentNode();
            this.layoutState = null;
            this.nodeStatuses = StudentDataService.nodeStatuses;
            this.currentGroupStatus = {};

            this.nodeClicked = function (nodeId, ev) {
                StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
            };

            this.updateNavigation = function () {
                var currentNode = StudentDataService.getCurrentNode();

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

            this.filterByName = function (filter) {
                return true; // TODO: create filter
            };

            this.getCurrentParentGroups = function (node) {
                var parents = [];
                if (this.layoutState !== 'root') {
                    parents.push(node);
                }

                var getParent = function (id) {
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

            this.getNodePositionById = function(id) {
                return ProjectService.getNodePositionById(id);
            };

            var scope = this;
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                var toNodeId = toParams.nodeId;
                var fromNodeId = fromParams.nodeId;
                if (!!toNodeId && !!fromNodeId && toNodeId !== fromNodeId) {
                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
                }
            });
        })
});