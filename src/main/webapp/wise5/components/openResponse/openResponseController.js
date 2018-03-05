'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OpenResponseController = function () {
  function OpenResponseController($filter, $injector, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, CRaterService, NodeService, NotificationService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, OpenResponseController);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.CRaterService = CRaterService;
    this.NodeService = NodeService;
    this.NotificationService = NotificationService;
    this.OpenResponseService = OpenResponseService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;

    this.$translate = this.$filter('translate');

    this.idToOrder = this.ProjectService.idToOrder;

    // the node id of the current node
    this.nodeId = null;

    // the component id
    this.componentId = null;

    // field that will hold the component content
    this.componentContent = null;

    // field that will hold the authoring component content
    this.authoringComponentContent = null;

    // holds the text that the student has typed
    this.studentResponse = '';

    // holds student attachments like assets
    this.attachments = [];

    // whether the step should be disabled
    this.isDisabled = false;

    // whether the student work is dirty and needs saving
    this.isDirty = false;

    // whether the student work has changed since last submit
    this.isSubmitDirty = false;

    // message to show next to save/submit buttons
    this.saveMessage = {
      text: '',
      time: ''
    };

    // whether this component is showing previous work
    this.isShowPreviousWork = false;

    // whether the student work is for a submit
    this.isSubmit = false;

    // whether rich text editing is enabled
    this.isRichTextEnabled = false;

    // whether students can attach files to their work
    this.isStudentAttachmentEnabled = false;

    // whether the prompt is shown or not
    this.isPromptVisible = true;

    // whether the save button is shown or not
    this.isSaveButtonVisible = false;

    // whether the submit button is shown or not
    this.isSubmitButtonVisible = false;

    // whether the submit button is disabled
    this.isSubmitButtonDisabled = false;

    // whether we're only showing the student work
    this.onlyShowWork = false;

    // the latest annotations
    this.latestAnnotations = null;

    // used to hold a message dialog if we need to use one
    this.messageDialog = null;

    // counter to keep track of the number of submits
    this.submitCounter = 0;

    // flag for whether to show the advanced authoring
    this.showAdvancedAuthoring = false;

    // whether the JSON authoring is displayed
    this.showJSONAuthoring = false;

    // whether this component uses a custom completion criteria
    this.useCustomCompletionCriteria = false;

    // whether we are currently verifying a CRater item id
    this.isVerifyingCRaterItemId = false;

    // whether the CRater item id is valid
    this.cRaterItemIdIsValid = null;

    //var scope = this;
    var themePath = this.ProjectService.getThemePath();

    // TODO: make toolbar items and plugins customizable by authors (OR strip down to only special characters, support for equations)
    // Rich text editor options
    this.tinymceOptions = {
      //onChange: function(e) {
      //scope.studentDataChanged();
      //},
      menubar: false,
      plugins: 'link image media autoresize', //imagetools
      toolbar: 'undo redo | bold italic | superscript subscript | bullist numlist | alignleft aligncenter alignright | link image media',
      autoresize_bottom_margin: '0',
      autoresize_min_height: '100',
      image_advtab: true,
      content_css: themePath + '/style/tinymce.css',
      setup: function setup(ed) {
        ed.on('focus', function (e) {
          $(e.target.editorContainer).addClass('input--focused').parent().addClass('input-wrapper--focused');
          $('label[for="' + e.target.id + '"]').addClass('input-label--focused');
        });

        ed.on('blur', function (e) {
          $(e.target.editorContainer).removeClass('input--focused').parent().removeClass('input-wrapper--focused');
          $('label[for="' + e.target.id + '"]').removeClass('input-label--focused');
        });
      }
    };

    // the options for when to update this component from a connected component
    this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [{
      type: 'OpenResponse'
    }];

    // get the current node and node id
    var currentNode = this.StudentDataService.getCurrentNode();
    if (currentNode != null) {
      this.nodeId = currentNode.id;
    } else {
      this.nodeId = this.$scope.nodeId;
    }

    // get the component content from the scope
    this.componentContent = this.$scope.componentContent;

    // get the authoring component content
    this.authoringComponentContent = this.$scope.authoringComponentContent;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;

    // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
    this.mode = this.$scope.mode;

    this.workgroupId = this.$scope.workgroupId;
    this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

    if (this.componentContent != null) {

      // get the component id
      this.componentId = this.componentContent.id;

      if (this.mode === 'student') {
        this.isPromptVisible = true;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

        // get the latest annotations
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      } else if (this.mode === 'grading') {
        this.isPromptVisible = false;
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isDisabled = true;
      } else if (this.mode === 'onlyShowWork') {
        this.onlyShowWork = true;
        this.isPromptVisible = false;
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isDisabled = true;
      } else if (this.mode === 'showPreviousWork') {
        this.isPromptVisible = true;
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isDisabled = true;
      } else if (this.mode === 'authoring') {
        this.isPromptVisible = true;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

        // generate the summernote rubric element id
        this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

        // set the component rubric into the summernote rubric
        this.summernoteRubricHTML = this.componentContent.rubric;

        // the tooltip text for the insert WISE asset button
        var insertAssetString = this.$translate('INSERT_ASSET');

        /*
         * create the custom button for inserting WISE assets into
         * summernote
         */
        var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

        /*
         * the options that specifies the tools to display in the
         * summernote prompt
         */
        this.summernoteRubricOptions = {
          toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
          height: 300,
          disableDragAndDrop: true,
          buttons: {
            insertAssetButton: InsertAssetButton
          }
        };

        this.updateAdvancedAuthoringView();

        $scope.$watch(function () {
          return this.authoringComponentContent;
        }.bind(this), function (newValue, oldValue) {
          // inject the asset paths into the new component content
          this.componentContent = this.ProjectService.injectAssetPaths(newValue);

          /*
           * reset the values so that the preview is refreshed with
           * the new content
           */
          this.submitCounter = 0;
          this.studentResponse = '';
          this.latestAnnotations = null;
          this.isDirty = false;
          this.isSubmitDirty = false;
          this.isSaveButtonVisible = this.componentContent.showSaveButton;
          this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

          if (this.componentContent.starterSentence != null) {
            /*
             * the student has not done any work and there is a starter sentence
             * so we will populate the textarea with the starter sentence
             */
            this.studentResponse = this.componentContent.starterSentence;
          }
        }.bind(this), true);
      }

      var componentState = null;

      // set whether rich text is enabled
      this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

      // set whether studentAttachment is enabled
      this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

      if (this.componentContent.completionCriteria != null) {
        this.useCustomCompletionCriteria = true;
      }

      // get the component state from the scope
      componentState = this.$scope.componentState;

      if (this.mode == 'student') {
        if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
          // we will show work from another component
          this.handleConnectedComponents();
        } else if (this.OpenResponseService.componentStateHasStudentWork(componentState, this.componentContent)) {
          /*
           * the student has work so we will populate the work into this
           * component
           */
          this.setStudentWork(componentState);
        } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // we will import work from another component
          this.handleConnectedComponents();
        } else if (componentState == null) {
          // check if we need to import work

          var importPreviousWorkNodeId = this.getImportPreviousWorkNodeId();
          var importPreviousWorkComponentId = this.getImportPreviousWorkComponentId();

          if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {
            // import the work from the other component
            this.importWork();
          } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
            /*
             * the student does not have any work and there are connected
             * components so we will get the work from the connected
             * components
             */
            this.handleConnectedComponents();
          } else if (this.componentContent.starterSentence != null) {
            /*
             * the student has not done any work and there is a starter sentence
             * so we will populate the textarea with the starter sentence
             */
            this.studentResponse = this.componentContent.starterSentence;
          }
        }
      } else {
        // populate the student work into this component
        this.setStudentWork(componentState);
      }

      // check if the student has used up all of their submits
      if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
        /*
         * the student has used up all of their chances to submit so we
         * will disable the submit button
         */
        this.isSubmitButtonDisabled = true;
      }

      // check if we need to lock this component
      this.calculateDisabled();

      if (this.$scope.$parent.nodeController != null) {
        // register this component with the parent node
        this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
      }
    }

    //$('.openResponse').off('dragover').off('drop');

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function () {
      return this.$scope.openResponseController.isDirty;
    }.bind(this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

      if (isSubmit) {
        if (this.$scope.openResponseController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.openResponseController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.openResponseController.createComponentState(action).then(function (componentState) {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * the student does not have any unsaved changes in this component
         * so we don't need to save a component state for this component.
         * we will immediately resolve the promise here.
         */
        deferred.resolve();
      }

      return deferred.promise;
    }.bind(this);

    /**
     * The parent node submit button was clicked
     */
    this.$scope.$on('nodeSubmitClicked', function (event, args) {

      // get the node id of the node
      var nodeId = args.nodeId;

      // make sure the node id matches our parent node
      if (this.nodeId === nodeId) {

        // trigger the submit
        var submitTriggeredBy = 'nodeSubmitButton';
        this.submit(submitTriggeredBy);
      }
    }.bind(this));

    /**
     * Listen for the 'studentWorkSavedToServer' event which is fired when
     * we receive the response from saving a component state to the server
     */
    this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {

      var componentState = args.studentWork;

      // check that the component state is for this component
      if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

        // set isDirty to false because the component state was just saved and notify node
        this.isDirty = false;
        this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

        var isAutoSave = componentState.isAutoSave;
        var isSubmit = componentState.isSubmit;
        var serverSaveTime = componentState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

        // set save message
        if (isSubmit) {
          this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

          this.lockIfNecessary();

          // set isSubmitDirty to false because the component state was just submitted and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
        } else if (isAutoSave) {
          this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
        } else {
          this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
        }
      }
    }));

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    this.$scope.$on('annotationSavedToServer', function (event, args) {

      if (args != null) {

        // get the annotation that was saved to the server
        var annotation = args.annotation;

        if (annotation != null) {

          // get the node id and component id of the annotation
          var annotationNodeId = annotation.nodeId;
          var annotationComponentId = annotation.componentId;

          // make sure the annotation was for this component
          if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

            // get latest score and comment annotations for this component
            _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
          }
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', function (event, args) {}.bind(this));

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', function (event, args) {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          // the asset was selected for this component
          var assetItem = args.assetItem;

          if (assetItem != null) {
            var fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // insert the video element
                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      // close the popup
      _this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });

    // load script for this component, if any
    var script = this.componentContent.script;
    if (script != null) {
      this.ProjectService.retrieveScript(script).then(function (script) {
        new Function(script).call(_this);
      });
    }
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */


  _createClass(OpenResponseController, [{
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {

      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null) {
          var response = studentData.response;

          if (response != null) {
            // populate the text the student previously typed
            this.studentResponse = response;
          }

          var submitCounter = studentData.submitCounter;

          if (submitCounter != null) {
            // populate the submit counter
            this.submitCounter = submitCounter;
          }

          var attachments = studentData.attachments;

          if (attachments != null) {
            this.attachments = attachments;
          }

          this.processLatestSubmit();
        }
      }
    }
  }, {
    key: 'processLatestSubmit',


    /**
     * Check if latest component state is a submission and set isSubmitDirty accordingly
     */
    value: function processLatestSubmit() {
      var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (latestState) {
        var serverSaveTime = latestState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          // latest state is a submission, so set isSubmitDirty to false and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          // set save message
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          // set save message
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  }, {
    key: 'saveButtonClicked',


    /**
     * Called when the student clicks the save button
     */
    value: function saveButtonClicked() {
      this.isSubmit = false;

      if (this.mode === 'authoring') {
        /*
         * we are in authoring mode so we will set isDirty to false here
         * because the 'componentSaveTriggered' event won't work in
         * authoring mode
         */
        this.isDirty = false;
      }

      // tell the parent node that this component wants to save
      this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'submitButtonClicked',


    /**
     * Called when the student clicks the submit button
     */
    value: function submitButtonClicked() {
      // trigger the submit
      var submitTriggeredBy = 'componentSubmitButton';
      this.submit(submitTriggeredBy);
    }
  }, {
    key: 'submit',


    /**
     * A submit was triggered by the component submit button or node submit button
     * @param submitTriggeredBy what triggered the submit
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */
    value: function submit(submitTriggeredBy) {

      if (this.isSubmitDirty) {
        // the student has unsubmitted work

        var performSubmit = true;

        if (this.componentContent.maxSubmitCount != null) {
          // there is a max submit count

          // calculate the number of submits this student has left
          var numberOfSubmitsLeft = this.componentContent.maxSubmitCount - this.submitCounter;

          var message = '';

          if (numberOfSubmitsLeft <= 0) {

            // the student does not have any more chances to submit
            alert(this.$translate('openResponse.youHaveNoMoreChances'));
            performSubmit = false;
          } else if (numberOfSubmitsLeft == 1) {

            // ask the student if they are sure they want to submit
            message = this.$translate('openResponse.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            //message = 'You have ' + numberOfSubmitsLeft + ' chance to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
            performSubmit = confirm(message);
          } else if (numberOfSubmitsLeft > 1) {

            // ask the student if they are sure they want to submit
            message = this.$translate('openResponse.youHaveMultipleChances', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            //message = 'You have ' + numberOfSubmitsLeft + ' chances to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
            performSubmit = confirm(message);
          }
        }

        if (performSubmit) {

          /*
           * set isSubmit to true so that when the component state is
           * created, it will know that is a submit component state
           * instead of just a save component state
           */
          this.isSubmit = true;

          // increment the submit counter
          this.incrementSubmitCounter();

          // check if the student has used up all of their submits
          if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
            /*
             * the student has used up all of their submits so we will
             * disable the submit button
             */
            this.isSubmitButtonDisabled = true;
          }

          if (this.mode === 'authoring') {
            /*
             * we are in authoring mode so we will set values appropriately
             * here because the 'componentSubmitTriggered' event won't
             * work in authoring mode
             */
            this.isDirty = false;
            this.isSubmitDirty = false;
            this.createComponentState('submit');
          }

          if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
          } else if (submitTriggeredBy === 'nodeSubmitButton') {
            // nothing extra needs to be performed
          }
        } else {
          /*
           * the student has cancelled the submit so if a component state
           * is created, it will just be a regular save and not submit
           */
          this.isSubmit = false;
        }
      }
    }

    /**
     * Increment the submit counter
     */

  }, {
    key: 'incrementSubmitCounter',
    value: function incrementSubmitCounter() {
      this.submitCounter++;
    }
  }, {
    key: 'lockIfNecessary',
    value: function lockIfNecessary() {
      // check if we need to lock the component after the student submits
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }
    }
  }, {
    key: 'studentDataChanged',


    /**
     * Called when the student changes their work
     */
    value: function studentDataChanged() {
      var _this2 = this;

      /*
       * set the dirty flags so we will know we need to save or submit the
       * student work later
       */
      this.isDirty = true;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

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
      this.createComponentState(action).then(function (componentState) {
        _this2.$scope.$emit('componentStudentDataChanged', { nodeId: _this2.nodeId, componentId: componentId, componentState: componentState });
      });
    }
  }, {
    key: 'getStudentResponse',


    /**
     * Get the student response
     */
    value: function getStudentResponse() {
      return this.studentResponse;
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    value: function createComponentState(action) {

      var deferred = this.$q.defer();

      // create a new component state
      var componentState = this.NodeService.createNewComponentState();

      // set the response into the component state
      var studentData = {};

      // get the text the student typed
      var response = this.getStudentResponse();

      studentData.response = response;
      studentData.attachments = angular.copy(this.attachments); // create a copy without reference to original array

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      // set the flag for whether the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'OpenResponse';

      // set the node id
      componentState.nodeId = this.nodeId;

      // set the component id
      componentState.componentId = this.componentId;

      /*
       * reset the isSubmit value so that the next component state
       * doesn't maintain the same value
       */
      this.isSubmit = false;

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);

      return deferred.promise;
    }
  }, {
    key: 'createComponentStateAdditionalProcessing',


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
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
      var _this3 = this;

      var performCRaterScoring = false;

      // determine if we need to perform CRater scoring
      if (action == 'submit' && componentState.isSubmit) {
        if (this.isCRaterScoreOnSubmit(this.componentContent)) {
          performCRaterScoring = true;
        }
      } else if (action == 'save') {
        if (this.isCRaterScoreOnSave(this.componentContent)) {
          performCRaterScoring = true;
        }
      } else if (action == 'change' || action == null) {
        if (this.isCRaterScoreOnChange(this.componentContent)) {
          performCRaterScoring = true;
        }
      }

      if (performCRaterScoring) {
        // we need to perform CRater scoring

        var cRaterItemType = this.CRaterService.getCRaterItemType(this.componentContent);
        var cRaterItemId = this.CRaterService.getCRaterItemId(this.componentContent);
        var cRaterRequestType = 'scoring';
        var cRaterResponseId = new Date().getTime();
        var studentData = this.studentResponse;

        /*
         * display a dialog message while the student waits for their work
         * to be scored by CRater
         */
        this.$mdDialog.show({
          template: '<md-dialog aria-label="' + this.$translate('openResponse.pleaseWait') + '"><md-dialog-content><div class="md-dialog-content">' + this.$translate('openResponse.pleaseWaitWeAreScoringYourWork') + '</div></md-dialog-content></md-dialog>',
          escapeToClose: false
        });

        // make the CRater request to score the student data
        this.CRaterService.makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData).then(function (result) {

          if (result != null) {

            // get the CRater response
            var data = result.data;

            if (data != null) {

              /*
               * annotations we put in the component state will be
               * removed from the component state and saved separately
               */
              componentState.annotations = [];

              // get the CRater score
              var score = data.score;
              var concepts = data.concepts;
              var previousScore = null;

              if (score != null) {

                // create the auto score annotation
                var autoScoreAnnotationData = {};
                autoScoreAnnotationData.value = score;
                autoScoreAnnotationData.maxAutoScore = _this3.ProjectService.getMaxScoreForComponent(_this3.nodeId, _this3.componentId);
                autoScoreAnnotationData.concepts = concepts;
                autoScoreAnnotationData.autoGrader = 'cRater';

                var autoScoreAnnotation = _this3.createAutoScoreAnnotation(autoScoreAnnotationData);

                var annotationGroupForScore = null;

                if (_this3.$scope.$parent.nodeController != null) {
                  // get the previous score and comment annotations
                  var latestAnnotations = _this3.$scope.$parent.nodeController.getLatestComponentAnnotations(_this3.componentId);

                  if (latestAnnotations != null && latestAnnotations.score != null && latestAnnotations.score.data != null) {

                    // get the previous score annotation value
                    previousScore = latestAnnotations.score.data.value;
                  }

                  if (_this3.componentContent.enableGlobalAnnotations && _this3.componentContent.globalAnnotationSettings != null) {

                    var globalAnnotationMaxCount = 0;
                    if (_this3.componentContent.globalAnnotationSettings.globalAnnotationMaxCount != null) {
                      globalAnnotationMaxCount = _this3.componentContent.globalAnnotationSettings.globalAnnotationMaxCount;
                    }
                    // get the annotation properties for the score that the student got.
                    annotationGroupForScore = _this3.ProjectService.getGlobalAnnotationGroupByScore(_this3.componentContent, previousScore, score);

                    // check if we need to apply this globalAnnotationSetting to this annotation: we don't need to if we've already reached the maxCount
                    if (annotationGroupForScore != null) {
                      var globalAnnotationGroupsByNodeIdAndComponentId = _this3.AnnotationService.getAllGlobalAnnotationGroups(_this3.nodeId, _this3.componentId);
                      annotationGroupForScore.annotationGroupCreatedTime = autoScoreAnnotation.clientSaveTime; // save annotation creation time

                      if (globalAnnotationGroupsByNodeIdAndComponentId.length >= globalAnnotationMaxCount) {
                        // we've already applied this annotation properties to maxCount annotations, so we don't need to apply it any more.
                        annotationGroupForScore = null;
                      }
                    }

                    if (annotationGroupForScore != null && annotationGroupForScore.isGlobal && annotationGroupForScore.unGlobalizeCriteria != null) {
                      // check if this annotation is global and what criteria needs to be met to un-globalize.
                      annotationGroupForScore.unGlobalizeCriteria.map(function (unGlobalizeCriteria) {
                        // if the un-globalize criteria is time-based (e.g. isVisitedAfter, isRevisedAfter, isVisitedAndRevisedAfter, etc), store the timestamp of this annotation in the criteria
                        // so we can compare it when we check for criteria satisfaction.
                        if (unGlobalizeCriteria.params != null) {
                          unGlobalizeCriteria.params.criteriaCreatedTimestamp = autoScoreAnnotation.clientSaveTime; // save annotation creation time to criteria
                        }
                      });
                    }

                    if (annotationGroupForScore != null) {
                      // copy over the annotation properties into the autoScoreAnnotation's data
                      angular.merge(autoScoreAnnotation.data, annotationGroupForScore);
                    }
                  }
                }

                componentState.annotations.push(autoScoreAnnotation);

                if (_this3.mode === 'authoring') {
                  if (_this3.latestAnnotations == null) {
                    _this3.latestAnnotations = {};
                  }

                  /*
                   * we are in the authoring view so we will set the
                   * latest score annotation manually
                   */
                  _this3.latestAnnotations.score = autoScoreAnnotation;
                }

                var autoComment = null;

                // get the submit counter
                var submitCounter = _this3.submitCounter;

                if (_this3.componentContent.cRater.enableMultipleAttemptScoringRules && submitCounter > 1) {
                  /*
                   * this step has multiple attempt scoring rules and this is
                   * a subsequent submit
                   */
                  // get the feedback based upon the previous score and current score
                  autoComment = _this3.CRaterService.getMultipleAttemptCRaterFeedbackTextByScore(_this3.componentContent, previousScore, score);
                } else {
                  // get the feedback text
                  autoComment = _this3.CRaterService.getCRaterFeedbackTextByScore(_this3.componentContent, score);
                }

                if (autoComment != null) {
                  // create the auto comment annotation
                  var autoCommentAnnotationData = {};
                  autoCommentAnnotationData.value = autoComment;
                  autoCommentAnnotationData.concepts = concepts;
                  autoCommentAnnotationData.autoGrader = 'cRater';

                  var autoCommentAnnotation = _this3.createAutoCommentAnnotation(autoCommentAnnotationData);

                  if (_this3.componentContent.enableGlobalAnnotations) {
                    if (annotationGroupForScore != null) {
                      // copy over the annotation properties into the autoCommentAnnotation's data
                      angular.merge(autoCommentAnnotation.data, annotationGroupForScore);
                    }
                  }
                  componentState.annotations.push(autoCommentAnnotation);

                  if (_this3.mode === 'authoring') {
                    if (_this3.latestAnnotations == null) {
                      _this3.latestAnnotations = {};
                    }

                    /*
                     * we are in the authoring view so we will set the
                     * latest comment annotation manually
                     */
                    _this3.latestAnnotations.comment = autoCommentAnnotation;
                  }
                }
                if (_this3.componentContent.enableNotifications) {
                  // get the notification properties for the score that the student got.
                  var notificationForScore = _this3.ProjectService.getNotificationByScore(_this3.componentContent, previousScore, score);

                  if (notificationForScore != null) {
                    notificationForScore.score = score;
                    notificationForScore.nodeId = _this3.nodeId;
                    notificationForScore.componentId = _this3.componentId;
                    _this3.NotificationService.sendNotificationForScore(notificationForScore);
                  }
                }

                // display global annotations dialog if needed
                if (_this3.componentContent.enableGlobalAnnotations && annotationGroupForScore != null && annotationGroupForScore.isGlobal && annotationGroupForScore.isPopup) {
                  _this3.$scope.$emit('displayGlobalAnnotations');
                }
              }
            }
          }

          /*
           * hide the dialog that tells the student to wait since
           * the work has been scored.
           */
          _this3.$mdDialog.hide();

          // resolve the promise now that we are done performing additional processing
          deferred.resolve(componentState);
        });
      } else if (this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)) {
        // if there are any additionalProcessingFunctions for this node and component, call all of them
        var additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(this.nodeId, this.componentId);
        var allPromises = [];
        for (var i = 0; i < additionalProcessingFunctions.length; i++) {
          var additionalProcessingFunction = additionalProcessingFunctions[i];
          var defer = this.$q.defer();
          var promise = defer.promise;
          allPromises.push(promise);
          additionalProcessingFunction(defer, componentState, action);
        }
        this.$q.all(allPromises).then(function () {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * we don't need to perform any additional processing so we can resolve
         * the promise immediately
         */
        deferred.resolve(componentState);
      }
    }

    /**
     * Create an auto score annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto score annotation
     */

  }, {
    key: 'createAutoScoreAnnotation',
    value: function createAutoScoreAnnotation(data) {

      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();

      // create the auto score annotation
      var annotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

      return annotation;
    }

    /**
     * Create an auto comment annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto comment annotation
     */

  }, {
    key: 'createAutoCommentAnnotation',
    value: function createAutoCommentAnnotation(data) {

      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();

      // create the auto comment annotation
      var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

      return annotation;
    }

    /**
     * Check if we need to lock the component
     */

  }, {
    key: 'calculateDisabled',
    value: function calculateDisabled() {

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // check if the parent has set this component to disabled
        if (componentContent.isDisabled) {
          this.isDisabled = true;
        } else if (componentContent.lockAfterSubmit) {
          // we need to lock the component after the student has submitted

          // get the component states for this component
          var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

          // check if any of the component states were submitted
          var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

          if (isSubmitted) {
            // the student has submitted work for this component
            this.isDisabled = true;
          }
        }
      }
    }
  }, {
    key: 'isLockAfterSubmit',


    /**
     * Check whether we need to lock the component after the student
     * submits an answer.
     */
    value: function isLockAfterSubmit() {
      var result = false;

      if (this.componentContent != null) {

        // check the lockAfterSubmit field in the component content
        if (this.componentContent.lockAfterSubmit) {
          result = true;
        }
      }

      return result;
    }
  }, {
    key: 'removeAttachment',
    value: function removeAttachment(attachment) {
      if (this.attachments.indexOf(attachment) != -1) {
        this.attachments.splice(this.attachments.indexOf(attachment), 1);
        this.studentDataChanged();
        // YOU ARE NOW FREEEEEEEEE!
      }
    }
  }, {
    key: 'attachStudentAsset',


    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */
    value: function attachStudentAsset(studentAsset) {
      var _this4 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {
            var attachment = {
              studentAssetId: copiedAsset.id,
              iconURL: copiedAsset.iconURL
            };

            _this4.attachments.push(attachment);
            _this4.studentDataChanged();
          }
        });
      }
    }
  }, {
    key: 'getPrompt',


    /**
     * Get the prompt to show to the student
     */
    value: function getPrompt() {
      var prompt = null;

      if (this.originalComponentContent != null) {
        // this is a show previous work component

        if (this.originalComponentContent.showPreviousWorkPrompt) {
          // show the prompt from the previous work component
          prompt = this.componentContent.prompt;
        } else {
          // show the prompt from the original component
          prompt = this.originalComponentContent.prompt;
        }
      } else if (this.componentContent != null) {
        prompt = this.componentContent.prompt;
      }

      return prompt;
    }
  }, {
    key: 'getNumRows',


    /**
     * Get the number of rows for the textarea
     */
    value: function getNumRows() {
      var numRows = null;

      if (this.componentContent != null) {
        numRows = this.componentContent.numRows;
      }

      return numRows;
    }
  }, {
    key: 'getNumColumns',


    /**
     * Get the number of columns for the textarea
     */
    value: function getNumColumns() {
      var numColumns = null;

      if (this.componentContent != null) {
        numColumns = this.componentContent.numColumns;
      }

      return numColumns;
    }
  }, {
    key: 'getResponse',


    /**
     * Get the text the student typed
     */
    value: function getResponse() {
      var response = null;

      if (this.studentResponse != null) {
        response = this.studentResponse;
      }

      return response;
    }
  }, {
    key: 'importWork',


    /**
     * Import work from another component
     */
    value: function importWork() {

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // get the import previous work node id and component id
        var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
        var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;

        if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

          /*
           * check if the node id is in the field that we used to store
           * the import previous work node id in
           */
          if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
            importPreviousWorkNodeId = componentContent.importWorkNodeId;
          }
        }

        if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

          /*
           * check if the component id is in the field that we used to store
           * the import previous work component id in
           */
          if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
            importPreviousWorkComponentId = componentContent.importWorkComponentId;
          }
        }

        if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

          // get the latest component state for this component
          var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

          /*
           * we will only import work into this component if the student
           * has not done any work for this component
           */
          if (componentState == null) {
            // the student has not done any work for this component

            // get the latest component state from the component we are importing from
            var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

            if (importWorkComponentState != null) {
              /*
               * populate a new component state with the work from the
               * imported component state
               */
              var populatedComponentState = this.OpenResponseService.populateComponentState(importWorkComponentState);

              // populate the component state into this component
              this.setStudentWork(populatedComponentState);

              // make the work dirty so that it gets saved
              this.studentDataChanged();
            }
          }
        }
      }
    }
  }, {
    key: 'getComponentId',


    /**
     * Get the component id
     * @return the component id
     */
    value: function getComponentId() {
      return this.componentContent.id;
    }
  }, {
    key: 'authoringViewComponentChanged',


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
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
    key: 'authoringShowPreviousWorkClicked',


    /**
     * The show previous work checkbox was clicked
     */
    value: function authoringShowPreviousWorkClicked() {

      if (!this.authoringComponentContent.showPreviousWork) {
        /*
         * show previous work has been turned off so we will clear the
         * show previous work node id, show previous work component id, and
         * show previous work prompt values
         */
        this.authoringComponentContent.showPreviousWorkNodeId = null;
        this.authoringComponentContent.showPreviousWorkComponentId = null;
        this.authoringComponentContent.showPreviousWorkPrompt = null;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The show previous work node id has changed
     */

  }, {
    key: 'authoringShowPreviousWorkNodeIdChanged',
    value: function authoringShowPreviousWorkNodeIdChanged() {

      if (this.authoringComponentContent.showPreviousWorkNodeId == null || this.authoringComponentContent.showPreviousWorkNodeId == '') {

        /*
         * the show previous work node id is null so we will also set the
         * show previous component id to null
         */
        this.authoringComponentContent.showPreviousWorkComponentId = '';
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The show previous work component id has changed
     */

  }, {
    key: 'authoringShowPreviousWorkComponentIdChanged',
    value: function authoringShowPreviousWorkComponentIdChanged() {

      // get the show previous work node id
      var showPreviousWorkNodeId = this.authoringComponentContent.showPreviousWorkNodeId;

      // get the show previous work prompt boolean value
      var showPreviousWorkPrompt = this.authoringComponentContent.showPreviousWorkPrompt;

      // get the old show previous work component id
      var oldShowPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

      // get the new show previous work component id
      var newShowPreviousWorkComponentId = this.authoringComponentContent.showPreviousWorkComponentId;

      // get the new show previous work component
      var newShowPreviousWorkComponent = this.ProjectService.getComponentByNodeIdAndComponentId(showPreviousWorkNodeId, newShowPreviousWorkComponentId);

      if (newShowPreviousWorkComponent == null || newShowPreviousWorkComponent == '') {
        // the new show previous work component is empty

        // save the component
        this.authoringViewComponentChanged();
      } else if (newShowPreviousWorkComponent != null) {

        // get the current component type
        var currentComponentType = this.componentContent.type;

        // get the new component type
        var newComponentType = newShowPreviousWorkComponent.type;

        // check if the component types are different
        if (newComponentType != currentComponentType) {
          /*
           * the component types are different so we will need to change
           * the whole component
           */

          // make sure the author really wants to change the component type
          var answer = confirm(this.$translate('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THIS_COMPONENT_TYPE'));

          if (answer) {
            // the author wants to change the component type

            /*
             * get the component service so we can make a new instance
             * of the component
             */
            var componentService = this.$injector.get(newComponentType + 'Service');

            if (componentService != null) {

              // create a new component
              var newComponent = componentService.createComponent();

              // set move over the values we need to keep
              newComponent.id = this.authoringComponentContent.id;
              newComponent.showPreviousWork = true;
              newComponent.showPreviousWorkNodeId = showPreviousWorkNodeId;
              newComponent.showPreviousWorkComponentId = newShowPreviousWorkComponentId;
              newComponent.showPreviousWorkPrompt = showPreviousWorkPrompt;

              /*
               * update the authoring component content JSON string to
               * change the component
               */
              this.authoringComponentContentJSONString = JSON.stringify(newComponent);

              // update the component in the project and save the project
              this.advancedAuthoringViewComponentChanged();
            }
          } else {
            /*
             * the author does not want to change the component type so
             * we will rollback the showPreviousWorkComponentId value
             */
            this.authoringComponentContent.showPreviousWorkComponentId = oldShowPreviousWorkComponentId;
          }
        } else {
          /*
           * the component types are the same so we do not need to change
           * the component type and can just save
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */

  }, {
    key: 'getStepNodeIds',
    value: function getStepNodeIds() {
      var stepNodeIds = this.ProjectService.getNodeIds();

      return stepNodeIds;
    }

    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */

  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

      return nodePositionAndTitle;
    }

    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */

  }, {
    key: 'getComponentsByNodeId',
    value: function getComponentsByNodeId(nodeId) {
      var components = this.ProjectService.getComponentsByNodeId(nodeId);

      return components;
    }

    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */

  }, {
    key: 'isApplicationNode',
    value: function isApplicationNode(nodeId) {
      var result = this.ProjectService.isApplicationNode(nodeId);

      return result;
    }

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */

  }, {
    key: 'updateAdvancedAuthoringView',
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'setSaveMessage',


    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    value: function setSaveMessage(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'isCRaterEnabled',


    /**
     * Check if CRater is enabled for this component
     * @returns whether CRater is enabled for this component
     */
    value: function isCRaterEnabled() {
      var result = false;

      if (this.CRaterService.isCRaterEnabled(this.componentContent)) {
        result = true;
      }

      return result;
    }

    /**
     * Check if CRater is set to score on save
     * @returns whether CRater is set to score on save
     */

  }, {
    key: 'isCRaterScoreOnSave',
    value: function isCRaterScoreOnSave() {
      var result = false;

      if (this.CRaterService.isCRaterScoreOnSave(this.componentContent)) {
        result = true;
      }

      return result;
    }

    /**
     * Check if CRater is set to score on submit
     * @returns whether CRater is set to score on submit
     */

  }, {
    key: 'isCRaterScoreOnSubmit',
    value: function isCRaterScoreOnSubmit() {
      var result = false;

      if (this.CRaterService.isCRaterScoreOnSubmit(this.componentContent)) {
        result = true;
      }

      return result;
    }

    /**
     * Check if CRater is set to score on change
     * @returns whether CRater is set to score on change
     */

  }, {
    key: 'isCRaterScoreOnChange',
    value: function isCRaterScoreOnChange() {
      var result = false;

      if (this.CRaterService.isCRaterScoreOnChange(this.componentContent)) {
        result = true;
      }

      return result;
    }

    /**
     * Check if CRater is set to score when the student exits the step
     * @returns whether CRater is set to score when the student exits the step
     */

  }, {
    key: 'isCRaterScoreOnExit',
    value: function isCRaterScoreOnExit() {
      var result = false;

      if (this.CRaterService.isCRaterScoreOnExit(this.componentContent)) {
        result = true;
      }

      return result;
    }

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */

  }, {
    key: 'registerExitListener',
    value: function registerExitListener() {

      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      this.exitListener = this.$scope.$on('exit', function (event, args) {});
    }
  }, {
    key: 'authoringAddScoringRule',


    /**
     * Add a scoring rule
     */
    value: function authoringAddScoringRule() {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // create a scoring rule object
        var newScoringRule = {};
        newScoringRule.score = '';
        newScoringRule.feedbackText = '';

        // add the new scoring rule object
        this.authoringComponentContent.cRater.scoringRules.push(newScoringRule);

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a scoring rule up
     * @param index the index of the scoring rule
     */

  }, {
    key: 'authoringViewScoringRuleUpClicked',
    value: function authoringViewScoringRuleUpClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // make sure the scoring rule is not already at the top
        if (index != 0) {
          // the scoring rule is not at the top so we can move it up

          // get the scoring rule
          var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

          // remove the scoring rule
          this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

          // add the scoring rule back at the position one index back
          this.authoringComponentContent.cRater.scoringRules.splice(index - 1, 0, scoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a scoring rule down
     * @param index the index of the scoring rule
     */

  }, {
    key: 'authoringViewScoringRuleDownClicked',
    value: function authoringViewScoringRuleDownClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // make sure the scoring rule is not already at the end
        if (index != this.authoringComponentContent.cRater.scoringRules.length - 1) {

          // get the scoring rule
          var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

          // remove the scoring rule
          this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

          // add the scoring rule back at the position one index forward
          this.authoringComponentContent.cRater.scoringRules.splice(index + 1, 0, scoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Delete a scoring rule
     * @param index the index of the scoring rule
     */

  }, {
    key: 'authoringViewScoringRuleDeleteClicked',
    value: function authoringViewScoringRuleDeleteClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // get the scoring rule
        var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

        if (scoringRule != null) {

          // get the score and feedback text
          var score = scoringRule.score;
          var feedbackText = scoringRule.feedbackText;

          // make sure the author really wants to delete the scoring rule
          //var answer = confirm('Are you sure you want to delete this scoring rule?\n\nScore: ' + score + '\n\n' + 'Feedback Text: ' + feedbackText);
          var answer = confirm(this.$translate('openResponse.areYouSureYouWantToDeleteThisScoringRule', { score: score, feedbackText: feedbackText }));

          if (answer) {
            // the author answered yes to delete the scoring rule
            this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * Add a new notification. Currently assumes this is a notification based on CRaterResult, but
     * we can add different types in the future.
     */

  }, {
    key: 'authoringAddNotification',
    value: function authoringAddNotification() {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // create a new notification
        var newNotification = {
          notificationType: 'CRaterResult',
          enableCriteria: {
            scoreSequence: ['', '']
          },
          isAmbient: false,
          dismissCode: 'apple',
          isNotifyTeacher: true,
          isNotifyStudent: true,
          notificationMessageToStudent: '{{username}}, ' + this.$translate('openResponse.youGotAScoreOf') + ' {{score}}. ' + this.$translate('openResponse.pleaseTalkToYourTeacher') + '.',
          notificationMessageToTeacher: '{{username}} ' + this.$translate('openResponse.gotAScoreOf') + ' {{score}}.'
        };

        // add the new notification
        this.authoringComponentContent.notificationSettings.notifications.push(newNotification);

        // the author has made changes so we will save the component content
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Add a multiple attempt scoring rule
     */

  }, {
    key: 'authoringAddMultipleAttemptScoringRule',
    value: function authoringAddMultipleAttemptScoringRule() {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // create a new multiple attempt scoring rule
        var newMultipleAttemptScoringRule = {};
        newMultipleAttemptScoringRule.scoreSequence = ['', ''];
        newMultipleAttemptScoringRule.feedbackText = '';

        // add the new multiple attempt scoring rule
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.push(newMultipleAttemptScoringRule);

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a multiple attempt scoring rule up
     * @param index
     */

  }, {
    key: 'authoringViewMultipleAttemptScoringRuleUpClicked',
    value: function authoringViewMultipleAttemptScoringRuleUpClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // make sure the multiple attempt scoring rule is not already at the top
        if (index != 0) {
          // the multiple attempt scoring rule is not at the top

          // get the multiple attempt scoring rule
          var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

          // remove the multiple attempt scoring rule
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

          // add the multiple attempt scoring rule back at the position one index back
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index - 1, 0, multipleAttemptScoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a multiple attempt scoring rule down
     * @param index the index of the multiple attempt scoring rule
     */

  }, {
    key: 'authoringViewMultipleAttemptScoringRuleDownClicked',
    value: function authoringViewMultipleAttemptScoringRuleDownClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // make sure the multiple attempt scoring rule is not at the end
        if (index != this.authoringComponentContent.cRater.multipleAttemptScoringRules.length - 1) {
          // the multiple attempt scoring rule is not at the end

          // get the multiple attempt scoring rule
          var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

          // remove the multiple attempt scoring rule
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

          // add the multiple attempt scoring rule back at the position one index forward
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index + 1, 0, multipleAttemptScoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Delete a multiple attempt scoring rule
     * @param index the index of the mulitple attempt scoring rule
     */

  }, {
    key: 'authoringViewMultipleAttemptScoringRuleDeleteClicked',
    value: function authoringViewMultipleAttemptScoringRuleDeleteClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // get the multiple attempt scoring rule
        var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

        if (multipleAttemptScoringRule != null) {

          // get the score sequence
          var scoreSequence = multipleAttemptScoringRule.scoreSequence;
          var previousScore = '';
          var currentScore = '';

          if (scoreSequence != null) {
            previousScore = scoreSequence[0];
            currentScore = scoreSequence[1];
          }

          // get the feedback text
          var feedbackText = multipleAttemptScoringRule.feedbackText;

          // make sure the author really wants to delete the multiple attempt scoring rule
          var answer = confirm(this.$translate('openResponse.areYouSureYouWantToDeleteThisMultipleAttemptScoringRule', { previousScore: previousScore, currentScore: currentScore, feedbackText: feedbackText }));

          if (answer) {
            // the author answered yes to delete the multiple attempt scoring rule
            this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * Move a notification up
     * @param index of the notification
     */

  }, {
    key: 'authoringViewNotificationUpClicked',
    value: function authoringViewNotificationUpClicked(index) {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // make sure the notification is not already at the top
        if (index != 0) {
          // the notification is not at the top

          // get the notification
          var notification = this.authoringComponentContent.notificationSettings.notifications[index];

          // remove the notification
          this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

          // add the notification back at the position one index back
          this.authoringComponentContent.notificationSettings.notifications.splice(index - 1, 0, notification);

          // the author has made changes so we will save the component content
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a notification down
     * @param index the index of the notification
     */

  }, {
    key: 'authoringViewNotificationDownClicked',
    value: function authoringViewNotificationDownClicked(index) {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // make sure the notification is not at the end
        if (index != this.authoringComponentContent.notificationSettings.notifications.length - 1) {
          // the notification is not at the end

          // get the notification
          var notification = this.authoringComponentContent.notificationSettings.notifications[index];

          // remove the notification
          this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

          // add the notification back at the position one index forward
          this.authoringComponentContent.notificationSettings.notifications.splice(index + 1, 0, notification);

          // the author has made changes so we will save the component content
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Delete a notification
     * @param index the index of the notification
     */

  }, {
    key: 'authoringViewNotificationDeleteClicked',
    value: function authoringViewNotificationDeleteClicked(index) {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // get the notification
        var notification = this.authoringComponentContent.notificationSettings.notifications[index];

        if (notification != null) {

          // get the score sequence
          var scoreSequence = notification.enableCriteria.scoreSequence;
          var previousScore = '';
          var currentScore = '';

          if (scoreSequence != null) {
            previousScore = scoreSequence[0];
            currentScore = scoreSequence[1];
          }

          // make sure the author really wants to delete the notification
          var answer = confirm(this.$translate('openResponse.areYouSureYouWantToDeleteThisNotification', { previousScore: previousScore, currentScore: currentScore }));

          if (answer) {
            // the author answered yes to delete the notification
            this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

            // the author has made changes so we will save the component content
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * The "Enable CRater" checkbox was clicked
     */

  }, {
    key: 'authoringViewEnableCRaterClicked',
    value: function authoringViewEnableCRaterClicked() {

      if (this.authoringComponentContent.enableCRater) {
        // CRater was turned on

        if (this.authoringComponentContent.cRater == null) {
          /*
           * the cRater object does not exist in the component content
           * so we will create it
           */

          // create the cRater object
          var cRater = {};
          cRater.itemType = 'CRATER';
          cRater.itemId = '';
          cRater.scoreOn = 'submit';
          cRater.showScore = true;
          cRater.showFeedback = true;
          cRater.scoringRules = [];
          cRater.enableMultipleAttemptScoringRules = false;
          cRater.multipleAttemptScoringRules = [];

          // set the cRater object into the component content
          this.authoringComponentContent.cRater = cRater;
        }

        // turn on the submit button
        //this.authoringComponentContent.showSubmitButton = true;
        this.setShowSubmitButtonValue(true);
      } else {
        // CRater was turned off

        // turn off the submit button
        this.setShowSubmitButtonValue(false);
      }

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * The "Enable Multiple Attempt Feedback" checkbox was clicked
     */

  }, {
    key: 'enableMultipleAttemptScoringRulesClicked',
    value: function enableMultipleAttemptScoringRulesClicked() {

      // get the cRater object from the component content
      var cRater = this.authoringComponentContent.cRater;

      if (cRater != null && cRater.multipleAttemptScoringRules == null) {
        /*
         * the multiple attempt scoring rules array does not exist so
         * we will create it
         */
        cRater.multipleAttemptScoringRules = [];
      }

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * The "Enable Notifications" checkbox was clicked
     */

  }, {
    key: 'authoringViewEnableNotificationsClicked',
    value: function authoringViewEnableNotificationsClicked() {

      if (this.authoringComponentContent.enableNotifications) {
        // Notifications was turned on

        if (this.authoringComponentContent.notificationSettings == null) {
          /*
           * the NotificationSettings object does not exist in the component content
           * so we will create it
           */
          this.authoringComponentContent.notificationSettings = {
            notifications: []
          };
        }
      }

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      var result = true;

      if (component != null) {
        result = this.ProjectService.componentHasWork(component);
      }

      return result;
    }

    /**
     * Returns all the revisions made by this user for the specified component
     */

  }, {
    key: 'getRevisions',
    value: function getRevisions() {
      // get the component states for this component
      return this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
    }
  }, {
    key: 'authoringImportPreviousWorkClicked',


    /**
     * The import previous work checkbox was clicked
     */
    value: function authoringImportPreviousWorkClicked() {

      if (!this.authoringComponentContent.importPreviousWork) {
        /*
         * import previous work has been turned off so we will clear the
         * import previous work node id, and import previous work
         * component id
         */
        this.authoringComponentContent.importPreviousWorkNodeId = null;
        this.authoringComponentContent.importPreviousWorkComponentId = null;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The import previous work node id has changed
     */

  }, {
    key: 'authoringImportPreviousWorkNodeIdChanged',
    value: function authoringImportPreviousWorkNodeIdChanged() {

      if (this.authoringComponentContent.importPreviousWorkNodeId == null || this.authoringComponentContent.importPreviousWorkNodeId == '') {

        /*
         * the import previous work node id is null so we will also set the
         * import previous component id to null
         */
        this.authoringComponentContent.importPreviousWorkComponentId = '';
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The import previous work component id has changed
     */

  }, {
    key: 'authoringImportPreviousWorkComponentIdChanged',
    value: function authoringImportPreviousWorkComponentIdChanged() {

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
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
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

      if (this.authoringComponentContent.tags == null) {
        // initialize the tags array
        this.authoringComponentContent.tags = [];
      }

      // add a tag
      this.authoringComponentContent.tags.push('');

      // the authoring component content has changed so we will save the project
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

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index back
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
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

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index forward
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a tag
     * @param index the index of the tag to delete
     */

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Get the import previous work node id
     * @return the import previous work node id or null
     */

  }, {
    key: 'getImportPreviousWorkNodeId',
    value: function getImportPreviousWorkNodeId() {
      var importPreviousWorkNodeId = null;

      if (this.componentContent != null && this.componentContent.importPreviousWorkNodeId != null) {
        importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;

        if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
          /*
           * check if the node id is in the field that we used to store
           * the import previous work node id in
           */
          importPreviousWorkNodeId = this.componentContent.importWorkNodeId;
        }
      }

      return importPreviousWorkNodeId;
    }

    /**
     * Get the import previous work component id
     * @return the import previous work component id or null
     */

  }, {
    key: 'getImportPreviousWorkComponentId',
    value: function getImportPreviousWorkComponentId() {
      var importPreviousWorkComponentId = null;

      if (this.componentContent != null && this.componentContent.importPreviousWorkComponentId != null) {
        var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

        if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
          /*
           * check if the component id is in the field that we used to store
           * the import previous work component id in
           */
          importPreviousWorkComponentId = this.componentContent.importWorkComponentId;
        }
      }

      return importPreviousWorkComponentId;
    }

    /**
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {

      // get the connected components
      var connectedComponents = this.componentContent.connectedComponents;

      if (connectedComponents != null) {

        var componentStates = [];

        // loop through all the connected components
        for (var c = 0; c < connectedComponents.length; c++) {
          var connectedComponent = connectedComponents[c];

          if (connectedComponent != null) {
            var nodeId = connectedComponent.nodeId;
            var componentId = connectedComponent.componentId;
            var type = connectedComponent.type;

            if (type == 'showWork') {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }

              // we are showing work so we will not allow the student to edit it
              this.isDisabled = true;
            } else if (type == 'importWork' || type == null) {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }
            }
          }
        }

        // merge the student responses from all the component states
        var mergedComponentState = this.createMergedComponentState(componentStates);

        // set the student work into the component
        this.setStudentWork(mergedComponentState);

        // make the work dirty so that it gets saved
        this.studentDataChanged();
      }
    }

    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {

      // create a new component state
      var mergedComponentState = this.NodeService.createNewComponentState();

      if (componentStates != null) {

        var mergedResponse = '';

        // loop through all the component state
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];

          if (componentState != null) {
            var studentData = componentState.studentData;

            if (studentData != null) {

              // get the student response
              var response = studentData.response;

              if (response != null && response != '') {
                if (mergedResponse != '') {
                  // add a new line between the responses
                  mergedResponse += '\n';
                }

                // append the response
                mergedResponse += response;
              }
            }
          }
        }

        if (mergedResponse != null && mergedResponse != '') {
          // set the merged response into the merged component state
          mergedComponentState.studentData = {};
          mergedComponentState.studentData.response = mergedResponse;
        }
      }

      return mergedComponentState;
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
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var component = _step.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
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

    /**
     * The show JSON button was clicked to show or hide the JSON authoring
     */

  }, {
    key: 'showJSONButtonClicked',
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

    /**
     * The Use Completion Criteria checkbox was clicked. We will toggle the
     * completion criteria in the component content.
     * @return False if we want to cancel the click and not perform any changes.
     * True if we want to perform the changes.
     */

  }, {
    key: 'useCustomCompletionCriteriaClicked',
    value: function useCustomCompletionCriteriaClicked() {
      if (this.useCustomCompletionCriteria == false) {
        /*
         * The completion criteria was changed from true to false which
         * means we will delete the completionCriteria object. We will confirm
         * with the author that they want to delete the completion criteria.
         */
        var answer = confirm(this.$translate('areYouSureYouWantToDeleteTheCustomCompletionCriteria'));
        if (!answer) {
          // the author answered no so we will abort
          this.useCustomCompletionCriteria = true;
          return false;
        }
      }

      if (this.useCustomCompletionCriteria) {
        /*
         * We are using a completion criteria so we will populate it if it
         * doesn't already exist.
         */
        if (this.authoringComponentContent.completionCriteria == null) {
          this.authoringComponentContent.completionCriteria = {
            inOrder: true,
            criteria: []
          };
        }
      } else {
        // we are not using a completion criteria so we will delete it
        delete this.authoringComponentContent.completionCriteria;
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
      return true;
    }

    /**
     * Move a completion criteria up.
     * @param index The index of the completion criteria to move up.
     */

  }, {
    key: 'moveCompletionCriteriaUp',
    value: function moveCompletionCriteriaUp(index) {
      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the criteria
        var criteria = this.authoringComponentContent.completionCriteria.criteria[index];

        // remove the criteria
        this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);

        // insert the criteria one index back
        this.authoringComponentContent.completionCriteria.criteria.splice(index - 1, 0, criteria);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a completion criteria down.
     * @param index The index of the completion criteria to move down.
     */

  }, {
    key: 'moveCompletionCriteriaDown',
    value: function moveCompletionCriteriaDown(index) {
      if (index < this.authoringComponentContent.completionCriteria.criteria.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the criteria
        var criteria = this.authoringComponentContent.completionCriteria.criteria[index];

        // remove the criteria
        this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);

        // insert the criteria one index forward
        this.authoringComponentContent.completionCriteria.criteria.splice(index + 1, 0, criteria);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a completion criteria.
     */

  }, {
    key: 'authoringAddCompletionCriteria',
    value: function authoringAddCompletionCriteria() {
      var newCompletionCriteria = {
        nodeId: this.nodeId,
        componentId: this.componentId,
        name: 'isSubmitted'
      };
      this.authoringComponentContent.completionCriteria.criteria.push(newCompletionCriteria);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a completion criteria.
     * @param index The index of the completion criteria.
     */

  }, {
    key: 'authoringDeleteCompletionCriteria',
    value: function authoringDeleteCompletionCriteria(index) {
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisCompletionCriteria'));
      if (answer) {
        // remove the criteria
        this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if the item id is a valid CRater item id.
     * @param itemId A string.
     */

  }, {
    key: 'verifyCRaterItemId',
    value: function verifyCRaterItemId(itemId) {
      var _this5 = this;

      // clear the Valid/Invalid text
      this.cRaterItemIdIsValid = null;

      // turn on the "Verifying..." text
      this.isVerifyingCRaterItemId = true;

      this.CRaterService.verifyCRaterItemId(itemId).then(function (isValid) {
        // turn off the "Verifying..." text
        _this5.isVerifyingCRaterItemId = false;

        // set the Valid/Invalid text
        _this5.cRaterItemIdIsValid = isValid;
      });
    }
  }]);

  return OpenResponseController;
}();

;

OpenResponseController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotificationService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = OpenResponseController;
//# sourceMappingURL=openResponseController.js.map
