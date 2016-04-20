"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavItemController = function () {
    function NavItemController($rootScope, $scope, $element, NodeService, ProjectService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NavItemController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$element = $element;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.expanded = false;

        this.item = this.ProjectService.idToNode[this.nodeId];
        this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];

        this.nodeTitle = this.showPosition ? this.ProjectService.idToPosition[this.nodeId] + ': ' + this.item.title : this.item.title;
        this.currentNode = this.StudentDataService.currentNode;
        this.isCurrentNode = this.currentNode.id === this.nodeId;
        this.setNewNode = false;

        // whether this node is a planning node
        this.isPlanning = this.ProjectService.isPlanning(this.nodeId);
        this.availablePlanningNodeIds = null;
        this.parentGroupId = null;

        /*
         * whether planning mode is on or off which determines if students
         * can edit planning related aspects of the project such as adding,
         * moving, or deleting planning steps.
         */
        this.planningMode = false;

        var parentGroup = this.ProjectService.getParentGroup(this.nodeId);

        if (parentGroup != null) {
            this.parentGroupId = parentGroup.id;
            this.isParentGroupPlanning = this.ProjectService.isPlanning(this.parentGroupId);
        }

        if (this.isPlanning) {
            /*
             * planning is enabled so we will get the available planning
             * nodes that can be used in this group
             */
            this.availablePlanningNodeIds = this.ProjectService.getAvailablePlanningNodeIds(this.nodeId);
        }

        if (this.isParentGroupPlanning) {

            if (parentGroup.planningMode) {
                // the parent is currently in planning mode
                this.planningMode = true;
            }

            /*
             * planning is enabled so we will get the available planning
             * nodes that can be used in this group
             */
            this.availablePlanningNodeIds = this.ProjectService.getAvailablePlanningNodeIds(this.parentGroupId);

            /*
             * update the nodes in the select drop down used to move planning
             * nodes around
             */
            this.updateSiblingNodeIds();

            this.$scope.$watch(function () {
                // watch the position of this node
                return this.ProjectService.idToPosition[this.nodeId];
            }.bind(this), function (value) {
                // the position has changed for this node so we will update it in the UI
                this.nodeTitle = this.showPosition ? this.ProjectService.idToPosition[this.nodeId] + ': ' + this.item.title : this.item.title;

                /*
                 * update the nodes in the select drop down used to move planning
                 * nodes around
                 */
                this.updateSiblingNodeIds();
            }.bind(this));
        }

        this.$scope.$watch(function () {
            return this.StudentDataService.currentNode;
        }.bind(this), function (newNode) {
            this.currentNode = newNode;
            if (this.StudentDataService.previousStep) {
                this.$scope.$parent.isPrevStep = this.nodeId === this.StudentDataService.previousStep.id;
            }
            this.isCurrentNode = this.currentNode.id === this.nodeId;
            if (this.isCurrentNode || this.ProjectService.isApplicationNode(newNode.id) || newNode.id === this.ProjectService.rootNode.id) {
                this.setExpanded();
            }
        }.bind(this));

        this.$scope.$watch(function () {
            return this.expanded;
        }.bind(this), function (value) {
            this.$scope.$parent.itemExpanded = value;
            if (value) {
                this.zoomToElement();
            }
        }.bind(this));

        this.$rootScope.$on('planningNodeChanged', function () {
            /*
             * update the nodes in the select drop down used to move planning
             * nodes around
             */
            _this.updateSiblingNodeIds();
        });

        // a group node has turned on or off planning mode
        this.$rootScope.$on('togglePlanningModeClicked', function (event, args) {

            // get the group node that has had its planning node changed
            var planningModeClickedNodeId = args.nodeId;
            var planningMode = args.planningMode;

            // get this node's parent group
            var parentGroup = _this.ProjectService.getParentGroup(_this.nodeId);
            var parentGroupId = null;

            if (parentGroup != null) {
                parentGroupId = parentGroup.id;
            }

            if (parentGroupId == planningModeClickedNodeId) {
                // the parent of this node has changed their planning mode
                _this.planningMode = planningMode;
            }
        });

        this.setExpanded();
    }

    _createClass(NavItemController, [{
        key: 'updateSiblingNodeIds',
        value: function updateSiblingNodeIds() {
            var childNodeIds = this.ProjectService.getChildNodeIdsById(this.parentGroupId);

            this.siblingNodeIds = [];
            this.siblingNodeIds.push(this.parentGroupId);
            this.siblingNodeIds = this.siblingNodeIds.concat(childNodeIds);
        }
    }, {
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/themeComponents/navItem/navItem.html';
        }
    }, {
        key: 'setExpanded',
        value: function setExpanded() {
            this.$scope.expanded = this.isCurrentNode || this.$scope.isGroup && this.ProjectService.isNodeDescendentOfGroup(this.$scope.currentNode, this.$scope.item);
            if (this.$scope.expanded && this.isCurrentNode) {
                this.expanded = true;
                this.zoomToElement();
            }
        }
    }, {
        key: 'zoomToElement',
        value: function zoomToElement() {
            var _this2 = this;

            setTimeout(function () {
                // smooth scroll to expanded group's page location
                var location = _this2.isGroup ? _this2.$element[0].offsetTop - 32 : 0;
                var delay = _this2.isGroup ? 350 : 0;
                $('#content').animate({
                    scrollTop: location
                }, delay, 'linear', function () {
                    if (_this2.setNewNode) {
                        _this2.setNewNode = false;
                        _this2.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(_this2.nodeId);
                    }
                });
            }, 250);
        }
    }, {
        key: 'itemClicked',
        value: function itemClicked() {
            if (this.isGroup) {
                if (!this.expanded) {
                    this.setNewNode = true;
                }
                this.expanded = !this.expanded;
            } else {
                if (this.planningMode) {
                    /*
                     * students are not allowed to enter planning steps while in
                     * planning mode
                     */
                    alert('You are not allowed to enter the step while in Planning Mode. Turn off Planning Mode to enter the step.');
                } else {
                    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                }
            }
        }
    }, {
        key: 'savePlanningNodeAddedEvent',


        /**
         * Save an event when planning node is added
         * @param planningNodeAdded
         */
        value: function savePlanningNodeAddedEvent(planningNodeAdded) {
            var componentId = null;
            var componentType = null;
            var category = "Planning";
            var eventName = "planningNodeAdded";
            var eventData = {
                nodeIdAdded: planningNodeAdded.id,
                templateNodeId: planningNodeAdded.templateId
            };
            var eventNodeId = this.nodeId;
            this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
        }
    }, {
        key: 'addPlanningNodeInstanceInside',


        /**
         * Create a planning node instance and add it to the project
         * @param groupId the group the new planning node instance will be added to
         * @param templateNodeId the node id of the planning node template
         */
        value: function addPlanningNodeInstanceInside(nodeIdToInsertInside, templateNodeId) {
            // create the planning node instance
            var planningNodeInstance = this.ProjectService.createPlanningNodeInstance(nodeIdToInsertInside, templateNodeId);

            // add the planning node instance inside
            this.ProjectService.addPlanningNodeInstanceInside(nodeIdToInsertInside, planningNodeInstance);

            /*
             * update the node statuses so that a node status is created for
             * the new planning node instance
             */
            this.StudentDataService.updateNodeStatuses();

            // perform any necessary updating
            this.planningNodeChanged();

            // Save add planning node event
            this.savePlanningNodeAddedEvent(planningNodeInstance);
        }

        /**
         * Create a planning node instance and add it to the project
         * @param groupId the group the new planning node instance will be added to
         * @param nodeId the node id of the planning node template
         */

    }, {
        key: 'addPlanningNodeInstanceAfter',
        value: function addPlanningNodeInstanceAfter(nodeIdToInsertAfter, templateNodeId) {

            var parentGroup = this.ProjectService.getParentGroup(nodeIdToInsertAfter);

            if (parentGroup != null) {
                var parentGroupId = parentGroup.id;

                // create the planning node instance
                var planningNodeInstance = this.ProjectService.createPlanningNodeInstance(parentGroupId, templateNodeId);

                // insert planning node instance after
                this.ProjectService.addPlanningNodeInstanceAfter(nodeIdToInsertAfter, planningNodeInstance);

                /*
                 * update the node statuses so that a node status is created for
                 * the new planning node instance
                 */
                this.StudentDataService.updateNodeStatuses();

                // perform any necessary updating
                this.planningNodeChanged();
            }

            // Save add planning node event
            this.savePlanningNodeAddedEvent(planningNodeInstance);
        }

        /**
         * Remove the planning node instance
         * @param planningNodeInstanceNodeId the planning node instance to remove
         */

    }, {
        key: 'removePlanningNodeInstance',
        value: function removePlanningNodeInstance(planningNodeInstanceNodeId) {
            // delete the node from the project
            this.ProjectService.deleteNode(planningNodeInstanceNodeId);

            // perform any necessary updating
            this.planningNodeChanged();

            // Save remove planning node event
            var componentId = null;
            var componentType = null;
            var category = "Planning";
            var eventName = "planningNodeRemoved";
            var eventData = {
                nodeIdRemoved: planningNodeInstanceNodeId
            };
            var eventNodeId = this.nodeId;
            this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
        }

        /**
         * Get the node title
         * @param nodeId get the title for this node
         * @returns the title for the node
         */

    }, {
        key: 'getNodeTitle',
        value: function getNodeTitle(nodeId) {
            var node = this.ProjectService.idToNode[nodeId];
            var title = null;

            if (node != null) {
                title = node.title;
            }

            // get the position
            var position = this.ProjectService.idToPosition[nodeId];

            if (position == null) {
                return title;
            } else {
                return position + ': ' + title;
            }
        }

        /**
         * Get the node description
         * @param nodeId get the description for this node
         * @returns the description for the node
         */

    }, {
        key: 'getNodeDescription',
        value: function getNodeDescription(nodeId) {
            var node = this.ProjectService.idToNode[nodeId];
            var description = null;

            if (node != null) {
                description = node.description;
            }

            return description;
        }

        /**
         * Move the planning node. If the other node is a group node, we will
         * insert this node as the first node in the group. If the other node is
         * a step node, we will insert this node after the other node.
         * @param otherNodeId the other node we will move this node inside or after
         */

    }, {
        key: 'movePlanningNode',
        value: function movePlanningNode(otherNodeId) {

            /*
             * check that this node is not the same as the other node.
             * if they are the same we don't need to do anything.
             */
            if (this.nodeId != otherNodeId) {
                if (this.ProjectService.isGroupNode(otherNodeId)) {
                    // insert this node inside the group node
                    this.ProjectService.movePlanningNodeInstanceInside(this.nodeId, otherNodeId);
                } else {
                    // insert this node after the other node
                    this.ProjectService.movePlanningNodeInstanceAfter(this.nodeId, otherNodeId);
                }

                // Save move planning node event
                var componentId = null;
                var componentType = null;
                var category = "Planning";
                var eventName = "planningNodeMoved";
                var eventData = {
                    nodeIdMoved: this.nodeId,
                    nodeIdMovedInsideOrAfter: otherNodeId
                };
                var eventNodeId = this.nodeId;
                this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
            }

            // perform any necessary updating
            this.planningNodeChanged();
        }

        /**
         * Something related to planning has changed in the project. This
         * means a planning node was added, moved, or deleted.
         */

    }, {
        key: 'planningNodeChanged',
        value: function planningNodeChanged() {
            this.$rootScope.$broadcast('planningNodeChanged');
        }

        /**
         * Toggle the planning mode on and off. Notify child nodes that 
         * the planning mode has changed so they can act accordingly.
         */

    }, {
        key: 'togglePlanningMode',
        value: function togglePlanningMode() {
            // toggle the planning mode
            this.planningMode = !this.planningMode;
            this.item.planningMode = this.planningMode;

            if (!this.planningMode) {
                // Student is exiting planning mode, so save the changed nodes in NodeState
                var nodeState = this.NodeService.createNewNodeState();
                nodeState.nodeId = this.nodeId;
                nodeState.isAutoSave = false;
                nodeState.isSubmit = false;

                var studentData = {};
                studentData.nodeId = this.nodeId;
                studentData.nodes = [];
                var planningNode = this.ProjectService.getNodeById(this.nodeId);
                studentData.nodes.push(planningNode); // add the planning node (group)
                // loop through the child ids in the planning group and save them also
                if (planningNode.ids != null) {
                    for (var c = 0; c < planningNode.ids.length; c++) {
                        var childPlanningNodeId = planningNode.ids[c];
                        var childPlanningNode = this.ProjectService.getNodeById(childPlanningNodeId);
                        studentData.nodes.push(childPlanningNode);
                    }
                }

                nodeState.studentData = studentData;
                var nodeStates = [];
                nodeStates.push(nodeState);
                this.StudentDataService.saveNodeStates(nodeStates);
            }

            // Save planning mode on/off event
            var componentId = null;
            var componentType = null;
            var category = "Planning";
            var eventName = this.planningMode ? "planningModeOn" : "planningModeOff";
            var eventData = {
                nodeId: this.nodeId
            };
            var eventNodeId = this.nodeId;
            this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);

            // notify the child nodes that the planning mode of this group node has changed
            this.$rootScope.$broadcast('togglePlanningModeClicked', { nodeId: this.nodeId, planningMode: this.planningMode });
        }
    }]);

    return NavItemController;
}();

NavItemController.$inject = ['$rootScope', '$scope', '$element', 'NodeService', 'ProjectService', 'StudentDataService'];

exports.default = NavItemController;
//# sourceMappingURL=navItemController.js.map