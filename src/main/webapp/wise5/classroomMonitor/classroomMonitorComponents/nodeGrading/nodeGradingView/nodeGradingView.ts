'use strict';

import { AnnotationService } from '../../../../services/annotationService';
import { ConfigService } from '../../../../services/configService';
import { NodeService } from '../../../../services/nodeService';
import { MilestoneService } from '../../../../services/milestoneService';
import { NotificationService } from '../../../../services/notificationService';
import { StudentStatusService } from '../../../../services/studentStatusService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import * as angular from 'angular';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { Subscription } from 'rxjs';
import { Directive } from '@angular/core';

@Directive()
class NodeGradingViewController {
  $translate: any;
  canViewStudentNames: boolean;
  componentId: string = null;
  hiddenComponents: any;
  isExpandAll: boolean;
  maxScore: any;
  milestone: any;
  milestoneReport: any;
  nodeContent: any = null;
  nodeHasWork: boolean;
  nodeId: string;
  numRubrics: number;
  sortOrder: object = {
    team: ['-isVisible', 'workgroupId'],
    '-team': ['-isVisible', '-workgroupId'],
    status: ['-isVisible', 'completionStatus', 'workgroupId'],
    '-status': ['-isVisible', '-completionStatus', 'workgroupId'],
    score: ['-isVisible', 'score', 'workgroupId'],
    '-score': ['-isVisible', '-score', 'workgroupId']
  };
  sort: any;
  teacherWorkgroupId: number;
  workgroupInViewById: any;
  workgroups: any;
  workgroupsById: any;
  workVisibilityById: any;
  annotationReceivedSubscription: Subscription;
  studentWorkReceivedSubscription: Subscription;
  notificationChangedSubscription: Subscription;
  currentPeriodChangedSubscription: Subscription;
  projectSavedSubscription: Subscription;

  static $inject = [
    '$filter',
    '$scope',
    'AnnotationService',
    'ConfigService',
    'MilestoneService',
    'NodeService',
    'NotificationService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
  ];

  constructor(
    private $filter: any,
    private $scope: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private MilestoneService: MilestoneService,
    private NodeService: NodeService,
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService,
    private StudentStatusService: StudentStatusService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$translate = this.$filter('translate');
  }

  $onInit() {
    this.maxScore = this.getMaxScore();
    this.nodeHasWork = this.ProjectService.nodeHasWork(this.nodeId);
    this.sort = this.TeacherDataService.nodeGradingSort;
    this.nodeContent = this.ProjectService.getNodeById(this.nodeId);
    if (this.milestone && this.milestone.componentId) {
      this.componentId = this.milestone.componentId;
      this.hiddenComponents = this.getHiddenComponents();
    } else {
      this.milestoneReport = this.MilestoneService.getMilestoneReportByNodeId(this.nodeId);
    }

    // TODO: add loading indicator
    this.TeacherDataService.retrieveStudentDataByNodeId(this.nodeId).then((result) => {
      this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();
      this.workgroups = this.ConfigService.getClassmateUserInfos();
      this.workgroupsById = {}; // object that will hold workgroup names, statuses, scores, notifications, etc.
      this.workVisibilityById = {}; // object that specifies whether student work is visible for each workgroup
      this.workgroupInViewById = {}; // object that holds whether the workgroup is in view or not
      const permissions = this.ConfigService.getPermissions();
      this.canViewStudentNames = permissions.canViewStudentNames;
      this.setWorkgroupsById();
      this.numRubrics = this.ProjectService.getNumberOfRubricsByNodeId(this.nodeId);

      // scroll to the top of the page when the page loads
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });

    this.projectSavedSubscription = this.ProjectService.projectSaved$.subscribe(() => {
      this.maxScore = this.getMaxScore();
    });

    this.notificationChangedSubscription = this.NotificationService.notificationChanged$.subscribe(
      (notification) => {
        if (notification.type === 'CRaterResult') {
          // TODO: expand to encompass other notification types that should be shown to teacher
          const workgroupId = notification.toWorkgroupId;
          if (this.workgroupsById[workgroupId]) {
            this.updateWorkgroup(workgroupId);
          }
        }
      }
    );

    this.annotationReceivedSubscription = this.AnnotationService.annotationReceived$.subscribe(
      ({ annotation }) => {
        const workgroupId = annotation.toWorkgroupId;
        const nodeId = annotation.nodeId;
        if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
          this.updateWorkgroup(workgroupId);
        }
      }
    );

    this.studentWorkReceivedSubscription = this.TeacherDataService.studentWorkReceived$.subscribe(
      (args: any) => {
        const studentWork = args.studentWork;
        if (studentWork != null) {
          const workgroupId = studentWork.workgroupId;
          const nodeId = studentWork.nodeId;
          if (nodeId === this.nodeId && this.workgroupsById[workgroupId]) {
            this.updateWorkgroup(workgroupId);
          }
        }
      }
    );

    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      () => {
        if (!this.milestone) {
          this.milestoneReport = this.MilestoneService.getMilestoneReportByNodeId(this.nodeId);
        }
      }
    );

    if (!this.isDisplayInMilestone()) {
      this.saveNodeGradingViewDisplayedEvent();
    }

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.annotationReceivedSubscription.unsubscribe();
    this.currentPeriodChangedSubscription.unsubscribe();
    this.studentWorkReceivedSubscription.unsubscribe();
    this.notificationChangedSubscription.unsubscribe();
    this.projectSavedSubscription.unsubscribe();
  }

  saveNodeGradingViewDisplayedEvent() {
    const context = 'ClassroomMonitor',
      nodeId = this.nodeId,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'nodeGradingViewDisplayed',
      data = { nodeId: this.nodeId };
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  isDisplayInMilestone() {
    return this.milestone != null;
  }

  getMaxScore() {
    if (this.componentId) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId,
        this.componentId
      );
      if (component && component.maxScore) {
        return component.maxScore;
      } else {
        return 0;
      }
    } else {
      return this.ProjectService.getMaxScoreForNode(this.nodeId);
    }
  }

  getHiddenComponents() {
    const hiddenComponents = [];
    for (const component of this.nodeContent.components) {
      if (component.id !== this.componentId) {
        hiddenComponents.push(component.id);
      }
    }
    return hiddenComponents;
  }

  /**
   * Build the workgroupsById object
   */
  setWorkgroupsById() {
    let l = this.workgroups.length;
    for (let i = 0; i < l; i++) {
      let id = this.workgroups[i].workgroupId;
      this.workgroupsById[id] = this.workgroups[i];
      this.workVisibilityById[id] = false;
      this.updateWorkgroup(id, true);
    }
  }

  /**
   * Update statuses, scores, notifications, etc. for a workgroup object. Also check if we need to hide student
   * names because logged-in user does not have the right permissions
   * @param workgroupID a workgroup ID number
   * @param init Boolean whether we're in controller initialization or not
   */
  updateWorkgroup(workgroupId, init = false) {
    const workgroup = this.workgroupsById[workgroupId];
    if (workgroup) {
      const alertNotifications = this.getAlertNotificationsByWorkgroupId(workgroupId);
      workgroup.hasAlert = alertNotifications.length;
      workgroup.hasNewAlert = this.workgroupHasNewAlert(alertNotifications);
      const completionStatus = this.getCompletionStatusByWorkgroupId(workgroupId);
      //workgroup.hasNewWork = completionStatus.hasNewWork;
      workgroup.isVisible = completionStatus.isVisible ? 1 : 0;
      workgroup.completionStatus = this.getWorkgroupCompletionStatus(completionStatus);
      workgroup.score = this.getScoreByWorkgroupId(workgroupId);
      if (!init) {
        this.workgroupsById[workgroupId] = angular.copy(workgroup);
      }
    }
  }

  getAlertNotificationsByWorkgroupId(workgroupId) {
    const args = {
      nodeId: this.nodeId,
      toWorkgroupId: workgroupId
    };
    return this.NotificationService.getAlertNotifications(args);
  }

  workgroupHasNewAlert(alertNotifications) {
    let newAlert = false;
    let l = alertNotifications.length;
    for (let i = 0; i < l; i++) {
      let alert = alertNotifications[i];
      if (!alert.timeDismissed) {
        newAlert = true;
        break;
      }
    }

    return newAlert;
  }

  getCompletionStatusByWorkgroupId(workgroupId) {
    let isCompleted = false;
    let isVisible = false;
    let latestWorkTime = null;
    let latestAnnotationTime = null;
    const studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(workgroupId);
    if (studentStatus != null) {
      let nodeStatus = studentStatus.nodeStatuses[this.nodeId];
      if (nodeStatus) {
        isVisible = nodeStatus.isVisible;
        latestWorkTime = this.getLatestWorkTimeByWorkgroupId(workgroupId); // TODO: store this info in the nodeStatus so we don't have to calculate every time?
        latestAnnotationTime = this.getLatestAnnotationTimeByWorkgroupId(workgroupId);
        if (!this.ProjectService.nodeHasWork(this.nodeId)) {
          isCompleted = nodeStatus.isVisited;
        }
        if (this.componentId) {
          for (const workgroup of this.milestone.workgroups) {
            if (workgroup.workgroupId === workgroupId) {
              isCompleted = workgroup.completed;
              break;
            }
          }
        } else if (latestWorkTime) {
          isCompleted = nodeStatus.isCompleted;
        }
      }
    }
    return {
      isCompleted: isCompleted,
      isVisible: isVisible,
      latestWorkTime: latestWorkTime,
      latestAnnotationTime: latestAnnotationTime
    };
  }

  getLatestWorkTimeByWorkgroupId(workgroupId) {
    let time = null;
    const componentStates = this.TeacherDataService.getComponentStatesByNodeId(this.nodeId);
    const n = componentStates.length - 1;
    for (let i = n; i > -1; i--) {
      let componentState = componentStates[i];
      if (componentState.workgroupId === workgroupId) {
        time = componentState.serverSaveTime;
        break;
      }
    }
    return time;
  }

  getLatestAnnotationTimeByWorkgroupId(workgroupId) {
    let time = null;
    let annotations = this.TeacherDataService.getAnnotationsByNodeId(this.nodeId);
    let n = annotations.length - 1;

    // loop through annotations for this node, starting with most recent
    for (let i = n; i > -1; i--) {
      let annotation = annotations[i];
      // TODO: support checking for annotations from shared teachers
      if (
        annotation.toWorkgroupId === workgroupId &&
        annotation.fromWorkgroupId === this.ConfigService.getWorkgroupId()
      ) {
        time = annotation.serverSaveTime;
        break;
      }
    }

    return time;
  }

  /**
   * Returns the score for the current node for a given workgroupID
   * @param workgroupId a workgroup ID number
   * @returns Number score value (defaults to -1 if workgroup has no score)
   */
  getScoreByWorkgroupId(workgroupId) {
    let score = null;
    if (this.componentId) {
      const latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(
        this.nodeId,
        this.componentId,
        workgroupId
      );
      if (latestScoreAnnotation) {
        score = this.AnnotationService.getScoreValueFromScoreAnnotation(latestScoreAnnotation);
      }
    } else {
      score = this.AnnotationService.getScore(workgroupId, this.nodeId);
    }
    return typeof score === 'number' ? score : -1;
  }

  /**
   * Returns a numerical status value for a given completion status object depending on node completion
   * Available status values are: 0 (not visited/no work; default), 1 (partially completed), 2 (completed)
   * @param completionStatus Object
   * @returns Integer status value
   */
  getWorkgroupCompletionStatus(completionStatus) {
    let hasWork = completionStatus.latestWorkTime !== null;
    let isCompleted = completionStatus.isCompleted;
    let isVisible = completionStatus.isVisible;

    // TODO: store this info in the nodeStatus so we don't have to calculate every time (and can use more widely)?
    let status = 0; // default

    if (!isVisible) {
      status = -1;
    } else if (isCompleted) {
      status = 2;
    } else if (!this.componentId && hasWork) {
      status = 1;
    }

    return status;
  }

  /**
   * Get the student data for a specific part
   * @param the componentId
   * @param the workgroupId id of Workgroup who created the component state
   * @return the student data for the given component
   */
  getLatestComponentStateByWorkgroupIdAndComponentId(workgroupId, componentId) {
    var componentState = null;
    if (workgroupId != null && componentId != null) {
      componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(
        workgroupId,
        this.nodeId,
        componentId
      );
    }
    return componentState;
  }

  getCurrentPeriod() {
    return this.TeacherDataService.getCurrentPeriod();
  }

  /**
   * Get the percentage of the class or period that has completed the node
   * @param nodeId the node id
   * @returns the percentage of the class or period that has completed the node
   */
  getNodeCompletion(nodeId) {
    // get the currently selected period
    let currentPeriod = this.getCurrentPeriod();
    let periodId = currentPeriod.periodId;

    // get the percentage of the class or period that has completed the node
    let completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId)
      .completionPct;

    return completionPercentage;
  }

  /**
   * Get the average score for the node
   * @param nodeId the node id
   * @returns the average score for the node
   */
  getNodeAverageScore() {
    let currentPeriod = this.TeacherDataService.getCurrentPeriod();
    let periodId = currentPeriod.periodId;
    const averageScore = this.StudentStatusService.getNodeAverageScore(this.nodeId, periodId);
    if (averageScore === null) {
      return 'N/A';
    } else {
      return this.$filter('number')(averageScore, 1);
    }
  }

  isWorkgroupShown(workgroup) {
    return this.TeacherDataService.isWorkgroupShown(workgroup);
  }

  showRubric($event) {
    this.NodeService.showNodeInfo(this.nodeId, $event);
  }

  setSort(value) {
    if (this.sort === value) {
      this.sort = `-${value}`;
    } else {
      this.sort = value;
    }

    // update value in the teacher data service so we can persist across view instances and current node changes
    this.TeacherDataService.nodeGradingSort = this.sort;
  }

  getOrderBy() {
    return this.sortOrder[this.sort];
  }

  expandAll() {
    for (const workgroup of this.workgroups) {
      const workgroupId = workgroup.workgroupId;
      if (this.workgroupInViewById[workgroupId]) {
        this.workVisibilityById[workgroupId] = true;
      }
    }
    this.isExpandAll = true;
    if (this.isDisplayInMilestone()) {
      this.saveMilestoneStudentWorkExpandCollapseAllEvent('MilestoneStudentWorkExpandAllClicked');
    }
  }

  collapseAll() {
    for (const workgroup of this.workgroups) {
      this.workVisibilityById[workgroup.workgroupId] = false;
    }
    this.isExpandAll = false;
    if (this.isDisplayInMilestone()) {
      this.saveMilestoneStudentWorkExpandCollapseAllEvent('MilestoneStudentWorkCollapseAllClicked');
    }
  }

  saveMilestoneStudentWorkExpandCollapseAllEvent(event) {
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      data = { milestoneId: this.milestone.id };
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  onUpdateExpand(workgroupId, isExpanded) {
    this.workVisibilityById[workgroupId] = isExpanded;
    if (this.isDisplayInMilestone()) {
      this.saveMilestoneWorkgroupItemViewedEvent(workgroupId, isExpanded);
    }
  }

  saveMilestoneWorkgroupItemViewedEvent(workgroupId, isExpanded) {
    let event = '';
    if (isExpanded) {
      event = 'MilestoneStudentWorkOpened';
    } else {
      event = 'MilestoneStudentWorkClosed';
    }
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      data = { milestoneId: this.milestone.id, workgroupId: workgroupId };
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  onUpdateHiddenComponents(value) {
    this.hiddenComponents = angular.copy(value);
  }

  /**
   * A workgroup row has either come into view or gone out of view
   * @param workgroupId the workgroup id that has come into view or gone out
   * of view
   * @param inview whether the row is in view or not
   */
  workgroupInView(workgroupId, inview) {
    this.workgroupInViewById[workgroupId] = inview;
    if (this.isExpandAll && inview) {
      this.workVisibilityById[workgroupId] = true;
    }
  }

  showReport($event) {
    this.MilestoneService.showMilestoneDetails(this.milestoneReport, $event, true);
  }
}

const NodeGradingView = {
  bindings: {
    nodeId: '<',
    milestone: '<'
  },
  controller: NodeGradingViewController,
  templateUrl:
    '/wise5/classroomMonitor/classroomMonitorComponents/nodeGrading/nodeGradingView/nodeGradingView.html'
};

export default NodeGradingView;
