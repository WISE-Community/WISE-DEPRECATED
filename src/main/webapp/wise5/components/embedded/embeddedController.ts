'use strict';

import * as $ from 'jquery';
import * as html2canvas from 'html2canvas';
import ComponentController from '../componentController';
import { EmbeddedService } from './embeddedService';
import { Directive } from '@angular/core';

@Directive()
class EmbeddedController extends ComponentController {
  $q: any;
  $sce: any;
  $timeout: any;
  $window: any;
  EmbeddedService: EmbeddedService;
  url: string;
  maxWidth: number;
  maxHeight: number;
  notebookConfig: any;
  componentStateId: number;
  embeddedApplicationIFrameId: string;
  annotationsToSave: any[];
  width: string;
  height: string;
  messageEventListener: any;
  studentData: any;
  siblingComponentStudentDataChangedSubscription: any;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$sce',
    '$timeout',
    '$window',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'EmbeddedService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    $sce,
    $timeout,
    $window,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    EmbeddedService,
    NodeService,
    NotebookService,
    NotificationService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.$q = $q;
    this.$sce = $sce;
    this.$timeout = $timeout;
    this.$window = $window;
    this.EmbeddedService = EmbeddedService;
    this.componentType = null;
    this.url = null;
    this.setWidthAndHeight(this.componentContent.width, this.componentContent.height);
    this.maxWidth = null;
    this.maxHeight = null;
    this.notebookConfig = this.NotebookService.getNotebookConfig();
    this.componentStateId = null;
    this.annotationsToSave = [];
    this.embeddedApplicationIFrameId = 'componentApp_' + this.componentId;
    this.componentType = this.componentContent.type;

    if (this.isGradingMode() || this.isGradingRevisionMode()) {
      const componentState = this.$scope.componentState;
      if (componentState != null) {
        this.embeddedApplicationIFrameId = 'componentApp_' + componentState.id;
        if (this.isGradingRevisionMode()) {
          this.embeddedApplicationIFrameId = 'componentApp_gradingRevision_' + componentState.id;
        }
      }
    }

    this.setURL(this.componentContent.url);

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected component that has changed
     */
    this.$scope.handleConnectedComponentStudentDataChanged = (
      connectedComponent,
      connectedComponentParams,
      componentState
    ) => {
      const message = {
        messageType: 'handleConnectedComponentStudentDataChanged',
        componentState: componentState
      };
      this.sendMessageToApplication(message);
    };

    this.initializeScopeGetComponentState(this.$scope, 'embeddedController');

    /*
     * Watch for siblingComponentStudentDataChanged which occurs when the student data has changed
     * for another component in this step.
     */
    this.siblingComponentStudentDataChangedSubscription = this.NodeService.siblingComponentStudentDataChanged$.subscribe(
      (args: any) => {
        if (this.isEventTargetThisComponent(args)) {
          const message = {
            messageType: 'siblingComponentStudentDataChanged',
            componentState: args.componentState
          };
          this.sendMessageToApplication(message);
        }
      }
    );

    this.initializeMessageEventListener();
    this.broadcastDoneRenderingComponent();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.$window.removeEventListener('message', this.messageEventListener);
  }

  unsubscribeAll() {
    this.siblingComponentStudentDataChangedSubscription.unsubscribe();
  }

  setWidthAndHeight(width, height) {
    this.width = width ? width + 'px' : '100%';
    this.height = height ? height + 'px' : '600px';
  }

  initializeMessageEventListener() {
    this.messageEventListener = (messageEvent) => {
      const messageEventData = messageEvent.data;
      if (messageEventData.messageType === 'event') {
        this.handleEventMessage(messageEventData);
      } else if (messageEventData.messageType === 'studentWork') {
        this.handleStudentWorkMessage(messageEventData);
      } else if (messageEventData.messageType === 'applicationInitialized') {
        this.handleApplicationInitializedMessage(messageEventData);
      } else if (messageEventData.messageType === 'componentDirty') {
        this.handleComponentDirtyMessage(messageEventData);
      } else if (messageEventData.messageType === 'componentSubmitDirty') {
        this.handleComponentSubmitDirtyMessage(messageEventData);
      } else if (messageEventData.messageType === 'studentDataChanged') {
        this.handleStudentDataChangedMessage(messageEventData);
      } else if (messageEventData.messageType === 'getStudentWork') {
        this.handleGetStudentWorkMessage(messageEventData);
      } else if (messageEventData.messageType === 'getLatestStudentWork') {
        this.handleGetLatestStudentWorkMessage(messageEventData);
      } else if (messageEventData.messageType === 'getParameters') {
        this.handleGetParametersMessage(messageEventData);
      } else if (messageEventData.messageType === 'getProjectPath') {
        this.handleGetProjectPathMessage(messageEventData);
      } else if (messageEventData.messageType === 'getLatestAnnotations') {
        this.handleGetLatestAnnotationsMessage(messageEventData);
      }
    };
  }

  handleEventMessage(messageEventData) {
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const componentType = this.componentType;
    const category = messageEventData.eventCategory;
    const event = messageEventData.event;
    const eventData = messageEventData.eventData;
    this.StudentDataService.saveVLEEvent(
      nodeId,
      componentId,
      componentType,
      category,
      event,
      eventData
    );
  }

  handleStudentWorkMessage(messageEventData) {
    if (messageEventData.id != null) {
      //the model wants to update/overwrite an existing component state
      this.componentStateId = messageEventData.id;
    } else {
      // the model wants to create a new component state
      this.componentStateId = null;
    }

    if (messageEventData.isSubmit) {
      this.isSubmit = messageEventData.isSubmit;
    }

    this.isDirty = true;
    this.setStudentData(messageEventData.studentData);
    if (messageEventData.annotations != null) {
      this.setAnnotations(messageEventData.annotations);
    }
    this.studentDataChanged();

    // tell the parent node that this component wants to save
    this.StudentDataService.broadcastComponentSaveTriggered({
      nodeId: this.nodeId,
      componentId: this.componentId
    });
  }

  handleApplicationInitializedMessage(messageEventData) {
    this.sendLatestWorkToApplication();
    this.processLatestStudentWork();
    ($('#' + this.embeddedApplicationIFrameId) as any).iFrameResize({ scrolling: true });
  }

  handleComponentDirtyMessage(messageEventData) {
    this.isDirty = messageEventData.isDirty;
    this.StudentDataService.broadcastComponentDirty({
      componentId: this.componentId,
      isDirty: this.isDirty
    });
  }

  handleComponentSubmitDirtyMessage(messageEventData) {
    this.isSubmitDirty = messageEventData.isDirty;
    this.StudentDataService.broadcastComponentSubmitDirty({
      componentId: this.componentId,
      isDirty: this.isSubmitDirty
    });
  }

  handleStudentDataChangedMessage(messageEventData) {
    this.setStudentData(messageEventData.studentData);
    if (messageEventData.annotations != null) {
      this.setAnnotations(messageEventData.annotations);
    }
    this.studentDataChanged();
  }

  handleGetStudentWorkMessage(messageEventData) {
    const getStudentWorkParams = messageEventData.getStudentWorkParams;
    const studentWork = this.getStudentWork(messageEventData.getStudentWorkParams);
    const message: any = studentWork;
    message.messageType = 'studentWork';
    message.getStudentWorkParams = getStudentWorkParams;
    this.sendMessageToApplication(message);
  }

  handleGetLatestStudentWorkMessage(messageEventData) {
    const latestComponentState = this.getLatestStudentWork();
    const message = {
      messageType: 'latestStudentWork',
      latestStudentWork: latestComponentState
    };
    this.sendMessageToApplication(message);
  }

  handleGetParametersMessage(messageEventData) {
    let parameters: any = {};
    if (this.componentContent.parameters != null) {
      parameters = this.UtilService.makeCopyOfJSONObject(this.componentContent.parameters);
    }
    parameters.nodeId = this.nodeId;
    parameters.componentId = this.componentId;
    const message = {
      messageType: 'parameters',
      parameters: parameters
    };
    this.sendMessageToApplication(message);
  }

  handleGetProjectPathMessage(messageEventData) {
    const message = {
      messageType: 'projectPath',
      projectPath: this.ConfigService.getConfigParam('projectBaseURL'),
      projectAssetsPath: this.ConfigService.getConfigParam('projectBaseURL') + 'assets'
    };
    this.sendMessageToApplication(message);
  }

  handleGetLatestAnnotationsMessage(messageEventData) {
    const latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(
      this.nodeId,
      this.componentId,
      this.ConfigService.getWorkgroupId(),
      'any'
    );
    const latestCommentAnnotation = this.AnnotationService.getLatestCommentAnnotation(
      this.nodeId,
      this.componentId,
      this.ConfigService.getWorkgroupId(),
      'any'
    );
    const message = {
      messageType: 'latestAnnotations',
      latestScoreAnnotation: latestScoreAnnotation,
      latestCommentAnnotation: latestCommentAnnotation
    };
    this.sendMessageToApplication(message);
  }

  registerStudentWorkSavedToServerListener() {
    this.studentWorkSavedToServerSubscription = this.StudentDataService.studentWorkSavedToServer$.subscribe(
      (args: any) => {
        const componentState = args.studentWork;
        if (this.isForThisComponent(componentState)) {
          this.isDirty = false;
          this.StudentDataService.broadcastComponentDirty({
            componentId: this.componentId,
            isDirty: false
          });
          this.$scope.embeddedController.componentState = null;
          const isAutoSave = componentState.isAutoSave;
          const isSubmit = componentState.isSubmit;
          const serverSaveTime = componentState.serverSaveTime;
          const clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
          if (isSubmit) {
            this.setSubmittedMessage(clientSaveTime);
            this.submit();
            this.isSubmitDirty = false;
            this.StudentDataService.broadcastComponentSubmitDirty({
              componentId: this.componentId,
              isDirty: false
            });
          } else if (isAutoSave) {
            this.setAutoSavedMessage(clientSaveTime);
          } else {
            this.setSavedMessage(clientSaveTime);
          }
          const message = {
            messageType: 'componentStateSaved',
            componentState: componentState
          };
          this.sendMessageToApplication(message);
        }
      }
    );
  }

  iframeLoaded(contentLocation) {
    (window.document.getElementById(
      this.embeddedApplicationIFrameId
    ) as HTMLIFrameElement).contentWindow.addEventListener('message', this.messageEventListener);
  }

  setURL(url) {
    this.url = this.$sce.trustAsResourceUrl(url);
  }

  /**
   * Create a new component state populated with the student data
   * @return the componentState after it has been populated
   */
  createComponentState(action) {
    const componentState: any = this.NodeService.createNewComponentState();
    componentState.studentData = this.studentData;
    componentState.componentType = 'Embedded';
    componentState.nodeId = this.nodeId;
    componentState.componentId = this.componentId;
    if (this.componentStateId != null) {
      componentState.id = this.componentStateId;
    }
    if (this.isSubmit) {
      componentState.isSubmit = this.isSubmit;
      this.isSubmit = false;
    }
    if (this.annotationsToSave.length !== 0) {
      componentState.annotations = this.annotationsToSave;
    }
    if (action === 'save') {
      this.clearAnnotationsToSave();
    }
    const deferred = this.$q.defer();
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);
    return deferred.promise;
  }

  clearAnnotationsToSave() {
    this.annotationsToSave = [];
  }

  sendLatestWorkToApplication() {
    let componentState = this.$scope.componentState;
    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      componentState = this.handleConnectedComponents();
    }
    const message = {
      messageType: 'componentState',
      componentState: componentState
    };
    this.sendMessageToApplication(message);
  }

  sendMessageToApplication(message) {
    (window.document.getElementById(
      this.embeddedApplicationIFrameId
    ) as HTMLIFrameElement).contentWindow.postMessage(message, '*');
  }

  /**
   * Snip the model by converting it to an image
   * @param $event the click event
   */
  snipModel($event) {
    const iframe = $('#' + this.embeddedApplicationIFrameId);
    if (iframe != null && iframe.length > 0) {
      let modelElement: any = iframe.contents().find('html');
      if (modelElement != null && modelElement.length > 0) {
        modelElement = modelElement[0];
        html2canvas(modelElement).then((canvas) => {
          const base64Image = canvas.toDataURL('image/png');
          const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);
          this.NotebookService.addNote(imageObject);
        });
      }
    }
  }

  getLatestStudentWork() {
    return this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
  }

  /**
   * Get the student work from the specified components/nodes
   * @param params The params for getting the student work. The possible
   * values to request are
   * getLatestStudentWorkFromThisComponent
   * getAllStudentWorkFromThisComponent
   * getLatestStudentWorkFromThisNode
   * getAllStudentWorkFromThisNode
   * getLatestStudentWorkFromOtherComponents
   * getAllStudentWorkFromOtherComponents
   * If getLatestStudentWorkFromOtherComponents or getAllStudentWorkFromOtherComponents
   * are requested, the otherComponents param must be provided. otherComponents
   * should be an array of objects. The objects should contain a nodeId and
   * componentId.
   * @return an object containing other objects that contain work from the
   * specified components/nodes
   */
  getStudentWork(params) {
    const studentWork: any = {};
    if (params != null) {
      if (params.getLatestStudentWorkFromThisComponent) {
        studentWork.latestStudentWorkFromThisComponent = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
          this.nodeId,
          this.componentId
        );
      }
      if (params.getAllStudentWorkFromThisComponent) {
        studentWork.allStudentWorkFromThisComponent = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
          this.nodeId,
          this.componentId
        );
      }
      if (params.getLatestStudentWorkFromThisNode) {
        studentWork.latestStudentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(
          this.nodeId
        );
      }
      if (params.getAllStudentWorkFromThisNode) {
        studentWork.allStudentWorkFromThisNode = this.StudentDataService.getComponentStatesByNodeId(
          this.nodeId
        );
      }
      if (params.getLatestStudentWorkFromOtherComponents) {
        studentWork.latestStudentWorkFromOtherComponents = this.getLatestStudentWorkFromOtherComponents(
          params.otherComponents
        );
      }
      if (params.getAllStudentWorkFromOtherComponents) {
        studentWork.allStudentWorkFromOtherComponents = this.getAllStudentWorkFromOtherComponents(
          params.otherComponents
        );
      }
    }
    return studentWork;
  }

  getLatestStudentWorkFromOtherComponents(otherComponents) {
    const latestStudentWorkFromOtherComponents = [];
    if (otherComponents != null) {
      for (let otherComponent of otherComponents) {
        const tempNodeId = otherComponent.nodeId;
        const tempComponentId = otherComponent.componentId;
        if (tempNodeId != null && tempComponentId != null) {
          const tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
            tempNodeId,
            tempComponentId
          );
          if (tempComponentState != null) {
            latestStudentWorkFromOtherComponents.push(tempComponentState);
          }
        }
      }
    }
    return latestStudentWorkFromOtherComponents;
  }

  getAllStudentWorkFromOtherComponents(otherComponents) {
    let allStudentWorkFromOtherComponents = [];
    if (otherComponents != null) {
      for (let otherComponent of otherComponents) {
        if (otherComponent != null) {
          const tempNodeId = otherComponent.nodeId;
          const tempComponentId = otherComponent.componentId;
          if (tempNodeId != null && tempComponentId != null) {
            let tempComponentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
              tempNodeId,
              tempComponentId
            );
            if (tempComponentStates != null && tempComponentStates.length > 0) {
              allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents.concat(
                tempComponentStates
              );
            }
          }
        }
      }
    }
    return allStudentWorkFromOtherComponents;
  }

  /**
   * Import any work we need from connected components
   */
  handleConnectedComponents() {
    let mergedComponentState = this.$scope.componentState;
    let firstTime = true;
    if (mergedComponentState == null) {
      mergedComponentState = this.NodeService.createNewComponentState();
      mergedComponentState.studentData = {};
    } else {
      firstTime = false;
    }
    const connectedComponents = this.componentContent.connectedComponents;
    if (connectedComponents != null) {
      const componentStates = [];
      for (let connectedComponent of connectedComponents) {
        const type = connectedComponent.type;
        if (type === 'showWork') {
          this.handleShowWorkConnectedComponent(connectedComponent, componentStates);
        } else if (type === 'importWork' || type == null) {
          mergedComponentState = this.handleImportWorkConnectedComponent(
            connectedComponent,
            mergedComponentState,
            firstTime
          );
        }
      }
      if (mergedComponentState != null) {
        this.setStudentWork(mergedComponentState);
        this.studentDataChanged();
      }
    }
    return mergedComponentState;
  }

  handleShowWorkConnectedComponent(connectedComponent, componentStates) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    const componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    if (componentState != null) {
      componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
    }
    this.isDisabled = true;
  }

  handleImportWorkConnectedComponent(connectedComponent, mergedComponentState, firstTime) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    const connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    if (connectedComponentState != null) {
      const fields = connectedComponent.fields;
      const when = connectedComponent.when;
      if (when == null || (when === 'firstTime' && firstTime)) {
        mergedComponentState = this.mergeComponentState(
          mergedComponentState,
          connectedComponentState,
          fields,
          firstTime
        );
      }
    }
    return mergedComponentState;
  }

  /**
   * Merge a new component state into a base component state.
   * @param toComponentState The component state we will be merging into.
   * @param fromComponentState The component state we will be merging from.
   * @param mergeFields The fields to merge.
   * @param firstTime Whether this is the first time the baseComponentState is
   * being merged into.
   */
  mergeComponentState(toComponentState, fromComponentState, mergeFields, firstTime) {
    if (mergeFields == null) {
      // there are no merge fields specified so we will get all of the fields
      if (fromComponentState.componentType === 'Embedded') {
        toComponentState.studentData = this.UtilService.makeCopyOfJSONObject(
          fromComponentState.studentData
        );
      }
    } else {
      for (let mergeField of mergeFields) {
        this.mergeField(toComponentState, fromComponentState, mergeField, firstTime);
      }
    }
    return toComponentState;
  }

  mergeField(toComponentState, fromComponentState, mergeField, firstTime) {
    const name = mergeField.name;
    const when = mergeField.when;
    const action = mergeField.action;
    if (when == 'firstTime' && firstTime == true) {
      if (action == 'write') {
        toComponentState.studentData[name] = fromComponentState.studentData[name];
      } else if (action == 'read') {
        // TODO
      }
    } else if (when == 'always') {
      if (action == 'write') {
        toComponentState.studentData[name] = fromComponentState.studentData[name];
      } else if (action == 'read') {
        // TODO
      }
    }
  }

  setStudentWork(componentState) {
    this.studentData = componentState.studentData;
  }

  setStudentData(studentData) {
    this.studentData = studentData;
  }

  setAnnotations(annotations) {
    for (let annotation of annotations) {
      if (this.isAnnotationValid(annotation)) {
        if (annotation.type === 'autoScore') {
          const scoreAnnotation = this.createAutoScoreAnnotation(annotation.data);
          this.updateLatestScoreAnnotation(scoreAnnotation);
          this.addToAnnotationsToSave(scoreAnnotation);
        } else if (annotation.type === 'autoComment') {
          const commentAnnotation = this.createAutoCommentAnnotation(annotation.data);
          this.updateLatestCommentAnnotation(commentAnnotation);
          this.addToAnnotationsToSave(commentAnnotation);
        }
      }
    }
  }

  isAnnotationValid(annotation) {
    return annotation.type != null && annotation.data != null && annotation.data.value != null;
  }

  addToAnnotationsToSave(annotation) {
    this.annotationsToSave.push(annotation);
  }
}

export default EmbeddedController;
