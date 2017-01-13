"use strict";

class NavItemController {
    constructor($element,
                $filter,
                $mdDialog,
                $rootScope,
                $scope,
                $state,
                ConfigService,
                NodeService,
                NotificationService,
                ProjectService,
                StudentDataService,
                StudentStatusService,
                TeacherDataService,
                TeacherWebSocketService) {

        this.$element = $element;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.$translate = this.$filter('translate');

        this.expanded = false;

        this.item = this.ProjectService.idToNode[this.nodeId];
        this.isGroup = this.ProjectService.isGroupNode(this.nodeId);

        this.nodeTitle = this.showPosition ? (this.ProjectService.idToPosition[this.nodeId] + ': ' + this.item.title) : this.item.title;
        this.currentNode = this.TeacherDataService.currentNode;
        this.previousNode = null;
        this.isCurrentNode = (this.currentNode.id === this.nodeId);

        // the max score for the node
        this.maxScore = this.ProjectService.getMaxScoreForNode(this.nodeId);

        // an object to hold workgroups currently visiting this node
        this.workgroupsOnNodeData = [];

        // whether there is at least one workgroup both online and on this node
        this.isWorkgroupOnlineOnNode = false;

        // whether this node is a planning group
        this.isPlanning = this.ProjectService.isPlanning(this.nodeId);

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
            this.availablePlanningNodes = this.ProjectService.getAvailablePlanningNodes(this.nodeId);
        } else if (this.isPlanningNode) {
            /* this is an available planning node for its parent group, so we
             * need to calculate the total number of times it has been added
             * to the project by all the workgroups in the current period
             */

        }

        this.setWorkgroupsOnNodeData();

        this.$onInit = () => {
            this.alertStatus = null;
            this.alertNotifications = [];

            this.getAlertNotifications();
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
        });

        // listen for the currentPeriodChanged event
        this.$rootScope.$on('currentPeriodChanged', (event, args) => {
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
     * Get the percentage of the class or period that has completed this node
     * @returns the percentage of the class or period that has completed the node
     */
    getNodeCompletion() {
        // get the currently selected period
        let currentPeriod = this.TeacherDataService.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the percentage of the class or period that has completed the node
        let completionPercentage = this.StudentStatusService.getNodeCompletion(this.nodeId, periodId);

        return completionPercentage;
    }

    /**
     * Get the average score for the node
     * @param nodeId the node id
     * @returns the average score for the node
     */
    getNodeAverageScore() {
        // get the currently selected period
        let currentPeriod = this.TeacherDataService.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        // get the average score for the node
        let averageScore = this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);

        let averageScoreDisplay = null;

        if (typeof this.maxScore === 'number') {
            if (averageScore === null) {
                averageScore = "-";
            } else {
                averageScore = this.$filter('number')(averageScore, 1);
            }
            // create the average score display e.g. 8/10
            averageScoreDisplay = averageScore + '/' + this.maxScore;
        }

        return averageScoreDisplay;
    }

    /**
     * Get the current period
     */
    getCurrentPeriod() {
        return this.TeacherDataService.getCurrentPeriod();
    }

    /**
     * Get the workgroup ids on this node in the current period
     * @returns an array of workgroup ids on a node in a period
     */
    getWorkgroupIdsOnNode() {
        // get the currently selected period
        let currentPeriod = this.getCurrentPeriod().periodId;

        // get the workgroups that are on the node in the period
        return this.StudentStatusService.getWorkgroupIdsOnNode(this.nodeId, currentPeriod);
    }


    setWorkgroupsOnNodeData() {
        let workgroupIdsOnNode = this.getWorkgroupIdsOnNode();
        let workgroupOnlineOnNode = false;
        this.workgroupsOnNodeData = [];

        let n = workgroupIdsOnNode.length;
        for (let i = 0; i < n; i++) {
            let id = workgroupIdsOnNode[i];
            let usernames = this.ConfigService.getUserNamesByWorkgroupId(id);
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

    getAlertNotifications() {
        // get the currently selected period
        let currentPeriod = this.TeacherDataService.getCurrentPeriod();
        let periodId = currentPeriod.periodId;

        let args = {};
        args.nodeId = this.nodeId;
        args.periodId = periodId;
        this.alertNotifications = this.NotificationService.getAlertNotifications(args);

        let hasAlert = (this.alertNotifications.length > 0);
        let hasNewAlert = this.hasNewAlert();

        if (hasNewAlert) {
            this.alertStatus = 'new';
        } else if (hasAlert) {
            this.alertStatus = 'dismissed';
        } else {
            this.alertStatus = null;
        }
    }

    hasNewAlert() {
        let result = false;

        let nAlerts = this.alertNotifications.length;
        for (let i = 0; i < nAlerts; i++) {
            let alert = this.alertNotifications[i];
            let toWorkgroupId = alert.toWorkgroupId;



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
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    'ConfigService',
    'NodeService',
    'NotificationService',
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
