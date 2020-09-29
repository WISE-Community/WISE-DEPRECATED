'use strict';

import GraphController from "./graphController";
import html2canvas from 'html2canvas';
import { ProjectAssetService } from "../../../site/src/app/services/projectAssetService";

class GraphAuthoringController extends GraphController {
  ProjectAssetService: ProjectAssetService;

  availableGraphTypes: any[];
  availableRoundingOptions: any[];
  availableSymbols: any[];
  availableSeriesTypes: any[];
  availableLineTypes: any[];
  availableXAxisTypes: any[];
  numYAxes: number;
  enableMultipleYAxes: boolean;
  legendEnabled: boolean;

  static $inject = [
    '$filter',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService',
    'ConfigService',
    'GraphService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnnotationService,
              ConfigService,
              GraphService,
              NodeService,
              NotebookService,
              NotificationService,
              ProjectAssetService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      ConfigService,
      GraphService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.ProjectAssetService = ProjectAssetService;

    this.availableGraphTypes = [
      {
        value: 'line',
        text: this.$translate('graph.linePlot')
      },
      {
        value: 'column',
        text: this.$translate('graph.columnPlot')
      },
      {
        value: 'scatter',
        text: this.$translate('graph.scatterPlot')
      }
    ];

    this.availableRoundingOptions = [
      {
        value: null,
        text: this.$translate('graph.noRounding')
      },
      {
        value: 'integer',
        text: this.$translate('graph.roundToInteger')
      },
      {
        value: 'tenth',
        text: this.$translate('graph.roundToTenth')
      },
      {
        value: 'hundredth',
        text: this.$translate('graph.roundToHundredth')
      }
    ];

    this.availableSymbols = [
      {
        value: 'circle',
        text: this.$translate('graph.circle')
      },
      {
        value: 'square',
        text: this.$translate('graph.square')
      },
      {
        value: 'triangle',
        text: this.$translate('graph.triangle')
      },
      {
        value: 'triangle-down',
        text: this.$translate('graph.triangleDown')
      },
      {
        value: 'diamond',
        text: this.$translate('graph.diamond')
      }
    ];

    this.availableSeriesTypes = [
      {
        value: 'line',
        text: this.$translate('graph.line')
      },
      {
        value: 'scatter',
        text: this.$translate('graph.point')
      }
    ];

    this.availableLineTypes = [
      {
        value: 'Solid',
        text: this.$translate('graph.solid')
      },
      {
        value: 'Dash',
        text: this.$translate('graph.dash')
      },
      {
        value: 'Dot',
        text: this.$translate('graph.dot')
      },
      {
        value: 'ShortDash',
        text: this.$translate('graph.shortDash')
      },
      {
        value: 'ShortDot',
        text: this.$translate('graph.shortDot')
      }
    ];

    this.availableXAxisTypes = [
      {
        value: 'limits',
        text: 'Limits'
      },
      {
        value: 'categories',
        text: 'Categories'
      }
    ];

    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'ConceptMap' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'Table' }
    ];

    this.isResetSeriesButtonVisible = true;
    this.isSelectSeriesVisible = true;
    this.backgroundImage = this.componentContent.backgroundImage;
    this.numYAxes = 0;
    this.enableMultipleYAxes = this.isMultipleYAxesEnabled();
    if (this.enableMultipleYAxes) {
      this.numYAxes = this.authoringComponentContent.yAxis.length;
    }
    this.addAnyMissingYAxisFieldsToAllYAxes(this.authoringComponentContent.yAxis);

    $scope.$watch(() => {
      return this.authoringComponentContent;
    }, (newValue, oldValue) => {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.series = null;
      this.xAxis = this.componentContent.xAxis;
      this.yAxis = this.componentContent.yAxis;
      this.yAxisLocked = this.isYAxisLocked();
      this.submitCounter = 0;
      this.backgroundImage = this.componentContent.backgroundImage;
      this.enableMultipleYAxes = this.isMultipleYAxesEnabled();
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.graphType = this.componentContent.graphType;
      this.isResetSeriesButtonVisible = true;
      this.isSelectSeriesVisible = true;
      this.legendEnabled = !this.componentContent.hideLegend;
      this.showTrialSelect = !this.componentContent.hideTrialSelect;
      this.setSeries(this.UtilService.makeCopyOfJSONObject(this.componentContent.series));
      this.setDefaultActiveSeries();
      this.trials = [];
      this.newTrial();
      this.clearPlotLines();
      this.drawGraph();
    }, true);
  }

  isMultipleYAxesEnabled() {
    if (Array.isArray(this.authoringComponentContent.yAxis)) {
      return true;
    }
    return false;
  }

  authoringAddSeriesClicked() {
    const newSeries: any = this.createNewSeries();
    if (this.authoringComponentContent.graphType === 'line') {
      newSeries.type = 'line';
      newSeries.dashStyle = 'Solid';
    } else if (this.authoringComponentContent.graphType === 'scatter') {
      newSeries.type = 'scatter';
    }
    if (this.enableMultipleYAxes) {
      newSeries.yAxis = 0;
      this.setSeriesColorToMatchYAxisColor(newSeries);
    }
    this.authoringComponentContent.series.push(newSeries);
    this.authoringViewComponentChanged();
  }

  authoringDeleteSeriesClicked(index) {
    let message = '';
    let seriesName = '';
    if (this.authoringComponentContent.series != null) {
      const series = this.authoringComponentContent.series[index];
      if (series != null && series.name != null) {
        seriesName = series.name;
      }
    }
    if (seriesName == null || seriesName === '') {
      message = this.$translate('graph.areYouSureYouWantToDeleteTheSeries');
    } else {
      message = this.$translate('graph.areYouSureYouWantToDeleteTheNamedSeries', { seriesName: seriesName });
    }
    if (confirm(message)) {
      this.authoringComponentContent.series.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  authoringViewEnableTrialsClicked() {
    if (this.authoringComponentContent.enableTrials) {
      this.authoringComponentContent.canCreateNewTrials = true;
      this.authoringComponentContent.canDeleteTrials = true;
    } else {
      this.authoringComponentContent.canCreateNewTrials = false;
      this.authoringComponentContent.canDeleteTrials = false;
      this.authoringComponentContent.hideAllTrialsOnNewTrial = true;
    }
    this.authoringViewComponentChanged();
  }

  showChooseBackgroundImagePopup() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.openAssetChooser(params);
  }

  openAssetChooser(params: any) {
    this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { this.assetSelected(data) }
    );
  }

  assetSelected(args: any) {
    const fileName = args.assetItem.fileName;
    if (args.target === 'rubric') {
      const summernoteId = this.getSummernoteId(args);
      this.restoreSummernoteCursorPosition(summernoteId);
      const fullAssetPath = this.getFullAssetPath(fileName);
      if (this.UtilService.isImage(fileName)) {
        this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
      } else if (this.UtilService.isVideo(fileName)) {
        this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
      }
    } else if (args.target === 'background') {
      this.authoringComponentContent.backgroundImage = fileName;
      this.authoringViewComponentChanged();
    }
  }

  authoringAddXAxisCategory() {
    this.authoringComponentContent.xAxis.categories.push('');
    this.authoringViewComponentChanged();
  }

  authoringDeleteXAxisCategory(index) {
    let confirmMessage = '';
    let categoryName = '';
    if (this.authoringComponentContent.xAxis != null &&
      this.authoringComponentContent.xAxis.categories != null) {
      categoryName = this.authoringComponentContent.xAxis.categories[index];
    }
    if (categoryName == null || categoryName === '') {
      confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheCategory');
    } else {
      confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedCategory', { categoryName: categoryName });
    }
    if (confirm(confirmMessage)) {
      this.authoringComponentContent.xAxis.categories.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  authoringAddSeriesDataPoint(series) {
    if (series != null && series.data != null) {
      if (this.authoringComponentContent.xAxis.type == null ||
        this.authoringComponentContent.xAxis.type === 'limits') {
        series.data.push([]);
      } else if (this.authoringComponentContent.xAxis.type === 'categories') {
        series.data.push(null);
      }
    }
    this.authoringViewComponentChanged();
  }

  authoringDeleteSeriesDataPoint(series, index) {
    if (series != null && series.data != null) {
      if (confirm(this.$translate('graph.areYouSureYouWantToDeleteTheDataPoint'))) {
        series.data.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringMoveSeriesDataPointUp(series, index) {
    if (index > 0) {
      const dataPoint = series.data[index];
      series.data.splice(index, 1);
      series.data.splice(index - 1, 0, dataPoint);
    }
    this.authoringViewComponentChanged();
  }

  authoringMoveSeriesDataPointDown(series, index) {
    if (index < series.data.length - 1) {
      const dataPoint = series.data[index];
      series.data.splice(index, 1);
      series.data.splice(index + 1, 0, dataPoint);
    }
    this.authoringViewComponentChanged();
  }

  authoringViewXAxisTypeChanged(newValue, oldValue) {
    if (confirm(this.$translate('graph.areYouSureYouWantToChangeTheXAxisType'))) {
      if (oldValue === 'categories' && newValue === 'limits') {
        delete this.authoringComponentContent.xAxis.categories;
        this.authoringComponentContent.xAxis.min = 0;
        this.authoringComponentContent.xAxis.max = 10;
        this.authoringConvertAllSeriesDataPoints(newValue);
      } else if ((oldValue === 'limits' || oldValue === '' || oldValue == null) &&
          newValue === 'categories') {
        delete this.authoringComponentContent.xAxis.min;
        delete this.authoringComponentContent.xAxis.max;
        delete this.authoringComponentContent.xAxis.units;
        delete this.authoringComponentContent.yAxis.units;
        this.authoringComponentContent.xAxis.categories = [];
        this.authoringConvertAllSeriesDataPoints(newValue);
      }
    } else {
      this.authoringComponentContent.xAxis.type = oldValue;
    }
    this.authoringViewComponentChanged();
  }

  authoringConvertAllSeriesDataPoints(xAxisType) {
    const series = this.authoringComponentContent.series;
    for (const singleSeries of series) {
      this.convertSeriesDataPoints(singleSeries, xAxisType);
    }
  }

  authoringAddConnectedComponent() {
    const newConnectedComponent = {
      nodeId: this.nodeId,
      componentId: null,
      type: null
    };
    this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);
    if (this.authoringComponentContent.connectedComponents.length > 1 ||
        this.authoringComponentContent.series.length > 0) {
      /*
       * there is more than one connected component so we will enable
       * trials so that each connected component can put work in a
       * different trial
       */
      this.authoringComponentContent.enableTrials = true;
    }
    this.authoringViewComponentChanged();
  }

  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (this.isConnectedComponentTypeAllowed(component.type) &&
          component.id != this.componentId) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      connectedComponent.componentId = allowedComponent.id;
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
    }
  }

  authoringAddConnectedComponentSeriesNumber(connectedComponent) {
    if (connectedComponent.seriesNumbers == null) {
      connectedComponent.seriesNumbers = [];
    }
    connectedComponent.seriesNumbers.push(null);
    this.authoringViewComponentChanged();
  }

  authoringDeleteConnectedComponentSeriesNumber(connectedComponent, seriesNumberIndex) {
    if (connectedComponent.seriesNumbers == null) {
      connectedComponent.seriesNumbers = [];
    }
    connectedComponent.seriesNumbers.splice(seriesNumberIndex, 1);
    this.authoringViewComponentChanged();
  }

  authoringConnectedComponentSeriesNumberChanged(connectedComponent, seriesNumberIndex, value) {
    if (connectedComponent.seriesNumbers == null) {
      connectedComponent.seriesNumbers = [];
    }
    if (seriesNumberIndex < connectedComponent.seriesNumbers.length) {
      connectedComponent.seriesNumbers[seriesNumberIndex] = value;
    }
    this.authoringViewComponentChanged();
  }

  authoringConnectedComponentComponentIdChanged(connectedComponent) {
    const connectedComponentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (connectedComponentType !== 'Embedded') {
      delete connectedComponent.seriesNumbers;
    }
    if (connectedComponentType !== 'Table') {
      delete connectedComponent.skipFirstRow;
      delete connectedComponent.xColumn;
      delete connectedComponent.yColumn;
    }
    if (connectedComponentType !== 'Graph') {
      delete connectedComponent.showClassmateWorkSource;
    }
    if (connectedComponentType === 'Table') {
      connectedComponent.skipFirstRow = true;
      connectedComponent.xColumn = 0;
      connectedComponent.yColumn = 1;
    }
    connectedComponent.type = 'importWork';
    this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
    this.authoringViewComponentChanged();
  }

  connectedComponentShowClassmateWorkChanged(connectedComponent) {
    if (connectedComponent.showClassmateWork) {
      connectedComponent.showClassmateWorkSource = 'period';
    } else {
      delete connectedComponent.showClassmateWork;
      delete connectedComponent.showClassmateWorkSource;
    }
    this.authoringViewComponentChanged();
  }

  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    const componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (['ConceptMap','Draw','Label'].includes(componentType)) {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  authoringConnectedComponentTypeChanged(connectedComponent) {
    if (connectedComponent.type === 'importWork') {
      delete connectedComponent.showClassmateWorkSource;
    } else if (connectedComponent.type === 'showWork') {
      delete connectedComponent.showClassmateWorkSource;
    } else if (connectedComponent.type === 'showClassmateWork') {
      /*
       * the type has changed to show classmate work so we will enable
       * trials so that each classmate work will show up in a
       * different trial
       */
      this.authoringComponentContent.enableTrials = true;
      if (connectedComponent.showClassmateWorkSource == null) {
        connectedComponent.showClassmateWorkSource = 'period';
      }
    }
    this.authoringViewComponentChanged();
  }

  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (!connectedComponent.importWorkAsBackground) {
      delete connectedComponent.importWorkAsBackground;
    }
    this.authoringViewComponentChanged();
  }

  authoringAddXAxisPlotLine() {
    if (this.authoringComponentContent.xAxis.plotLines == null) {
      this.authoringComponentContent.xAxis.plotLines = [];
    }
    const plotLine = {
      color: 'gray',
      width: 1,
      value: null,
      label: {
        text: '',
        verticalAlign: 'bottom',
        textAlign: 'right',
        y: -10,
        style: {
          fontWeight: 'bold'
        }
      }
    };
    this.authoringComponentContent.xAxis.plotLines.push(plotLine);
  }

  authoringDeleteXAxisPlotLine(index) {
    this.authoringComponentContent.xAxis.plotLines.splice(index, 1);
    this.authoringViewComponentChanged();
  }

  authoringAddYAxisPlotLine() {
    if (this.authoringComponentContent.yAxis.plotLines == null) {
      this.authoringComponentContent.yAxis.plotLines = [];
    }
    const plotLine = {
      color: 'gray',
      width: 1,
      value: null,
      label: {
        text: '',
        style: {
          fontWeight: 'bold'
        }
      }
    };
    this.authoringComponentContent.yAxis.plotLines.push(plotLine);
  }

  authoringDeleteYAxisPlotLine(index) {
    this.authoringComponentContent.yAxis.plotLines.splice(index, 1);
    this.authoringViewComponentChanged();
  }

  enableMultipleYAxesChanged() {
    if (this.enableMultipleYAxes) {
      this.convertSingleYAxisToMultipleYAxes();
      this.numYAxes = this.authoringComponentContent.yAxis.length;
      this.addYAxisToAllSeries();
      this.addColorToYAxes();
      this.addColorToSeries();
      this.authoringViewComponentChanged();
    } else {
      if (confirm(this.$translate('graph.areYouSureYouWantToRemoveMultipleYAxes'))) {
        this.convertMultipleYAxesToSingleYAxis();
        this.numYAxes = this.authoringComponentContent.yAxis.length;
        this.removeYAxisFromAllSeries();
        this.authoringViewComponentChanged();
      } else {
        this.enableMultipleYAxes = true;
      }
    }
  }

  convertSingleYAxisToMultipleYAxes() {
    const firstYAxis = this.authoringComponentContent.yAxis;
    this.addAnyMissingYAxisFields(firstYAxis);
    const secondYAxis = this.createYAxisObject();
    secondYAxis.opposite = true;
    this.authoringComponentContent.yAxis = [firstYAxis, secondYAxis];
  }

  createYAxisObject() {
    return {
      title: {
        text: '',
        useHTML: true,
        style: {
          color: null
        }
      },
      labels: {
        style: {
          color: null
        }
      },
      min: 0,
      max: 100,
      units: '',
      locked: true,
      useDecimals: false,
      opposite: false
    };
  }

  convertMultipleYAxesToSingleYAxis() {
    this.authoringComponentContent.yAxis = this.authoringComponentContent.yAxis[0];
  }

  addYAxisToAllSeries() {
    for (const singleSeries of this.authoringComponentContent.series) {
      singleSeries.yAxis = 0;
    }
  }

  removeYAxisFromAllSeries() {
    for (const singleSeries of this.authoringComponentContent.series) {
      delete singleSeries.yAxis;
    }
  }

  addColorToYAxes() {
    for (let index = 0; index < this.authoringComponentContent.yAxis.length; index++) {
      const yAxis = this.authoringComponentContent.yAxis[index];
      if (yAxis.title.style.color == null || yAxis.title.style.color === '') {
        yAxis.title.style.color = this.seriesColors[index];
      }
      if (yAxis.labels.style.color == null || yAxis.labels.style.color === '') {
        yAxis.labels.style.color = this.seriesColors[index];
      }
    }
  }

  addColorToSeries() {
    for (const singleSeries of this.authoringComponentContent.series) {
      this.setSeriesColorToMatchYAxisColor(singleSeries);
    }
  }

  setSeriesColorToMatchYAxisColor(series) {
    series.color = this.getYAxisColor(series.yAxis);
  }

  getYAxisColor(index) {
    return this.authoringComponentContent.yAxis[index].labels.style.color;
  }

  numYAxesChanged(newValue, oldValue) {
    if (newValue > oldValue) {
      this.increaseYAxes(newValue);
      this.addColorToYAxes();
      this.authoringViewComponentChanged();
    } else if (newValue < oldValue) {
      if (confirm(this.$translate('graph.areYouSureYouWantToDecreaseTheNumberOfYAxes'))) {
        this.decreaseYAxes(newValue);
        this.updateSeriesYAxesIfNecessary();
        this.authoringViewComponentChanged();
      } else {
        this.numYAxes = oldValue;
      }
    }
  }

  increaseYAxes(newNumYAxes) {
    const oldNumYAxes = this.authoringComponentContent.yAxis.length;
    const numYAxesToAdd = newNumYAxes - oldNumYAxes;
    for (let n = 0; n < numYAxesToAdd; n++) {
      this.authoringComponentContent.yAxis.push(this.createYAxisObject());
    }
  }

  decreaseYAxes(newNumYAxes) {
    this.authoringComponentContent.yAxis =
        this.authoringComponentContent.yAxis.slice(0, newNumYAxes);
  }

  updateSeriesYAxesIfNecessary() {
    for (const singleSeries of this.authoringComponentContent.series) {
      if (!this.isYAxisIndexExists(singleSeries.yAxis)) {
        singleSeries.yAxis = 0;
        this.setSeriesColorToMatchYAxisColor(singleSeries);
      }
    }
  }

  isYAxisIndexExists(yAxisIndex) {
    return this.authoringComponentContent.yAxis[yAxisIndex] != null;
  }

  yAxisColorChanged(yAxisIndex) {
    const yAxis = this.authoringComponentContent.yAxis[yAxisIndex];
    const color = yAxis.labels.style.color;
    yAxis.title.style.color = color;
    this.updateSeriesColors(yAxisIndex, color);
    this.authoringViewComponentChanged();
  }

  updateSeriesColors(yAxisIndex, color) {
    for (const singleSeries of this.authoringComponentContent.series) {
      if (singleSeries.yAxis === yAxisIndex) {
        singleSeries.color = color;
      }
    } 
  }

  addAnyMissingYAxisFieldsToAllYAxes(yAxis) {
    if (this.isMultipleYAxes(yAxis)) {
      yAxis.forEach(yAxis => this.addAnyMissingYAxisFields(yAxis));
    } else {
      this.addAnyMissingYAxisFields(yAxis);
    }
  }

  addAnyMissingYAxisFields(yAxis) {
    if (yAxis.title == null) {
      yAxis.title = {};
    }
    if (yAxis.title.style == null) {
      yAxis.title.style = {};
    }
    if (yAxis.title.style.color == null) {
      yAxis.title.style.color = '';
    }
    if (yAxis.labels == null) {
      yAxis.labels = {};
    }
    if (yAxis.labels.style == null) {
      yAxis.labels.style = {};
    }
    if (yAxis.labels.style.color == null) {
      yAxis.labels.style.color = '';
    }
    if (yAxis.allowDecimals == null) {
      yAxis.allowDecimals = false;
    }
    if (yAxis.opposite == null) {
      yAxis.opposite = false;
    }
  }

  seriesYAxisChanged(series) {
    this.setSeriesColorToMatchYAxisColor(series);
    this.authoringViewComponentChanged();
  }
}

export default GraphAuthoringController;
