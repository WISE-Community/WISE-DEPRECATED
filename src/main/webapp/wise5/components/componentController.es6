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
    this.idToOrder = this.ProjectService.idToOrder;
    this.mode = this.$scope.mode;
    this.authoringComponentContent = this.$scope.authoringComponentContent;
    this.isShowPreviousWork = false;
    this.showAdvancedAuthoring = false;
    this.showJSONAuthoring = false;
    this.isDisabled = false;
    this.isDirty = false;

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

    // clear out the save message
    this.setSaveMessage('', null);

    // get this part id
    var componentId = this.getComponentId();

    /*
     * the student work in this component has changed so we will tell
     * the parent node that the student data will need to be saved.
     * this will also notify connected parts that this component's student
     * data has changed.
     */
    var action = 'change';

    // create a component state populated with the student data
    this.createComponentState(action).then((componentState) => {
      this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: componentId, componentState: componentState});
    });
  }
}

ComponentController.$inject = [];

export default ComponentController;
