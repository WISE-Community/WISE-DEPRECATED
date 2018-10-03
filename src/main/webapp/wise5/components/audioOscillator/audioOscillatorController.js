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
     * @param isSubmit boolean Whether the request is coming from a submit
     * action (optional; default is false).
     * @return A component state containing the student data.
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var _this2 = this;

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
          _this2.$scope.audioOscillatorController.isSubmit = false;
          deferred.resolve(componentState);
        });
      } else {
        /*
         * The student does not have any unsaved changes in this component
         * so we don't need to save a component state for this component.
         * We will immediately resolve the promise here.
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
      componentState.isSubmit = this.isSubmit;
      componentState.componentType = 'AudioOscillator';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      componentState.studentData = {
        frequenciesPlayed: this.frequenciesPlayed,
        frequenciesPlayedSorted: this.frequenciesPlayedSorted,
        numberOfFrequenciesPlayed: this.numberOfFrequenciesPlayed,
        minFrequencyPlayed: this.minFrequencyPlayed,
        maxFrequencyPlayed: this.maxFrequencyPlayed,
        submitCounter: this.submitCounter
      };
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
      this.isPlaying = true;
      this.drawOscilloscope();
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
      var _this3 = this;

      if (!this.isPlaying) {
        return;
      }

      this.drawOscilloscopeGrid();
      this.startDrawingAudioSignalLine();
      var firstRisingZeroCrossingIndex = this.drawOscilloscopePoints();

      if (this.isFirstRisingZeroCrossingIndexCloseToZero(firstRisingZeroCrossingIndex)) {
        /*
         * we want the first rising zero crossing index to be close to zero
         * so that the graph spans almost the whole width of the canvas.
         * if the first rising zero crossing index was close to bufferLength
         * size then we would see a cut off graph.
         */
        this.goodDraw = true;
      }

      if (this.isDrawAgain()) {
        requestAnimationFrame(function () {
          _this3.drawOscilloscope();
        });
      }
    }
  }, {
    key: 'getTimeData',
    value: function getTimeData() {
      var bufferLength = this.analyser.frequencyBinCount;
      var timeData = new Uint8Array(bufferLength);
      this.analyser.getByteTimeDomainData(timeData);
      return timeData;
    }
  }, {
    key: 'startDrawingAudioSignalLine',
    value: function startDrawingAudioSignalLine() {
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 200, 0)';
      ctx.beginPath();
    }
  }, {
    key: 'getSliceWidth',
    value: function getSliceWidth() {
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');
      var bufferLength = this.analyser.frequencyBinCount;
      var width = ctx.canvas.width;
      return width * 1.0 / bufferLength;
    }
  }, {
    key: 'drawOscilloscopePoints',
    value: function drawOscilloscopePoints() {
      var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');
      var height = ctx.canvas.height;
      var timeData = this.getTimeData();
      var sliceWidth = this.getSliceWidth();
      var x = 0;
      var v = 0;
      var y = 0;

      /*
       * we want to start drawing the audio signal such that the first point
       * is at 0,0 on the oscilloscope and the signal rises after that.
       * e.g. pretend the ascii below is a sine wave
       *  _       _
       * / \     / \
       * -------------------
       *     \_/     \_/
       */
      var foundFirstRisingZeroCrossing = false;
      var firstRisingZeroCrossingIndex = null;
      var isFirstPointDrawn = false;

      /*
       * loop through all the points and draw the signal from the first
       * rising zero crossing to the end of the buffer
       */
      for (var i = 0; i < timeData.length; i++) {
        var currentY = timeData[i] - 128;
        var nextY = timeData[i + 1] - 128;

        if (this.isFirstRisingZeroCrossingPoint(foundFirstRisingZeroCrossing, currentY, nextY)) {
          foundFirstRisingZeroCrossing = true;
          firstRisingZeroCrossingIndex = i;
        }

        if (foundFirstRisingZeroCrossing) {
          /*
           * get the height of the point. we need to perform this
           * subtraction of 128 to flip the value since canvas
           * positioning is relative to the upper left corner being 0,0.
           */
          v = (128 - (timeData[i] - 128)) / 128.0;
          y = v * height / 2;
          this.drawPoint(ctx, isFirstPointDrawn, x, y);
          if (!isFirstPointDrawn) {
            isFirstPointDrawn = true;
          }
          x += sliceWidth;
        }
      }

      ctx.stroke();

      return firstRisingZeroCrossingIndex;
    }
  }, {
    key: 'isFirstRisingZeroCrossingPoint',
    value: function isFirstRisingZeroCrossingPoint(foundFirstRisingZeroCrossing, currentY, nextY) {
      return !foundFirstRisingZeroCrossing && (currentY < 0 || currentY == 0) && nextY > 0;
    }
  }, {
    key: 'drawPoint',
    value: function drawPoint(ctx, isFirstPointDrawn, x, y) {
      if (isFirstPointDrawn) {
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(x, y);
      }
    }
  }, {
    key: 'isFirstRisingZeroCrossingIndexCloseToZero',
    value: function isFirstRisingZeroCrossingIndexCloseToZero(firstRisingZeroCrossingIndex) {
      return firstRisingZeroCrossingIndex > 0 && firstRisingZeroCrossingIndex < 10;
    }
  }, {
    key: 'isDrawAgain',
    value: function isDrawAgain() {
      return !this.stopAfterGoodDraw || this.stopAfterGoodDraw && !this.goodDraw;
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
      this.drawVerticalLines(ctx, width, height, gridCellSize);
      this.drawHorizontalLines(ctx, width, height, gridCellSize);
      ctx.stroke();
    }
  }, {
    key: 'drawVerticalLines',
    value: function drawVerticalLines(ctx, width, height, gridCellSize) {
      var x = 0;
      while (x < width) {
        this.drawVerticalLine(ctx, x, height);
        x += gridCellSize;
      }
    }
  }, {
    key: 'drawVerticalLine',
    value: function drawVerticalLine(ctx, x, height) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
  }, {
    key: 'drawHorizontalLines',
    value: function drawHorizontalLines(ctx, width, height, gridCellSize) {
      // draw the horizontal lines above and including the middle line
      var y = height / 2;
      while (y >= 0) {
        this.drawHorizontalLine(ctx, y, width);
        y -= gridCellSize;
      }

      // draw the horizontal lines below the middle line
      y = height / 2;
      while (y < height) {
        this.drawHorizontalLine(ctx, y, width);
        y += gridCellSize;
      }
    }
  }, {
    key: 'drawHorizontalLine',
    value: function drawHorizontalLine(ctx, y, width) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
  }, {
    key: 'oscillatorTypeChanged',
    value: function oscillatorTypeChanged() {
      this.drawOscilloscopeGrid();

      if (this.isAudioPlaying()) {
        this.restartPlayer();
      }
    }
  }, {
    key: 'frequencyChanged',
    value: function frequencyChanged() {
      this.drawOscilloscopeGrid();
      if (this.isAudioPlaying()) {
        this.restartPlayer();
      }
    }
  }, {
    key: 'restartPlayer',
    value: function restartPlayer() {
      this.stop();
      this.play();
    }

    /**
     * Create a component state with the merged student responses.
     * @param componentStates An array of component states.
     * @return A component state with the merged student responses.
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {
      var mergedComponentState = this.NodeService.createNewComponentState();
      if (componentStates != null) {
        var mergedStudentData = {};
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
     * Merge the values in the student data.
     * @param existingStudentData The old student data we will merge into.
     * @param newStudentData The new student data we will merge.
     * @return The merged student data.
     */

  }, {
    key: 'mergeStudentData',
    value: function mergeStudentData(existingStudentData, newStudentData) {
      if (existingStudentData.frequenciesPlayed == null) {
        existingStudentData.frequenciesPlayed = newStudentData.frequenciesPlayed;
      } else {
        existingStudentData.frequenciesPlayed = existingStudentData.frequenciesPlayed.concat(newStudentData.frequenciesPlayed);
      }

      if (existingStudentData.frequenciesPlayedSorted == null) {
        existingStudentData.frequenciesPlayedSorted = newStudentData.frequenciesPlayed;
      } else {
        var frequenciesPlayedSorted = this.UtilService.makeCopyOfJSONObject(existingStudentData.frequenciesPlayed);
        frequenciesPlayedSorted.sort();
        existingStudentData.frequenciesPlayedSorted = frequenciesPlayedSorted;
      }

      if (existingStudentData.numberOfFrequenciesPlayed == null) {
        existingStudentData.numberOfFrequenciesPlayed = newStudentData.numberOfFrequenciesPlayed;
      } else {
        existingStudentData.numberOfFrequenciesPlayed = existingStudentData.numberOfFrequenciesPlayed + newStudentData.numberOfFrequenciesPlayed;
      }

      if (existingStudentData.minFrequencyPlayed == null) {
        existingStudentData.minFrequencyPlayed = newStudentData.minFrequencyPlayed;
      } else {
        existingStudentData.minFrequencyPlayed = Math.min(existingStudentData.minFrequencyPlayed, newStudentData.minFrequencyPlayed);
      }

      if (existingStudentData.maxFrequencyPlayed == null) {
        existingStudentData.maxFrequencyPlayed = newStudentData.maxFrequencyPlayed;
      } else {
        existingStudentData.maxFrequencyPlayed = Math.max(existingStudentData.maxFrequencyPlayed, newStudentData.maxFrequencyPlayed);
      }
      return existingStudentData;
    }
  }]);

  return AudioOscillatorController;
}(_componentController2.default);

;

AudioOscillatorController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'AudioOscillatorService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AudioOscillatorController;
//# sourceMappingURL=audioOscillatorController.js.map
