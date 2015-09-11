define(['app'], function(app) {
    app.$controllerProvider.register('NavigationController',
        function ($scope,
                  $state,
                  $stateParams,
                  ConfigService,
                  CurrentNodeService,
                  ProjectService,
                  StudentDataService) {

            this.currentGroup = null;
            this.currentGroupId = null;
            this.currentChildren = [];
            this.currentParentGroups = [];
            this.groups = ProjectService.getGroups();
            this.currentNode = CurrentNodeService.getCurrentNode();
            this.layoutState = null;
            this.nodeStatuses = StudentDataService.nodeStatuses;
            this.currentGroupStatus = {};

            this.nodeClicked = function (nodeId, ev) {
                // check if the node is visitable
                if (this.nodeStatuses[nodeId].isVisitable) {
                    // the node is visitable
                    CurrentNodeService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
                } else {
                    // the node is not visitable
                    CurrentNodeService.nodeClickLocked(nodeId);
                }
            };


            this.updateNavigation = function () {
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
        })
});