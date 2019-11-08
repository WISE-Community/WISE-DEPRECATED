"use strict";

class NavItemController {
    constructor($element,
                $filter,
                $rootScope,
                $scope,
                $state,
                AnnotationService,
                ConfigService,
                NodeService,
                NotificationService,
                PlanningService,
                ProjectService,
                StudentDataService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$element = $element;
        this.$filter = $filter;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotificationService = NotificationService;
        this.PlanningService = PlanningService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.$translate = this.$filter('translate');

        this.expanded = false;
    }

    $onInit() {
        this.item = this.ProjectService.idToNode[this.nodeId];
        this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
        this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);

        this.nodeTitle = this.showPosition ? (this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title) : this.item.title;
        this.currentNode = this.TeacherDataService.currentNode;
        this.previousNode = null;
        this.isCurrentNode = (this.currentNode.id === this.nodeId);

        // the current period
        this.currentPeriod = this.TeacherDataService.getCurrentPeriod();

        // the current workgroup
        this.currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
        this.setCurrentNodeStatus();

        // the max score for the node
        this.maxScore = this.ProjectService.getMaxScoreForNode(this.nodeId);

        // an object to hold workgroups currently visiting this node
        this.workgroupsOnNodeData = [];

        // whether there is at least one workgroup both online and on this node
        this.isWorkgroupOnlineOnNode = false;

        // whether this node is a planning group
        this.isPlanning = this.PlanningService.isPlanning(this.nodeId);

        // get the node icon
        this.icon = this.ProjectService.getNodeIconByNodeId(this.nodeId);

        this.parentGroupId = null;

        var parentGroup = this.ProjectService.getParentGroup(this.nodeId);

        if (parentGroup != null) {
            this.parentGroupId = parentGroup.id;
        }

        if (this.isPlanning) {
            /*
             * planning is enabled for this group so we will get the available
             * planning nodes that can be used
             */
            this.availablePlanningNodes = this.PlanningService.getAvailablePlanningNodes(this.nodeId);
        } else if (this.isPlanningNode) {
            /* this is an available planning node for its parent group, so we
             * need to calculate the total number of times it has been added
             * to the project by all the workgroups in the current period
             */

        }

        this.setWorkgroupsOnNodeData();

        this.$onInit = () => {
            this.hasAlert = false;
            this.newAlert = false;
            this.alertNotifications = [];

            this.getAlertNotifications();

            this.hasRubrics = this.ProjectService.getNumberOfRubricsByNodeId(this.nodeId) > 0;
            this.alertIconLabel = this.$translate('HAS_ALERTS_NEW');
            this.alertIconClass = 'warn';
            this.alertIconName = 'notifications';
            this.rubricIconLabel = this.$translate('STEP_HAS_RUBRICS_TIPS');
            this.rubricIconClass = 'info';
            this.rubricIconName = 'info';
        };

        this.$scope.$watch(
            () => { return this.TeacherDataService.currentNode; },
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

                    if (this.TeacherDataService.previousStep) {
                        this.$scope.$parent.isPrevStep = (this.nodeId === this.TeacherDataService.previousStep.id);
                    }

                    if (isPrev && !this.isGroup) {
                        this.zoomToElement();
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

        // listen for the studentsOnlineReceived event
        this.$rootScope.$on('studentsOnlineReceived', (event, args) => {
            this.setWorkgroupsOnNodeData();
        });

        // listen for the studentStatusReceived event
        this.$rootScope.$on('studentStatusReceived', (event, args) => {
            this.setWorkgroupsOnNodeData();
            this.setCurrentNodeStatus();
            this.getAlertNotifications();
        });

        // listen for the currentPeriodChanged event
        this.$rootScope.$on('currentPeriodChanged', (event, args) => {
            this.currentPeriod = args.currentPeriod;
            this.setWorkgroupsOnNodeData();
            this.getAlertNotifications();
        });
    }

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
    }

    itemClicked(event) {
        let previousNode = this.TeacherDataService.currentNode;
        let currentNode = this.ProjectService.getNodeById(this.nodeId);
        if (this.isGroup) {
            this.expanded = !this.expanded;
            if (this.expanded) {
                if (this.isCurrentNode) {
                    this.zoomToElement();
                } else {
                    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                }
            }
        } else {
            this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
        }
    }

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
    }

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
     * Get the percentage of the node that the class or period has completed
     * @returns the percentage of the node that the class or period has completed
     */
    getNodeCompletion() {
        // get completion for all students in the current period
        let periodId = this.currentPeriod.periodId;
        return this.StudentStatusService.getNodeCompletion(this.nodeId, periodId, null, true).completionPct;
    }

    /**
     * Get the average score for the node
     * @returns the average score for the node
     */
    getNodeAverageScore() {
        // get the currently seleceted workgroupId
        let workgroupId = this.currentWorkgroup ? this.currentWorkgroup.workgroupId : null;

        if (workgroupId) {
            // get and return score for currently selected workgroup
            return this.AnnotationService.getScore(workgroupId, this.nodeId);
        } else {
            // there is no currently selected workgroup, so get the currently selected period
            let periodId = this.currentPeriod.periodId;

            // get and return the average score for the node
            return this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);
        }
    }

    /**
     * Get the workgroup ids on this node in the current period
     * @returns an array of workgroup ids on a node in a period
     */
    getWorkgroupIdsOnNode() {
        // get the currently selected period
        let periodId = this.currentPeriod.periodId;

        // get the workgroups that are on the node in the period
        return this.StudentStatusService.getWorkgroupIdsOnNode(this.nodeId, periodId);
    }

    setWorkgroupsOnNodeData() {
        let workgroupIdsOnNode = this.getWorkgroupIdsOnNode();
        let workgroupOnlineOnNode = false;
        this.workgroupsOnNodeData = [];

        let n = workgroupIdsOnNode.length;
        for (let i = 0; i < n; i++) {
            let id = workgroupIdsOnNode[i];

            let usernames = this.ConfigService.getDisplayUsernamesByWorkgroupId(id);
            let avatarColor = this.ConfigService.getAvatarColorForWorkgroupId(id);
            let online = this.TeacherWebSocketService.isStudentOnline(id);
            if (online) {
                workgroupOnlineOnNode = true;
            }

            this.workgroupsOnNodeData.push({
                'workgroupId': id,
                'usernames': usernames,
                'avatarColor': avatarColor,
                'online': online
            });
        }

        this.isWorkgroupOnlineOnNode = workgroupOnlineOnNode;
    }

    setCurrentNodeStatus() {
        if (this.currentWorkgroup) {
            // get the workgroup's studentStatus
            let studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(this.currentWorkgroup.workgroupId);

            // get the current node status
            this.currentNodeStatus = studentStatus.nodeStatuses[this.nodeId];
        }
    }

    getAlertNotifications() {
        // get the currently selected period
        let periodId = this.currentPeriod.periodId;
        let workgroupId = this.currentWorkgroup ? this.currentWorkgroup.workgroupId : null;

        let args = {};
        args.nodeId = this.nodeId;
        args.periodId = periodId;
        args.toWorkgroupId = workgroupId;
        this.alertNotifications = this.NotificationService.getAlertNotifications(args);

        this.hasAlert = (this.alertNotifications.length > 0);
        this.newAlert = this.hasNewAlert();
    }

    hasNewAlert() {
        let result = false;

        let nAlerts = this.alertNotifications.length;
        for (let i = 0; i < nAlerts; i++) {
            let alert = this.alertNotifications[i];

            if (!alert.timeDismissed) {
                result = true;
                break;
            }
        }

        return result;
    }
}

NavItemController.$inject = [
    '$element',
    '$filter',
    '$rootScope',
    '$scope',
    '$state',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'PlanningService',
    'ProjectService',
    'StudentDataService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
];

const NavItem = {
    bindings: {
        nodeId: '<',
        showPosition: '<',
        type: '<',
        isPlanningNode: '<'
    },
    templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/navItem/navItem.html',
    controller: NavItemController
};

export default NavItem;
