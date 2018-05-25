'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioOscillatorController = function (_ComponentController) {
  _inherits(AudioOscillatorController, _ComponentController);

  function AudioOscillatorController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, AudioOscillatorService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AudioOscillatorController);

    var _this = _possibleConstructorReturn(this, (AudioOscillatorController.__proto__ || Object.getPrototypeOf(AudioOscillatorController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.AudioOscillatorService = AudioOscillatorService;

    // holds the text that the student has typed
    _this.studentResponse = '';

    // an array of frequencies that the student has played
    _this.frequenciesPlayed = [];

    // an array of sorted frequencies that the student has played
    _this.frequenciesPlayedSorted = [];

    // the number of frequences the student has played
    _this.numberOfFrequenciesPlayed = 0;

    // the lowest frequency the student played
    _this.minFrequencyPlayed = null;

    // the highest frequency the student played
    _this.maxFrequencyPlayed = null;

    // holds student attachments like assets
    _this.attachments = [];

    // the latest annotations
    _this.latestAnnotations = null;

    // whether the audio is playing
    _this.isPlaying = false;

    // default oscillator type to sine
    _this.oscillatorType = 'sine';

    // default frequency is 440
    _this.frequency = 440;

    // holds the oscillator types the student can choose
    _this.oscillatorTypes = [];

    // the default dimensions of the oscilloscope
    _this.oscilloscopeId = 'oscilloscope';
    _this.oscilloscopeWidth = 800;
    _this.oscilloscopeHeight = 400;
    _this.gridCellSize = 50;

    // whether we should stop drawing after a good draw
    _this.stopAfterGoodDraw = true;

    _this.showOscillatorTypeChooser = false;
    _this.availableOscillatorTypes = ['sine', 'square', 'triangle', 'sawtooth'];
    _this.oscillatorTypeToAdd = 'sine';

    // the text to display on the play/stop button
    _this.playStopButtonText = _this.$translate('audioOscillator.play');

    // the options for when to update this component from a connected component
    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{
      type: 'AudioOscillator'
    }];

    _this.authoringComponentContentJSONString = _this.$scope.authoringComponentContentJSONString;

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
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'onlyShowWork') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'authoring') {
      // generate the summernote rubric element id
      _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

      // set the component rubric into the summernote rubric
      _this.summernoteRubricHTML = _this.componentContent.rubric;

      // the tooltip text for the insert WISE asset button
      var insertAssetString = _this.$translate('INSERT_ASSET');

      /*
       * create the custom button for inserting WISE assets into
       * summernote
       */
      var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

      /*
       * the options that specifies the tools to display in the
       * summernote prompt
       */
      _this.summernoteRubricOptions = {
        toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
        height: 300,
        disableDragAndDrop: true,
        buttons: {
          insertAssetButton: InsertAssetButton
        }
      };

      // update which oscillator types should be checked
      _this.authoringProcessCheckedOscillatorTypes();

      _this.updateAdvancedAuthoringView();

      $scope.$watch(function () {
        return this.authoringComponentContent;
      }.bind(_this), function (newValue, oldValue) {
        var _this2 = this;

        // stop the audio if it is playing
        this.stop();

        // inject asset paths if necessary
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);

        this.submitCounter = 0;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

        // load the parameters into the component
        this.setParametersFromComponentContent();

        // draw the oscilloscope gride after the view has rendered
        $timeout(function () {
          _this2.drawOscilloscopeGrid();
        }, 0);
      }.bind(_this), true);
    }

    _this.oscilloscopeId = 'oscilloscope' + _this.componentId;

    // load the parameters into the component
    _this.setParametersFromComponentContent();

    var componentState = null;

    // set whether studentAttachment is enabled
    _this.isStudentAttachmentEnabled = _this.componentContent.isStudentAttachmentEnabled;

    // get the component state from the scope
    componentState = _this.$scope.componentState;

    if (_this.mode == 'student') {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        // we will show work from another component
        _this.handleConnectedComponents();
      } else if (_this.AudioOscillatorService.componentStateHasStudentWork(componentState, _this.componentContent)) {
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

        if (componentState == null) {
          /*
           * only import work if the student does not already have
           * work for this component
           */

          // check if we need to import work
          var importPreviousWorkNodeId = _this.componentContent.importPreviousWorkNodeId;
          var importPreviousWorkComponentId = _this.componentContent.importPreviousWorkComponentId;

          if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
            /*
             * check if the node id is in the field that we used to store
             * the import previous work node id in
             */
            importPreviousWorkNodeId = _this.componentContent.importWorkNodeId;
          }

          if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
            /*
             * check if the component id is in the field that we used to store
             * the import previous work component id in
             */
            importPreviousWorkComponentId = _this.componentContent.importWorkComponentId;
          }

          if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {
            // import the work from the other component
            _this.importWork();
          } else if (_this.componentContent.starterSentence != null) {
            /*
             * the student has not done any work and there is a starter sentence
             * so we will populate the textarea with the starter sentence
             */
            _this.studentResponse = _this.componentContent.starterSentence;
          }
        } else {
          // populate the student work into this component
          _this.setStudentWork(componentState);
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

    if (_this.mode !== 'grading' && _this.mode !== 'gradingRevision') {
      // create the audio context
      _this.audioContext = new AudioContext();

      /*
       * draw the oscilloscope grid after angular has finished rendering
       * the view. we need to wait until after angular has set the
       * canvas width and height to draw the grid because setting the
       * dimensions of the canvas will erase it.
       */
      $timeout(function () {
        _this.drawOscilloscopeGrid();
      }, 0);
    }

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    _this.$scope.isDirty = function () {
      return this.$scope.audioOscillatorController.isDirty;
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

      if (isSubmit) {
        if (this.$scope.audioOscillatorController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.audioOscillatorController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.audioOscillatorController.createComponentState(action).then(function (componentState) {
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
     * The parent node submit button was clicked
     */
    _this.$scope.$on('nodeSubmitClicked', function (event, args) {

      // get the node id of the node
      var nodeId = args.nodeId;

      // make sure the node id matches our parent node
      if (this.nodeId === nodeId) {

        // trigger the submit
        var submitTriggeredBy = 'nodeSubmitButton';
        this.submit(submitTriggeredBy);
      }
    }.bind(_this));

    /**
     * Listen for the 'studentWorkSavedToServer' event which is fired when
     * we receive the response from saving a component state to the server
     */
    _this.$scope.$on('studentWorkSavedToServer', angular.bind(_this, function (event, args) {

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
    _this.$scope.$on('annotationSavedToServer', function (event, args) {

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
    _this.$scope.$on('exitNode', function (event, args) {
      if (_this.mode !== 'grading') {
        // stop playing the audio if the student leaves the step
        _this.stop();
        _this.audioContext.close();
      }
    });

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {

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
    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  /**
   * Load the parameters from the component content object
   */


  _createClass(AudioOscillatorController, [{
    key: 'setParametersFromComponentContent',
    value: function setParametersFromComponentContent() {
      if (this.componentContent.startingFrequency != null) {
        this.frequency = this.componentContent.startingFrequency;
      }

      if (this.componentContent.oscillatorTypes != null) {
        this.oscillatorTypes = this.componentContent.oscillatorTypes;

        if (this.componentContent.oscillatorTypes.length > 0) {
          this.oscillatorType = this.componentContent.oscillatorTypes[0];
        }
      }

      if (this.componentContent.oscilloscopeWidth != null) {
        this.oscilloscopeWidth = this.componentContent.oscilloscopeWidth;
      }

      if (this.componentContent.oscilloscopeHeight != null) {
        this.oscilloscopeHeight = this.componentContent.oscilloscopeHeight;
      }

      if (this.componentContent.gridCellSize != null) {
        this.gridCellSize = this.componentContent.gridCellSize;
      }

      if (this.componentContent.stopAfterGoodDraw != null) {
        this.stopAfterGoodDraw = this.componentContent.stopAfterGoodDraw;
      }
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

          if (studentData.frequenciesPlayed != null) {
            // the frequencies the student has played
            this.frequenciesPlayed = studentData.frequenciesPlayed;

            if (this.frequenciesPlayed.length > 0) {
              // repopulate the last frequency played
              this.frequency = this.frequenciesPlayed[this.frequenciesPlayed.length - 1];
            }
          }

          if (studentData.frequenciesPlayedSorted != null) {
            // the sorted frequencies the student has played
            this.frequenciesPlayedSorted = studentData.frequenciesPlayedSorted;
          }

          if (studentData.numberOfFrequenciesPlayed != null) {
            // the number of frequencies the student has played
            this.numberOfFrequenciesPlayed = studentData.numberOfFrequenciesPlayed;
          }

          if (studentData.minFrequencyPlayed != null) {
            // the minimum frequency the student has played
            this.minFrequencyPlayed = studentData.minFrequencyPlayed;
          }

          if (studentData.maxFrequencyPlayed != null) {
            // the maximum frequency the student has played
            this.maxFrequencyPlayed = studentData.maxFrequencyPlayed;
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
            performSubmit = false;
          } else if (numberOfSubmitsLeft == 1) {
            /*
             * the student has one more chance to submit left so maybe
             * we should ask the student if they are sure they want to submit
             */
          } else if (numberOfSubmitsLeft > 1) {
            /*
             * the student has more than one chance to submit left so maybe
             * we should ask the student if they are sure they want to submit
             */
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
     * Set the frequencies played array
     * @param frequenciesPlayed an array of numbers
     */

  }, {
    key: 'setFrequenciesPlayed',
    value: function setFrequenciesPlayed(frequenciesPlayed) {
      this.frequenciesPlayed = frequenciesPlayed;
    }

    /**
     * Get the frequencies the student played
     */

  }, {
    key: 'getFrequenciesPlayed',
    value: function getFrequenciesPlayed() {
      return this.frequenciesPlayed;
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

      // set the frequencies the student has played
      studentData.frequenciesPlayed = this.frequenciesPlayed;

      // set the sorted frequencies the student has played
      studentData.frequenciesPlayedSorted = this.frequenciesPlayedSorted;

      // set the number of frequencies the student has played
      studentData.numberOfFrequenciesPlayed = this.numberOfFrequenciesPlayed;

      // set the minimum frequency the student has played
      studentData.minFrequencyPlayed = this.minFrequencyPlayed;

      // set the maximum frequency the student has played
      studentData.maxFrequencyPlayed = this.maxFrequencyPlayed;

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      // set the flag for whether the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'AudioOscillator';

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
      /*
       * we don't need to perform any additional processing so we can resolve
       * the promise immediately
       */
      deferred.resolve(componentState);
    }
  }, {
    key: 'removeAttachment',
    value: function removeAttachment(attachment) {
      if (this.attachments.indexOf(attachment) != -1) {
        this.attachments.splice(this.attachments.indexOf(attachment), 1);
        this.studentDataChanged();
      }
    }
  }, {
    key: 'attachStudentAsset',


    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */
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
    key: 'playStopClicked',


    /**
     * The play/stop button was clicked
     */
    value: function playStopClicked() {

      if (this.isPlaying) {
        // the audio is playing so we will now stop it
        this.stop();

        // change the button text to display 'Play'
        this.playStopButtonText = this.$translate('audioOscillator.play');
      } else {
        // the audio is not playing so we will now play it
        this.play();

        // change the button text to display 'Stop'
        this.playStopButtonText = this.$translate('audioOscillator.stop');
      }
    }
  }, {
    key: 'play',


    /**
     * Start playing the audio and draw the oscilloscope
     */
    value: function play() {

      // create the oscillator
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = this.oscillatorType;
      this.oscillator.frequency.value = this.frequency;

      this.gain = this.audioContext.createGain();
      this.gain.gain.value = 0.5;
      this.destination = this.audioContext.destination;
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      // connect the audio components together
      this.oscillator.connect(this.gain);
      this.gain.connect(this.destination);
      this.gain.connect(this.analyser);

      this.oscillator.start();

      /*
       * reset the goodDraw boolean value to false because we need
       * to find a good draw again
       */
      this.goodDraw = false;

      // draw the oscilloscope
      this.drawOscilloscope(this.analyser);

      this.isPlaying = true;

      /*
       * add the current frequency to the array of frequencies the student
       * has played
       */
      this.addFrequencyPlayed(this.frequency);
      this.studentDataChanged();
    }

    /**
     * Add a frequency the student has played
     * @param frequency the new frequency the student has played
     */

  }, {
    key: 'addFrequencyPlayed',
    value: function addFrequencyPlayed(frequency) {

      // add the new frequency to the array of frequencies
      this.frequenciesPlayed.push(frequency);

      // make a copy of the frequencies played and sort it
      this.frequenciesPlayedSorted = this.UtilService.makeCopyOfJSONObject(this.frequenciesPlayed);
      this.frequenciesPlayedSorted.sort(function (a, b) {
        return a - b;
      });

      // get the number of frequencies the student has played
      this.numberOfFrequenciesPlayed = this.frequenciesPlayed.length;

      // get the minimum frequency the student has played
      this.minFrequencyPlayed = Math.min.apply(Math, _toConsumableArray(this.frequenciesPlayed));

      // get the maximum frequency the student has played
      this.maxFrequencyPlayed = Math.max.apply(Math, _toConsumableArray(this.frequenciesPlayed));
    }

    /**
     * Stop the audio
     */

  }, {
    key: 'stop',
    value: function stop() {
      if (this.oscillator != null) {
        this.oscillator.stop();
      }

      this.isPlaying = false;
    }

    /**
     * Draw the oscilloscope
     */

  }, {
    key: 'drawOscilloscope',
    value: function drawOscilloscope() {
      var _this4 = this;

      // get the analyser to obtain the oscillator data
      var analyser = this.analyser;

      // get the oscilloscope canvas context
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');

      var width = ctx.canvas.width;
      var height = ctx.canvas.height;

      // get the number of samples, this will be half the fftSize
      var bufferLength = analyser.frequencyBinCount;

      // create an array to hold the oscillator data
      var timeData = new Uint8Array(bufferLength);

      // populate the oscillator data into the timeData array
      analyser.getByteTimeDomainData(timeData);

      // draw the grid
      this.drawOscilloscopeGrid();

      // start drawing the audio signal line from the oscillator
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 200, 0)'; // green
      ctx.beginPath();

      var sliceWidth = width * 1.0 / bufferLength;
      var x = 0;
      var v = 0;
      var y = 0;

      /*
       * we want to start drawing the audio signal such that the first point
       * is at 0,0 on the oscilloscope and the signal rises after that.
       * e.g. pretend the ascii below is a sine wave
       *   _    _
       *  / \  / \
       * -------------------
       *   \_/  \_/
       */
      var foundFirstRisingZeroCrossing = false;
      var firstRisingZeroCrossingIndex = null;
      var firstPointDrawn = false;

      /*
       * loop through all the points and draw the signal from the first
       * rising zero crossing to the end of the buffer
       */
      for (var i = 0; i < bufferLength; i++) {
        var currentY = timeData[i] - 128;
        var nextY = timeData[i + 1] - 128;

        // check if the current data point is the first rising zero crossing
        if (!foundFirstRisingZeroCrossing && (currentY < 0 || currentY == 0) && nextY > 0) {

          // the point is the first rising zero crossing
          foundFirstRisingZeroCrossing = true;
          firstRisingZeroCrossingIndex = i;
        }

        if (foundFirstRisingZeroCrossing) {
          /*
           * we have found the first rising zero crossing so we can start
           * drawing the points.
           */

          /*
           * get the height of the point. we need to perform this
           * subtraction of 128 to flip the value since canvas
           * positioning is relative to the upper left corner being 0,0.
           */
          v = (128 - (timeData[i] - 128)) / 128.0;
          y = v * height / 2;

          if (firstPointDrawn) {
            // this is not the first point to be drawn
            ctx.lineTo(x, y);
          } else {
            // this is the first point to be drawn
            ctx.moveTo(x, y);
            firstPointDrawn = true;
          }

          // update the x position we are drawing at
          x += sliceWidth;
        }
      }

      if (firstRisingZeroCrossingIndex > 0 && firstRisingZeroCrossingIndex < 10) {
        /*
         * we want the first rising zero crossing index to be close to zero
         * so that the graph spans almost the whole width of the canvas.
         * if first rising zero crossing index was close to bufferLength
         * then we would see a cut off graph.
         */
        this.goodDraw = true;
      }

      // draw the lines on the canvas
      ctx.stroke();

      if (!this.stopAfterGoodDraw || this.stopAfterGoodDraw && !this.goodDraw) {
        /*
         * the draw was not good so we will try to draw it again by
         * sampling the oscillator again and drawing again. if the
         * draw was good we will stop drawing.
         */
        requestAnimationFrame(function () {
          _this4.drawOscilloscope();
        });
      }
    }

    /**
     * Draw the oscilloscope gride
     */

  }, {
    key: 'drawOscilloscopeGrid',
    value: function drawOscilloscopeGrid() {
      // get the oscilliscope canvas context
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');

      var width = ctx.canvas.width;
      var height = ctx.canvas.height;
      var gridCellSize = this.gridCellSize;

      // draw a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'lightgrey';
      ctx.beginPath();

      var x = 0;

      // draw the vertical lines
      while (x < width) {

        // draw a vertical line
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);

        // move the x position to the right
        x += gridCellSize;
      }

      // start by drawing the line in the middle
      var y = height / 2;

      // draw the horizontal lines above and including the middle line
      while (y >= 0) {

        // draw a horizontal line
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);

        // move the y position up (this is up because of canvas positioning)
        y -= gridCellSize;
      }

      y = height / 2;

      // draw the horizontal lines below the middle line
      while (y <= height) {

        // draw a horizontal line
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);

        // move the y position down (this is down because of canvas positioning)
        y += gridCellSize;
      }

      // draw the lines on the canvas
      ctx.stroke();
    }

    /**
     * The oscillator type changed
     */

  }, {
    key: 'oscillatorTypeChanged',
    value: function oscillatorTypeChanged() {

      // clear the grid
      this.drawOscilloscopeGrid();

      if (this.isPlaying) {
        this.restartPlayer();
      }
    }

    /**
     * The frequency changed
     */

  }, {
    key: 'frequencyChanged',
    value: function frequencyChanged() {

      // clear the grid
      this.drawOscilloscopeGrid();

      if (this.isPlaying) {
        this.restartPlayer();
      }
    }

    /**
     * Restart the player
     */

  }, {
    key: 'restartPlayer',
    value: function restartPlayer() {
      this.stop();
      this.play();
    }

    /**
     * Show the controls for adding an oscillator type
     */

  }, {
    key: 'authoringOpenAddOscillatorType',
    value: function authoringOpenAddOscillatorType() {
      this.showOscillatorTypeChooser = true;
    }

    /**
     * The author has clicked the add button to add an oscillator type
     */

  }, {
    key: 'authoringAddOscillatorTypeClicked',
    value: function authoringAddOscillatorTypeClicked() {
      var oscillatorTypeToAdd = this.oscillatorTypeToAdd;

      if (this.authoringComponentContent.oscillatorTypes.indexOf(oscillatorTypeToAdd) != -1) {
        // the oscillator type is already in the array of oscillator types

        alert(this.$translate('audioOscillator.errorYouHaveAlreadyAddedOscillatorType', { oscillatorTypeToAdd: oscillatorTypeToAdd }));
      } else {
        // the oscillator type is not already in the array of oscillator types
        this.authoringComponentContent.oscillatorTypes.push(oscillatorTypeToAdd);

        // hide the oscillator type chooser
        this.showOscillatorTypeChooser = false;

        // perform preview updating and project saving
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The author has clicked the cancel button for adding an oscillator type
     */

  }, {
    key: 'authoringCancelOscillatorTypeClicked',
    value: function authoringCancelOscillatorTypeClicked() {
      // hide the oscillator type chooser
      this.showOscillatorTypeChooser = false;
    }

    /**
     * The author has clicked the delete button for removing an oscillator type
     * @param index the index of the oscillator type to remove
     */

  }, {
    key: 'authoringDeleteOscillatorTypeClicked',
    value: function authoringDeleteOscillatorTypeClicked(index) {

      // remove the oscillator type at the given index
      this.authoringComponentContent.oscillatorTypes.splice(index, 1);

      // perform preview updating and project saving
      this.authoringViewComponentChanged();
    }

    /**
     * Import work from another component
     */

  }, {
    key: 'importWork',
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
              var populatedComponentState = this.AudioOscillatorService.populateComponentState(importWorkComponentState);

              // populate the component state into this component
              this.setStudentWork(populatedComponentState);
              this.studentDataChanged();
            }
          }
        }
      }
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
    key: 'getStepNodeIds',


    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */
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
    key: 'registerExitListener',


    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    value: function registerExitListener() {

      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
    }
  }, {
    key: 'componentHasWork',


    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */
    value: function componentHasWork(component) {
      var result = true;

      if (component != null) {
        result = this.ProjectService.componentHasWork(component);
      }

      return result;
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
     * Add a connected component
     */

  }, {
    key: 'addConnectedComponent',
    value: function addConnectedComponent() {

      /*
       * create the new connected component object that will contain a
       * node id and component id
       */
      var newConnectedComponent = {};
      newConnectedComponent.nodeId = this.nodeId;
      newConnectedComponent.componentId = null;
      newConnectedComponent.updateOn = 'change';

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
     * Delete a connected component
     * @param index the index of the component to delete
     */

  }, {
    key: 'deleteConnectedComponent',
    value: function deleteConnectedComponent(index) {

      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }

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
     * One of the oscillator types was clicked in the authoring view
     */

  }, {
    key: 'authoringViewOscillatorTypeClicked',
    value: function authoringViewOscillatorTypeClicked() {

      /*
       * clear the oscillator types so we can repopulate it with the
       * ones that are checked
       */
      this.authoringComponentContent.oscillatorTypes = [];

      if (this.authoringSineChecked) {
        // sine is checked
        this.authoringComponentContent.oscillatorTypes.push('sine');
      }

      if (this.authoringSquareChecked) {
        // square is checked
        this.authoringComponentContent.oscillatorTypes.push('square');
      }

      if (this.authoringTriangleChecked) {
        // triangle is checked
        this.authoringComponentContent.oscillatorTypes.push('triangle');
      }

      if (this.authoringSawtoothChecked) {
        // sawtooth is checked
        this.authoringComponentContent.oscillatorTypes.push('sawtooth');
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Determine which oscillator types should be checked
     */

  }, {
    key: 'authoringProcessCheckedOscillatorTypes',
    value: function authoringProcessCheckedOscillatorTypes() {

      if (this.authoringComponentContent.oscillatorTypes.indexOf('sine') != -1) {
        this.authoringSineChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('square') != -1) {
        this.authoringSquareChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('triangle') != -1) {
        this.authoringTriangleChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('sawtooth') != -1) {
        this.authoringSawtoothChecked = true;
      }
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
        var mergedStudentData = {};
        // loop through all the component states and merge the student data
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];
          if (componentState != null) {
            var studentData = componentState.studentData;
            if (studentData != null) {
              this.mergeStudentData(mergedStudentData, studentData);
            }
          }
        }
        mergedComponentState.studentData = mergedStudentData;
      }

      return mergedComponentState;
    }

    /**
     * Merge the values in the student data
     * @param oldStudentData the old student data we will merge into
     * @param newStudentData the new student data we will merge
     * @return the merged student data
     */

  }, {
    key: 'mergeStudentData',
    value: function mergeStudentData(oldStudentData, newStudentData) {

      if (oldStudentData != null && newStudentData != null) {

        if (oldStudentData.frequenciesPlayed == null) {
          oldStudentData.frequenciesPlayed = newStudentData.frequenciesPlayed;
        } else {
          oldStudentData.frequenciesPlayed = oldStudentData.frequenciesPlayed.concat(newStudentData.frequenciesPlayed);
        }

        if (oldStudentData.frequenciesPlayedSorted == null) {
          oldStudentData.frequenciesPlayedSorted = newStudentData.frequenciesPlayed;
        } else {
          var frequenciesPlayedSorted = this.UtilService.makeCopyOfJSONObject(oldStudentData.frequenciesPlayed);
          frequenciesPlayedSorted.sort();
          oldStudentData.frequenciesPlayedSorted = frequenciesPlayedSorted;
        }

        if (oldStudentData.numberOfFrequenciesPlayed == null) {
          oldStudentData.numberOfFrequenciesPlayed = newStudentData.numberOfFrequenciesPlayed;
        } else {
          oldStudentData.numberOfFrequenciesPlayed = oldStudentData.numberOfFrequenciesPlayed + newStudentData.numberOfFrequenciesPlayed;
        }

        if (oldStudentData.minFrequencyPlayed == null) {
          oldStudentData.minFrequencyPlayed = newStudentData.minFrequencyPlayed;
        } else {
          oldStudentData.minFrequencyPlayed = Math.min(oldStudentData.minFrequencyPlayed, newStudentData.minFrequencyPlayed);
        }

        if (oldStudentData.maxFrequencyPlayed == null) {
          oldStudentData.maxFrequencyPlayed = newStudentData.maxFrequencyPlayed;
        } else {
          oldStudentData.maxFrequencyPlayed = Math.max(oldStudentData.maxFrequencyPlayed, newStudentData.maxFrequencyPlayed);
        }
      }

      return oldStudentData;
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
  }]);

  return AudioOscillatorController;
}(_componentController2.default);

;

AudioOscillatorController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'AudioOscillatorService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AudioOscillatorController;
//# sourceMappingURL=audioOscillatorController.js.map
