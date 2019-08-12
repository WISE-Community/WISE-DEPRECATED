"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ComponentController =
/*#__PURE__*/
function () {
  function ComponentController($filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, ComponentController);

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
    this.showAddToNotebookButton = this.componentContent.showAddToNotebookButton == null ? true : this.componentContent.showAddToNotebookButton;

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

  _createClass(ComponentController, [{
    key: "isStudentMode",
    value: function isStudentMode() {
      return this.mode === 'student';
    }
  }, {
    key: "isAuthoringMode",
    value: function isAuthoringMode() {
      return this.mode === 'authoring';
    }
  }, {
    key: "isGradingMode",
    value: function isGradingMode() {
      return this.mode === 'grading';
    }
  }, {
    key: "isGradingRevisionMode",
    value: function isGradingRevisionMode() {
      return this.mode === 'gradingRevision';
    }
  }, {
    key: "isOnlyShowWorkMode",
    value: function isOnlyShowWorkMode() {
      return this.mode === 'onlyShowWork';
    }
  }, {
    key: "registerListeners",
    value: function registerListeners() {
      var _this = this;

      this.$scope.$on('annotationSavedToServer', function (event, args) {
        var annotation = args.annotation;

        if (_this.isEventTargetThisComponent(annotation)) {
          _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
        }
      });
      this.$scope.$on('nodeSubmitClicked', function (event, args) {
        if (_this.nodeId === args.nodeId) {
          _this.handleNodeSubmit();
        }
      });
      /**
       * Listen for the 'exitNode' event which is fired when the student
       * exits the parent node. This will perform any necessary cleanup
       * when the student exits the parent node.
       */

      this.$scope.$on('exitNode', function (event, args) {
        _this.cleanupBeforeExiting(event, args);
      });
      this.registerStudentWorkSavedToServerListener();
    }
  }, {
    key: "initializeScopeGetComponentState",
    value: function initializeScopeGetComponentState(scope, childControllerName) {
      var _this2 = this;

      scope.getComponentState = function (isSubmit) {
        var deferred = _this2.$q.defer();

        var childController = scope[childControllerName];

        if (_this2.hasDirtyWorkToSendToParent(childController, isSubmit)) {
          var action = _this2.getDirtyWorkToSendToParentAction(childController, isSubmit);

          childController.createComponentState(action).then(function (componentState) {
            deferred.resolve(componentState);
          });
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      };
    }
  }, {
    key: "hasDirtyWorkToSendToParent",
    value: function hasDirtyWorkToSendToParent(childController, isSubmit) {
      return isSubmit && childController.isSubmitDirty || childController.isDirty;
    }
  }, {
    key: "getDirtyWorkToSendToParentAction",
    value: function getDirtyWorkToSendToParentAction(childController, isSubmit) {
      if (isSubmit && childController.isSubmitDirty) {
        return 'submit';
      } else if (childController.isDirty) {
        return 'save';
      }

      return 'change';
    }
  }, {
    key: "authoringConstructor",
    value: function authoringConstructor() {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
      this.summernoteRubricHTML = this.componentContent.rubric;
      var insertAssetString = this.$translate('INSERT_ASSET');
      var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);
      this.summernoteRubricOptions = {
        toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
        height: 300,
        disableDragAndDrop: true,
        buttons: {
          insertAssetButton: InsertAssetButton
        }
      };
      this.registerAuthoringListeners();
      this.updateAdvancedAuthoringView();
    }
  }, {
    key: "registerAuthoringListeners",
    value: function registerAuthoringListeners() {
      var _this3 = this;

      this.$scope.$watch(function () {
        return _this3.authoringComponentContent;
      }, function (newValue, oldValue) {
        _this3.handleAuthoringComponentContentChanged(newValue, oldValue);
      }, true);
      this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
        if (_this3.componentId === args.componentId) {
          _this3.showAdvancedAuthoring = !_this3.showAdvancedAuthoring;

          _this3.UtilService.hideJSONValidMessage();
        }
      });
      this.$scope.$on('assetSelected', function (event, args) {
        _this3.assetSelected(event, args);
      });
    }
  }, {
    key: "handleAuthoringComponentContentChanged",
    value: function handleAuthoringComponentContentChanged(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.latestAnnotations = null;
      this.isDirty = false;
      this.isSubmitDirty = false;
      this.submitCounter = 0;
    }
  }, {
    key: "getFullAssetPath",
    value: function getFullAssetPath(fileName) {
      var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
      return assetsDirectoryPath + '/' + fileName;
    }
  }, {
    key: "getSummernoteId",
    value: function getSummernoteId(args) {
      var summernoteId = '';

      if (args.target == 'prompt') {
        summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
      } else if (args.target == 'rubric') {
        summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
      }

      return summernoteId;
    }
  }, {
    key: "restoreSummernoteCursorPosition",
    value: function restoreSummernoteCursorPosition(summernoteId) {
      $('#' + summernoteId).summernote('editor.restoreRange');
      $('#' + summernoteId).summernote('editor.focus');
    }
  }, {
    key: "insertImageIntoSummernote",
    value: function insertImageIntoSummernote(summernoteId, fullAssetPath, fileName) {
      $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
    }
  }, {
    key: "insertVideoIntoSummernote",
    value: function insertVideoIntoSummernote(summernoteId, fullAssetPath) {
      var videoElement = document.createElement('video');
      videoElement.controls = 'true';
      videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
      $('#' + summernoteId).summernote('insertNode', videoElement);
    }
  }, {
    key: "assetSelected",
    value: function assetSelected(event, args) {
      if (this.isEventTargetThisComponent(args)) {
        if (args.target === 'rubric') {
          var fileName = args.assetItem.fileName;
          var summernoteId = this.getSummernoteId(args);
          this.restoreSummernoteCursorPosition(summernoteId);
          var fullAssetPath = this.getFullAssetPath(fileName);

          if (this.UtilService.isImage(fileName)) {
            this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
          } else if (this.UtilService.isVideo(fileName)) {
            this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
          }
        }
      }

      this.$mdDialog.hide();
    }
  }, {
    key: "registerComponentWithParentNode",
    value: function registerComponentWithParentNode() {
      if (this.$scope.$parent.nodeController != null) {
        this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
      }
    }
  }, {
    key: "cleanupBeforeExiting",
    value: function cleanupBeforeExiting() {}
  }, {
    key: "broadcastDoneRenderingComponent",
    value: function broadcastDoneRenderingComponent() {
      this.$rootScope.$broadcast('doneRenderingComponent', {
        nodeId: this.nodeId,
        componentId: this.componentId
      });
    }
  }, {
    key: "registerStudentWorkSavedToServerListener",
    value: function registerStudentWorkSavedToServerListener() {
      var _this4 = this;

      this.$scope.$on('studentWorkSavedToServer', function (event, args) {
        _this4.handleStudentWorkSavedToServer(event, args);
      });
    }
  }, {
    key: "handleStudentWorkSavedToServer",
    value: function handleStudentWorkSavedToServer(event, args) {
      var componentState = args.studentWork;

      if (this.isForThisComponent(componentState)) {
        this.setIsDirty(false);
        this.emitComponentDirty(this.getIsDirty());
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(componentState.serverSaveTime);

        if (componentState.isSubmit) {
          this.setSubmittedMessage(clientSaveTime);
          this.lockIfNecessary();
          this.setIsSubmitDirty(false);
          this.$scope.$emit('componentSubmitDirty', {
            componentId: this.componentId,
            isDirty: this.isSubmitDirty
          });
        } else if (componentState.isAutoSave) {
          this.setAutoSavedMessage(clientSaveTime);
        } else {
          this.setSavedMessage(clientSaveTime);
        }
      }

      this.handleStudentWorkSavedToServerAdditionalProcessing(event, args);
    }
  }, {
    key: "handleStudentWorkSavedToServerAdditionalProcessing",
    value: function handleStudentWorkSavedToServerAdditionalProcessing(event, args) {}
  }, {
    key: "handleNodeSubmit",
    value: function handleNodeSubmit() {
      this.isSubmit = true;
    }
  }, {
    key: "getPrompt",
    value: function getPrompt() {
      return this.componentContent.prompt;
    }
  }, {
    key: "saveButtonClicked",
    value: function saveButtonClicked() {
      this.isSubmit = false; // tell the parent node to save

      this.$scope.$emit('componentSaveTriggered', {
        nodeId: this.nodeId,
        componentId: this.componentId
      });
    }
  }, {
    key: "submitButtonClicked",
    value: function submitButtonClicked() {
      this.submit('componentSubmitButton');
    }
    /**
     * A submit was triggered by the component submit button or node submit button.
     * @param {string} submitTriggeredBy What triggered the submit.
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */

  }, {
    key: "submit",
    value: function submit(submitTriggeredBy) {
      if (this.getIsSubmitDirty()) {
        var isPerformSubmit = true;

        if (this.hasMaxSubmitCount()) {
          var numberOfSubmitsLeft = this.getNumberOfSubmitsLeft();

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
  }, {
    key: "disableSubmitButton",
    value: function disableSubmitButton() {
      this.isSubmitButtonDisabled = true;
    }
  }, {
    key: "performSubmit",
    value: function performSubmit(submitTriggeredBy) {
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
  }, {
    key: "hasSubmitMessage",
    value: function hasSubmitMessage() {
      return false;
    }
  }, {
    key: "incrementSubmitCounter",
    value: function incrementSubmitCounter() {
      this.submitCounter++;
    }
  }, {
    key: "emitComponentSubmitTriggered",
    value: function emitComponentSubmitTriggered() {
      this.$scope.$emit('componentSubmitTriggered', {
        nodeId: this.nodeId,
        componentId: this.componentId
      });
    }
  }, {
    key: "disableComponentIfNecessary",
    value: function disableComponentIfNecessary() {
      if (this.isLockAfterSubmit()) {
        var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

        if (this.NodeService.isWorkSubmitted(componentStates)) {
          this.isDisabled = true;
        }
      }
    }
  }, {
    key: "lockIfNecessary",
    value: function lockIfNecessary() {
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }
    }
  }, {
    key: "isLockAfterSubmit",
    value: function isLockAfterSubmit() {
      return this.componentContent.lockAfterSubmit;
    }
  }, {
    key: "studentDataChanged",
    value: function studentDataChanged() {
      var isCompleted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.setIsDirtyAndBroadcast();
      this.setIsSubmitDirtyAndBroadcast();
      this.clearSaveText();
      var action = 'change';
      this.createComponentStateAndBroadcast(action);
    }
  }, {
    key: "setIsDirtyAndBroadcast",
    value: function setIsDirtyAndBroadcast() {
      this.setIsDirty(true);
      this.emitComponentDirty(true);
    }
  }, {
    key: "setIsSubmitDirtyAndBroadcast",
    value: function setIsSubmitDirtyAndBroadcast() {
      this.setIsSubmitDirty(true);
      this.emitComponentSubmitDirty(true);
    }
    /*
     * the student work in this component has changed so we will tell
     * the parent node that the student data will need to be saved.
     * this will also notify connected parts that this component's student
     * data has changed.
     */

  }, {
    key: "createComponentStateAndBroadcast",
    value: function createComponentStateAndBroadcast(action) {
      var _this5 = this;

      this.createComponentState(action).then(function (componentState) {
        _this5.emitComponentStudentDataChanged(componentState);

        if (componentState.isCompleted) {
          _this5.emitComponentCompleted(componentState);
        }
      });
    }
  }, {
    key: "emitComponentStudentDataChanged",
    value: function emitComponentStudentDataChanged(componentState) {
      this.$scope.$emit('componentStudentDataChanged', {
        nodeId: this.nodeId,
        componentId: this.componentId,
        componentState: componentState
      });
    }
  }, {
    key: "emitComponentCompleted",
    value: function emitComponentCompleted(componentState) {
      this.$scope.$emit('componentCompleted', {
        nodeId: this.nodeId,
        componentId: this.componentId,
        componentState: componentState
      });
    }
  }, {
    key: "processLatestStudentWork",
    value: function processLatestStudentWork() {
      var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (latestComponentState) {
        var serverSaveTime = latestComponentState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

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
  }, {
    key: "setIsSubmitDirty",
    value: function setIsSubmitDirty(isDirty) {
      this.isSubmitDirty = isDirty;
    }
  }, {
    key: "getIsSubmitDirty",
    value: function getIsSubmitDirty() {
      return this.isSubmitDirty;
    }
  }, {
    key: "emitComponentDirty",
    value: function emitComponentDirty(isDirty) {
      this.$scope.$emit('componentDirty', {
        componentId: this.componentId,
        isDirty: isDirty
      });
    }
  }, {
    key: "emitComponentSubmitDirty",
    value: function emitComponentSubmitDirty(isDirty) {
      this.$scope.$emit('componentSubmitDirty', {
        componentId: this.componentId,
        isDirty: isDirty
      });
    }
  }, {
    key: "setSavedMessage",
    value: function setSavedMessage(time) {
      this.setSaveText(this.$translate('SAVED'), time);
    }
  }, {
    key: "setAutoSavedMessage",
    value: function setAutoSavedMessage(time) {
      this.setSaveText(this.$translate('AUTO_SAVED'), time);
    }
  }, {
    key: "setSubmittedMessage",
    value: function setSubmittedMessage(time) {
      this.setSaveText(this.$translate('SUBMITTED'), time);
    }
  }, {
    key: "setSaveText",
    value: function setSaveText(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: "clearSaveText",
    value: function clearSaveText() {
      this.setSaveText('', null);
    }
    /**
     * Get all the step node ids in the project
     * @returns {array} an array of step node id strings
     */

  }, {
    key: "getStepNodeIds",
    value: function getStepNodeIds() {
      return this.ProjectService.getNodeIds();
    }
    /**
     * Get the step number and title for a node
     * @param {string} get the step number and title for this node
     * @returns {string} the step number and title example "1.5: Read Information"
     */

  }, {
    key: "getNodePositionAndTitleByNodeId",
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }
    /**
     * Get the components in a step
     * @param {string} id of the step
     * @returns {array} an array of component objects
     */

  }, {
    key: "getComponentsByNodeId",
    value: function getComponentsByNodeId(nodeId) {
      return this.ProjectService.getComponentsByNodeId(nodeId);
    }
    /**
     * Check if a node is a step node
     * @param {string} nodeId the node id to check
     * @returns {boolean} whether the node is a step node
     */

  }, {
    key: "isApplicationNode",
    value: function isApplicationNode(nodeId) {
      return this.ProjectService.isApplicationNode(nodeId);
    }
    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */

  }, {
    key: "createComponentState",
    value: function createComponentState(action) {}
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

  }, {
    key: "createComponentStateAdditionalProcessing",
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
      /*
       * we don't need to perform any additional processing so we can resolve
       * the promise immediately
       */
      deferred.resolve(componentState);
    }
    /**
     * Import any work needed from connected components
     */

  }, {
    key: "handleConnectedComponents",
    value: function handleConnectedComponents() {
      var connectedComponents = this.componentContent.connectedComponents;

      if (connectedComponents != null) {
        var componentStates = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = connectedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var connectedComponent = _step.value;
            var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);

            if (componentState != null) {
              componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
            }

            if (connectedComponent.type === 'showWork') {
              this.isDisabled = true;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (componentStates.length > 0) {
          this.setStudentWork(this.createMergedComponentState(componentStates));
          this.handleConnectedComponentsPostProcess();
          this.studentDataChanged();
        }
      }
    }
  }, {
    key: "createMergedComponentState",
    value: function createMergedComponentState(componentStates) {
      return componentStates[0];
    }
  }, {
    key: "handleConnectedComponentsPostProcess",
    value: function handleConnectedComponentsPostProcess() {// overridden by children
    }
  }, {
    key: "getConnectedComponentsAndTheirComponentStates",
    value: function getConnectedComponentsAndTheirComponentStates() {
      var connectedComponentsAndTheirComponentStates = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.componentContent.connectedComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var connectedComponent = _step2.value;
          var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
          var connectedComponentsAndComponentState = {
            connectedComponent: connectedComponent,
            componentState: this.UtilService.makeCopyOfJSONObject(componentState)
          };
          connectedComponentsAndTheirComponentStates.push(connectedComponentsAndComponentState);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return connectedComponentsAndTheirComponentStates;
    }
  }, {
    key: "showCopyPublicNotebookItemButton",
    value: function showCopyPublicNotebookItemButton() {
      return this.ProjectService.isSpaceExists("public");
    }
  }, {
    key: "copyPublicNotebookItemButtonClicked",
    value: function copyPublicNotebookItemButtonClicked(event) {
      this.$rootScope.$broadcast('openNotebook', {
        nodeId: this.nodeId,
        componentId: this.componentId,
        insertMode: true,
        requester: this.nodeId + '-' + this.componentId,
        visibleSpace: "public"
      });
    }
  }, {
    key: "importWorkByStudentWorkId",
    value: function importWorkByStudentWorkId(studentWorkId) {
      var _this6 = this;

      this.StudentDataService.getStudentWorkById(studentWorkId).then(function (componentState) {
        if (componentState != null) {
          _this6.setStudentWork(componentState);

          _this6.setParentStudentWorkIdToCurrentStudentWork(studentWorkId);

          _this6.$rootScope.$broadcast('closeNotebook');
        }
      });
    }
  }, {
    key: "setParentStudentWorkIdToCurrentStudentWork",
    value: function setParentStudentWorkIdToCurrentStudentWork(studentWorkId) {
      this.parentStudentWorkIds = [studentWorkId];
    }
  }, {
    key: "isNotebookEnabled",
    value: function isNotebookEnabled() {
      return this.NotebookService.isNotebookEnabled();
    }
  }, {
    key: "isStudentNoteClippingEnabled",
    value: function isStudentNoteClippingEnabled() {
      return this.NotebookService.isStudentNoteClippingEnabled();
    }
  }, {
    key: "isAddToNotebookEnabled",
    value: function isAddToNotebookEnabled() {
      return this.isNotebookEnabled() && this.isStudentNoteClippingEnabled();
    }
    /**
     * Set the show submit button value
     * @param show whether to show the submit button
     */

  }, {
    key: "setShowSubmitButtonValue",
    value: function setShowSubmitButtonValue(show) {
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


      this.$scope.$emit('componentShowSubmitButtonValueChanged', {
        nodeId: this.nodeId,
        componentId: this.componentId,
        showSubmitButton: show
      });
    }
    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: "showSubmitButtonValueChanged",
    value: function showSubmitButtonValueChanged() {
      /*
       * perform additional processing for when we change the showSubmitButton
       * value
       */
      this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton); // the authoring component content has changed so we will save the project

      this.authoringViewComponentChanged();
    }
  }, {
    key: "authoringAddConnectedComponent",
    value: function authoringAddConnectedComponent() {
      var connectedComponent = this.createConnectedComponent();
      this.addConnectedComponent(connectedComponent);
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
      this.authoringViewComponentChanged();
    }
  }, {
    key: "addConnectedComponent",
    value: function addConnectedComponent(connectedComponent) {
      if (this.authoringComponentContent.connectedComponents == null) {
        this.authoringComponentContent.connectedComponents = [];
      }

      this.authoringComponentContent.connectedComponents.push(connectedComponent);
    }
  }, {
    key: "createConnectedComponent",
    value: function createConnectedComponent() {
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

  }, {
    key: "authoringAutomaticallySetConnectedComponentComponentIdIfPossible",
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);

        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = components[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var component = _step3.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
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
  }, {
    key: "authoringAutomaticallySetConnectedComponentTypeIfPossible",
    value: function authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
      if (connectedComponent.componentId != null) {
        connectedComponent.type = 'importWork';
      }

      this.authoringAutomaticallySetConnectedComponentFieldsIfPossible(connectedComponent);
    }
  }, {
    key: "authoringAutomaticallySetConnectedComponentFieldsIfPossible",
    value: function authoringAutomaticallySetConnectedComponentFieldsIfPossible(connectedComponent) {}
    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */

  }, {
    key: "authoringDeleteConnectedComponent",
    value: function authoringDeleteConnectedComponent(index) {
      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

      if (answer) {
        // the author answered yes to delete
        if (this.authoringComponentContent.connectedComponents != null) {
          this.authoringComponentContent.connectedComponents.splice(index, 1);
        } // the authoring component content has changed so we will save the project


        this.authoringViewComponentChanged();
      }
    }
    /**
     * Get the connected component type
     * @param connectedComponent get the component type of this connected component
     * @return the connected component type
     */

  }, {
    key: "authoringGetConnectedComponentType",
    value: function authoringGetConnectedComponentType(connectedComponent) {
      var connectedComponentType = null;

      if (connectedComponent != null) {
        // get the node id and component id of the connected component
        var nodeId = connectedComponent.nodeId;
        var componentId = connectedComponent.componentId; // get the component

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

  }, {
    key: "authoringConnectedComponentNodeIdChanged",
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
      if (connectedComponent != null) {
        connectedComponent.componentId = null;
        connectedComponent.type = null;
        this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent); // the authoring component content has changed so we will save the project

        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: "authoringConnectedComponentComponentIdChanged",
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {
      this.authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent);
      this.authoringViewComponentChanged();
    }
    /**
     * The connected component type has changed
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: "authoringConnectedComponentTypeChanged",
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {
      if (connectedComponent != null) {
        if (connectedComponent.type === 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type === 'showWork') {}
        /*
         * the type has changed to show work
         */
        // the authoring component content has changed so we will save the project


        this.authoringViewComponentChanged();
      }
    }
    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: "isConnectedComponentTypeAllowed",
    value: function isConnectedComponentTypeAllowed(componentType) {
      if (componentType != null) {
        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes; // loop through the allowed connected component types

        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

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
  }, {
    key: "addTag",
    value: function addTag() {
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

  }, {
    key: "moveTagUp",
    value: function moveTagUp(index) {
      if (index > 0) {
        // the index is not at the top so we can move it up
        var tag = this.authoringComponentContent.tags[index];
        this.authoringComponentContent.tags.splice(index, 1);
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
        this.authoringViewComponentChanged();
      }
    }
    /**
     * Move a tag down
     * @param index the index of the tag to move down
     */

  }, {
    key: "moveTagDown",
    value: function moveTagDown(index) {
      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down
        var tag = this.authoringComponentContent.tags[index];
        this.authoringComponentContent.tags.splice(index, 1);
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: "deleteTag",
    value: function deleteTag(indexOfTagToDelete) {
      if (confirm(this.$translate('areYouSureYouWantToDeleteThisTag'))) {
        this.authoringComponentContent.tags.splice(indexOfTagToDelete, 1);
        this.authoringViewComponentChanged();
      }
    }
    /**
     * The author has changed the rubric
     */

  }, {
    key: "summernoteRubricHTMLChanged",
    value: function summernoteRubricHTMLChanged() {
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

      html = this.UtilService.insertWISELinks(html); // update the component rubric

      this.authoringComponentContent.rubric = html; // the authoring component content has changed so we will save the project

      this.authoringViewComponentChanged();
    }
    /**
     * The component has changed in the regular authoring view so we will save the project
     */

  }, {
    key: "authoringViewComponentChanged",
    value: function authoringViewComponentChanged() {
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

  }, {
    key: "updateAdvancedAuthoringView",
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */

  }, {
    key: "advancedAuthoringViewComponentChanged",
    value: function advancedAuthoringViewComponentChanged() {
      try {
        /*
         * create a new component by converting the JSON string in the advanced
         * authoring view into a JSON object
         */
        var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString); // replace the component in the project

        this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent); // set the new component into the controller

        this.componentContent = editedComponentContent;
        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */

        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: "showJSONButtonClicked",
    value: function showJSONButtonClicked() {
      if (this.showJSONAuthoring) {
        // we were showing the JSON authoring view and now we want to hide it
        if (this.isJSONValid()) {
          this.saveJSONAuthoringViewChanges();
          this.toggleJSONAuthoringView();
          this.UtilService.hideJSONValidMessage();
        } else {
          var isRollback = confirm(this.$translate('jsonInvalidErrorMessage'));

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
  }, {
    key: "toggleJSONAuthoringView",
    value: function toggleJSONAuthoringView() {
      this.showJSONAuthoring = !this.showJSONAuthoring;
    }
  }, {
    key: "authoringJSONChanged",
    value: function authoringJSONChanged() {
      this.isJSONStringChanged = true;

      if (this.isJSONValid()) {
        this.UtilService.showJSONValidMessage();
        this.rememberRecentValidJSON();
      } else {
        this.UtilService.showJSONInvalidMessage();
      }
    }
  }, {
    key: "isJSONValid",
    value: function isJSONValid() {
      try {
        angular.fromJson(this.authoringComponentContentJSONString);
        return true;
      } catch (e) {
        return false;
      }
    }
  }, {
    key: "rememberRecentValidJSON",
    value: function rememberRecentValidJSON() {
      this.authoringValidComponentContentJSONString = this.authoringComponentContentJSONString;
    }
  }, {
    key: "rollbackToRecentValidJSON",
    value: function rollbackToRecentValidJSON() {
      this.authoringComponentContentJSONString = this.authoringValidComponentContentJSONString;
    }
    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */

  }, {
    key: "saveJSONAuthoringViewChanges",
    value: function saveJSONAuthoringViewChanges() {
      try {
        var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);
        this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);
        this.componentContent = editedComponentContent;
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
        this.$rootScope.$broadcast('scrollToComponent', {
          componentId: this.componentId
        });
        this.isJSONStringChanged = false;
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: "isEventTargetThisComponent",
    value: function isEventTargetThisComponent(args) {
      return this.isForThisComponent(args);
    }
  }, {
    key: "isForThisComponent",
    value: function isForThisComponent(object) {
      return this.nodeId == object.nodeId && this.componentId == object.componentId;
    }
  }, {
    key: "canSubmit",
    value: function canSubmit() {
      return !this.hasMaxSubmitCount() || this.hasSubmitsLeft();
    }
  }, {
    key: "hasMaxSubmitCount",
    value: function hasMaxSubmitCount() {
      return this.getMaxSubmitCount() != null;
    }
  }, {
    key: "getMaxSubmitCount",
    value: function getMaxSubmitCount() {
      return this.componentContent.maxSubmitCount;
    }
  }, {
    key: "getNumberOfSubmitsLeft",
    value: function getNumberOfSubmitsLeft() {
      return this.getMaxSubmitCount() - this.submitCounter;
    }
  }, {
    key: "hasSubmitsLeft",
    value: function hasSubmitsLeft() {
      return this.getNumberOfSubmitsLeft() > 0;
    }
  }, {
    key: "setIsSubmit",
    value: function setIsSubmit(isSubmit) {
      this.isSubmit = isSubmit;
    }
  }, {
    key: "getIsSubmit",
    value: function getIsSubmit() {
      return this.isSubmit;
    }
  }, {
    key: "setIsDirty",
    value: function setIsDirty(isDirty) {
      this.isDirty = isDirty;
    }
  }, {
    key: "getIsDirty",
    value: function getIsDirty() {
      return this.isDirty;
    }
  }, {
    key: "removeAttachment",
    value: function removeAttachment(attachment) {
      if (this.attachments.indexOf(attachment) !== -1) {
        this.attachments.splice(this.attachments.indexOf(attachment), 1);
        this.studentDataChanged();
      }
    }
  }, {
    key: "attachStudentAsset",
    value: function attachStudentAsset(studentAsset) {
      var _this7 = this;

      this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
        var attachment = {
          studentAssetId: copiedAsset.id,
          iconURL: copiedAsset.iconURL
        };

        _this7.attachments.push(attachment);

        _this7.studentDataChanged();
      });
    }
  }, {
    key: "hasMaxScore",
    value: function hasMaxScore() {
      return this.componentContent.maxScore != null && this.componentContent.maxScore !== '';
    }
  }, {
    key: "getMaxScore",
    value: function getMaxScore() {
      return this.componentContent.maxScore;
    }
  }, {
    key: "createAutoScoreAnnotation",
    value: function createAutoScoreAnnotation(data) {
      return this.createAutoAnnotation('autoScore', data);
    }
  }, {
    key: "createAutoCommentAnnotation",
    value: function createAutoCommentAnnotation(data) {
      return this.createAutoAnnotation('autoComment', data);
    }
  }, {
    key: "createAutoAnnotation",
    value: function createAutoAnnotation(type, data) {
      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();

      if (type === 'autoScore') {
        return this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
      } else if (type === 'autoComment') {
        return this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
      }
    }
  }, {
    key: "updateLatestScoreAnnotation",
    value: function updateLatestScoreAnnotation(annotation) {
      this.latestAnnotations.score = annotation;
    }
  }, {
    key: "updateLatestCommentAnnotation",
    value: function updateLatestCommentAnnotation(annotation) {
      this.latestAnnotations.comment = annotation;
    }
  }]);

  return ComponentController;
}();

ComponentController.$inject = [];
var _default = ComponentController;
exports["default"] = _default;
//# sourceMappingURL=componentController.js.map
