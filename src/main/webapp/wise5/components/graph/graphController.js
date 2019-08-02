'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentController = _interopRequireDefault(require("../componentController"));

var _canvg = _interopRequireDefault(require("canvg"));

var _html2canvas = _interopRequireDefault(require("html2canvas"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var GraphController =
/*#__PURE__*/
function (_ComponentController) {
  _inherits(GraphController, _ComponentController);

  function GraphController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, GraphService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this;

    _classCallCheck(this, GraphController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GraphController).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));
    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.GraphService = GraphService;
    _this.graphType = null;
    _this.series = [];
    _this.seriesColors = ['blue', 'red', 'green', 'orange', 'purple', 'black'];
    _this.seriesMarkers = ['circle', 'square', 'diamond', 'triangle', 'triangle-down', 'circle'];
    _this.activeSeries = null;
    _this.isResetGraphButtonVisible = false;
    _this.isSelectSeriesVisible = false;
    _this.notebookConfig = _this.NotebookService.getNotebookConfig();
    _this.hideAllTrialsOnNewTrial = true;
    _this.showUndoButton = false;
    _this.isLegendEnabled = true;
    _this.hasCustomLegendBeenSet = false;
    _this.showTrialSelect = true;
    _this.chartId = 'chart1';
    _this.width = null;
    _this.height = null;
    _this.trials = [];
    _this.activeTrial = null;
    _this.trialIdsToShow = [];
    _this.selectedTrialsText = '';
    _this.studentDataVersion = 2;
    _this.canCreateNewTrials = false;
    _this.canDeleteTrials = false;
    _this.uploadedFileName = null;
    _this.backgroundImage = null;
    _this.mouseOverPoints = [];
    _this.initialComponentState = null;
    /*
     * An array to store the component states for the student to undo.
     * The undoStack will contain the component states from the current
     * visit except for the current component state.
     */

    _this.undoStack = [];
    /*
     * whether to add the next component state created in
     * studentDataChanged() to the undoStack
     */

    _this.addNextComponentStateToUndoStack = false;
    _this.chartId = 'chart_' + _this.componentId;
    _this.hiddenCanvasId = 'hiddenCanvas_' + _this.componentId;

    _this.initializeComponentContentParams();

    var componentState = _this.$scope.componentState;

    if (_this.isStudentMode()) {
      _this.initializeStudentMode(componentState);
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.initializeGradingMode(componentState);
    } else if (_this.mode === 'onlyShowWork') {
      _this.initializeOnlyShowWorkMode();
    }

    if (!_this.isStudentMode() && _this.GraphService.componentStateHasStudentWork(componentState, _this.componentContent)) {
      _this.setStudentWork(componentState);
    }

    _this.initialComponentState = componentState;
    _this.previousComponentState = componentState;

    if (!_this.canSubmit()) {
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    _this.initializeHandleConnectedComponentStudentDataChanged();

    _this.initializeDeleteKeyPressedListener();

    _this.initializeFileUploadChanged();

    _this.initializeScopeGetComponentState(_this.$scope, 'graphController');

    _this.drawGraph().then(function () {
      _this.broadcastDoneRenderingComponent();
    });

    return _this;
  }

  _createClass(GraphController, [{
    key: "initializeComponentContentParams",
    value: function initializeComponentContentParams() {
      this.graphType = this.componentContent.graphType;

      if (this.graphType == null) {
        this.graphType = 'line';
      }

      if (this.componentContent.canCreateNewTrials != null) {
        this.canCreateNewTrials = this.componentContent.canCreateNewTrials;
      }

      if (this.componentContent.canDeleteTrials != null) {
        this.canDeleteTrials = this.componentContent.canDeleteTrials;
      }

      if (this.componentContent.hideAllTrialsOnNewTrial === false) {
        this.hideAllTrialsOnNewTrial = false;
      }

      if (this.componentContent.hideLegend) {
        this.isLegendEnabled = false;
      }

      if (this.componentContent.hideTrialSelect) {
        this.showTrialSelect = false;
      }
    }
  }, {
    key: "initializeStudentMode",
    value: function initializeStudentMode(componentState) {
      this.isResetSeriesButtonVisible = true;
      this.isSelectSeriesVisible = true;
      this.backgroundImage = this.componentContent.backgroundImage;

      if (!this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)) {
        this.newTrial();
      }

      if (this.UtilService.hasConnectedComponentAlwaysField(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)) {
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      }
    }
  }, {
    key: "initializeGradingMode",
    value: function initializeGradingMode(componentState) {
      this.isResetSeriesButtonVisible = false;
      this.isSelectSeriesVisible = false;

      if (componentState != null) {
        if (this.mode === 'gradingRevision') {
          this.chartId = 'chart_gradingRevision_' + componentState.id;
        } else {
          this.chartId = 'chart_' + componentState.id;
        }
      }
    }
  }, {
    key: "initializeOnlyShowWorkMode",
    value: function initializeOnlyShowWorkMode() {
      this.isResetGraphButtonVisible = false;
      this.isResetSeriesButtonVisible = false;
      this.isSelectSeriesVisible = false;
      this.backgroundImage = this.componentContent.backgroundImage;
    }
  }, {
    key: "initializeHandleConnectedComponentStudentDataChanged",
    value: function initializeHandleConnectedComponentStudentDataChanged() {
      var _this2 = this;

      this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {
        var componentType = connectedComponent.type;

        if (componentType === 'Table') {
          _this2.handleTableConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
        } else if (componentType === 'Embedded') {
          _this2.handleEmbeddedConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
        } else if (componentType === 'Animation') {
          _this2.handleAnimationConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
        }
      };
    }
  }, {
    key: "initializeDeleteKeyPressedListener",
    value: function initializeDeleteKeyPressedListener() {
      var _this3 = this;

      this.deleteKeyPressedListenerDestroyer = this.$scope.$on('deleteKeyPressed', function () {
        _this3.handleDeleteKeyPressed();
      });
    }
  }, {
    key: "initializeFileUploadChanged",
    value: function initializeFileUploadChanged() {
      var _this4 = this;

      this.$scope.fileUploadChanged = function (element) {
        var activeSeriesData = _this4.activeSeries.data;
        var overwrite = true;

        if (activeSeriesData.length > 0) {
          if (!confirm(_this4.$translate('graph.areYouSureYouWantToOverwriteTheCurrentLineData'))) {
            overwrite = false;
          }
        }

        if (overwrite) {
          _this4.uploadFileAndReadContent(element);
        }
        /*
         * clear the file input element value so that onchange() will be
         * called again if the student wants to upload the same file again
         */


        element.value = null;
      };
    }
  }, {
    key: "uploadFileAndReadContent",
    value: function uploadFileAndReadContent(element) {
      var _this5 = this;

      var files = element.files;
      var reader = new FileReader();

      reader.onload = function () {
        var fileContent = reader.result;

        _this5.readCSVIntoActiveSeries(fileContent);

        _this5.setUploadedFileName(_this5.fileName);

        _this5.studentDataChanged();
      };

      reader.scope = this;
      reader.fileName = files[0].name;
      reader.readAsText(files[0]);
      this.StudentAssetService.uploadAsset(files[0]);
    }
  }, {
    key: "cleanupBeforeExiting",
    value: function cleanupBeforeExiting() {
      this.deleteKeyPressedListenerDestroyer();
    }
  }, {
    key: "handleTableConnectedComponentStudentDataChanged",
    value: function handleTableConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState) {
      var studentData = componentState.studentData;

      if (studentData != null && studentData.tableData != null) {
        var rows = studentData.tableData;
        var data = this.convertRowDataToSeriesData(rows, connectedComponentParams);
        var seriesIndex = connectedComponentParams.seriesIndex;

        if (seriesIndex == null) {
          seriesIndex = 0;
        }

        if (this.isStudentDataVersion1()) {
          var series = this.series[seriesIndex];

          if (series == null) {
            series = {};
            this.series[seriesIndex] = series;
          }

          series.data = data;
        } else {
          var trial = this.activeTrial;

          if (trial != null && trial.series != null) {
            var _series = trial.series[seriesIndex];

            if (_series == null) {
              _series = {};
              this.series[seriesIndex] = _series;
            }

            _series.data = data;
          }
        }

        this.drawGraph();
        this.isDirty = true;
      }
    }
  }, {
    key: "handleEmbeddedConnectedComponentStudentDataChanged",
    value: function handleEmbeddedConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState) {
      componentState = this.UtilService.makeCopyOfJSONObject(componentState);
      var studentData = componentState.studentData;
      this.processConnectedComponentStudentData(studentData, connectedComponentParams);
      this.studentDataChanged();
    }
  }, {
    key: "handleAnimationConnectedComponentStudentDataChanged",
    value: function handleAnimationConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState) {
      if (componentState.t != null) {
        this.setVerticalPlotLine(componentState.t);
        this.drawGraph();
      }
    }
  }, {
    key: "handleNodeSubmit",
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
    key: "setupMouseMoveListener",
    value: function setupMouseMoveListener() {
      var _this6 = this;

      if (!this.setupMouseMoveListenerDone) {
        /*
         * Remove all existing listeners on the chart div to make sure we don't
         * bind a listener multiple times.
         */
        $('#' + this.chartId).unbind();
        $('#' + this.chartId).bind('mousedown', function (e) {
          _this6.mouseDown = true;

          _this6.mouseDownEventOccurred(e);
        });
        $('#' + this.chartId).bind('mouseup', function (e) {
          _this6.mouseDown = false;
        });
        $('#' + this.chartId).bind('mousemove', function (e) {
          if (_this6.mouseDown) {
            _this6.mouseDownEventOccurred(e);
          }
        });
        $('#' + this.chartId).bind('mouseleave', function (e) {
          _this6.mouseDown = false;
        });
        this.setupMouseMoveListenerDone = true;
      }
    }
    /**
     * The student has moved the mouse while holding the mouse button down.
     * @param e The mouse event.
     */

  }, {
    key: "mouseDownEventOccurred",
    value: function mouseDownEventOccurred(e) {
      /*
       * Firefox displays abnormal behavior when the student drags the plot line.
       * In Firefox, when the mouse is on top of the plot line, the event will
       * contain offset values relative to the plot line instead of relative to
       * the graph container. We always want the offset values relative to the
       * graph container so we will ignore events where the offset values are
       * relative to the plot line.
       */
      if (e.offsetX < 10 || e.offsetY < 10) {
        return;
      }

      var x = this.handleMouseDownXPosition(e);
      var y = this.handleMouseDownYPosition(e);

      if (this.componentContent.saveMouseOverPoints) {
        /*
         * Make sure we aren't saving the points too frequently. We want to avoid
         * saving too many unnecessary data points.
         */
        var currentTimestamp = new Date().getTime();
        /*
         * Make sure this many milliseconds has passed before saving another mouse
         * over point.
         */

        var timeBetweenSendingMouseOverPoints = 200;

        if (this.lastSavedMouseMoveTimestamp == null || currentTimestamp - this.lastSavedMouseMoveTimestamp > timeBetweenSendingMouseOverPoints) {
          this.addMouseOverPoint(x, y);
          this.studentDataChanged();
          this.lastSavedMouseMoveTimestamp = currentTimestamp;
        }
      }
    }
  }, {
    key: "handleMouseDownXPosition",
    value: function handleMouseDownXPosition(e) {
      var chart = $('#' + this.chartId).highcharts();
      var chartXAxis = chart.xAxis[0];
      var x = chartXAxis.toValue(e.offsetX, false);
      x = this.makeSureXIsWithinXMinMaxLimits(x);

      if (this.componentContent.showMouseXPlotLine) {
        this.showXPlotLine(x);
      }

      return x;
    }
  }, {
    key: "handleMouseDownYPosition",
    value: function handleMouseDownYPosition(e) {
      var chart = $('#' + this.chartId).highcharts();
      var chartYAxis = chart.yAxis[0];
      var y = chartYAxis.toValue(e.offsetY, false);
      y = this.makeSureYIsWithinYMinMaxLimits(y);

      if (this.componentContent.showMouseYPlotLine) {
        this.showYPlotLine(y);
      }

      return y;
    }
    /**
     * Show the vertical plot line at the given x.
     * @param x The x value to show the vertical line at.
     * @param text The text to show on the plot line.
     */

  }, {
    key: "showXPlotLine",
    value: function showXPlotLine(x, text) {
      var chart = $('#' + this.chartId).highcharts();
      var chartXAxis = chart.xAxis[0];
      chartXAxis.removePlotLine('plot-line-x');
      var plotLine = {
        value: x,
        color: 'red',
        width: 4,
        id: 'plot-line-x'
      };

      if (text != null && text !== '') {
        plotLine.label = {
          text: text,
          verticalAlign: 'top'
        };
      }

      chartXAxis.addPlotLine(plotLine);

      if (this.componentContent.highlightXRangeFromZero) {
        this.drawRangeRectangle(0, x, chart.yAxis[0].min, chart.yAxis[0].max);
      }
    }
    /**
     * Draw a rectangle on the graph. This is used for highlighting a range.
     * @param xMin The left x value in the graph x axis units.
     * @param xMax The right x value in the graph x axis units.
     * @param yMin The bottom y value in the graph y axis units.
     * @param yMax The top y value in the graph y axis units.
     * @param strokeColor The color of the border.
     * @param strokeWidth The width of the border.
     * @param fillColor The color inside the rectangle.
     * @param fillOpacity The opacity of the color inside the rectangle.
     */

  }, {
    key: "drawRangeRectangle",
    value: function drawRangeRectangle(xMin, xMax, yMin, yMax) {
      var strokeColor = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'black';
      var strokeWidth = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '.5';
      var fillColor = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'black';
      var fillOpacity = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '.1';
      this.createRectangleIfNecessary(strokeColor, strokeWidth, fillColor, fillOpacity);
      xMin = this.convertToXPixels(xMin);
      xMax = this.convertToXPixels(xMax);
      yMin = this.convertToYPixels(yMin);
      yMax = this.convertToYPixels(yMax);
      this.updateRectanglePositionAndSize(xMin, xMax, yMin, yMax);
    }
  }, {
    key: "convertToXPixels",
    value: function convertToXPixels(graphUnitValue) {
      var chart = $('#' + this.chartId).highcharts();
      return chart.xAxis[0].translate(graphUnitValue);
    }
  }, {
    key: "convertToYPixels",
    value: function convertToYPixels(graphUnitValue) {
      var chart = $('#' + this.chartId).highcharts();
      return chart.yAxis[0].translate(graphUnitValue);
    }
  }, {
    key: "createRectangleIfNecessary",
    value: function createRectangleIfNecessary(strokeColor, strokeWidth, fillColor, fillOpacity) {
      if (this.rectangle == null) {
        var chart = $('#' + this.chartId).highcharts();
        this.rectangle = chart.renderer.rect(0, 0, 0, 0, 0).css({
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: fillColor,
          fillOpacity: fillOpacity
        }).add();
      }
    }
  }, {
    key: "updateRectanglePositionAndSize",
    value: function updateRectanglePositionAndSize(xMin, xMax, yMin, yMax) {
      var chart = $('#' + this.chartId).highcharts();
      this.rectangle.attr({
        x: xMin + chart.plotLeft,
        y: chart.plotHeight + chart.plotTop - yMax,
        width: xMax - xMin,
        height: yMax - yMin
      });
    }
    /**
     * Show the horizontal plot line at the given y.
     * @param y The y value to show the horizontal line at.
     * @param text The text to show on the plot line.
     */

  }, {
    key: "showYPlotLine",
    value: function showYPlotLine(y, text) {
      var chart = $('#' + this.chartId).highcharts();
      var chartYAxis = chart.yAxis[0];
      chartYAxis.removePlotLine('plot-line-y');
      var plotLine = {
        value: y,
        color: 'red',
        width: 2,
        id: 'plot-line-y'
      };

      if (text != null && text !== '') {
        plotLine.label = {
          text: text,
          align: 'right'
        };
      }

      chartYAxis.addPlotLine(plotLine);
    }
  }, {
    key: "clearPlotLines",
    value: function clearPlotLines() {
      var chart = Highcharts.charts[0];
      var chartXAxis = chart.xAxis[0];
      chartXAxis.removePlotLine('plot-line-x');
      var chartYAxis = chart.yAxis[0];
      chartYAxis.removePlotLine('plot-line-y');
    }
    /**
     * If the x value is not within the x min and max limits, we will modify the x value to be at the
     * limit.
     * @param x the x value
     * @return an x value between the x min and max limits
     */

  }, {
    key: "makeSureXIsWithinXMinMaxLimits",
    value: function makeSureXIsWithinXMinMaxLimits(x) {
      if (x < this.xAxis.min) {
        x = this.xAxis.min;
      }

      if (x > this.xAxis.max) {
        x = this.xAxis.max;
      }

      return x;
    }
    /**
     * If the y value is not within the y min and max limits, we will modify the y value to be at the
     * limit.
     * @param y the y value
     * @return a y value between the y min and max limits
     */

  }, {
    key: "makeSureYIsWithinYMinMaxLimits",
    value: function makeSureYIsWithinYMinMaxLimits(y) {
      if (y < this.yAxis.min) {
        y = this.yAxis.min;
      }

      if (y > this.yAxis.max) {
        y = this.yAxis.max;
      }

      return y;
    }
    /**
     * Add a mouse over point to the array of student mouse over points.
     * @param x the x value in graph units
     * @param y the y value in graph units
     */

  }, {
    key: "addMouseOverPoint",
    value: function addMouseOverPoint(x, y) {
      this.mouseOverPoints.push([x, y]);
    }
    /**
     * @param useTimeout whether to call the drawGraphHelper() function in a timeout callback
     */

  }, {
    key: "drawGraph",
    value: function drawGraph(useTimeout) {
      var _this7 = this;

      var deferred = this.$q.defer();

      if (useTimeout) {
        /*
         * Clear the chart config so that the graph is completely refreshed. We need to do this
         * otherwise all the series will react to mouseover but we only want the active series to
         * react to mouseover.
         */
        this.clearChartConfig();
        /*
         * Call the setup graph helper after a timeout. this is required so that the graph is
         * completely refreshed so that only the active series will react to mouseover.
         */

        this.$timeout(function () {
          _this7.drawGraphHelper(deferred);
        });
      } else {
        this.drawGraphHelper(deferred);
      }

      return deferred.promise;
    }
    /**
     * @param deferred A promise that should be resolved after the graph is done rendering.
     */

  }, {
    key: "drawGraphHelper",
    value: function drawGraphHelper(deferred) {
      var _this8 = this;

      var title = this.componentContent.title;
      var xAxis = this.setupXAxis();
      var yAxis = this.setupYAxis();
      this.setupWidth();
      this.setupHeight();
      this.setupXAxisLimitSpacerWidth();
      var series = null;

      if (this.isTrialsEnabled()) {
        series = this.getSeriesFromTrials(this.trials);
        xAxis.plotBands = this.getPlotBandsFromTrials(this.trials);
      } else {
        series = this.getSeries();
      }

      if (this.activeSeries == null) {
        this.setDefaultActiveSeries();
      }

      if (this.isDisabled) {
        this.setCanEditForAllSeries(series, false);
      }

      this.showUndoButton = false;
      this.setAllSeriesFields(series);
      this.refreshSeriesIds(series);
      this.updateMinMaxAxisValues(series, xAxis, yAxis);

      if (this.plotLines != null) {
        xAxis.plotLines = this.plotLines;
      }

      var zoomType = this.getZoomType();
      this.chartConfig = this.createChartConfig(deferred, title, xAxis, yAxis, series, zoomType);

      if (this.componentContent.useCustomLegend) {
        // use a timeout so the graph has a chance to render before we set the custom legend
        this.$timeout(function () {
          _this8.setCustomLegend();
        });
      }

      return deferred.promise;
    }
  }, {
    key: "setupXAxis",
    value: function setupXAxis() {
      if (this.xAxis == null && this.componentContent.xAxis != null) {
        this.xAxis = this.UtilService.makeCopyOfJSONObject(this.componentContent.xAxis);
      }

      if (this.xAxis != null) {
        this.xAxis.allowDecimals = false;
        this.xAxis.plotBands = null;

        if (this.componentContent.xAxis != null && this.componentContent.xAxis.plotBands != null) {
          this.xAxis.plotBands = this.componentContent.xAxis.plotBands;
        }
      }

      return this.xAxis;
    }
  }, {
    key: "setupYAxis",
    value: function setupYAxis() {
      if (this.yAxis == null && this.componentContent.yAxis != null) {
        this.yAxis = this.UtilService.makeCopyOfJSONObject(this.componentContent.yAxis);
      }

      if (this.yAxis != null) {
        this.yAxis.allowDecimals = false;
      }

      return this.yAxis;
    }
  }, {
    key: "setupWidth",
    value: function setupWidth() {
      if (this.componentContent.width != null) {
        this.width = this.componentContent.width;
      }
    }
  }, {
    key: "setupHeight",
    value: function setupHeight() {
      if (this.componentContent.height != null) {
        this.height = this.componentContent.height;
      }
    }
  }, {
    key: "setupXAxisLimitSpacerWidth",
    value: function setupXAxisLimitSpacerWidth() {
      if (this.width > 100) {
        this.xAxisLimitSpacerWidth = this.width - 100;
      } else {
        this.xAxisLimitSpacerWidth = 0;
      }
    }
  }, {
    key: "getSeriesFromTrials",
    value: function getSeriesFromTrials(trials) {
      var series = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = trials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var trial = _step.value;

          if (trial.show) {
            series = series.concat(trial.series);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return series;
    }
  }, {
    key: "getPlotBandsFromTrials",
    value: function getPlotBandsFromTrials(trials) {
      var trialPlotBands = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = trials[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var trial = _step2.value;

          if (trial.show && trial.xAxis != null && trial.xAxis.plotBands != null) {
            trialPlotBands = trialPlotBands.concat(trial.xAxis.plotBands);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return trialPlotBands;
    }
  }, {
    key: "refreshSeriesIds",
    value: function refreshSeriesIds(series) {
      this.clearSeriesIds(series);
      this.setSeriesIds(series);
    }
  }, {
    key: "setAllSeriesFields",
    value: function setAllSeriesFields(series) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = series[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var singleSeries = _step3.value;
          this.setSingleSeriesFields(singleSeries);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "setSingleSeriesFields",
    value: function setSingleSeriesFields(singleSeries) {
      if (singleSeries.canEdit && this.isActiveSeries(singleSeries)) {
        if (this.graphType === 'line' || this.graphType === 'scatter') {
          singleSeries.draggableX = true;
        } else if (this.graphType === 'column') {
          singleSeries.draggableX = false;
        }

        singleSeries.draggableY = true;
        singleSeries.cursor = 'move';
        singleSeries.stickyTracking = false;
        singleSeries.shared = false;
        singleSeries.allowPointSelect = true;
        singleSeries.enableMouseTracking = true;
        this.showUndoButton = true;
      } else {
        singleSeries.draggableX = false;
        singleSeries.draggableY = false;
        singleSeries.stickyTracking = false;
        singleSeries.shared = false;
        singleSeries.allowPointSelect = false;
        singleSeries.enableMouseTracking = false;
      }

      if (singleSeries.allowPointMouseOver === true) {
        singleSeries.allowPointSelect = true;
        singleSeries.enableMouseTracking = true;
      }

      if (this.isMousePlotLineOn()) {
        singleSeries.enableMouseTracking = true;
      }
    }
  }, {
    key: "getZoomType",
    value: function getZoomType() {
      return this.mode === 'grading' || this.mode === 'gradingRevision' ? 'xy' : null;
    }
  }, {
    key: "clearChartConfig",
    value: function clearChartConfig() {
      this.chartConfig = {
        chart: {
          options: {
            chart: {}
          }
        }
      };
    }
  }, {
    key: "createChartConfig",
    value: function createChartConfig(deferred, title, xAxis, yAxis, series, zoomType) {
      var chartConfig = {
        options: {
          legend: {
            enabled: this.isLegendEnabled
          },
          tooltip: {
            formatter: this.createTooltipFormatter()
          },
          chart: {
            width: this.width,
            height: this.height,
            type: this.graphType,
            zoomType: zoomType,
            plotBackgroundImage: this.backgroundImage,
            events: {
              load: function load() {
                deferred.resolve(this);
              },
              click: this.createGraphClickHandler()
            }
          },
          plotOptions: {
            series: {
              dragSensitivity: 10,
              stickyTracking: false,
              events: {
                legendItemClick: this.createLegendItemClickHandler()
              },
              point: {
                events: {
                  drag: this.createPointDragEventHandler(),
                  drop: this.createPointDropEventHandler()
                }
              }
            }
          },
          exporting: {
            buttons: {
              contextButton: {
                enabled: false
              }
            }
          }
        },
        series: series,
        title: {
          text: title
        },
        xAxis: xAxis,
        yAxis: yAxis,
        loading: false,
        func: this.createGraphCallbackHandler()
      };
      return chartConfig;
    }
  }, {
    key: "createTooltipFormatter",
    value: function createTooltipFormatter() {
      var thisGraphController = this;
      return function () {
        var text = '';

        if (thisGraphController.isLimitXAxisType(thisGraphController.xAxis)) {
          text = thisGraphController.getSeriesText(this.series);
          var xText = thisGraphController.getXTextForLimitGraph(this.series, this.x);
          var yText = thisGraphController.getYTextForLimitGraph(this.series, this.y);
          text += thisGraphController.combineXTextAndYText(xText, yText);
        } else if (thisGraphController.isCategoriesXAxisType(thisGraphController.xAxis)) {
          text = thisGraphController.getSeriesText(this.series);

          var _xText = thisGraphController.getXTextForCategoriesGraph(this.point, this.x);

          var _yText = thisGraphController.getYTextForCategoriesGraph(this.y);

          text += _xText + ' ' + _yText;
        }

        if (thisGraphController.pointHasCustomTooltip(this.point)) {
          text += '<br/>' + this.point.tooltip;
        }

        return text;
      };
    }
  }, {
    key: "getXAxisUnits",
    value: function getXAxisUnits(series) {
      if (series.xAxis != null && series.xAxis.userOptions != null && series.xAxis.userOptions.units != null) {
        return series.xAxis.userOptions.units;
      } else {
        return '';
      }
    }
  }, {
    key: "getYAxisUnits",
    value: function getYAxisUnits(series) {
      if (series.yAxis != null && series.yAxis.userOptions != null && series.yAxis.userOptions.units != null) {
        return series.yAxis.userOptions.units;
      } else {
        return '';
      }
    }
  }, {
    key: "isLimitXAxisType",
    value: function isLimitXAxisType(xAxis) {
      return xAxis.type === 'limits';
    }
  }, {
    key: "isCategoriesXAxisType",
    value: function isCategoriesXAxisType(xAxis) {
      return xAxis.type === 'categories';
    }
  }, {
    key: "getSeriesText",
    value: function getSeriesText(series) {
      var text = '';

      if (series.name !== '') {
        text = '<b>' + series.name + '</b><br/>';
      }

      return text;
    }
  }, {
    key: "getXTextForLimitGraph",
    value: function getXTextForLimitGraph(series, x) {
      var text = this.performRounding(x);
      var xAxisUnits = this.getXAxisUnits(series);

      if (xAxisUnits != null && xAxisUnits !== '') {
        text += ' ' + xAxisUnits;
      }

      return text;
    }
  }, {
    key: "getYTextForLimitGraph",
    value: function getYTextForLimitGraph(series, y) {
      var text = this.performRounding(y);
      var yAxisUnits = this.getYAxisUnits(this.series);

      if (yAxisUnits != null && yAxisUnits !== '') {
        text += ' ' + yAxisUnits;
      }

      return text;
    }
  }, {
    key: "combineXTextAndYText",
    value: function combineXTextAndYText(xText, yText) {
      var text = xText;

      if (xText !== '') {
        text += ', ';
      }

      text += yText;
      return text;
    }
  }, {
    key: "getXTextForCategoriesGraph",
    value: function getXTextForCategoriesGraph(point, x) {
      var category = this.getCategoryByIndex(point.index);

      if (category != null) {
        return category;
      } else {
        return this.performRounding(x);
      }
    }
  }, {
    key: "getYTextForCategoriesGraph",
    value: function getYTextForCategoriesGraph(y) {
      return this.performRounding(y);
    }
  }, {
    key: "pointHasCustomTooltip",
    value: function pointHasCustomTooltip(point) {
      return point.tooltip != null && point.tooltip !== '';
    }
  }, {
    key: "createGraphClickHandler",
    value: function createGraphClickHandler() {
      var thisGraphController = this;
      return function (event) {
        if (thisGraphController.graphType === 'line' || thisGraphController.graphType === 'scatter') {
          if (thisGraphController.isIgnoreClickEvent()) {
            return;
          } else {
            thisGraphController.handleGraphClickEvent(event, this.series);
          }
        }
      };
    }
    /*
     * Check if the last drop event was within the last 100 milliseconds so we will not register the
     * click. We need to do this because when students drag points, a click event is fired when they
     * release the mouse button. we don't want that click event to create a new point so we need to
     * ignore it.
     */

  }, {
    key: "isIgnoreClickEvent",
    value: function isIgnoreClickEvent() {
      var currentTime = new Date().getTime();
      return this.lastDropTime != null && currentTime - this.lastDropTime < 100;
    }
  }, {
    key: "handleGraphClickEvent",
    value: function handleGraphClickEvent(event, series) {
      if (!this.isDisabled) {
        var activeSeries = this.activeSeries;

        if (activeSeries != null && this.canEdit(activeSeries)) {
          var activeSeriesId = activeSeries.id;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = series[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var singleSeries = _step4.value;

              if (activeSeriesId === singleSeries.options.id && !singleSeries.visible) {
                // the series is not visible so we will not add the point
                alert(this.$translate('graph.studentAddingPointToHiddenSeriesMessage'));
                return;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          var x = this.performRounding(event.xAxis[0].value);
          var y = this.performRounding(event.yAxis[0].value);
          this.addPointToSeries(activeSeries, x, y);
          this.addNextComponentStateToUndoStack = true;
          this.studentDataChanged();
        } else {
          if (!this.isMousePlotLineOn()) {
            // the student is trying to add a point to a series that can't be edited
            alert(this.$translate('graph.youCanNotEditThisSeriesPleaseChooseASeriesThatCanBeEdited'));
          }
        }
      }
    }
  }, {
    key: "createLegendItemClickHandler",
    value: function createLegendItemClickHandler() {
      var thisGraphController = this;
      return function (event) {
        var canHideSeries = thisGraphController.componentContent.canStudentHideSeriesOnLegendClick === true;

        if (canHideSeries) {
          /*
           * Update the show field in all the series depending on whether each line is active
           * in the legend.
           */
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this.yAxis.series[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var yAxisSeries = _step5.value;
              var series = thisGraphController.getSeriesById(yAxisSeries.userOptions.id);

              if (this.userOptions.id === series.id) {
                series.show = !yAxisSeries.visible;
              } else {
                series.show = yAxisSeries.visible;
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                _iterator5["return"]();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          thisGraphController.studentDataChanged();
        }

        return canHideSeries;
      };
    }
  }, {
    key: "createPointDragEventHandler",
    value: function createPointDragEventHandler() {
      var thisGraphController = this;
      return function (event) {
        if (!thisGraphController.isDisabled) {
          var activeSeries = thisGraphController.activeSeries;

          if (thisGraphController.canEdit(activeSeries)) {
            thisGraphController.dragging = true;
          }
        }
      };
    }
  }, {
    key: "createPointDropEventHandler",
    value: function createPointDropEventHandler() {
      var thisGraphController = this;
      return function (event) {
        // the student has stopped dragging the point and dropped the point
        if (!thisGraphController.isDisabled && thisGraphController.dragging) {
          var activeSeries = thisGraphController.activeSeries;
          thisGraphController.dragging = false;
          thisGraphController.lastDropTime = new Date().getTime();
          var target = event.target;
          var x = thisGraphController.performRounding(target.x);
          var y = thisGraphController.performRounding(target.y);
          var index = target.index;
          var data = activeSeries.data;

          if (thisGraphController.isLimitXAxisType(thisGraphController.xAxis)) {
            data[index] = [x, y];
          } else if (thisGraphController.isCategoriesXAxisType(thisGraphController.xAxis)) {
            data[index] = y;
          }

          thisGraphController.addNextComponentStateToUndoStack = true;
          thisGraphController.studentDataChanged();
        }
      };
    }
  }, {
    key: "createGraphCallbackHandler",
    value: function createGraphCallbackHandler() {
      var thisGraphController = this;
      return function (chart) {
        thisGraphController.$timeout(function () {
          thisGraphController.showXPlotLineIfOn('Drag Me');
          thisGraphController.showYPlotLineIfOn('Drag Me');

          if (thisGraphController.isMouseXPlotLineOn() || thisGraphController.isMouseYPlotLineOn() || thisGraphController.isSaveMouseOverPoints()) {
            thisGraphController.setupMouseMoveListener();
          }

          chart.reflow();
        }, 1000);
      };
    }
    /**
     * Overwrite the existing legend with the custom authored legend.
     */

  }, {
    key: "setCustomLegend",
    value: function setCustomLegend() {
      if (!this.hasCustomLegendBeenSet) {
        if ($('.highcharts-legend').length > 0) {
          // move the legend to the very left by setting the x position to 0
          var userAgent = navigator.userAgent;

          if (userAgent.indexOf('Firefox') !== -1) {
            /*
             * Regex to split the transform string into three groups. We will use
             * this to replace the x value of the translate.
             * Example
             * "translate(227, 294)"
             * The regex will create three groups
             * group 1 = "translate("
             * group 2 = "227"
             * group 3 = ", 294)"
             * The x value of the translate is captured in group 2.
             */
            var matrixRegEx = /(translate\()(\d*)(,\s*\d*\))/;
            var currentTransform = $('.highcharts-legend').attr('transform'); // replace the second group with 0

            var newTransform = currentTransform.replace(matrixRegEx, '$10$3');
            $('.highcharts-legend').attr('transform', newTransform);
          } else {
            /*
             * Regex to split the transform string into three groups. We will use
             * this to replace the x value of the matrix.
             * Example
             * "matrix(1, 0, 0, 1, 227, 294)"
             * The regex will create three groups
             * group 1 = "matrix(1, 0, 0, 1, "
             * group 2 = "227"
             * group 3 = ", 294)"
             * The x value of the matrix is captured in group 2.
             */
            var _matrixRegEx = /(matrix\(\d*,\s*\d*,\s*\d*,\s*\d*,\s*)(\d*)(,\s*\d*\))/;

            var _currentTransform = $('.highcharts-legend').css('transform'); // replace the second group with 0


            var _newTransform = _currentTransform.replace(_matrixRegEx, '$10$3');

            $('.highcharts-legend').css('transform', _newTransform);
          }

          $('.highcharts-legend').html(this.componentContent.customLegend);
        }

        this.hasCustomLegendBeenSet = true;
      }
    }
  }, {
    key: "addPointToSeries",
    value: function addPointToSeries(series, x, y) {
      var data = series.data;

      if (this.isCategoriesXAxisType(this.componentContent.xAxis)) {
        data[x] = y;
      } else {
        data.push([x, y]);
      }
    }
    /**
     * Remove a point from a series. We will remove all points that have the given x value.
     * @param series the series to remove the point from
     * @param x the x value of the point to remove
     */

  }, {
    key: "removePointFromSeries",
    value: function removePointFromSeries(series, x) {
      var data = series.data;

      for (var d = 0; d < data.length; d++) {
        var dataPoint = data[d];
        var tempDataXValue = dataPoint[0];

        if (x === tempDataXValue) {
          data.splice(d, 1);
          d--;
        }
      }
    }
  }, {
    key: "canEdit",
    value: function canEdit(series) {
      return series.canEdit;
    }
  }, {
    key: "setSeries",
    value: function setSeries(series) {
      this.series = series;
    }
  }, {
    key: "getSeries",
    value: function getSeries() {
      return this.series;
    }
  }, {
    key: "setSeriesByIndex",
    value: function setSeriesByIndex(series, index) {
      this.series[index] = series;
    }
  }, {
    key: "getSeriesByIndex",
    value: function getSeriesByIndex(index) {
      return this.series[index];
    }
  }, {
    key: "setTrials",
    value: function setTrials(trials) {
      this.trials = trials;
    }
  }, {
    key: "getTrials",
    value: function getTrials() {
      return this.trials;
    }
    /**
     * Get the index of the trial
     * @param trial the trial object
     * @return the index of the trial within the trials array
     */

  }, {
    key: "getTrialIndex",
    value: function getTrialIndex(trial) {
      for (var t = 0; t < this.trials.length; t++) {
        var tempTrial = this.trials[t];

        if (trial === tempTrial) {
          return t;
        }
      }

      return -1;
    }
  }, {
    key: "setActiveTrialByIndex",
    value: function setActiveTrialByIndex(index) {
      this.activeTrial = this.trials[index];
    }
  }, {
    key: "canEditTrial",
    value: function canEditTrial(trial) {
      var series = trial.series;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = series[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var singleSeries = _step6.value;

          if (singleSeries.canEdit) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
            _iterator6["return"]();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return false;
    }
    /**
     * Set whether to show the active trial select menu
     * @return whether to show the active trial select menu
     */

  }, {
    key: "showSelectActiveTrials",
    value: function showSelectActiveTrials() {
      var editableTrials = 0;
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.trials[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var trial = _step7.value;

          if (this.canEditTrial(trial) && trial.show) {
            editableTrials++;

            if (editableTrials > 1) {
              return true;
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
            _iterator7["return"]();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return false;
    }
  }, {
    key: "setXAxis",
    value: function setXAxis(xAxis) {
      this.xAxis = this.UtilService.makeCopyOfJSONObject(xAxis);
    }
  }, {
    key: "getXAxis",
    value: function getXAxis() {
      return this.xAxis;
    }
  }, {
    key: "setYAxis",
    value: function setYAxis(yAxis) {
      this.yAxis = this.UtilService.makeCopyOfJSONObject(yAxis);
    }
  }, {
    key: "getYAxis",
    value: function getYAxis() {
      return this.yAxis;
    }
  }, {
    key: "setActiveSeries",
    value: function setActiveSeries(series) {
      this.activeSeries = series;
    }
  }, {
    key: "setActiveSeriesByIndex",
    value: function setActiveSeriesByIndex(index) {
      var series = this.getSeriesByIndex(index);
      this.setActiveSeries(series);
    }
  }, {
    key: "resetGraph",
    value: function resetGraph() {
      this.setSeries(this.UtilService.makeCopyOfJSONObject(this.componentContent.series));

      if (this.componentContent.xAxis != null) {
        this.setXAxis(this.componentContent.xAxis);
      }

      if (this.componentContent.yAxis != null) {
        this.setYAxis(this.componentContent.yAxis);
      } // set the active series to null so that the default series will become selected later


      this.setActiveSeries(null);
      this.backgroundImage = this.componentContent.backgroundImage;
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();
    }
  }, {
    key: "resetSeries",
    value: function resetSeries() {
      var confirmMessage = '';
      var seriesName = this.activeSeries.name;

      if (seriesName === '') {
        confirmMessage = this.$translate('graph.areYouSureYouWantToResetTheSeries');
      } else {
        confirmMessage = this.$translate('graph.areYouSureYouWantToResetTheNamedSeries', {
          seriesName: seriesName
        });
      }

      if (confirm(confirmMessage)) {
        this.resetSeriesHelper();
      }
    }
  }, {
    key: "resetSeriesHelper",
    value: function resetSeriesHelper() {
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.newTrial();
        var isReset = true;
        this.handleConnectedComponents(isReset);
      } else {
        var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);
        var originalSeries = this.componentContent.series[activeSeriesIndex];

        if (originalSeries != null) {
          originalSeries = this.UtilService.makeCopyOfJSONObject(originalSeries);
          this.setSeriesByIndex(originalSeries, activeSeriesIndex);
          this.setActiveSeriesByIndex(activeSeriesIndex);

          if (this.componentContent.xAxis != null) {
            this.setXAxis(this.componentContent.xAxis);
          }

          if (this.componentContent.yAxis != null) {
            this.setYAxis(this.componentContent.yAxis);
          }

          this.backgroundImage = this.componentContent.backgroundImage;
          this.addNextComponentStateToUndoStack = true;
          this.studentDataChanged();
        }
      }
    }
  }, {
    key: "setStudentWork",
    value: function setStudentWork(componentState) {
      var studentData = componentState.studentData;

      if (this.isStudentDataVersion1(studentData.version)) {
        this.studentDataVersion = 1;
        this.setSeries(this.UtilService.makeCopyOfJSONObject(studentData.series));
      } else {
        this.studentDataVersion = studentData.version;

        if (studentData.trials != null && studentData.trials.length > 0) {
          var trialsCopy = this.UtilService.makeCopyOfJSONObject(studentData.trials);
          this.setTrials(trialsCopy);
          var activeTrialIndex = studentData.activeTrialIndex;

          if (activeTrialIndex == null) {
            if (trialsCopy.length > 0) {
              this.setActiveTrialByIndex(studentData.trials.length - 1);
            }
          } else {
            this.setActiveTrialByIndex(activeTrialIndex);
          }

          if (this.activeTrial != null && this.activeTrial.series != null) {
            this.series = this.activeTrial.series;
          }
        }
      }

      this.setTrialIdsToShow();

      if (studentData.xAxis != null) {
        this.setXAxis(studentData.xAxis);
      }

      if (studentData.yAxis != null) {
        this.setYAxis(studentData.yAxis);
      }

      this.setActiveSeriesByIndex(studentData.activeSeriesIndex);

      if (studentData.backgroundImage != null) {
        this.backgroundImage = studentData.backgroundImage;
      }

      var submitCounter = studentData.submitCounter;

      if (submitCounter != null) {
        this.submitCounter = submitCounter;
      }

      if (studentData.mouseOverPoints != null && studentData.mouseOverPoints.length > 0) {
        this.mouseOverPoints = studentData.mouseOverPoints;
      }

      this.processLatestStudentWork();
    }
  }, {
    key: "activeSeriesChanged",
    value: function activeSeriesChanged() {
      var useTimeoutSetupGraph = true;
      this.studentDataChanged(useTimeoutSetupGraph);
    }
  }, {
    key: "studentDataChanged",
    value: function studentDataChanged(useTimeoutSetupGraph) {
      var _this9 = this;

      this.isDirty = true;
      this.emitComponentDirty(true);
      this.isSubmitDirty = true;
      this.emitComponentSubmitDirty(true);
      this.clearSaveText();
      this.drawGraph(useTimeoutSetupGraph);
      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */

      var action = 'change';
      this.createComponentState(action).then(function (componentState) {
        if (_this9.addNextComponentStateToUndoStack) {
          if (_this9.previousComponentState != null) {
            _this9.undoStack.push(_this9.previousComponentState);
          }
          /*
           * Remember this current component state for the next time
           * studentDataChanged() is called. The next time
           * studentDataChanged() is called, this will be the previous
           * component state and we will add it to the undoStack. We do not
           * want to put the current component state onto the undoStack
           * because if the student clicks undo and this current component
           * state is on the top of the stack, the graph won't change.
           * Basically the undoStack contains the component states from the
           * current visit except for the current component state.
           */


          _this9.previousComponentState = componentState;
          _this9.addNextComponentStateToUndoStack = false;
        }
        /*
         * fire the componentStudentDataChanged event after a short timeout
         * so that the other component handleConnectedComponentStudentDataChanged()
         * listeners can initialize before this and are then able to process
         * this componentStudentDataChanged event
         */


        _this9.$timeout(function () {
          _this9.emitComponentStudentDataChanged(componentState);
        }, 100);
      });
    }
    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */

  }, {
    key: "createComponentState",
    value: function createComponentState(action) {
      var deferred = this.$q.defer();
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {};
      studentData.version = this.studentDataVersion;

      if (this.isStudentDataVersion1()) {
        studentData.series = this.UtilService.makeCopyOfJSONObject(this.getSeries());
      } else {
        if (this.trials != null) {
          studentData.trials = this.UtilService.makeCopyOfJSONObject(this.trials);
          var activeTrialIndex = this.getTrialIndex(this.activeTrial);
          studentData.activeTrialIndex = activeTrialIndex;
        }
      }

      studentData.xAxis = this.UtilService.makeCopyOfJSONObject(this.getXAxis());
      delete studentData.xAxis.plotBands;

      if (this.componentContent.xAxis != null && this.componentContent.xAxis.plotBands != null) {
        studentData.xAxis.plotBands = this.componentContent.xAxis.plotBands;
      }

      studentData.yAxis = this.getYAxis();
      var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);

      if (activeSeriesIndex != null) {
        studentData.activeSeriesIndex = activeSeriesIndex;
      }

      var uploadedFileName = this.getUploadedFileName();

      if (uploadedFileName != null) {
        studentData.uploadedFileName = uploadedFileName;
      }

      if (this.backgroundImage != null) {
        studentData.backgroundImage = this.backgroundImage;
      }

      studentData.submitCounter = this.submitCounter;

      if (this.mouseOverPoints.length !== 0) {
        studentData.mouseOverPoints = this.mouseOverPoints;
      }

      componentState.isSubmit = this.isSubmit;
      componentState.studentData = studentData;
      componentState.componentType = 'Graph';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      this.isSubmit = false;
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }
    /**
     * Perform any additional processing that is required before returning the component state
     * Note: this function must call deferred.resolve() otherwise student work will not be saved
     * @param deferred a deferred object
     * @param componentState the component state
     * @param action the action that we are creating the component state for
     * e.g. 'submit', 'save', 'change'
     */

  }, {
    key: "createComponentStateAdditionalProcessing",
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
      if (this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)) {
        var additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(this.nodeId, this.componentId);
        var allPromises = [];
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = additionalProcessingFunctions[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var additionalProcessingFunction = _step8.value;
            var defer = this.$q.defer();
            var promise = defer.promise;
            allPromises.push(promise);
            additionalProcessingFunction(defer, componentState, action);
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
              _iterator8["return"]();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        this.$q.all(allPromises).then(function () {
          deferred.resolve(componentState);
        });
      } else {
        deferred.resolve(componentState);
      }
    }
  }, {
    key: "showPrompt",
    value: function showPrompt() {
      return this.isPromptVisible === true;
    }
  }, {
    key: "showResetGraphButton",
    value: function showResetGraphButton() {
      return this.isResetGraphButtonVisible === true;
    }
  }, {
    key: "showResetSeriesButton",
    value: function showResetSeriesButton() {
      return this.isResetSeriesButtonVisible === true;
    }
  }, {
    key: "getSeriesIndex",
    value: function getSeriesIndex(series) {
      var multipleSeries = this.getSeries();

      for (var s = 0; s < multipleSeries.length; s++) {
        var singleSeries = multipleSeries[s];

        if (series === singleSeries) {
          return s;
        }
      }

      return null;
    }
  }, {
    key: "getSeriesByIndex",
    value: function getSeriesByIndex(index) {
      var series = this.getSeries();
      return series[index];
    }
  }, {
    key: "getSeriesById",
    value: function getSeriesById(id) {
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this.getSeries()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var singleSeries = _step9.value;

          if (singleSeries.id === id) {
            return singleSeries;
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
            _iterator9["return"]();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      return null;
    }
    /**
     * Get the trials from classmates
     * @param nodeId the node id
     * @param componentId the component id
     * @param showClassmateWorkSource Whether to get the work only from the
     * period the student is in or from all the periods. The possible values
     * are "period" or "class".
     * @return a promise that will return all the trials from the classmates
     */

  }, {
    key: "getTrialsFromClassmates",
    value: function getTrialsFromClassmates(nodeId, componentId, periodId) {
      var _this10 = this;

      var deferred = this.$q.defer();
      this.StudentDataService.getClassmateStudentWork(nodeId, componentId, periodId).then(function (componentStates) {
        var promises = [];
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = componentStates[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var componentState = _step10.value;
            promises.push(_this10.getTrialsFromComponentState(nodeId, componentId, componentState));
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
              _iterator10["return"]();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        _this10.$q.all(promises).then(function (promiseResults) {
          var mergedTrials = [];
          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = promiseResults[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var trials = _step11.value;
              var _iteratorNormalCompletion12 = true;
              var _didIteratorError12 = false;
              var _iteratorError12 = undefined;

              try {
                for (var _iterator12 = trials[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                  var trial = _step12.value;
                  mergedTrials.push(trial);
                }
              } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
                    _iterator12["return"]();
                  }
                } finally {
                  if (_didIteratorError12) {
                    throw _iteratorError12;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
                _iterator11["return"]();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }

          deferred.resolve(mergedTrials);
        });
      });
      return deferred.promise;
    }
    /**
     * Get the trials from a component state.
     * Note: The code in this function doesn't actually require usage of a
     * promise. It's just the code that calls this function that utilizes
     * promise functionality. It's possible to refactor the code so that this
     * function doesn't need to return a promise.
     * @param nodeId the node id
     * @param componentId the component id
     * @param componentState the component state
     * @return a promise that will return the trials from the component state
     */

  }, {
    key: "getTrialsFromComponentState",
    value: function getTrialsFromComponentState(nodeId, componentId, componentState) {
      var deferred = this.$q.defer();
      var mergedTrials = [];
      var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
      var studentData = componentState.studentData;

      if (this.isStudentDataVersion1(studentData.version)) {
        var series = studentData.series;
        var newTrial = {
          id: this.UtilService.generateKey(10),
          name: nodePositionAndTitle,
          show: true,
          series: series
        };
        mergedTrials.push(newTrial);
      } else {
        var trials = studentData.trials;

        if (trials != null) {
          var _iteratorNormalCompletion13 = true;
          var _didIteratorError13 = false;
          var _iteratorError13 = undefined;

          try {
            for (var _iterator13 = trials[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
              var trial = _step13.value;

              var _newTrial = this.UtilService.makeCopyOfJSONObject(trial);

              _newTrial.name = nodePositionAndTitle;
              _newTrial.show = true;
              mergedTrials.push(_newTrial);
            }
          } catch (err) {
            _didIteratorError13 = true;
            _iteratorError13 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
                _iterator13["return"]();
              }
            } finally {
              if (_didIteratorError13) {
                throw _iteratorError13;
              }
            }
          }
        }
      }

      deferred.resolve(mergedTrials);
      return deferred.promise;
    }
    /**
     * Handle importing external data (we only support csv for now)
     * @param studentAsset CSV file student asset
     */

  }, {
    key: "attachStudentAsset",
    value: function attachStudentAsset(studentAsset) {
      var _this11 = this;

      this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
        _this11.StudentAssetService.getAssetContent(copiedAsset).then(function (assetContent) {
          var rowData = _this11.StudentDataService.CSVToArray(assetContent);

          var params = {
            skipFirstRow: true,
            xColumn: 0,
            yColumn: 1
          };

          var seriesData = _this11.convertRowDataToSeriesData(rowData, params);

          var newSeriesIndex = _this11.series.length;
          var series = {
            name: copiedAsset.fileName,
            color: _this11.seriesColors[newSeriesIndex],
            marker: {
              'symbol': _this11.seriesMarkers[newSeriesIndex]
            },
            canEdit: false
          };
          _this11.series[newSeriesIndex] = series;
          series.data = seriesData;
          _this11.isDirty = true;
          _this11.addNextComponentStateToUndoStack = true;

          _this11.studentDataChanged();
        });
      });
    }
    /**
     * Convert the table data into series data
     * @param componentState the component state to get table data from
     * @param params (optional) the params to specify what columns
     * and rows to use from the table data
     */

  }, {
    key: "convertRowDataToSeriesData",
    value: function convertRowDataToSeriesData(rows, params) {
      var data = [];
      var skipFirstRow = this.getSkipFirstRowValue(params);
      var xColumn = this.getXColumnValue(params);
      var yColumn = this.getYColumnValue(params);

      for (var r = 0; r < rows.length; r++) {
        if (skipFirstRow && r === 0) {
          continue;
        }

        var row = rows[r];
        var xCell = row[xColumn];
        var yCell = row[yColumn];

        if (xCell != null && yCell != null) {
          this.addPointFromTableIntoData(xCell, yCell, data);
        }
      }

      return data;
    }
  }, {
    key: "getSkipFirstRowValue",
    value: function getSkipFirstRowValue(params) {
      if (params == null) {
        return false;
      } else {
        return params.skipFirstRow;
      }
    }
  }, {
    key: "getXColumnValue",
    value: function getXColumnValue(params) {
      if (params == null || params.xColumn == null) {
        return 0;
      } else {
        return params.xColumn;
      }
    }
  }, {
    key: "getYColumnValue",
    value: function getYColumnValue(params) {
      if (params == null || params.yColumn == null) {
        return 1;
      } else {
        return params.yColumn;
      }
    }
  }, {
    key: "addPointFromTableIntoData",
    value: function addPointFromTableIntoData(xCell, yCell, data) {
      var xText = xCell.text;
      var yText = yCell.text;

      if (xText != null && xText !== '' && yText != null && yText !== '') {
        var xNumber = Number(xText);
        var yNumber = Number(yText);
        var point = [];

        if (!isNaN(xNumber)) {
          point.push(xNumber);
        } else {
          point.push(xText);
        }

        if (!isNaN(yNumber)) {
          point.push(yNumber);
        } else {
          point.push(yText);
        }

        data.push(point);
      }
    }
  }, {
    key: "setSeriesIds",
    value: function setSeriesIds(allSeries) {
      var usedSeriesIds = this.getAllUsedSeriesIds(allSeries);
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = allSeries[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var singleSeries = _step14.value;

          if (singleSeries.id == null) {
            var nextSeriesId = this.getNextSeriesId(usedSeriesIds);
            singleSeries.id = nextSeriesId;
            usedSeriesIds.push(nextSeriesId);
          }
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
            _iterator14["return"]();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }
    }
  }, {
    key: "getAllUsedSeriesIds",
    value: function getAllUsedSeriesIds(allSeries) {
      var usedSeriesIds = [];
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = allSeries[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var singleSeries = _step15.value;
          usedSeriesIds.push(singleSeries.id);
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
            _iterator15["return"]();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      return usedSeriesIds;
    }
    /**
     * Get the next available series id
     * @param usedSeriesIds an array of used series ids
     * @returns the next available series id
     */

  }, {
    key: "getNextSeriesId",
    value: function getNextSeriesId(usedSeriesIds) {
      var nextSeriesId = null;
      var currentSeriesNumber = 0;
      var foundNextSeriesId = false;

      while (!foundNextSeriesId) {
        var tempSeriesId = 'series-' + currentSeriesNumber;

        if (usedSeriesIds.indexOf(tempSeriesId) === -1) {
          nextSeriesId = tempSeriesId;
          foundNextSeriesId = true;
        } else {
          currentSeriesNumber++;
        }
      }

      return nextSeriesId;
    }
  }, {
    key: "handleDeleteKeyPressed",
    value: function handleDeleteKeyPressed() {
      var series = this.activeSeries;

      if (this.canEdit(series)) {
        var chart = $('#' + this.chartId).highcharts();
        var selectedPoints = chart.getSelectedPoints();
        var index = null;

        if (selectedPoints != null) {
          var indexesToDelete = [];
          var data = series.data;
          var _iteratorNormalCompletion16 = true;
          var _didIteratorError16 = false;
          var _iteratorError16 = undefined;

          try {
            for (var _iterator16 = selectedPoints[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
              var selectedPoint = _step16.value;
              index = selectedPoint.index;
              var dataPoint = data[index];

              if (dataPoint != null) {
                /*
                 * make sure the x and y values match the selected point
                 * that we are going to delete
                 */
                if (dataPoint[0] === selectedPoint.x || dataPoint[1] === selectedPoint.y) {
                  indexesToDelete.push(index);
                }
              }
            }
            /*
             * order the array from largest to smallest. we are doing this
             * so that we delete the points from the end first. if we delete
             * points starting from lower indexes first, then the indexes
             * will shift and we will end up deleting the wrong points.
             */

          } catch (err) {
            _didIteratorError16 = true;
            _iteratorError16 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
                _iterator16["return"]();
              }
            } finally {
              if (_didIteratorError16) {
                throw _iteratorError16;
              }
            }
          }

          indexesToDelete.sort().reverse(); // loop through all the indexes and remove them from the series data

          for (var i = 0; i < indexesToDelete.length; i++) {
            data.splice(indexesToDelete[i], 1);
          }

          this.addNextComponentStateToUndoStack = true;
          this.studentDataChanged();
        }
      }
    }
  }, {
    key: "createNewSeries",
    value: function createNewSeries() {
      return {
        name: '',
        data: [],
        marker: {
          symbol: 'circle'
        },
        canEdit: true
      };
    }
  }, {
    key: "isActiveSeries",
    value: function isActiveSeries(series) {
      var seriesIndex = this.getSeriesIndex(series);
      return this.isActiveSeriesIndex(seriesIndex);
    }
  }, {
    key: "isActiveSeriesIndex",
    value: function isActiveSeriesIndex(seriesIndex) {
      return this.series.indexOf(this.activeSeries) === seriesIndex;
    }
  }, {
    key: "isShowSelectSeriesInput",
    value: function isShowSelectSeriesInput() {
      return this.trialIdsToShow.length && this.hasEditableSeries() && this.isSelectSeriesVisible && this.series.length > 1;
    }
  }, {
    key: "newTrialButtonClicked",
    value: function newTrialButtonClicked() {
      this.newTrial();
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();
    }
  }, {
    key: "newTrial",
    value: function newTrial() {
      var activeSeriesIndex = this.getSeriesIndex(this.activeSeries);
      var trialNumbers = this.getTrialNumbers();
      var maxTrialNumber = 0;

      if (trialNumbers.length > 0) {
        maxTrialNumber = trialNumbers[trialNumbers.length - 1];
      }

      if (this.hideAllTrialsOnNewTrial) {
        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = this.trials[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var _trial = _step17.value;
            _trial.show = false;
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
              _iterator17["return"]();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }
      }

      var series = this.UtilService.makeCopyOfJSONObject(this.componentContent.series);
      var trial = {
        name: this.$translate('graph.trial') + ' ' + (maxTrialNumber + 1),
        series: series,
        show: true,
        id: this.UtilService.generateKey(10)
      };
      this.trials.push(trial);
      this.activeTrial = trial;
      this.series = series;

      if (this.activeSeries == null) {
        this.setDefaultActiveSeries();
      } else {
        this.setActiveSeriesByIndex(activeSeriesIndex);
      }

      this.setTrialIdsToShow();
    }
  }, {
    key: "getTrialNumbers",
    value: function getTrialNumbers() {
      var trialNumbers = [];
      var trialNumberRegex = /Trial (\d*)/;
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = this.trials[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var trial = _step18.value;
          var tempTrialName = trial.name;
          var match = trialNumberRegex.exec(tempTrialName);

          if (match != null && match.length > 0) {
            var tempTrialNumber = match[1];
            trialNumbers.push(parseInt(tempTrialNumber));
          }
        }
      } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion18 && _iterator18["return"] != null) {
            _iterator18["return"]();
          }
        } finally {
          if (_didIteratorError18) {
            throw _iteratorError18;
          }
        }
      }

      trialNumbers.sort();
      return trialNumbers;
    }
  }, {
    key: "deleteTrial",
    value: function deleteTrial(trialIndex) {
      var trialToRemove = this.trials[trialIndex];
      var trialToRemoveId = trialToRemove.id;
      this.trials.splice(trialIndex, 1);

      for (var t = 0; t < this.trialIdsToShow.length; t++) {
        if (trialToRemoveId === this.trialIdsToShow[t]) {
          this.trialIdsToShow.splice(t, 1);
        }
      }

      if (this.trials.length === 0) {
        // there are no more trials so we will create a new empty trial
        this.newTrial();
        this.setXAxis(this.componentContent.xAxis);
        this.setYAxis(this.componentContent.yAxis);
      } else if (this.trials.length > 0) {
        if (trialToRemove === this.activeTrial) {
          this.makeHighestTrialActive();
        }
      }

      this.setTrialIdsToShow();
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();
      this.selectedTrialsText = this.getSelectedTrialsText();
    }
  }, {
    key: "makeHighestTrialActive",
    value: function makeHighestTrialActive() {
      this.activeTrial = null;
      this.activeSeries = null;
      this.series = [];
      var highestTrial = this.getHighestTrial();

      if (highestTrial != null) {
        var seriesIndex = this.getSeriesIndex(this.activeSeries);
        this.activeTrial = highestTrial;
        this.setSeries(this.activeTrial.series);

        if (seriesIndex != null) {
          this.setActiveSeriesByIndex(seriesIndex);
        }
      }
    }
  }, {
    key: "getHighestTrial",
    value: function getHighestTrial() {
      var highestTrialIndex = null;
      var highestTrial = null;
      var _iteratorNormalCompletion19 = true;
      var _didIteratorError19 = false;
      var _iteratorError19 = undefined;

      try {
        for (var _iterator19 = this.trialIdsToShow[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
          var trialId = _step19.value;
          var trial = this.getTrialById(trialId);
          var trialIndex = this.getTrialIndex(trial);

          if (highestTrialIndex == null || trialIndex > highestTrialIndex) {
            highestTrialIndex = trialIndex;
            highestTrial = trial;
          }
        }
      } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion19 && _iterator19["return"] != null) {
            _iterator19["return"]();
          }
        } finally {
          if (_didIteratorError19) {
            throw _iteratorError19;
          }
        }
      }

      return highestTrial;
    }
  }, {
    key: "activeTrialChanged",
    value: function activeTrialChanged() {
      var seriesIndex = this.getSeriesIndex(this.activeSeries);
      var activeTrial = this.activeTrial;
      this.series = activeTrial.series;
      this.setActiveSeriesByIndex(seriesIndex);
      this.addNextComponentStateToUndoStack = true;
      this.studentDataChanged();
    }
  }, {
    key: "trialIdsToShowChanged",
    value: function trialIdsToShowChanged() {
      this.showOrHideTrials(this.trialIdsToShow);
      this.setActiveTrialAndSeriesByTrialIdsToShow(this.trialIdsToShow); // hack: for some reason, the ids to show model gets out of sync when deleting a trial, for example
      // TODO: figure out why this check is sometimes necessary and remove

      for (var a = 0; a < this.trialIdsToShow.length; a++) {
        var idToShow = this.trialIdsToShow[a];

        if (!this.getTrialById(idToShow)) {
          this.trialIdsToShow.splice(a, 1);
        }
      }
      /*
       * Make sure the trialIdsToShow has actually changed. Sometimes
       * trialIdsToShowChanged() gets called even if trialIdsToShow
       * does not change because the model for the trial checkbox
       * select is graphController.trials. This means trialIdsToShowChanged()
       * will be called when we replace the trials in createComponentState()
       * but this does not necessarily mean the trialIdsToShow has changed.
       * We do this check to minimize the number of times studentDataChanged()
       * is called.
       */


      if (!this.UtilService.arraysContainSameValues(this.previousTrialIdsToShow, this.trialIdsToShow)) {
        this.trialIdsToShow = this.trialIdsToShow;
        this.studentDataChanged();
      }
      /*
       * Remember the trial ids to show so we can use it to make sure the
       * trialIdsToShow actually change the next time trialIdsToShowChanged()
       * is called.
       */


      this.previousTrialIdsToShow = this.UtilService.makeCopyOfJSONObject(this.trialIdsToShow);
      this.selectedTrialsText = this.getSelectedTrialsText();
    }
  }, {
    key: "showOrHideTrials",
    value: function showOrHideTrials(trialIdsToShow) {
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = this.trials[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var trial = _step20.value;

          if (trialIdsToShow.indexOf(trial.id) !== -1) {
            trial.show = true;
          } else {
            trial.show = false;

            if (this.activeTrial != null && this.activeTrial.id === trial.id) {
              this.activeTrial = null;
              this.activeSeries = null;
              this.series = [];
            }
          }
        }
      } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion20 && _iterator20["return"] != null) {
            _iterator20["return"]();
          }
        } finally {
          if (_didIteratorError20) {
            throw _iteratorError20;
          }
        }
      }
    }
  }, {
    key: "setActiveTrialAndSeriesByTrialIdsToShow",
    value: function setActiveTrialAndSeriesByTrialIdsToShow(trialIdsToShow) {
      if (trialIdsToShow.length > 0) {
        var lastShownTrialId = trialIdsToShow[trialIdsToShow.length - 1];
        var lastShownTrial = this.getTrialById(lastShownTrialId);

        if (this.hasEditableSeries(lastShownTrial.series)) {
          this.activeTrial = lastShownTrial;
          var seriesIndex = this.getSeriesIndex(this.activeSeries);

          if (!this.isSeriesEditable(this.activeTrial.series, seriesIndex)) {
            seriesIndex = this.getLatestEditableSeriesIndex(this.activeTrial.series);
          }

          this.setSeries(this.activeTrial.series);

          if (seriesIndex != null) {
            this.setActiveSeriesByIndex(seriesIndex);
          }
        }
      }
    }
  }, {
    key: "isSeriesEditable",
    value: function isSeriesEditable(multipleSeries, index) {
      if (multipleSeries[index] != null) {
        return multipleSeries[index].canEdit;
      }

      return false;
    }
  }, {
    key: "getLatestEditableSeriesIndex",
    value: function getLatestEditableSeriesIndex(multipleSeries) {
      for (var s = multipleSeries.length - 1; s >= 0; s--) {
        if (multipleSeries[s].canEdit) {
          return s;
        }
      }

      return null;
    }
  }, {
    key: "setTrialIdsToShow",
    value: function setTrialIdsToShow() {
      var idsToShow = [];
      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = this.trials[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          var trial = _step21.value;

          if (trial.show) {
            idsToShow.push(trial.id);
          }
        }
      } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion21 && _iterator21["return"] != null) {
            _iterator21["return"]();
          }
        } finally {
          if (_didIteratorError21) {
            throw _iteratorError21;
          }
        }
      }

      this.trialIdsToShow = idsToShow;
    }
  }, {
    key: "getSelectedTrialsText",
    value: function getSelectedTrialsText() {
      if (this.trialIdsToShow.length === 1) {
        var id = this.trialIdsToShow[0];
        return this.getTrialById(id).name;
      } else if (this.trialIdsToShow.length > 1) {
        return this.trialIdsToShow.length + ' ' + this.$translate('graph.trialsShown');
      } else {
        return this.$translate('graph.selectTrialsToShow');
      }
    }
    /**
     * Process the student data that we have received from a connected component.
     * @param studentData The student data from a connected component.
     * @param params The connected component params.
     */

  }, {
    key: "processConnectedComponentStudentData",
    value: function processConnectedComponentStudentData(studentData, params) {
      if (params.fields == null) {
        /*
         * we do not need to look at specific fields so we will directly
         * parse the the trial data from the student data.
         */
        this.parseLatestTrial(studentData, params);
      } else {
        // we need to process specific fields in the student data
        var _iteratorNormalCompletion22 = true;
        var _didIteratorError22 = false;
        var _iteratorError22 = undefined;

        try {
          for (var _iterator22 = params.fields[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
            var field = _step22.value;
            var name = field.name;
            var when = field.when;
            var action = field.action;
            var firstTime = false;

            if (when === 'firstTime' && firstTime === true) {
              if (action === 'write') {// TODO
              } else if (action === 'read') {// TODO
              }
            } else if (when === 'always') {
              if (action === 'write') {// TODO
              } else if (action === 'read') {
                this.readConnectedComponentFieldFromStudentData(studentData, params, name);
              }
            }
          }
        } catch (err) {
          _didIteratorError22 = true;
          _iteratorError22 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion22 && _iterator22["return"] != null) {
              _iterator22["return"]();
            }
          } finally {
            if (_didIteratorError22) {
              throw _iteratorError22;
            }
          }
        }
      }
    }
    /**
     * Read the field from the new student data and perform any processing on our
     * existing student data based upon the new student data.
     * @param studentData The new student data from the connected component.
     * @param params The connected component params.
     * @param name The field name to read and process.
     */

  }, {
    key: "readConnectedComponentFieldFromStudentData",
    value: function readConnectedComponentFieldFromStudentData(studentData, params, name) {
      if (name === 'selectedCells') {
        // only show the trials that are specified in the selectedCells array
        var selectedCells = studentData[name];

        if (selectedCells != null) {
          var selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
          var _iteratorNormalCompletion23 = true;
          var _didIteratorError23 = false;
          var _iteratorError23 = undefined;

          try {
            for (var _iterator23 = this.trials[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
              var trial = _step23.value;

              if (selectedTrialIds.includes(trial.id)) {
                trial.show = true;
              } else {
                trial.show = false;
              }
            }
          } catch (err) {
            _didIteratorError23 = true;
            _iteratorError23 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion23 && _iterator23["return"] != null) {
                _iterator23["return"]();
              }
            } finally {
              if (_didIteratorError23) {
                throw _iteratorError23;
              }
            }
          }
        }
      } else if (name === 'trial') {
        this.parseLatestTrial(studentData, params);
      } else if (name === 'trialIdsToDelete') {
        this.deleteTrialsByTrialId(studentData.trialIdsToDelete);
      }
    }
    /**
     * Delete the trials
     * @param trialIdsToDelete An array of trial ids to delete
     */

  }, {
    key: "deleteTrialsByTrialId",
    value: function deleteTrialsByTrialId(trialIdsToDelete) {
      if (trialIdsToDelete != null) {
        var _iteratorNormalCompletion24 = true;
        var _didIteratorError24 = false;
        var _iteratorError24 = undefined;

        try {
          for (var _iterator24 = trialIdsToDelete[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
            var trialIdToDelete = _step24.value;
            this.deleteTrialId(trialIdToDelete);
          }
        } catch (err) {
          _didIteratorError24 = true;
          _iteratorError24 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion24 && _iterator24["return"] != null) {
              _iterator24["return"]();
            }
          } finally {
            if (_didIteratorError24) {
              throw _iteratorError24;
            }
          }
        }
      }
    }
    /**
     * Delete a trial
     * @param trialId The trial id string to delete
     */

  }, {
    key: "deleteTrialId",
    value: function deleteTrialId(trialId) {
      for (var t = 0; t < this.trials.length; t++) {
        var trial = this.trials[t];

        if (trial.id === trialId) {
          this.trials.splice(t, 1);
          break;
        }
      }
    }
    /**
     * Parse the latest trial and set it into the component
     * @param studentData the student data object that has a trials field
     * @param params (optional) parameters that specify what to use from the
     * student data
     */

  }, {
    key: "parseLatestTrial",
    value: function parseLatestTrial(studentData, params) {
      var latestStudentDataTrial = this.getLatestStudentDataTrial(studentData);
      var latestStudentDataTrialId = latestStudentDataTrial.id;
      this.removeDefaultTrialIfNecessary(latestStudentDataTrialId);
      var latestTrial = this.createNewTrialIfNecessary(latestStudentDataTrialId);
      this.copySeriesIntoTrial(latestStudentDataTrial, latestTrial, studentData, params);
      this.copyTrialNameIntoTrial(latestStudentDataTrial, latestTrial);
      this.copyPlotBandsIntoTrial(latestStudentDataTrial, latestTrial);
      this.setLastTrialToActive();

      if (studentData.xPlotLine != null) {
        this.showXPlotLine(studentData.xPlotLine);
      }

      this.setTrialIdsToShow();
      this.activeTrialChanged();
    }
  }, {
    key: "getLatestStudentDataTrial",
    value: function getLatestStudentDataTrial(studentData) {
      var latestStudentDataTrial = null;

      if (studentData.trial != null) {
        latestStudentDataTrial = studentData.trial;
      }

      if (studentData.trials != null && studentData.trials.length > 0) {
        latestStudentDataTrial = studentData.trials[studentData.trials.length - 1];
      }

      return latestStudentDataTrial;
    }
  }, {
    key: "hideAllTrials",
    value: function hideAllTrials() {
      var _iteratorNormalCompletion25 = true;
      var _didIteratorError25 = false;
      var _iteratorError25 = undefined;

      try {
        for (var _iterator25 = this.trials[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
          var trial = _step25.value;
          trial.show = false;
        }
      } catch (err) {
        _didIteratorError25 = true;
        _iteratorError25 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion25 && _iterator25["return"] != null) {
            _iterator25["return"]();
          }
        } finally {
          if (_didIteratorError25) {
            throw _iteratorError25;
          }
        }
      }
    }
  }, {
    key: "createNewTrial",
    value: function createNewTrial(id) {
      return {
        id: id,
        name: '',
        series: [],
        show: true
      };
    }
  }, {
    key: "copySeries",
    value: function copySeries(series) {
      var newSeries = {
        name: series.name,
        data: series.data,
        color: series.color,
        canEdit: false,
        allowPointSelect: false
      };

      if (series.marker != null) {
        newSeries.marker = series.marker;
      }

      if (series.dashStyle != null) {
        newSeries.dashStyle = series.dashStyle;
      }

      if (series.allowPointMouseOver != null) {
        newSeries.allowPointMouseOver = series.allowPointMouseOver;
      }

      return newSeries;
    }
  }, {
    key: "removeDefaultTrialIfNecessary",
    value: function removeDefaultTrialIfNecessary(latestStudentDataTrialId) {
      /*
       * remove the first default trial that is automatically created
       * when the student first visits the component otherwise there
       * will be a blank trial.
       */
      if (this.trials.length > 0) {
        var firstTrial = this.trials[0];
        /*
         * check if the trial has any series. if the trial doesn't
         * have any series it means it was automatically created by
         * the component.
         */

        if (this.isTrialHasEmptySeries(firstTrial)) {
          if (firstTrial.id == null || firstTrial.id !== latestStudentDataTrialId) {
            this.deleteFirstTrial(this.trials);
          }
        }
      }
    }
  }, {
    key: "isTrialHasEmptySeries",
    value: function isTrialHasEmptySeries(trial) {
      return trial.series == null || trial.series.length === 0 || this.isSeriesEmpty(trial.series);
    }
  }, {
    key: "isSeriesEmpty",
    value: function isSeriesEmpty(series) {
      return series.length === 1 && series[0].data.length === 0;
    }
  }, {
    key: "deleteFirstTrial",
    value: function deleteFirstTrial(trials) {
      trials.shift();
    }
  }, {
    key: "createNewTrialIfNecessary",
    value: function createNewTrialIfNecessary(trialId) {
      var trial = this.getTrialById(trialId);

      if (trial == null) {
        if (this.hideAllTrialsOnNewTrial) {
          this.hideAllTrials();
        }

        trial = this.createNewTrial(trialId);
        trial.show = true;
        this.setXAxis(this.componentContent.xAxis);
        this.setYAxis(this.componentContent.yAxis);
        this.trials.push(trial);
      }

      return trial;
    }
  }, {
    key: "copySeriesIntoTrial",
    value: function copySeriesIntoTrial(oldTrial, newTrial, studentData, params) {
      var _this12 = this;

      newTrial.series = [];
      var series = oldTrial.series;

      for (var s = 0; s < series.length; s++) {
        if (this.isAddSeries(params, s)) {
          newTrial.series.push(this.copySeries(series[s]));

          if (params.highlightLatestPoint) {
            this.$timeout(function () {
              _this12.highlightPointOnX(studentData.trial.id, studentData.xPointToHighlight);
            }, 1);
          }
        }
      }
    }
  }, {
    key: "isAddSeries",
    value: function isAddSeries(params, seriesIndex) {
      return params == null || params.seriesNumbers == null || params.seriesNumbers.length === 0 || params.seriesNumbers != null && params.seriesNumbers.indexOf(seriesIndex) !== -1;
    }
  }, {
    key: "copyTrialNameIntoTrial",
    value: function copyTrialNameIntoTrial(oldTrial, newTrial) {
      if (oldTrial.name != null) {
        newTrial.name = oldTrial.name;
      }
    }
  }, {
    key: "copyPlotBandsIntoTrial",
    value: function copyPlotBandsIntoTrial(oldTrial, newTrial) {
      if (oldTrial.xAxis != null && oldTrial.xAxis.plotBands != null) {
        if (newTrial.xAxis == null) {
          newTrial.xAxis = {};
        }

        newTrial.xAxis.plotBands = oldTrial.xAxis.plotBands;
      }
    }
  }, {
    key: "setLastTrialToActive",
    value: function setLastTrialToActive() {
      if (this.trials.length > 0) {
        this.activeTrial = this.trials[this.trials.length - 1];
        this.activeTrial.show = true;
      }
    }
  }, {
    key: "getTrialById",
    value: function getTrialById(id) {
      var _iteratorNormalCompletion26 = true;
      var _didIteratorError26 = false;
      var _iteratorError26 = undefined;

      try {
        for (var _iterator26 = this.trials[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
          var trial = _step26.value;

          if (trial.id === id) {
            return trial;
          }
        }
      } catch (err) {
        _didIteratorError26 = true;
        _iteratorError26 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion26 && _iterator26["return"] != null) {
            _iterator26["return"]();
          }
        } finally {
          if (_didIteratorError26) {
            throw _iteratorError26;
          }
        }
      }

      return null;
    }
  }, {
    key: "hasEditableSeries",
    value: function hasEditableSeries() {
      var series = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getSeries();
      var _iteratorNormalCompletion27 = true;
      var _didIteratorError27 = false;
      var _iteratorError27 = undefined;

      try {
        for (var _iterator27 = series[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
          var singleSeries = _step27.value;

          if (singleSeries.canEdit) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError27 = true;
        _iteratorError27 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion27 && _iterator27["return"] != null) {
            _iterator27["return"]();
          }
        } finally {
          if (_didIteratorError27) {
            throw _iteratorError27;
          }
        }
      }

      return false;
    }
    /**
     * Update the x and y axis min and max values if necessary to make sure
     * all points are visible in the graph view.
     * @param series the an array of series
     * @param xAxis the x axis object
     * @param yAxis the y axis object
     */

  }, {
    key: "updateMinMaxAxisValues",
    value: function updateMinMaxAxisValues(series, xAxis, yAxis) {
      var minMaxValues = this.getMinMaxValues(series);
      this.updateXAxisMinMaxIfNecessary(xAxis, minMaxValues);
      this.updateYAxisMinMaxIfNecessary(yAxis, minMaxValues);
    }
  }, {
    key: "updateXAxisMinMaxIfNecessary",
    value: function updateXAxisMinMaxIfNecessary(xAxis, minMaxValues) {
      if (xAxis != null && !xAxis.locked) {
        if (minMaxValues.xMin < xAxis.min) {
          // set the value to null so highcharts will automatically set the value
          xAxis.min = null;
          xAxis.minPadding = 0.2;
        }

        if (minMaxValues.xMax >= xAxis.max) {
          // set the value to null so highcharts will automatically set the value
          xAxis.max = null;
          xAxis.maxPadding = 0.2;
        }
      }
    }
  }, {
    key: "updateYAxisMinMaxIfNecessary",
    value: function updateYAxisMinMaxIfNecessary(yAxis, minMaxValues) {
      if (yAxis != null && !yAxis.locked) {
        if (minMaxValues.yMin < yAxis.min) {
          // set the value to null so highcharts will automatically set the value
          yAxis.min = null;
          yAxis.minPadding = 0.2;
        }

        if (minMaxValues.yMax >= yAxis.max) {
          // set the value to null so highcharts will automatically set the value
          yAxis.max = null;
          yAxis.maxPadding = 0.2;
        }
      }
    }
  }, {
    key: "getMinMaxValues",
    value: function getMinMaxValues(series) {
      var xMin = 0;
      var xMax = 0;
      var yMin = 0;
      var yMax = 0;
      var _iteratorNormalCompletion28 = true;
      var _didIteratorError28 = false;
      var _iteratorError28 = undefined;

      try {
        for (var _iterator28 = series[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
          var singleSeries = _step28.value;
          var data = singleSeries.data;
          var _iteratorNormalCompletion29 = true;
          var _didIteratorError29 = false;
          var _iteratorError29 = undefined;

          try {
            for (var _iterator29 = data[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
              var dataPoint = _step29.value;

              if (dataPoint != null) {
                var tempX = null;
                var tempY = null;

                if (dataPoint.constructor.name === 'Object') {
                  tempX = dataPoint.x;
                  tempY = dataPoint.y;
                } else if (dataPoint.constructor.name === 'Array') {
                  tempX = dataPoint[0];
                  tempY = dataPoint[1];
                } else if (dataPoint.constructor.name === 'Number') {
                  tempY = dataPoint;
                }

                if (tempX > xMax) {
                  xMax = tempX;
                }

                if (tempX < xMin) {
                  xMin = tempX;
                }

                if (tempY > yMax) {
                  yMax = tempY;
                }

                if (tempY < yMin) {
                  yMin = tempY;
                }
              }
            }
          } catch (err) {
            _didIteratorError29 = true;
            _iteratorError29 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion29 && _iterator29["return"] != null) {
                _iterator29["return"]();
              }
            } finally {
              if (_didIteratorError29) {
                throw _iteratorError29;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError28 = true;
        _iteratorError28 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion28 && _iterator28["return"] != null) {
            _iterator28["return"]();
          }
        } finally {
          if (_didIteratorError28) {
            throw _iteratorError28;
          }
        }
      }

      var result = {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
      };
      return result;
    }
  }, {
    key: "clearSeriesIds",
    value: function clearSeriesIds(series) {
      var _iteratorNormalCompletion30 = true;
      var _didIteratorError30 = false;
      var _iteratorError30 = undefined;

      try {
        for (var _iterator30 = series[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
          var singleSeries = _step30.value;
          singleSeries.id = null;
        }
      } catch (err) {
        _didIteratorError30 = true;
        _iteratorError30 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion30 && _iterator30["return"] != null) {
            _iterator30["return"]();
          }
        } finally {
          if (_didIteratorError30) {
            throw _iteratorError30;
          }
        }
      }
    }
  }, {
    key: "snipGraph",
    value: function snipGraph($event) {
      var _this13 = this;

      var chart = $('#' + this.chartId).highcharts();
      var svgString = chart.getSVG();
      var hiddenCanvas = document.getElementById(this.hiddenCanvasId);
      (0, _canvg["default"])(hiddenCanvas, svgString, {
        renderCallback: function renderCallback() {
          var base64Image = hiddenCanvas.toDataURL('image/png');

          var imageObject = _this13.UtilService.getImageObjectFromBase64String(base64Image);

          _this13.NotebookService.addNote($event, imageObject);
        }
      });
    }
  }, {
    key: "readCSVIntoActiveSeries",
    value: function readCSVIntoActiveSeries(csvString) {
      var lines = csvString.split(/\r\n|\n/);
      this.activeSeries.data = [];
      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = lines[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          var line = _step31.value;
          var values = line.split(',');
          var x = parseFloat(values[0]);
          var y = parseFloat(values[1]);

          if (!isNaN(x) && !isNaN(y)) {
            var dataPoint = [x, y];
            this.activeSeries.data.push(dataPoint);
          }
        }
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31["return"] != null) {
            _iterator31["return"]();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }
    }
  }, {
    key: "setUploadedFileName",
    value: function setUploadedFileName(fileName) {
      this.uploadedFileName = fileName;
    }
  }, {
    key: "getUploadedFileName",
    value: function getUploadedFileName() {
      return this.uploadedFileName;
    }
    /**
     * Convert all the data points in the series
     * @param series convert the data points in the series
     * @param xAxisType the new x axis type to convert to
     */

  }, {
    key: "convertSeriesDataPoints",
    value: function convertSeriesDataPoints(series, xAxisType) {
      var data = series.data;
      var convertedData = [];

      for (var d = 0; d < data.length; d++) {
        var oldDataPoint = data[d];

        if (xAxisType == null || xAxisType === '' || xAxisType === 'limits') {
          if (!Array.isArray(oldDataPoint)) {
            convertedData.push([d + 1, oldDataPoint]);
          } else {
            convertedData.push(oldDataPoint);
          }
        } else if (xAxisType === 'categories') {
          if (Array.isArray(oldDataPoint)) {
            convertedData.push(oldDataPoint[1]);
          } else {
            convertedData.push(oldDataPoint);
          }
        }
      }

      series.data = convertedData;
    }
    /**
     * Round the number according to the authoring settings
     * @param number a number
     * @return the rounded number
     */

  }, {
    key: "performRounding",
    value: function performRounding(number) {
      if (this.componentContent.roundValuesTo === 'integer') {
        number = this.roundToNearestInteger(number);
      } else if (this.componentContent.roundValuesTo === 'tenth') {
        number = this.roundToNearestTenth(number);
      } else if (this.componentContent.roundValuesTo === 'hundredth') {
        number = this.roundToNearestHundredth(number);
      }

      return number;
    }
  }, {
    key: "roundToNearestInteger",
    value: function roundToNearestInteger(x) {
      x = parseFloat(x);
      x = Math.round(x);
      return x;
    }
  }, {
    key: "roundToNearestTenth",
    value: function roundToNearestTenth(x) {
      x = parseFloat(x);
      x = Math.round(x * 10) / 10;
      return x;
    }
  }, {
    key: "roundToNearestHundredth",
    value: function roundToNearestHundredth(x) {
      x = parseFloat(x);
      x = Math.round(x * 100) / 100;
      return x;
    }
    /**
     * Set the active series to the first series that the student can edit
     * or if there are no series the student can edit, set the active series
     * to the first series.
     */

  }, {
    key: "setDefaultActiveSeries",
    value: function setDefaultActiveSeries() {
      for (var s = 0; s < this.series.length; s++) {
        var singleSeries = this.series[s];

        if (singleSeries.canEdit) {
          this.setActiveSeriesByIndex(s);
          break;
        }
      }

      if (this.activeSeries == null && this.series.length > 0) {
        /*
         * we did not find any series that the student can edit so we will
         * just set the active series to be the first series
         */
        this.setActiveSeriesByIndex(0);
      }
    }
  }, {
    key: "setVerticalPlotLine",
    value: function setVerticalPlotLine(x) {
      var _this14 = this;

      var plotLine = {
        color: 'red',
        width: 2,
        value: x,
        zIndex: 5
      };
      this.plotLines = [plotLine];
      /*
       * Call $apply() so that the red plot line position gets updated. If we
       * don't call this, the line position won't get updated unless the student
       * moves their mouse around which forces angular to update.
       */

      this.$timeout(function () {
        _this14.$scope.$apply();
      });
    }
    /**
     * Import any work we need from connected components
     * @param {boolean} isReset (optional) Whether this function call was
     * triggered by the student clicking the reset button.
     */

  }, {
    key: "handleConnectedComponents",
    value: function handleConnectedComponents(isReset) {
      /*
       * This will hold all the promises that will return the trials that we want. The trials will
       * either be from this student or from classmates.
       */
      var promises = [];
      /*
       * this will end up containing the background from the last
       * connected component
       */

      var connectedComponentBackgroundImage = null;
      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = this.componentContent.connectedComponents[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          var connectedComponent = _step32.value;
          var type = connectedComponent.type;

          if (type === 'showClassmateWork') {
            connectedComponentBackgroundImage = this.handleShowClassmateWorkConnectedComponent(connectedComponent, promises);
          } else if (type === 'showWork' || type === 'importWork' || type == null) {
            connectedComponentBackgroundImage = this.handleShowOrImportWorkConnectedComponent(connectedComponent, promises);
          }
        }
        /*
         * wait for all the promises to resolve because we may need to request the classmate work from
         * the server
         */

      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32["return"] != null) {
            _iterator32["return"]();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }

      this.$q.all(promises).then(this.handleConnectedComponentPromiseResults(connectedComponentBackgroundImage, isReset));
    }
  }, {
    key: "handleShowClassmateWorkConnectedComponent",
    value: function handleShowClassmateWorkConnectedComponent(connectedComponent, promises) {
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;
      var connectedComponentBackgroundImage = null;
      this.isDisabled = true;

      if (this.ConfigService.isPreview()) {
        var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

        if (latestComponentState != null) {
          promises.push(this.getTrialsFromComponentState(nodeId, componentId, latestComponentState));

          if (latestComponentState != null && latestComponentState.studentData != null && latestComponentState.studentData.backgroundImage != null) {
            connectedComponentBackgroundImage = latestComponentState.studentData.backgroundImage;
          }
        }
      } else {
        var periodId = null;

        if (connectedComponent.showClassmateWorkSource === 'period') {
          periodId = this.ConfigService.getPeriodId();
        }

        promises.push(this.getTrialsFromClassmates(nodeId, componentId, periodId));
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
        component = this.ProjectService.injectAssetPaths(component);
        connectedComponentBackgroundImage = component.backgroundImage;
      }

      return connectedComponentBackgroundImage;
    }
  }, {
    key: "handleShowOrImportWorkConnectedComponent",
    value: function handleShowOrImportWorkConnectedComponent(connectedComponent, promises) {
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;
      var connectedComponentBackgroundImage = null;
      var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

      if (latestComponentState != null) {
        if (latestComponentState.componentType === 'ConceptMap' || latestComponentState.componentType === 'Draw' || latestComponentState.componentType === 'Label') {
          var connectedComponentOfComponentState = this.UtilService.getConnectedComponentByComponentState(this.componentContent, latestComponentState);

          if (connectedComponentOfComponentState.importWorkAsBackground === true) {
            promises.push(this.setComponentStateAsBackgroundImage(latestComponentState));
          }
        } else {
          if (connectedComponent.type === 'showWork') {
            latestComponentState = this.UtilService.makeCopyOfJSONObject(latestComponentState);
            var canEdit = false;
            this.setCanEditForAllSeriesInComponentState(latestComponentState, canEdit);
          }

          promises.push(this.getTrialsFromComponentState(nodeId, componentId, latestComponentState));

          if (latestComponentState != null && latestComponentState.studentData != null && latestComponentState.studentData.backgroundImage != null) {
            connectedComponentBackgroundImage = latestComponentState.studentData.backgroundImage;
          }
        }
      }

      return connectedComponentBackgroundImage;
    }
  }, {
    key: "handleConnectedComponentPromiseResults",
    value: function handleConnectedComponentPromiseResults(connectedComponentBackgroundImage, isReset) {
      var _this15 = this;

      return function (promiseResults) {
        /*
         * First we will accumulate all the trials into one new component state and then we will
         * perform connected component processing.
         */
        var mergedTrials = [];
        /*
         * Loop through all the promise results. There will be a promise result for each component we
         * are importing from. Each promiseResult is an array of trials or an image url.
         */

        var trialCount = 0;
        var activeTrialIndex = 0;
        var activeSeriesIndex = 0;
        var _iteratorNormalCompletion33 = true;
        var _didIteratorError33 = false;
        var _iteratorError33 = undefined;

        try {
          for (var _iterator33 = promiseResults[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
            var promiseResult = _step33.value;

            if (promiseResult instanceof Array) {
              var trials = promiseResult;
              var _iteratorNormalCompletion34 = true;
              var _didIteratorError34 = false;
              var _iteratorError34 = undefined;

              try {
                for (var _iterator34 = trials[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
                  var trial = _step34.value;

                  if (_this15.canEditTrial(trial)) {
                    activeTrialIndex = trialCount;
                  }

                  mergedTrials.push(trial);
                  trialCount++;
                }
              } catch (err) {
                _didIteratorError34 = true;
                _iteratorError34 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion34 && _iterator34["return"] != null) {
                    _iterator34["return"]();
                  }
                } finally {
                  if (_didIteratorError34) {
                    throw _iteratorError34;
                  }
                }
              }
            } else if (typeof promiseResult === 'string') {
              connectedComponentBackgroundImage = promiseResult;
            }
          }
        } catch (err) {
          _didIteratorError33 = true;
          _iteratorError33 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion33 && _iterator33["return"] != null) {
              _iterator33["return"]();
            }
          } finally {
            if (_didIteratorError33) {
              throw _iteratorError33;
            }
          }
        }

        activeTrialIndex = _this15.addTrialFromThisComponentIfNecessary(mergedTrials, trialCount, activeTrialIndex);

        var newComponentState = _this15.NodeService.createNewComponentState();

        newComponentState.studentData = {
          trials: mergedTrials,
          activeTrialIndex: activeTrialIndex,
          activeSeriesIndex: activeSeriesIndex,
          version: 2
        };

        if (_this15.componentContent.backgroundImage != null && _this15.componentContent.backgroundImage !== '') {
          newComponentState.studentData.backgroundImage = _this15.componentContent.backgroundImage;
        } else if (connectedComponentBackgroundImage != null) {
          newComponentState.studentData.backgroundImage = connectedComponentBackgroundImage;
        }

        newComponentState = _this15.handleConnectedComponentsHelper(newComponentState, isReset);

        _this15.setStudentWork(newComponentState);

        _this15.studentDataChanged();
      };
    }
  }, {
    key: "addTrialFromThisComponentIfNecessary",
    value: function addTrialFromThisComponentIfNecessary(mergedTrials, trialCount, activeTrialIndex) {
      if (this.componentContent.series.length > 0) {
        var trial = this.createNewTrial(this.UtilService.generateKey(10));
        trial.name = this.$translate('graph.trial') + ' ' + trialCount;
        trial.series = this.UtilService.makeCopyOfJSONObject(this.componentContent.series);
        mergedTrials.push(trial);

        if (this.canEditTrial(trial)) {
          activeTrialIndex = trialCount;
        }
      }

      return activeTrialIndex;
    }
    /**
     * Create an image from a component state and set the image as the background.
     * @param componentState A component state.
     * @return A promise that returns the url of the image that is generated from the component state.
     */

  }, {
    key: "setComponentStateAsBackgroundImage",
    value: function setComponentStateAsBackgroundImage(componentState) {
      return this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        return image.url;
      });
    }
    /**
     * Perform additional connected component processing.
     * @param newComponentState The new component state generated by accumulating the trials from all
     * the connected component student data.
     */

  }, {
    key: "handleConnectedComponentsHelper",
    value: function handleConnectedComponentsHelper(newComponentState, isReset) {
      var mergedComponentState = this.$scope.componentState;
      var firstTime = true;

      if (mergedComponentState == null || isReset || !this.GraphService.componentStateHasStudentWork(mergedComponentState)) {
        mergedComponentState = newComponentState;
      } else {
        /*
         * This component has previous student data so this is not the first time this component is
         * being loaded.
         */
        firstTime = false;
      }

      var _iteratorNormalCompletion35 = true;
      var _didIteratorError35 = false;
      var _iteratorError35 = undefined;

      try {
        for (var _iterator35 = this.componentContent.connectedComponents[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
          var connectedComponent = _step35.value;
          var nodeId = connectedComponent.nodeId;
          var componentId = connectedComponent.componentId;
          var type = connectedComponent.type;

          if (type === 'showClassmateWork') {
            mergedComponentState = newComponentState;
          } else if (type === 'importWork' || type == null) {
            var connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
            var fields = connectedComponent.fields;

            if (connectedComponentState != null) {
              if (connectedComponentState.componentType !== 'Graph') {
                mergedComponentState = this.mergeComponentState(mergedComponentState, connectedComponentState, fields, firstTime);
              }
            } else {
              mergedComponentState = this.mergeNullComponentState(mergedComponentState, fields, firstTime);
            }
          }
        }
      } catch (err) {
        _didIteratorError35 = true;
        _iteratorError35 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion35 && _iterator35["return"] != null) {
            _iterator35["return"]();
          }
        } finally {
          if (_didIteratorError35) {
            throw _iteratorError35;
          }
        }
      }

      if (mergedComponentState.studentData.version == null) {
        mergedComponentState.studentData.version = this.studentDataVersion;
      }

      if (newComponentState.studentData.backgroundImage != null) {
        mergedComponentState.studentData.backgroundImage = newComponentState.studentData.backgroundImage;
      }

      return mergedComponentState;
    }
    /**
     * Merge the component state from the connected component into the component
     * state from this component.
     * @param baseComponentState The component state from this component.
     * @param connectedComponentState The component state from the connected component.
     * @param mergeFields (optional) An array of objects that specify which fields
     * to look at in the connectedComponentState. Each object can contain 3 fields which
     * are "name", "when", "action".
     * - "name" is the name of the field in the connectedComponentState.studentData object
     *   For example, if connectedComponentState is from a Graph component, we may author the value to be "trials"
     * - "when" possible values
     *     "firstTime" means we merge the "name" field only the first time we visit the component
     *     "always" means we merge the "name" field every time we visit the component
     * - "action" possible values
     *     "read" means we look at the value of the "name" field and perform processing on it to generate
     *       some value that we will set into the baseComponentState
     *     "write" means we copy the value of the "name" field from connectedComponentState.studentData to
     *       baseComponentState.studentData
     * @param firstTime Whether this is the first time this component is being
     * visited.
     * @return The merged component state.
     */

  }, {
    key: "mergeComponentState",
    value: function mergeComponentState(baseComponentState, connectedComponentState, mergeFields, firstTime) {
      if (mergeFields == null) {
        if (connectedComponentState.componentType === 'Graph' && firstTime) {
          // there are no merge fields specified so we will get all of the fields
          baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(connectedComponentState.studentData);
        }
      } else {
        // we will merge specific fields
        var _iteratorNormalCompletion36 = true;
        var _didIteratorError36 = false;
        var _iteratorError36 = undefined;

        try {
          for (var _iterator36 = mergeFields[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
            var mergeField = _step36.value;
            var name = mergeField.name;
            var when = mergeField.when;
            var action = mergeField.action;

            if (when === 'firstTime' && firstTime) {
              if (action === 'write') {
                baseComponentState.studentData[name] = connectedComponentState.studentData[name];
              } else if (action === 'read') {// TODO
              }
            } else if (when === 'always') {
              if (action === 'write') {
                baseComponentState.studentData[name] = connectedComponentState.studentData[name];
              } else if (action === 'read') {
                this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
              }
            }
          }
        } catch (err) {
          _didIteratorError36 = true;
          _iteratorError36 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion36 && _iterator36["return"] != null) {
              _iterator36["return"]();
            }
          } finally {
            if (_didIteratorError36) {
              throw _iteratorError36;
            }
          }
        }
      }

      return baseComponentState;
    }
    /**
     * We want to merge the component state from the connected component into this
     * component but the connected component does not have any work. We will
     * instead use default values.
     * @param baseComponentState The component state from this component.
     * @param mergeFields (optional) An array of objects that specify which fields
     * to look at. (see comment for mergeComponentState() for more information).
     * @param firstTime Whether this is the first time this component is being
     * visited.
     * @return The merged component state.
     */

  }, {
    key: "mergeNullComponentState",
    value: function mergeNullComponentState(baseComponentState, mergeFields, firstTime) {
      if (mergeFields == null) {// TODO
      } else {
        var _iteratorNormalCompletion37 = true;
        var _didIteratorError37 = false;
        var _iteratorError37 = undefined;

        try {
          for (var _iterator37 = mergeFields[Symbol.iterator](), _step37; !(_iteratorNormalCompletion37 = (_step37 = _iterator37.next()).done); _iteratorNormalCompletion37 = true) {
            var mergeField = _step37.value;
            var name = mergeField.name;
            var when = mergeField.when;
            var action = mergeField.action;

            if (when === 'firstTime' && firstTime == true) {
              if (action === 'write') {// TODO
              } else if (action === 'read') {// TODO
              }
            } else if (when === 'always') {
              if (action === 'write') {// TODO
              } else if (action === 'read') {
                var connectedComponentState = null;
                this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
              }
            }
          }
        } catch (err) {
          _didIteratorError37 = true;
          _iteratorError37 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion37 && _iterator37["return"] != null) {
              _iterator37["return"]();
            }
          } finally {
            if (_didIteratorError37) {
              throw _iteratorError37;
            }
          }
        }
      }

      return baseComponentState;
    }
    /**
     * Read the field from the connected component's component state.
     * @param baseComponentState The component state from this component.
     * @param connectedComponentState The component state from the connected component.
     * @param field The field to look at in the connected component's component
     * state.
     */

  }, {
    key: "readConnectedComponentField",
    value: function readConnectedComponentField(baseComponentState, connectedComponentState, field) {
      if (field === 'selectedCells') {
        if (connectedComponentState == null) {
          // we will default to hide all the trials
          var _iteratorNormalCompletion38 = true;
          var _didIteratorError38 = false;
          var _iteratorError38 = undefined;

          try {
            for (var _iterator38 = baseComponentState.studentData.trials[Symbol.iterator](), _step38; !(_iteratorNormalCompletion38 = (_step38 = _iterator38.next()).done); _iteratorNormalCompletion38 = true) {
              var trial = _step38.value;
              trial.show = false;
            }
          } catch (err) {
            _didIteratorError38 = true;
            _iteratorError38 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion38 && _iterator38["return"] != null) {
                _iterator38["return"]();
              }
            } finally {
              if (_didIteratorError38) {
                throw _iteratorError38;
              }
            }
          }
        } else {
          // loop through all the trials and show the ones that are in the selected cells array
          var studentData = connectedComponentState.studentData;
          var selectedCells = studentData[field];
          var selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
          var _iteratorNormalCompletion39 = true;
          var _didIteratorError39 = false;
          var _iteratorError39 = undefined;

          try {
            for (var _iterator39 = baseComponentState.studentData.trials[Symbol.iterator](), _step39; !(_iteratorNormalCompletion39 = (_step39 = _iterator39.next()).done); _iteratorNormalCompletion39 = true) {
              var _trial2 = _step39.value;

              if (selectedTrialIds.includes(_trial2.id)) {
                _trial2.show = true;
              } else {
                _trial2.show = false;
              }
            }
          } catch (err) {
            _didIteratorError39 = true;
            _iteratorError39 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion39 && _iterator39["return"] != null) {
                _iterator39["return"]();
              }
            } finally {
              if (_didIteratorError39) {
                throw _iteratorError39;
              }
            }
          }
        }
      } else if (field === 'trial') {// TODO
      }
    }
  }, {
    key: "setCanEditForAllSeriesInComponentState",
    value: function setCanEditForAllSeriesInComponentState(componentState, canEdit) {
      var _iteratorNormalCompletion40 = true;
      var _didIteratorError40 = false;
      var _iteratorError40 = undefined;

      try {
        for (var _iterator40 = componentState.studentData.trials[Symbol.iterator](), _step40; !(_iteratorNormalCompletion40 = (_step40 = _iterator40.next()).done); _iteratorNormalCompletion40 = true) {
          var trial = _step40.value;
          this.setCanEditForAllSeries(trial.series, canEdit);
        }
      } catch (err) {
        _didIteratorError40 = true;
        _iteratorError40 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion40 && _iterator40["return"] != null) {
            _iterator40["return"]();
          }
        } finally {
          if (_didIteratorError40) {
            throw _iteratorError40;
          }
        }
      }
    }
  }, {
    key: "setCanEditForAllSeries",
    value: function setCanEditForAllSeries(series, canEdit) {
      var _iteratorNormalCompletion41 = true;
      var _didIteratorError41 = false;
      var _iteratorError41 = undefined;

      try {
        for (var _iterator41 = series[Symbol.iterator](), _step41; !(_iteratorNormalCompletion41 = (_step41 = _iterator41.next()).done); _iteratorNormalCompletion41 = true) {
          var singleSeries = _step41.value;
          singleSeries.canEdit = canEdit;
        }
      } catch (err) {
        _didIteratorError41 = true;
        _iteratorError41 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion41 && _iterator41["return"] != null) {
            _iterator41["return"]();
          }
        } finally {
          if (_didIteratorError41) {
            throw _iteratorError41;
          }
        }
      }
    }
  }, {
    key: "undoClicked",
    value: function undoClicked() {
      if (this.undoStack.length > 0) {
        var previousComponentState = this.undoStack.pop();
        this.setStudentWork(previousComponentState);
        this.previousComponentState = previousComponentState;
        this.drawGraph();
      } else if (this.initialComponentState == null) {
        this.previousComponentState = null;
        this.trials = [];
        this.newTrial();
        this.resetSeriesHelper();
        this.drawGraph();
      }
    }
  }, {
    key: "trialCheckboxClicked",
    value: function trialCheckboxClicked() {
      this.addNextComponentStateToUndoStack = true;
    }
  }, {
    key: "getCategoryByIndex",
    value: function getCategoryByIndex(index) {
      if (this.componentContent.xAxis != null && this.componentContent.xAxis.categories != null && index < this.componentContent.xAxis.categories.length) {
        return this.componentContent.xAxis.categories[index];
      }

      return null;
    }
  }, {
    key: "isMousePlotLineOn",
    value: function isMousePlotLineOn() {
      return this.isMouseXPlotLineOn() || this.isMouseYPlotLineOn();
    }
  }, {
    key: "isMouseXPlotLineOn",
    value: function isMouseXPlotLineOn() {
      return this.componentContent.showMouseXPlotLine;
    }
  }, {
    key: "isMouseYPlotLineOn",
    value: function isMouseYPlotLineOn() {
      return this.componentContent.showMouseYPlotLine;
    }
  }, {
    key: "isSaveMouseOverPoints",
    value: function isSaveMouseOverPoints() {
      return this.componentContent.saveMouseOverPoints;
    }
  }, {
    key: "getXValueFromDataPoint",
    value: function getXValueFromDataPoint(dataPoint) {
      if (dataPoint.constructor.name === 'Object') {
        return dataPoint.x;
      } else if (dataPoint.constructor.name === 'Array') {
        return dataPoint[0];
      }

      return null;
    }
  }, {
    key: "getYValueFromDataPoint",
    value: function getYValueFromDataPoint(dataPoint) {
      if (dataPoint.constructor.name === 'Object') {
        return dataPoint.y;
      } else if (dataPoint.constructor.name === 'Array') {
        return dataPoint[1];
      }

      return null;
    }
  }, {
    key: "getLatestMouseOverPointX",
    value: function getLatestMouseOverPointX() {
      if (this.mouseOverPoints.length > 0) {
        return this.getXValueFromDataPoint(this.mouseOverPoints[this.mouseOverPoints.length - 1]);
      }

      return null;
    }
  }, {
    key: "getLatestMouseOverPointY",
    value: function getLatestMouseOverPointY() {
      if (this.mouseOverPoints.length > 0) {
        return this.getYValueFromDataPoint(this.mouseOverPoints[this.mouseOverPoints.length - 1]);
      }

      return null;
    }
  }, {
    key: "showXPlotLineIfOn",
    value: function showXPlotLineIfOn() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (this.isMouseXPlotLineOn()) {
        var x = this.getLatestMouseOverPointX();

        if (x == null) {
          x = 0;
        }

        this.showXPlotLine(x, text);
      }
    }
  }, {
    key: "showYPlotLineIfOn",
    value: function showYPlotLineIfOn() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (this.isMouseYPlotLineOn()) {
        var y = this.getLatestMouseOverPointY();

        if (y == null) {
          y = 0;
        }

        this.showYPlotLine(y, text);
      }
    }
  }, {
    key: "showTooltipOnX",
    value: function showTooltipOnX(seriesId, x) {
      var chart = $('#' + this.chartId).highcharts();

      if (chart.series.length > 0) {
        var series = null;

        if (seriesId == null) {
          series = chart.series[chart.series.length - 1];
        } else {
          var _iteratorNormalCompletion42 = true;
          var _didIteratorError42 = false;
          var _iteratorError42 = undefined;

          try {
            for (var _iterator42 = chart.series[Symbol.iterator](), _step42; !(_iteratorNormalCompletion42 = (_step42 = _iterator42.next()).done); _iteratorNormalCompletion42 = true) {
              var singleSeries = _step42.value;

              if (singleSeries.userOptions.name === seriesId) {
                series = singleSeries;
              }
            }
          } catch (err) {
            _didIteratorError42 = true;
            _iteratorError42 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion42 && _iterator42["return"] != null) {
                _iterator42["return"]();
              }
            } finally {
              if (_didIteratorError42) {
                throw _iteratorError42;
              }
            }
          }
        }

        var points = series.points;
        var _iteratorNormalCompletion43 = true;
        var _didIteratorError43 = false;
        var _iteratorError43 = undefined;

        try {
          for (var _iterator43 = points[Symbol.iterator](), _step43; !(_iteratorNormalCompletion43 = (_step43 = _iterator43.next()).done); _iteratorNormalCompletion43 = true) {
            var point = _step43.value;

            if (point.x === x) {
              chart.tooltip.refresh(point);
            }
          }
        } catch (err) {
          _didIteratorError43 = true;
          _iteratorError43 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion43 && _iterator43["return"] != null) {
              _iterator43["return"]();
            }
          } finally {
            if (_didIteratorError43) {
              throw _iteratorError43;
            }
          }
        }
      }
    }
  }, {
    key: "highlightPointOnX",
    value: function highlightPointOnX(seriesId, x) {
      var chart = $('#' + this.chartId).highcharts();

      if (chart.series.length > 0) {
        var series = null;

        if (seriesId == null) {
          series = chart.series[chart.series.length - 1];
        } else {
          var _iteratorNormalCompletion44 = true;
          var _didIteratorError44 = false;
          var _iteratorError44 = undefined;

          try {
            for (var _iterator44 = chart.series[Symbol.iterator](), _step44; !(_iteratorNormalCompletion44 = (_step44 = _iterator44.next()).done); _iteratorNormalCompletion44 = true) {
              var singleSeries = _step44.value;

              if (singleSeries.userOptions.name === seriesId) {
                series = singleSeries;
              }

              this.removeHoverStateFromPoints(singleSeries.points);
            }
          } catch (err) {
            _didIteratorError44 = true;
            _iteratorError44 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion44 && _iterator44["return"] != null) {
                _iterator44["return"]();
              }
            } finally {
              if (_didIteratorError44) {
                throw _iteratorError44;
              }
            }
          }
        }

        this.setHoverStateOnPoint(series.points, x);
      }
    }
  }, {
    key: "removeHoverStateFromPoints",
    value: function removeHoverStateFromPoints(points) {
      var _iteratorNormalCompletion45 = true;
      var _didIteratorError45 = false;
      var _iteratorError45 = undefined;

      try {
        for (var _iterator45 = points[Symbol.iterator](), _step45; !(_iteratorNormalCompletion45 = (_step45 = _iterator45.next()).done); _iteratorNormalCompletion45 = true) {
          var point = _step45.value;
          point.setState('');
        }
      } catch (err) {
        _didIteratorError45 = true;
        _iteratorError45 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion45 && _iterator45["return"] != null) {
            _iterator45["return"]();
          }
        } finally {
          if (_didIteratorError45) {
            throw _iteratorError45;
          }
        }
      }
    }
  }, {
    key: "setHoverStateOnPoint",
    value: function setHoverStateOnPoint(points, x) {
      var _iteratorNormalCompletion46 = true;
      var _didIteratorError46 = false;
      var _iteratorError46 = undefined;

      try {
        for (var _iterator46 = points[Symbol.iterator](), _step46; !(_iteratorNormalCompletion46 = (_step46 = _iterator46.next()).done); _iteratorNormalCompletion46 = true) {
          var point = _step46.value;

          if (point.x === x) {
            point.setState('hover');
          }
        }
      } catch (err) {
        _didIteratorError46 = true;
        _iteratorError46 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion46 && _iterator46["return"] != null) {
            _iterator46["return"]();
          }
        } finally {
          if (_didIteratorError46) {
            throw _iteratorError46;
          }
        }
      }
    }
  }, {
    key: "showTooltipOnLatestPoint",
    value: function showTooltipOnLatestPoint() {
      var chart = $('#' + this.chartId).highcharts();

      if (chart.series.length > 0) {
        var latestSeries = chart.series[chart.series.length - 1];
        var points = latestSeries.points;

        if (points.length > 0) {
          var latestPoint = points[points.length - 1];
          chart.tooltip.refresh(latestPoint);
        }
      }
    }
  }, {
    key: "convertSelectedCellsToTrialIds",
    value: function convertSelectedCellsToTrialIds(selectedCells) {
      var selectedTrialIds = [];

      if (selectedCells != null) {
        var _iteratorNormalCompletion47 = true;
        var _didIteratorError47 = false;
        var _iteratorError47 = undefined;

        try {
          for (var _iterator47 = selectedCells[Symbol.iterator](), _step47; !(_iteratorNormalCompletion47 = (_step47 = _iterator47.next()).done); _iteratorNormalCompletion47 = true) {
            var selectedCell = _step47.value;
            var material = selectedCell.material;
            var bevTemp = selectedCell.bevTemp;
            var airTemp = selectedCell.airTemp;
            var selectedTrialId = material + '-' + bevTemp + 'Liquid';
            selectedTrialIds.push(selectedTrialId);
          }
        } catch (err) {
          _didIteratorError47 = true;
          _iteratorError47 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion47 && _iterator47["return"] != null) {
              _iterator47["return"]();
            }
          } finally {
            if (_didIteratorError47) {
              throw _iteratorError47;
            }
          }
        }
      }

      return selectedTrialIds;
    }
  }, {
    key: "isTrialsEnabled",
    value: function isTrialsEnabled() {
      return this.componentContent.enableTrials === true;
    }
  }, {
    key: "isStudentDataVersion1",
    value: function isStudentDataVersion1(version) {
      if (version == null) {
        return this.studentDataVersion == null || this.studentDataVersion === 1;
      } else {
        return version === 1;
      }
    }
  }]);

  return GraphController;
}(_componentController["default"]);

GraphController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'GraphService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];
var _default = GraphController;
exports["default"] = _default;
//# sourceMappingURL=graphController.js.map
