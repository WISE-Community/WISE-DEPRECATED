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

    // whether the student work has changed since last submit
    this.isSubmitDirty = false;

    // whether the student work is for a submit
    this.isSubmit = false;

    this.saveMessage = {
      text: '',
      time: ''
    };

    // whether students can attach files to their work
    this.isStudentAttachmentEnabled = false;

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

    if (this.mode === 'grading' || this.mode === 'gradingRevision' || this.mode === 'onlyShowWork') {
      this.showAddToNotebookButton = false;
    } else if (this.mode === 'authoring') {
      if (this.authoringComponentContent.showAddToNotebookButton == null) {
        this.authoringComponentContent.showAddToNotebookButton = true;
      }
    }

    this.registerListeners();
  }

  registerListeners() {
    this.$scope.$on('annotationSavedToServer', (event, args) => {
      const annotation = args.annotation;
      if (this.nodeId === annotation.nodeId &&
          this.componentId === annotation.componentId) {
        this.latestAnnotations = this.AnnotationService
            .getLatestComponentAnnotations(this.nodeId, this.componentId,
                this.workgroupId);
      }
    });

    this.$scope.$on('nodeSubmitClicked', (event, args) => {
      if (this.nodeId === args.nodeId) {
        this.handleNodeSubmit();
      }
    });

    this.registerStudentWorkSavedToServerListener();
  }

  registerStudentWorkSavedToServerListener() {
    this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {
      const componentState = args.studentWork;
      if (componentState && this.nodeId === componentState.nodeId
          && this.componentId === componentState.componentId) {
        this.isDirty = false;
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: this.isDirty});
        const clientSaveTime = this.ConfigService.convertToClientTimestamp(componentState.serverSaveTime);
        if (componentState.isSubmit) {
          this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);
          this.lockIfNecessary();
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: this.isSubmitDirty});
        } else if (componentState.isAutoSave) {
          this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
        } else {
          this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
        }
      }
    }));
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

  submit(submitTriggeredBy) {

  }

  incrementSubmitCounter() {
    this.submitCounter++;
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

  studentDataChanged() {
    /*
     * set the dirty flags so we will know we need to save or submit the
     * student work later
     */
    this.isDirty = true;
    this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

    this.isSubmitDirty = true;
    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
    this.setSaveMessage('', null);

    /*
     * the student work in this component has changed so we will tell
     * the parent node that the student data will need to be saved.
     * this will also notify connected parts that this component's student
     * data has changed.
     */
    var action = 'change';

    // create a component state populated with the student data
    this.createComponentState(action).then((componentState) => {
      this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});
    });
  }

  /**
   * Set the message next to the save button
   * @param message the message to display
   * @param time the time to display
   */
  setSaveMessage(message, time) {
    this.saveMessage.text = message;
    this.saveMessage.time = time;
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
        if (connectedComponent.type == 'showWork') {
          this.isDisabled = true;
        }
      }
      this.setStudentWork(this.createMergedComponentState(componentStates));
      this.handleConnectedComponentsPostProcess();
      this.studentDataChanged();
    }
  }

  handleConnectedComponentsPostProcess() {
    // overriden by children
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

  isAddToNotebookEnabled() {
    return this.isNotebookEnabled() && this.showAddToNotebookButton;
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
}

ComponentController.$inject = [];

export default ComponentController;
