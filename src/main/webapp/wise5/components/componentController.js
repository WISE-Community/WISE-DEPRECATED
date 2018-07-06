'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentController = function () {
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

    this.showAddToNotebookButton = this.componentContent.showAddToNotebookButton == null ? true : this.componentContent.showAddToNotebookButton;

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

  _createClass(ComponentController, [{
    key: 'isStudentMode',
    value: function isStudentMode() {
      return this.mode === 'student';
    }
  }, {
    key: 'isAuthoringMode',
    value: function isAuthoringMode() {
      return this.mode === 'authoring';
    }
  }, {
    key: 'isGradingMode',
    value: function isGradingMode() {
      return this.mode === 'grading';
    }
  }, {
    key: 'authoringConstructor',
    value: function authoringConstructor() {
      var _this = this;

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

      this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
        if (_this.componentId === args.componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
          _this.UtilService.hideJSONValidMessage();
        }
      });

      this.updateAdvancedAuthoringView();
    }
  }, {
    key: 'registerListeners',
    value: function registerListeners() {
      var _this2 = this;

      this.$scope.$on('annotationSavedToServer', function (event, args) {
        var annotation = args.annotation;
        if (_this2.nodeId === annotation.nodeId && _this2.componentId === annotation.componentId) {
          _this2.latestAnnotations = _this2.AnnotationService.getLatestComponentAnnotations(_this2.nodeId, _this2.componentId, _this2.workgroupId);
        }
      });

      this.$scope.$on('nodeSubmitClicked', function (event, args) {
        if (_this2.nodeId === args.nodeId) {
          _this2.handleNodeSubmit();
        }
      });

      /**
       * Listen for the 'exitNode' event which is fired when the student
       * exits the parent node. This will perform any necessary cleanup
       * when the student exits the parent node.
       */
      this.$scope.$on('exitNode', function (event, args) {
        _this2.cleanupBeforeExiting();
      });

      this.registerStudentWorkSavedToServerListener();
    }
  }, {
    key: 'cleanupBeforeExiting',
    value: function cleanupBeforeExiting() {}
  }, {
    key: 'broadcastDoneRenderingComponent',
    value: function broadcastDoneRenderingComponent() {
      this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'registerStudentWorkSavedToServerListener',
    value: function registerStudentWorkSavedToServerListener() {
      this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {
        var componentState = args.studentWork;
        if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {
          this.isDirty = false;
          this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: this.isDirty });
          var clientSaveTime = this.ConfigService.convertToClientTimestamp(componentState.serverSaveTime);
          if (componentState.isSubmit) {
            this.setSubmittedMessage(clientSaveTime);
            this.lockIfNecessary();
            this.isSubmitDirty = false;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: this.isSubmitDirty });
          } else if (componentState.isAutoSave) {
            this.setAutoSavedMessage(clientSaveTime);
          } else {
            this.setSavedMessage(clientSaveTime);
          }
        }
      }));
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.isSubmit = true;
    }
  }, {
    key: 'getPrompt',
    value: function getPrompt() {
      return this.componentContent.prompt;
    }
  }, {
    key: 'saveButtonClicked',
    value: function saveButtonClicked() {
      this.isSubmit = false;

      // tell the parent node to save
      this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'submitButtonClicked',
    value: function submitButtonClicked() {
      this.submit('componentSubmitButton');
    }
  }, {
    key: 'submit',
    value: function submit(submitTriggeredBy) {}
  }, {
    key: 'incrementSubmitCounter',
    value: function incrementSubmitCounter() {
      this.submitCounter++;
    }
  }, {
    key: 'disableComponentIfNecessary',
    value: function disableComponentIfNecessary() {
      if (this.isLockAfterSubmit()) {
        var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
        if (this.NodeService.isWorkSubmitted(componentStates)) {
          this.isDisabled = true;
        }
      }
    }
  }, {
    key: 'lockIfNecessary',
    value: function lockIfNecessary() {
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }
    }
  }, {
    key: 'isLockAfterSubmit',
    value: function isLockAfterSubmit() {
      return this.componentContent.lockAfterSubmit;
    }
  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      var _this3 = this;

      /*
       * set the dirty flags so we will know we need to save or submit the
       * student work later
       */
      this.isDirty = true;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
      this.clearSaveMessage();

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      // create a component state populated with the student data
      this.createComponentState(action).then(function (componentState) {
        _this3.$scope.$emit('componentStudentDataChanged', { nodeId: _this3.nodeId, componentId: _this3.componentId, componentState: componentState });
      });
    }
  }, {
    key: 'setSaveText',
    value: function setSaveText(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'clearSaveMessage',
    value: function clearSaveMessage() {
      this.setSaveText('', null);
    }
  }, {
    key: 'setSavedMessage',
    value: function setSavedMessage(time) {
      this.setSaveText(this.$translate('SAVED'), time);
    }
  }, {
    key: 'setAutoSavedMessage',
    value: function setAutoSavedMessage(time) {
      this.setSaveText(this.$translate('AUTO_SAVED'), time);
    }
  }, {
    key: 'setSubmittedMessage',
    value: function setSubmittedMessage(time) {
      this.setSaveText(this.$translate('SUBMITTED'), time);
    }

    /**
     * Set the message next to the save button
     * TODO: Replace calls to this function with calls to setSavedMessage() in all the components.
     * @param message the message to display
     * @param time the time to display
     */

  }, {
    key: 'setSaveMessage',
    value: function setSaveMessage(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'getStepNodeIds',


    /**
     * Get all the step node ids in the project
     * @returns {array} an array of step node id strings
     */
    value: function getStepNodeIds() {
      return this.ProjectService.getNodeIds();
    }

    /**
     * Get the step number and title for a node
     * @param {string} get the step number and title for this node
     * @returns {string} the step number and title example "1.5: Read Information"
     */

  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }

    /**
     * Get the components in a step
     * @param {string} id of the step
     * @returns {array} an array of component objects
     */

  }, {
    key: 'getComponentsByNodeId',
    value: function getComponentsByNodeId(nodeId) {
      return this.ProjectService.getComponentsByNodeId(nodeId);
    }

    /**
     * Check if a node is a step node
     * @param {string} nodeId the node id to check
     * @returns {boolean} whether the node is a step node
     */

  }, {
    key: 'isApplicationNode',
    value: function isApplicationNode(nodeId) {
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

  }, {
    key: 'createComponentStateAdditionalProcessing',
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
    key: 'handleConnectedComponents',
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
            if (connectedComponent.type == 'showWork') {
              this.isDisabled = true;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.setStudentWork(this.createMergedComponentState(componentStates));
        this.handleConnectedComponentsPostProcess();
        this.studentDataChanged();
      }
    }
  }, {
    key: 'handleConnectedComponentsPostProcess',
    value: function handleConnectedComponentsPostProcess() {
      // overriden by children
    }
  }, {
    key: 'showCopyPublicNotebookItemButton',
    value: function showCopyPublicNotebookItemButton() {
      return this.ProjectService.isSpaceExists("public");
    }
  }, {
    key: 'copyPublicNotebookItemButtonClicked',
    value: function copyPublicNotebookItemButtonClicked(event) {
      this.$rootScope.$broadcast('openNotebook', { nodeId: this.nodeId, componentId: this.componentId, insertMode: true, requester: this.nodeId + '-' + this.componentId, visibleSpace: "public" });
    }
  }, {
    key: 'importWorkByStudentWorkId',
    value: function importWorkByStudentWorkId(studentWorkId) {
      var _this4 = this;

      this.StudentDataService.getStudentWorkById(studentWorkId).then(function (componentState) {
        if (componentState != null) {
          _this4.setStudentWork(componentState);
          _this4.setParentStudentWorkIdToCurrentStudentWork(studentWorkId);
          _this4.$rootScope.$broadcast('closeNotebook');
        }
      });
    }
  }, {
    key: 'setParentStudentWorkIdToCurrentStudentWork',
    value: function setParentStudentWorkIdToCurrentStudentWork(studentWorkId) {
      this.parentStudentWorkIds = [studentWorkId];
    }
  }, {
    key: 'isNotebookEnabled',
    value: function isNotebookEnabled() {
      return this.NotebookService.isNotebookEnabled();
    }
  }, {
    key: 'isAddToNotebookEnabled',
    value: function isAddToNotebookEnabled() {
      return this.isNotebookEnabled() && this.showAddToNotebookButton;
    }

    /**
     * Set the show submit button value
     * @param show whether to show the submit button
     */

  }, {
    key: 'setShowSubmitButtonValue',
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
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

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

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

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

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = components[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var component = _step2.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
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

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

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

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
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

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
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
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
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
    key: 'addTag',
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
    key: 'moveTagUp',
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
    key: 'moveTagDown',
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
    key: 'deleteTag',
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
    key: 'summernoteRubricHTMLChanged',
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
      html = this.UtilService.insertWISELinks(html);

      // update the component rubric
      this.authoringComponentContent.rubric = html;

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The component has changed in the regular authoring view so we will save the project
     */

  }, {
    key: 'authoringViewComponentChanged',
    value: function authoringViewComponentChanged() {

      // update the JSON string in the advanced authoring view textarea
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {

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
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'showJSONButtonClicked',


    /**
     * The show JSON button was clicked to show or hide the JSON authoring
     */
    value: function showJSONButtonClicked() {
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

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }
  }, {
    key: 'isEventTargetThisComponent',
    value: function isEventTargetThisComponent(args) {
      return this.nodeId == args.nodeId && this.componentId == args.componentId;
    }
  }, {
    key: 'createSummernoteRubricId',
    value: function createSummernoteRubricId() {
      return 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
    }
  }, {
    key: 'restoreSummernoteCursorPosition',
    value: function restoreSummernoteCursorPosition(summernoteId) {
      $('#' + summernoteId).summernote('editor.restoreRange');
      $('#' + summernoteId).summernote('editor.focus');
    }
  }, {
    key: 'insertImageIntoSummernote',
    value: function insertImageIntoSummernote(fullAssetPath, fileName) {
      $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
    }
  }, {
    key: 'insertVideoIntoSummernote',
    value: function insertVideoIntoSummernote(fullAssetPath) {
      var videoElement = document.createElement('video');
      videoElement.controls = 'true';
      videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
      $('#' + summernoteId).summernote('insertNode', videoElement);
    }
  }, {
    key: 'hasMaxSubmitCount',
    value: function hasMaxSubmitCount() {
      return this.getMaxSubmitCount() != null;
    }
  }, {
    key: 'getMaxSubmitCount',
    value: function getMaxSubmitCount() {
      return this.componentContent.maxSubmitCount;
    }
  }, {
    key: 'getNumberOfSubmitsLeft',
    value: function getNumberOfSubmitsLeft() {
      return this.getMaxSubmitCount() - this.submitCounter;
    }
  }, {
    key: 'hasSubmitsLeft',
    value: function hasSubmitsLeft() {
      return this.getNumberOfSubmitsLeft() > 0;
    }
  }, {
    key: 'setIsSubmitTrue',
    value: function setIsSubmitTrue() {
      this.setIsSubmit(true);
    }
  }, {
    key: 'setIsSubmitFalse',
    value: function setIsSubmitFalse() {
      this.setIsSubmit(false);
    }
  }, {
    key: 'setIsSubmit',
    value: function setIsSubmit(isSubmit) {
      this.isSubmit = isSubmit;
    }
  }, {
    key: 'getIsSubmit',
    value: function getIsSubmit() {
      return this.isSubmit;
    }
  }, {
    key: 'setIsDirty',
    value: function setIsDirty(isDirty) {
      this.isDirty = isDirty;
    }
  }]);

  return ComponentController;
}();

ComponentController.$inject = [];

exports.default = ComponentController;
//# sourceMappingURL=componentController.js.map
