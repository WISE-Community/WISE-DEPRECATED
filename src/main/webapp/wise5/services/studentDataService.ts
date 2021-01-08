'use strict';

import { Injectable } from '@angular/core';
import { ConfigService } from './configService';
import { AnnotationService } from './annotationService';
import { ProjectService } from './projectService';
import { UtilService } from './utilService';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as angular from 'angular';
import { TagService } from './tagService';
import { DataService } from '../../site/src/app/services/data.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StudentDataService extends DataService {
  dummyStudentWorkId: number = 1;
  maxScore: any = null;
  nodeStatuses: any = {};
  previousStep = null;
  runStatus: any = null;
  saveToServerRequestCount: number = 0;
  stackHistory = []; // array of node id's
  studentData: any = {
    componentStates: [],
    events: [],
    annotations: []
  };
  visitedNodesHistory = [];
  criteriaFunctionNameToFunction = {
    branchPathTaken: (criteria) => {
      return this.evaluateBranchPathTakenCriteria(criteria);
    },
    isVisible: (criteria) => {
      return this.evaluateIsVisibleCriteria(criteria);
    },
    isVisitable: (criteria) => {
      return this.evaluateIsVisitableCriteria(criteria);
    },
    isVisited: (criteria) => {
      return this.evaluateIsVisitedCriteria(criteria);
    },
    isVisitedAfter: (criteria) => {
      return this.evaluateIsVisitedAfterCriteria(criteria);
    },
    isRevisedAfter: (criteria) => {
      return this.evaluateIsRevisedAfterCriteria(criteria);
    },
    isVisitedAndRevisedAfter: (criteria) => {
      return this.evaluateIsVisitedAndRevisedAfterCriteria(criteria);
    },
    isCompleted: (criteria) => {
      return this.evaluateIsCompletedCriteria(criteria);
    },
    isCorrect: (criteria) => {
      return this.evaluateIsCorrectCriteria(criteria);
    },
    choiceChosen: (criteria) => {
      return this.evaluateChoiceChosenCriteria(criteria);
    },
    score: (criteria) => {
      return this.evaluateScoreCriteria(criteria);
    },
    teacherRemoval: (criteria) => {
      return this.evaluateTeacherRemovalCriteria(criteria);
    },
    usedXSubmits: (criteria) => {
      return this.evaluateUsedXSubmitsCriteria(criteria);
    },
    wroteXNumberOfWords: (criteria) => {
      return this.evaluateNumberOfWordsWrittenCriteria(criteria);
    },
    addXNumberOfNotesOnThisStep: (criteria) => {
      return this.evaluateAddXNumberOfNotesOnThisStepCriteria(criteria);
    },
    fillXNumberOfRows: (criteria) => {
      return this.evaluateFillXNumberOfRowsCriteria(criteria);
    },
    hasTag: (criteria) => {
      return this.evaluateHasTagCriteria(criteria);
    }
  };

  $q: any;
  $translate: any;
  private deleteKeyPressedSource: Subject<any> = new Subject<any>();
  public deleteKeyPressed$: Observable<any> = this.deleteKeyPressedSource.asObservable();
  private nodeClickLockedSource: Subject<any> = new Subject<any>();
  public nodeClickLocked$: Observable<any> = this.nodeClickLockedSource.asObservable();
  private componentDirtySource: Subject<boolean> = new Subject<boolean>();
  public componentDirty$: Observable<any> = this.componentDirtySource.asObservable();
  private componentSaveTriggeredSource: Subject<boolean> = new Subject<boolean>();
  public componentSaveTriggered$: Observable<any> = this.componentSaveTriggeredSource.asObservable();
  private componentSubmitDirtySource: Subject<boolean> = new Subject<boolean>();
  public componentSubmitDirty$: Observable<any> = this.componentSubmitDirtySource.asObservable();
  private componentSubmitTriggeredSource: Subject<boolean> = new Subject<boolean>();
  public componentSubmitTriggered$: Observable<any> = this.componentSubmitTriggeredSource.asObservable();
  private notebookItemAnnotationReceivedSource: Subject<boolean> = new Subject<boolean>();
  public notebookItemAnnotationReceived$ = this.notebookItemAnnotationReceivedSource.asObservable();
  private pauseScreenSource: Subject<boolean> = new Subject<boolean>();
  public pauseScreen$: Observable<any> = this.pauseScreenSource.asObservable();
  private componentStudentDataSource: Subject<any> = new Subject<any>();
  public componentStudentData$: Observable<any> = this.componentStudentDataSource.asObservable();
  private studentWorkSavedToServerSource: Subject<any> = new Subject<any>();
  public studentWorkSavedToServer$: Observable<any> = this.studentWorkSavedToServerSource.asObservable();
  private navItemIsExpandedSource: Subject<any> = new Subject<any>();
  public navItemIsExpanded$: Observable<any> = this.navItemIsExpandedSource.asObservable();
  private nodeStatusesChangedSource: Subject<any> = new Subject<any>();
  public nodeStatusesChanged$: Observable<any> = this.nodeStatusesChangedSource.asObservable();

  constructor(
    upgrade: UpgradeModule,
    public http: HttpClient,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    ProjectService: ProjectService,
    private TagService: TagService,
    private UtilService: UtilService
  ) {
    super(upgrade, ProjectService);
  }

  pauseScreen(doPause: boolean) {
    this.pauseScreenSource.next(doPause);
  }

  broadcastComponentStudentData(componentStudentData: any) {
    this.componentStudentDataSource.next(componentStudentData);
  }

  handleNodeStatusesChanged() {
    this.AnnotationService.calculateActiveGlobalAnnotationGroups();
    const globalAnnotationGroups = this.AnnotationService.getActiveGlobalAnnotationGroups();
    globalAnnotationGroups.map((globalAnnotationGroup) => {
      const globalAnnotations = globalAnnotationGroup.annotations;
      globalAnnotations.map((globalAnnotation) => {
        if (globalAnnotation.data != null && globalAnnotation.data.isGlobal) {
          this.processGlobalAnnotation(globalAnnotation);
        }
      });
    });
  }

  processGlobalAnnotation(globalAnnotation) {
    const unGlobalizeConditional = globalAnnotation.data.unGlobalizeConditional;
    if (unGlobalizeConditional === 'any') {
      this.processGlobalAnnotationAnyConditional(globalAnnotation);
    } else if (unGlobalizeConditional === 'all') {
      this.processGlobalAnnotationAllConditional(globalAnnotation);
    }
  }

  processGlobalAnnotationAnyConditional(globalAnnotation) {
    let anySatified = false;
    const unGlobalizeCriteriaArray = globalAnnotation.data.unGlobalizeCriteria;
    for (const unGlobalizeCriteria of unGlobalizeCriteriaArray) {
      const unGlobalizeCriteriaResult = this.evaluateCriteria(unGlobalizeCriteria);
      anySatified = anySatified || unGlobalizeCriteriaResult;
    }
    if (anySatified) {
      globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date().toString());
      this.saveAnnotations([globalAnnotation]);
    }
  }

  processGlobalAnnotationAllConditional(globalAnnotation) {
    let allSatisfied = true;
    const unGlobalizeCriteriaArray = globalAnnotation.data.unGlobalizeCriteria;
    for (const unGlobalizeCriteria of unGlobalizeCriteriaArray) {
      const unGlobalizeCriteriaResult = this.evaluateCriteria(unGlobalizeCriteria);
      allSatisfied = allSatisfied && unGlobalizeCriteriaResult;
    }
    if (allSatisfied) {
      globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date().toString());
      this.saveAnnotations([globalAnnotation]);
    }
  }

  retrieveStudentData() {
    this.nodeStatuses = {};
    if (this.ConfigService.isPreview()) {
      this.retrieveStudentDataForPreview();
    } else {
      return this.retrieveStudentDataForSignedInStudent();
    }
  }

  retrieveStudentDataForPreview() {
    this.studentData = {
      componentStates: [],
      events: [],
      annotations: [],
      username: this.upgrade.$injector.get('$filter')('translate')('PREVIEW_STUDENT'),
      userId: '0'
    };
    this.AnnotationService.setAnnotations(this.studentData.annotations);
    this.populateHistories(this.studentData.events);
    this.updateNodeStatuses();
  }

  retrieveStudentDataForSignedInStudent() {
    const params = new HttpParams()
      .set('runId', this.ConfigService.getRunId())
      .set('workgroupId', this.ConfigService.getWorkgroupId() + '')
      .set('getStudentWork', true + '')
      .set('getEvents', true + '')
      .set('getAnnotations', true + '')
      .set('toWorkgroupId', this.ConfigService.getWorkgroupId());
    const options = {
      params: params
    };
    return this.http
      .get(this.ConfigService.getConfigParam('studentDataURL'), options)
      .toPromise()
      .then((resultData) => {
        return this.handleStudentDataResponse(resultData);
      });
  }

  handleStudentDataResponse(resultData) {
    this.studentData = {
      componentStates: []
    };
    const studentWorkList = resultData.studentWorkList;
    for (const studentWork of studentWorkList) {
      if (studentWork.componentId != null) {
        this.studentData.componentStates.push(studentWork);
      }
    }
    this.studentData.events = resultData.events;
    this.studentData.annotations = resultData.annotations;
    this.AnnotationService.setAnnotations(this.studentData.annotations);
    this.populateHistories(this.studentData.events);
    this.updateNodeStatuses();
    return this.studentData;
  }

  retrieveRunStatus() {
    if (this.ConfigService.isPreview()) {
      this.runStatus = {};
    } else {
      const params = new HttpParams().set('runId', this.ConfigService.getConfigParam('runId'));
      const options = {
        params: params
      };
      return this.http
        .get(this.ConfigService.getConfigParam('runStatusURL'), options)
        .toPromise()
        .then((runStatus: any) => {
          this.runStatus = runStatus;
        });
    }
  }

  getNodeStatuses() {
    return this.nodeStatuses;
  }

  setNodeStatusByNodeId(nodeId, nodeStatus) {
    this.nodeStatuses[nodeId] = nodeStatus;
  }

  getNodeStatusByNodeId(nodeId) {
    return this.nodeStatuses[nodeId];
  }

  updateNodeStatuses() {
    this.updateStepNodeStatuses();
    this.updateGroupNodeStatuses();
    this.maxScore = this.getMaxScore();
    this.handleNodeStatusesChanged();
    this.broadcastNodeStatusesChanged();
  }

  broadcastNodeStatusesChanged() {
    this.nodeStatusesChangedSource.next();
  }

  updateStepNodeStatuses() {
    const nodes = this.ProjectService.getNodes();
    for (const node of nodes) {
      if (!this.ProjectService.isGroupNode(node.id)) {
        this.updateNodeStatusByNode(node);
      }
    }
  }

  updateGroupNodeStatuses() {
    const groups = this.ProjectService.getGroups();
    for (const group of groups) {
      group.depth = this.ProjectService.getNodeDepth(group.id, 0);
    }
    groups.sort(function (a, b) {
      return b.depth - a.depth;
    });
    for (const group of groups) {
      this.updateNodeStatusByNode(group);
    }
  }

  updateNodeStatusByNode(node) {
    const nodeId = node.id;
    const nodeStatus = this.calculateNodeStatus(node);
    this.updateNodeStatus(nodeId, nodeStatus);
    this.updateNodeStatusProgress(nodeId);
    this.updateNodeStatusIcon(nodeId);
    this.updateNodeStatusTimestamps(nodeId);
  }

  calculateNodeStatus(node) {
    const nodeId = node.id;
    const nodeStatus: any = this.createNodeStatus(nodeId);
    const constraintsForNode = this.getConstraintsThatAffectNode(node);
    const constraintResults = this.evaluateConstraints(constraintsForNode);
    nodeStatus.isVisible = constraintResults.isVisible;
    nodeStatus.isVisitable = constraintResults.isVisitable;
    this.setNotVisibleIfRequired(nodeId, constraintsForNode, nodeStatus);
    nodeStatus.isCompleted = this.isCompleted(nodeId);
    nodeStatus.isVisited = this.isNodeVisited(nodeId);
    return nodeStatus;
  }

  createNodeStatus(nodeId) {
    return {
      nodeId: nodeId,
      isVisible: true,
      isVisitable: true,
      isCompleted: true
    };
  }

  getConstraintsThatAffectNode(node) {
    if (!this.ConfigService.getConfigParam('constraints')) {
      // constraints have been disabled which is allowed in preview mode
      return [];
    } else {
      return this.ProjectService.getConstraintsThatAffectNode(node);
    }
  }

  evaluateConstraints(constraintsForNode) {
    let isVisible = true;
    let isVisitable = true;
    for (const constraintForNode of constraintsForNode) {
      const tempResult = this.evaluateConstraint(constraintForNode);
      const action = constraintForNode.action;
      if (this.isVisibleConstraintAction(action)) {
        isVisible = isVisible && tempResult;
      } else if (this.isVisitableConstraintAction(action)) {
        isVisitable = isVisitable && tempResult;
      }
    }
    return { isVisible: isVisible, isVisitable: isVisitable };
  }

  setNotVisibleIfRequired(nodeId, constraintsForNode, nodeStatus) {
    if (
      constraintsForNode.length == 0 &&
      this.ProjectService.getFlattenedProjectAsNodeIds().indexOf(nodeId) == -1 &&
      !this.ProjectService.isGroupNode(nodeId)
    ) {
      nodeStatus.isVisible = false;
    }
  }

  isVisibleConstraintAction(action) {
    return [
      'makeThisNodeNotVisible',
      'makeAllNodesAfterThisNotVisible',
      'makeAllOtherNodesNotVisible'
    ].includes(action);
  }

  isVisitableConstraintAction(action) {
    return [
      'makeThisNodeNotVisitable',
      'makeAllNodesAfterThisNotVisitable',
      'makeAllOtherNodesNotVisitable'
    ].includes(action);
  }

  updateNodeStatus(nodeId, nodeStatus) {
    const oldNodeStatus = this.getNodeStatusByNodeId(nodeId);
    if (oldNodeStatus == null) {
      this.setNodeStatusByNodeId(nodeId, nodeStatus);
    } else {
      const previousIsCompletedValue = this.nodeStatuses[nodeId].isCompleted;
      this.nodeStatuses[nodeId].isVisited = nodeStatus.isVisited;
      this.nodeStatuses[nodeId].isVisible = nodeStatus.isVisible;
      this.nodeStatuses[nodeId].isVisitable = nodeStatus.isVisitable;
      this.nodeStatuses[nodeId].isCompleted = nodeStatus.isCompleted;
    }
  }

  updateNodeStatusProgress(nodeId) {
    this.nodeStatuses[nodeId].progress = this.getNodeProgressById(nodeId);
  }

  updateNodeStatusIcon(nodeId) {
    this.nodeStatuses[nodeId].icon = this.ProjectService.getNodeIconByNodeId(nodeId);
  }

  updateNodeStatusTimestamps(nodeId) {
    const latestComponentStatesForNode = this.getLatestComponentStateByNodeId(nodeId);
    if (latestComponentStatesForNode != null) {
      this.updateNodeStatusClientSaveTime(nodeId, latestComponentStatesForNode);
      this.updateNodeStatusServerSaveTime(nodeId, latestComponentStatesForNode);
    }
  }

  updateNodeStatusClientSaveTime(nodeId, latestComponentStatesForNode) {
    this.nodeStatuses[nodeId].latestComponentStateClientSaveTime =
      latestComponentStatesForNode.clientSaveTime;
  }

  updateNodeStatusServerSaveTime(nodeId, latestComponentStatesForNode) {
    this.nodeStatuses[nodeId].latestComponentStateServerSaveTime =
      latestComponentStatesForNode.serverSaveTime;
  }

  evaluateConstraint(constraintForNode) {
    return this.evaluateNodeConstraint(constraintForNode);
  }

  evaluateNodeConstraint(constraintForNode) {
    const removalCriteria = constraintForNode.removalCriteria;
    const removalConditional = constraintForNode.removalConditional;
    if (removalCriteria == null) {
      return true;
    } else {
      return this.evaluateMultipleRemovalCriteria(removalCriteria, removalConditional);
    }
  }

  evaluateMultipleRemovalCriteria(multipleRemovalCriteria, removalConditional) {
    let result = false;
    for (let c = 0; c < multipleRemovalCriteria.length; c++) {
      const singleCriteriaResult = this.evaluateCriteria(multipleRemovalCriteria[c]);
      if (c === 0) {
        result = singleCriteriaResult;
      } else {
        if (removalConditional === 'any') {
          result = result || singleCriteriaResult;
        } else {
          result = result && singleCriteriaResult;
        }
      }
    }
    return result;
  }

  evaluateCriterias(criterias): boolean {
    for (const criteria of criterias) {
      if (!this.evaluateCriteria(criteria)) {
        return false;
      }
    }
    return true;
  }

  evaluateCriteria(criteria: any): boolean {
    const criteriaFunction = this.criteriaFunctionNameToFunction[criteria.name];
    if (criteriaFunction == null) {
      return true;
    }
    return criteriaFunction(criteria);
  }

  evaluateIsCompletedCriteria(criteria) {
    return this.isCompleted(criteria.params.nodeId);
  }

  evaluateIsCorrectCriteria(criteria) {
    const componentStates = this.getComponentStatesByNodeIdAndComponentId(
      criteria.params.nodeId,
      criteria.params.componentId
    );
    for (const componentState of componentStates) {
      if (componentState.studentData.isCorrect) {
        return true;
      }
    }
    return false;
  }

  evaluateBranchPathTakenCriteria(criteria) {
    const expectedFromNodeId = criteria.params.fromNodeId;
    const expectedToNodeId = criteria.params.toNodeId;
    const branchPathTakenEvents = this.getBranchPathTakenEventsByNodeId(expectedFromNodeId);
    for (const branchPathTakenEvent of branchPathTakenEvents) {
      const data = branchPathTakenEvent.data;
      if (criteria.params.fromNodeId === data.fromNodeId && expectedToNodeId === data.toNodeId) {
        return true;
      }
    }
    return false;
  }

  evaluateIsVisibleCriteria(criteria) {
    const nodeStatus = this.getNodeStatusByNodeId(criteria.params.nodeId);
    return nodeStatus.isVisible;
  }

  evaluateIsVisitableCriteria(criteria) {
    const nodeStatus = this.getNodeStatusByNodeId(criteria.params.nodeId);
    return nodeStatus.isVisitable;
  }

  evaluateIsVisitedCriteria(criteria) {
    const events = this.getEvents();
    for (const event of events) {
      if (event.nodeId === criteria.params.nodeId && event.event === 'nodeEntered') {
        return true;
      }
    }
    return false;
  }

  evaluateIsVisitedAfterCriteria(criteria) {
    const isVisitedAfterNodeId = criteria.params.isVisitedAfterNodeId;
    const criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;
    const events = this.getEvents();
    for (const event of events) {
      if (
        event.nodeId === isVisitedAfterNodeId &&
        event.event === 'nodeEntered' &&
        event.clientSaveTime > criteriaCreatedTimestamp
      ) {
        return true;
      }
    }
    return false;
  }

  evaluateIsRevisedAfterCriteria(criteria) {
    const isRevisedAfterNodeId = criteria.params.isRevisedAfterNodeId;
    const isRevisedAfterComponentId = criteria.params.isRevisedAfterComponentId;
    const criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;
    const latestComponentStateForComponent = this.getLatestComponentStateByNodeIdAndComponentId(
      isRevisedAfterNodeId,
      isRevisedAfterComponentId
    );
    return (
      latestComponentStateForComponent != null &&
      latestComponentStateForComponent.clientSaveTime > criteriaCreatedTimestamp
    );
  }

  evaluateIsVisitedAndRevisedAfterCriteria(criteria) {
    const isVisitedAfterNodeId = criteria.params.isVisitedAfterNodeId;
    const isRevisedAfterNodeId = criteria.params.isRevisedAfterNodeId;
    const isRevisedAfterComponentId = criteria.params.isRevisedAfterComponentId;
    const criteriaCreatedTimestamp = criteria.params.criteriaCreatedTimestamp;
    const events = this.getEvents();
    for (const event of events) {
      if (
        this.isVisitedAndRevisedAfter(
          isVisitedAfterNodeId,
          isRevisedAfterNodeId,
          isRevisedAfterComponentId,
          event,
          criteriaCreatedTimestamp
        )
      ) {
        return true;
      }
    }
    return false;
  }

  isVisitedAndRevisedAfter(visitNodeId, reviseNodeId, reviseComponentId, event, timestamp) {
    return (
      this.isNodeVisitedAfterTimestamp(event, visitNodeId, timestamp) &&
      this.hasWorkCreatedAfterTimestamp(reviseNodeId, reviseComponentId, event.clientSaveTime)
    );
  }

  isNodeVisitedAfterTimestamp(event, nodeId, timestamp) {
    return (
      event.nodeId == nodeId && event.event === 'nodeEntered' && event.clientSaveTime > timestamp
    );
  }

  hasWorkCreatedAfterTimestamp(nodeId, componentId, timestamp) {
    const componentState = this.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
    return componentState != null && componentState.clientSaveTime > timestamp;
  }

  getBranchPathTakenEventsByNodeId(fromNodeId) {
    const branchPathTakenEvents = [];
    for (const event of this.studentData.events) {
      if (fromNodeId === event.nodeId && 'branchPathTaken' === event.event) {
        branchPathTakenEvents.push(event);
      }
    }
    return branchPathTakenEvents;
  }

  evaluateChoiceChosenCriteria(criteria) {
    const serviceName = 'MultipleChoiceService';
    if (this.upgrade.$injector.has(serviceName)) {
      const service = this.upgrade.$injector.get(serviceName);
      return service.choiceChosen(criteria);
    }
    return false;
  }

  evaluateScoreCriteria(criteria) {
    const params = criteria.params;
    const nodeId = params.nodeId;
    const componentId = params.componentId;
    const scores = params.scores;
    const workgroupId = this.ConfigService.getWorkgroupId();
    const scoreType = 'any';
    const latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(
      nodeId,
      componentId,
      workgroupId,
      scoreType
    );
    if (latestScoreAnnotation != null) {
      const scoreValue = this.AnnotationService.getScoreValueFromScoreAnnotation(
        latestScoreAnnotation
      );
      if (this.isScoreInExpectedScores(scores, scoreValue)) {
        return true;
      }
    }
    return false;
  }

  evaluateTeacherRemovalCriteria(criteria: any) {
    return criteria.params.periodId !== this.ConfigService.getPeriodId();
  }

  isScoreInExpectedScores(expectedScores, score) {
    return (
      expectedScores.indexOf(score) != -1 ||
      (score != null && expectedScores.indexOf(score.toString()) != -1)
    );
  }

  evaluateUsedXSubmitsCriteria(criteria) {
    const params = criteria.params;
    return this.getSubmitCount(params.nodeId, params.componentId) >= params.requiredSubmitCount;
  }

  getSubmitCount(nodeId, componentId) {
    // counter for manually counting the component states with isSubmit=true
    let manualSubmitCounter = 0;

    // counter for remembering the highest submitCounter value found in studentData objects
    let highestSubmitCounter = 0;

    /*
     * We are counting with two submit counters for backwards compatibility.
     * Some componentStates only have isSubmit=true and do not keep an
     * updated submitCounter for the number of submits.
     */
    const componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);
    for (const componentState of componentStates) {
      if (componentState.isSubmit) {
        manualSubmitCounter++;
      }
      const studentData = componentState.studentData;
      if (studentData.submitCounter > highestSubmitCounter) {
        highestSubmitCounter = studentData.submitCounter;
      }
    }
    return Math.max(manualSubmitCounter, highestSubmitCounter);
  }

  evaluateNumberOfWordsWrittenCriteria(criteria) {
    const params = criteria.params;
    const nodeId = params.nodeId;
    const componentId = params.componentId;
    const requiredNumberOfWords = params.requiredNumberOfWords;
    const componentState = this.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
    if (componentState != null) {
      const studentData = componentState.studentData;
      const response = studentData.response;
      const numberOfWords = this.UtilService.wordCount(response);
      if (numberOfWords >= requiredNumberOfWords) {
        return true;
      }
    }
    return false;
  }

  evaluateAddXNumberOfNotesOnThisStepCriteria(criteria) {
    const params = criteria.params;
    const nodeId = params.nodeId;
    const requiredNumberOfNotes = params.requiredNumberOfNotes;
    const notebookService = this.upgrade.$injector.get('NotebookService');
    try {
      const notebook = notebookService.getNotebookByWorkgroup();
      const notebookItemsByNodeId = this.getNotebookItemsByNodeId(notebook, nodeId);
      return notebookItemsByNodeId.length >= requiredNumberOfNotes;
    } catch (e) {}
    return false;
  }

  evaluateFillXNumberOfRowsCriteria(criteria) {
    const params = criteria.params;
    const nodeId = params.nodeId;
    const componentId = params.componentId;
    const requiredNumberOfFilledRows = params.requiredNumberOfFilledRows;
    const tableHasHeaderRow = params.tableHasHeaderRow;
    const requireAllCellsInARowToBeFilled = params.requireAllCellsInARowToBeFilled;
    const tableService = this.upgrade.$injector.get('TableService');
    const componentState = this.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
    return (
      componentState != null &&
      tableService.hasRequiredNumberOfFilledRows(
        componentState,
        requiredNumberOfFilledRows,
        tableHasHeaderRow,
        requireAllCellsInARowToBeFilled
      )
    );
  }

  evaluateHasTagCriteria(criteria) {
    return this.TagService.hasTagName(criteria.params.tag);
  }

  getNotebookItemsByNodeId(notebook, nodeId) {
    const notebookItemsByNodeId = [];
    for (const notebookItem of notebook.allItems) {
      if (notebookItem.nodeId === nodeId) {
        notebookItemsByNodeId.push(notebookItem);
      }
    }
    return notebookItemsByNodeId;
  }

  populateHistories(events) {
    this.stackHistory = [];
    this.visitedNodesHistory = [];
    for (const event of events) {
      if (event.event === 'nodeEntered') {
        this.updateStackHistory(event.nodeId);
        this.updateVisitedNodesHistory(event.nodeId);
      }
    }
  }

  getStackHistoryAtIndex(index) {
    if (index < 0) {
      index = this.stackHistory.length + index;
    }
    if (this.stackHistory.length > 0) {
      return this.stackHistory[index];
    }
    return null;
  }

  getStackHistory() {
    return this.stackHistory;
  }

  updateStackHistory(nodeId) {
    const indexOfNodeId = this.stackHistory.indexOf(nodeId);
    if (indexOfNodeId === -1) {
      this.stackHistory.push(nodeId);
    } else {
      this.stackHistory.splice(indexOfNodeId + 1, this.stackHistory.length);
    }
  }

  updateVisitedNodesHistory(nodeId) {
    const indexOfNodeId = this.visitedNodesHistory.indexOf(nodeId);
    if (indexOfNodeId === -1) {
      this.visitedNodesHistory.push(nodeId);
    }
  }

  getVisitedNodesHistory() {
    return this.visitedNodesHistory;
  }

  isNodeVisited(nodeId) {
    const visitedNodesHistory = this.visitedNodesHistory;
    const indexOfNodeId = visitedNodesHistory.indexOf(nodeId);
    return indexOfNodeId !== -1;
  }

  createComponentState() {
    return {
      timestamp: Date.parse(new Date().toString())
    };
  }

  addComponentState(componentState) {
    this.studentData.componentStates.push(componentState);
  }

  addEvent(event) {
    this.studentData.events.push(event);
  }

  addAnnotation(annotation) {
    this.studentData.annotations.push(annotation);
  }

  handleAnnotationReceived(annotation) {
    this.studentData.annotations.push(annotation);
    if (annotation.notebookItemId) {
      this.broadcastNotebookItemAnnotationReceived({ annotation: annotation });
    } else {
      this.AnnotationService.broadcastAnnotationReceived({ annotation: annotation });
    }
  }

  broadcastNotebookItemAnnotationReceived(args: any) {
    this.notebookItemAnnotationReceivedSource.next(args);
  }

  saveComponentEvent(component, category, event, data) {
    if (component == null || category == null || event == null) {
      alert(
        this.upgrade.$injector.get('$filter')('translate')(
          'STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_COMPONENT_CATEGORY_EVENT_ERROR'
        )
      );
      return;
    }
    const context = 'Component';
    const nodeId = component.nodeId;
    const componentId = component.componentId;
    const componentType = component.componentType;
    if (nodeId == null || componentId == null || componentType == null) {
      alert(
        this.upgrade.$injector.get('$filter')('translate')(
          'STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_NODE_ID_COMPONENT_ID_COMPONENT_TYPE_ERROR'
        )
      );
      return;
    }
    this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
  }

  saveVLEEvent(nodeId, componentId, componentType, category, event, data) {
    if (category == null || event == null) {
      alert(
        this.upgrade.$injector.get('$filter')('translate')(
          'STUDENT_DATA_SERVICE_SAVE_VLE_EVENT_CATEGORY_EVENT_ERROR'
        )
      );
      return;
    }
    const context = 'VLE';
    return this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
  }

  saveEvent(context, nodeId, componentId, componentType, category, event, data) {
    const events = [];
    const newEvent = this.createNewEvent(
      nodeId,
      componentId,
      context,
      componentType,
      category,
      event,
      data
    );
    events.push(newEvent);
    const componentStates = undefined;
    const annotations = undefined;
    return this.saveToServer(componentStates, events, annotations);
  }

  createNewEvent(nodeId, componentId, context, componentType, category, event, data) {
    return {
      nodeId: nodeId,
      componentId: componentId,
      context: context,
      type: componentType,
      category: category,
      event: event,
      data: data,
      projectId: this.ConfigService.getProjectId(),
      runId: this.ConfigService.getRunId(),
      periodId: this.ConfigService.getPeriodId(),
      workgroupId: this.ConfigService.getWorkgroupId(),
      clientSaveTime: Date.parse(new Date().toString())
    };
  }

  saveAnnotations(annotations) {
    const componentStates = undefined;
    const events = undefined;
    this.saveToServer(componentStates, events, annotations);
  }

  saveToServer(componentStates = [], events = [], annotations = []) {
    this.saveToServerRequestCount += 1;
    const studentWorkList = this.prepareComponentStatesForSave(componentStates);
    this.prepareEventsForSave(events);
    this.prepareAnnotationsForSave(annotations);
    if (this.ConfigService.isPreview()) {
      return this.handlePreviewSaveToServer(studentWorkList, events, annotations);
    } else if (!this.ConfigService.isRunActive()) {
      return this.upgrade.$injector.get('$q').defer().promise;
    } else {
      const params = {
        projectId: this.ConfigService.getProjectId(),
        runId: this.ConfigService.getRunId(),
        workgroupId: this.ConfigService.getWorkgroupId(),
        studentWorkList: angular.toJson(studentWorkList),
        events: angular.toJson(events),
        annotations: angular.toJson(annotations)
      };
      return this.http
        .post(this.ConfigService.getConfigParam('studentDataURL'), params)
        .toPromise()
        .then(
          (resultData: any) => {
            return this.handleSaveToServerSuccess(resultData);
          },
          (resultData: any) => {
            return this.handleSaveToServerError();
          }
        );
    }
  }

  prepareComponentStatesForSave(componentStates) {
    const studentWorkList = [];
    for (const componentState of componentStates) {
      componentState.requestToken = this.UtilService.generateKey();
      this.addComponentState(componentState);
      studentWorkList.push(componentState);
    }
    return studentWorkList;
  }

  prepareEventsForSave(events) {
    for (const event of events) {
      event.requestToken = this.UtilService.generateKey();
      this.addEvent(event);
    }
  }

  prepareAnnotationsForSave(annotations) {
    for (const annotation of annotations) {
      annotation.requestToken = this.UtilService.generateKey();
      if (annotation.id == null) {
        this.addAnnotation(annotation);
      }
    }
  }

  handlePreviewSaveToServer(studentWorkList, events, annotations) {
    const savedStudentDataResponse = {
      studentWorkList: studentWorkList,
      events: events,
      annotations: annotations
    };
    this.handleSaveToServerSuccess(savedStudentDataResponse);
    const deferred = this.upgrade.$injector.get('$q').defer();
    deferred.resolve(savedStudentDataResponse);
    return deferred.promise;
  }

  handleSaveToServerSuccess(savedStudentDataResponse) {
    if (savedStudentDataResponse.studentWorkList) {
      this.processSavedStudentWorkList(savedStudentDataResponse.studentWorkList);
    }
    if (savedStudentDataResponse.events) {
      this.processSavedEvents(savedStudentDataResponse.events);
    }
    if (savedStudentDataResponse.annotations) {
      this.processSavedAnnotations(savedStudentDataResponse.annotations);
    }
    this.saveToServerRequestCount -= 1;
    if (this.saveToServerRequestCount == 0) {
      /*
       * we have received the reponse to all of the saveToServer requests
       * so we will now update the student status and save it to the
       * server
       */
      this.updateNodeStatuses();
      this.saveStudentStatus();
    }
    const deferred = this.upgrade.$injector.get('$q').defer();
    deferred.resolve(savedStudentDataResponse);
    return deferred.promise;
  }

  processSavedStudentWorkList(savedStudentWorkList) {
    const localStudentWorkList = this.studentData.componentStates;
    for (const savedStudentWork of savedStudentWorkList) {
      for (let l = localStudentWorkList.length - 1; l >= 0; l--) {
        const localStudentWork = localStudentWorkList[l];
        if (this.isMatchingRequestToken(localStudentWork, savedStudentWork)) {
          if (this.ConfigService.isPreview()) {
            this.setDummyIdIntoLocalId(localStudentWork);
            this.setDummyServerSaveTimeIntoLocalServerSaveTime(localStudentWork);
          } else {
            this.setRemoteIdIntoLocalId(savedStudentWork, localStudentWork);
            this.setRemoteServerSaveTimeIntoLocalServerSaveTime(savedStudentWork, localStudentWork);
          }
          this.clearRequestToken(localStudentWork);
          this.broadcastStudentWorkSavedToServer({ studentWork: localStudentWork });
          break;
        }
      }
    }
  }

  broadcastStudentWorkSavedToServer(args: any) {
    this.studentWorkSavedToServerSource.next(args);
  }

  isMatchingRequestToken(localObj, remoteObj) {
    return localObj.requestToken != null && localObj.requestToken === remoteObj.requestToken;
  }

  setRemoteIdIntoLocalId(remoteObject, localObject) {
    localObject.id = remoteObject.id;
  }

  setDummyIdIntoLocalId(localObject) {
    localObject.id = this.dummyStudentWorkId;
    this.dummyStudentWorkId++;
  }

  setRemoteServerSaveTimeIntoLocalServerSaveTime(remoteObject, localObject) {
    localObject.serverSaveTime = remoteObject.serverSaveTime;
  }

  setDummyServerSaveTimeIntoLocalServerSaveTime(localObject) {
    localObject.serverSaveTime = Date.parse(new Date().toString());
  }

  clearRequestToken(obj) {
    obj.requestToken = null;
  }

  processSavedEvents(savedEvents) {
    const localEvents = this.studentData.events;
    for (const savedEvent of savedEvents) {
      for (let l = localEvents.length - 1; l >= 0; l--) {
        const localEvent = localEvents[l];
        if (this.isMatchingRequestToken(localEvent, savedEvent)) {
          this.setRemoteIdIntoLocalId(savedEvent, localEvent);
          this.setRemoteServerSaveTimeIntoLocalServerSaveTime(savedEvent, localEvent);
          this.clearRequestToken(localEvent);
          break;
        }
      }
    }
  }

  processSavedAnnotations(savedAnnotations) {
    const localAnnotations = this.studentData.annotations;
    for (const savedAnnotation of savedAnnotations) {
      for (let l = localAnnotations.length - 1; l >= 0; l--) {
        const localAnnotation = localAnnotations[l];
        if (this.isMatchingRequestToken(localAnnotation, savedAnnotation)) {
          this.setRemoteIdIntoLocalId(savedAnnotation, localAnnotation);
          this.setRemoteServerSaveTimeIntoLocalServerSaveTime(savedAnnotation, localAnnotation);
          this.clearRequestToken(localAnnotation);
          this.AnnotationService.broadcastAnnotationSavedToServer({ annotation: localAnnotation });
          break;
        }
      }
    }
  }

  handleSaveToServerError() {
    this.saveToServerRequestCount -= 1;
    const deferred = this.upgrade.$injector.get('$q').defer();
    deferred.resolve();
    return deferred.promise;
  }

  saveStudentStatus() {
    if (!this.ConfigService.isPreview() && this.ConfigService.isRunActive()) {
      const runId = this.ConfigService.getRunId();
      const periodId = this.ConfigService.getPeriodId();
      const workgroupId = this.ConfigService.getWorkgroupId();
      const currentNodeId = this.getCurrentNodeId();
      const nodeStatuses = this.getNodeStatuses();
      const projectCompletion = this.getProjectCompletion();
      const studentStatusJSON = {
        runId: runId,
        periodId: periodId,
        workgroupId: workgroupId,
        currentNodeId: currentNodeId,
        nodeStatuses: nodeStatuses,
        projectCompletion: projectCompletion
      };
      const studentStatusParams = {
        runId: runId,
        periodId: periodId,
        workgroupId: workgroupId,
        status: angular.toJson(studentStatusJSON)
      };
      return this.http
        .post(this.ConfigService.getStudentStatusURL(), studentStatusParams)
        .toPromise()
        .then(
          (result) => {
            return true;
          },
          (result) => {
            return false;
          }
        );
    }
  }

  getLatestComponentState() {
    const componentStates = this.studentData.componentStates;
    if (componentStates.length > 0) {
      return componentStates[componentStates.length - 1];
    }
    return null;
  }

  isComponentSubmitDirty() {
    const latestComponentState = this.getLatestComponentState();
    if (latestComponentState && !latestComponentState.isSubmit) {
      return true;
    }
    return false;
  }

  /**
   * Get the latest component state for the given node id and component id.
   * @param nodeId the node id
   * @param componentId the component id (optional)
   * @return the latest component state with the matching node id and component id or null if none
   * are found
   */
  getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId = null) {
    const componentStates = this.studentData.componentStates;
    for (let c = componentStates.length - 1; c >= 0; c--) {
      const componentState = componentStates[c];
      if (componentId == null && componentState.nodeId === nodeId) {
        return componentState;
      } else if (componentState.nodeId === nodeId && componentState.componentId === componentId) {
        return componentState;
      }
    }
    return null;
  }

  getLatestSubmitComponentState(nodeId, componentId) {
    const componentStates = this.studentData.componentStates;
    for (let c = componentStates.length - 1; c >= 0; c--) {
      const componentState = componentStates[c];
      if (
        componentState.nodeId === nodeId &&
        componentState.componentId === componentId &&
        componentState.isSubmit
      ) {
        return componentState;
      }
    }
    return null;
  }

  getStudentWorkByStudentWorkId(studentWorkId) {
    for (const componentState of this.studentData.componentStates) {
      if (componentState.id === studentWorkId) {
        return componentState;
      }
    }
    return null;
  }

  getComponentStates() {
    return this.studentData.componentStates;
  }

  getComponentStatesByNodeId(nodeId) {
    const componentStatesByNodeId = [];
    for (const componentState of this.studentData.componentStates) {
      if (componentState.nodeId === nodeId) {
        componentStatesByNodeId.push(componentState);
      }
    }
    return componentStatesByNodeId;
  }

  getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
    const componentStatesByNodeIdAndComponentId = [];
    for (const componentState of this.studentData.componentStates) {
      if (componentState.nodeId === nodeId && componentState.componentId === componentId) {
        componentStatesByNodeIdAndComponentId.push(componentState);
      }
    }
    return componentStatesByNodeIdAndComponentId;
  }

  getEvents() {
    return this.studentData.events;
  }

  getEventsByNodeId(nodeId) {
    const eventsByNodeId = [];
    const events = this.studentData.events;
    for (const event of events) {
      if (event.nodeId === nodeId) {
        eventsByNodeId.push(event);
      }
    }
    return eventsByNodeId;
  }

  getEventsByNodeIdAndComponentId(nodeId, componentId) {
    const eventsByNodeId = [];
    const events = this.studentData.events;
    for (const event of events) {
      if (event.nodeId === nodeId && event.componentId === componentId) {
        eventsByNodeId.push(event);
      }
    }
    return eventsByNodeId;
  }

  /**
   * Get the node id of the latest node entered event for an active node that
   * exists in the project. We need to check if the node exists in the project
   * in case the node has been deleted from the project. We also need to check
   * that the node is active in case the node has been moved to the inactive
   * section of the project.
   * @return the node id of the latest node entered event for an active node
   * that exists in the project
   */
  getLatestNodeEnteredEventNodeIdWithExistingNode() {
    const events = this.studentData.events;
    for (let e = events.length - 1; e >= 0; e--) {
      const event = events[e];
      if (event.event == 'nodeEntered' && this.isNodeExistAndActive(event.nodeId)) {
        return event.nodeId;
      }
    }
    return null;
  }

  isNodeExistAndActive(nodeId) {
    return this.ProjectService.getNodeById(nodeId) != null && this.ProjectService.isActive(nodeId);
  }

  canVisitNode(nodeId) {
    const nodeStatus = this.getNodeStatusByNodeId(nodeId);
    if (nodeStatus != null && nodeStatus.isVisitable) {
      return true;
    }
    return false;
  }

  /**
   * Get progress information for a given node
   * @param nodeId the node id
   * @returns object with number of completed items (both all and for items that capture student
   * work), number of visible items (all/with work), completion % (for all items, items with student
   * work)
   */
  getNodeProgressById(nodeId) {
    const progress = {
      totalItems: 0,
      totalItemsWithWork: 0,
      completedItems: 0,
      completedItemsWithWork: 0
    };
    if (this.ProjectService.isGroupNode(nodeId)) {
      for (const childNodeId of this.ProjectService.getChildNodeIdsById(nodeId)) {
        const nodeStatus = this.nodeStatuses[childNodeId];
        if (this.ProjectService.isGroupNode(childNodeId)) {
          this.updateGroupNodeProgress(childNodeId, progress, nodeStatus);
        } else {
          this.updateStepNodeProgress(childNodeId, progress, nodeStatus);
        }
      }
      this.calculateAndInjectCompletionPercentage(progress);
      this.calculateAndInjectCompletionPercentageWithWork(progress);
    }
    // TODO: implement for steps (using components instead of child nodes)?
    return progress;
  }

  updateGroupNodeProgress(nodeId, progress, nodeStatus) {
    if (nodeStatus.progress.totalItemsWithWork > -1) {
      progress.completedItems += nodeStatus.progress.completedItems;
      progress.totalItems += nodeStatus.progress.totalItems;
      progress.completedItemsWithWork += nodeStatus.progress.completedItemsWithWork;
      progress.totalItemsWithWork += nodeStatus.progress.totalItemsWithWork;
    } else {
      // we have a legacy node status so we'll need to calculate manually
      const groupProgress = this.getNodeProgressById(nodeId);
      progress.completedItems += groupProgress.completedItems;
      progress.totalItems += groupProgress.totalItems;
      progress.completedItemsWithWork += groupProgress.completedItemsWithWork;
      progress.totalItemsWithWork += groupProgress.totalItemsWithWork;
    }
    return progress;
  }

  updateStepNodeProgress(nodeId, progress, nodeStatus) {
    if (nodeStatus.isVisible) {
      progress.totalItems++;
      const hasWork = this.ProjectService.nodeHasWork(nodeId);
      if (hasWork) {
        progress.totalItemsWithWork++;
      }
      if (nodeStatus.isCompleted) {
        progress.completedItems++;
        if (hasWork) {
          progress.completedItemsWithWork++;
        }
      }
    }
    return progress;
  }

  calculateAndInjectCompletionPercentage(progress) {
    const totalItems = progress.totalItems;
    const completedItems = progress.completedItems;
    progress.completionPct = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  }

  calculateAndInjectCompletionPercentageWithWork(progress) {
    const totalItemsWithWork = progress.totalItemsWithWork;
    const completedItemsWithWork = progress.completedItemsWithWork;
    progress.completionPctWithWork = totalItemsWithWork
      ? Math.round((completedItemsWithWork / totalItemsWithWork) * 100)
      : 0;
  }

  /**
   * Check if the given node or component is completed
   * @param nodeId the node id
   * @param componentId (optional) the component id
   * @returns whether the node or component is completed
   */
  isCompleted(nodeId, componentId = null) {
    let result = false;
    if (nodeId && componentId) {
      result = this.isComponentCompleted(nodeId, componentId);
    } else if (this.ProjectService.isGroupNode(nodeId)) {
      result = this.isGroupNodeCompleted(nodeId);
    } else if (this.ProjectService.isApplicationNode(nodeId)) {
      result = this.isStepNodeCompleted(nodeId);
    }
    return result;
  }

  isComponentCompleted(nodeId, componentId) {
    const componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);
    const componentEvents = this.getEventsByNodeIdAndComponentId(nodeId, componentId);
    const nodeEvents = this.getEventsByNodeId(nodeId);
    const node = this.ProjectService.getNodeById(nodeId);
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      const componentType = component.type;
      const service = this.upgrade.$injector.get(componentType + 'Service');
      return service.isCompleted(component, componentStates, componentEvents, nodeEvents, node);
    }
    return false;
  }

  isStepNodeCompleted(nodeId) {
    let result = true;
    const components = this.ProjectService.getComponentsByNodeId(nodeId);
    for (const component of components) {
      const isComponentCompleted = this.isComponentCompleted(nodeId, component.id);
      result = result && isComponentCompleted;
    }
    return result;
  }

  isGroupNodeCompleted(nodeId) {
    let result = true;
    const nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);
    for (const id of nodeIds) {
      if (
        this.nodeStatuses[id] == null ||
        !this.nodeStatuses[id].isVisible ||
        !this.nodeStatuses[id].isCompleted
      ) {
        result = false;
        break;
      }
    }
    return result;
  }

  endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
    if (this.nodeStatuses[nodeId].isVisitable) {
      this.setCurrentNodeByNodeId(nodeId);
    } else {
      this.nodeClickLocked(nodeId);
    }
  }

  nodeClickLocked(nodeId) {
    this.broadcastNodeClickLocked({ nodeId: nodeId });
  }

  broadcastNodeClickLocked(args: any) {
    this.nodeClickLockedSource.next(args);
  }

  getTotalScore() {
    const annotations = this.studentData.annotations;
    const workgroupId = this.ConfigService.getWorkgroupId();
    return this.AnnotationService.getTotalScore(annotations, workgroupId);
  }

  getProjectCompletion() {
    const nodeId = 'group0';
    return this.getNodeProgressById(nodeId);
  }

  getRunStatus() {
    return this.runStatus;
  }

  getAnnotations() {
    return this.studentData.annotations;
  }

  getLatestComponentStatesByNodeId(nodeId) {
    const latestComponentStates = [];
    const node = this.ProjectService.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (const component of components) {
          const componentId = component.id;
          let componentState = this.getLatestComponentStateByNodeIdAndComponentId(
            nodeId,
            componentId
          );
          if (componentState == null) {
            /*
             * there is no component state for the component so we will create an object that just
             * contains the node id and component id
             */
            componentState = {};
            componentState.nodeId = nodeId;
            componentState.componentId = componentId;
          }
          latestComponentStates.push(componentState);
        }
      }
    }
    return latestComponentStates;
  }

  getLatestComponentStateByNodeId(nodeId) {
    const componentStates = this.getComponentStatesByNodeId(nodeId);
    if (componentStates.length > 0) {
      return componentStates[componentStates.length - 1];
    } else {
      return null;
    }
  }

  isCompletionCriteriaSatisfied(completionCriteria) {
    let result = true;
    if (completionCriteria.inOrder) {
      result = this.isInOrderCompletionCriteriaSatisfied(completionCriteria);
    }
    return result;
  }

  isInOrderCompletionCriteriaSatisfied(completionCriteria) {
    let result = true;
    let tempTimestamp = 0;
    for (const completionCriterion of completionCriteria.criteria) {
      const functionName = completionCriterion.name;
      if (functionName == 'isSubmitted') {
        const tempComponentState = this.getComponentStateSubmittedAfter(
          completionCriterion.nodeId,
          completionCriterion.componentId,
          tempTimestamp
        );
        if (tempComponentState == null) {
          return false;
        } else {
          tempTimestamp = tempComponentState.serverSaveTime;
        }
      } else if (functionName == 'isSaved') {
        const tempComponentState = this.getComponentStateSavedAfter(
          completionCriterion.nodeId,
          completionCriterion.componentId,
          tempTimestamp
        );
        if (tempComponentState == null) {
          return false;
        } else {
          tempTimestamp = tempComponentState.serverSaveTime;
        }
      } else if (functionName == 'isVisited') {
        const tempEvent = this.getVisitEventAfter(completionCriterion.nodeId, tempTimestamp);
        if (tempEvent == null) {
          return false;
        } else {
          tempTimestamp = tempEvent.serverSaveTime;
        }
      }
    }
    return result;
  }

  getComponentStateSavedAfter(nodeId, componentId, timestamp) {
    for (const componentState of this.studentData.componentStates) {
      if (
        componentState.nodeId === nodeId &&
        componentState.componentId === componentId &&
        componentState.serverSaveTime > timestamp
      ) {
        return componentState;
      }
    }
    return null;
  }

  getComponentStateSubmittedAfter(nodeId, componentId, timestamp) {
    for (const componentState of this.studentData.componentStates) {
      if (
        componentState.nodeId === nodeId &&
        componentState.componentId === componentId &&
        componentState.serverSaveTime > timestamp &&
        componentState.isSubmit
      ) {
        return componentState;
      }
    }
    return null;
  }

  getVisitEventAfter(nodeId, timestamp) {
    for (const tempEvent of this.studentData.events) {
      if (
        tempEvent.nodeId === nodeId &&
        tempEvent.serverSaveTime > timestamp &&
        tempEvent.event === 'nodeEntered'
      ) {
        return tempEvent;
      }
    }
    return null;
  }

  getClassmateStudentWork(nodeId, componentId, periodId) {
    let params = new HttpParams()
      .set('runId', this.ConfigService.getRunId())
      .set('nodeId', nodeId + '')
      .set('componentId', componentId + '')
      .set('getStudentWork', true + '')
      .set('getEvents', false + '')
      .set('getAnnotations', false + '')
      .set('onlyGetLatest', true + '');
    if (periodId != null) {
      params = params.set('periodId', periodId);
    }
    const options = {
      params: params
    };
    return this.http
      .get(this.ConfigService.getConfigParam('studentDataURL'), options)
      .toPromise()
      .then((resultData: any) => {
        return resultData.studentWorkList;
      });
  }

  getClassmateScores(nodeId, componentId, periodId) {
    let params = new HttpParams()
      .set('runId', this.ConfigService.getRunId())
      .set('nodeId', nodeId + '')
      .set('componentId', componentId + '')
      .set('getStudentWork', false + '')
      .set('getEvents', false + '')
      .set('getAnnotations', true + '')
      .set('onlyGetLatest', false + '');
    if (periodId != null) {
      params = params.set('periodId', periodId);
    }
    const options = {
      params: params
    };
    return this.http
      .get(this.ConfigService.getConfigParam('studentDataURL'), options)
      .toPromise()
      .then((resultData: any) => {
        return resultData.annotations;
      });
  }

  getStudentWorkById(id) {
    const params = new HttpParams()
      .set('runId', this.ConfigService.getRunId())
      .set('id', id + '')
      .set('getStudentWork', true + '')
      .set('getEvents', false + '')
      .set('getAnnotations', false + '')
      .set('onlyGetLatest', true + '');
    const options = {
      params: params
    };
    return this.http
      .get(this.ConfigService.getConfigParam('studentDataURL'), options)
      .toPromise()
      .then((resultData: any) => {
        if (resultData != null && resultData.studentWorkList.length > 0) {
          return resultData.studentWorkList[0];
        }
        return null;
      });
  }

  /**
   * Get the max possible score for the project
   * @returns the sum of the max scores for all the nodes in the project visible
   * to the current workgroup or null if none of the visible components has max scores.
   */
  getMaxScore() {
    let maxScore = null;
    for (const property in this.nodeStatuses) {
      if (this.nodeStatuses.hasOwnProperty(property)) {
        const nodeStatus = this.nodeStatuses[property];
        const nodeId = nodeStatus.nodeId;
        if (nodeStatus.isVisible && !this.ProjectService.isGroupNode(nodeId)) {
          const nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);
          if (nodeMaxScore) {
            if (maxScore == null) {
              maxScore = 0;
            }
            maxScore += nodeMaxScore;
          }
        }
      }
    }
    return maxScore;
  }

  broadcastComponentDirty(args: any) {
    this.componentDirtySource.next(args);
  }
  broadcastComponentSaveTriggered(args: any) {
    this.componentSaveTriggeredSource.next(args);
  }
  broadcastComponentSubmitDirty(args: any) {
    this.componentSubmitDirtySource.next(args);
  }
  broadcastComponentSubmitTriggered(args: any) {
    this.componentSubmitTriggeredSource.next(args);
  }
  broadcastDeleteKeyPressed() {
    this.deleteKeyPressedSource.next();
  }
  setNavItemExpanded(nodeId: string, isExpanded: boolean) {
    this.navItemIsExpandedSource.next({ nodeId: nodeId, isExpanded: isExpanded });
  }
}
