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
    _this.frequenciesPlayed = [];
    _this.frequenciesPlayedSorted = [];
    _this.numberOfFrequenciesPlayed = 0;
    _this.minFrequencyPlayed = null;
    _this.maxFrequencyPlayed = null;
    _this.latestAnnotations = null;
    _this.oscilloscopeId = 'oscilloscope' + _this.componentId;

    _this.initializeDefaultSettings();
    _this.setButtonTextToPlay();

    _this.setParametersFromComponentContent();
    var componentState = _this.$scope.componentState;

    if (_this.isStudentMode()) {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        _this.handleConnectedComponents();
      } else if (_this.AudioOscillatorService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        _this.handleConnectedComponents();
      }
    } else {
      if (_this.AudioOscillatorService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        _this.setStudentWork(componentState);
      }
    }

    if (_this.hasMaxSubmitCount() && _this.hasSubmitsLeft()) {
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    if (!_this.isGradingMode() && !_this.isGradingRevisionMode()) {
      _this.initializeAudioContext();

      /*
       * draw the oscilloscope grid after angular has finished rendering
       * the view. we need to wait until after angular has set the
       * canvas width and height to draw the grid because setting the
       * dimensions of the canvas will erase the canvas.
       */
      $timeout(function () {
        _this.drawOscilloscopeGrid();
      }, 0);
    }

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

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(AudioOscillatorController, [{
    key: 'initializeDefaultSettings',
    value: function initializeDefaultSettings() {
      this.isPlaying = false;
      this.oscillatorType = 'sine';
      this.frequency = 440;
      this.oscillatorTypes = [];
      this.oscilloscopeWidth = 800;
      this.oscilloscopeHeight = 400;
      this.gridCellSize = 50;
      this.stopAfterGoodDraw = true;
    }
  }, {
    key: 'initializeAudioContext',
    value: function initializeAudioContext() {
      this.audioContext = new AudioContext();
    }
  }, {
    key: 'cleanupBeforeExiting',
    value: function cleanupBeforeExiting(event, args) {
      if (!this.isGradingMode()) {
        this.stop();
        this.audioContext.close();
      }
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
    key: 'setParametersFromComponentContent',
    value: function setParametersFromComponentContent() {
      this.frequency = this.componentContent.startingFrequency;
      this.oscillatorTypes = this.componentContent.oscillatorTypes;
      if (this.componentContent.oscillatorTypes.length > 0) {
        this.oscillatorType = this.componentContent.oscillatorTypes[0];
      }
      this.oscilloscopeWidth = this.componentContent.oscilloscopeWidth;
      this.oscilloscopeHeight = this.componentContent.oscilloscopeHeight;
      this.gridCellSize = this.componentContent.gridCellSize;
      this.stopAfterGoodDraw = this.componentContent.stopAfterGoodDraw;
    }
  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      var studentData = componentState.studentData;
      if (studentData != null) {
        this.frequenciesPlayed = studentData.frequenciesPlayed;
        if (this.frequenciesPlayed.length > 0) {
          this.frequency = this.frequenciesPlayed[this.frequenciesPlayed.length - 1];
        }
        this.frequenciesPlayedSorted = studentData.frequenciesPlayedSorted;
        this.numberOfFrequenciesPlayed = studentData.numberOfFrequenciesPlayed;
        this.minFrequencyPlayed = studentData.minFrequencyPlayed;
        this.maxFrequencyPlayed = studentData.maxFrequencyPlayed;
        this.submitCounter = studentData.submitCounter;
        this.attachments = studentData.attachments;
        this.processLatestStudentWork();
      }
    }
  }, {
    key: 'createComponentState',
    value: function createComponentState(action) {
      var deferred = this.$q.defer();
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {};
      studentData.frequenciesPlayed = this.frequenciesPlayed;
      studentData.frequenciesPlayedSorted = this.frequenciesPlayedSorted;
      studentData.numberOfFrequenciesPlayed = this.numberOfFrequenciesPlayed;
      studentData.minFrequencyPlayed = this.minFrequencyPlayed;
      studentData.maxFrequencyPlayed = this.maxFrequencyPlayed;
      studentData.submitCounter = this.submitCounter;
      componentState.isSubmit = this.isSubmit;
      componentState.studentData = studentData;
      componentState.componentType = 'AudioOscillator';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      this.isSubmit = false;
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }
  }, {
    key: 'togglePlay',
    value: function togglePlay() {
      if (this.isAudioPlaying()) {
        this.stop();
        this.setButtonTextToPlay();
      } else {
        this.play();
        this.setButtonTextToStop();
      }
    }
  }, {
    key: 'isAudioPlaying',
    value: function isAudioPlaying() {
      return this.isPlaying;
    }
  }, {
    key: 'setButtonTextToPlay',
    value: function setButtonTextToPlay() {
      this.playStopButtonText = this.$translate('audioOscillator.play');
    }
  }, {
    key: 'setButtonTextToStop',
    value: function setButtonTextToStop() {
      this.playStopButtonText = this.$translate('audioOscillator.stop');
    }
  }, {
    key: 'play',
    value: function play() {
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = this.oscillatorType;
      this.oscillator.frequency.value = this.frequency;
      this.gain = this.audioContext.createGain();
      this.gain.gain.value = 0.5;
      this.destination = this.audioContext.destination;
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.oscillator.connect(this.gain);
      this.gain.connect(this.destination);
      this.gain.connect(this.analyser);
      this.oscillator.start();
      this.goodDraw = false;
      this.drawOscilloscope();
      this.isPlaying = true;
      this.addFrequencyPlayed(this.frequency);
      this.studentDataChanged();
    }
  }, {
    key: 'addFrequencyPlayed',
    value: function addFrequencyPlayed(frequency) {
      this.frequenciesPlayed.push(frequency);
      this.frequenciesPlayedSorted = this.UtilService.makeCopyOfJSONObject(this.frequenciesPlayed);
      this.frequenciesPlayedSorted.sort(function (a, b) {
        return a - b;
      });
      this.numberOfFrequenciesPlayed = this.frequenciesPlayed.length;
      this.minFrequencyPlayed = Math.min.apply(Math, _toConsumableArray(this.frequenciesPlayed));
      this.maxFrequencyPlayed = Math.max.apply(Math, _toConsumableArray(this.frequenciesPlayed));
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.oscillator != null) {
        this.oscillator.stop();
      }
      this.isPlaying = false;
    }
  }, {
    key: 'drawOscilloscope',
    value: function drawOscilloscope() {
      var _this2 = this;

      var analyser = this.analyser;
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');
      var width = ctx.canvas.width;
      var height = ctx.canvas.height;

      // get the number of samples, this will be half the fftSize
      var bufferLength = analyser.frequencyBinCount;

      // create an array to hold the oscillator data
      var timeData = new Uint8Array(bufferLength);

      // populate the oscillator data into the timeData array
      analyser.getByteTimeDomainData(timeData);

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
      var isFirstPointDrawn = false;

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

          if (isFirstPointDrawn) {
            ctx.lineTo(x, y);
          } else {
            ctx.moveTo(x, y);
            isFirstPointDrawn = true;
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

      ctx.stroke();

      if (!this.stopAfterGoodDraw || this.stopAfterGoodDraw && !this.goodDraw) {
        /*
         * the draw was not good so we will try to draw it again by
         * sampling the oscillator again and drawing again. if the
         * draw was good we will stop drawing.
         */
        requestAnimationFrame(function () {
          _this2.drawOscilloscope();
        });
      }
    }
  }, {
    key: 'drawOscilloscopeGrid',
    value: function drawOscilloscopeGrid() {
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');

      var width = ctx.canvas.width;
      var height = ctx.canvas.height;
      var gridCellSize = this.gridCellSize;
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
  }, {
    key: 'drawVerticalLine',
    value: function drawVerticalLine() {}
  }, {
    key: 'drawHorizontalLine',
    value: function drawHorizontalLine() {}

    /**
     * The oscillator type changed
     */

  }, {
    key: 'oscillatorTypeChanged',
    value: function oscillatorTypeChanged() {

      // clear the grid
      this.drawOscilloscopeGrid();

      if (this.isAudioPlaying()) {
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

      if (this.isAudioPlaying()) {
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
