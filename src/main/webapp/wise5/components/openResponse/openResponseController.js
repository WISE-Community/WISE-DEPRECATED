'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OpenResponseController = function (_ComponentController) {
  _inherits(OpenResponseController, _ComponentController);

  function OpenResponseController($filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, OpenResponseController);

    var _this = _possibleConstructorReturn(this, (OpenResponseController.__proto__ || Object.getPrototypeOf(OpenResponseController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.CRaterService = CRaterService;
    _this.NotificationService = NotificationService;
    _this.OpenResponseService = OpenResponseService;

    // holds the text that the student has typed
    _this.studentResponse = '';

    // holds student attachments like assets
    _this.attachments = [];

    // whether rich text editing is enabled
    _this.isRichTextEnabled = false;

    // whether we're only showing the student work
    _this.onlyShowWork = false;

    // the latest annotations
    _this.latestAnnotations = null;

    // used to hold a message dialog if we need to use one
    _this.messageDialog = null;

    // whether this component uses a custom completion criteria
    _this.useCustomCompletionCriteria = false;

    // whether we are currently verifying a CRater item id
    _this.isVerifyingCRaterItemId = false;

    // whether the CRater item id is valid
    _this.cRaterItemIdIsValid = null;

    //var scope = this;
    var themePath = _this.ProjectService.getThemePath();

    // TODO: make toolbar items and plugins customizable by authors (OR strip down to only special characters, support for equations)
    // Rich text editor options
    _this.tinymceOptions = {
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

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'onlyShowWork') {
      _this.onlyShowWork = true;
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    }

    var componentState = null;

    // set whether rich text is enabled
    _this.isRichTextEnabled = _this.componentContent.isRichTextEnabled;

    // set whether studentAttachment is enabled
    _this.isStudentAttachmentEnabled = _this.componentContent.isStudentAttachmentEnabled;

    if (_this.componentContent.completionCriteria != null) {
      _this.useCustomCompletionCriteria = true;
    }

    // get the component state from the scope
    componentState = _this.$scope.componentState;

    if (_this.mode == 'student') {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        // we will show work from another component
        _this.handleConnectedComponents();
      } else if (componentState != null && _this.OpenResponseService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        // we will import work from another component
        _this.handleConnectedComponents();
      } else if (componentState == null) {
        // check if we need to import work

        if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
          /*
           * the student does not have any work and there are connected
           * components so we will get the work from the connected
           * components
           */
          _this.handleConnectedComponents();
        } else if (_this.componentContent.starterSentence != null) {
          /*
           * the student has not done any work and there is a starter sentence
           * so we will populate the textarea with the starter sentence
           */
          _this.studentResponse = _this.componentContent.starterSentence;
        }
      }
    } else {
      // populate the student work into this component
      _this.setStudentWork(componentState);
    }

    // check if the student has used up all of their submits
    if (_this.componentContent.maxSubmitCount != null && _this.submitCounter >= _this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    if (_this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

    //$('.openResponse').off('dragover').off('drop');

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    _this.$scope.isDirty = function () {
      return this.$scope.openResponseController.isDirty;
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
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
    }.bind(_this);

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', function (event, args) {}.bind(_this));

    _this.$scope.$on('notebookItemChosen', function (event, args) {
      if (args.requester == _this.nodeId + '-' + _this.componentId) {
        var notebookItem = args.notebookItem;
        var studentWorkId = notebookItem.content.studentWorkIds[0];
        _this.importWorkByStudentWorkId(studentWorkId);
      }
    });

    // load script for this component, if any
    var script = _this.componentContent.script;
    if (script != null) {
      _this.ProjectService.retrieveScript(script).then(function (script) {
        new Function(script).call(_this);
      });
    }

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(OpenResponseController, [{
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

  }, {
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
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
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
     * Get the student response
     */

  }, {
    key: 'getStudentResponse',
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

      if (this.parentStudentWorkIds != null) {
        studentData.parentStudentWorkIds = this.parentStudentWorkIds;
      }

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
      var _this2 = this;

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
                autoScoreAnnotationData.maxAutoScore = _this2.ProjectService.getMaxScoreForComponent(_this2.nodeId, _this2.componentId);
                autoScoreAnnotationData.concepts = concepts;
                autoScoreAnnotationData.autoGrader = 'cRater';

                var autoScoreAnnotation = _this2.createAutoScoreAnnotation(autoScoreAnnotationData);

                var annotationGroupForScore = null;

                if (_this2.$scope.$parent.nodeController != null) {
                  // get the previous score and comment annotations
                  var latestAnnotations = _this2.$scope.$parent.nodeController.getLatestComponentAnnotations(_this2.componentId);

                  if (latestAnnotations != null && latestAnnotations.score != null && latestAnnotations.score.data != null) {

                    // get the previous score annotation value
                    previousScore = latestAnnotations.score.data.value;
                  }

                  if (_this2.componentContent.enableGlobalAnnotations && _this2.componentContent.globalAnnotationSettings != null) {

                    var globalAnnotationMaxCount = 0;
                    if (_this2.componentContent.globalAnnotationSettings.globalAnnotationMaxCount != null) {
                      globalAnnotationMaxCount = _this2.componentContent.globalAnnotationSettings.globalAnnotationMaxCount;
                    }
                    // get the annotation properties for the score that the student got.
                    annotationGroupForScore = _this2.ProjectService.getGlobalAnnotationGroupByScore(_this2.componentContent, previousScore, score);

                    // check if we need to apply this globalAnnotationSetting to this annotation: we don't need to if we've already reached the maxCount
                    if (annotationGroupForScore != null) {
                      var globalAnnotationGroupsByNodeIdAndComponentId = _this2.AnnotationService.getAllGlobalAnnotationGroups(_this2.nodeId, _this2.componentId);
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

                if (_this2.mode === 'authoring') {
                  if (_this2.latestAnnotations == null) {
                    _this2.latestAnnotations = {};
                  }

                  /*
                   * we are in the authoring view so we will set the
                   * latest score annotation manually
                   */
                  _this2.latestAnnotations.score = autoScoreAnnotation;
                }

                var autoComment = null;

                // get the submit counter
                var submitCounter = _this2.submitCounter;

                if (_this2.componentContent.cRater.enableMultipleAttemptScoringRules && submitCounter > 1) {
                  /*
                   * this step has multiple attempt scoring rules and this is
                   * a subsequent submit
                   */
                  // get the feedback based upon the previous score and current score
                  autoComment = _this2.CRaterService.getMultipleAttemptCRaterFeedbackTextByScore(_this2.componentContent, previousScore, score);
                } else {
                  // get the feedback text
                  autoComment = _this2.CRaterService.getCRaterFeedbackTextByScore(_this2.componentContent, score);
                }

                if (autoComment != null) {
                  // create the auto comment annotation
                  var autoCommentAnnotationData = {};
                  autoCommentAnnotationData.value = autoComment;
                  autoCommentAnnotationData.concepts = concepts;
                  autoCommentAnnotationData.autoGrader = 'cRater';

                  var autoCommentAnnotation = _this2.createAutoCommentAnnotation(autoCommentAnnotationData);

                  if (_this2.componentContent.enableGlobalAnnotations) {
                    if (annotationGroupForScore != null) {
                      // copy over the annotation properties into the autoCommentAnnotation's data
                      angular.merge(autoCommentAnnotation.data, annotationGroupForScore);
                    }
                  }
                  componentState.annotations.push(autoCommentAnnotation);

                  if (_this2.mode === 'authoring') {
                    if (_this2.latestAnnotations == null) {
                      _this2.latestAnnotations = {};
                    }

                    /*
                     * we are in the authoring view so we will set the
                     * latest comment annotation manually
                     */
                    _this2.latestAnnotations.comment = autoCommentAnnotation;
                  }
                }
                if (_this2.componentContent.enableNotifications) {
                  // get the notification properties for the score that the student got.
                  var notificationForScore = _this2.ProjectService.getNotificationByScore(_this2.componentContent, previousScore, score);

                  if (notificationForScore != null) {
                    notificationForScore.score = score;
                    notificationForScore.nodeId = _this2.nodeId;
                    notificationForScore.componentId = _this2.componentId;
                    _this2.NotificationService.sendNotificationForScore(notificationForScore);
                  }
                }

                // display global annotations dialog if needed
                if (_this2.componentContent.enableGlobalAnnotations && annotationGroupForScore != null && annotationGroupForScore.isGlobal && annotationGroupForScore.isPopup) {
                  _this2.$scope.$emit('displayGlobalAnnotations');
                }
              }
            }
          }

          /*
           * hide the dialog that tells the student to wait since
           * the work has been scored.
           */
          _this2.$mdDialog.hide();

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
  }, {
    key: 'removeAttachment',
    value: function removeAttachment(attachment) {
      if (this.attachments.indexOf(attachment) != -1) {
        this.attachments.splice(this.attachments.indexOf(attachment), 1);
        this.studentDataChanged();
      }
    }

    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */

  }, {
    key: 'attachStudentAsset',
    value: function attachStudentAsset(studentAsset) {
      var _this3 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {
            var attachment = {
              studentAssetId: copiedAsset.id,
              iconURL: copiedAsset.iconURL
            };

            _this3.attachments.push(attachment);
            _this3.studentDataChanged();
          }
        });
      }
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
    key: 'snipButtonClicked',
    value: function snipButtonClicked($event) {
      var _this4 = this;

      if (this.isDirty) {
        var deregisterListener = this.$scope.$on('studentWorkSavedToServer', function (event, args) {
          var componentState = args.studentWork;
          if (componentState && _this4.nodeId === componentState.nodeId && _this4.componentId === componentState.componentId) {
            var imageObject = null;
            var noteText = componentState.studentData.response;
            var isEditTextEnabled = false;
            var isFileUploadEnabled = false;
            _this4.NotebookService.addNote($event, imageObject, noteText, [componentState.id], isEditTextEnabled, isFileUploadEnabled);
            deregisterListener();
          }
        });
        this.saveButtonClicked(); // trigger a save
      } else {
        var studentWork = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        var imageObject = null;
        var noteText = studentWork.studentData.response;
        var isEditTextEnabled = false;
        var isFileUploadEnabled = false;
        this.NotebookService.addNote($event, imageObject, noteText, [studentWork.id], isEditTextEnabled, isFileUploadEnabled);
      }
    }

    /**
     * Check if CRater is enabled for this component
     * @returns whether CRater is enabled for this component
     */

  }, {
    key: 'isCRaterEnabled',
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
    key: 'getRevisions',


    /**
     * Returns all the revisions made by this user for the specified component
     */
    value: function getRevisions() {
      // get the component states for this component
      return this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
    }
  }, {
    key: 'createMergedComponentState',


    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */
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
  }]);

  return OpenResponseController;
}(_componentController2.default);

;

OpenResponseController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotebookService', 'NotificationService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = OpenResponseController;
//# sourceMappingURL=openResponseController.js.map
