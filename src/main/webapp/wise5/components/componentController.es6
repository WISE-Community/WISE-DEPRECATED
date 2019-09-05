class ComponentController {
  constructor(
      $filter,
      $mdDialog,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.NotebookService = NotebookService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');

    this.nodeId = this.$scope.nodeId;
    this.componentContent = this.$scope.componentContent;
    this.componentId = this.componentContent.id;
    this.componentType = this.componentContent.type;
    this.idToOrder = this.ProjectService.idToOrder;
    this.mode = this.$scope.mode;
    this.authoringComponentContent = this.$scope.authoringComponentContent;
    this.isShowPreviousWork = false;
    this.showAdvancedAuthoring = false;
    this.showJSONAuthoring = false;
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

    this.isPromptVisible = true;
    this.isSaveButtonVisible = false;
    this.isSubmitButtonVisible = false;
    this.isSubmitButtonDisabled = false;
    this.submitCounter = 0;

    this.isSnipButtonVisible = true;

    this.workgroupId = this.$scope.workgroupId;
    this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

    this.showAddToNotebookButton =
      this.componentContent.showAddToNotebookButton == null ? true : this.componentContent.showAddToNotebookButton;

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
    } else if (this.isOnlyShowWorkMode()) {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    if (this.isStudentMode() || this.isGradingMode() || this.isGradingRevisionMode()) {
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    }

    if (this.isGradingMode() || this.isGradingRevisionMode() || this.isOnlyShowWorkMode()) {
      this.showAddToNotebookButton = false;
    } else if (this.isAuthoringMode()) {
      if (this.authoringComponentContent.showAddToNotebookButton == null) {
        this.authoringComponentContent.showAddToNotebookButton = true;
      }
      this.authoringConstructor();
    }

    this.registerListeners();
    this.registerComponentWithParentNode();
  }

  isStudentMode() {
    return this.mode === 'student';
  }

  isAuthoringMode() {
    return this.mode === 'authoring';
  }

  isGradingMode() {
    return this.mode === 'grading';
  }

  isGradingRevisionMode() {
    return this.mode === 'gradingRevision';
  }

  isOnlyShowWorkMode() {
    return this.mode === 'onlyShowWork';
  }

  registerListeners() {
    this.$scope.$on('annotationSavedToServer', (event, args) => {
      const annotation = args.annotation;
      if (this.isEventTargetThisComponent(annotation)) {
        this.latestAnnotations = this.AnnotationService
          .getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      }
    });

    this.$scope.$on('nodeSubmitClicked', (event, args) => {
      if (this.nodeId === args.nodeId) {
        this.handleNodeSubmit();
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', (event, args) => {
      this.cleanupBeforeExiting(event, args);
    });

    this.registerStudentWorkSavedToServerListener();
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

  authoringConstructor() {
    this.isPromptVisible = true;
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
    this.summernoteRubricHTML = this.componentContent.rubric;

    const insertAssetString = this.$translate('INSERT_ASSET');
    const InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);
    this.summernoteRubricOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
        ['customButton', ['insertAssetButton']]
      ],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    this.registerAuthoringListeners();
    this.updateAdvancedAuthoringView();
  }

  registerAuthoringListeners() {
    this.$scope.$watch(
        () => {
          return this.authoringComponentContent
        },
        (newValue, oldValue) => {
          this.handleAuthoringComponentContentChanged(newValue, oldValue);
        },
        true
    );

    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (this.componentId === args.componentId) {
        this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
        this.UtilService.hideJSONValidMessage();
      }
    });

    this.$scope.$on('assetSelected', (event, args) => {
      this.assetSelected(event, args);
    });
  }

  handleAuthoringComponentContentChanged(newValue, oldValue) {
    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    this.latestAnnotations = null;
    this.isDirty = false;
    this.isSubmitDirty = false;
    this.submitCounter = 0;
  }

  getFullAssetPath(fileName) {
    const assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    return assetsDirectoryPath + '/' + fileName;
  }

  getSummernoteId(args) {
    let summernoteId = '';
    if (args.target == 'prompt') {
      summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
    } else if (args.target == 'rubric') {
      summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
    }
    return summernoteId;
  }

  restoreSummernoteCursorPosition(summernoteId) {
    $('#' + summernoteId).summernote('editor.restoreRange');
    $('#' + summernoteId).summernote('editor.focus');
  }

  insertImageIntoSummernote(summernoteId, fullAssetPath, fileName) {
    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
  }

  insertVideoIntoSummernote(summernoteId, fullAssetPath) {
    var videoElement = document.createElement('video');
    videoElement.controls = 'true';
    videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
    $('#' + summernoteId).summernote('insertNode', videoElement);
  }

  assetSelected(event, args) {
    if (this.isEventTargetThisComponent(args)) {
      if (args.target === 'rubric') {
        const fileName = args.assetItem.fileName;
        const summernoteId = this.getSummernoteId(args);
        this.restoreSummernoteCursorPosition(summernoteId);
        const fullAssetPath = this.getFullAssetPath(fileName);
        if (this.UtilService.isImage(fileName)) {
          this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
        }
      }
    }
    this.$mdDialog.hide();
  }

  registerComponentWithParentNode() {
    if (this.$scope.$parent.nodeController != null) {
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }
  }

  cleanupBeforeExiting() {

  }

  broadcastDoneRenderingComponent() {
    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  registerStudentWorkSavedToServerListener() {
    this.$scope.$on('studentWorkSavedToServer', (event, args) => {
      this.handleStudentWorkSavedToServer(event, args);
    });
  }

  handleStudentWorkSavedToServer(event, args) {
    const componentState = args.studentWork;
    if (this.isForThisComponent(componentState)) {
      this.setIsDirty(false);
      this.emitComponentDirty(this.getIsDirty());
      const clientSaveTime = this.ConfigService.convertToClientTimestamp(componentState.serverSaveTime);
      if (componentState.isSubmit) {
        this.setSubmittedMessage(clientSaveTime);
        this.lockIfNecessary();
        this.setIsSubmitDirty(false);
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: this.isSubmitDirty});
      } else if (componentState.isAutoSave) {
        this.setAutoSavedMessage(clientSaveTime);
      } else {
        this.setSavedMessage(clientSaveTime);
      }
    }
    this.handleStudentWorkSavedToServerAdditionalProcessing(event, args);
  }

  handleStudentWorkSavedToServerAdditionalProcessing(event, args) {

  }

  handleNodeSubmit() {
    this.isSubmit = true;
  }

  getPrompt() {
    return this.componentContent.prompt;
  }

  saveButtonClicked() {
    this.isSubmit = false;

    // tell the parent node to save
    this.$scope.$emit('componentSaveTriggered',
        {nodeId: this.nodeId, componentId: this.componentId});
  }

  submitButtonClicked() {
    this.submit('componentSubmitButton');
  }

  /**
   * A submit was triggered by the component submit button or node submit button.
   * @param {string} submitTriggeredBy What triggered the submit.
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {
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

  disableSubmitButton() {
    this.isSubmitButtonDisabled = true;
  }

  performSubmit(submitTriggeredBy) {
    this.setIsSubmit(true);
    this.incrementSubmitCounter();

    if (!this.canSubmit()) {
      this.disableSubmitButton();
    }

    if (this.isAuthoringMode()) {
      /*
       * We are in authoring mode so we will set values appropriately
       * here because the 'componentSubmitTriggered' event won't
       * work in authoring mode.
       */
      this.setIsDirty(false);
      this.setIsSubmitDirty(false);
      this.createComponentState('submit');
    } else {
      if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
        this.emitComponentSubmitTriggered();
      }
    }
  }

  hasSubmitMessage() {
    return false;
  }

  incrementSubmitCounter() {
    this.submitCounter++;
  }

  emitComponentSubmitTriggered() {
    this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
  }

  disableComponentIfNecessary() {
    if (this.isLockAfterSubmit()) {
      const componentStates = this.StudentDataService
          .getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
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

  studentDataChanged(isCompleted = false) {
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
      if (componentState.isCompleted) {
        this.emitComponentCompleted(componentState);
      }
    });
  }

  emitComponentStudentDataChanged(componentState) {
    this.$scope.$emit('componentStudentDataChanged',
        {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});
  }

  emitComponentCompleted(componentState) {
    this.$scope.$emit('componentCompleted',
        {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});
  }

  processLatestStudentWork() {
    const latestComponentState =
        this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

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
    this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: isDirty});
  }

  emitComponentSubmitDirty(isDirty) {
    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: isDirty});
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
        const componentState =
            this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
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
        connectedComponent.nodeId, connectedComponent.componentId);
      const connectedComponentsAndComponentState = {
        connectedComponent: connectedComponent,
        componentState: this.UtilService.makeCopyOfJSONObject(componentState)
      };
      connectedComponentsAndTheirComponentStates.push(connectedComponentsAndComponentState);
    }
    return connectedComponentsAndTheirComponentStates;
  }

  showCopyPublicNotebookItemButton() {
    return this.ProjectService.isSpaceExists("public");
  }

  copyPublicNotebookItemButtonClicked(event) {
    this.$rootScope.$broadcast('openNotebook',
      { nodeId: this.nodeId, componentId: this.componentId, insertMode: true, requester: this.nodeId + '-' + this.componentId, visibleSpace: "public" });
  }

  importWorkByStudentWorkId(studentWorkId) {
    this.StudentDataService.getStudentWorkById(studentWorkId).then((componentState) => {
      if (componentState != null) {
        this.setStudentWork(componentState);
        this.setParentStudentWorkIdToCurrentStudentWork(studentWorkId);
        this.$rootScope.$broadcast('closeNotebook');
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
    return this.isNotebookEnabled() && this.isStudentNoteClippingEnabled();
  }

  /**
   * Set the show submit button value
   * @param show whether to show the submit button
   */
  setShowSubmitButtonValue(show) {

    if (show == null || show == false) {
      // we are hiding the submit button
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
      // we are showing the submit button
      this.authoringComponentContent.showSaveButton = true;
      this.authoringComponentContent.showSubmitButton = true;
    }

    /*
     * notify the parent node that this component is changing its
     * showSubmitButton value so that it can show save buttons on the
     * step or sibling components accordingly
     */
    this.$scope.$emit('componentShowSubmitButtonValueChanged', {nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show});
  }

  /**
   * The showSubmitButton value has changed
   */
  showSubmitButtonValueChanged() {

    /*
     * perform additional processing for when we change the showSubmitButton
     * value
     */
    this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  authoringAddConnectedComponent() {
    const connectedComponent = this.createConnectedComponent();
    this.addConnectedComponent(connectedComponent);
    this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  addConnectedComponent(connectedComponent) {
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(connectedComponent);
  }

  createConnectedComponent() {
    return {
      nodeId: this.nodeId,
      componentId: null,
      type: null
    };
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    if (connectedComponent != null) {
      let components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        let numberOfAllowedComponents = 0;
        let allowedComponent = null;
        for (let component of components) {
          if (component != null) {
            if (this.isConnectedComponentTypeAllowed(component.type) &&
              component.id != this.componentId) {
              // we have found a viable component we can connect to
              numberOfAllowedComponents += 1;
              allowedComponent = component;
            }
          }
        }

        if (numberOfAllowedComponents == 1) {
          /*
           * there is only one viable component to connect to so we
           * will use it
           */
          connectedComponent.componentId = allowedComponent.id;
          connectedComponent.type = 'importWork';
        }
      }
    }
    this.authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent);
  }

  authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
    if (connectedComponent.componentId != null) {
      connectedComponent.type = 'importWork';
    }
    this.authoringAutomaticallySetConnectedComponentFieldsIfPossible(connectedComponent);
  }

  authoringAutomaticallySetConnectedComponentFieldsIfPossible(connectedComponent) {

  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  authoringDeleteConnectedComponent(index) {

    // ask the author if they are sure they want to delete the connected component
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

    if (answer) {
      // the author answered yes to delete

      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the connected component type
   * @param connectedComponent get the component type of this connected component
   * @return the connected component type
   */
  authoringGetConnectedComponentType(connectedComponent) {

    var connectedComponentType = null;

    if (connectedComponent != null) {

      // get the node id and component id of the connected component
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;

      // get the component
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (component != null) {
        // get the component type
        connectedComponentType = component.type;
      }
    }

    return connectedComponentType;
  }

  /**
   * The connected component node id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentNodeIdChanged(connectedComponent) {
    if (connectedComponent != null) {
      connectedComponent.componentId = null;
      connectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  authoringConnectedComponentComponentIdChanged(connectedComponent) {
    this.authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  /**
   * The connected component type has changed
   * @param connectedComponent the connected component that changed
   */
  authoringConnectedComponentTypeChanged(connectedComponent) {

    if (connectedComponent != null) {

      if (connectedComponent.type === 'importWork') {
        /*
         * the type has changed to import work
         */
      } else if (connectedComponent.type === 'showWork') {
        /*
         * the type has changed to show work
         */
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Check if we are allowed to connect to this component type
   * @param componentType the component type
   * @return whether we can connect to the component type
   */
  isConnectedComponentTypeAllowed(componentType) {

    if (componentType != null) {

      let allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

      // loop through the allowed connected component types
      for (let a = 0; a < allowedConnectedComponentTypes.length; a++) {
        let allowedConnectedComponentType = allowedConnectedComponentTypes[a];

        if (allowedConnectedComponentType != null) {
          if (componentType == allowedConnectedComponentType.type) {
            // the component type is allowed
            return true;
          }
        }
      }
    }

    return false;
  }

  addTag() {
    if (this.authoringComponentContent.tags == null) {
      this.authoringComponentContent.tags = [];
    }
    this.authoringComponentContent.tags.push('');
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag up
   * @param index the index of the tag to move up
   */
  moveTagUp(index) {
    if (index > 0) {
      // the index is not at the top so we can move it up
      let tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a tag down
   * @param index the index of the tag to move down
   */
  moveTagDown(index) {
    if (index < this.authoringComponentContent.tags.length - 1) {
      // the index is not at the bottom so we can move it down
      let tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      this.authoringViewComponentChanged();
    }
  }

  deleteTag(indexOfTagToDelete) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisTag'))) {
      this.authoringComponentContent.tags.splice(indexOfTagToDelete, 1);
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The author has changed the rubric
   */
  summernoteRubricHTMLChanged() {

    // get the summernote rubric html
    let html = this.summernoteRubricHTML;

    /*
     * remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     */
    html = this.ConfigService.removeAbsoluteAssetPaths(html);

    /*
     * replace <a> and <button> elements with <wiselink> elements when
     * applicable
     */
    html = this.UtilService.insertWISELinks(html);

    // update the component rubric
    this.authoringComponentContent.rubric = html;

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */
  authoringViewComponentChanged() {

    // update the JSON string in the advanced authoring view textarea
    this.updateAdvancedAuthoringView();

    /*
     * notify the parent node that the content has changed which will save
     * the project to the server
     */
    this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
  }

  /**
   * Update the component JSON string that will be displayed in the advanced authoring view textarea
   */
  updateAdvancedAuthoringView() {
    this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
  }

  /**
   * The component has changed in the advanced authoring view so we will update
   * the component and save the project.
   */
  advancedAuthoringViewComponentChanged() {
    try {
      /*
       * create a new component by converting the JSON string in the advanced
       * authoring view into a JSON object
       */
      var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      // replace the component in the project
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

      // set the new component into the controller
      this.componentContent = editedComponentContent;

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    } catch(e) {
      this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
    }
  }

  showJSONButtonClicked() {
    if (this.showJSONAuthoring) {
      // we were showing the JSON authoring view and now we want to hide it
      if (this.isJSONValid()) {
        this.saveJSONAuthoringViewChanges();
        this.toggleJSONAuthoringView();
        this.UtilService.hideJSONValidMessage();
      } else {
        let isRollback = confirm(this.$translate('jsonInvalidErrorMessage'));
        if (isRollback) {
          // the author wants to revert back to the last valid JSON
          this.toggleJSONAuthoringView();
          this.UtilService.hideJSONValidMessage();
          this.isJSONStringChanged = false;
          this.rollbackToRecentValidJSON();
          this.saveJSONAuthoringViewChanges();
        }
      }
    } else {
      // we were not showing the JSON authoring view and now we want to show it
      this.toggleJSONAuthoringView();
      this.rememberRecentValidJSON();
    }
  }

  toggleJSONAuthoringView() {
    this.showJSONAuthoring = !this.showJSONAuthoring;
  }

  authoringJSONChanged() {
    this.isJSONStringChanged = true;
    if (this.isJSONValid()) {
      this.UtilService.showJSONValidMessage();
      this.rememberRecentValidJSON();
    } else {
      this.UtilService.showJSONInvalidMessage();
    }
  }

  isJSONValid() {
    try {
      angular.fromJson(this.authoringComponentContentJSONString);
      return true;
    } catch (e) {
      return false;
    }
  }

  rememberRecentValidJSON() {
    this.authoringValidComponentContentJSONString = this.authoringComponentContentJSONString;
  }

  rollbackToRecentValidJSON() {
    this.authoringComponentContentJSONString = this.authoringValidComponentContentJSONString;
  }

  /**
   * The component has changed in the advanced authoring view so we will update
   * the component and save the project.
   */
  saveJSONAuthoringViewChanges() {
    try {
      const editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);
      this.componentContent = editedComponentContent;
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });
      this.isJSONStringChanged = false;
    } catch(e) {
      this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
    }
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
    this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
      const attachment = {
        studentAssetId: copiedAsset.id,
        iconURL: copiedAsset.iconURL
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
      return this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
    } else if (type === 'autoComment') {
      return this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
    }
  }

  updateLatestScoreAnnotation(annotation) {
    this.latestAnnotations.score = annotation;
  }

  updateLatestCommentAnnotation(annotation) {
    this.latestAnnotations.comment = annotation;
  }
}

ComponentController.$inject = [];
export default ComponentController;
