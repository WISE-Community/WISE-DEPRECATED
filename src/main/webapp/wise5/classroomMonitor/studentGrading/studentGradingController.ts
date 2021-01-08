'use strict';

import { AnnotationService } from '../../services/annotationService';
import { ConfigService } from '../../services/configService';
import { NotificationService } from '../../services/notificationService';
import { StudentStatusService } from '../../services/studentStatusService';
import { TeacherDataService } from '../../services/teacherDataService';
import * as angular from 'angular';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { Subscription } from 'rxjs';
import { Directive } from '@angular/core';

@Directive()
class StudentGradingController {
  $translate: any;
  isExpandAll: boolean;
  maxScore: any;
  nodeId: string;
  nodeIds: any;
  nodesById: any;
  nodesInViewById: any;
  nodeVisibilityById: any;
  sortOrder: object = {
    step: ['-isVisible', 'order'],
    '-step': ['-isVisible', '-order'],
    status: ['-isVisible', 'completionStatus', '-hasNewAlert', 'order'],
    '-status': ['-isVisible', '-completionStatus', '-hasNewAlert', 'order'],
    score: ['-isVisible', '-hasScore', '-hasMaxScore', 'scorePct', '-maxScore', 'score', 'order'],
    '-score': [
      '-isVisible',
      '-hasScore',
      '-hasMaxScore',
      '-scorePct',
      '-maxScore',
      'score',
      'order'
    ]
  };
  permissions: any;
  projectCompletion: any;
  showNonWorkNodes: any;
  sort: any;
  totalScore: number;
  workgroupId: number;
  annotationReceivedSubscription: Subscription;
  studentWorkReceivedSubscription: Subscription;
  currentWorkgroupChangedSubscription: Subscription;
  notificationChangedSubscription: Subscription;
  currentPeriodChangedSubscription: Subscription;
  projectSavedSubscription: Subscription;

  static $inject = [
    '$filter',
    '$mdMedia',
    '$scope',
    '$state',
    '$stateParams',
    'orderByFilter',
    'AnnotationService',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
  ];

  constructor(
    $filter: any,
    $mdMedia: any,
    private $scope: any,
    private $state: any,
    private $stateParams: any,
    private orderBy: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService,
    private StudentStatusService: StudentStatusService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$scope.$mdMedia = $mdMedia;
    this.$translate = $filter('translate');

    this.projectSavedSubscription = this.ProjectService.projectSaved$.subscribe(() => {
      this.maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(this.workgroupId);
      this.setNodesById();
    });

    this.notificationChangedSubscription = this.NotificationService.notificationChanged$.subscribe(
      (notification) => {
        if (notification.type === 'CRaterResult') {
          // TODO: expand to encompass other notification types that should be shown to teacher
          let workgroupId = notification.toWorkgroupId;
          let nodeId = notification.nodeId;
          if (workgroupId === this.workgroupId && this.nodesById[nodeId]) {
            this.updateNode(nodeId);
          }
        }
      }
    );

    this.annotationReceivedSubscription = this.AnnotationService.annotationReceived$.subscribe(
      ({ annotation }) => {
        const workgroupId = annotation.toWorkgroupId;
        const nodeId = annotation.nodeId;
        if (workgroupId === this.workgroupId && this.nodesById[nodeId]) {
          this.totalScore = this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
          this.updateNode(nodeId);
        }
      }
    );

    this.studentWorkReceivedSubscription = this.TeacherDataService.studentWorkReceived$.subscribe(
      (args: any) => {
        const studentWork = args.studentWork;
        if (studentWork != null) {
          let workgroupId = studentWork.workgroupId;
          let nodeId = studentWork.nodeId;
          if (workgroupId === this.workgroupId && this.nodesById[nodeId]) {
            this.updateNode(nodeId);
          }
        }
      }
    );

    this.currentWorkgroupChangedSubscription = this.TeacherDataService.currentWorkgroupChanged$.subscribe(
      ({ currentWorkgroup }) => {
        if (currentWorkgroup != null) {
          let workgroupId = currentWorkgroup.workgroupId;
          if (this.workgroupId !== workgroupId) {
            this.$state.go('root.cm.team', { workgroupId: workgroupId });
          }
        }
      }
    );

    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      ({ currentPeriod }) => {
        let periodId = currentPeriod.periodId;
        let currentWorkgroup = this.TeacherDataService.getCurrentWorkgroup();
        if (!currentWorkgroup) {
          let workgroups = angular.copy(this.ConfigService.getClassmateUserInfos());
          workgroups = this.orderBy(workgroups, 'workgroupId');
          let n = workgroups.length;
          for (let i = 0; i < n; i++) {
            let workgroup = workgroups[i];
            if (workgroup.periodId === periodId) {
              this.TeacherDataService.setCurrentWorkgroup(workgroup);
              break;
            }
          }
        }
      }
    );

    this.$scope.$on('$destroy', () => {
      this.TeacherDataService.setCurrentWorkgroup(null);
      this.ngOnDestroy();
    });

    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'studentGradingViewDisplayed',
      data = { workgroupId: this.workgroupId };
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

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.annotationReceivedSubscription.unsubscribe();
    this.currentPeriodChangedSubscription.unsubscribe();
    this.studentWorkReceivedSubscription.unsubscribe();
    this.currentWorkgroupChangedSubscription.unsubscribe();
    this.notificationChangedSubscription.unsubscribe();
    this.projectSavedSubscription.unsubscribe();
  }

  $onInit() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    this.sort = this.TeacherDataService.studentGradingSort;
    this.TeacherDataService.nodeGradingSort = this.sort;
    this.permissions = this.ConfigService.getPermissions();
    this.workgroupId = parseInt(this.$stateParams.workgroupId);
    let workgroup = this.ConfigService.getUserInfoByWorkgroupId(this.workgroupId);
    this.TeacherDataService.setCurrentWorkgroup(workgroup);
    let maxScore = this.StudentStatusService.getMaxScoreForWorkgroupId(this.workgroupId);
    this.maxScore = maxScore ? maxScore : 0;
    this.totalScore = this.TeacherDataService.getTotalScoreByWorkgroupId(this.workgroupId);
    this.projectCompletion = this.StudentStatusService.getStudentProjectCompletion(
      this.workgroupId,
      true
    );
    this.showNonWorkNodes = false;
    this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
    this.nodesById = {}; // object that will hold node names, statuses, scores, notifications, etc.
    this.nodeVisibilityById = {}; // object that specifies whether student work is visible for each node
    this.nodesInViewById = {}; // object that holds whether the node is in view or not
    this.setNodesById();
  }

  /**
   * Build the nodesById object; don't include group nodes
   */
  setNodesById() {
    let l = this.nodeIds.length;
    for (let i = 0; i < l; i++) {
      let id = this.nodeIds[i];
      let isApplicationNode = this.ProjectService.isApplicationNode(id);
      if (isApplicationNode) {
        let node = this.ProjectService.getNodeById(id);
        this.nodesById[id] = node;
        this.updateNode(id, true);
      }
    }
  }

  /**
   * Update statuses, scores, notifications, etc. for a node object
   * @param nodeID a node ID number
   * @param init Boolean whether we're in controller initialization or not
   */
  updateNode(nodeId, init = false) {
    let node = this.nodesById[nodeId];

    if (node) {
      let alertNotifications = this.getAlertNotificationsByNodeId(nodeId);
      node.hasAlert = alertNotifications.length > 0;
      node.hasNewAlert = this.nodeHasNewAlert(alertNotifications);
      let completionStatus = this.getNodeCompletionStatusByNodeId(nodeId);
      node.hasWork = this.ProjectService.nodeHasWork(nodeId);
      //node.hasNewWork = completionStatus.hasNewWork;
      node.isVisible = completionStatus.isVisible ? 1 : 0;
      node.completionStatus = this.getNodeCompletionStatus(completionStatus);
      node.score = this.getNodeScoreByNodeId(nodeId);
      node.hasScore = node.score > -1;
      node.maxScore = this.ProjectService.getMaxScoreForNode(nodeId);
      if (node.maxScore > 0) {
        node.hasMaxScore = true;
        node.scorePct = node.score > -1 ? +(node.score / node.maxScore).toFixed(2) : 0;
      } else {
        node.hasMaxScore = false;
        node.scorePct = 0;
      }
      node.order = this.ProjectService.getOrderById(nodeId);
      node.show = this.isNodeShown(nodeId);

      if (!init) {
        this.nodesById[nodeId] = angular.copy(node);
      }
    }
  }

  getAlertNotificationsByNodeId(nodeId) {
    const args = {
      nodeId: nodeId,
      toWorkgroupId: this.workgroupId
    };
    return this.NotificationService.getAlertNotifications(args);
  }

  nodeHasNewAlert(alertNotifications) {
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

  /**
   * Returns an object with node completion status, latest work time, and latest annotation time
   * for a workgroup for the current node
   * @param nodeId a node ID number
   * @returns Object with completion, latest work time, latest annotation time
   */
  getNodeCompletionStatusByNodeId(nodeId) {
    let isCompleted = false;
    let isVisible = false;

    // TODO: store this info in the nodeStatus so we don't have to calculate every time?
    let latestWorkTime = this.getLatestWorkTimeByNodeId(nodeId);

    let latestAnnotationTime = this.getLatestAnnotationTimeByNodeId(nodeId);
    let studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(this.workgroupId);
    if (studentStatus != null) {
      let nodeStatus = studentStatus.nodeStatuses[nodeId];
      if (nodeStatus) {
        isVisible = nodeStatus.isVisible;
        if (latestWorkTime) {
          // workgroup has at least one componentState for this node, so check if node is completed
          isCompleted = nodeStatus.isCompleted;
        }

        if (!this.ProjectService.nodeHasWork(nodeId)) {
          // the step does not generate any work so completion = visited
          isCompleted = nodeStatus.isVisited;
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

  /**
   * Returns a numerical status value for a given completion status object depending on node completion
   * Available status values are: 0 (not visited/no work; default), 1 (partially completed), 2 (completed)
   * @param completionStatus Object
   * @returns Integer status value
   */
  getNodeCompletionStatus(completionStatus) {
    let hasWork = completionStatus.latestWorkTime !== null;
    let isCompleted = completionStatus.isCompleted;
    let isVisible = completionStatus.isVisible;

    // TODO: store this info in the nodeStatus so we don't have to calculate every time (and can use more widely)?
    let status = 0; // default

    if (!isVisible) {
      status = -1;
    } else if (isCompleted) {
      status = 2;
    } else if (hasWork) {
      status = 1;
    }

    return status;
  }

  getLatestWorkTimeByNodeId(nodeId) {
    let time = null;
    let componentStates = this.TeacherDataService.getComponentStatesByNodeId(nodeId);
    let n = componentStates.length - 1;

    // loop through component states for this node, starting with most recent
    for (let i = n; i > -1; i--) {
      let componentState = componentStates[i];
      if (componentState.workgroupId === this.workgroupId) {
        // componentState is for given workgroupId
        time = componentState.serverSaveTime;
        break;
      }
    }

    return time;
  }

  getLatestAnnotationTimeByNodeId(nodeId) {
    let time = null;
    let annotations = this.TeacherDataService.getAnnotationsByNodeId(nodeId);
    let n = annotations.length - 1;

    // loop through annotations for this node, starting with most recent
    for (let i = n; i > -1; i--) {
      let annotation = annotations[i];
      // TODO: support checking for annotations from shared teachers
      if (
        annotation.toWorkgroupId === this.workgroupId &&
        annotation.fromWorkgroupId === this.ConfigService.getWorkgroupId()
      ) {
        time = annotation.serverSaveTime;
        break;
      }
    }

    return time;
  }

  /**
   * Returns the score for the current workgroup for a given nodeId
   * @param nodeId a node ID number
   * @returns Number score value (defaults to -1 if node has no score)
   */
  getNodeScoreByNodeId(nodeId) {
    let score = this.AnnotationService.getScore(this.workgroupId, nodeId);
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
    } else if (hasWork) {
      status = 1;
    }

    return status;
  }

  /**
   * Get the student data for a specific part
   * @param the componentId
   * @param the nodeId id of node we're looking for
   * @return the student data for the given component
   */
  getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId) {
    var componentState = null;

    if (nodeId != null && componentId != null) {
      // get the latest component state for the component
      componentState = this.TeacherDataService.getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(
        this.workgroupId,
        nodeId,
        componentId
      );
    }

    return componentState;
  }

  /**
   * Checks whether a node should be shown
   * @param nodeId the node Id to look for
   * @returns boolean whether the workgroup should be shown
   */
  isNodeShown(nodeId) {
    let show = false;
    let node = this.nodesById[nodeId];

    if (node.isVisible && (this.ProjectService.nodeHasWork(nodeId) || this.showNonWorkNodes)) {
      let currentStep = this.TeacherDataService.getCurrentStep();
      if (currentStep) {
        // there is a currently selected step, so check if this one matches
        if (currentStep.nodeId === parseInt(nodeId)) {
          show = true;
        }
      } else {
        // there is no currently selected step, so show this one
        show = true;
      }
    }

    return show;
  }

  /**
   * Gets and returns the total project score for the currently selected workgroup
   * @return score object or null
   */
  getCurrentWorkgroupScore() {
    return this.TeacherDataService.getTotalScoreByWorkgroupId(this.workgroupId);
  }

  setSort(value) {
    if (this.sort === value) {
      this.sort = `-${value}`;
    } else {
      this.sort = value;
    }

    // update value in the teacher data service so we can persist across view instances and workgroup changes
    this.TeacherDataService.studentGradingSort = this.sort;
  }

  getOrderBy() {
    return this.sortOrder[this.sort];
  }

  /**
   * Expand all nodes to show student work
   */
  expandAll() {
    // loop through all the workgroups
    for (let i = 0; i < this.nodeIds.length; i++) {
      // get a node id
      let id = this.nodeIds[i];

      // check if the node is currently in view
      if (this.nodesInViewById[id]) {
        // the node is currently in view so we will expand it
        this.nodeVisibilityById[id] = true;
      }
    }

    /*
     * set the boolean flag to denote that we are currently expanding
     * all the nodes
     */
    this.isExpandAll = true;
  }

  /**
   * Collapse all nodes to hide student work
   */
  collapseAll() {
    let n = this.nodeIds.length;

    for (let i = 0; i < n; i++) {
      let id = this.nodeIds[i];
      this.nodeVisibilityById[id] = false;
    }

    /*
     * set the boolean flag to denote that we are not currently expanding
     * all the nodes
     */
    this.isExpandAll = false;
  }

  onUpdateExpand(nodeId, value) {
    this.nodeVisibilityById[nodeId] = value;
  }

  /**
   * A node row has either come into view or gone out of view
   * @param nodeId the node id that has come into view or gone out
   * of view
   * @param inview whether the row is in view or not
   */
  stepInView(nodeId, inview) {
    // remember whether the node is in view or not
    this.nodesInViewById[nodeId] = inview;

    // if we're in expand all mode, expand node row if it's in view
    if (this.isExpandAll) {
      if (inview) {
        this.nodeVisibilityById[nodeId] = true;
      }
    }
  }
}

export default StudentGradingController;
