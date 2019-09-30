'use strict';

import GraphController from "./graphController";
import html2canvas from 'html2canvas';

class GraphAuthoringController extends GraphController {
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
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

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

    $scope.$watch(() => {
      return this.authoringComponentContent;
    }, (newValue, oldValue) => {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.series = null;
      this.xAxis = null;
      this.yAxis = null;
      this.submitCounter = 0;
      this.backgroundImage = this.componentContent.backgroundImage;
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

  assetSelected(event, args) {
    if (this.isEventTargetThisComponent(args)) {
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
    this.$mdDialog.hide();
  }

  authoringAddSeriesClicked() {
    const newSeries = this.createNewSeries();
    if (this.authoringComponentContent.graphType === 'line') {
      newSeries.type = 'line';
      newSeries.dashStyle = 'Solid';
    } else if (this.authoringComponentContent.graphType === 'scatter') {
      newSeries.type = 'scatter';
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
    this.$rootScope.$broadcast('openAssetChooser', params);
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
    const components = this.getComponentsByNodeId(connectedComponent.nodeId);
    if (components != null) {
      let numberOfAllowedComponents = 0;
      let allowedComponent = null;
      for (const component of components) {
        if (this.isConnectedComponentTypeAllowed(component.type) &&
            component.id !== this.componentId) {
          numberOfAllowedComponents += 1;
          allowedComponent = component;
        }
      }
      if (numberOfAllowedComponents === 1) {
        // there is only one viable component to connect to so we will use it
        connectedComponent.componentId = allowedComponent.id;
        connectedComponent.type = 'importWork';
        this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      }
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
      /*
       * the component type is not Embedded so we will remove the
       * seriesNumbers field
       */
      delete connectedComponent.seriesNumbers;
    }
    if (connectedComponentType !== 'Table') {
      /*
       * the component type is not Table so we will remove the
       * skipFirstRow, xColumn, and yColumn fields
       */
      delete connectedComponent.skipFirstRow;
      delete connectedComponent.xColumn;
      delete connectedComponent.yColumn;
    }
    if (connectedComponentType !== 'Graph') {
      /*
       * the component type is not Graph so we will remove the
       * show classmate work fields
       */
      delete connectedComponent.showClassmateWorkSource;
    }
    if (connectedComponentType === 'Table') {
      // set default values for the connected component params
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
      /*
       * show classmate work was enabled so we will default the
       * show classmate work source to period
       */
      connectedComponent.showClassmateWorkSource = 'period';
    } else {
      /*
       * the show classmate work was disabled so we will remove
       * the show classmate work fields
       */
      delete connectedComponent.showClassmateWork;
      delete connectedComponent.showClassmateWorkSource;
    }
    this.authoringViewComponentChanged();
  }

  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    const componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (componentType === 'ConceptMap' || componentType === 'Draw' || componentType === 'Label') {
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
}


GraphAuthoringController.$inject = [
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
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default GraphAuthoringController;
