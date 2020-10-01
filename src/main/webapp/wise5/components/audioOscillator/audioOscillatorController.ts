'use strict';

import { Directive } from '@angular/core';
import ComponentController from '../componentController';
import { AudioOscillatorService } from './audioOscillatorService';

@Directive()
class AudioOscillatorController extends ComponentController {
  $q: any;
  $timeout: any;
  AudioOscillatorService: AudioOscillatorService;
  frequenciesPlayed: number[];
  frequenciesPlayedSorted: number[];
  numberOfFrequenciesPlayed: number;
  minFrequencyPlayed: number;
  maxFrequencyPlayed: number;
  oscilloscopeId: string;
  isPlaying: boolean;
  oscillatorType: string;
  frequency: number;
  oscillatorTypes: string[];
  oscilloscopeWidth: number;
  oscilloscopeHeight: number;
  gridCellSize: number;
  stopAfterGoodDraw: boolean;
  audioContext: any;
  playStopButtonText: string;
  oscillator: any;
  gain: any;
  destination: any;
  analyser: any;
  goodDraw: boolean;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService',
    'AudioOscillatorService',
    'AudioRecorderService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    $timeout,
    AnnotationService,
    AudioOscillatorService,
    AudioRecorderService,
    ConfigService,
    NodeService,
    NotebookService,
    NotificationService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.$q = $q;
    this.$timeout = $timeout;
    this.AudioOscillatorService = AudioOscillatorService;
    this.frequenciesPlayed = [];
    this.frequenciesPlayedSorted = [];
    this.numberOfFrequenciesPlayed = 0;
    this.minFrequencyPlayed = null;
    this.maxFrequencyPlayed = null;
    this.oscilloscopeId = 'oscilloscope' + this.componentId;

    this.initializeDefaultSettings();
    this.setButtonTextToPlay();

    this.setParametersFromComponentContent();
    const componentState = this.$scope.componentState;

    if (this.isStudentMode()) {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        this.AudioOscillatorService.componentStateHasStudentWork(
          componentState,
          this.componentContent
        )
      ) {
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      }
    } else {
      if (
        this.AudioOscillatorService.componentStateHasStudentWork(
          componentState,
          this.componentContent
        )
      ) {
        this.setStudentWork(componentState);
      }
    }

    if (this.hasMaxSubmitCount() && !this.hasSubmitsLeft()) {
      this.disableSubmitButton();
    }

    this.disableComponentIfNecessary();

    if (!this.isGradingMode() && !this.isGradingRevisionMode()) {
      this.initializeAudioContext();
      this.drawOscilloscopeGridAfterTimeout();
    }

    this.initializeScopeGetComponentState(this.$scope, 'audioOscillatorController');
    this.broadcastDoneRenderingComponent();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (!this.isGradingMode()) {
      this.stop();
      this.audioContext.close();
    }
  }

  initializeDefaultSettings() {
    this.isPlaying = false;
    this.oscillatorType = 'sine';
    this.frequency = 440;
    this.oscillatorTypes = [];
    this.oscilloscopeWidth = 800;
    this.oscilloscopeHeight = 400;
    this.gridCellSize = 50;
    this.stopAfterGoodDraw = true;
  }

  initializeAudioContext() {
    this.audioContext = new AudioContext();
  }

  /*
   * Draw the oscilloscope grid after angular has finished rendering
   * the view. we need to wait until after angular has set the
   * canvas width and height to draw the grid because setting the
   * dimensions of the canvas will erase the canvas.
   */
  drawOscilloscopeGridAfterTimeout() {
    this.$timeout(() => {
      this.drawOscilloscopeGrid();
    }, 0);
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  setParametersFromComponentContent() {
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

  setStudentWork(componentState) {
    const studentData = componentState.studentData;
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

  createComponentState(action) {
    const deferred = this.$q.defer();
    const componentState: any = this.NodeService.createNewComponentState();
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

  togglePlay() {
    if (this.isAudioPlaying()) {
      this.stop();
      this.setButtonTextToPlay();
    } else {
      this.play();
      this.setButtonTextToStop();
    }
  }

  isAudioPlaying() {
    return this.isPlaying;
  }

  setButtonTextToPlay() {
    this.playStopButtonText = this.$translate('audioOscillator.play');
  }

  setButtonTextToStop() {
    this.playStopButtonText = this.$translate('audioOscillator.stop');
  }

  play() {
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

  addFrequencyPlayed(frequency) {
    this.frequenciesPlayed.push(frequency);
    this.frequenciesPlayedSorted = this.UtilService.makeCopyOfJSONObject(this.frequenciesPlayed);
    this.frequenciesPlayedSorted.sort((a, b) => a - b);
    this.numberOfFrequenciesPlayed = this.frequenciesPlayed.length;
    this.minFrequencyPlayed = Math.min(...this.frequenciesPlayed);
    this.maxFrequencyPlayed = Math.max(...this.frequenciesPlayed);
  }

  stop() {
    if (this.oscillator != null) {
      this.oscillator.stop();
    }
    this.isPlaying = false;
  }

  drawOscilloscope() {
    if (!this.isPlaying) {
      return;
    }

    this.drawOscilloscopeGrid();
    this.startDrawingAudioSignalLine();
    const firstRisingZeroCrossingIndex = this.drawOscilloscopePoints();

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
      requestAnimationFrame(() => {
        this.drawOscilloscope();
      });
    }
  }

  getTimeData() {
    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(timeData);
    return timeData;
  }

  startDrawingAudioSignalLine() {
    const ctx = (<HTMLCanvasElement>document.getElementById(this.oscilloscopeId)).getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 200, 0)';
    ctx.beginPath();
  }

  getSliceWidth() {
    const ctx = (<HTMLCanvasElement>document.getElementById(this.oscilloscopeId)).getContext('2d');
    const bufferLength = this.analyser.frequencyBinCount;
    const width = ctx.canvas.width;
    return (width * 1.0) / bufferLength;
  }

  drawOscilloscopePoints() {
    const ctx = (<HTMLCanvasElement>document.getElementById(this.oscilloscopeId)).getContext('2d');
    const height = ctx.canvas.height;
    const timeData = this.getTimeData();
    const sliceWidth = this.getSliceWidth();
    let x = 0;
    let v = 0;
    let y = 0;

    /*
     * we want to start drawing the audio signal such that the first point
     * is at 0,0 on the oscilloscope and the signal rises after that.
     * e.g. pretend the ascii below is a sine wave
     *  _       _
     * / \     / \
     * -------------------
     *     \_/     \_/
     */
    let foundFirstRisingZeroCrossing = false;
    let firstRisingZeroCrossingIndex = null;
    let isFirstPointDrawn = false;

    /*
     * loop through all the points and draw the signal from the first
     * rising zero crossing to the end of the buffer
     */
    for (let i = 0; i < timeData.length; i++) {
      const currentY = timeData[i] - 128;
      const nextY = timeData[i + 1] - 128;

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
        y = (v * height) / 2;
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

  isFirstRisingZeroCrossingPoint(foundFirstRisingZeroCrossing, currentY, nextY) {
    return !foundFirstRisingZeroCrossing && (currentY < 0 || currentY == 0) && nextY > 0;
  }

  drawPoint(ctx, isFirstPointDrawn, x, y) {
    if (isFirstPointDrawn) {
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x, y);
    }
  }

  isFirstRisingZeroCrossingIndexCloseToZero(firstRisingZeroCrossingIndex) {
    return firstRisingZeroCrossingIndex > 0 && firstRisingZeroCrossingIndex < 10;
  }

  isDrawAgain() {
    return !this.stopAfterGoodDraw || (this.stopAfterGoodDraw && !this.goodDraw);
  }

  drawOscilloscopeGrid() {
    const ctx = (<HTMLCanvasElement>document.getElementById(this.oscilloscopeId)).getContext('2d');
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const gridCellSize = this.gridCellSize;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'lightgrey';
    ctx.beginPath();
    this.drawVerticalLines(ctx, width, height, gridCellSize);
    this.drawHorizontalLines(ctx, width, height, gridCellSize);
    ctx.stroke();
  }

  drawVerticalLines(ctx, width, height, gridCellSize) {
    let x = 0;
    while (x < width) {
      this.drawVerticalLine(ctx, x, height);
      x += gridCellSize;
    }
  }

  drawVerticalLine(ctx, x, height) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  drawHorizontalLines(ctx, width, height, gridCellSize) {
    // draw the horizontal lines above and including the middle line
    let y = height / 2;
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

  drawHorizontalLine(ctx, y, width) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  oscillatorTypeChanged() {
    this.drawOscilloscopeGrid();

    if (this.isAudioPlaying()) {
      this.restartPlayer();
    }
  }

  frequencyChanged() {
    this.drawOscilloscopeGrid();
    if (this.isAudioPlaying()) {
      this.restartPlayer();
    }
  }

  restartPlayer() {
    this.stop();
    this.play();
  }

  /**
   * Create a component state with the merged student responses.
   * @param componentStates An array of component states.
   * @return A component state with the merged student responses.
   */
  createMergedComponentState(componentStates) {
    const mergedComponentState: any = this.NodeService.createNewComponentState();
    if (componentStates != null) {
      const mergedStudentData = {};
      for (let c = 0; c < componentStates.length; c++) {
        const componentState = componentStates[c];
        if (componentState != null) {
          let studentData = componentState.studentData;
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
  mergeStudentData(existingStudentData, newStudentData) {
    if (existingStudentData.frequenciesPlayed == null) {
      existingStudentData.frequenciesPlayed = newStudentData.frequenciesPlayed;
    } else {
      existingStudentData.frequenciesPlayed = existingStudentData.frequenciesPlayed.concat(
        newStudentData.frequenciesPlayed
      );
    }

    if (existingStudentData.frequenciesPlayedSorted == null) {
      existingStudentData.frequenciesPlayedSorted = newStudentData.frequenciesPlayed;
    } else {
      let frequenciesPlayedSorted = this.UtilService.makeCopyOfJSONObject(
        existingStudentData.frequenciesPlayed
      );
      frequenciesPlayedSorted.sort();
      existingStudentData.frequenciesPlayedSorted = frequenciesPlayedSorted;
    }

    if (existingStudentData.numberOfFrequenciesPlayed == null) {
      existingStudentData.numberOfFrequenciesPlayed = newStudentData.numberOfFrequenciesPlayed;
    } else {
      existingStudentData.numberOfFrequenciesPlayed =
        existingStudentData.numberOfFrequenciesPlayed + newStudentData.numberOfFrequenciesPlayed;
    }

    if (existingStudentData.minFrequencyPlayed == null) {
      existingStudentData.minFrequencyPlayed = newStudentData.minFrequencyPlayed;
    } else {
      existingStudentData.minFrequencyPlayed = Math.min(
        existingStudentData.minFrequencyPlayed,
        newStudentData.minFrequencyPlayed
      );
    }

    if (existingStudentData.maxFrequencyPlayed == null) {
      existingStudentData.maxFrequencyPlayed = newStudentData.maxFrequencyPlayed;
    } else {
      existingStudentData.maxFrequencyPlayed = Math.max(
        existingStudentData.maxFrequencyPlayed,
        newStudentData.maxFrequencyPlayed
      );
    }
    return existingStudentData;
  }
}

export default AudioOscillatorController;
