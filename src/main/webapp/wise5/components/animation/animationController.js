'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

require('svg.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AnimationController = function (_ComponentController) {
  _inherits(AnimationController, _ComponentController);

  function AnimationController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AnimationController);

    var _this = _possibleConstructorReturn(this, (AnimationController.__proto__ || Object.getPrototypeOf(AnimationController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.AnimationService = AnimationService;
    _this.NotificationService = NotificationService;

    _this.latestAnnotations = null;
    _this.width = 800;
    _this.height = 600;
    _this.pixelsPerXUnit = 1;
    _this.pixelsPerYUnit = 1;
    _this.dataXOriginInPixels = 0;
    _this.dataYOriginInPixels = 0;
    _this.idToSVGObject = {};
    _this.idToWhetherAuthoredObjectIsAnimating = {};
    var componentState = _this.$scope.componentState;
    _this.svgId = 'svg_' + _this.nodeId + '_' + _this.componentId;
    _this.setAnimationStateToStopped();
    _this.setCoordinateSystemToScreen();
    _this.setSpeed(3);
    _this.initializeCoordinates();

    if (_this.isStudentMode()) {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
    } else if (_this.isGradingMode()) {
      if (componentState != null) {
        _this.svgId = 'svg_' + _this.nodeId + '_' + _this.componentId + '_' + componentState.id;
      } else {
        _this.svgId = 'svg_' + _this.nodeId + '_' + _this.componentId + '_' + _this.workgroupId;
      }

      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    }

    if (_this.isStudentMode()) {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        _this.handleConnectedComponents();
      } else if (_this.AnimationService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        _this.handleConnectedComponents();
      }
    } else {
      if (componentState != null) {
        _this.setStudentWork(componentState);
      }
    }

    if (_this.hasStudentUsedAllSubmits()) {
      _this.disableSubmitButton();
    }

    _this.disableComponentIfNecessary();

    _this.setupSVGAfterTimeout();

    _this.$scope.isDirty = function () {
      return _this.$scope.animationController.isDirty;
    };

    /*
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param {boolean} isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return {promise} a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = _this.$q.defer();
      if (_this.hasDirtyWorkToSendToParent(isSubmit)) {
        var action = _this.getDirtyWorkToSendToParentAction(isSubmit);
        _this.$scope.animationController.createComponentState(action).then(function (componentState) {
          deferred.resolve(componentState);
        });
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component.
     * @param {object} connectedComponent The connected component content.
     * @param {object} connectedComponentParams The params to determine what to
     * do with the connected component data such as 'importWork' or 'showWork'.
     * @param {object} componentState The student data from the connected
     * component that has changed.
     */
    _this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {
      if (connectedComponent.type === 'Graph') {
        _this.updateObjectDatasFromDataSourceComponentState(componentState);
      }
    };

    _this.broadcastDoneRenderingComponent();
    return _this;
  }

  _createClass(AnimationController, [{
    key: 'setAnimationState',
    value: function setAnimationState(state) {
      this.animationState = state;
    }
  }, {
    key: 'setAnimationStateToPlaying',
    value: function setAnimationStateToPlaying() {
      this.setAnimationState('playing');
    }
  }, {
    key: 'setAnimationStateToPaused',
    value: function setAnimationStateToPaused() {
      this.setAnimationState('paused');
    }
  }, {
    key: 'setAnimationStateToStopped',
    value: function setAnimationStateToStopped() {
      this.setAnimationState('stopped');
    }
  }, {
    key: 'setCoordinateSystem',
    value: function setCoordinateSystem(coordinateSystem) {
      this.coordinateSystem = coordinateSystem;
    }
  }, {
    key: 'setCoordinateSystemToScreen',
    value: function setCoordinateSystemToScreen() {
      this.setCoordinateSystem('screen');
    }
  }, {
    key: 'setCoordinateSystemToCartesian',
    value: function setCoordinateSystemToCartesian() {
      this.setCoordinateSystem('cartesian');
    }
  }, {
    key: 'hasStudentUsedAllSubmits',
    value: function hasStudentUsedAllSubmits() {
      return this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount;
    }
  }, {
    key: 'disableSubmitButton',
    value: function disableSubmitButton() {
      this.isSubmitButtonDisabled = true;
    }
  }, {
    key: 'hasDirtyWorkToSendToParent',
    value: function hasDirtyWorkToSendToParent(isSubmit) {
      return isSubmit && this.$scope.animationController.isSubmitDirty || this.$scope.animationController.isDirty;
    }
  }, {
    key: 'getDirtyWorkToSendToParentAction',
    value: function getDirtyWorkToSendToParentAction(isSubmit) {
      var action = 'change';
      if (isSubmit && this.$scope.animationController.isSubmitDirty) {
        action = 'submit';
      } else if (this.$scope.animationController.isDirty) {
        action = 'save';
      }
      return action;
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
    key: 'initializeCoordinates',
    value: function initializeCoordinates() {
      if (this.componentContent.widthInPixels != null && this.componentContent.widthInPixels != '') {
        this.width = this.componentContent.widthInPixels;
        this.pixelsPerXUnit = this.componentContent.widthInPixels / this.componentContent.widthInUnits;
      }

      if (this.componentContent.heightInPixels != null && this.componentContent.heightInPixels != '') {
        this.height = this.componentContent.heightInPixels;
        this.pixelsPerYUnit = this.componentContent.heightInPixels / this.componentContent.heightInUnits;
      }

      if (this.componentContent.dataXOriginInPixels != null && this.componentContent.dataXOriginInPixels != '') {
        this.dataXOriginInPixels = this.componentContent.dataXOriginInPixels;
      }

      if (this.componentContent.dataYOriginInPixels != null && this.componentContent.dataYOriginInPixels != '') {
        this.dataYOriginInPixels = this.componentContent.dataYOriginInPixels;
      }

      if (this.componentContent.coordinateSystem != null && this.componentContent.coordinateSystem != '') {
        this.coordinateSystem = this.componentContent.coordinateSystem;
      }
    }

    /*
     * Call the setupSVG() function after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */

  }, {
    key: 'setupSVGAfterTimeout',
    value: function setupSVGAfterTimeout() {
      var _this2 = this;

      this.$timeout(function () {
        _this2.setupSVG();
      });
    }
  }, {
    key: 'setupSVG',
    value: function setupSVG() {
      this.draw = SVG(this.svgId);
      this.createSVGObjects();
      this.updateObjectDatasFromDataSources();
    }
  }, {
    key: 'createSVGObjects',
    value: function createSVGObjects() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.componentContent.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var id = object.id;
          var type = object.type;
          var svgObject = null;

          if (type == 'image') {
            svgObject = this.createSVGImage(object.image, object.width, object.height);
          } else if (type == 'text') {
            svgObject = this.createSVGText(object.text);
          }

          this.addIdToSVGObject(id, svgObject);
          this.addIdToWhetherAuthoredObjectIsAnimating(id, false);
          this.initializeObjectPosition(object);
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
    }
  }, {
    key: 'createSVGImage',
    value: function createSVGImage(image, width, height) {
      return this.draw.image(image, width, height);
    }
  }, {
    key: 'createSVGText',
    value: function createSVGText(text) {
      if (text == null) {
        text = '';
      }
      return this.draw.text(text);
    }
  }, {
    key: 'addIdToSVGObject',
    value: function addIdToSVGObject(id, svgObject) {
      this.idToSVGObject[id] = svgObject;
    }
  }, {
    key: 'addIdToWhetherAuthoredObjectIsAnimating',
    value: function addIdToWhetherAuthoredObjectIsAnimating(id, isAnimating) {
      this.idToWhetherAuthoredObjectIsAnimating[id] = isAnimating;
    }
  }, {
    key: 'initializeObjectImages',
    value: function initializeObjectImages() {
      var objects = this.componentContent.objects;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          if (object.type == 'image') {
            var svgObject = this.idToSVGObject[object.id];
            svgObject.load(object.image);
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
    }
  }, {
    key: 'initializeObjectPositions',
    value: function initializeObjectPositions() {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.componentContent.objects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          this.initializeObjectPosition(object);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    /**
     * Convert a data x value to a pixel x value.
     * @param {integer} x An x value in data units.
     * @return {integer} The x value converted to a pixel coordinate.
     */

  }, {
    key: 'dataXToPixelX',
    value: function dataXToPixelX(x) {
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

  }, {
    key: 'dataYToPixelY',
    value: function dataYToPixelY(y) {
      if (y == null) {
        return this.dataYOriginInPixels;
      } else {
        return this.dataYOriginInPixels + y * this.pixelsPerYUnit;
      }
    }
  }, {
    key: 'initializeObjectPosition',
    value: function initializeObjectPosition(authoredObject) {
      var x = this.getPixelXForAuthoredObject(authoredObject);
      var y = this.getPixelYForAuthoredObject(authoredObject);

      if (this.isUsingCartesianCoordinateSystem()) {
        y = this.convertToCartesianCoordinateSystem(y);
      }

      var id = authoredObject.id;
      var svgObject = this.getSVGObject(id);
      this.setPositionOfSVGObject(svgObject, x, y);

      if (this.authoredObjectHasData(authoredObject)) {
        var data = authoredObject.data;

        if (this.hasDataPointAtTimeZero(data)) {
          var firstDataPoint = data[0];
          this.setPositionFromDataPoint(svgObject, firstDataPoint);
        }
      }
    }
  }, {
    key: 'getPixelXForAuthoredObject',
    value: function getPixelXForAuthoredObject(authoredObject) {
      var dataX = authoredObject.dataX;
      var pixelX = authoredObject.pixelX;
      var x = 0;
      if (dataX != null) {
        x = this.dataXToPixelX(dataX);
      } else if (pixelX != null) {
        x = pixelX;
      }
      return x;
    }
  }, {
    key: 'getPixelYForAuthoredObject',
    value: function getPixelYForAuthoredObject(authoredObject) {
      var dataY = authoredObject.dataY;
      var pixelY = authoredObject.pixelY;
      var y = 0;
      if (dataY != null) {
        y = this.dataYToPixelY(dataY);
      } else if (pixelY != null) {
        y = pixelY;
      }
      return y;
    }
  }, {
    key: 'getSVGObject',
    value: function getSVGObject(id) {
      return this.idToSVGObject[id];
    }
  }, {
    key: 'hasDataPointAtTimeZero',
    value: function hasDataPointAtTimeZero(data) {
      var firstDataPoint = data[0];
      if (firstDataPoint != null && firstDataPoint.t === 0) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'setPositionFromDataPoint',
    value: function setPositionFromDataPoint(svgObject, dataPoint) {
      var dataPointX = dataPoint.x;
      var dataPointY = dataPoint.y;
      if (dataPointX != null && dataPointX != '' && typeof dataPointX != 'undefined') {
        var dataPointXInPixels = this.dataXToPixelX(dataPointX);
        this.setXPositionOfSVGObject(svgObject, dataPointXInPixels);
      }

      if (dataPointY != null && dataPointY != '' && typeof dataPointY != 'undefined') {
        var dataPointYInPixels = this.dataYToPixelY(dataPointY);

        if (this.isUsingCartesianCoordinateSystem()) {
          dataPointYInPixels = this.convertToCartesianCoordinateSystem(dataPointYInPixels);
        }

        this.setYPositionOfSVGObject(svgObject, dataPointYInPixels);
      }
    }
  }, {
    key: 'setPositionOfSVGObject',
    value: function setPositionOfSVGObject(svgObject, x, y) {
      svgObject.attr({ x: x, y: y });
    }
  }, {
    key: 'setXPositionOfSVGObject',
    value: function setXPositionOfSVGObject(svgObject, x) {
      svgObject.attr('x', x);
    }
  }, {
    key: 'setYPositionOfSVGObject',
    value: function setYPositionOfSVGObject(svgObject, y) {
      svgObject.attr('y', y);
    }
  }, {
    key: 'startAnimation',
    value: function startAnimation() {
      this.initializeObjectImages();
      this.initializeObjectPositions();
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.componentContent.objects[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var authoredObject = _step4.value;

          this.animateObject(authoredObject);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }

    /**
     * @param {integer} time
     */

  }, {
    key: 'showTimeInSVG',
    value: function showTimeInSVG(time) {
      if (this.timerText == null) {
        this.initializeTimerText();
      }

      this.setTimerText(time + '');

      var x = this.getTimerTextX(time);
      var y = 0;
      this.setTimerPosition(x, y);
    }
  }, {
    key: 'initializeTimerText',
    value: function initializeTimerText() {
      this.timerText = this.draw.text('0').attr({ fill: '#f03' });
    }

    /**
     * Get the x pixel coordinate based upon the number of digits of the time.
     * @param {number} time The time in seconds.
     * @returns {number} The x pixel coordinate.
     */

  }, {
    key: 'getTimerTextX',
    value: function getTimerTextX(time) {
      var width = this.width;

      // set the x position near the top right of the svg div
      var x = width - 30;

      if (time >= 10) {
        // shift the text a little to the left if there are two digits
        x = width - 38;
      } else if (time >= 100) {
        // shift the text a little more to the left if there are three digits
        x = width - 46;
      }
      return x;
    }
  }, {
    key: 'setTimerText',
    value: function setTimerText(text) {
      this.timerText.text(text);
    }

    /**
     * @param {integer} x The x pixel coordinate.
     * @param {integer} y The y pixel coordinate.
     */

  }, {
    key: 'setTimerPosition',
    value: function setTimerPosition(x, y) {
      this.timerText.attr({ x: x, y: y });
    }
  }, {
    key: 'updateObjectDatasFromDataSources',
    value: function updateObjectDatasFromDataSources() {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.componentContent.objects[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var object = _step5.value;

          if (this.authoredObjectHasDataSource(object)) {
            this.updateObjectDataFromDataSource(object);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: 'updateObjectDataFromDataSource',
    value: function updateObjectDataFromDataSource(object) {
      var dataSource = object.dataSource;
      var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(dataSource.nodeId, dataSource.componentId);

      if (componentState != null) {
        if (componentState.componentType == 'Graph') {
          this.setDataFromGraphComponentState(object, componentState);
        } else if (componentState.componentType == 'Table') {
          this.setDataFromTableComponentState(object, componentState);
        }
      }
    }
  }, {
    key: 'updateObjectDatasFromDataSourceComponentState',
    value: function updateObjectDatasFromDataSourceComponentState(componentState) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.componentContent.objects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var object = _step6.value;

          if (this.authoredObjectHasDataSource(object) && this.isComponentStateFromDataSource(componentState, object.dataSource)) {
            this.updateObjectDataFromDataSourceComponentState(object, componentState);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: 'isComponentStateFromDataSource',
    value: function isComponentStateFromDataSource(componentState, dataSource) {
      if (dataSource != null && dataSource.nodeId == componentState.nodeId && dataSource.componentId == componentState.componentId) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'updateObjectDataFromDataSourceComponentState',
    value: function updateObjectDataFromDataSourceComponentState(object, componentState) {
      if (componentState.componentType == 'Graph') {
        this.setDataFromGraphComponentState(object, componentState);
      }
    }
  }, {
    key: 'setDataFromGraphComponentState',
    value: function setDataFromGraphComponentState(object, componentState) {
      object.data = this.getDataFromDataSourceComponentState(object.dataSource, componentState);
    }
  }, {
    key: 'getDataFromDataSourceComponentState',
    value: function getDataFromDataSourceComponentState(dataSource, componentState) {
      var trialIndex = dataSource.trialIndex;
      var seriesIndex = dataSource.seriesIndex;
      var tColumnIndex = dataSource.tColumnIndex;
      var xColumnIndex = dataSource.xColumnIndex;
      var yColumnIndex = dataSource.yColumnIndex;

      var trial = this.getTrialFromComponentState(componentState, trialIndex);
      var singleSeries = this.getSeriesFromTrial(trial, seriesIndex);
      var seriesData = this.getDataFromSeries(singleSeries);
      return this.convertSeriesDataToAnimationData(seriesData, tColumnIndex, xColumnIndex, yColumnIndex);
    }
  }, {
    key: 'getTrialFromComponentState',
    value: function getTrialFromComponentState(componentState, trialIndex) {
      var trial = null;
      var studentData = componentState.studentData;
      if (studentData.trials != null) {
        trial = studentData.trials[trialIndex];
      }
      return trial;
    }
  }, {
    key: 'getSeriesFromTrial',
    value: function getSeriesFromTrial(trial, seriesIndex) {
      return trial.series[seriesIndex];
    }
  }, {
    key: 'getDataFromSeries',
    value: function getDataFromSeries(series) {
      return series.data;
    }
  }, {
    key: 'convertSeriesDataToAnimationData',
    value: function convertSeriesDataToAnimationData(seriesData, tColumnIndex, xColumnIndex, yColumnIndex) {
      var data = [];

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = seriesData[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var seriesDataPoint = _step7.value;

          var animationDataPoint = {};

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
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return data;
    }
  }, {
    key: 'animateObject',
    value: function animateObject(authoredObject) {
      if (this.authoredObjectHasData(authoredObject)) {
        var id = authoredObject.id;
        var data = authoredObject.data;
        var svgObject = this.idToSVGObject[id];
        var animateObject = null;

        for (var d = 0; d < data.length; d++) {
          var currentDataPoint = data[d];
          var nextDataPoint = data[d + 1];
          var image = currentDataPoint.image;
          var t = currentDataPoint.t;
          var xPixel = this.dataXToPixelX(currentDataPoint.x);
          var yPixel = this.dataYToPixelY(currentDataPoint.y);
          if (this.isUsingCartesianCoordinateSystem()) {
            yPixel = this.convertToCartesianCoordinateSystem(yPixel);
          }
          this.idToWhetherAuthoredObjectIsAnimating[id] = true;

          if (this.isFirstDataPoint(d)) {
            animateObject = this.setInitialPositionOfSVGObject(t, svgObject, xPixel, yPixel);
          }

          animateObject = this.updateImageOfSVGObject(image, animateObject, svgObject, authoredObject, currentDataPoint, nextDataPoint);

          if (!this.isLastDataPoint(data, d)) {
            var nextT = null;
            var nextXPixel = null;
            var nextYPixel = null;

            if (nextDataPoint != null) {
              nextT = nextDataPoint.t;
              nextXPixel = this.dataXToPixelX(nextDataPoint.x);
              nextYPixel = this.dataYToPixelY(nextDataPoint.y);
            }
            if (this.isUsingCartesianCoordinateSystem()) {
              nextYPixel = this.convertToCartesianCoordinateSystem(nextYPixel);
            }

            var tDiff = this.calculateTimeDiff(t, nextT);
            animateObject = this.updatePositionOfSVGObject(svgObject, animateObject, t, tDiff, nextXPixel, nextYPixel);
          } else {
            this.animationCompletedPostProcessing(id, animateObject);
          }
        }
      }
    }
  }, {
    key: 'setInitialPositionOfSVGObject',
    value: function setInitialPositionOfSVGObject(t, svgObject, xPixel, yPixel) {
      var animateObject = null;

      if (t == 0) {
        svgObject.attr({ x: xPixel, y: yPixel });
      } else {
        /*
         * The first data point is not at time 0 so we will need to wait some time
         * before we set the position of the object.
         */
        var thisAnimationController = this;
        animateObject = svgObject.animate(t * this.millisecondsPerDataTime).during(function (pos, morph, eased, situation) {
          var totalElapsedTime = t * pos;
          thisAnimationController.displayAndBroadcastTime(totalElapsedTime);
        }).after(function () {
          this.attr({ x: xPixel, y: yPixel });
        });
      }

      return animateObject;
    }
  }, {
    key: 'updatePositionOfSVGObject',
    value: function updatePositionOfSVGObject(svgObject, animateObject, t, tDiff, nextXPixel, nextYPixel) {
      // move the image to the next position in the given amount of time
      var thisAnimationController = this;
      return svgObject.animate(tDiff * this.millisecondsPerDataTime).move(nextXPixel, nextYPixel).during(function (pos, morph, eased, situation) {
        var totalElapsedTime = t + tDiff * pos;
        thisAnimationController.displayAndBroadcastTime(totalElapsedTime);
      });
    }
  }, {
    key: 'animationCompletedPostProcessing',
    value: function animationCompletedPostProcessing(id, animateObject) {
      var _this3 = this;

      animateObject.afterAll(function () {
        _this3.idToWhetherAuthoredObjectIsAnimating[id] = false;
        _this3.checkIfAllAnimatingIsDone();
      });
    }
  }, {
    key: 'updateImageOfSVGObject',
    value: function updateImageOfSVGObject(image, animateObject, svgObject, authoredObject, currentDataPoint, nextDataPoint) {
      if (image != null && image != '') {
        this.updateSVGObjectImage(image, svgObject, animateObject);
      } else if (nextDataPoint != null) {
        /*
         * There is a next data point so we will see if we can determine what
         * image to show based upon the movement of the object.
         */
        var dynamicallyCalculatedImage = this.getImageBasedOnMovement(authoredObject, currentDataPoint, nextDataPoint);
        if (dynamicallyCalculatedImage != null) {
          this.updateSVGObjectImage(dynamicallyCalculatedImage, svgObject, animateObject);
        }
      }
      return animateObject;
    }
  }, {
    key: 'updateSVGObjectImage',
    value: function updateSVGObjectImage(image, svgObject, animateObject) {
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
  }, {
    key: 'calculateTimeDiff',
    value: function calculateTimeDiff(currentTime, futureTime) {
      if (futureTime == null) {
        return 0;
      } else {
        return futureTime - currentTime;
      }
    }
  }, {
    key: 'isFirstDataPoint',
    value: function isFirstDataPoint(d) {
      return d == 0;
    }
  }, {
    key: 'isLastDataPoint',
    value: function isLastDataPoint(data, d) {
      return d == data.length - 1;
    }

    /**
     * @param {number} t The time in seconds.
     */

  }, {
    key: 'displayAndBroadcastTime',
    value: function displayAndBroadcastTime(t) {
      var displayTime = this.truncateToOneDecimalPlace(t);
      this.showTimeInSVG(displayTime);

      if (this.isPerformBroadcast()) {
        this.broadcastTime(t);
      }

      if (this.lastBroadcastTime == null) {
        this.lastBroadcastTime = currentTime;
      }
    }

    /**
     * @param {number} timeInSeconds
     */

  }, {
    key: 'truncateToOneDecimalPlace',
    value: function truncateToOneDecimalPlace(timeInSeconds) {
      return parseInt(timeInSeconds * 10) / 10;
    }

    /**
     * Check if we want to broadcast the time. We want to make sure we don't
     * broadcast the time too frequently because that may slow down the student's
     * computer significantly. We will wait 100 milliseconds before each
     * broadcast.
     * @returns {boolean}
     */

  }, {
    key: 'isPerformBroadcast',
    value: function isPerformBroadcast() {
      var currentTime = new Date().getTime();

      if (this.lastBroadcastTime == null || currentTime - this.lastBroadcastTime > 100) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'broadcastTime',
    value: function broadcastTime(t) {
      var componentState = {
        t: t
      };

      this.$scope.$emit('componentStudentDataChanged', { nodeId: this.nodeId, componentId: this.componentId, componentState: componentState });
      this.lastBroadcastTime = new Date().getTime();
    }

    /**
     * Get the image based upon the movement of the object.
     * @param {object} authoredObject The object that is being moved.
     * @param {object} currentDataPoint Contains x and y fields.
     * @param {object} extDataPoint Contains x and y fields.
     */

  }, {
    key: 'getImageBasedOnMovement',
    value: function getImageBasedOnMovement(authoredObject, currentDataPoint, nextDataPoint) {
      if (this.isYDataPointSame(currentDataPoint, nextDataPoint) && !this.isXDataPointSame(currentDataPoint, nextDataPoint)) {
        return this.getImageMovingInX(authoredObject, currentDataPoint, nextDataPoint);
      } else if (this.isXDataPointSame(currentDataPoint, nextDataPoint) && !this.isYDataPointSame(currentDataPoint, nextDataPoint)) {
        return this.getImageMovingInY(authoredObject, currentDataPoint, nextDataPoint);
      }
      return null;
    }
  }, {
    key: 'isXDataPointSame',
    value: function isXDataPointSame(currentDataPoint, nextDataPoint) {
      return currentDataPoint.x == nextDataPoint.x;
    }
  }, {
    key: 'isYDataPointSame',
    value: function isYDataPointSame(currentDataPoint, nextDataPoint) {
      return currentDataPoint.y == nextDataPoint.y;
    }
  }, {
    key: 'getImageMovingInX',
    value: function getImageMovingInX(authoredObject, currentDataPoint, nextDataPoint) {
      if (currentDataPoint.x < nextDataPoint.x) {
        return this.getImageMovingRight(authoredObject);
      } else if (currentDataPoint.x > nextDataPoint.x) {
        return this.getImageMovingLeft(authoredObject);
      }
      return null;
    }
  }, {
    key: 'getImageMovingInY',
    value: function getImageMovingInY(authoredObject, currentDataPoint, nextDataPoint) {
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
  }, {
    key: 'getImageMovingUp',
    value: function getImageMovingUp(authoredObject) {
      if (authoredObject.imageMovingUp != null && authoredObject.imageMovingUp != '') {
        return authoredObject.imageMovingUp;
      } else {
        return null;
      }
    }
  }, {
    key: 'getImageMovingDown',
    value: function getImageMovingDown(authoredObject) {
      if (authoredObject.imageMovingDown != null && authoredObject.imageMovingDown != '') {
        return authoredObject.imageMovingDown;
      } else {
        return null;
      }
    }
  }, {
    key: 'getImageMovingLeft',
    value: function getImageMovingLeft(authoredObject) {
      if (authoredObject.imageMovingLeft != null && authoredObject.imageMovingLeft != '') {
        return authoredObject.imageMovingLeft;
      } else {
        return null;
      }
    }
  }, {
    key: 'getImageMovingRight',
    value: function getImageMovingRight(authoredObject) {
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

  }, {
    key: 'checkIfAllAnimatingIsDone',
    value: function checkIfAllAnimatingIsDone() {
      var _this4 = this;

      if (!this.areAnyObjectsAnimating()) {
        this.setAnimationStateToStopped();

        // perform a digest after a timeout so that the buttons update
        this.$timeout(function () {
          _this4.$scope.$digest();
        });
      }
    }
  }, {
    key: 'areAnyObjectsAnimating',
    value: function areAnyObjectsAnimating() {
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.componentContent.objects[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var object = _step8.value;

          if (this.idToWhetherAuthoredObjectIsAnimating[object.id]) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      return false;
    }

    /**
     * Populate the student work into the component.
     * @param {object} componentState The component state to populate into the component.
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      var studentData = componentState.studentData;
      if (studentData != null) {
        var submitCounter = studentData.submitCounter;
        if (submitCounter != null) {
          this.submitCounter = submitCounter;
        }
        this.processLatestStudentWork();
      }
    }
  }, {
    key: 'confirmSubmit',
    value: function confirmSubmit(numberOfSubmitsLeft) {
      var isPerformSubmit = false;

      if (numberOfSubmitsLeft <= 0) {
        alert(this.$translate('animation.youHaveNoMoreChances'));
      } else if (numberOfSubmitsLeft == 1) {
        isPerformSubmit = confirm(this.$translate('animation.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft }));
      } else if (numberOfSubmitsLeft > 1) {
        isPerformSubmit = confirm(this.$translate('animation.youHaveMultipleChances', { numberOfSubmitsLeft: numberOfSubmitsLeft }));
      }

      return isPerformSubmit;
    }
  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      var _this5 = this;

      this.setIsDirtyTrue(true);
      this.emitComponentDirty(true);

      this.setIsSubmitDirty(true);
      this.emitComponentSubmitDirty(true);

      this.clearSaveText();

      this.createComponentState('change').then(function (componentState) {
        _this5.$scope.$emit('componentStudentDataChanged', { nodeId: _this5.nodeId, componentId: _this5.componentId, componentState: componentState });
      });
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data.
     * @param {string} action The action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'.
     * @return {promise} A promise that will return a component state.
     */
    value: function createComponentState(action) {
      var deferred = this.$q.defer();
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {
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
  }, {
    key: 'createAutoScoreAnnotation',


    /**
     * @param {object} data The annotation data.
     * @returns {object} The auto score annotation.
     */
    value: function createAutoScoreAnnotation(data) {
      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();
      return this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
    }

    /**
     * @param {object} data The annotation data.
     * @returns {object} The auto comment annotation.
     */

  }, {
    key: 'createAutoCommentAnnotation',
    value: function createAutoCommentAnnotation(data) {
      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();
      return this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
    }
  }, {
    key: 'getRevisions',
    value: function getRevisions() {
      return this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
    }
  }, {
    key: 'playButtonClicked',
    value: function playButtonClicked() {
      this.setAnimationStateToPlaying();
      this.startAnimation();
    }
  }, {
    key: 'pauseButtonClicked',
    value: function pauseButtonClicked() {
      this.setAnimationStateToPaused();
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this.componentContent.objects[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var object = _step9.value;

          var id = object.id;
          var svgObject = this.idToSVGObject[id];
          svgObject.pause();
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }
    }
  }, {
    key: 'resumeButtonClicked',
    value: function resumeButtonClicked() {
      this.setAnimationStateToPlaying();

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.componentContent.objects[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var object = _step10.value;

          var id = object.id;
          var svgObject = this.idToSVGObject[id];
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
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }
    }
  }, {
    key: 'resetButtonClicked',
    value: function resetButtonClicked() {
      var _this6 = this;

      this.setAnimationStateToStopped();

      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = this.componentContent.objects[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var object = _step11.value;

          var id = object.id;
          var svgObject = this.idToSVGObject[id];
          var jumpToEnd = true;
          var clearQueue = true;

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
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      this.$timeout(function () {
        _this6.displayAndBroadcastTime(0);
        _this6.initializeObjectImages();
        _this6.initializeObjectPositions();
      }, 100);
    }
  }, {
    key: 'isUsingCartesianCoordinateSystem',
    value: function isUsingCartesianCoordinateSystem() {
      return this.coordinateSystem == 'cartesian';
    }

    /**
     * Convert the y value to the cartesian coordinate system
     * @param {integer} y the pixel y value in the screen coordinate system
     * @return {integer} the pixel y value in the cartesian coordinate system
     */

  }, {
    key: 'convertToCartesianCoordinateSystem',
    value: function convertToCartesianCoordinateSystem(y) {
      return this.height - y;
    }
  }, {
    key: 'speedSliderChanged',
    value: function speedSliderChanged() {
      this.setSpeed(this.speedSliderValue);
      this.resetButtonClicked();
    }
  }, {
    key: 'setSpeed',
    value: function setSpeed(speedSliderValue) {
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
  }, {
    key: 'getComponentByNodeIdAndComponentId',
    value: function getComponentByNodeIdAndComponentId(nodeId, componentId) {
      return this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    }
  }, {
    key: 'authoredObjectHasData',
    value: function authoredObjectHasData(authoredObject) {
      return authoredObject.data != null && authoredObject.data.length > 0;
    }
  }, {
    key: 'authoredObjectHasDataSource',
    value: function authoredObjectHasDataSource(authoredObject) {
      return authoredObject.dataSource != null;
    }
  }]);

  return AnimationController;
}(_componentController2.default);

;

AnimationController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnimationService', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AnimationController;
//# sourceMappingURL=animationController.js.map
