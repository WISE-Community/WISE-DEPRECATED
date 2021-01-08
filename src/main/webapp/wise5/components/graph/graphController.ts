'use strict';

import * as angular from 'angular';
import * as Highcharts from '../../lib/highcharts/highcharts.src';
import ComponentController from '../componentController';
import canvg from 'canvg';
import html2canvas from 'html2canvas';
import * as covariance from 'compute-covariance';
import { Subscription } from 'rxjs';
import { Directive } from '@angular/core';

@Directive()
class GraphController extends ComponentController {
  $q: any;
  $timeout: any;
  GraphService: any;
  chartConfig: any;
  graphType: string = null;
  series: any[] = [];
  seriesMarkers: string[] = ['circle', 'square', 'diamond', 'triangle', 'triangle-down', 'circle'];
  activeSeries: any = null;
  isResetGraphButtonVisible: boolean = false;
  isSelectSeriesVisible: boolean = false;
  notebookConfig: any = this.NotebookService.getNotebookConfig();
  hideAllTrialsOnNewTrial: boolean = true;
  showUndoButton: boolean = false;
  isLegendEnabled: boolean = true;
  hasCustomLegendBeenSet: boolean = false;
  showTrialSelect: boolean = true;
  chartId: string = 'chart1';
  width: number = null;
  height: number = null;
  trials: any[] = [];
  activeTrial: any = null;
  trialIdsToShow: any[] = [];
  selectedTrialsText: string = '';
  studentDataVersion: number = 2;
  canCreateNewTrials: boolean = false;
  canDeleteTrials: boolean = false;
  uploadedFileName: string = null;
  backgroundImage: string = null;
  mouseOverPoints: any[] = [];
  initialComponentState: any = null;
  previousComponentState: any = null;
  undoStack: any[] = [];
  addNextComponentStateToUndoStack: boolean = false;
  hiddenCanvasId: string;
  dataExplorerColors: string[];
  title: string;
  subtitle: string;
  xAxis: any;
  yAxis: any;
  plotLines: any[];
  rectangle: any;
  yAxisLocked: boolean;
  setupMouseMoveListenerDone: boolean;
  mouseDown: boolean;
  fileName: string;
  lastSavedMouseMoveTimestamp: number;
  xAxisLimitSpacerWidth: number;
  lastDropTime: number;
  isResetSeriesButtonVisible: boolean;
  previousTrialIdsToShow: any[];
  deleteKeyPressedSubscription: Subscription;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'GraphService',
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
    AudioRecorderService,
    ConfigService,
    GraphService,
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
    this.GraphService = GraphService;
    this.graphType = null;
    this.series = [];
    this.seriesMarkers = ['circle', 'square', 'diamond', 'triangle', 'triangle-down', 'circle'];
    this.activeSeries = null;
    this.isResetGraphButtonVisible = false;
    this.isSelectSeriesVisible = false;
    this.notebookConfig = this.NotebookService.getNotebookConfig();
    this.hideAllTrialsOnNewTrial = true;
    this.showUndoButton = false;
    this.isLegendEnabled = true;
    this.hasCustomLegendBeenSet = false;
    this.showTrialSelect = true;
    this.chartId = 'chart1';
    this.width = null;
    this.height = null;
    this.trials = [];
    this.activeTrial = null;
    this.trialIdsToShow = [];
    this.selectedTrialsText = '';
    this.studentDataVersion = 2;
    this.canCreateNewTrials = false;
    this.canDeleteTrials = false;
    this.uploadedFileName = null;
    this.backgroundImage = null;
    this.mouseOverPoints = [];
    this.initialComponentState = null;
    /*
     * An array to store the component states for the student to undo.
     * The undoStack will contain the component states from the current
     * visit except for the current component state.
     */
    this.undoStack = [];
    /*
     * whether to add the next component state created in
     * studentDataChanged() to the undoStack
     */
    this.addNextComponentStateToUndoStack = false;
    this.chartId = 'chart_' + this.componentId;
    this.hiddenCanvasId = 'hiddenCanvas_' + this.componentId;
    this.dataExplorerColors = ['blue', 'orange', 'purple', 'black', 'green'];
    this.applyHighchartsPlotLinesLabelFix();
    this.initializeComponentContentParams();
    const componentState = this.$scope.componentState;
    if (this.isStudentMode()) {
      this.initializeStudentMode(componentState);
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.initializeGradingMode(componentState);
    } else {
      this.isResetSeriesButtonVisible = true;
      this.isSelectSeriesVisible = true;
      this.backgroundImage = this.componentContent.backgroundImage;
      this.newTrial();
    }
    if (
      !this.isStudentMode() &&
      this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)
    ) {
      this.setStudentWork(componentState);
    }
    this.initialComponentState = componentState;
    this.previousComponentState = componentState;
    if (!this.canSubmit()) {
      this.isSubmitButtonDisabled = true;
    }
    this.disableComponentIfNecessary();
    this.initializeHandleConnectedComponentStudentDataChanged();
    this.initializeDeleteKeyPressedListener();
    this.initializeFileUploadChanged();
    this.initializeScopeGetComponentState(this.$scope, 'graphController');
    this.drawGraph().then(() => {
      this.broadcastDoneRenderingComponent();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.deleteKeyPressedSubscription.unsubscribe();
  }

  applyHighchartsPlotLinesLabelFix() {
    Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function (proceed) {
      var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
      if (path) {
        path.flat = false;
      }
      return path;
    });
  }

  initializeComponentContentParams() {
    this.title = this.componentContent.title;
    this.subtitle = this.componentContent.subtitle;
    this.width = this.componentContent.width;
    this.height = this.componentContent.height;
    this.xAxis = this.UtilService.makeCopyOfJSONObject(this.componentContent.xAxis);
    this.yAxis = this.UtilService.makeCopyOfJSONObject(this.componentContent.yAxis);
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
    this.yAxisLocked = this.isYAxisLocked();
  }

  isYAxisLocked() {
    if (Array.isArray(this.componentContent.yAxis)) {
      return this.componentContent.yAxis
        .map((yAxis) => yAxis.locked)
        .reduce((accumulator, currentValue) => {
          return accumulator && currentValue;
        });
    } else {
      return this.componentContent.yAxis.locked;
    }
  }

  initializeStudentMode(componentState) {
    this.isResetSeriesButtonVisible = true;
    this.isSelectSeriesVisible = true;
    this.backgroundImage = this.componentContent.backgroundImage;
    if (!this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)) {
      this.newTrial();
    }
    if (this.UtilService.hasConnectedComponentAlwaysField(this.componentContent)) {
      this.handleConnectedComponents();
    } else if (
      this.GraphService.componentStateHasStudentWork(componentState, this.componentContent)
    ) {
      this.setStudentWork(componentState);
    } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      this.handleConnectedComponents();
    }
  }

  initializeGradingMode(componentState) {
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

  initializeHandleConnectedComponentStudentDataChanged() {
    this.$scope.handleConnectedComponentStudentDataChanged = (
      connectedComponent,
      connectedComponentParams,
      componentState
    ) => {
      const componentType = connectedComponent.type;
      if (componentType === 'Table') {
        this.handleTableConnectedComponentStudentDataChanged(
          connectedComponent,
          connectedComponentParams,
          componentState
        );
      } else if (componentType === 'Embedded') {
        this.handleEmbeddedConnectedComponentStudentDataChanged(
          connectedComponent,
          connectedComponentParams,
          componentState
        );
      } else if (componentType === 'Animation') {
        this.handleAnimationConnectedComponentStudentDataChanged(
          connectedComponent,
          connectedComponentParams,
          componentState
        );
      }
    };
  }

  initializeDeleteKeyPressedListener() {
    this.deleteKeyPressedSubscription = this.StudentDataService.deleteKeyPressed$.subscribe(() => {
      this.handleDeleteKeyPressed();
    });
  }

  initializeFileUploadChanged() {
    this.$scope.fileUploadChanged = (element) => {
      const activeSeriesData = this.activeSeries.data;
      let overwrite = true;
      if (activeSeriesData.length > 0) {
        if (!confirm(this.$translate('graph.areYouSureYouWantToOverwriteTheCurrentLineData'))) {
          overwrite = false;
        }
      }
      if (overwrite) {
        this.uploadFileAndReadContent(element);
      }
      /*
       * clear the file input element value so that onchange() will be
       * called again if the student wants to upload the same file again
       */
      element.value = null;
    };
  }

  uploadFileAndReadContent(element) {
    const files = element.files;
    const reader: any = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result;
      this.readCSVIntoActiveSeries(fileContent);
      this.setUploadedFileName(this.fileName);
      this.studentDataChanged();
    };
    reader.scope = this;
    reader.fileName = files[0].name;
    reader.readAsText(files[0]);
    this.StudentAssetService.uploadAsset(files[0]);
  }

  handleTableConnectedComponentStudentDataChanged(
    connectedComponent,
    connectedComponentParams,
    componentState
  ) {
    const studentData = componentState.studentData;
    if (studentData.isDataExplorerEnabled) {
      this.handleDataExplorer(studentData);
    } else {
      const rows = studentData.tableData;
      const data = this.convertRowDataToSeriesData(rows, connectedComponentParams);
      let seriesIndex = connectedComponentParams.seriesIndex;
      if (seriesIndex == null) {
        seriesIndex = 0;
      }
      if (this.isStudentDataVersion1()) {
        let series = this.series[seriesIndex];
        if (series == null) {
          series = {};
          this.series[seriesIndex] = series;
        }
        series.data = data;
      } else {
        const trial = this.activeTrial;
        if (trial != null && trial.series != null) {
          let series = trial.series[seriesIndex];
          if (series == null) {
            series = {};
            this.series[seriesIndex] = series;
          }
          series.data = data;
        }
      }
    }
    this.drawGraph();
    this.isDirty = true;
  }

  handleDataExplorer(studentData) {
    const dataExplorerSeries = studentData.dataExplorerSeries;
    const graphType = studentData.dataExplorerGraphType;
    this.xAxis.title.text = studentData.dataExplorerXAxisLabel;
    this.setYAxisLabels(studentData);
    this.activeTrial.series = [];
    for (let seriesIndex = 0; seriesIndex < dataExplorerSeries.length; seriesIndex++) {
      const xColumn = dataExplorerSeries[seriesIndex].xColumn;
      const yColumn = dataExplorerSeries[seriesIndex].yColumn;
      const yAxis = dataExplorerSeries[seriesIndex].yAxis;
      if (yColumn != null) {
        const color = this.dataExplorerColors[seriesIndex];
        const name = dataExplorerSeries[seriesIndex].name;
        const series = this.generateDataExplorerSeries(
          studentData.tableData,
          xColumn,
          yColumn,
          graphType,
          name,
          color,
          yAxis
        );
        if (series.yAxis == null) {
          this.setSeriesYAxisIndex(series, seriesIndex);
        }
        this.activeTrial.series.push(series);
        if (graphType === 'scatter' && studentData.isDataExplorerScatterPlotRegressionLineEnabled) {
          const regressionSeries = this.generateDataExplorerRegressionSeries(
            studentData.tableData,
            xColumn,
            yColumn,
            color
          );
          this.activeTrial.series.push(regressionSeries);
        }
      }
    }
    if (this.GraphService.isMultipleYAxes(this.yAxis)) {
      this.setAllSeriesColorsToMatchYAxes(this.activeTrial.series);
    }
  }

  isSingleYAxis(yAxis) {
    return !Array.isArray(yAxis);
  }

  setYAxisLabels(studentData) {
    if (this.isSingleYAxis(this.yAxis)) {
      this.yAxis.title.text = studentData.dataExplorerYAxisLabel;
    } else if (studentData.dataExplorerYAxisLabels != null) {
      for (let [index, yAxis] of Object.entries(this.yAxis)) {
        (yAxis as any).title.text = studentData.dataExplorerYAxisLabels[index];
      }
    }
  }

  setSeriesYAxisIndex(series, seriesIndex) {
    if (this.GraphService.isMultipleYAxes(this.yAxis) && this.yAxis.length == 2) {
      if (seriesIndex === 0 || seriesIndex === 1) {
        series.yAxis = seriesIndex;
      } else {
        series.yAxis = 0;
      }
    }
  }

  setAllSeriesColorsToMatchYAxes(series) {
    for (const singleSeries of series) {
      this.setSinglSeriesColorsToMatchYAxis(singleSeries);
    }
  }

  setSinglSeriesColorsToMatchYAxis(series) {
    if (series.yAxis == null) {
      series.color = this.getYAxisColor(0);
    } else {
      series.color = this.getYAxisColor(series.yAxis);
    }
  }

  getYAxisColor(index) {
    return this.yAxis[index].labels.style.color;
  }

  setYAxisColor(yAxis, color) {
    if (yAxis.labels == null) {
      yAxis.labels = {};
    }
    if (yAxis.labels.style == null) {
      yAxis.labels.style = {};
    }
    if (yAxis.title == null) {
      yAxis.title = {};
    }
    if (yAxis.title.style == null) {
      yAxis.title.style = {};
    }
    yAxis.labels.style.color = color;
    yAxis.title.style.color = color;
  }

  isYAxisLabelBlank(yAxis, index) {
    if (this.GraphService.isMultipleYAxes(yAxis)) {
      return yAxis[index].title.text === '';
    } else {
      return yAxis.title.text === '';
    }
  }

  generateDataExplorerSeries(tableData, xColumn, yColumn, graphType, name, color, yAxis) {
    const series = {
      type: graphType,
      name: name,
      color: color,
      yAxis: yAxis,
      data: this.convertDataExplorerDataToSeriesData(tableData, xColumn, yColumn)
    };
    if (graphType === 'line') {
      series.data.sort(this.sortLineData);
    }
    return series;
  }

  generateDataExplorerRegressionSeries(tableData, xColumn, yColumn, color) {
    const regressionLineData = this.calculateRegressionLineData(tableData, xColumn, yColumn);
    return {
      type: 'line',
      name: 'Regression Line',
      color: color,
      data: regressionLineData
    };
  }

  calculateRegressionLineData(tableData, xColumn, yColumn) {
    const xValues = this.getValuesInColumn(tableData, xColumn);
    const yValues = this.getValuesInColumn(tableData, yColumn);
    const covarianceMatrix = covariance(xValues, yValues);
    const covarianceXY = covarianceMatrix[0][1];
    const varianceX = covarianceMatrix[0][0];
    const meanY = this.UtilService.calculateMean(yValues);
    const meanX = this.UtilService.calculateMean(xValues);
    const slope = covarianceXY / varianceX;
    const intercept = meanY - slope * meanX;
    let firstX = Math.min(...xValues);
    let firstY = slope * firstX + intercept;
    if (firstY < 0) {
      firstY = 0;
      firstX = (firstY - intercept) / slope;
    }
    let secondX = Math.max(...xValues);
    let secondY = slope * secondX + intercept;
    if (secondY < 0) {
      secondY = 0;
      secondX = (secondY - intercept) / slope;
    }
    return [
      [firstX, firstY],
      [secondX, secondY]
    ];
  }

  getValuesInColumn(tableData, columnIndex) {
    const values = [];
    for (let r = 1; r < tableData.length; r++) {
      const row = tableData[r];
      const value = Number(row[columnIndex].text);
      values.push(value);
    }
    return values;
  }

  sortLineData(a, b) {
    if (a[0] > b[0]) {
      return 1;
    } else if (a[0] < b[0]) {
      return -1;
    } else {
      if (a[1] > b[1]) {
        return 1;
      } else if (a[1] < b[1]) {
        return -1;
      } else {
        return 0;
      }
    }
  }

  convertDataExplorerDataToSeriesData(rows, xColumn, yColumn) {
    const data = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const xCell = row[xColumn];
      const yCell = row[yColumn];
      if (xCell != null && yCell != null) {
        this.addPointFromTableIntoData(xCell, yCell, data);
      }
    }
    return data;
  }

  handleEmbeddedConnectedComponentStudentDataChanged(
    connectedComponent,
    connectedComponentParams,
    componentState
  ) {
    componentState = this.UtilService.makeCopyOfJSONObject(componentState);
    const studentData = componentState.studentData;
    this.processConnectedComponentStudentData(studentData, connectedComponentParams);
    this.studentDataChanged();
  }

  handleAnimationConnectedComponentStudentDataChanged(
    connectedComponent,
    connectedComponentParams,
    componentState
  ) {
    if (componentState.t != null) {
      this.setVerticalPlotLine(componentState.t);
      this.drawGraph();
    }
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  setupMouseMoveListener() {
    if (!this.setupMouseMoveListenerDone) {
      /*
       * Remove all existing listeners on the chart div to make sure we don't
       * bind a listener multiple times.
       */
      angular.element(document.querySelector(`#${this.chartId}`)).unbind();
      angular.element(document.querySelector(`#${this.chartId}`)).bind('mousedown', (e) => {
        this.mouseDown = true;
        this.mouseDownEventOccurred(e);
      });
      angular.element(document.querySelector(`#${this.chartId}`)).bind('mouseup', (e) => {
        this.mouseDown = false;
      });
      angular.element(document.querySelector(`#${this.chartId}`)).bind('mousemove', (e) => {
        if (this.mouseDown) {
          this.mouseDownEventOccurred(e);
        }
      });
      angular.element(document.querySelector(`#${this.chartId}`)).bind('mouseleave', (e) => {
        this.mouseDown = false;
      });
      this.setupMouseMoveListenerDone = true;
    }
  }

  /**
   * The student has moved the mouse while holding the mouse button down.
   * @param e The mouse event.
   */
  mouseDownEventOccurred(e) {
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
    const x = this.handleMouseDownXPosition(e);
    const y = this.handleMouseDownYPosition(e);
    if (this.componentContent.saveMouseOverPoints) {
      /*
       * Make sure we aren't saving the points too frequently. We want to avoid
       * saving too many unnecessary data points.
       */
      const currentTimestamp = new Date().getTime();
      /*
       * Make sure this many milliseconds has passed before saving another mouse
       * over point.
       */
      const timeBetweenSendingMouseOverPoints = 200;
      if (
        this.lastSavedMouseMoveTimestamp == null ||
        currentTimestamp - this.lastSavedMouseMoveTimestamp > timeBetweenSendingMouseOverPoints
      ) {
        this.addMouseOverPoint(x, y);
        this.studentDataChanged();
        this.lastSavedMouseMoveTimestamp = currentTimestamp;
      }
    }
  }

  handleMouseDownXPosition(e) {
    const chart = this.getChartById(this.chartId);
    const chartXAxis = chart.xAxis[0];
    let x = chartXAxis.toValue(e.offsetX, false);
    x = this.makeSureXIsWithinXMinMaxLimits(x);
    if (this.componentContent.showMouseXPlotLine) {
      this.showXPlotLine(x);
    }
    return x;
  }

  handleMouseDownYPosition(e) {
    const chart = this.getChartById(this.chartId);
    const chartYAxis = chart.yAxis[0];
    let y = chartYAxis.toValue(e.offsetY, false);
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
  showXPlotLine(x, text: string = null) {
    const chart = this.getChartById(this.chartId);
    const chartXAxis = chart.xAxis[0];
    chartXAxis.removePlotLine('plot-line-x');
    const plotLine: any = {
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
  drawRangeRectangle(
    xMin,
    xMax,
    yMin,
    yMax,
    strokeColor = 'black',
    strokeWidth = '.5',
    fillColor = 'black',
    fillOpacity = '.1'
  ) {
    this.createRectangleIfNecessary(strokeColor, strokeWidth, fillColor, fillOpacity);
    xMin = this.convertToXPixels(xMin);
    xMax = this.convertToXPixels(xMax);
    yMin = this.convertToYPixels(yMin);
    yMax = this.convertToYPixels(yMax);
    this.updateRectanglePositionAndSize(xMin, xMax, yMin, yMax);
  }

  convertToXPixels(graphUnitValue) {
    const chart = this.getChartById(this.chartId);
    return chart.xAxis[0].translate(graphUnitValue);
  }

  convertToYPixels(graphUnitValue) {
    const chart = this.getChartById(this.chartId);
    return chart.yAxis[0].translate(graphUnitValue);
  }

  createRectangleIfNecessary(strokeColor, strokeWidth, fillColor, fillOpacity) {
    if (this.rectangle == null) {
      const chart = this.getChartById(this.chartId);
      this.rectangle = chart.renderer
        .rect(0, 0, 0, 0, 0)
        .css({
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: fillColor,
          fillOpacity: fillOpacity
        })
        .add();
    }
  }

  updateRectanglePositionAndSize(xMin, xMax, yMin, yMax) {
    const chart = this.getChartById(this.chartId);
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
  showYPlotLine(y, text: string = null) {
    const chart = this.getChartById(this.chartId);
    const chartYAxis = chart.yAxis[0];
    chartYAxis.removePlotLine('plot-line-y');
    const plotLine: any = {
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

  clearPlotLines() {
    const chart = Highcharts.charts[0];
    if (chart != null) {
      const chartXAxis = chart.xAxis[0];
      chartXAxis.removePlotLine('plot-line-x');
      const chartYAxis = chart.yAxis[0];
      chartYAxis.removePlotLine('plot-line-y');
    }
  }

  /**
   * If the x value is not within the x min and max limits, we will modify the x value to be at the
   * limit.
   * @param x the x value
   * @return an x value between the x min and max limits
   */
  makeSureXIsWithinXMinMaxLimits(x) {
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
  makeSureYIsWithinYMinMaxLimits(y) {
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
  addMouseOverPoint(x, y) {
    this.mouseOverPoints.push([x, y]);
  }

  /**
   * @param useTimeout whether to call the drawGraphHelper() function in a timeout callback
   */
  drawGraph(useTimeout: boolean = false) {
    const deferred = this.$q.defer();
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
      this.$timeout(() => {
        this.drawGraphHelper(deferred);
      });
    } else {
      this.drawGraphHelper(deferred);
    }
    return deferred.promise;
  }

  /**
   * @param deferred A promise that should be resolved after the graph is done rendering.
   */
  drawGraphHelper(deferred) {
    this.turnOffXAxisDecimals();
    this.turnOffYAxisDecimals();
    this.copyXAxisPlotBandsFromComponentContent();
    this.setupXAxisLimitSpacerWidth();
    let series = null;
    if (this.isTrialsEnabled()) {
      series = this.getSeriesFromTrials(this.trials);
      this.xAxis.plotBands = this.getPlotBandsFromTrials(this.trials);
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
    this.updateMinMaxAxisValues(series, this.xAxis, this.yAxis);
    if (this.plotLines != null) {
      this.xAxis.plotLines = this.plotLines;
    }
    const zoomType = this.getZoomType();
    this.chartConfig = this.createChartConfig(
      deferred,
      this.title,
      this.subtitle,
      this.xAxis,
      this.yAxis,
      series,
      zoomType
    );
    if (this.componentContent.useCustomLegend) {
      // use a timeout so the graph has a chance to render before we set the custom legend
      this.$timeout(() => {
        this.setCustomLegend();
      });
    }
    return deferred.promise;
  }

  turnOffXAxisDecimals() {
    this.xAxis.allowDecimals = false;
  }

  turnOffYAxisDecimals() {
    if (this.isSingleYAxis(this.yAxis)) {
      this.yAxis.allowDecimals = false;
    } else {
      this.yAxis.forEach((yAxis) => (yAxis.allowDecimals = false));
    }
  }

  copyXAxisPlotBandsFromComponentContent() {
    this.xAxis.plotBands = this.componentContent.xAxis.plotBands;
  }

  setupWidth() {
    if (this.componentContent.width != null) {
      this.width = this.componentContent.width;
    }
  }

  setupHeight() {
    if (this.componentContent.height != null) {
      this.height = this.componentContent.height;
    }
  }

  setupXAxisLimitSpacerWidth() {
    if (this.width > 100) {
      this.xAxisLimitSpacerWidth = this.width - 100;
    } else {
      this.xAxisLimitSpacerWidth = 0;
    }
  }

  getSeriesFromTrials(trials) {
    let series = [];
    for (const trial of trials) {
      if (trial.show) {
        series = series.concat(trial.series);
      }
    }
    return series;
  }

  getPlotBandsFromTrials(trials) {
    let trialPlotBands = [];
    for (const trial of trials) {
      if (trial.show && trial.xAxis != null && trial.xAxis.plotBands != null) {
        trialPlotBands = trialPlotBands.concat(trial.xAxis.plotBands);
      }
    }
    return trialPlotBands;
  }

  refreshSeriesIds(series) {
    this.clearSeriesIds(series);
    this.setSeriesIds(series);
  }

  setAllSeriesFields(series) {
    const canAllSeriesMouseTrack = this.getNumberOfEditableSeries(series) === 0;
    for (const singleSeries of series) {
      this.setSingleSeriesFields(singleSeries, canAllSeriesMouseTrack);
    }
  }

  getNumberOfEditableSeries(series) {
    let numberOfEditableSeries = 0;
    for (const singleSeries of series) {
      if (singleSeries.canEdit) {
        numberOfEditableSeries++;
      }
    }
    return numberOfEditableSeries;
  }

  setSingleSeriesFields(singleSeries, canAllSeriesMouseTrack) {
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
      singleSeries.enableMouseTracking = canAllSeriesMouseTrack;
    }
    if (singleSeries.allowPointMouseOver === true) {
      singleSeries.allowPointSelect = true;
      singleSeries.enableMouseTracking = true;
    }
    if (this.isMousePlotLineOn()) {
      singleSeries.enableMouseTracking = true;
    }
  }

  getZoomType() {
    return this.mode === 'grading' || this.mode === 'gradingRevision' ? 'xy' : null;
  }

  clearChartConfig() {
    this.chartConfig = {
      chart: {
        options: {
          chart: {}
        }
      }
    };
  }

  createChartConfig(deferred, title, subtitle, xAxis, yAxis, series, zoomType) {
    const chartConfig = {
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
            load: function () {
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
        text: title,
        useHTML: true
      },
      subtitle: {
        text: subtitle,
        useHTML: true
      },
      xAxis: xAxis,
      yAxis: yAxis,
      loading: false,
      func: this.createGraphCallbackHandler()
    };
    return chartConfig;
  }

  createTooltipFormatter() {
    const thisGraphController = this;
    return function () {
      let text = '';
      if (thisGraphController.isLimitXAxisType(thisGraphController.xAxis)) {
        text = thisGraphController.getSeriesText(this.series);
        const xText = thisGraphController.getXTextForLimitGraph(this.series, this.x);
        const yText = thisGraphController.getYTextForLimitGraph(this.series, this.y);
        text += thisGraphController.combineXTextAndYText(xText, yText);
      } else if (thisGraphController.isCategoriesXAxisType(thisGraphController.xAxis)) {
        text = thisGraphController.getSeriesText(this.series);
        const xText = thisGraphController.getXTextForCategoriesGraph(this.point, this.x);
        const yText = thisGraphController.getYTextForCategoriesGraph(this.y);
        text += xText + ' ' + yText;
      }
      if (thisGraphController.pointHasCustomTooltip(this.point)) {
        text += '<br/>' + this.point.tooltip;
      }
      return text;
    };
  }

  getXAxisUnits(series) {
    if (
      series.xAxis != null &&
      series.xAxis.userOptions != null &&
      series.xAxis.userOptions.units != null
    ) {
      return series.xAxis.userOptions.units;
    } else {
      return '';
    }
  }

  getYAxisUnits(series) {
    if (
      series.yAxis != null &&
      series.yAxis.userOptions != null &&
      series.yAxis.userOptions.units != null
    ) {
      return series.yAxis.userOptions.units;
    } else {
      return '';
    }
  }

  isLimitXAxisType(xAxis) {
    return xAxis.type === 'limits' || xAxis.type == null;
  }

  isCategoriesXAxisType(xAxis) {
    return xAxis.type === 'categories';
  }

  getSeriesText(series) {
    let text = '';
    if (series.name !== '') {
      text = '<b>' + series.name + '</b><br/>';
    }
    return text;
  }

  getXTextForLimitGraph(series, x) {
    let text = this.performRounding(x);
    let xAxisUnits = this.getXAxisUnits(series);
    if (xAxisUnits != null && xAxisUnits !== '') {
      text += ' ' + xAxisUnits;
    }
    return text;
  }

  getYTextForLimitGraph(series, y) {
    let text = this.performRounding(y);
    let yAxisUnits = this.getYAxisUnits(this.series);
    if (yAxisUnits != null && yAxisUnits !== '') {
      text += ' ' + yAxisUnits;
    }
    return text;
  }

  combineXTextAndYText(xText, yText) {
    let text = xText;
    if (xText !== '') {
      text += ', ';
    }
    text += yText;
    return text;
  }

  getXTextForCategoriesGraph(point, x) {
    const category = this.getCategoryByIndex(point.index);
    if (category != null) {
      return category;
    } else {
      return this.performRounding(x);
    }
  }

  getYTextForCategoriesGraph(y) {
    return this.performRounding(y);
  }

  pointHasCustomTooltip(point) {
    return point.tooltip != null && point.tooltip !== '';
  }

  createGraphClickHandler() {
    const thisGraphController = this;
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
  isIgnoreClickEvent() {
    const currentTime = new Date().getTime();
    return this.lastDropTime != null && currentTime - this.lastDropTime < 100;
  }

  handleGraphClickEvent(event, series) {
    if (!this.isDisabled) {
      const activeSeries = this.activeSeries;
      if (activeSeries != null && this.canEdit(activeSeries)) {
        const activeSeriesId = activeSeries.id;
        for (const singleSeries of series) {
          if (activeSeriesId === singleSeries.options.id && !singleSeries.visible) {
            // the series is not visible so we will not add the point
            alert(this.$translate('graph.studentAddingPointToHiddenSeriesMessage'));
            return;
          }
        }
        const x = this.performRounding(event.xAxis[0].value);
        const y = this.performRounding(this.getEventYValue(event));
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

  getEventYValue(event) {
    return event.yAxis[this.getSeriesYAxisIndex(this.activeSeries)].value;
  }

  getSeriesYAxisIndex(series) {
    if (this.GraphService.isMultipleYAxes(this.yAxis) && series.yAxis != null) {
      return series.yAxis;
    } else {
      return 0;
    }
  }

  createLegendItemClickHandler() {
    const thisGraphController = this;
    return function (event) {
      const canHideSeries =
        thisGraphController.componentContent.canStudentHideSeriesOnLegendClick === true;
      if (canHideSeries) {
        /*
         * Update the show field in all the series depending on whether each line is active
         * in the legend.
         */
        for (const yAxisSeries of this.yAxis.series) {
          let series = thisGraphController.getSeriesById(yAxisSeries.userOptions.id);
          if (this.userOptions.id === series.id) {
            series.show = !yAxisSeries.visible;
          } else {
            series.show = yAxisSeries.visible;
          }
        }
        thisGraphController.studentDataChanged();
      }
      return canHideSeries;
    };
  }

  createPointDragEventHandler() {
    const thisGraphController: any = this;
    return function (event) {
      if (!thisGraphController.isDisabled) {
        const activeSeries = thisGraphController.activeSeries;
        if (thisGraphController.canEdit(activeSeries)) {
          thisGraphController.dragging = true;
        }
      }
    };
  }

  createPointDropEventHandler() {
    const thisGraphController: any = this;
    return function (event) {
      // the student has stopped dragging the point and dropped the point
      if (!thisGraphController.isDisabled && thisGraphController.dragging) {
        const activeSeries = thisGraphController.activeSeries;
        thisGraphController.dragging = false;
        thisGraphController.lastDropTime = new Date().getTime();
        const target = event.target;
        const x = thisGraphController.performRounding(target.x);
        const y = thisGraphController.performRounding(target.y);
        const index = target.index;
        const data = activeSeries.data;
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

  createGraphCallbackHandler() {
    const thisGraphController = this;
    return function (chart) {
      thisGraphController.$timeout(function () {
        thisGraphController.showXPlotLineIfOn('Drag Me');
        thisGraphController.showYPlotLineIfOn('Drag Me');
        if (
          thisGraphController.isMouseXPlotLineOn() ||
          thisGraphController.isMouseYPlotLineOn() ||
          thisGraphController.isSaveMouseOverPoints()
        ) {
          thisGraphController.setupMouseMoveListener();
        }
        chart.reflow();
      }, 1000);
    };
  }

  /**
   * Overwrite the existing legend with the custom authored legend.
   */
  setCustomLegend() {
    if (!this.hasCustomLegendBeenSet) {
      if ($('.highcharts-legend').length > 0) {
        // move the legend to the very left by setting the x position to 0
        const userAgent = navigator.userAgent;
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
          const matrixRegEx = /(translate\()(\d*)(,\s*\d*\))/;
          const currentTransform = $('.highcharts-legend').attr('transform');
          // replace the second group with 0
          const newTransform = currentTransform.replace(matrixRegEx, '$10$3');
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
          const matrixRegEx = /(matrix\(\d*,\s*\d*,\s*\d*,\s*\d*,\s*)(\d*)(,\s*\d*\))/;
          const currentTransform = $('.highcharts-legend').css('transform');
          // replace the second group with 0
          const newTransform = currentTransform.replace(matrixRegEx, '$10$3');
          $('.highcharts-legend').css('transform', newTransform);
        }
        $('.highcharts-legend').html(this.componentContent.customLegend);
      }
      this.hasCustomLegendBeenSet = true;
    }
  }

  addPointToSeries(series, x, y) {
    const data = series.data;
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
  removePointFromSeries(series, x) {
    const data = series.data;
    for (let d = 0; d < data.length; d++) {
      const dataPoint = data[d];
      const tempDataXValue = dataPoint[0];
      if (x === tempDataXValue) {
        data.splice(d, 1);
        d--;
      }
    }
  }

  canEdit(series) {
    return series.canEdit;
  }

  setSeries(series) {
    this.series = series;
  }

  getSeries() {
    return this.series;
  }

  setSeriesByIndex(series, index) {
    this.series[index] = series;
  }

  getSeriesByIndex(index) {
    return this.series[index];
  }

  setTrials(trials) {
    this.trials = trials;
  }

  getTrials() {
    return this.trials;
  }

  /**
   * Get the index of the trial
   * @param trial the trial object
   * @return the index of the trial within the trials array
   */
  getTrialIndex(trial) {
    for (let t = 0; t < this.trials.length; t++) {
      const tempTrial = this.trials[t];
      if (trial === tempTrial) {
        return t;
      }
    }
    return -1;
  }

  setActiveTrialByIndex(index) {
    this.activeTrial = this.trials[index];
  }

  canEditTrial(trial) {
    let series = trial.series;
    for (const singleSeries of series) {
      if (singleSeries.canEdit) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set whether to show the active trial select menu
   * @return whether to show the active trial select menu
   */
  showSelectActiveTrials() {
    let editableTrials = 0;
    for (const trial of this.trials) {
      if (this.canEditTrial(trial) && trial.show) {
        editableTrials++;
        if (editableTrials > 1) {
          return true;
        }
      }
    }
    return false;
  }

  setXAxis(xAxis) {
    this.xAxis = this.UtilService.makeCopyOfJSONObject(xAxis);
  }

  getXAxis() {
    return this.xAxis;
  }

  setYAxis(yAxis) {
    this.yAxis = this.UtilService.makeCopyOfJSONObject(yAxis);
  }

  getYAxis() {
    return this.yAxis;
  }

  setActiveSeries(series) {
    this.activeSeries = series;
  }

  setActiveSeriesByIndex(index) {
    const series = this.getSeriesByIndex(index);
    if (series != null && series.yAxis == null) {
      series.yAxis = 0;
    }
    this.setActiveSeries(series);
  }

  resetGraph() {
    this.setSeries(this.UtilService.makeCopyOfJSONObject(this.componentContent.series));
    if (this.componentContent.xAxis != null) {
      this.setXAxis(this.componentContent.xAxis);
    }
    if (this.componentContent.yAxis != null) {
      this.setYAxis(this.componentContent.yAxis);
    }
    // set the active series to null so that the default series will become selected later
    this.setActiveSeries(null);
    this.backgroundImage = this.componentContent.backgroundImage;
    this.addNextComponentStateToUndoStack = true;
    this.studentDataChanged();
  }

  resetSeries() {
    let confirmMessage = '';
    const seriesName = this.activeSeries.name;
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

  resetSeriesHelper() {
    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      this.newTrial();
      const isReset = true;
      this.handleConnectedComponents(isReset);
    } else {
      const activeSeriesIndex = this.getSeriesIndex(this.activeSeries);
      let originalSeries = this.componentContent.series[activeSeriesIndex];
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

  setStudentWork(componentState) {
    const studentData = componentState.studentData;
    if (this.isStudentDataVersion1(studentData.version)) {
      this.studentDataVersion = 1;
      this.setSeries(this.UtilService.makeCopyOfJSONObject(studentData.series));
    } else {
      this.studentDataVersion = studentData.version;
      if (studentData.trials != null && studentData.trials.length > 0) {
        const trialsCopy = this.UtilService.makeCopyOfJSONObject(studentData.trials);
        this.setTrials(trialsCopy);
        const activeTrialIndex = studentData.activeTrialIndex;
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
    const submitCounter = studentData.submitCounter;
    if (submitCounter != null) {
      this.submitCounter = submitCounter;
    }
    if (studentData.mouseOverPoints != null && studentData.mouseOverPoints.length > 0) {
      this.mouseOverPoints = studentData.mouseOverPoints;
    }
    this.processLatestStudentWork();
  }

  activeSeriesChanged() {
    const useTimeoutSetupGraph = true;
    this.studentDataChanged(useTimeoutSetupGraph);
  }

  studentDataChanged(useTimeoutSetupGraph: boolean = false) {
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
    const action = 'change';
    this.createComponentState(action).then((componentState) => {
      if (this.addNextComponentStateToUndoStack) {
        if (this.previousComponentState != null) {
          this.undoStack.push(this.previousComponentState);
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
        this.previousComponentState = componentState;
        this.addNextComponentStateToUndoStack = false;
      }
      /*
       * fire the componentStudentDataChanged event after a short timeout
       * so that the other component handleConnectedComponentStudentDataChanged()
       * listeners can initialize before this and are then able to process
       * this componentStudentDataChanged event
       */
      this.$timeout(() => {
        this.emitComponentStudentDataChanged(componentState);
      }, 1000);
    });
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    const deferred = this.$q.defer();
    const componentState = this.NodeService.createNewComponentState();
    const studentData: any = {};
    studentData.version = this.studentDataVersion;
    if (this.isStudentDataVersion1()) {
      studentData.series = this.UtilService.makeCopyOfJSONObject(this.getSeries());
    } else {
      if (this.trials != null) {
        studentData.trials = this.UtilService.makeCopyOfJSONObject(this.trials);
        const activeTrialIndex = this.getTrialIndex(this.activeTrial);
        studentData.activeTrialIndex = activeTrialIndex;
      }
    }
    studentData.xAxis = this.UtilService.makeCopyOfJSONObject(this.getXAxis());
    delete studentData.xAxis.plotBands;
    if (this.componentContent.xAxis != null && this.componentContent.xAxis.plotBands != null) {
      studentData.xAxis.plotBands = this.componentContent.xAxis.plotBands;
    }
    studentData.yAxis = this.getYAxis();
    const activeSeriesIndex = this.getSeriesIndex(this.activeSeries);
    if (activeSeriesIndex != null) {
      studentData.activeSeriesIndex = activeSeriesIndex;
    }
    const uploadedFileName = this.getUploadedFileName();
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
  createComponentStateAdditionalProcessing(deferred, componentState, action) {
    if (this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)) {
      const additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(
        this.nodeId,
        this.componentId
      );
      let allPromises = [];
      for (const additionalProcessingFunction of additionalProcessingFunctions) {
        const defer = this.$q.defer();
        const promise = defer.promise;
        allPromises.push(promise);
        additionalProcessingFunction(defer, componentState, action);
      }
      this.$q.all(allPromises).then(() => {
        deferred.resolve(componentState);
      });
    } else {
      deferred.resolve(componentState);
    }
  }

  showPrompt() {
    return this.isPromptVisible === true;
  }

  showResetGraphButton() {
    return this.isResetGraphButtonVisible === true;
  }

  showResetSeriesButton() {
    return this.isResetSeriesButtonVisible === true;
  }

  getSeriesIndex(series) {
    const multipleSeries = this.getSeries();
    for (let s = 0; s < multipleSeries.length; s++) {
      const singleSeries = multipleSeries[s];
      if (series === singleSeries) {
        return s;
      }
    }
    return null;
  }

  getSeriesById(id) {
    for (const singleSeries of this.getSeries()) {
      if (singleSeries.id === id) {
        return singleSeries;
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
  getTrialsFromClassmates(nodeId, componentId, periodId) {
    const deferred = this.$q.defer();
    this.StudentDataService.getClassmateStudentWork(nodeId, componentId, periodId).then(
      (componentStates) => {
        const promises = [];
        for (const componentState of componentStates) {
          promises.push(this.getTrialsFromComponentState(nodeId, componentId, componentState));
        }
        this.$q.all(promises).then((promiseResults) => {
          const mergedTrials = [];
          for (const trials of promiseResults) {
            for (const trial of trials) {
              mergedTrials.push(trial);
            }
          }
          deferred.resolve(mergedTrials);
        });
      }
    );
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
  getTrialsFromComponentState(nodeId, componentId, componentState) {
    const deferred = this.$q.defer();
    const mergedTrials = [];
    const nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    const studentData = componentState.studentData;
    if (this.isStudentDataVersion1(studentData.version)) {
      const series = studentData.series;
      const newTrial = {
        id: this.UtilService.generateKey(10),
        name: nodePositionAndTitle,
        show: true,
        series: series
      };
      mergedTrials.push(newTrial);
    } else {
      const trials = studentData.trials;
      if (trials != null) {
        for (const trial of trials) {
          const newTrial = this.UtilService.makeCopyOfJSONObject(trial);
          newTrial.name = nodePositionAndTitle;
          newTrial.show = true;
          mergedTrials.push(newTrial);
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
  attachStudentAsset(studentAsset) {
    this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
      this.StudentAssetService.getAssetContent(copiedAsset).then((assetContent) => {
        const rowData = this.UtilService.CSVToArray(assetContent, ',');
        const params = {
          skipFirstRow: true,
          xColumn: 0,
          yColumn: 1
        };
        const seriesData = this.convertRowDataToSeriesData(rowData, params);
        const newSeriesIndex = this.series.length;
        const series: any = {
          name: copiedAsset.fileName,
          color: this.GraphService.getSeriesColor(newSeriesIndex),
          marker: {
            symbol: this.seriesMarkers[newSeriesIndex]
          },
          canEdit: false
        };
        this.series[newSeriesIndex] = series;
        series.data = seriesData;
        this.isDirty = true;
        this.addNextComponentStateToUndoStack = true;
        this.studentDataChanged();
      });
    });
  }

  /**
   * Convert the table data into series data
   * @param componentState the component state to get table data from
   * @param params (optional) the params to specify what columns
   * and rows to use from the table data
   */
  convertRowDataToSeriesData(rows, params) {
    const data = [];
    let skipFirstRow = this.getSkipFirstRowValue(params);
    let xColumn = this.getXColumnValue(params);
    let yColumn = this.getYColumnValue(params);
    for (let r = 0; r < rows.length; r++) {
      if (skipFirstRow && r === 0) {
        continue;
      }
      const row = rows[r];
      const xCell = row[xColumn];
      const yCell = row[yColumn];
      if (xCell != null && yCell != null) {
        this.addPointFromTableIntoData(xCell, yCell, data);
      }
    }
    return data;
  }

  getSkipFirstRowValue(params) {
    if (params == null) {
      return false;
    } else {
      return params.skipFirstRow;
    }
  }

  getXColumnValue(params) {
    if (params == null || params.xColumn == null) {
      return 0;
    } else {
      return params.xColumn;
    }
  }

  getYColumnValue(params) {
    if (params == null || params.yColumn == null) {
      return 1;
    } else {
      return params.yColumn;
    }
  }

  addPointFromTableIntoData(xCell, yCell, data) {
    let xText = xCell.text;
    let yText = yCell.text;
    if (xText != null && xText !== '' && yText != null && yText !== '') {
      const xNumber = Number(xText);
      const yNumber = Number(yText);
      const point = [];
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

  setSeriesIds(allSeries) {
    const usedSeriesIds = this.getAllUsedSeriesIds(allSeries);
    for (const singleSeries of allSeries) {
      if (singleSeries.id == null) {
        const nextSeriesId = this.getNextSeriesId(usedSeriesIds);
        singleSeries.id = nextSeriesId;
        usedSeriesIds.push(nextSeriesId);
      }
    }
  }

  getAllUsedSeriesIds(allSeries) {
    const usedSeriesIds = [];
    for (const singleSeries of allSeries) {
      usedSeriesIds.push(singleSeries.id);
    }
    return usedSeriesIds;
  }

  /**
   * Get the next available series id
   * @param usedSeriesIds an array of used series ids
   * @returns the next available series id
   */
  getNextSeriesId(usedSeriesIds) {
    let nextSeriesId = null;
    let currentSeriesNumber = 0;
    let foundNextSeriesId = false;
    while (!foundNextSeriesId) {
      const tempSeriesId = 'series-' + currentSeriesNumber;
      if (usedSeriesIds.indexOf(tempSeriesId) === -1) {
        nextSeriesId = tempSeriesId;
        foundNextSeriesId = true;
      } else {
        currentSeriesNumber++;
      }
    }
    return nextSeriesId;
  }

  getChartById(chartId) {
    for (const chart of Highcharts.charts) {
      if (chart != null && chart.renderTo.id === chartId) {
        return chart;
      }
    }
    return null;
  }

  handleDeleteKeyPressed() {
    const series = this.activeSeries;
    if (this.canEdit(series)) {
      const chart = this.getChartById(this.chartId);
      const selectedPoints = chart.getSelectedPoints();
      let index = null;
      if (selectedPoints.length > 0) {
        const indexesToDelete = [];
        const data = series.data;
        for (const selectedPoint of selectedPoints) {
          index = selectedPoint.index;
          const dataPoint = data[index];
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
        indexesToDelete.sort().reverse();
        // loop through all the indexes and remove them from the series data
        for (let i = 0; i < indexesToDelete.length; i++) {
          data.splice(indexesToDelete[i], 1);
        }
        this.addNextComponentStateToUndoStack = true;
        this.studentDataChanged();
      }
    }
  }

  isActiveSeries(series) {
    const seriesIndex = this.getSeriesIndex(series);
    return this.isActiveSeriesIndex(seriesIndex);
  }

  isActiveSeriesIndex(seriesIndex) {
    return this.series.indexOf(this.activeSeries) === seriesIndex;
  }

  isShowSelectSeriesInput() {
    return (
      this.trialIdsToShow.length &&
      this.hasEditableSeries() &&
      this.isSelectSeriesVisible &&
      this.series.length > 1
    );
  }

  newTrialButtonClicked() {
    this.newTrial();
    this.addNextComponentStateToUndoStack = true;
    this.studentDataChanged();
  }

  newTrial() {
    const activeSeriesIndex = this.getSeriesIndex(this.activeSeries);
    const trialNumbers = this.getTrialNumbers();
    let maxTrialNumber = 0;
    if (trialNumbers.length > 0) {
      maxTrialNumber = trialNumbers[trialNumbers.length - 1];
    }
    if (this.hideAllTrialsOnNewTrial) {
      for (const trial of this.trials) {
        trial.show = false;
      }
    }
    const series = this.UtilService.makeCopyOfJSONObject(this.componentContent.series);
    const trial = {
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

  getTrialNumbers() {
    const trialNumbers = [];
    const trialNumberRegex = /Trial (\d*)/;
    for (const trial of this.trials) {
      const tempTrialName = trial.name;
      const match = trialNumberRegex.exec(tempTrialName);
      if (match != null && match.length > 0) {
        const tempTrialNumber = match[1];
        trialNumbers.push(parseInt(tempTrialNumber));
      }
    }
    trialNumbers.sort();
    return trialNumbers;
  }

  deleteTrial(trialIndex) {
    const trialToRemove = this.trials[trialIndex];
    const trialToRemoveId = trialToRemove.id;
    this.trials.splice(trialIndex, 1);
    for (let t = 0; t < this.trialIdsToShow.length; t++) {
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

  makeHighestTrialActive() {
    this.activeTrial = null;
    this.activeSeries = null;
    this.series = [];
    const highestTrial = this.getHighestTrial();
    if (highestTrial != null) {
      const seriesIndex = this.getSeriesIndex(this.activeSeries);
      this.activeTrial = highestTrial;
      this.setSeries(this.activeTrial.series);
      if (seriesIndex != null) {
        this.setActiveSeriesByIndex(seriesIndex);
      }
    }
  }

  getHighestTrial() {
    let highestTrialIndex = null;
    let highestTrial = null;
    for (const trialId of this.trialIdsToShow) {
      const trial = this.getTrialById(trialId);
      const trialIndex = this.getTrialIndex(trial);
      if (highestTrialIndex == null || trialIndex > highestTrialIndex) {
        highestTrialIndex = trialIndex;
        highestTrial = trial;
      }
    }
    return highestTrial;
  }

  activeTrialChanged() {
    const seriesIndex = this.getSeriesIndex(this.activeSeries);
    const activeTrial = this.activeTrial;
    this.series = activeTrial.series;
    this.setActiveSeriesByIndex(seriesIndex);
    this.addNextComponentStateToUndoStack = true;
    this.studentDataChanged();
  }

  trialIdsToShowChanged() {
    this.showOrHideTrials(this.trialIdsToShow);
    this.setActiveTrialAndSeriesByTrialIdsToShow(this.trialIdsToShow);
    // hack: for some reason, the ids to show model gets out of sync when deleting a trial, for example
    // TODO: figure out why this check is sometimes necessary and remove
    for (let a = 0; a < this.trialIdsToShow.length; a++) {
      const idToShow = this.trialIdsToShow[a];
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
    if (
      this.previousTrialIdsToShow != null &&
      this.trialIdsToShow != null &&
      !this.UtilService.arraysContainSameValues(this.previousTrialIdsToShow, this.trialIdsToShow)
    ) {
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

  showOrHideTrials(trialIdsToShow) {
    for (const trial of this.trials) {
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
  }

  setActiveTrialAndSeriesByTrialIdsToShow(trialIdsToShow) {
    if (trialIdsToShow.length > 0) {
      const lastShownTrialId = trialIdsToShow[trialIdsToShow.length - 1];
      const lastShownTrial = this.getTrialById(lastShownTrialId);
      if (this.hasEditableSeries(lastShownTrial.series)) {
        this.activeTrial = lastShownTrial;
        let seriesIndex = this.getSeriesIndex(this.activeSeries);
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

  isSeriesEditable(multipleSeries, index) {
    if (multipleSeries[index] != null) {
      return multipleSeries[index].canEdit;
    }
    return false;
  }

  getLatestEditableSeriesIndex(multipleSeries) {
    for (let s = multipleSeries.length - 1; s >= 0; s--) {
      if (multipleSeries[s].canEdit) {
        return s;
      }
    }
    return null;
  }

  setTrialIdsToShow() {
    const idsToShow = [];
    for (const trial of this.trials) {
      if (trial.show) {
        idsToShow.push(trial.id);
      }
    }
    this.trialIdsToShow = idsToShow;
  }

  getSelectedTrialsText() {
    if (this.trialIdsToShow.length === 1) {
      const id = this.trialIdsToShow[0];
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
  processConnectedComponentStudentData(studentData, params) {
    if (params.fields == null) {
      /*
       * we do not need to look at specific fields so we will directly
       * parse the the trial data from the student data.
       */
      this.parseLatestTrial(studentData, params);
    } else {
      // we need to process specific fields in the student data
      for (const field of params.fields) {
        const name = field.name;
        const when = field.when;
        const action = field.action;
        if (when === 'always') {
          if (action === 'write') {
            // TODO
          } else if (action === 'read') {
            this.readConnectedComponentFieldFromStudentData(studentData, params, name);
          }
        } else if (when === 'firstTime') {
          if (action === 'write') {
            // TODO
          } else if (action === 'read') {
            // TODO
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
  readConnectedComponentFieldFromStudentData(studentData, params, name) {
    if (name === 'selectedCells') {
      // only show the trials that are specified in the selectedCells array
      let selectedCells = studentData[name];
      if (selectedCells != null) {
        let selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
        for (let trial of this.trials) {
          if (selectedTrialIds.includes(trial.id)) {
            trial.show = true;
          } else {
            trial.show = false;
          }
        }
      }
    } else if (name === 'trial') {
      this.parseLatestTrial(studentData, params);
    } else if (name === 'trialIdsToDelete') {
      this.deleteTrialsByTrialId(studentData.trialIdsToDelete);
    } else if (name === 'clearGraph' && studentData.clearGraph) {
      this.clearGraph();
    }
  }

  /**
   * Delete the trials
   * @param trialIdsToDelete An array of trial ids to delete
   */
  deleteTrialsByTrialId(trialIdsToDelete) {
    if (trialIdsToDelete != null) {
      for (let trialIdToDelete of trialIdsToDelete) {
        this.deleteTrialId(trialIdToDelete);
      }
    }
  }

  clearGraph() {
    this.trials = [];
    this.newTrial();
    this.resetSeriesHelper();
    this.drawGraph();
  }

  /**
   * Delete a trial
   * @param trialId The trial id string to delete
   */
  deleteTrialId(trialId) {
    for (let t = 0; t < this.trials.length; t++) {
      let trial = this.trials[t];
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
  parseLatestTrial(studentData, params) {
    const latestStudentDataTrial = this.getLatestStudentDataTrial(studentData);
    const latestStudentDataTrialId = latestStudentDataTrial.id;
    this.removeDefaultTrialIfNecessary(latestStudentDataTrialId);
    const latestTrial = this.createNewTrialIfNecessary(latestStudentDataTrialId);
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

  getLatestStudentDataTrial(studentData) {
    let latestStudentDataTrial = null;
    if (studentData.trial != null) {
      latestStudentDataTrial = studentData.trial;
    }
    if (studentData.trials != null && studentData.trials.length > 0) {
      latestStudentDataTrial = studentData.trials[studentData.trials.length - 1];
    }
    return latestStudentDataTrial;
  }

  hideAllTrials() {
    for (const trial of this.trials) {
      trial.show = false;
    }
  }

  createNewTrial(id) {
    return {
      id: id,
      name: '',
      series: [],
      show: true
    };
  }

  copySeries(series) {
    const newSeries: any = {
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

  removeDefaultTrialIfNecessary(latestStudentDataTrialId) {
    /*
     * remove the first default trial that is automatically created
     * when the student first visits the component otherwise there
     * will be a blank trial.
     */
    if (this.trials.length > 0) {
      const firstTrial = this.trials[0];
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

  isTrialHasEmptySeries(trial) {
    return trial.series == null || trial.series.length === 0 || this.isSeriesEmpty(trial.series);
  }

  isSeriesEmpty(series) {
    return series.length === 1 && series[0].data.length === 0;
  }

  deleteFirstTrial(trials) {
    trials.shift();
  }

  createNewTrialIfNecessary(trialId) {
    let trial = this.getTrialById(trialId);
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

  copySeriesIntoTrial(oldTrial, newTrial, studentData, params) {
    newTrial.series = [];
    const series = oldTrial.series;
    for (let s = 0; s < series.length; s++) {
      if (this.isAddSeries(params, s)) {
        newTrial.series.push(this.copySeries(series[s]));
        if (params.highlightLatestPoint) {
          this.$timeout(() => {
            this.highlightPointOnX(studentData.trial.id, studentData.xPointToHighlight);
          }, 1);
        }
      }
    }
  }

  isAddSeries(params, seriesIndex) {
    return (
      params == null ||
      params.seriesNumbers == null ||
      params.seriesNumbers.length === 0 ||
      (params.seriesNumbers != null && params.seriesNumbers.indexOf(seriesIndex) !== -1)
    );
  }

  copyTrialNameIntoTrial(oldTrial, newTrial) {
    if (oldTrial.name != null) {
      newTrial.name = oldTrial.name;
    }
  }

  copyPlotBandsIntoTrial(oldTrial, newTrial) {
    if (oldTrial.xAxis != null && oldTrial.xAxis.plotBands != null) {
      if (newTrial.xAxis == null) {
        newTrial.xAxis = {};
      }
      newTrial.xAxis.plotBands = oldTrial.xAxis.plotBands;
    }
  }

  setLastTrialToActive() {
    if (this.trials.length > 0) {
      this.activeTrial = this.trials[this.trials.length - 1];
      this.activeTrial.show = true;
    }
  }

  getTrialById(id) {
    for (const trial of this.trials) {
      if (trial.id === id) {
        return trial;
      }
    }
    return null;
  }

  hasEditableSeries(series = this.getSeries()) {
    for (const singleSeries of series) {
      if (singleSeries.canEdit) {
        return true;
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
  updateMinMaxAxisValues(series, xAxis, yAxis) {
    const minMaxValues = this.getMinMaxValues(series);
    this.updateXAxisMinMaxIfNecessary(xAxis, minMaxValues);
    this.updateYAxisMinMaxIfNecessary(yAxis, minMaxValues);
  }

  updateXAxisMinMaxIfNecessary(xAxis, minMaxValues) {
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

  updateYAxisMinMaxIfNecessary(yAxis, minMaxValues) {
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

  getMinMaxValues(series) {
    let xMin = 0;
    let xMax = 0;
    let yMin = 0;
    let yMax = 0;
    for (const singleSeries of series) {
      const data = singleSeries.data;
      for (const dataPoint of data) {
        if (dataPoint != null) {
          let tempX = null;
          let tempY = null;
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
    }
    const result = {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    };
    return result;
  }

  clearSeriesIds(series) {
    for (const singleSeries of series) {
      singleSeries.id = null;
    }
  }

  snipGraph($event) {
    const chart = this.getChartById(this.chartId);
    const svgString = chart.getSVG();
    const hiddenCanvas: any = document.getElementById(this.hiddenCanvasId);
    canvg(hiddenCanvas, svgString, {
      renderCallback: () => {
        const base64Image = hiddenCanvas.toDataURL('image/png');
        const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);
        this.NotebookService.addNote(imageObject);
      }
    });
  }

  readCSVIntoActiveSeries(csvString) {
    const lines = csvString.split(/\r\n|\n/);
    this.activeSeries.data = [];
    for (const line of lines) {
      const values = line.split(',');
      const x = parseFloat(values[0]);
      const y = parseFloat(values[1]);
      if (!isNaN(x) && !isNaN(y)) {
        const dataPoint = [x, y];
        this.activeSeries.data.push(dataPoint);
      }
    }
  }

  setUploadedFileName(fileName) {
    this.uploadedFileName = fileName;
  }

  getUploadedFileName() {
    return this.uploadedFileName;
  }

  /**
   * Round the number according to the authoring settings
   * @param number a number
   * @return the rounded number
   */
  performRounding(number) {
    if (this.componentContent.roundValuesTo === 'integer') {
      number = this.roundToNearestInteger(number);
    } else if (this.componentContent.roundValuesTo === 'tenth') {
      number = this.roundToNearestTenth(number);
    } else if (this.componentContent.roundValuesTo === 'hundredth') {
      number = this.roundToNearestHundredth(number);
    }
    return number;
  }

  roundToNearestInteger(x) {
    x = parseFloat(x);
    x = Math.round(x);
    return x;
  }

  roundToNearestTenth(x) {
    x = parseFloat(x);
    x = Math.round(x * 10) / 10;
    return x;
  }

  roundToNearestHundredth(x) {
    x = parseFloat(x);
    x = Math.round(x * 100) / 100;
    return x;
  }

  /**
   * Set the active series to the first series that the student can edit
   * or if there are no series the student can edit, set the active series
   * to the first series.
   */
  setDefaultActiveSeries() {
    for (let s = 0; s < this.series.length; s++) {
      const singleSeries = this.series[s];
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

  setVerticalPlotLine(x) {
    const plotLine = {
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
    this.$timeout(() => {
      this.$scope.$apply();
    });
  }

  /**
   * Import any work we need from connected components
   * @param {boolean} isReset (optional) Whether this function call was
   * triggered by the student clicking the reset button.
   */
  handleConnectedComponents(isReset: boolean = false) {
    /*
     * This will hold all the promises that will return the trials that we want. The trials will
     * either be from this student or from classmates.
     */
    const promises = [];
    /*
     * this will end up containing the background from the last
     * connected component
     */
    let connectedComponentBackgroundImage = null;
    for (const connectedComponent of this.componentContent.connectedComponents) {
      const type = connectedComponent.type;
      if (type === 'showClassmateWork') {
        connectedComponentBackgroundImage = this.handleShowClassmateWorkConnectedComponent(
          connectedComponent,
          promises
        );
      } else if (type === 'showWork' || type === 'importWork' || type == null) {
        connectedComponentBackgroundImage = this.handleShowOrImportWorkConnectedComponent(
          connectedComponent,
          promises
        );
      }
    }

    /*
     * wait for all the promises to resolve because we may need to request the classmate work from
     * the server
     */
    this.$q
      .all(promises)
      .then(
        this.handleConnectedComponentPromiseResults(connectedComponentBackgroundImage, isReset)
      );
  }

  handleShowClassmateWorkConnectedComponent(connectedComponent, promises) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    let connectedComponentBackgroundImage = null;
    this.isDisabled = true;
    if (this.ConfigService.isPreview()) {
      const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        nodeId,
        componentId
      );
      if (latestComponentState != null) {
        promises.push(this.getTrialsFromComponentState(nodeId, componentId, latestComponentState));
        if (
          latestComponentState != null &&
          latestComponentState.studentData != null &&
          latestComponentState.studentData.backgroundImage != null
        ) {
          connectedComponentBackgroundImage = latestComponentState.studentData.backgroundImage;
        }
      }
    } else {
      let periodId = null;
      if (connectedComponent.showClassmateWorkSource === 'period') {
        periodId = this.ConfigService.getPeriodId();
      }
      promises.push(this.getTrialsFromClassmates(nodeId, componentId, periodId));
      let component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
      component = this.ProjectService.injectAssetPaths(component);
      connectedComponentBackgroundImage = component.backgroundImage;
    }
    return connectedComponentBackgroundImage;
  }

  handleShowOrImportWorkConnectedComponent(connectedComponent, promises) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    let connectedComponentBackgroundImage = null;
    let latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    if (latestComponentState != null) {
      if (
        latestComponentState.componentType === 'ConceptMap' ||
        latestComponentState.componentType === 'Draw' ||
        latestComponentState.componentType === 'Label'
      ) {
        let connectedComponentOfComponentState = this.UtilService.getConnectedComponentByComponentState(
          this.componentContent,
          latestComponentState
        );
        if (connectedComponentOfComponentState.importWorkAsBackground === true) {
          promises.push(this.setComponentStateAsBackgroundImage(latestComponentState));
        }
      } else {
        if (connectedComponent.type === 'showWork') {
          latestComponentState = this.UtilService.makeCopyOfJSONObject(latestComponentState);
          const canEdit = false;
          this.setCanEditForAllSeriesInComponentState(latestComponentState, canEdit);
        }
        promises.push(this.getTrialsFromComponentState(nodeId, componentId, latestComponentState));
        if (
          latestComponentState != null &&
          latestComponentState.studentData != null &&
          latestComponentState.studentData.backgroundImage != null
        ) {
          connectedComponentBackgroundImage = latestComponentState.studentData.backgroundImage;
        }
        if (connectedComponent.importGraphSettings) {
          const component = this.ProjectService.getComponentByNodeIdAndComponentId(
            connectedComponent.nodeId,
            connectedComponent.componentId
          );
          this.importGraphSettings(component, latestComponentState);
        }
      }
    }
    return connectedComponentBackgroundImage;
  }

  importGraphSettings(component, componentState) {
    this.title = component.title;
    this.subtitle = component.subtitle;
    this.width = component.width;
    this.height = component.height;
    this.xAxis = componentState.studentData.xAxis;
    this.yAxis = componentState.studentData.yAxis;
  }

  handleConnectedComponentPromiseResults(connectedComponentBackgroundImage, isReset) {
    return (promiseResults) => {
      /*
       * First we will accumulate all the trials into one new component state and then we will
       * perform connected component processing.
       */
      const mergedTrials = [];
      /*
       * Loop through all the promise results. There will be a promise result for each component we
       * are importing from. Each promiseResult is an array of trials or an image url.
       */
      let trialCount = 0;
      let activeTrialIndex = 0;
      let activeSeriesIndex = 0;
      for (const promiseResult of promiseResults) {
        if (promiseResult instanceof Array) {
          const trials = promiseResult;
          for (const trial of trials) {
            if (this.canEditTrial(trial)) {
              activeTrialIndex = trialCount;
            }
            mergedTrials.push(trial);
            trialCount++;
          }
        } else if (typeof promiseResult === 'string') {
          connectedComponentBackgroundImage = promiseResult;
        }
      }
      if (this.isTrialsEnabled()) {
        activeTrialIndex = this.addTrialFromThisComponentIfNecessary(
          mergedTrials,
          trialCount,
          activeTrialIndex
        );
      }
      let newComponentState = this.NodeService.createNewComponentState();
      newComponentState.studentData = {
        trials: mergedTrials,
        activeTrialIndex: activeTrialIndex,
        activeSeriesIndex: activeSeriesIndex,
        version: 2
      };
      if (
        this.componentContent.backgroundImage != null &&
        this.componentContent.backgroundImage !== ''
      ) {
        newComponentState.studentData.backgroundImage = this.componentContent.backgroundImage;
      } else if (connectedComponentBackgroundImage != null) {
        newComponentState.studentData.backgroundImage = connectedComponentBackgroundImage;
      }
      newComponentState = this.handleConnectedComponentsHelper(newComponentState, isReset);
      this.setStudentWork(newComponentState);
      this.studentDataChanged();
    };
  }

  addTrialFromThisComponentIfNecessary(mergedTrials, trialCount, activeTrialIndex) {
    if (this.componentContent.series.length > 0) {
      const trial = this.createNewTrial(this.UtilService.generateKey(10));
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
  setComponentStateAsBackgroundImage(componentState) {
    return this.generateImageFromComponentState(componentState).then((image) => {
      return image.url;
    });
  }

  /**
   * Perform additional connected component processing.
   * @param newComponentState The new component state generated by accumulating the trials from all
   * the connected component student data.
   */
  handleConnectedComponentsHelper(newComponentState, isReset) {
    let mergedComponentState = this.$scope.componentState;
    let firstTime = true;
    if (
      mergedComponentState == null ||
      isReset ||
      !this.GraphService.componentStateHasStudentWork(mergedComponentState)
    ) {
      mergedComponentState = newComponentState;
    } else {
      /*
       * This component has previous student data so this is not the first time this component is
       * being loaded.
       */
      firstTime = false;
    }
    for (const connectedComponent of this.componentContent.connectedComponents) {
      const nodeId = connectedComponent.nodeId;
      const componentId = connectedComponent.componentId;
      const type = connectedComponent.type;
      if (type === 'showClassmateWork') {
        mergedComponentState = newComponentState;
      } else if (type === 'importWork' || type == null) {
        const connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
          nodeId,
          componentId
        );
        const fields = connectedComponent.fields;
        if (connectedComponentState != null) {
          if (connectedComponentState.componentType !== 'Graph') {
            mergedComponentState = this.mergeComponentState(
              mergedComponentState,
              connectedComponentState,
              fields,
              firstTime
            );
          }
        } else {
          mergedComponentState = this.mergeNullComponentState(
            mergedComponentState,
            fields,
            firstTime
          );
        }
      }
    }
    if (mergedComponentState.studentData.version == null) {
      mergedComponentState.studentData.version = this.studentDataVersion;
    }
    if (newComponentState.studentData.backgroundImage != null) {
      mergedComponentState.studentData.backgroundImage =
        newComponentState.studentData.backgroundImage;
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
  mergeComponentState(baseComponentState, connectedComponentState, mergeFields, firstTime) {
    if (mergeFields == null) {
      if (connectedComponentState.componentType === 'Graph' && firstTime) {
        // there are no merge fields specified so we will get all of the fields
        baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(
          connectedComponentState.studentData
        );
      }
    } else {
      // we will merge specific fields
      for (const mergeField of mergeFields) {
        const name = mergeField.name;
        const when = mergeField.when;
        const action = mergeField.action;
        if (when === 'firstTime' && firstTime) {
          if (action === 'write') {
            baseComponentState.studentData[name] = connectedComponentState.studentData[name];
          } else if (action === 'read') {
            // TODO
          }
        } else if (when === 'always') {
          if (action === 'write') {
            baseComponentState.studentData[name] = connectedComponentState.studentData[name];
          } else if (action === 'read') {
            this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
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
  mergeNullComponentState(baseComponentState, mergeFields, firstTime) {
    if (mergeFields == null) {
      // TODO
    } else {
      for (const mergeField of mergeFields) {
        const name = mergeField.name;
        const when = mergeField.when;
        const action = mergeField.action;
        if (when === 'firstTime' && firstTime == true) {
          if (action === 'write') {
            // TODO
          } else if (action === 'read') {
            // TODO
          }
        } else if (when === 'always') {
          if (action === 'write') {
            // TODO
          } else if (action === 'read') {
            const connectedComponentState = null;
            this.readConnectedComponentField(baseComponentState, connectedComponentState, name);
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
  readConnectedComponentField(baseComponentState, connectedComponentState, field) {
    if (field === 'selectedCells') {
      if (connectedComponentState == null) {
        // we will default to hide all the trials
        for (const trial of baseComponentState.studentData.trials) {
          trial.show = false;
        }
      } else {
        // loop through all the trials and show the ones that are in the selected cells array
        const studentData = connectedComponentState.studentData;
        const selectedCells = studentData[field];
        const selectedTrialIds = this.convertSelectedCellsToTrialIds(selectedCells);
        for (const trial of baseComponentState.studentData.trials) {
          if (selectedTrialIds.includes(trial.id)) {
            trial.show = true;
          } else {
            trial.show = false;
          }
        }
      }
    } else if (field === 'trial') {
      // TODO
    }
  }

  setCanEditForAllSeriesInComponentState(componentState, canEdit) {
    for (const trial of componentState.studentData.trials) {
      this.setCanEditForAllSeries(trial.series, canEdit);
    }
  }

  setCanEditForAllSeries(series, canEdit) {
    for (const singleSeries of series) {
      singleSeries.canEdit = canEdit;
    }
  }

  undoClicked() {
    if (this.undoStack.length > 0) {
      const previousComponentState = this.undoStack.pop();
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

  trialCheckboxClicked() {
    this.addNextComponentStateToUndoStack = true;
  }

  getCategoryByIndex(index) {
    if (
      this.componentContent.xAxis != null &&
      this.componentContent.xAxis.categories != null &&
      index < this.componentContent.xAxis.categories.length
    ) {
      return this.componentContent.xAxis.categories[index];
    }
    return null;
  }

  isMousePlotLineOn() {
    return this.isMouseXPlotLineOn() || this.isMouseYPlotLineOn();
  }

  isMouseXPlotLineOn() {
    return this.componentContent.showMouseXPlotLine;
  }

  isMouseYPlotLineOn() {
    return this.componentContent.showMouseYPlotLine;
  }

  isSaveMouseOverPoints() {
    return this.componentContent.saveMouseOverPoints;
  }

  getXValueFromDataPoint(dataPoint) {
    if (dataPoint.constructor.name === 'Object') {
      return dataPoint.x;
    } else if (dataPoint.constructor.name === 'Array') {
      return dataPoint[0];
    }
    return null;
  }

  getYValueFromDataPoint(dataPoint) {
    if (dataPoint.constructor.name === 'Object') {
      return dataPoint.y;
    } else if (dataPoint.constructor.name === 'Array') {
      return dataPoint[1];
    }
    return null;
  }

  getLatestMouseOverPointX() {
    if (this.mouseOverPoints.length > 0) {
      return this.getXValueFromDataPoint(this.mouseOverPoints[this.mouseOverPoints.length - 1]);
    }
    return null;
  }

  getLatestMouseOverPointY() {
    if (this.mouseOverPoints.length > 0) {
      return this.getYValueFromDataPoint(this.mouseOverPoints[this.mouseOverPoints.length - 1]);
    }
    return null;
  }

  showXPlotLineIfOn(text = null) {
    if (this.isMouseXPlotLineOn()) {
      let x = this.getLatestMouseOverPointX();
      if (x == null) {
        x = 0;
      }
      this.showXPlotLine(x, text);
    }
  }

  showYPlotLineIfOn(text = null) {
    if (this.isMouseYPlotLineOn()) {
      let y = this.getLatestMouseOverPointY();
      if (y == null) {
        y = 0;
      }
      this.showYPlotLine(y, text);
    }
  }

  showTooltipOnX(seriesId, x) {
    const chart = this.getChartById(this.chartId);
    if (chart.series.length > 0) {
      let series = null;
      if (seriesId == null) {
        series = chart.series[chart.series.length - 1];
      } else {
        for (const singleSeries of chart.series) {
          if (singleSeries.userOptions.name === seriesId) {
            series = singleSeries;
          }
        }
      }
      const points = series.points;
      for (const point of points) {
        if (point.x === x) {
          chart.tooltip.refresh(point);
        }
      }
    }
  }

  highlightPointOnX(seriesId, x) {
    const chart = this.getChartById(this.chartId);
    if (chart.series.length > 0) {
      let series = null;
      if (seriesId == null) {
        series = chart.series[chart.series.length - 1];
      } else {
        for (const singleSeries of chart.series) {
          if (singleSeries.userOptions.name === seriesId) {
            series = singleSeries;
          }
          this.removeHoverStateFromPoints(singleSeries.points);
        }
      }
      this.setHoverStateOnPoint(series.points, x);
    }
  }

  removeHoverStateFromPoints(points) {
    for (const point of points) {
      point.setState('');
    }
  }

  setHoverStateOnPoint(points, x) {
    for (const point of points) {
      if (point.x === x) {
        point.setState('hover');
      }
    }
  }

  showTooltipOnLatestPoint() {
    const chart = this.getChartById(this.chartId);
    if (chart.series.length > 0) {
      const latestSeries = chart.series[chart.series.length - 1];
      const points = latestSeries.points;
      if (points.length > 0) {
        const latestPoint = points[points.length - 1];
        chart.tooltip.refresh(latestPoint);
      }
    }
  }

  convertSelectedCellsToTrialIds(selectedCells) {
    const selectedTrialIds = [];
    if (selectedCells != null) {
      for (const selectedCell of selectedCells) {
        const material = selectedCell.material;
        const bevTemp = selectedCell.bevTemp;
        const airTemp = selectedCell.airTemp;
        const selectedTrialId = material + '-' + bevTemp + 'Liquid';
        selectedTrialIds.push(selectedTrialId);
      }
    }
    return selectedTrialIds;
  }

  isTrialsEnabled() {
    return this.componentContent.enableTrials === true;
  }

  isStudentDataVersion1(version: number = null) {
    if (version == null) {
      return this.studentDataVersion == null || this.studentDataVersion === 1;
    } else {
      return version === 1;
    }
  }
}

export default GraphController;
