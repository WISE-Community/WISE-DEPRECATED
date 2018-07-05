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

    if (this.isGradingMode() || this.mode === 'gradingRevision' || this.mode === 'onlyShowWork') {
      this.showAddToNotebookButton = false;
    } else if (this.isAuthoringMode()) {
      if (this.authoringComponentContent.showAddToNotebookButton == null) {
        this.authoringComponentContent.showAddToNotebookButton = true;
      }
      this.authoringConstructor();
    }

    this.registerListeners();
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

    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (this.componentId === args.componentId) {
        this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
        this.UtilService.hideJSONValidMessage();
      }
    });

    this.updateAdvancedAuthoringView();
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

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', (event, args) => {
      this.cleanupBeforeExiting();
    });

    this.registerStudentWorkSavedToServerListener();
  }

  cleanupBeforeExiting() {

  }

  broadcastDoneRenderingComponent() {
    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
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
          this.setSubmittedMessage(clientSaveTime);
          this.lockIfNecessary();
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: this.isSubmitDirty});
        } else if (componentState.isAutoSave) {
          this.setAutoSavedMessage(clientSaveTime);
        } else {
          this.setSavedMessage(clientSaveTime);
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
    this.clearSaveText();

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

  /**
   * Add a connected component
   */
  authoringAddConnectedComponent() {

    /*
     * create the new connected component object that will contain a
     * node id and component id
     */
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.type = null;
    this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

    // initialize the array of connected components if it does not exist yet
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }

    // add the connected component
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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

  /**
   * The connected component component id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentComponentIdChanged(connectedComponent) {

    if (connectedComponent != null) {

      // default the type to import work
      connectedComponent.type = 'importWork';

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The connected component type has changed
   * @param connectedComponent the connected component that changed
   */
  authoringConnectedComponentTypeChanged(connectedComponent) {

    if (connectedComponent != null) {

      if (connectedComponent.type == 'importWork') {
        /*
         * the type has changed to import work
         */
      } else if (connectedComponent.type == 'showWork') {
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
    var html = this.summernoteRubricHTML;

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
  };

  /**
   * Update the component JSON string that will be displayed in the advanced authoring view textarea
   */
  updateAdvancedAuthoringView() {
    this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
  };

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
  };

  /**
   * The show JSON button was clicked to show or hide the JSON authoring
   */
  showJSONButtonClicked() {
    // toggle the JSON authoring textarea
    this.showJSONAuthoring = !this.showJSONAuthoring;

    if (this.jsonStringChanged && !this.showJSONAuthoring) {
      /*
       * the author has changed the JSON and has just closed the JSON
       * authoring view so we will save the component
       */
      this.advancedAuthoringViewComponentChanged();

      // scroll to the top of the component
      this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

      this.jsonStringChanged = false;
    }
  }

  /**
   * The author has changed the JSON manually in the advanced view
   */
  authoringJSONChanged() {
    this.jsonStringChanged = true;
  }

  isEventTargetThisComponent(args) {
    return this.nodeId == args.nodeId && this.componentId == args.componentId;
  }

  createSummernoteRubricId() {
    return 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
  }

  restoreSummernoteCursorPosition(summernoteId) {
    $('#' + summernoteId).summernote('editor.restoreRange');
    $('#' + summernoteId).summernote('editor.focus');
  }

  insertImageIntoSummernote(fullAssetPath, fileName) {
    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
  }

  insertVideoIntoSummernote(fullAssetPath) {
    const videoElement = document.createElement('video');
    videoElement.controls = 'true';
    videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
    $('#' + summernoteId).summernote('insertNode', videoElement);
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

  setIsSubmitTrue() {
    this.setIsSubmit(true);
  }

  setIsSubmitFalse() {
    this.setIsSubmit(false);
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
}

ComponentController.$inject = [];

export default ComponentController;
