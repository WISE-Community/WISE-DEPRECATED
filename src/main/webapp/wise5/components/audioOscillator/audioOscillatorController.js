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

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(AudioOscillatorController, [{
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }

    /**
     * Load the parameters from the component content object
     */

  }, {
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
      var _this2 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {
            var attachment = {
              studentAssetId: copiedAsset.id,
              iconURL: copiedAsset.iconURL
            };

            _this2.attachments.push(attachment);
            _this2.studentDataChanged();
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
      var _this3 = this;

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
          _this3.drawOscilloscope();
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
  }]);

  return AudioOscillatorController;
}(_componentController2.default);

;

AudioOscillatorController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'AudioOscillatorService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AudioOscillatorController;
//# sourceMappingURL=audioOscillatorController.js.map
