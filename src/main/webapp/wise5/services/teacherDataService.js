'use strict';

class TeacherDataService {
  constructor(
    $http,
    $filter,
    $q,
    $rootScope,
    AnnotationService,
    ConfigService,
    NotificationService,
    ProjectService,
    TeacherWebSocketService,
    UtilService
  ) {
    this.$http = $http;
    this.$filter = $filter;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NotificationService = NotificationService;
    this.ProjectService = ProjectService;
    this.TeacherWebSocketService = TeacherWebSocketService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');

    this.studentData = {
      componentStatesByWorkgroupId: {},
      componentStatesByNodeId: {},
      componentStatesByComponentId: {}
    };

    this.currentPeriod = null;
    this.currentWorkgroup = null;
    this.currentStep = null;
    this.currentNode = null;
    this.previousStep = null;
    this.runStatus = null;
    this.periods = [];
    this.nodeGradingSort = 'team';
    this.studentGradingSort = 'step';
    this.studentProgressSort = 'team';

    this.$rootScope.$on('annotationSavedToServer', (event, args) => {
      this.handleAnnotationReceived(args.annotation);
    });

    this.$rootScope.$on('newAnnotationReceived', (event, args) => {
      this.handleAnnotationReceived(args.annotation);
    });

    this.$rootScope.$on('newStudentWorkReceived', (event, args) => {
      const studentWork = args.studentWork;
      this.addOrUpdateComponentState(studentWork);
      this.$rootScope.$broadcast('studentWorkReceived', { studentWork: studentWork });
    });
  }

  handleAnnotationReceived(annotation) {
    this.studentData.annotations.push(annotation);
    const toWorkgroupId = annotation.toWorkgroupId;
    if (this.studentData.annotationsToWorkgroupId[toWorkgroupId] == null) {
      this.studentData.annotationsToWorkgroupId[toWorkgroupId] = new Array();
    }
    this.studentData.annotationsToWorkgroupId[toWorkgroupId].push(annotation);
    const nodeId = annotation.nodeId;
    if (this.studentData.annotationsByNodeId[nodeId] == null) {
      this.studentData.annotationsByNodeId[nodeId] = new Array();
    }
    this.studentData.annotationsByNodeId[nodeId].push(annotation);
    this.AnnotationService.setAnnotations(this.studentData.annotations);
    this.$rootScope.$broadcast('annotationReceived', { annotation: annotation });
  }

  /**
   * Get the data for the export and generate the csv file that will be downloaded
   * @param exportType the type of export
   */
  getExport(exportType, selectedNodes = []) {
    if (this.isStudentWorkExport(exportType)) {
      return this.retrieveStudentDataExport(selectedNodes);
    } else if (this.isNotebookExport(exportType)) {
      return this.retrieveNotebookExport(exportType);
    } else if (this.isNotificationsExport(exportType)) {
      return this.retrieveNotificationsExport();
    } else if (this.isExportStudentAssets(exportType)) {
      return this.retrieveStudentAssetsExport();
    } else if (this.isExportOneWorkgroupPerRow(exportType)) {
      return this.retrieveOneWorkgroupPerRowExport(selectedNodes);
    } else if (this.isExportRawData(exportType)) {
      return this.retrieveRawDataExport(selectedNodes);
    }
  }

  getExportURL(runId, exportType) {
    return this.ConfigService.getConfigParam('runDataExportURL') + `/${runId}/${exportType}`;
  }

  isStudentWorkExport(exportType) {
    return exportType === 'allStudentWork' || exportType === 'latestStudentWork';
  }

  isEventExport(exportType) {
    return exportType === 'events';
  }

  isNotebookExport(exportType) {
    return exportType === 'latestNotebookItems' || exportType === 'allNotebookItems';
  }

  isNotificationsExport(exportType) {
    return exportType === 'notifications';
  }

  isExportStudentAssets(exportType) {
    return exportType === 'studentAssets';
  }

  isExportOneWorkgroupPerRow(exportType) {
    return exportType === 'oneWorkgroupPerRow';
  }

  isExportRawData(exportType) {
    return exportType === 'rawData';
  }

  retrieveStudentDataExport(selectedNodes) {
    const params = {
      runId: this.ConfigService.getRunId(),
      getStudentWork: true,
      getAnnotations: true,
      getEvents: false,
      components: selectedNodes
    };
    return this.retrieveStudentData(params);
  }

  retrieveEventsExport(includeStudentEvents, includeTeacherEvents, includeNames) {
    const params = {
      runId: this.ConfigService.getRunId(),
      getStudentWork: false,
      getAnnotations: false,
      getEvents: true,
      includeStudentEvents,
      includeTeacherEvents,
      includeNames
    };
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getConfigParam('runDataExportURL') + '/events',
      params: params
    };
    return this.$http(httpParams).then(result => {
      return this.handleStudentDataResponse(result.data);
    });
  }

  retrieveNotebookExport(exportType) {
    return this.$http.get(`/teacher/notebook/run/${this.ConfigService.getRunId()}`,
        {params:{exportType:exportType}}).then(result => {
      return result.data;
    });
  }

  retrieveNotificationsExport() {
    const httpParams = {
      method: 'GET',
      url: this.getExportURL(this.ConfigService.getRunId(), 'notifications'),
      params: {}
    };
    return this.$http(httpParams).then(result => {
      return result.data;
    });
  }

  retrieveOneWorkgroupPerRowExport(selectedNodes) {
    const params = {
      runId: this.ConfigService.getRunId(),
      getStudentWork: true,
      getAnnotations: true,
      getEvents: true,
      components: selectedNodes
    };
    return this.retrieveStudentData(params);
  }

  retrieveStudentAssetsExport() {
    window.location.href = this.getExportURL(this.ConfigService.getRunId(), 'studentAssets');
    const deferred = this.$q.defer();
    const promise = deferred.promise;
    deferred.resolve([]);
    return promise;
  }

  retrieveRawDataExport(selectedNodes) {
    const params = {
      runId: this.ConfigService.getRunId(),
      getStudentWork: true,
      getAnnotations: true,
      getEvents: true,
      components: selectedNodes
    };
    return this.retrieveStudentData(params);
  }

  saveEvent(context, nodeId, componentId, componentType, category, event, data, projectId) {
    const newEvent = {
      projectId: this.ConfigService.getProjectId(),
      runId: this.ConfigService.getRunId(),
      workgroupId: this.ConfigService.getWorkgroupId(),
      clientSaveTime: Date.parse(new Date()),
      context: context,
      nodeId: nodeId,
      componentId: componentId,
      type: componentType,
      category: category,
      event: event,
      data: data
    };
    if (newEvent.projectId == null) {
      newEvent.projectId = projectId;
    }
    const events = [newEvent];
    const params = {
      projectId: this.ConfigService.getProjectId(),
      runId: this.ConfigService.getRunId(),
      workgroupId: this.ConfigService.getWorkgroupId(),
      events: angular.toJson(events)
    };
    if (params.projectId == null) {
      params.projectId = projectId;
    }
    const httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('teacherDataURL'),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: $.param(params)
    };
    return this.$http(httpParams).then(result => {
      return result.data.events;
    });
  }

  retrieveStudentDataByNodeId(nodeId) {
    const params = {
      periodId: null,
      workgroupId: null,
      components: this.getAllRelatedComponents(nodeId),
      getAnnotations: false,
      getEvents: false
    };
    return this.retrieveStudentData(params);
  }

  getAllRelatedComponents(nodeId) {
    const components = this.ProjectService.getNodeIdsAndComponentIds(nodeId);
    return components.concat(this.getConnectedComponentsIfNecessary(components));
  }

  getConnectedComponentsIfNecessary(components) {
    const connectedComponents = [];
    for (const component of components) {
      const componentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
        component.nodeId,
        component.componentId
      );
      if (this.isConnectedComponentStudentDataRequired(componentContent)) {
        for (const connectedComponent of componentContent.connectedComponents) {
          connectedComponents.push(connectedComponent);
        }
      }
    }
    return connectedComponents;
  }

  isConnectedComponentStudentDataRequired(componentContent) {
    return (
      componentContent.type === 'Discussion' &&
      componentContent.connectedComponents != null &&
      componentContent.connectedComponents.length !== 0
    );
  }

  retrieveStudentDataByWorkgroupId(workgroupId) {
    const params = {
      periodId: null,
      nodeId: null,
      workgroupId: workgroupId,
      toWorkgroupId: workgroupId,
      getAnnotations: false
    };
    return this.retrieveStudentData(params);
  }

  retrieveAnnotations() {
    const params = {
      periodId: null,
      nodeId: null,
      workgroupId: null,
      toWorkgroupId: null,
      getStudentWork: false,
      getEvents: false,
      getAnnotations: true
    };
    return this.retrieveStudentData(params);
  }

  retrieveLatestStudentDataByNodeIdAndComponentIdAndPeriodId(nodeId, componentId, periodId) {
    const params = {
      runId: this.ConfigService.getRunId(),
      nodeId: nodeId,
      componentId: componentId,
      periodId: periodId,
      getStudentWork: true,
      getEvents: false,
      getAnnotations: false,
      onlyGetLatest: true
    };
    return this.retrieveStudentData(params).then(result => {
      return result.studentWorkList;
    });
  }

  retrieveStudentData(params) {
    this.addDefaultsToRetrieveStudentDataParams(params);
    const httpParams = {
      method: 'GET',
      url: this.ConfigService.getConfigParam('teacherDataURL'),
      params: params
    };
    return this.$http(httpParams).then(result => {
      return this.handleStudentDataResponse(result.data);
    });
  }

  addDefaultsToRetrieveStudentDataParams(params) {
    params.runId = this.ConfigService.getRunId();
    if (params.getStudentWork == null) {
      params.getStudentWork = true;
    }
    if (params.getEvents == null) {
      params.getEvents = false;
    }
    if (params.getAnnotations == null) {
      params.getAnnotations = true;
    }
  }

  handleStudentDataResponse(resultData) {
    const { studentWorkList: componentStates, events, annotations } = resultData;
    if (componentStates != null) {
      this.processComponentStates(componentStates);
    }
    if (events != null) {
      this.processEvents(events);
    }
    if (annotations != null) {
      this.processAnnotations(annotations);
    }
    return resultData;
  }

  processComponentStates(componentStates) {
    for (const componentState of componentStates) {
      this.addOrUpdateComponentState(componentState);
    }
  }

  processEvents(events) {
    events.sort(this.UtilService.sortByServerSaveTime);
    this.studentData.allEvents = events;
    this.initializeEventsDataStructures();
    for (const event of events) {
      this.addEventToEventsByWorkgroupId(event);
      this.addEventToEventsByNodeId(event);
    }
  }

  initializeEventsDataStructures() {
    this.studentData.eventsByWorkgroupId = {};
    this.studentData.eventsByNodeId = {};
  }

  addEventToEventsByWorkgroupId(event) {
    const eventWorkgroupId = event.workgroupId;
    if (this.studentData.eventsByWorkgroupId[eventWorkgroupId] == null) {
      this.studentData.eventsByWorkgroupId[eventWorkgroupId] = new Array();
    }
    this.studentData.eventsByWorkgroupId[eventWorkgroupId].push(event);
  }

  addEventToEventsByNodeId(event) {
    const eventNodeId = event.nodeId;
    if (this.studentData.eventsByNodeId[eventNodeId] == null) {
      this.studentData.eventsByNodeId[eventNodeId] = new Array();
    }
    this.studentData.eventsByNodeId[eventNodeId].push(event);
  }

  processAnnotations(annotations) {
    this.studentData.annotations = annotations;
    this.initializeAnnotationsDataStructures();
    for (const annotation of annotations) {
      this.addAnnotationToAnnotationsToWorkgroupId(annotation);
      this.addAnnotationToAnnotationsByNodeId(annotation);
    }
    this.AnnotationService.setAnnotations(this.studentData.annotations);
  }

  initializeAnnotationsDataStructures() {
    this.studentData.annotationsToWorkgroupId = {};
    this.studentData.annotationsByNodeId = {};
  }

  addAnnotationToAnnotationsToWorkgroupId(annotation) {
    const annotationWorkgroupId = annotation.toWorkgroupId;
    if (!this.studentData.annotationsToWorkgroupId[annotationWorkgroupId]) {
      this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
    }
    this.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);
  }

  addAnnotationToAnnotationsByNodeId(annotation) {
    const annotationNodeId = annotation.nodeId;
    if (!this.studentData.annotationsByNodeId[annotationNodeId]) {
      this.studentData.annotationsByNodeId[annotationNodeId] = new Array();
    }
    this.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
  }

  addOrUpdateComponentState(componentState) {
    this.addComponentStateByWorkgroupId(componentState);
    this.addComponentStateByNodeId(componentState);
    this.addComponentStateByComponentId(componentState);
  }

  addComponentStateByWorkgroupId(componentState) {
    const workgroupId = componentState.workgroupId;
    this.initializeComponentStatesByWorkgroupIdIfNecessary(workgroupId);
    const index = this.getComponentStateByWorkgroupIdIndex(componentState);
    if (index != -1) {
      this.studentData.componentStatesByWorkgroupId[workgroupId][index] = componentState;
    } else {
      this.studentData.componentStatesByWorkgroupId[workgroupId].push(componentState);
    }
  }

  initializeComponentStatesByWorkgroupIdIfNecessary(workgroupId) {
    if (this.studentData.componentStatesByWorkgroupId[workgroupId] == null) {
      this.studentData.componentStatesByWorkgroupId[workgroupId] = [];
    }
  }

  getComponentStateByWorkgroupIdIndex(componentState) {
    const workgroupId = componentState.workgroupId;
    const componentStates = this.studentData.componentStatesByWorkgroupId[workgroupId];
    for (let w = 0; w < componentStates.length; w++) {
      if (componentStates[w].id === componentState.id) {
        return w;
      }
    }
    return -1;
  }

  addComponentStateByNodeId(componentState) {
    const nodeId = componentState.nodeId;
    this.initializeComponentStatesByNodeIdIfNecessary(nodeId);
    const index = this.getComponentStateByNodeIdIndex(componentState);
    if (index != -1) {
      this.studentData.componentStatesByNodeId[nodeId][index] = componentState;
    } else {
      this.studentData.componentStatesByNodeId[nodeId].push(componentState);
    }
  }

  initializeComponentStatesByNodeIdIfNecessary(nodeId) {
    if (this.studentData.componentStatesByNodeId[nodeId] == null) {
      this.studentData.componentStatesByNodeId[nodeId] = [];
    }
  }

  getComponentStateByNodeIdIndex(componentState) {
    const nodeId = componentState.nodeId;
    const componentStates = this.studentData.componentStatesByNodeId[nodeId];
    for (let n = 0; n < componentStates.length; n++) {
      if (componentStates[n].id === componentState.id) {
        return n;
      }
    }
    return -1;
  }

  addComponentStateByComponentId(componentState) {
    const componentId = componentState.componentId;
    this.initializeComponentStatesByComponentIdIfNecessary(componentId);
    const index = this.getComponentStateByComponentIdIndex(componentState);
    if (index != -1) {
      this.studentData.componentStatesByComponentId[componentId][index] = componentState;
    } else {
      this.studentData.componentStatesByComponentId[componentId].push(componentState);
    }
  }

  initializeComponentStatesByComponentIdIfNecessary(componentId) {
    if (this.studentData.componentStatesByComponentId[componentId] == null) {
      this.studentData.componentStatesByComponentId[componentId] = [];
    }
  }

  getComponentStateByComponentIdIndex(componentState) {
    const componentId = componentState.componentId;
    const componentStates = this.studentData.componentStatesByComponentId[componentId];
    for (let c = 0; c < componentStates.length; c++) {
      if (componentStates[c].id === componentState.id) {
        return c;
      }
    }
    return -1;
  }

  retrieveRunStatus() {
    const runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
    const runId = this.ConfigService.getConfigParam('runId');
    const params = {
      runId: runId
    };
    const httpParams = {
      method: 'GET',
      url: runStatusURL,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: params
    };
    return this.$http(httpParams).then(result => {
      const data = result.data;
      this.runStatus = data;
      this.initializePeriods();
    });
  }

  getComponentStatesByWorkgroupId(workgroupId) {
    const componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
    if (componentStatesByWorkgroupId != null) {
      return componentStatesByWorkgroupId;
    } else {
      return [];
    }
  }

  getComponentStatesByNodeId(nodeId) {
    const componentStatesByNodeId = this.studentData.componentStatesByNodeId[nodeId];
    if (componentStatesByNodeId != null) {
      return componentStatesByNodeId;
    } else {
      return [];
    }
  }

  getComponentStatesByComponentId(componentId) {
    const componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];
    if (componentStatesByComponentId != null) {
      return componentStatesByComponentId;
    }
    return [];
  }

  getComponentStatesByComponentIds(componentIds) {
    let componentStatesByComponentId = [];
    for (const componentId of componentIds) {
      componentStatesByComponentId = componentStatesByComponentId.concat(
        this.studentData.componentStatesByComponentId[componentId]
      );
    }
    return componentStatesByComponentId;
  }

  getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId) {
    const componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);
    for (let c = componentStates.length - 1; c >= 0; c--) {
      const componentState = componentStates[c];
      if (this.isComponentStateMatchingNodeIdComponentId(componentState, nodeId, componentId)) {
        return componentState;
      }
    }
    return null;
  }

  isComponentStateMatchingNodeIdComponentId(componentState, nodeId, componentId) {
    return componentState.nodeId === nodeId && componentState.componentId === componentId;
  }

  getLatestComponentStateByWorkgroupIdNodeId(workgroupId, nodeId) {
    const componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);
    for (let c = componentStates.length - 1; c >= 0; c--) {
      const componentState = componentStates[c];
      if (this.isComponentStateMatchingNodeId(componentState, nodeId)) {
        return componentState;
      }
    }
    return null;
  }

  isComponentStateMatchingNodeId(componentState, nodeId) {
    return componentState.nodeId === nodeId;
  }

  /**
   * @param workgroupId the workgroup id
   * @return An array of component states. Each component state will be the latest component state
   * for a component.
   */
  getLatestComponentStatesByWorkgroupId(workgroupId) {
    const componentStates = [];
    const componentsFound = {};
    const componentStatesForWorkgroup = this.getComponentStatesByWorkgroupId(workgroupId);
    for (let csb = componentStatesForWorkgroup.length - 1; csb >= 0; csb--) {
      const componentState = componentStatesForWorkgroup[csb];
      const key = this.getComponentStateNodeIdComponentIdKey(componentState);
      if (componentsFound[key] == null) {
        componentStates.push(componentState);
        componentsFound[key] = true;
      }
    }
    componentStates.reverse();
    return componentStates;
  }

  injectRevisionCounterIntoComponentStates(componentStates) {
    const componentRevisionCounter = {};
    for (const componentState of componentStates) {
      const key = this.getComponentStateNodeIdComponentIdKey(componentState);
      if (componentRevisionCounter[key] == null) {
        componentRevisionCounter[key] = 1;
      }
      const revisionCounter = componentRevisionCounter[key];
      componentState.revisionCounter = revisionCounter;
      componentRevisionCounter[key] = revisionCounter + 1;
    }
  }

  getComponentStateNodeIdComponentIdKey(componentState) {
    return componentState.nodeId + '-' + componentState.componentId;
  }

  getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {
    const componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
    const componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);
    return this.UtilService.getIntersectOfArrays(
      componentStatesByWorkgroupId,
      componentStatesByNodeId
    );
  }

  getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
    const componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
    const componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);
    return this.UtilService.getIntersectOfArrays(
      componentStatesByWorkgroupId,
      componentStatesByComponentId
    );
  }

  getComponentStatesByWorkgroupIdAndComponentIds(workgroupId, componentIds) {
    const componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
    let componentStatesByComponentId = [];
    for (const componentId of componentIds) {
      componentStatesByComponentId = componentStatesByComponentId.concat(
        this.getComponentStatesByComponentId(componentId)
      );
    }
    return this.UtilService.getIntersectOfArrays(
      componentStatesByWorkgroupId,
      componentStatesByComponentId
    );
  }

  getEventsByWorkgroupId(workgroupId) {
    const eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
    if (eventsByWorkgroupId != null) {
      return eventsByWorkgroupId;
    } else {
      return [];
    }
  }

  getEventsByNodeId(nodeId) {
    const eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
    if (eventsByNodeId != null) {
      return eventsByNodeId;
    } else {
      return [];
    }
  }

  getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
    const eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
    const eventsByNodeId = this.getEventsByNodeId(nodeId);
    return this.UtilService.getIntersectOfArrays(eventsByWorkgroupId, eventsByNodeId);
  }

  getLatestEventByWorkgroupIdAndNodeIdAndType(workgroupId, nodeId, eventType) {
    const eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
    for (let e = eventsByWorkgroupId.length - 1; e >= 0; e--) {
      const event = eventsByWorkgroupId[e];
      if (this.isEventMatchingNodeIdEventType(event, nodeId, eventType)) {
        return event;
      }
    }
    return null;
  }

  isEventMatchingNodeIdEventType(event, nodeId, eventType) {
    return event.nodeId === nodeId && event.event === eventType;
  }

  getAnnotationsToWorkgroupId(workgroupId) {
    const annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
    if (annotationsToWorkgroupId != null) {
      return annotationsToWorkgroupId;
    } else {
      return [];
    }
  }

  getAnnotationsByNodeId(nodeId) {
    const annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
    if (annotationsByNodeId != null) {
      return annotationsByNodeId;
    } else {
      return [];
    }
  }

  getAnnotationsByNodeIdAndPeriodId(nodeId, periodId) {
    const annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
    if (annotationsByNodeId != null) {
      return annotationsByNodeId.filter(annotation => {
        return this.UtilService.isMatchingPeriods(annotation.periodId, periodId);
      });
    } else {
      return [];
    }
  }

  getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
    const annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
    const annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);
    return this.UtilService.getIntersectOfArrays(annotationsToWorkgroupId, annotationsByNodeId);
  }

  initializePeriods() {
    const periods = this.ConfigService.getPeriods();
    this.setCurrentPeriod(periods[0]);
    if (periods.length > 1) {
      this.addAllPeriods(periods);
    }
    let mergedPeriods = periods;
    if (this.runStatus.periods != null) {
      mergedPeriods = this.mergeConfigAndRunStatusPeriods(periods, this.runStatus.periods);
    }
    this.periods = mergedPeriods;
    this.runStatus.periods = mergedPeriods;
  }

  addAllPeriods(periods) {
    const allPeriodsOption = {
      periodId: -1,
      periodName: this.$translate('allPeriods')
    };
    periods.unshift(allPeriodsOption);
    return periods;
  }

  mergeConfigAndRunStatusPeriods(configPeriods, runStatusPeriods) {
    const mergedPeriods = [];
    for (const configPeriod of configPeriods) {
      const runStatusPeriod = this.getRunStatusPeriodById(runStatusPeriods, configPeriod.periodId);
      if (runStatusPeriod == null) {
        /*
         * we did not find the period object in the run status so we will use the period object from
         * the config
         */
        mergedPeriods.push(configPeriod);
      } else {
        mergedPeriods.push(runStatusPeriod);
      }
    }
    return mergedPeriods;
  }

  getRunStatusPeriodById(runStatusPeriods, periodId) {
    for (const runStatusPeriod of runStatusPeriods) {
      if (runStatusPeriod.periodId == periodId) {
        return runStatusPeriod;
      }
    }
    return null;
  }

  setCurrentPeriod(period) {
    const previousPeriod = this.currentPeriod;
    this.currentPeriod = period;
    this.clearCurrentWorkgroupIfNecessary(this.currentPeriod.periodId);
    if (previousPeriod == null || previousPeriod.periodId != this.currentPeriod.periodId) {
      this.$rootScope.$broadcast('currentPeriodChanged', {
        previousPeriod: previousPeriod,
        currentPeriod: this.currentPeriod
      });
    }
  }

  clearCurrentWorkgroupIfNecessary(periodId) {
    const currentWorkgroup = this.getCurrentWorkgroup();
    if (currentWorkgroup) {
      if (periodId !== -1 && currentWorkgroup.periodId !== periodId) {
        this.setCurrentWorkgroup(null);
      }
    }
  }

  getCurrentPeriod() {
    return this.currentPeriod;
  }

  getPeriods() {
    return this.periods;
  }

  getRunStatus() {
    return this.runStatus;
  }

  setCurrentWorkgroup(workgroup) {
    this.currentWorkgroup = workgroup;
    this.$rootScope.$broadcast('currentWorkgroupChanged', {
      currentWorkgroup: this.currentWorkgroup
    });
  }

  getCurrentWorkgroup() {
    return this.currentWorkgroup;
  }

  setCurrentStep(step) {
    this.currentStep = step;
    this.$rootScope.$broadcast('currentStepChanged', { currentStep: this.currentStep });
  }

  getCurrentStep() {
    return this.currentStep;
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
    if (nodeId != null) {
      this.setCurrentNode(this.ProjectService.getNodeById(nodeId));
    }
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

  /**
   * @param nodeId the node id of the new current node
   */
  endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
    this.endCurrentNode();
    this.setCurrentNodeByNodeId(nodeId);
  }

  getTotalScoreByWorkgroupId(workgroupId) {
    if (this.studentData.annotationsToWorkgroupId != null) {
      const annotations = this.studentData.annotationsToWorkgroupId[workgroupId];
      return this.AnnotationService.getTotalScore(annotations, workgroupId);
    }
    return null;
  }

  getRunStatus() {
    return this.runStatus;
  }

  isAnyPeriodPaused() {
    for (const period of this.getPeriods()) {
      if (period.paused) {
        return true;
      }
    }
    return false;
  }

  getPeriods() {
    if (this.runStatus && this.runStatus.periods) {
      return this.runStatus.periods;
    } else {
      return [];
    }
  }

  isPeriodPaused(periodId) {
    if (periodId === -1) {
      return this.isAllPeriodsPaused();
    } else {
      return this.isSpecificPeriodPaused(periodId);
    }
  }

  isAllPeriodsPaused() {
    let numPausedPeriods = 0;
    const periods = this.getPeriods();
    for (const period of periods) {
      if (period.paused) {
        numPausedPeriods++;
      }
    }
    return numPausedPeriods === periods.length;
  }

  isSpecificPeriodPaused(periodId) {
    for (const period of this.getPeriods()) {
      if (period.periodId === periodId) {
        return period.paused;
      }
    }
    return false;
  }

  /**
   * The pause screen status was changed for the given periodId. Update period accordingly.
   * @param periodId the id of the period to toggle
   * @param isPaused Boolean whether the period should be paused or not
   */
  pauseScreensChanged(periodId, isPaused) {
    this.updatePausedRunStatusValue(periodId, isPaused);
    this.sendRunStatusThenHandlePauseScreen(periodId, isPaused);
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'TeacherAction',
      data = { periodId: periodId },
      event = isPaused ? 'pauseScreen' : 'unPauseScreen';
    this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    this.$rootScope.$broadcast('pauseScreensChanged', { periods: this.runStatus.periods });
  }

  sendRunStatusThenHandlePauseScreen(periodId, isPaused) {
    this.sendRunStatus().then(() => {
      if (isPaused) {
        this.TeacherWebSocketService.pauseScreens(periodId);
      } else {
        this.TeacherWebSocketService.unPauseScreens(periodId);
      }
    });
  }

  sendRunStatus() {
    const httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('runStatusURL'),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: $.param({
        runId: this.ConfigService.getConfigParam('runId'),
        status: angular.toJson(this.runStatus)
      })
    };
    return this.$http(httpParams);
  }

  createRunStatus() {
    const periods = this.ConfigService.getPeriods();
    for (const period of periods) {
      period.paused = false;
    }
    return {
      runId: this.ConfigService.getConfigParam('runId'),
      periods: periods
    };
  }

  /**
   * Update the paused value for a period in our run status
   * @param periodId the period id or -1 for all periods
   * @param value whether the period is paused or not
   */
  updatePausedRunStatusValue(periodId, value) {
    if (this.runStatus == null) {
      this.runStatus = this.createRunStatus();
    }
    if (periodId === -1) {
      this.updateAllPeriodsPausedValue(value);
    } else {
      this.updatePeriodPausedValue(periodId, value);
    }
  }

  updateAllPeriodsPausedValue(value) {
    for (const period of this.runStatus.periods) {
      period.paused = value;
    }
  }

  updatePeriodPausedValue(periodId, value) {
    for (const period of this.runStatus.periods) {
      if (period.periodId === periodId) {
        period.paused = value;
      }
    }
  }

  isWorkgroupShown(workgroup) {
    let show = false;
    if (this.currentPeriod.periodId === -1 || workgroup.periodId === this.currentPeriod.periodId) {
      show = true;
      if (!this.isCurrentWorkgroup(workgroup.workgroupId)) {
        show = false;
      }
    }
    return show;
  }

  isCurrentWorkgroup(workgroupId) {
    let isCurrentWorkgroup = true;
    if (this.currentWorkgroup) {
      if (this.currentWorkgroup.workgroupId !== parseInt(workgroupId)) {
        isCurrentWorkgroup = false;
      }
    }
    return isCurrentWorkgroup;
  }
}

TeacherDataService.$inject = [
  '$http',
  '$filter',
  '$q',
  '$rootScope',
  'AnnotationService',
  'ConfigService',
  'NotificationService',
  'ProjectService',
  'TeacherWebSocketService',
  'UtilService'
];

export default TeacherDataService;
