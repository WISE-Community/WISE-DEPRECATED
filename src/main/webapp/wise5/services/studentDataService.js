'use strict';

class StudentDataService {
  constructor(
    $filter,
    $http,
    $injector,
    $q,
    $rootScope,
    AnnotationService,
    ConfigService,
    PlanningService,
    ProjectService,
    UtilService
  ) {
    this.$filter = $filter;
    this.$http = $http;
    this.$injector = $injector;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.PlanningService = PlanningService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.currentNode = null;
    this.previousStep = null;
    this.studentData = {
      componentStates: [],
      events: [],
      annotations: []
    };
    this.stackHistory = []; // array of node id's
    this.visitedNodesHistory = [];
    this.nodeStatuses = {};
    this.runStatus = null;
    this.maxScore = null;

    this.maxPlanningNodeNumber = 0;

    /*
     * A counter to keep track of how many saveToServer requests we have
     * made that we haven't received a response for yet. When this value
     * goes back down to 0, we will send update the student status and then
     * save it to the server.
     */
    this.saveToServerRequestCount = 0;

    /*
     * A dummy student work id that is used in preview mode when we simulate
     * saving of student data.
     */
    this.dummyStudentWorkId = 1;

    this.$rootScope.$on('nodeStatusesChanged', (event, args) => {
      this.handleNodeStatusesChanged();
    });

    this.$rootScope.$on('newAnnotationReceived', (event, args) => {
      this.handleAnnotationReceived(args.annotation);
    });

    this.$rootScope.$on('notebookUpdated', (event, args) => {
      const mode = this.ConfigService.getMode();
      if (mode === 'student' || mode === 'preview') {
        this.updateNodeStatuses();
      }
    });
  }

  handleNodeStatusesChanged() {
    this.AnnotationService.calculateActiveGlobalAnnotationGroups();
    const globalAnnotationGroups = this.AnnotationService.getActiveGlobalAnnotationGroups();
    globalAnnotationGroups.map(globalAnnotationGroup => {
      const globalAnnotations = globalAnnotationGroup.annotations;
      globalAnnotations.map(globalAnnotation => {
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
      globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date());
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
      globalAnnotation.data.unGlobalizedTimestamp = Date.parse(new Date());
      this.saveAnnotations([globalAnnotation]);
    }
  }

  retrieveStudentData() {
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
      username: this.$translate('PREVIEW_STUDENT'),
      userId: '0'
    };
    this.AnnotationService.setAnnotations(this.studentData.annotations);
    this.populateHistories(this.studentData.events);
    this.updateNodeStatuses();
  }

  retrieveStudentDataForSignedInStudent() {
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getConfigParam('studentDataURL')
    };
    const params = {
      workgroupId: this.ConfigService.getWorkgroupId(),
      runId: this.ConfigService.getRunId(),
      getStudentWork: true,
      getEvents: true,
      getAnnotations: true,
      toWorkgroupId: this.ConfigService.getWorkgroupId()
    };
    httpParams.params = params;
    return this.$http(httpParams).then(result => {
      return this.handleStudentDataResponse(result);
    });
  }

  handleStudentDataResponse(result) {
    const resultData = result.data;
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
      const httpParams = this.getRunStatusRequestParams();
      return this.$http(httpParams).then(result => {
        this.runStatus = result.data;
      });
    }
  }

  getRunStatusRequestParams() {
    const runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
    const runId = this.ConfigService.getConfigParam('runId');
    return {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: runStatusURL,
      params: {
        runId: runId
      }
    };
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
    this.$rootScope.$broadcast('nodeStatusesChanged');
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
      group.depth = this.ProjectService.getNodeDepth(group.id);
    }
    groups.sort(function(a, b) {
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
    const nodeStatus = this.createNodeStatus(nodeId);
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
    return (
      action === 'makeThisNodeNotVisible' ||
      action === 'makeAllNodesAfterThisNotVisible' ||
      action === 'makeAllOtherNodesNotVisible'
    );
  }

  isVisitableConstraintAction(action) {
    return (
      action === 'makeThisNodeNotVisitable' ||
      action === 'makeAllNodesAfterThisNotVisitable' ||
      action === 'makeAllOtherNodesNotVisitable'
    );
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
      if (!previousIsCompletedValue && nodeStatus.isCompleted) {
        this.$rootScope.$broadcast('nodeCompleted', { nodeId: nodeId });
      }
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

  evaluateCriteria(criteria) {
    let result = false;
    const functionName = criteria.name;
    if (functionName == null) {
    } else if (functionName === 'branchPathTaken') {
      result = this.evaluateBranchPathTakenCriteria(criteria);
    } else if (functionName === 'isVisible') {
    } else if (functionName === 'isVisitable') {
    } else if (functionName === 'isVisited') {
      result = this.evaluateIsVisitedCriteria(criteria);
    } else if (functionName === 'isVisitedAfter') {
      result = this.evaluateIsVisitedAfterCriteria(criteria);
    } else if (functionName === 'isRevisedAfter') {
      result = this.evaluateIsRevisedAfterCriteria(criteria);
    } else if (functionName === 'isVisitedAndRevisedAfter') {
      result = this.evaluateIsVisitedAndRevisedAfterCriteria(criteria);
    } else if (functionName === 'isCompleted') {
      result = this.evaluateIsCompletedCriteria(criteria);
    } else if (functionName === 'isCorrect') {
      result = this.evaluateIsCorrectCriteria(criteria);
    } else if (functionName === 'choiceChosen') {
      result = this.evaluateChoiceChosenCriteria(criteria);
    } else if (functionName === 'score') {
      result = this.evaluateScoreCriteria(criteria);
    } else if (functionName === 'usedXSubmits') {
      result = this.evaluateUsedXSubmitsCriteria(criteria);
    } else if (functionName === 'wroteXNumberOfWords') {
      result = this.evaluateNumberOfWordsWrittenCriteria(criteria);
    } else if (functionName === 'addXNumberOfNotesOnThisStep') {
      result = this.evaluateAddXNumberOfNotesOnThisStepCriteria(criteria);
    } else if (functionName === 'fillXNumberOfRows') {
      result = this.evaluateFillXNumberOfRowsCriteria(criteria);
    }
    return result;
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
    const serviceName = 'MultipleChoiceService'; // Assume MC component.
    if (this.$injector.has(serviceName)) {
      const service = this.$injector.get(serviceName);
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
    const notebookService = this.$injector.get('NotebookService');
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
    const tableService = this.$injector.get('TableService');
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
      timestamp: Date.parse(new Date())
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
      this.$rootScope.$broadcast('notebookItemAnnotationReceived', { annotation: annotation });
    } else {
      this.$rootScope.$broadcast('annotationReceived', { annotation: annotation });
    }
  }

  saveComponentEvent(component, category, event, data) {
    if (component == null || category == null || event == null) {
      alert(
        this.$translate('STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_COMPONENT_CATEGORY_EVENT_ERROR')
      );
      return;
    }
    const context = 'Component';
    const nodeId = component.nodeId;
    const componentId = component.componentId;
    const componentType = component.componentType;
    if (nodeId == null || componentId == null || componentType == null) {
      alert(
        this.$translate(
          'STUDENT_DATA_SERVICE_SAVE_COMPONENT_EVENT_NODE_ID_COMPONENT_ID_COMPONENT_TYPE_ERROR'
        )
      );
      return;
    }
    this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
  }

  saveVLEEvent(nodeId, componentId, componentType, category, event, data) {
    if (category == null || event == null) {
      alert(this.$translate('STUDENT_DATA_SERVICE_SAVE_VLE_EVENT_CATEGORY_EVENT_ERROR'));
      return;
    }
    const context = 'VLE';
    this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
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
    const componentStates = null;
    const annotations = null;
    this.saveToServer(componentStates, events, annotations);
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
      clientSaveTime: Date.parse(new Date())
    };
  }

  saveAnnotations(annotations) {
    const componentStates = null;
    const events = null;
    this.saveToServer(componentStates, events, annotations);
  }

  saveToServer(componentStates, events, annotations) {
    if (componentStates == null) {
      componentStates = [];
    }
    if (events == null) {
      events = [];
    }
    if (annotations == null) {
      annotations = [];
    }
    this.saveToServerRequestCount += 1;
    const studentWorkList = this.prepareComponentStatesForSave(componentStates);
    this.prepareEventsForSave(events);
    this.prepareAnnotationsForSave(annotations);
    if (this.ConfigService.isPreview()) {
      return this.handlePreviewSaveToServer(studentWorkList, events, annotations);
    } else if (!this.ConfigService.isRunActive()) {
      return this.$q.defer().promise;
    } else {
      const httpParams = this.getSaveToServerHTTPParams(studentWorkList, events, annotations);
      return this.$http(httpParams).then(
        result => {
          this.handleSaveToServerSuccess(result.data);
        },
        result => {
          this.handleSaveToServerError(result);
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
    const deferred = this.$q.defer();
    deferred.resolve(savedStudentDataResponse);
    return deferred.promise;
  }

  getSaveToServerHTTPParams(studentWorkList, events, annotations) {
    const params = {
      projectId: this.ConfigService.getProjectId(),
      runId: this.ConfigService.getRunId(),
      workgroupId: this.ConfigService.getWorkgroupId(),
      studentWorkList: angular.toJson(studentWorkList),
      events: angular.toJson(events),
      annotations: angular.toJson(annotations)
    };
    const httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('studentDataURL'),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: $.param(params)
    };
    return httpParams;
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
          this.$rootScope.$broadcast('studentWorkSavedToServer', { studentWork: localStudentWork });
          break;
        }
      }
    }
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
    localObject.serverSaveTime = Date.parse(new Date());
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
          this.$rootScope.$broadcast('eventSavedToServer', { event: localEvent });
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
          this.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
          break;
        }
      }
    }
  }

  handleSaveToServerError() {
    this.saveToServerRequestCount -= 1;
  }

  saveStudentStatus() {
    if (!this.ConfigService.isPreview() && this.ConfigService.isRunActive()) {
      const studentStatusURL = this.ConfigService.getStudentStatusURL();
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
      const status = angular.toJson(studentStatusJSON);
      const studentStatusParams = {
        runId: runId,
        periodId: periodId,
        workgroupId: workgroupId,
        status: status
      };
      const httpParams = {
        method: 'POST',
        url: studentStatusURL,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: $.param(studentStatusParams)
      };
      return this.$http(httpParams).then(
        result => {
          return true;
        },
        result => {
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
    const componentStates = this.studentData.componentStates;
    for (const componentState of componentStates) {
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
    const componentStates = this.studentData.componentStates;
    for (const componentState of componentStates) {
      if (componentState.nodeId === nodeId) {
        componentStatesByNodeId.push(componentState);
      }
    }
    return componentStatesByNodeId;
  }

  getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
    const componentStatesByNodeIdAndComponentId = [];
    const componentStates = this.studentData.componentStates;
    for (const componentState of componentStates) {
      if (componentState.nodeId === nodeId && componentState.componentId === componentId) {
        componentStatesByNodeIdAndComponentId.push(componentState);
      }
    }
    return componentStatesByNodeIdAndComponentId;
  }

  getEvents() {
    if (this.studentData != null && this.studentData.events != null) {
      return this.studentData.events;
    } else {
      return [];
    }
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

  getNodeStatusByNodeId(nodeId) {
    return this.nodeStatuses[nodeId];
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
  isCompleted(nodeId, componentId) {
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
      const service = this.$injector.get(componentType + 'Service');
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

  getCurrentNode() {
    return this.currentNode;
  }

  getCurrentNodeId() {
    if (this.currentNode != null) {
      return this.currentNode.id;
    }
    return null;
  }

  setCurrentNodeByNodeId(nodeId) {
    const node = this.ProjectService.getNodeById(nodeId);
    this.setCurrentNode(node);
  }

  setCurrentNode(node) {
    const previousCurrentNode = this.currentNode;
    if (previousCurrentNode !== node) {
      if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)) {
        this.previousStep = previousCurrentNode;
      }
      this.currentNode = node;
      this.$rootScope.$broadcast('currentNodeChanged', {
        previousNode: previousCurrentNode,
        currentNode: this.currentNode
      });
    }
  }

  endCurrentNode() {
    const previousCurrentNode = this.currentNode;
    if (previousCurrentNode != null) {
      this.$rootScope.$broadcast('exitNode', { nodeToExit: previousCurrentNode });
    }
  }

  endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
    if (this.nodeStatuses[nodeId].isVisitable) {
      this.endCurrentNode();
      this.setCurrentNodeByNodeId(nodeId);
    } else {
      this.nodeClickLocked(nodeId);
    }
  }

  nodeClickLocked(nodeId) {
    this.$rootScope.$broadcast('nodeClickLocked', { nodeId: nodeId });
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
    if (nodeId != null) {
      const studentData = this.studentData;
      if (studentData) {
        const componentStates = this.getComponentStatesByNodeId(nodeId);
        return componentStates[componentStates.length - 1];
      }
    }
    return null;
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
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getConfigParam('studentDataURL'),
      params: {
        runId: this.ConfigService.getRunId(),
        nodeId: nodeId,
        componentId: componentId,
        getStudentWork: true,
        getEvents: false,
        getAnnotations: false,
        onlyGetLatest: true,
        periodId: periodId
      }
    };
    return this.$http(httpParams).then(result => {
      const resultData = result.data;
      if (resultData != null) {
        return resultData.studentWorkList;
      }
      return [];
    });
  }

  getClassmateScores(nodeId, componentId, periodId) {
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getConfigParam('studentDataURL'),
      params: {
        runId: this.ConfigService.getRunId(),
        nodeId: nodeId,
        componentId: componentId,
        getStudentWork: false,
        getEvents: false,
        getAnnotations: true,
        onlyGetLatest: false,
        periodId: periodId
      }
    };
    return this.$http(httpParams).then(result => {
      return result.data.annotations;
    });
  }

  getStudentWorkById(id) {
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getConfigParam('studentDataURL'),
      params: {
        runId: this.ConfigService.getRunId(),
        id: id,
        getStudentWork: true,
        getEvents: false,
        getAnnotations: false,
        onlyGetLatest: true
      }
    };
    return this.$http(httpParams).then(result => {
      const resultData = result.data;
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
}

StudentDataService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$q',
  '$rootScope',
  'AnnotationService',
  'ConfigService',
  'PlanningService',
  'ProjectService',
  'UtilService'
];

export default StudentDataService;
