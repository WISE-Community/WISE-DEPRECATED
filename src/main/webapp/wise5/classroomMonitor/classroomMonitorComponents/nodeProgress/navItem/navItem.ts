'use strict';

import { AnnotationService } from '../../../../services/annotationService';
import { ConfigService } from '../../../../services/configService';
import { NotificationService } from '../../../../services/notificationService';
import { StudentStatusService } from '../../../../services/studentStatusService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherWebSocketService } from '../../../../services/teacherWebSocketService';
import * as $ from 'jquery';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

class NavItemController {
  $translate: any;
  alertIconClass: string;
  alertIconLabel: string;
  alertIconName: string;
  alertNotifications: any;
  currentNode: any;
  currentNodeStatus: any;
  currentPeriod: any;
  currentWorkgroup: any;
  expanded: boolean = false;
  hasAlert: boolean;
  hasRubrics: boolean;
  icon: any;
  isCurrentNode: boolean;
  isGroup: boolean;
  isWorkgroupOnlineOnNode: boolean;
  item: any;
  maxScore: number;
  newAlert: any;
  nodeHasWork: boolean;
  nodeId: string;
  nodeTitle: string;
  parentGroupId: string;
  previousNode: any;
  rubricIconClass: string;
  rubricIconLabel: string;
  rubricIconName: string;
  showPosition: any;
  workgroupsOnNodeData: any;

  static $inject = [
    '$element',
    '$filter',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService',
    'TeacherWebSocketService'
  ];

  constructor(
    private $element: any,
    $filter: any,
    private $rootScope: any,
    private $scope: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService,
    private StudentStatusService: StudentStatusService,
    private TeacherDataService: TeacherDataService,
    private TeacherWebSocketService: TeacherWebSocketService
  ) {
    this.$element = $element;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NotificationService = NotificationService;
    this.ProjectService = ProjectService;
    this.StudentStatusService = StudentStatusService;
    this.TeacherDataService = TeacherDataService;
    this.TeacherWebSocketService = TeacherWebSocketService;
    this.$translate = $filter('translate');
  }

  $onInit() {
    this.item = this.ProjectService.idToNode[this.nodeId];
    this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
    this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);

    this.nodeTitle = this.showPosition
      ? this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title
      : this.item.title;
    this.currentNode = this.TeacherDataService.currentNode;
    this.previousNode = null;
    this.isCurrentNode = this.currentNode.id === this.nodeId;
    this.currentPeriod = this.TeacherDataService.getCurrentPeriod();
    this.currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
    this.setCurrentNodeStatus();
    this.maxScore = this.ProjectService.getMaxScoreForNode(this.nodeId);
    this.workgroupsOnNodeData = [];
    this.isWorkgroupOnlineOnNode = false;
    this.icon = this.ProjectService.getNodeIconByNodeId(this.nodeId);
    this.parentGroupId = null;
    var parentGroup = this.ProjectService.getParentGroup(this.nodeId);
    if (parentGroup != null) {
      this.parentGroupId = parentGroup.id;
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
      () => {
        return this.TeacherDataService.currentNode;
      },
      (newNode, oldNode) => {
        this.currentNode = newNode;
        this.previousNode = oldNode;
        this.isCurrentNode = this.nodeId === newNode.id;
        let isPrev = false;

        if (this.ProjectService.isApplicationNode(newNode.id)) {
          return;
        }

        if (oldNode) {
          isPrev = this.nodeId === oldNode.id;

          if (this.TeacherDataService.previousStep) {
            this.$scope.$parent.isPrevStep =
              this.nodeId === this.TeacherDataService.previousStep.id;
          }

          if (isPrev && !this.isGroup) {
            this.zoomToElement();
          }
        }

        if (this.isGroup) {
          let prevNodeisGroup = !oldNode || this.ProjectService.isGroupNode(oldNode.id);
          let prevNodeIsDescendant = this.ProjectService.isNodeDescendentOfGroup(
            oldNode,
            this.item
          );
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
      () => {
        return this.expanded;
      },
      value => {
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
    setTimeout(() => {
      // smooth scroll to expanded group's page location
      let top = this.$element[0].offsetTop;
      let location = this.isGroup ? top - 32 : top - 80;
      let delay = 350;
      $('#content').animate(
        {
          scrollTop: location
        },
        delay,
        'linear'
      );
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

  isLocked() {
    const node = this.ProjectService.getNodeById(this.nodeId);
    return node.constraints != null && node.constraints.filter(constraint => {
      return constraint.action === 'makeThisNodeNotVisitable';
    }).length > 0;
  }

  lockNode(doLock: boolean) {
    this.ProjectService.lockNode(this.nodeId, doLock);
    this.TeacherWebSocketService.sendProjectToClass(this.currentPeriod.periodId,
        this.ProjectService.project);
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
    let periodId = this.currentPeriod.periodId;
    return this.StudentStatusService.getNodeCompletion(this.nodeId, periodId, null, true)
      .completionPct;
  }

  /**
   * Get the average score for the node
   * @returns the average score for the node
   */
  getNodeAverageScore() {
    let workgroupId = this.currentWorkgroup ? this.currentWorkgroup.workgroupId : null;
    if (workgroupId) {
      return this.AnnotationService.getScore(workgroupId, this.nodeId);
    } else {
      let periodId = this.currentPeriod.periodId;
      return this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);
    }
  }

  getWorkgroupIdsOnNode() {
    let periodId = this.currentPeriod.periodId;
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
        workgroupId: id,
        usernames: usernames,
        avatarColor: avatarColor,
        online: online
      });
    }

    this.isWorkgroupOnlineOnNode = workgroupOnlineOnNode;
  }

  setCurrentNodeStatus() {
    if (this.currentWorkgroup) {
      let studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(
        this.currentWorkgroup.workgroupId
      );
      this.currentNodeStatus = studentStatus.nodeStatuses[this.nodeId];
    }
  }

  getAlertNotifications() {
    let periodId = this.currentPeriod.periodId;
    let workgroupId = this.currentWorkgroup ? this.currentWorkgroup.workgroupId : null;
    let args = {
      nodeId: this.nodeId,
      periodId: periodId,
      toWorkgroupId: workgroupId
    };
    this.alertNotifications = this.NotificationService.getAlertNotifications(args);
    this.hasAlert = this.alertNotifications.length > 0;
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

const NavItem = {
  bindings: {
    nodeId: '<',
    showPosition: '<',
    type: '<'
  },
  templateUrl:
    '/wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/navItem/navItem.html',
  controller: NavItemController
};

export default NavItem;
