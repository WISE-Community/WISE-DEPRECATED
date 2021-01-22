'use strict';

import ComponentController from '../componentController';
import { AnimationService } from './animationService';
import { AnnotationService } from '../../services/annotationService';
import 'svg.js';

class AnimationController extends ComponentController {
  $q: any;
  $timeout: any;
  AnimationService: AnimationService;
  width: number;
  height: number;
  pixelsPerXUnit: number;
  pixelsPerYUnit: number;
  dataXOriginInPixels: number;
  dataYOriginInPixels: number;
  idToSVGObject: any;
  idToWhetherAuthoredObjectIsAnimating: any;
  svgId: string;
  draw: any;
  animationState: any;
  coordinateSystem: string;
  timerText: any;
  millisecondsPerDataTime: number;
  lastBroadcastTime: number;
  speedSliderValue: number;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnimationService',
    'AnnotationService',
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
    AnimationService,
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
    this.AnimationService = AnimationService;

    this.width = 800;
    this.height = 600;
    this.pixelsPerXUnit = 1;
    this.pixelsPerYUnit = 1;
    this.dataXOriginInPixels = 0;
    this.dataYOriginInPixels = 0;
    this.idToSVGObject = {};
    this.idToWhetherAuthoredObjectIsAnimating = {};
    const componentState = this.$scope.componentState;
    this.svgId = 'svg_' + this.nodeId + '_' + this.componentId;
    this.setAnimationStateToStopped();
    this.setCoordinateSystemToScreen();
    this.setSpeed(3);
    this.initializeCoordinates();

    if (this.isStudentMode()) {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    } else if (this.isGradingMode()) {
      if (componentState != null) {
        this.svgId = 'svg_' + this.nodeId + '_' + this.componentId + '_' + componentState.id;
      } else {
        this.svgId = 'svg_' + this.nodeId + '_' + this.componentId + '_' + this.workgroupId;
      }

      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    if (this.isStudentMode()) {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        this.AnimationService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      }
    } else {
      if (componentState != null) {
        this.setStudentWork(componentState);
      }
    }

    if (this.hasMaxSubmitCount() && !this.hasSubmitsLeft()) {
      this.disableSubmitButton();
    }

    this.disableComponentIfNecessary();

    this.setupSVGAfterTimeout();

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component.
     * @param {object} connectedComponent The connected component content.
     * @param {object} connectedComponentParams The params to determine what to
     * do with the connected component data such as 'importWork' or 'showWork'.
     * @param {object} componentState The student data from the connected
     * component that has changed.
     */
    this.$scope.handleConnectedComponentStudentDataChanged = (
      connectedComponent,
      connectedComponentParams,
      componentState
    ) => {
      if (connectedComponent.type === 'Graph') {
        this.updateObjectDatasFromDataSourceComponentState(componentState);
      }
    };

    this.initializeScopeGetComponentState(this.$scope, 'animationController');
    this.broadcastDoneRenderingComponent();
  }

  setAnimationState(state) {
    this.animationState = state;
  }

  setAnimationStateToPlaying() {
    this.setAnimationState('playing');
  }

  setAnimationStateToPaused() {
    this.setAnimationState('paused');
  }

  setAnimationStateToStopped() {
    this.setAnimationState('stopped');
  }

  setCoordinateSystem(coordinateSystem) {
    this.coordinateSystem = coordinateSystem;
  }

  setCoordinateSystemToScreen() {
    this.setCoordinateSystem('screen');
  }

  setCoordinateSystemToCartesian() {
    this.setCoordinateSystem('cartesian');
  }

  hasStudentUsedAllSubmits() {
    return (
      this.componentContent.maxSubmitCount != null &&
      this.submitCounter >= this.componentContent.maxSubmitCount
    );
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  initializeCoordinates() {
    if (this.componentContent.widthInPixels != null && this.componentContent.widthInPixels != '') {
      this.width = this.componentContent.widthInPixels;
      this.pixelsPerXUnit =
        this.componentContent.widthInPixels / this.componentContent.widthInUnits;
    }

    if (
      this.componentContent.heightInPixels != null &&
      this.componentContent.heightInPixels != ''
    ) {
      this.height = this.componentContent.heightInPixels;
      this.pixelsPerYUnit =
        this.componentContent.heightInPixels / this.componentContent.heightInUnits;
    }

    if (
      this.componentContent.dataXOriginInPixels != null &&
      this.componentContent.dataXOriginInPixels != ''
    ) {
      this.dataXOriginInPixels = this.componentContent.dataXOriginInPixels;
    }

    if (
      this.componentContent.dataYOriginInPixels != null &&
      this.componentContent.dataYOriginInPixels != ''
    ) {
      this.dataYOriginInPixels = this.componentContent.dataYOriginInPixels;
    }

    if (
      this.componentContent.coordinateSystem != null &&
      this.componentContent.coordinateSystem != ''
    ) {
      this.coordinateSystem = this.componentContent.coordinateSystem;
    }
  }

  /*
   * Call the setupSVG() function after a timeout so that angular has a
   * chance to set the svg element id before we start using it. If we
   * don't wait for the timeout, the svg id won't be set when we try
   * to start referencing the svg element.
   */
  setupSVGAfterTimeout() {
    this.$timeout(() => {
      this.setupSVG();
    });
  }

  setupSVG() {
    this.draw = SVG(this.svgId);
    this.createSVGObjects();
    this.updateObjectDatasFromDataSources();
  }

  createSVGObjects() {
    for (let object of this.componentContent.objects) {
      const id = object.id;
      const type = object.type;
      let svgObject = null;

      if (type == 'image') {
        svgObject = this.createSVGImage(object.image, object.width, object.height);
      } else if (type == 'text') {
        svgObject = this.createSVGText(object.text);
      }

      this.addIdToSVGObject(id, svgObject);
      this.addIdToWhetherAuthoredObjectIsAnimating(id, false);
      this.initializeObjectPosition(object);
    }
  }

  createSVGImage(image, width, height) {
    return this.draw.image(image, width, height);
  }

  createSVGText(text) {
    if (text == null) {
      text = '';
    }
    return this.draw.text(text);
  }

  addIdToSVGObject(id, svgObject) {
    this.idToSVGObject[id] = svgObject;
  }

  addIdToWhetherAuthoredObjectIsAnimating(id, isAnimating) {
    this.idToWhetherAuthoredObjectIsAnimating[id] = isAnimating;
  }

  initializeObjectImages() {
    let objects = this.componentContent.objects;
    for (let object of objects) {
      if (object.type == 'image') {
        const svgObject = this.idToSVGObject[object.id];
        svgObject.load(object.image);
      }
    }
  }

  initializeObjectPositions() {
    for (let object of this.componentContent.objects) {
      this.initializeObjectPosition(object);
    }
  }

  /**
   * Convert a data x value to a pixel x value.
   * @param {integer} x An x value in data units.
   * @return {integer} The x value converted to a pixel coordinate.
   */
  dataXToPixelX(x) {
    if (x == null) {
      return this.dataXOriginInPixels;
    } else {
      return this.dataXOriginInPixels + x * this.pixelsPerXUnit;
    }
  }

  /**
   * Convert a data y value to a pixel y value.
   * @param {integer} y A y value in data units.
   * @return {integer} The y value converted to a pixel coordinate.
   */
  dataYToPixelY(y) {
    if (y == null) {
      return this.dataYOriginInPixels;
    } else {
      return this.dataYOriginInPixels + y * this.pixelsPerYUnit;
    }
  }

  initializeObjectPosition(authoredObject) {
    let x = this.getPixelXForAuthoredObject(authoredObject);
    let y = this.getPixelYForAuthoredObject(authoredObject);

    if (this.isUsingCartesianCoordinateSystem()) {
      y = this.convertToCartesianCoordinateSystem(y);
    }

    let id = authoredObject.id;
    let svgObject = this.getSVGObject(id);
    this.setPositionOfSVGObject(svgObject, x, y);

    if (this.authoredObjectHasData(authoredObject)) {
      const data = authoredObject.data;

      if (this.hasDataPointAtTimeZero(data)) {
        const firstDataPoint = data[0];
        this.setPositionFromDataPoint(svgObject, firstDataPoint);
      }
    }
  }

  getPixelXForAuthoredObject(authoredObject) {
    const dataX = authoredObject.dataX;
    const pixelX = authoredObject.pixelX;
    let x = 0;
    if (dataX != null) {
      x = this.dataXToPixelX(dataX);
    } else if (pixelX != null) {
      x = pixelX;
    }
    return x;
  }

  getPixelYForAuthoredObject(authoredObject) {
    const dataY = authoredObject.dataY;
    const pixelY = authoredObject.pixelY;
    let y = 0;
    if (dataY != null) {
      y = this.dataYToPixelY(dataY);
    } else if (pixelY != null) {
      y = pixelY;
    }
    return y;
  }

  getSVGObject(id) {
    return this.idToSVGObject[id];
  }

  hasDataPointAtTimeZero(data) {
    const firstDataPoint = data[0];
    if (firstDataPoint != null && firstDataPoint.t === 0) {
      return true;
    } else {
      return false;
    }
  }

  setPositionFromDataPoint(svgObject, dataPoint) {
    let dataPointX = dataPoint.x;
    let dataPointY = dataPoint.y;
    if (dataPointX != null && dataPointX != '' && typeof dataPointX != 'undefined') {
      const dataPointXInPixels = this.dataXToPixelX(dataPointX);
      this.setXPositionOfSVGObject(svgObject, dataPointXInPixels);
    }

    if (dataPointY != null && dataPointY != '' && typeof dataPointY != 'undefined') {
      let dataPointYInPixels = this.dataYToPixelY(dataPointY);

      if (this.isUsingCartesianCoordinateSystem()) {
        dataPointYInPixels = this.convertToCartesianCoordinateSystem(dataPointYInPixels);
      }

      this.setYPositionOfSVGObject(svgObject, dataPointYInPixels);
    }
  }

  setPositionOfSVGObject(svgObject, x, y) {
    svgObject.attr({ x: x, y: y });
  }

  setXPositionOfSVGObject(svgObject, x) {
    svgObject.attr('x', x);
  }

  setYPositionOfSVGObject(svgObject, y) {
    svgObject.attr('y', y);
  }

  startAnimation() {
    this.initializeObjectImages();
    this.initializeObjectPositions();
    for (let authoredObject of this.componentContent.objects) {
      this.animateObject(authoredObject);
    }
  }

  /**
   * @param {integer} time
   */
  showTimeInSVG(time) {
    if (this.timerText == null) {
      this.initializeTimerText();
    }

    this.setTimerText(time + '');

    const x = this.getTimerTextX(time);
    const y = 0;
    this.setTimerPosition(x, y);
  }

  initializeTimerText() {
    this.timerText = this.draw.text('0').attr({ fill: '#f03' });
  }

  /**
   * Get the x pixel coordinate based upon the number of digits of the time.
   * @param {number} time The time in seconds.
   * @returns {number} The x pixel coordinate.
   */
  getTimerTextX(time) {
    const width = this.width;

    // set the x position near the top right of the svg div
    let x = width - 30;

    if (time >= 10) {
      // shift the text a little to the left if there are two digits
      x = width - 38;
    } else if (time >= 100) {
      // shift the text a little more to the left if there are three digits
      x = width - 46;
    }
    return x;
  }

  setTimerText(text) {
    this.timerText.text(text);
  }

  /**
   * @param {integer} x The x pixel coordinate.
   * @param {integer} y The y pixel coordinate.
   */
  setTimerPosition(x, y) {
    this.timerText.attr({ x: x, y: y });
  }

  updateObjectDatasFromDataSources() {
    for (let object of this.componentContent.objects) {
      if (this.authoredObjectHasDataSource(object)) {
        this.updateObjectDataFromDataSource(object);
      }
    }
  }

  updateObjectDataFromDataSource(object) {
    const dataSource = object.dataSource;
    const componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      dataSource.nodeId,
      dataSource.componentId
    );

    if (componentState != null) {
      if (componentState.componentType == 'Graph') {
        this.setDataFromGraphComponentState(object, componentState);
      } else if (componentState.componentType == 'Table') {
        this.setDataFromTableComponentState(object, componentState);
      }
    }
  }

  updateObjectDatasFromDataSourceComponentState(componentState) {
    for (const object of this.componentContent.objects) {
      if (
        this.authoredObjectHasDataSource(object) &&
        this.isComponentStateFromDataSource(componentState, object.dataSource)
      ) {
        this.updateObjectDataFromDataSourceComponentState(object, componentState);
      }
    }
  }

  isComponentStateFromDataSource(componentState, dataSource) {
    if (
      dataSource != null &&
      dataSource.nodeId == componentState.nodeId &&
      dataSource.componentId == componentState.componentId
    ) {
      return true;
    } else {
      return false;
    }
  }

  updateObjectDataFromDataSourceComponentState(object, componentState) {
    if (componentState.componentType == 'Graph') {
      this.setDataFromGraphComponentState(object, componentState);
    }
  }

  setDataFromGraphComponentState(object, componentState) {
    object.data = this.getDataFromDataSourceComponentState(object.dataSource, componentState);
  }

  setDataFromTableComponentState(object, componentState) {
    // TODO
  }

  getDataFromDataSourceComponentState(dataSource, componentState) {
    const trialIndex = dataSource.trialIndex;
    const seriesIndex = dataSource.seriesIndex;
    const tColumnIndex = dataSource.tColumnIndex;
    const xColumnIndex = dataSource.xColumnIndex;
    const yColumnIndex = dataSource.yColumnIndex;

    const trial = this.getTrialFromComponentState(componentState, trialIndex);
    const singleSeries = this.getSeriesFromTrial(trial, seriesIndex);
    const seriesData = this.getDataFromSeries(singleSeries);
    return this.convertSeriesDataToAnimationData(
      seriesData,
      tColumnIndex,
      xColumnIndex,
      yColumnIndex
    );
  }

  getTrialFromComponentState(componentState, trialIndex) {
    let trial = null;
    const studentData = componentState.studentData;
    if (studentData.trials != null) {
      trial = studentData.trials[trialIndex];
    }
    return trial;
  }

  getSeriesFromTrial(trial, seriesIndex) {
    return trial.series[seriesIndex];
  }

  getDataFromSeries(series) {
    return series.data;
  }

  convertSeriesDataToAnimationData(seriesData, tColumnIndex, xColumnIndex, yColumnIndex) {
    const data = [];

    for (const seriesDataPoint of seriesData) {
      const animationDataPoint: any = {};

      if (tColumnIndex != null) {
        animationDataPoint.t = seriesDataPoint[tColumnIndex];
      }

      if (xColumnIndex != null) {
        animationDataPoint.x = seriesDataPoint[xColumnIndex];
      }

      if (yColumnIndex != null) {
        animationDataPoint.y = seriesDataPoint[yColumnIndex];
      }

      data.push(animationDataPoint);
    }
    return data;
  }

  animateObject(authoredObject) {
    if (this.authoredObjectHasData(authoredObject)) {
      let id = authoredObject.id;
      let data = authoredObject.data;
      let svgObject = this.idToSVGObject[id];
      let animateObject = null;

      for (let d = 0; d < data.length; d++) {
        let currentDataPoint = data[d];
        let nextDataPoint = data[d + 1];
        let image = currentDataPoint.image;
        let t = currentDataPoint.t;
        let xPixel = this.dataXToPixelX(currentDataPoint.x);
        let yPixel = this.dataYToPixelY(currentDataPoint.y);
        if (this.isUsingCartesianCoordinateSystem()) {
          yPixel = this.convertToCartesianCoordinateSystem(yPixel);
        }
        this.idToWhetherAuthoredObjectIsAnimating[id] = true;

        if (this.isFirstDataPoint(d)) {
          animateObject = this.setInitialPositionOfSVGObject(t, svgObject, xPixel, yPixel);
        }

        animateObject = this.updateImageOfSVGObject(
          image,
          animateObject,
          svgObject,
          authoredObject,
          currentDataPoint,
          nextDataPoint
        );

        if (!this.isLastDataPoint(data, d)) {
          let nextT = null;
          let nextXPixel = null;
          let nextYPixel = null;

          if (nextDataPoint != null) {
            nextT = nextDataPoint.t;
            nextXPixel = this.dataXToPixelX(nextDataPoint.x);
            nextYPixel = this.dataYToPixelY(nextDataPoint.y);
          }
          if (this.isUsingCartesianCoordinateSystem()) {
            nextYPixel = this.convertToCartesianCoordinateSystem(nextYPixel);
          }

          let tDiff = this.calculateTimeDiff(t, nextT);
          animateObject = this.updatePositionOfSVGObject(
            svgObject,
            animateObject,
            t,
            tDiff,
            nextXPixel,
            nextYPixel
          );
        } else {
          this.animationCompletedPostProcessing(id, animateObject);
        }
      }
    }
  }

  setInitialPositionOfSVGObject(t, svgObject, xPixel, yPixel) {
    let animateObject = null;

    if (t == 0) {
      svgObject.attr({ x: xPixel, y: yPixel });
    } else {
      /*
       * The first data point is not at time 0 so we will need to wait some time
       * before we set the position of the object.
       */
      const thisAnimationController = this;
      animateObject = svgObject
        .animate(t * this.millisecondsPerDataTime)
        .during(function (pos, morph, eased, situation) {
          let totalElapsedTime = t * pos;
          thisAnimationController.displayAndBroadcastTime(totalElapsedTime);
        })
        .after(function () {
          this.attr({ x: xPixel, y: yPixel });
        });
    }

    return animateObject;
  }

  updatePositionOfSVGObject(svgObject, animateObject, t, tDiff, nextXPixel, nextYPixel) {
    // move the image to the next position in the given amount of time
    const thisAnimationController = this;
    return svgObject
      .animate(tDiff * this.millisecondsPerDataTime)
      .move(nextXPixel, nextYPixel)
      .during(function (pos, morph, eased, situation) {
        let totalElapsedTime = t + tDiff * pos;
        thisAnimationController.displayAndBroadcastTime(totalElapsedTime);
      });
  }

  animationCompletedPostProcessing(id, animateObject) {
    animateObject.afterAll(() => {
      this.idToWhetherAuthoredObjectIsAnimating[id] = false;
      this.checkIfAllAnimatingIsDone();
    });
  }

  updateImageOfSVGObject(
    image,
    animateObject,
    svgObject,
    authoredObject,
    currentDataPoint,
    nextDataPoint
  ) {
    if (image != null && image != '') {
      this.updateSVGObjectImage(image, svgObject, animateObject);
    } else if (nextDataPoint != null) {
      /*
       * There is a next data point so we will see if we can determine what
       * image to show based upon the movement of the object.
       */
      let dynamicallyCalculatedImage = this.getImageBasedOnMovement(
        authoredObject,
        currentDataPoint,
        nextDataPoint
      );
      if (dynamicallyCalculatedImage != null) {
        this.updateSVGObjectImage(dynamicallyCalculatedImage, svgObject, animateObject);
      }
    }
    return animateObject;
  }

  updateSVGObjectImage(image, svgObject, animateObject) {
    if (animateObject == null) {
      // change the image immediately
      svgObject.load(image);
    } else {
      // change the image after all the existing animations
      animateObject = animateObject.after(function () {
        this.load(image);
      });
    }
    return animateObject;
  }

  calculateTimeDiff(currentTime, futureTime) {
    if (futureTime == null) {
      return 0;
    } else {
      return futureTime - currentTime;
    }
  }

  isFirstDataPoint(d) {
    return d == 0;
  }

  isLastDataPoint(data, d) {
    return d == data.length - 1;
  }

  /**
   * @param {number} t The time in seconds.
   */
  displayAndBroadcastTime(t) {
    const displayTime = this.truncateToOneDecimalPlace(t);
    this.showTimeInSVG(displayTime);

    if (this.isPerformBroadcast()) {
      this.broadcastTime(t);
    }

    if (this.lastBroadcastTime == null) {
      this.lastBroadcastTime = new Date().getTime();
    }
  }

  /**
   * @param {number} timeInSeconds
   */
  truncateToOneDecimalPlace(timeInSeconds) {
    return Math.floor(timeInSeconds * 10) / 10;
  }

  /**
   * Check if we want to broadcast the time. We want to make sure we don't
   * broadcast the time too frequently because that may slow down the student's
   * computer significantly. We will wait 100 milliseconds before each
   * broadcast.
   * @returns {boolean}
   */
  isPerformBroadcast() {
    let currentTime = new Date().getTime();

    if (this.lastBroadcastTime == null || currentTime - this.lastBroadcastTime > 100) {
      return true;
    } else {
      return false;
    }
  }

  broadcastTime(t) {
    const componentState = {
      t: t
    };

    this.StudentDataService.broadcastComponentStudentData({
      nodeId: this.nodeId,
      componentId: this.componentId,
      componentState: componentState
    });
    this.lastBroadcastTime = new Date().getTime();
  }

  /**
   * Get the image based upon the movement of the object.
   * @param {object} authoredObject The object that is being moved.
   * @param {object} currentDataPoint Contains x and y fields.
   * @param {object} extDataPoint Contains x and y fields.
   */
  getImageBasedOnMovement(authoredObject, currentDataPoint, nextDataPoint) {
    if (
      this.isYDataPointSame(currentDataPoint, nextDataPoint) &&
      !this.isXDataPointSame(currentDataPoint, nextDataPoint)
    ) {
      return this.getImageMovingInX(authoredObject, currentDataPoint, nextDataPoint);
    } else if (
      this.isXDataPointSame(currentDataPoint, nextDataPoint) &&
      !this.isYDataPointSame(currentDataPoint, nextDataPoint)
    ) {
      return this.getImageMovingInY(authoredObject, currentDataPoint, nextDataPoint);
    }
    return null;
  }

  isXDataPointSame(currentDataPoint, nextDataPoint) {
    return currentDataPoint.x == nextDataPoint.x;
  }

  isYDataPointSame(currentDataPoint, nextDataPoint) {
    return currentDataPoint.y == nextDataPoint.y;
  }

  getImageMovingInX(authoredObject, currentDataPoint, nextDataPoint) {
    if (currentDataPoint.x < nextDataPoint.x) {
      return this.getImageMovingRight(authoredObject);
    } else if (currentDataPoint.x > nextDataPoint.x) {
      return this.getImageMovingLeft(authoredObject);
    }
    return null;
  }

  getImageMovingInY(authoredObject, currentDataPoint, nextDataPoint) {
    if (currentDataPoint.y < nextDataPoint.y) {
      if (this.isUsingCartesianCoordinateSystem()) {
        return this.getImageMovingUp(authoredObject);
      } else {
        return this.getImageMovingDown(authoredObject);
      }
    } else if (currentDataPoint.y > nextDataPoint.y) {
      if (this.isUsingCartesianCoordinateSystem()) {
        return this.getImageMovingDown(authoredObject);
      } else {
        return this.getImageMovingUp(authoredObject);
      }
    }
    return null;
  }

  getImageMovingUp(authoredObject) {
    if (authoredObject.imageMovingUp != null && authoredObject.imageMovingUp != '') {
      return authoredObject.imageMovingUp;
    } else {
      return null;
    }
  }

  getImageMovingDown(authoredObject) {
    if (authoredObject.imageMovingDown != null && authoredObject.imageMovingDown != '') {
      return authoredObject.imageMovingDown;
    } else {
      return null;
    }
  }

  getImageMovingLeft(authoredObject) {
    if (authoredObject.imageMovingLeft != null && authoredObject.imageMovingLeft != '') {
      return authoredObject.imageMovingLeft;
    } else {
      return null;
    }
  }

  getImageMovingRight(authoredObject) {
    if (authoredObject.imageMovingRight != null && authoredObject.imageMovingRight != '') {
      return authoredObject.imageMovingRight;
    } else {
      return null;
    }
  }

  /**
   * Check if all svg objects are done animating. If there are no svg objects
   * animating, we will set the animationState to 'stopped'.
   */
  checkIfAllAnimatingIsDone() {
    if (!this.areAnyObjectsAnimating()) {
      this.setAnimationStateToStopped();

      // perform a digest after a timeout so that the buttons update
      this.$timeout(() => {
        this.$scope.$digest();
      });
    }
  }

  areAnyObjectsAnimating() {
    for (let object of this.componentContent.objects) {
      if (this.idToWhetherAuthoredObjectIsAnimating[object.id]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Populate the student work into the component.
   * @param {object} componentState The component state to populate into the component.
   */
  setStudentWork(componentState) {
    const studentData = componentState.studentData;
    if (studentData != null) {
      const submitCounter = studentData.submitCounter;
      if (submitCounter != null) {
        this.submitCounter = submitCounter;
      }
      this.processLatestStudentWork();
    }
  }

  confirmSubmit(numberOfSubmitsLeft) {
    let isPerformSubmit = false;

    if (numberOfSubmitsLeft <= 0) {
      alert(this.$translate('animation.youHaveNoMoreChances'));
    } else if (numberOfSubmitsLeft == 1) {
      isPerformSubmit = confirm(
        this.$translate('animation.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft })
      );
    } else if (numberOfSubmitsLeft > 1) {
      isPerformSubmit = confirm(
        this.$translate('animation.youHaveMultipleChances', {
          numberOfSubmitsLeft: numberOfSubmitsLeft
        })
      );
    }

    return isPerformSubmit;
  }

  studentDataChanged() {
    this.setIsDirty(true);
    this.emitComponentDirty(true);
    this.setIsSubmit(true);
    this.emitComponentSubmitDirty(true);
    this.clearSaveText();
    this.createComponentStateAndBroadcast('change');
  }

  /**
   * Create a new component state populated with the student data.
   * @param {string} action The action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'.
   * @return {promise} A promise that will return a component state.
   */
  createComponentState(action) {
    const deferred = this.$q.defer();
    const componentState: any = this.NodeService.createNewComponentState();
    const studentData = {
      submitCounter: this.submitCounter
    };
    componentState.studentData = studentData;
    componentState.isSubmit = this.getIsSubmit();

    /*
     * Reset the isSubmit value so that the next component state
     * doesn't maintain the same value.
     */
    this.setIsSubmit(false);

    /*
     * Perform any additional processing that is required before returning
     * the component state.
     */
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);

    return deferred.promise;
  }

  /**
   * @param {object} data The annotation data.
   * @returns {object} The auto score annotation.
   */
  createAutoScoreAnnotation(data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();
    return this.AnnotationService.createAutoScoreAnnotation(
      runId,
      periodId,
      nodeId,
      componentId,
      toWorkgroupId,
      data
    );
  }

  /**
   * @param {object} data The annotation data.
   * @returns {object} The auto comment annotation.
   */
  createAutoCommentAnnotation(data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();
    return this.AnnotationService.createAutoCommentAnnotation(
      runId,
      periodId,
      nodeId,
      componentId,
      toWorkgroupId,
      data
    );
  }

  playButtonClicked() {
    this.setAnimationStateToPlaying();
    this.startAnimation();
    this.studentDataChanged();
  }

  pauseButtonClicked() {
    this.setAnimationStateToPaused();
    for (let object of this.componentContent.objects) {
      let id = object.id;
      let svgObject = this.idToSVGObject[id];
      svgObject.pause();
    }
  }

  resumeButtonClicked() {
    this.setAnimationStateToPlaying();

    for (let object of this.componentContent.objects) {
      let id = object.id;
      let svgObject = this.idToSVGObject[id];
      /*
       * Check if the object still needs to be animated or
       * if it has already finished performing all of its
       * animation. We only need to play it if it still
       * has more animating.
       */
      if (this.idToWhetherAuthoredObjectIsAnimating[id]) {
        svgObject.play();
      }
    }
  }

  resetButtonClicked() {
    this.setAnimationStateToStopped();

    for (let object of this.componentContent.objects) {
      let id = object.id;
      let svgObject = this.idToSVGObject[id];
      let jumpToEnd = true;
      let clearQueue = true;

      /*
       * Check if the object still needs to be animated or
       * if it has already finished performing all of its
       * animation. We only need to play it if it still
       * has more animating.
       */
      if (this.idToWhetherAuthoredObjectIsAnimating[id]) {
        /*
         * We need to play it in case it is currently paused.
         * There is a minor bug in the animation library
         * which is caused if you pause an animation and
         * then stop the animation. Then if you try to play the
         * animation, the animation will not play. We avoid
         * this problem by making sure the object animation
         * is playing when we stop it.
         */
        svgObject.play();
      }

      // stop the object from animating
      svgObject.stop(jumpToEnd, clearQueue);
    }

    this.$timeout(() => {
      this.displayAndBroadcastTime(0);
      this.initializeObjectImages();
      this.initializeObjectPositions();
    }, 100);
  }

  isUsingCartesianCoordinateSystem() {
    return this.coordinateSystem == 'cartesian';
  }

  /**
   * Convert the y value to the cartesian coordinate system
   * @param {integer} y the pixel y value in the screen coordinate system
   * @return {integer} the pixel y value in the cartesian coordinate system
   */
  convertToCartesianCoordinateSystem(y) {
    return this.height - y;
  }

  speedSliderChanged() {
    this.setSpeed(this.speedSliderValue);
    this.resetButtonClicked();
  }

  setSpeed(speedSliderValue) {
    this.speedSliderValue = speedSliderValue;
    if (speedSliderValue == 1) {
      this.millisecondsPerDataTime = 10000;
    } else if (speedSliderValue == 2) {
      this.millisecondsPerDataTime = 1000;
    } else if (speedSliderValue == 3) {
      this.millisecondsPerDataTime = 100;
    } else if (speedSliderValue == 4) {
      this.millisecondsPerDataTime = 10;
    } else if (speedSliderValue == 5) {
      this.millisecondsPerDataTime = 1;
    }
  }

  authoredObjectHasData(authoredObject) {
    return authoredObject.data != null && authoredObject.data.length > 0;
  }

  authoredObjectHasDataSource(authoredObject) {
    return authoredObject.dataSource != null;
  }
}

export default AnimationController;
