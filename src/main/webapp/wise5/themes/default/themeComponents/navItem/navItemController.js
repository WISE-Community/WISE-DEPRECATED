"use strict";

class NavItemController {
    constructor($filter,
                $rootScope,
                $scope,
                $element,
                dragulaService,
                NodeService,
                PlanningService,
                ProjectService,
                StudentDataService,
                $mdDialog) {

        this.$filter = $filter;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$element = $element;
        this.dragulaService = dragulaService;
        this.NodeService = NodeService;
        this.PlanningService = PlanningService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.$mdDialog = $mdDialog;
        this.$translate = this.$filter('translate');
        this.autoScroll = require('dom-autoscroller');

        this.expanded = false;
    }

    $onInit() {
        this.item = this.ProjectService.idToNode[this.nodeId];
        this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];

        this.nodeTitle = this.showPosition ? (this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title) : this.item.title;
        this.currentNode = this.StudentDataService.currentNode;
        this.previousNode = null;
        this.isCurrentNode = (this.currentNode.id === this.nodeId);

        // whether this node is a planning node
        this.isPlanning = this.PlanningService.isPlanning(this.nodeId);

        // the array of nodes used for drag/drop planning sorting
        this.availablePlanningNodes = [];

        // whether the node is a planning node instance
        this.node = this.ProjectService.getNodeById(this.nodeId);
        this.isPlanningInstance = this.PlanningService.isPlanningInstance(this.nodeId);

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
            this.isParentGroupPlanning = this.PlanningService.isPlanning(this.parentGroupId);
        }

        if (this.isPlanning) {
            /*
             * planning is enabled so we will get the available planning
             * nodes that can be used in this group
             */
            this.availablePlanningNodes = this.PlanningService.getAvailablePlanningNodes(this.nodeId);
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
            this.availablePlanningNodes = this.PlanningService.getAvailablePlanningNodes(this.parentGroupId);

            this.$scope.$watch(
                () => {
                    // watch the position of this node
                    return this.ProjectService.nodeIdToNumber[this.nodeId];
                },
                (value) => {
                    // the position has changed for this node so we will update it in the UI
                    this.nodeTitle = this.showPosition ? (this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title) : this.item.title;
                }
            );
        }

        this.$scope.$watch(
            () => { return this.StudentDataService.currentNode; },
            (newNode, oldNode) => {
                this.currentNode = newNode;
                this.previousNode = oldNode;
                this.isCurrentNode = (this.nodeId === newNode.id);
                let isPrev = false;

                if (this.ProjectService.isApplicationNode(newNode.id)) {
                    return;
                }

                if (oldNode) {
                    isPrev = (this.nodeId === oldNode.id);

                    if (this.StudentDataService.previousStep) {
                        this.$scope.$parent.isPrevStep = (this.nodeId === this.StudentDataService.previousStep.id);
                    }
                }

                if (this.isGroup) {
                    let prevNodeisGroup = (!oldNode || this.ProjectService.isGroupNode(oldNode.id));
                    let prevNodeIsDescendant = this.ProjectService.isNodeDescendentOfGroup(oldNode, this.item);
                    if (this.isCurrentNode) {
                        this.expanded = true;
                        if (prevNodeisGroup || !prevNodeIsDescendant) {
                            this.zoomToElement();
                        }
                    } else {
                        if (!prevNodeisGroup) {
                            if (prevNodeIsDescendant) {
                                this.expanded = true;
                            } else {
                                this.expanded = false;
                            }
                        }
                    }
                } else {
                    if (isPrev && this.ProjectService.isNodeDescendentOfGroup(this.item, newNode)) {
                        this.zoomToElement();
                    }
                }
            }
        );

        this.$scope.$watch(
            () => { return this.expanded; },
            (value) => {
                this.$scope.$parent.itemExpanded = value;
            }
        );

        // a group node has turned on or off planning mode
        this.$rootScope.$on('togglePlanningMode', (event, args) => {

            // get the group node that has had its planning node changed
            let planningModeClickedNodeId = args.nodeId;
            let planningMode = args.planningMode;

            // get this node's parent group
            let parentGroup = this.ProjectService.getParentGroup(this.nodeId);
            let parentGroupId = null;

            if (parentGroup != null) {
                parentGroupId = parentGroup.id;
            }

            if (parentGroupId == planningModeClickedNodeId) {
                // the parent of this node has changed their planning mode
                this.planningMode = planningMode;
            }
        });

        let dragId = 'planning_' + this.nodeId ;
        // handle item drop events
        let dropEvent = dragId + '.drop-model';
        this.$scope.$on(dropEvent, (el, target, source) => {
            let nodeChangedId = target.data().nodeid;
            this.planningNodeItemsChanged(nodeChangedId);
        });

        this.dragulaService.options(this.$scope, dragId, {
            moves: (el, source, handle, sibling) => {
                if (!this.planningMode) {
                    return false;
                }

                let nodeId = el.getAttribute('data-nodeid');
                return this.PlanningService.isPlanningInstance(nodeId);
            }
        });

        let drake = this.dragulaService.find(this.$scope, dragId).drake;

        // support scroll while dragging
        let scroll = this.autoScroll(
            [document.querySelector('#content')], {
            margin: 30,
            pixels: 50,
            scrollWhenOutside: true,
            autoScroll: function() {
                // Only scroll when the pointer is down, and there is a child being dragged
                return this.down && drake.dragging;
            }
        });
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/themeComponents/navItem/navItem.html';
    };

    zoomToElement() {
        setTimeout(()=> {
            // smooth scroll to expanded group's page location
            let top = this.$element[0].offsetTop;
            let location = this.isGroup ? top - 32 : top - 80;
            let delay = 350;
            $('#content').animate({
                scrollTop: location
            }, delay, 'linear');
        }, 500);
    };

    itemClicked(event) {
        if (this.isGroup) {
            this.expanded = !this.expanded;
            if (this.expanded) {
                if (this.isCurrentNode) {
                    this.zoomToElement();
                } else {
                    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                }
            }
        } else {
            if (this.StudentDataService.planningMode) {
                // Don't allow students to enter planning steps while in planning mode
                this.$mdDialog.show(
                    this.$mdDialog.alert()
                        .title(this.$translate('itemLocked'))
                        .textContent(this.$translate('planningModeStepsUnVisitable'))
                        .ariaLabel(this.$translate('itemLocked'))
                        .ok(this.$translate('ok'))
                        .targetEvent(event)
                );
            } else {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
            }
        }
    };

    /**
     * Save an event when planning node is added
     * @param planningNodeAdded
     */
    savePlanningNodeAddedEvent(planningNodeAdded) {
        let componentId = null;
        let componentType = null;
        let category = "Planning";
        let eventName = "planningNodeAdded";
        let eventData = {
            nodeIdAdded: planningNodeAdded.id,
            planningNodeTemplateId: planningNodeAdded.planningNodeTemplateId
        };
        let eventNodeId = this.nodeId;
        this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
    };

    /**
     * Returns the max times a planning node can be added to the project (-1 is
     * is returned if there is no limit)
     * @param planningNodeId
     */
    getPlannindNodeMaxAllowed(planningNodeId) {
        let maxAddAllowed = -1;  // by default, students can add as many instances as they want
        let planningGroupNode = null;
        if (this.isParentGroupPlanning) {
            planningGroupNode = this.ProjectService.getNodeById(this.parentGroupId);
        } else {
            planningGroupNode = this.ProjectService.getNodeById(this.nodeId);
        }
        // get the maxAddAllowed value by looking up the planningNode in the project.
        if (planningGroupNode && planningGroupNode.availablePlanningNodes) {
            for (let a = 0; a < planningGroupNode.availablePlanningNodes.length; a++) {
                let availablePlanningNode = planningGroupNode.availablePlanningNodes[a];
                if (availablePlanningNode.nodeId === planningNodeId && availablePlanningNode.max != null) {
                    maxAddAllowed = availablePlanningNode.max;
                }
            }
        }

        return maxAddAllowed;
    };

    /**
     * Returns the number of times a planning node has been added to the project
     * @param planningNodeId
     */
    getNumPlannindNodeInstances(planningNodeId) {
        let numPlanningNodesAdded = 0;  // keep track of number of instances
        // otherwise, see how many times the planning node template has been used.

        let planningGroupNode = null;
        if (this.isParentGroupPlanning) {
            planningGroupNode = this.ProjectService.getNodeById(this.parentGroupId);
        } else {
            planningGroupNode = this.ProjectService.getNodeById(this.nodeId);
        }

        // loop through the child ids in the planning group and see how many times they've been used
        if (planningGroupNode && planningGroupNode.ids) {
            for (let c = 0; c < planningGroupNode.ids.length; c++) {
                let childPlanningNodeId = planningGroupNode.ids[c];
                let childPlanningNode = this.ProjectService.getNodeById(childPlanningNodeId);
                if (childPlanningNode != null && childPlanningNode.planningNodeTemplateId === planningNodeId) {
                    numPlanningNodesAdded++;
                }
            }
        }

        return numPlanningNodesAdded;
    };

    /**
     * Returns true iff this student can add the specified planning node.
     * Limits include reaching the max allowed count
     * @param planningNodeId
     */
    canAddPlanningNode(planningNodeId) {
        let maxAddAllowed = this.getPlannindNodeMaxAllowed(planningNodeId);

        // if maxAddAllowed was not found or is set to 0, it means students can add as many as they want
        if (maxAddAllowed < 1) {
            return true;
        }

        let numPlanningNodesAdded = this.getNumPlannindNodeInstances(planningNodeId);

        return numPlanningNodesAdded < maxAddAllowed;
    };

    /**
     * Create a planning node instance and add it to the project
     * @param groupId the group the new planning node instance will be added to
     * @param templateNodeId the node id of the planning node template
     * @returns the planning node instance
     */
    addPlanningNodeInstanceInside(nodeIdToInsertInside, templateNodeId) {
        // create the planning node instance
        let nextAvailablePlanningNodeId = this.StudentDataService.getNextAvailablePlanningNodeId();
        let planningNodeInstance = this.PlanningService.createPlanningNodeInstance(templateNodeId, nextAvailablePlanningNodeId);

        // add the planning node instance inside
        this.PlanningService.addPlanningNodeInstanceInside(nodeIdToInsertInside, planningNodeInstance);

        /*
         * update the node statuses so that a node status is created for
         * the new planning node instance
         */
        this.StudentDataService.updateNodeStatuses();

        // perform any necessary updating
        this.planningNodeChanged();

        // Save add planning node event
        this.savePlanningNodeAddedEvent(planningNodeInstance);

        return planningNodeInstance;
    }

    /**
     * Open the planning mode select dialog to choose a planning node template
     * to create a new planning instance
     * @param event the trigger event
     * @param targetNodeId the node to insert the new planning instance after or inside
     * @param insertInside boolean whether to insert the new planning instance
     * inside the target node (optional; default is after)
     */
    addPlanningInstance(event, targetNodeId, insertInside) {
        // show dialog with list of planning nodes user can add to current group

        let choosePlanningItemTemplateUrl = this.ProjectService.getThemePath() + '/themeComponents/navItem/choosePlanningItem.html';
        let navitemCtrl = this;

        this.$mdDialog.show({
            parent: angular.element(document.body),
            locals: {
                targetNodeId: targetNodeId,
                insertInside: insertInside,
                navitemCtrl: navitemCtrl,
            },
            templateUrl: choosePlanningItemTemplateUrl,
            targetEvent: event,
            controller: ChoosePlanningItemController
        });

        function ChoosePlanningItemController($scope, $mdDialog, targetNodeId, insertInside, navitemCtrl) {
            $scope.navitemCtrl = navitemCtrl;
            $scope.targetNodeId = targetNodeId;
            $scope.insertInside = insertInside;

            $scope.addSelectedPlanningInstance = (templateNodeId) => {
                if ($scope.insertInside) {
                    $scope.navitemCtrl.addPlanningNodeInstanceInside($scope.targetNodeId, templateNodeId);
                } else {
                    $scope.navitemCtrl.addPlanningNodeInstanceAfter($scope.targetNodeId, templateNodeId);
                }

                $mdDialog.hide();
            };

            $scope.close = () => {
                $mdDialog.hide();
            };
        }
        ChoosePlanningItemController.$inject = ["$scope", "$mdDialog", "targetNodeId", "insertInside", "navitemCtrl"];
    };

    /**
     * Create a planning node instance and add it to the project after the specified nodeId
     * @param groupId the group the new planning node instance will be added to
     * @param nodeId the node id of the planning node template
     */
    addPlanningNodeInstanceAfter(nodeIdToInsertAfter, templateNodeId) {

        var parentGroup = this.ProjectService.getParentGroup(nodeIdToInsertAfter);

        if (parentGroup != null) {
            var parentGroupId = parentGroup.id;

            // create the planning node instance
            let nextAvailablePlanningNodeId = this.StudentDataService.getNextAvailablePlanningNodeId();
            let planningNodeInstance = this.PlanningService.createPlanningNodeInstance(templateNodeId, nextAvailablePlanningNodeId);

            // insert planning node instance after
            this.PlanningService.addPlanningNodeInstanceAfter(nodeIdToInsertAfter, planningNodeInstance);

            /*
             * update the node statuses so that a node status is created for
             * the new planning node instance
             */
            this.StudentDataService.updateNodeStatuses();

            // perform any necessary updating
            this.planningNodeChanged();

            // Save add planning node event
            this.savePlanningNodeAddedEvent(planningNodeInstance);

            return planningNodeInstance;
        }
    }

    /**
     * Remove the planning node instance
     * @param planningNodeInstanceNodeId the planning node instance to remove
     * @param event the event that triggered the function call
     */
    removePlanningNodeInstance(planningNodeInstanceNodeId, event) {
        let confirm = this.$mdDialog.confirm()
            .parent(angular.element(document.body))
            .title(this.$translate('areYouSureYouWantToDeleteThisItem'))
            .textContent(this.$translate('noteAnyWorkYouHaveDoneOnThisItemWillBeLost'))
            .ariaLabel(this.$translate('deleteItemFromProject'))
            .targetEvent(event)
            .ok(this.$translate('yes'))
            .cancel(this.$translate('no'));

        this.$mdDialog.show(confirm).then(() => {
            // delete the node from the project
            this.ProjectService.deleteNode(planningNodeInstanceNodeId);

            // perform any necessary updating
            this.planningNodeChanged(this.parentGroupId);

            // Save remove planning node event
            let componentId = null;
            let componentType = null;
            let category = "Planning";
            let eventName = "planningNodeRemoved";
            let eventData = {
                nodeIdRemoved: planningNodeInstanceNodeId
            };
            let eventNodeId = this.nodeId;
            this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);
        }, () => {});
    }

    /**
     * Get the node title
     * @param nodeId get the title for this node
     * @returns the title for the node
     */
    getNodeTitle(nodeId) {
        var node = this.ProjectService.idToNode[nodeId];
        var title = null;

        if (node != null) {
            title = node.title;
        }

        return title;
    }

    /**
     * Get the node description
     * @param nodeId get the description for this node
     * @returns the description for the node
     */
    getNodeDescription(nodeId) {
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
    movePlanningNode(nodeIdToMove, nodeIdToMoveAfter) {

        /*
         * check that this node is not the same as the other node.
         * if they are the same we don't need to do anything.
         */
        if (nodeIdToMove != nodeIdToMoveAfter) {
            if (this.ProjectService.isGroupNode(nodeIdToMoveAfter)) {
                this.PlanningService.movePlanningNodeInstanceInside(nodeIdToMove, nodeIdToMoveAfter);
            } else {
                this.PlanningService.movePlanningNodeInstanceAfter(nodeIdToMove, nodeIdToMoveAfter);
            }
        }

        // perform any necessary updating
        this.planningNodeChanged();
    }

    /**
     * Something related to planning has changed in the project. This
     * means a planning node was added, moved, or deleted.
     * @param param planningNodeId planning node id
     */
    planningNodeChanged(planningNodeId) {
        this.savePlanningNodeChanges(planningNodeId);

        this.$rootScope.$broadcast('planningNodeChanged');
    }

    /**
    * Save the changed nodes in NodeState
    * @param param planningNodeId planning node id
    **/
    savePlanningNodeChanges(planningNodeId) {
        let nodeState = this.NodeService.createNewNodeState();
        let nodeId = planningNodeId ? planningNodeId : this.nodeId;
        nodeState.nodeId = nodeId;
        nodeState.isAutoSave = false;
        nodeState.isSubmit = false;

        var studentData = {};
        studentData.nodeId = nodeId;
        studentData.nodes = [];
        let planningNode = this.ProjectService.getNodeById(nodeId);
        studentData.nodes.push(planningNode);  // add the planning node (group)
        // loop through the child ids in the planning group and save them also
        if (planningNode.ids != null) {
            for (let c = 0; c < planningNode.ids.length; c++) {
                let childPlanningNodeId = planningNode.ids[c];
                let childPlanningNode = this.ProjectService.getNodeById(childPlanningNodeId);
                studentData.nodes.push(childPlanningNode);
            }
        }

        nodeState.studentData = studentData;
        var nodeStates = [];
        nodeStates.push(nodeState);
        this.StudentDataService.saveNodeStates(nodeStates);
    }

    /**
     * Toggle the planning mode on and off. Notify child nodes that
     * the planning mode has changed so they can act accordingly.
     */
    togglePlanningMode() {
        /*if (this.StudentDataService.planningMode && !this.item.planningMode) {
            // Don't allow multiple concurrent planning modes.
            this.$translate('planningModeOnlyOnePlanningModeAllowed').then((planningModeOnlyOnePlanningModeAllowed) => {
                alert(planningModeOnlyOnePlanningModeAllowed);
            });

            return;
        }*/

        // toggle the planning mode
        //this.planningMode = !this.planningMode;
        this.item.planningMode = this.planningMode;

        // also toggle StudentDataService planning mode. This will be used to constrain the entire project when in planning mode.
        this.StudentDataService.planningMode = this.planningMode;

        // Save planning mode on/off event
        let componentId = null;
        let componentType = null;
        let category = "Planning";
        let eventName = this.planningMode ? "planningModeOn" : "planningModeOff";
        let eventData = {
            nodeId: this.nodeId
        };
        let eventNodeId = this.nodeId;
        this.StudentDataService.saveVLEEvent(eventNodeId, componentId, componentType, category, eventName, eventData);

        // notify the child nodes that the planning mode of this group node has changed
        this.$rootScope.$broadcast('togglePlanningMode', { nodeId: this.nodeId, planningMode: this.planningMode });
    }

    /**
     * The planning node's items array has changed
     * @param newValue the new value of the planning node's items array
     * @param oldValue the old value of the planning node's items array
     */
    planningNodeItemsChanged(nodeChangedId) {
        let index = this.item.ids.indexOf(nodeChangedId);
        let nodeIdAddedAfter = this.item.ids[index-1];

        if (nodeIdAddedAfter) {
            // the node was moved after another node in the group
            this.movePlanningNode(nodeChangedId, nodeIdAddedAfter);
        } else {
            // the node was moved to the beginning of the group
            this.movePlanningNode(nodeChangedId, this.nodeId);
        }
    };
}

NavItemController.$inject = [
    '$filter',
    '$rootScope',
    '$scope',
    '$element',
    'dragulaService',
    'NodeService',
    'PlanningService',
    'ProjectService',
    'StudentDataService',
    '$mdDialog'
];

export default NavItemController;
