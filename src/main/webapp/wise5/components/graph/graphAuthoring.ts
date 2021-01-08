'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class GraphAuthoringController extends EditComponentController {
  availableGraphTypes: any[];
  availableRoundingOptions: any[];
  availableSymbols: any[];
  availableSeriesTypes: any[];
  availableLineTypes: any[];
  availableXAxisTypes: any[];
  defaultDashStyle: string = 'Solid';
  enableMultipleYAxes: boolean = false;
  numYAxes: number = 0;
  plotTypeToLimitType: any;

  static $inject = [
    '$filter',
    'ConfigService',
    'GraphService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    ConfigService,
    private GraphService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  $onInit() {
    super.$onInit();
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

    this.plotTypeToLimitType = {
      line: 'limits',
      scatter: 'limits',
      column: 'categories'
    };

    this.enableMultipleYAxes = this.isMultipleYAxesEnabled();
    if (this.enableMultipleYAxes) {
      this.numYAxes = this.authoringComponentContent.yAxis.length;
    }
    this.addAnyMissingYAxisFieldsToAllYAxes(this.authoringComponentContent.yAxis);
  }

  isMultipleYAxesEnabled() {
    if (Array.isArray(this.authoringComponentContent.yAxis)) {
      return true;
    }
    return false;
  }

  addSeriesClicked() {
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
    this.componentChanged();
  }

  createNewSeries() {
    return {
      name: '',
      data: [],
      marker: {
        symbol: 'circle'
      },
      canEdit: true
    };
  }

  deleteSeriesClicked(index) {
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
      message = this.$translate('graph.areYouSureYouWantToDeleteTheNamedSeries', {
        seriesName: seriesName
      });
    }
    if (confirm(message)) {
      this.authoringComponentContent.series.splice(index, 1);
      this.componentChanged();
    }
  }

  enableTrialsClicked() {
    if (this.authoringComponentContent.enableTrials) {
      this.authoringComponentContent.canCreateNewTrials = true;
      this.authoringComponentContent.canDeleteTrials = true;
    } else {
      this.authoringComponentContent.canCreateNewTrials = false;
      this.authoringComponentContent.canDeleteTrials = false;
      this.authoringComponentContent.hideAllTrialsOnNewTrial = true;
    }
    this.componentChanged();
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

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }) {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'background') {
      this.authoringComponentContent.backgroundImage = assetItem.fileName;
      this.componentChanged();
    }
  }

  addXAxisCategory() {
    this.authoringComponentContent.xAxis.categories.push('');
    this.componentChanged();
  }

  deleteXAxisCategory(index) {
    let confirmMessage = '';
    let categoryName = '';
    if (
      this.authoringComponentContent.xAxis != null &&
      this.authoringComponentContent.xAxis.categories != null
    ) {
      categoryName = this.authoringComponentContent.xAxis.categories[index];
    }
    if (categoryName == null || categoryName === '') {
      confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheCategory');
    } else {
      confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedCategory', {
        categoryName: categoryName
      });
    }
    if (confirm(confirmMessage)) {
      this.authoringComponentContent.xAxis.categories.splice(index, 1);
      this.componentChanged();
    }
  }

  addSeriesDataPoint(series) {
    if (series != null && series.data != null) {
      if (
        this.authoringComponentContent.xAxis.type == null ||
        this.authoringComponentContent.xAxis.type === 'limits'
      ) {
        series.data.push([]);
      } else if (this.authoringComponentContent.xAxis.type === 'categories') {
        series.data.push(null);
      }
    }
    this.componentChanged();
  }

  deleteSeriesDataPoint(series, index) {
    if (series != null && series.data != null) {
      if (confirm(this.$translate('graph.areYouSureYouWantToDeleteTheDataPoint'))) {
        series.data.splice(index, 1);
        this.componentChanged();
      }
    }
  }

  moveSeriesDataPointUp(series, index) {
    if (index > 0) {
      const dataPoint = series.data[index];
      series.data.splice(index, 1);
      series.data.splice(index - 1, 0, dataPoint);
    }
    this.componentChanged();
  }

  moveSeriesDataPointDown(series, index) {
    if (index < series.data.length - 1) {
      const dataPoint = series.data[index];
      series.data.splice(index, 1);
      series.data.splice(index + 1, 0, dataPoint);
    }
    this.componentChanged();
  }

  xAxisTypeChanged(newValue: string, oldValue: string): void {
    if (oldValue === 'categories' && newValue === 'limits') {
      delete this.authoringComponentContent.xAxis.categories;
      this.authoringComponentContent.xAxis.min = 0;
      this.authoringComponentContent.xAxis.max = 10;
      this.convertAllSeriesDataPoints(newValue);
    } else if (
      (oldValue === 'limits' || oldValue === '' || oldValue == null) &&
      newValue === 'categories'
    ) {
      delete this.authoringComponentContent.xAxis.min;
      delete this.authoringComponentContent.xAxis.max;
      delete this.authoringComponentContent.xAxis.units;
      delete this.authoringComponentContent.yAxis.units;
      this.authoringComponentContent.xAxis.categories = [
        this.$translate('graph.categoryOne'),
        this.$translate('graph.categoryTwo')
      ];
      this.convertAllSeriesDataPoints(newValue);
    }
    this.componentChanged();
  }

  convertAllSeriesDataPoints(xAxisType) {
    const series = this.authoringComponentContent.series;
    for (const singleSeries of series) {
      this.convertSeriesDataPoints(singleSeries, xAxisType);
    }
  }

  /**
   * Convert all the data points in the series
   * @param series convert the data points in the series
   * @param xAxisType the new x axis type to convert to
   */
  convertSeriesDataPoints(series, xAxisType) {
    const data = series.data;
    const convertedData = [];
    for (let d = 0; d < data.length; d++) {
      const oldDataPoint = data[d];
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

  enableMultipleYAxesChanged() {
    if (this.enableMultipleYAxes) {
      this.convertSingleYAxisToMultipleYAxes();
      this.numYAxes = this.authoringComponentContent.yAxis.length;
      this.addYAxisToAllSeries();
      this.addColorToYAxes();
      this.addColorToSeries();
      this.componentChanged();
    } else {
      if (confirm(this.$translate('graph.areYouSureYouWantToRemoveMultipleYAxes'))) {
        this.convertMultipleYAxesToSingleYAxis();
        this.numYAxes = this.authoringComponentContent.yAxis.length;
        this.removeYAxisFromAllSeries();
        this.componentChanged();
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
        yAxis.title.style.color = this.GraphService.getSeriesColor(index);
      }
      if (yAxis.labels.style.color == null || yAxis.labels.style.color === '') {
        yAxis.labels.style.color = this.GraphService.getSeriesColor(index);
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
      this.componentChanged();
    } else if (newValue < oldValue) {
      if (confirm(this.$translate('graph.areYouSureYouWantToDecreaseTheNumberOfYAxes'))) {
        this.decreaseYAxes(newValue);
        this.updateSeriesYAxesIfNecessary();
        this.componentChanged();
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
    this.authoringComponentContent.yAxis = this.authoringComponentContent.yAxis.slice(
      0,
      newNumYAxes
    );
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
    this.componentChanged();
  }

  updateSeriesColors(yAxisIndex, color) {
    for (const singleSeries of this.authoringComponentContent.series) {
      if (singleSeries.yAxis === yAxisIndex) {
        singleSeries.color = color;
      }
    }
  }

  addAnyMissingYAxisFieldsToAllYAxes(yAxis) {
    if (this.GraphService.isMultipleYAxes(yAxis)) {
      yAxis.forEach((yAxis) => this.addAnyMissingYAxisFields(yAxis));
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
    this.componentChanged();
  }

  graphTypeChanged(): void {
    const graphType = this.authoringComponentContent.graphType;
    this.updateAllSeriesPlotTypes(graphType);
    this.changeXAxisTypeIfNecessary(graphType);
    this.componentChanged();
  }

  updateAllSeriesPlotTypes(plotType: string): void {
    const multipleSeries = this.authoringComponentContent.series;
    for (const singleSeries of multipleSeries) {
      singleSeries.type = plotType;
      this.updateDashStyleField(singleSeries);
    }
  }

  changeXAxisTypeIfNecessary(graphType: string): void {
    const oldXAxisType = this.authoringComponentContent.xAxis.type;
    const newXAxisType = this.plotTypeToLimitType[graphType];
    if (oldXAxisType != newXAxisType) {
      this.authoringComponentContent.xAxis.type = newXAxisType;
      this.xAxisTypeChanged(newXAxisType, oldXAxisType);
    }
  }

  seriesTypeChanged(series: any): void {
    this.updateDashStyleField(series);
    this.componentChanged();
  }

  updateDashStyleField(series: any): void {
    if (series.type === 'line') {
      series.dashStyle = this.defaultDashStyle;
    } else {
      delete series.dashStyle;
    }
  }
}

const GraphAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: GraphAuthoringController,
  controllerAs: 'graphController',
  templateUrl: 'wise5/components/graph/authoring.html'
};

export default GraphAuthoring;
