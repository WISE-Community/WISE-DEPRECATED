import * as angular from 'angular';
import * as $ from 'jquery';
import { AnnotationService } from '../services/annotationService';
import { ConfigService } from '../services/configService';
import { NodeService } from '../services/nodeService';
import { NotebookService } from '../services/notebookService';
import { ProjectService } from '../services/projectService';
import { StudentAssetService } from '../services/studentAssetService';
import { UtilService } from '../services/utilService';
import { StudentDataService } from '../services/studentDataService';
import { NotificationService } from '../services/notificationService';
import { AudioRecorderService } from '../services/audioRecorderService';
import { Subscription } from 'rxjs';
import { Directive } from '@angular/core';

@Directive()
class ComponentController {
  $translate: any;
  nodeId: string;
  componentId: string;
  componentContent: any;
  componentType: string;
  idToOrder: any;
  mode: string;
  isShowPreviousWork: boolean;
  isDisabled: boolean;
  isDirty: boolean;
  parentStudentWorkIds: any[];
  attachments: any[];
  isSubmitDirty: boolean;
  isSubmit: boolean;
  saveMessage: any;
  isStudentAttachmentEnabled: boolean;
  isStudentAudioRecordingEnabled: boolean;
  isPromptVisible: boolean;
  isSaveButtonVisible: boolean;
  isSubmitButtonVisible: boolean;
  isSubmitButtonDisabled: boolean;
  submitCounter: number;
  isSnipButtonVisible: boolean;
  workgroupId: number;
  teacherWorkgroupId: number;
  showAddToNotebookButton: boolean;
  latestAnnotations: any;
  isJSONStringChanged: boolean;
  annotationSavedToServerSubscription: Subscription;
  nodeSubmitClickedSubscription: Subscription;
  audioRecordedSubscription: Subscription;
  notebookItemChosenSubscription: Subscription;
  snipImageSubscription: Subscription;
  studentWorkSavedToServerSubscription: Subscription;
  starterStateRequestSubscription: Subscription;

  constructor(
    protected $filter: any,
    protected $injector: any,
    protected $mdDialog: any,
    protected $q: any,
    protected $rootScope: any,
    protected $scope: any,
    protected AnnotationService: AnnotationService,
    protected AudioRecorderService: AudioRecorderService,
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected NotebookService: NotebookService,
    protected NotificationService: NotificationService,
    protected ProjectService: ProjectService,
    protected StudentAssetService: StudentAssetService,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
    this.nodeId = this.$scope.nodeId;
    this.componentContent = this.$scope.componentContent;
    this.componentId = this.componentContent.id;
    this.componentType = this.componentContent.type;
    this.idToOrder = this.ProjectService.idToOrder;
    this.mode = this.$scope.mode;
    this.isShowPreviousWork = false;
    this.isDisabled = false;
    this.isDirty = false;
    this.parentStudentWorkIds = null;
    this.attachments = [];

    this.isSubmitDirty = false;

    this.isSubmit = false;

    this.saveMessage = {
      text: '',
      time: ''
    };

    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;
    this.isStudentAudioRecordingEnabled =
      this.componentContent.isStudentAudioRecordingEnabled || false;
    this.isPromptVisible = true;
    this.isSaveButtonVisible = false;
    this.isSubmitButtonVisible = false;
    this.isSubmitButtonDisabled = false;
    this.submitCounter = 0;

    this.isSnipButtonVisible = true;

    this.workgroupId = this.$scope.workgroupId;
    this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

    this.showAddToNotebookButton =
      this.componentContent.showAddToNotebookButton == null
        ? true
        : this.componentContent.showAddToNotebookButton;

    if (this.isStudentMode()) {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      if (!this.ConfigService.isRunActive()) {
        this.isDisabled = true;
      }
    } else if (this.isGradingMode()) {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.isGradingRevisionMode()) {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    if (this.isStudentMode() || this.isGradingMode() || this.isGradingRevisionMode()) {
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(
        this.nodeId,
        this.componentId,
        this.workgroupId
      );
    }

    if (this.isGradingMode() || this.isGradingRevisionMode()) {
      this.showAddToNotebookButton = false;
    }

    this.registerListeners();
    this.registerComponentWithParentNode();
  }

  $onInit() {
    this.snipImageSubscription = this.ProjectService.snipImage$.subscribe(
      ({ target, componentId }) => {
        if (componentId === this.componentId) {
          const imageObject = this.UtilService.getImageObjectFromImageElement(target);
          if (imageObject != null) {
            this.NotebookService.addNote(imageObject);
          }
        }
      }
    );
    this.starterStateRequestSubscription = this.NodeService.starterStateRequest$.subscribe(
      (args: any) => {
        if (this.isForThisComponent(args)) {
          this.generateStarterState();
        }
      }
    );
  }

  isStudentMode() {
    return this.mode === 'student';
  }

  isGradingMode() {
    return this.mode === 'grading';
  }

  isGradingRevisionMode() {
    return this.mode === 'gradingRevision';
  }

  isAuthoringComponentPreviewMode() {
    return this.mode === 'authoringComponentPreview';
  }

  isSaveOrSubmitButtonVisible() {
    return this.isSaveButtonVisible || this.isSubmitButtonVisible;
  }

  registerListeners() {
    this.annotationSavedToServerSubscription = this.AnnotationService.annotationSavedToServer$.subscribe(
      ({ annotation }) => {
        if (this.isEventTargetThisComponent(annotation)) {
          this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(
            this.nodeId,
            this.componentId,
            this.workgroupId
          );
        }
      }
    );

    this.nodeSubmitClickedSubscription = this.NodeService.nodeSubmitClicked$.subscribe(
      ({ nodeId }) => {
        if (this.nodeId === nodeId) {
          this.handleNodeSubmit();
        }
      }
    );
    this.registerStudentWorkSavedToServerListener();
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.nodeSubmitClickedSubscription.unsubscribe();
    this.annotationSavedToServerSubscription.unsubscribe();
    this.studentWorkSavedToServerSubscription.unsubscribe();
    if (this.audioRecordedSubscription != null) {
      this.audioRecordedSubscription.unsubscribe();
    }
    if (this.notebookItemChosenSubscription != null) {
      this.notebookItemChosenSubscription.unsubscribe();
    }
    this.snipImageSubscription.unsubscribe();
    this.starterStateRequestSubscription.unsubscribe();
  }

  initializeScopeGetComponentState(scope, childControllerName) {
    scope.getComponentState = (isSubmit) => {
      const deferred = this.$q.defer();
      const childController = scope[childControllerName];
      if (this.hasDirtyWorkToSendToParent(childController, isSubmit)) {
        const action = this.getDirtyWorkToSendToParentAction(childController, isSubmit);
        childController.createComponentState(action).then((componentState) => {
          deferred.resolve(componentState);
        });
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };
  }

  hasDirtyWorkToSendToParent(childController, isSubmit) {
    return (isSubmit && childController.isSubmitDirty) || childController.isDirty;
  }

  getDirtyWorkToSendToParentAction(childController, isSubmit) {
    if (isSubmit && childController.isSubmitDirty) {
      return 'submit';
    } else if (childController.isDirty) {
      return 'save';
    }
    return 'change';
  }

  createOpenAssetChooserFunction() {
    return (params: any) => {
      this.openAssetChooser(params);
    };
  }

  /**
   * This function should be implemented by child components.
   * @param params and object containing key value pairs
   */
  openAssetChooser(params: any) {}

  getFullAssetPath(fileName) {
    const assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    return assetsDirectoryPath + '/' + fileName;
  }

  registerComponentWithParentNode() {
    if (this.$scope.$parent.nodeController != null) {
      this.$scope.$parent.nodeController.registerComponentController(
        this.$scope,
        this.componentContent
      );
    }
  }

  broadcastDoneRenderingComponent() {
    this.NodeService.broadcastDoneRenderingComponent({
      nodeId: this.nodeId,
      componentId: this.componentId
    });
  }

  registerStudentWorkSavedToServerListener() {
    this.studentWorkSavedToServerSubscription = this.StudentDataService.studentWorkSavedToServer$.subscribe(
      (args: any) => {
        this.handleStudentWorkSavedToServer(args);
      }
    );
  }

  handleStudentWorkSavedToServer(args: any) {
    const componentState = args.studentWork;
    if (this.isForThisComponent(componentState)) {
      this.setIsDirty(false);
      this.emitComponentDirty(this.getIsDirty());
      const clientSaveTime = this.ConfigService.convertToClientTimestamp(
        componentState.serverSaveTime
      );
      if (componentState.isSubmit) {
        this.setSubmittedMessage(clientSaveTime);
        this.lockIfNecessary();
        this.setIsSubmitDirty(false);
        this.StudentDataService.broadcastComponentSubmitDirty({
          componentId: this.componentId,
          isDirty: this.isSubmitDirty
        });
      } else if (componentState.isAutoSave) {
        this.setAutoSavedMessage(clientSaveTime);
      } else {
        this.setSavedMessage(clientSaveTime);
      }
    }
    this.handleStudentWorkSavedToServerAdditionalProcessing(args);
  }

  handleStudentWorkSavedToServerAdditionalProcessing(args: any) {}

  handleNodeSubmit() {
    this.isSubmit = true;
  }

  getPrompt() {
    return this.componentContent.prompt;
  }

  saveButtonClicked() {
    this.isSubmit = false;

    // tell the parent node to save
    this.StudentDataService.broadcastComponentSaveTriggered({
      nodeId: this.nodeId,
      componentId: this.componentId
    });
  }

  submitButtonClicked() {
    this.submit('componentSubmitButton');
  }

  /**
   * A submit was triggered by the component submit button or node submit button.
   * @param {string} submitTriggeredBy What triggered the submit.
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy = null) {
    if (this.getIsSubmitDirty()) {
      let isPerformSubmit = true;

      if (this.hasMaxSubmitCount()) {
        const numberOfSubmitsLeft = this.getNumberOfSubmitsLeft();

        if (this.hasSubmitMessage()) {
          isPerformSubmit = this.confirmSubmit(numberOfSubmitsLeft);
        } else {
          if (numberOfSubmitsLeft <= 0) {
            isPerformSubmit = false;
          }
        }
      }

      if (isPerformSubmit) {
        this.performSubmit(submitTriggeredBy);
      } else {
        this.setIsSubmit(false);
      }
    }
  }

  confirmSubmit(numberOfSubmitsLeft) {
    return true;
  }

  disableSubmitButton() {
    this.isSubmitButtonDisabled = true;
  }

  performSubmit(submitTriggeredBy) {
    this.setIsSubmit(true);
    this.incrementSubmitCounter();

    if (!this.canSubmit()) {
      this.disableSubmitButton();
    }

    if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
      this.emitComponentSubmitTriggered();
    }
  }

  hasSubmitMessage() {
    return false;
  }

  incrementSubmitCounter() {
    this.submitCounter++;
  }

  emitComponentSubmitTriggered() {
    this.StudentDataService.broadcastComponentSubmitTriggered({
      nodeId: this.nodeId,
      componentId: this.componentId
    });
  }

  disableComponentIfNecessary() {
    if (this.isLockAfterSubmit()) {
      const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
        this.nodeId,
        this.componentId
      );
      if (this.NodeService.isWorkSubmitted(componentStates)) {
        this.isDisabled = true;
      }
    }
  }

  lockIfNecessary() {
    if (this.isLockAfterSubmit()) {
      this.isDisabled = true;
    }
  }

  isLockAfterSubmit() {
    return this.componentContent.lockAfterSubmit;
  }

  studentDataChanged() {
    this.setIsDirtyAndBroadcast();
    this.setIsSubmitDirtyAndBroadcast();
    this.clearSaveText();
    const action = 'change';
    this.createComponentStateAndBroadcast(action);
  }

  setIsDirtyAndBroadcast() {
    this.setIsDirty(true);
    this.emitComponentDirty(true);
  }

  setIsSubmitDirtyAndBroadcast() {
    this.setIsSubmitDirty(true);
    this.emitComponentSubmitDirty(true);
  }

  /*
   * the student work in this component has changed so we will tell
   * the parent node that the student data will need to be saved.
   * this will also notify connected parts that this component's student
   * data has changed.
   */
  createComponentStateAndBroadcast(action) {
    this.createComponentState(action).then((componentState) => {
      this.emitComponentStudentDataChanged(componentState);
    });
  }

  emitComponentStudentDataChanged(componentState) {
    this.StudentDataService.broadcastComponentStudentData({
      nodeId: this.nodeId,
      componentId: this.componentId,
      componentState: componentState
    });
  }

  processLatestStudentWork() {
    const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );

    if (latestComponentState) {
      const serverSaveTime = latestComponentState.serverSaveTime;
      const clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      if (latestComponentState.isSubmit) {
        this.setIsSubmitDirty(false);
        this.emitComponentSubmitDirty(false);
        this.setSubmittedMessage(clientSaveTime);
      } else {
        this.setIsSubmitDirty(true);
        this.emitComponentSubmitDirty(true);
        this.setSavedMessage(clientSaveTime);
      }
    }
  }

  setIsSubmitDirty(isDirty) {
    this.isSubmitDirty = isDirty;
  }

  getIsSubmitDirty() {
    return this.isSubmitDirty;
  }

  emitComponentDirty(isDirty) {
    this.StudentDataService.broadcastComponentDirty({
      componentId: this.componentId,
      isDirty: isDirty
    });
  }

  emitComponentSubmitDirty(isDirty) {
    this.StudentDataService.broadcastComponentSubmitDirty({
      componentId: this.componentId,
      isDirty: isDirty
    });
  }

  setSavedMessage(time) {
    this.setSaveText(this.$translate('SAVED'), time);
  }

  setAutoSavedMessage(time) {
    this.setSaveText(this.$translate('AUTO_SAVED'), time);
  }

  setSubmittedMessage(time) {
    this.setSaveText(this.$translate('SUBMITTED'), time);
  }

  setSaveText(message, time) {
    this.saveMessage.text = message;
    this.saveMessage.time = time;
  }

  clearSaveText() {
    this.setSaveText('', null);
  }

  /**
   * Get all the step node ids in the project
   * @returns {array} an array of step node id strings
   */
  getStepNodeIds() {
    return this.ProjectService.getNodeIds();
  }

  /**
   * Get the step number and title for a node
   * @param {string} get the step number and title for this node
   * @returns {string} the step number and title example "1.5: Read Information"
   */
  getNodePositionAndTitleByNodeId(nodeId) {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  /**
   * Get the components in a step
   * @param {string} id of the step
   * @returns {array} an array of component objects
   */
  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  /**
   * Check if a node is a step node
   * @param {string} nodeId the node id to check
   * @returns {boolean} whether the node is a step node
   */
  isApplicationNode(nodeId) {
    return this.ProjectService.isApplicationNode(nodeId);
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    const deferred = this.$q.defer();
    deferred.resolve({});
    return deferred.promise;
  }

  /**
   * Perform any additional processing that is required before returning the
   * component state
   * Note: this function must call deferred.resolve() otherwise student work
   * will not be saved
   * @param deferred a deferred object
   * @param componentState the component state
   * @param action the action that we are creating the component state for
   * e.g. 'submit', 'save', 'change'
   */
  createComponentStateAdditionalProcessing(deferred, componentState, action) {
    /*
     * we don't need to perform any additional processing so we can resolve
     * the promise immediately
     */
    deferred.resolve(componentState);
  }

  /**
   * Import any work needed from connected components
   */
  handleConnectedComponents() {
    const connectedComponents = this.componentContent.connectedComponents;
    if (connectedComponents != null) {
      const componentStates = [];
      for (let connectedComponent of connectedComponents) {
        const componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
          connectedComponent.nodeId,
          connectedComponent.componentId
        );
        if (componentState != null) {
          componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
        }
        if (connectedComponent.type === 'showWork') {
          this.isDisabled = true;
        }
      }
      if (componentStates.length > 0) {
        this.setStudentWork(this.createMergedComponentState(componentStates));
        this.handleConnectedComponentsPostProcess();
        this.studentDataChanged();
      }
    }
  }

  setStudentWork(componentState) {}

  createMergedComponentState(componentStates) {
    return componentStates[0];
  }

  handleConnectedComponentsPostProcess() {
    // overridden by children
  }

  getConnectedComponentsAndTheirComponentStates() {
    const connectedComponentsAndTheirComponentStates = [];
    for (const connectedComponent of this.componentContent.connectedComponents) {
      const componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        connectedComponent.nodeId,
        connectedComponent.componentId
      );
      const connectedComponentsAndComponentState = {
        connectedComponent: connectedComponent,
        componentState: this.UtilService.makeCopyOfJSONObject(componentState)
      };
      connectedComponentsAndTheirComponentStates.push(connectedComponentsAndComponentState);
    }
    return connectedComponentsAndTheirComponentStates;
  }

  showCopyPublicNotebookItemButton() {
    return this.ProjectService.isSpaceExists('public');
  }

  copyPublicNotebookItemButtonClicked() {
    this.NotebookService.broadcastOpenNotebook({
      nodeId: this.nodeId,
      componentId: this.componentId,
      insertMode: true,
      requester: this.nodeId + '-' + this.componentId,
      visibleSpace: 'public'
    });
  }

  importWorkByStudentWorkId(studentWorkId) {
    this.StudentDataService.getStudentWorkById(studentWorkId).then((componentState) => {
      if (componentState != null) {
        this.setStudentWork(componentState);
        this.setParentStudentWorkIdToCurrentStudentWork(studentWorkId);
        this.NotebookService.broadcastCloseNotebook();
      }
    });
  }

  setParentStudentWorkIdToCurrentStudentWork(studentWorkId) {
    this.parentStudentWorkIds = [studentWorkId];
  }

  isNotebookEnabled() {
    return this.NotebookService.isNotebookEnabled();
  }

  isStudentNoteClippingEnabled() {
    return this.NotebookService.isStudentNoteClippingEnabled();
  }

  isAddToNotebookEnabled() {
    return (
      this.isNotebookEnabled() &&
      this.isStudentNoteClippingEnabled() &&
      this.showAddToNotebookButton
    );
  }

  isEventTargetThisComponent(args) {
    return this.isForThisComponent(args);
  }

  isForThisComponent(object) {
    return this.nodeId == object.nodeId && this.componentId == object.componentId;
  }

  canSubmit() {
    return !this.hasMaxSubmitCount() || this.hasSubmitsLeft();
  }

  hasMaxSubmitCount() {
    return this.getMaxSubmitCount() != null;
  }

  getMaxSubmitCount() {
    return this.componentContent.maxSubmitCount;
  }

  getNumberOfSubmitsLeft() {
    return this.getMaxSubmitCount() - this.submitCounter;
  }

  hasSubmitsLeft() {
    return this.getNumberOfSubmitsLeft() > 0;
  }

  setIsSubmit(isSubmit) {
    this.isSubmit = isSubmit;
  }

  getIsSubmit() {
    return this.isSubmit;
  }

  setIsDirty(isDirty) {
    this.isDirty = isDirty;
  }

  getIsDirty() {
    return this.isDirty;
  }

  removeAttachment(attachment) {
    if (this.attachments.indexOf(attachment) !== -1) {
      this.attachments.splice(this.attachments.indexOf(attachment), 1);
      this.studentDataChanged();
    }
  }

  attachStudentAsset(studentAsset) {
    return this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
      const attachment = {
        studentAssetId: copiedAsset.id,
        iconURL: copiedAsset.iconURL,
        url: copiedAsset.url,
        type: copiedAsset.type
      };
      this.attachments.push(attachment);
      this.studentDataChanged();
    });
  }

  hasMaxScore() {
    return this.componentContent.maxScore != null && this.componentContent.maxScore !== '';
  }

  getMaxScore() {
    return this.componentContent.maxScore;
  }

  createAutoScoreAnnotation(data) {
    return this.createAutoAnnotation('autoScore', data);
  }

  createAutoCommentAnnotation(data) {
    return this.createAutoAnnotation('autoComment', data);
  }

  createAutoAnnotation(type, data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();
    if (type === 'autoScore') {
      return this.AnnotationService.createAutoScoreAnnotation(
        runId,
        periodId,
        nodeId,
        componentId,
        toWorkgroupId,
        data
      );
    } else if (type === 'autoComment') {
      return this.AnnotationService.createAutoCommentAnnotation(
        runId,
        periodId,
        nodeId,
        componentId,
        toWorkgroupId,
        data
      );
    }
  }

  updateLatestScoreAnnotation(annotation) {
    this.latestAnnotations.score = annotation;
  }

  updateLatestCommentAnnotation(annotation) {
    this.latestAnnotations.comment = annotation;
  }

  registerNotebookItemChosenListener() {
    this.notebookItemChosenSubscription = this.NotebookService.notebookItemChosen$.subscribe(
      ({ requester, notebookItem }) => {
        if (requester === `${this.nodeId}-${this.componentId}`) {
          const studentWorkId = notebookItem.content.studentWorkIds[0];
          this.importWorkByStudentWorkId(studentWorkId);
        }
      }
    );
  }

  registerAudioRecordedListener() {
    this.audioRecordedSubscription = this.AudioRecorderService.audioRecorded$.subscribe(
      ({ requester, audioFile }) => {
        if (requester === `${this.nodeId}-${this.componentId}`) {
          this.StudentAssetService.uploadAsset(audioFile).then((studentAsset) => {
            this.attachStudentAsset(studentAsset).then(() => {
              this.StudentAssetService.deleteAsset(studentAsset);
            });
          });
        }
      }
    );
  }

  /**
   * Render the component state and then generate an image from it.
   * @param componentState The component state to render.
   * @return A promise that will return an image.
   */
  generateImageFromComponentState(componentState) {
    const deferred = this.$q.defer();
    this.$mdDialog.show({
      template: `
        <div style="position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(0,0,0,0.2); z-index: 2;"></div>
        <div align="center" style="position: absolute; top: 100px; left: 200px; z-index: 1000; padding: 20px; background-color: yellow;">
          <span>{{ "importingWork" | translate }}...</span>
          <br/>
          <br/>
          <md-progress-circular md-mode="indeterminate"></md-progress-circular>
        </div>
        <component node-id="{{nodeId}}"
                   component-id="{{componentId}}"
                   component-state="{{componentState}}"
                   mode="student"></component>
      `,
      locals: {
        nodeId: componentState.nodeId,
        componentId: componentState.componentId,
        componentState: componentState
      },
      controller: DialogController
    });
    function DialogController($scope, $mdDialog, nodeId, componentId, componentState) {
      $scope.nodeId = nodeId;
      $scope.componentId = componentId;
      $scope.componentState = componentState;
      $scope.closeDialog = function () {
        $mdDialog.hide();
      };
    }
    DialogController.$inject = ['$scope', '$mdDialog', 'nodeId', 'componentId', 'componentState'];

    const doneRenderingComponentSubscription = this.NodeService.doneRenderingComponent$.subscribe(
      ({ nodeId, componentId }) => {
        if (componentState.nodeId == nodeId && componentState.componentId == componentId) {
          setTimeout(() => {
            const componentService = this.$injector.get(componentState.componentType + 'Service');
            componentService
              .generateImageFromRenderedComponentState(componentState)
              .then((image) => {
                clearTimeout(destroyDoneRenderingComponentListenerTimeout);
                doneRenderingComponentSubscription.unsubscribe();
                deferred.resolve(image);
                this.$mdDialog.hide();
              });
          }, 1000);
        }
      }
    );
    /*
     * Set a timeout to destroy the listener in case there is an error creating the image and
     * we don't get to destroying it above.
     */
    const destroyDoneRenderingComponentListenerTimeout = setTimeout(() => {
      doneRenderingComponentSubscription.unsubscribe();
    }, 10000);
    return deferred.promise;
  }

  generateStarterState() {}
}

export default ComponentController;
