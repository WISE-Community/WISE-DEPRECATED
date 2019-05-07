import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('GraphController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let $httpBackend;
  let graphController;
  let component;
  const createComponentState = (componentStateId, nodeId, componentId, componentStateIdReplyingTo, response) => {
    return {
      id: componentStateId,
      nodeId: nodeId,
      componentId: componentId,
      studentData: {
        response: response,
        componentStateIdReplyingTo: componentStateIdReplyingTo
      }
    };
  };

  beforeEach(angular.mock.module(mainModule.name));

  beforeEach(inject((_$controller_, _$rootScope_, _$httpBackend_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    component = {
      id: '1sc05cn75f',
      type: 'Graph',
      prompt: 'Plot points on the graph.',
      showSaveButton: false,
      showSubmitButton: false,
      graphType: 'line',
      xAxis: {
        title: {
          text: 'Time (seconds)'
        },
        min: 0,
        max: 100,
        units: 's',
        locked: true,
        type: 'limits'
      },
      yAxis: {
        title: {
          text: 'Position (meters)'
        },
        min: 0,
        max: 100,
        units: 'm',
        locked: true
      },
      series: [
        {
          id: 'series-0',
          name: 'Prediction',
          data: [],
          color: 'blue',
          canEdit: true
        }
      ]
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    graphController = $controller('GraphController', { $scope: $scope });
    graphController.nodeId = 'node1';
  }));

  it('should make sure x is within limits', () => {
    let highX = 120;
    highX = graphController.makeSureXIsWithinXMinMaxLimits(highX);
    expect(highX).toEqual(100);
    let lowX = -10;
    lowX = graphController.makeSureXIsWithinXMinMaxLimits(lowX);
    expect(lowX).toEqual(0);
  });

  it('should make sure y is within limits', () => {
    let highY = 120;
    highY = graphController.makeSureYIsWithinYMinMaxLimits(highY);
    expect(highY).toEqual(100);
    let lowY = -10;
    lowY = graphController.makeSureYIsWithinYMinMaxLimits(lowY);
    expect(lowY).toEqual(0);
  });

  it('should get the series from the trials', () => {
    const trials = [
      {
        name: 'Trial 1',
        show: true,
        series: [{
          name: 'Prediction',
          data: [
            [0, 0],
            [10, 20],
            [20, 40]
          ]
        }, {
          name: 'Actual',
          data: [
            [0, 0],
            [10, 30],
            [20, 60]
          ]
        }],
        id: 'u3ijj5vfxd'
      },
      {
        name: 'Trial 2',
        show: true,
        series: [{
          name: 'Prediction',
          data: [
            [0, 0],
            [30, 20],
            [40, 40]
          ]
        }, {
          name: 'Actual',
          data: [
            [0, 0],
            [30, 30],
            [40, 60]
          ]
        }],
        id: 'u3ijj5vfxd'
      }
    ];
    const series = graphController.getSeriesFromTrials(trials);
    expect(series.length).toEqual(4);
  });

  it('should perform rounding', () => {
    const number = 10.234;
    graphController.componentContent.roundValuesTo = 'integer';
    expect(graphController.performRounding(number)).toEqual(10);
    graphController.componentContent.roundValuesTo = 'tenth';
    expect(graphController.performRounding(number)).toEqual(10.2);
    graphController.componentContent.roundValuesTo = 'hundredth';
    expect(graphController.performRounding(number)).toEqual(10.23);
  });

  it('should set the default active series', () => {
    graphController.series = [
      {
        name: 'Series 1',
        canEdit: false,
        data: []
      },
      {
        name: 'Series 2',
        canEdit: true,
        data: []
      }
    ];
    graphController.setDefaultActiveSeries();
    expect(graphController.activeSeries.name).toEqual('Series 2');
  });

  it('should get series by index', () => {
    graphController.series = [
      {
        name: 'Series 1',
        canEdit: false,
        data: []
      },
      {
        name: 'Series 2',
        canEdit: true,
        data: []
      }
    ];
    expect(graphController.getSeriesByIndex(1).name).toEqual('Series 2');
  });

  it('should convert row data to series data', () => {
    const rows = [
      [{ text: 'Time' },{ text: 'Distance'}],
      [{ text: '0' },{ text: '10' }],
      [{ text: '20' },{ text: '30' }]
    ];
    const params = {
      skipFirstRow: true,
      xColumn: 0,
      yColumn: 1
    };
    const data = graphController.convertRowDataToSeriesData(rows, params);
    expect(data[0][0]).toEqual(0);
    expect(data[0][1]).toEqual(10);
    expect(data[1][0]).toEqual(20);
    expect(data[1][1]).toEqual(30);
  });

  it('should get the x column value from params', () => {
    const params1 = {
      skipFirstRow: true,
      xColumn: 1,
      yColumn: 2
    };
    expect(graphController.getXColumnValue(params1)).toEqual(1);
    const params2 = {};
    expect(graphController.getXColumnValue(params2)).toEqual(0);
  });

  it('should get the y column value from params', () => {
    const params1 = {
      skipFirstRow: true,
      xColumn: 1,
      yColumn: 2
    };
    expect(graphController.getYColumnValue(params1)).toEqual(2);
    const params2 = {};
    expect(graphController.getYColumnValue(params2)).toEqual(1);
  });

  it('should check if a series is the active series', () => {
    const series1 = {};
    const series2 = {};
    graphController.series = [
      series1,
      series2
    ];
    graphController.activeSeries = series2;
    expect(graphController.isActiveSeries(series2)).toEqual(true);
  });

  it('should create a new trial', () => {
    const series1 = {};
    const series2 = {};
    graphController.series = [
      series1,
      series2
    ];
    graphController.activeSeries = series1;
    expect(graphController.trials.length).toEqual(0);
    graphController.newTrial();
    expect(graphController.trials.length).toEqual(1);
  });

  it('should get the trial numbers', () => {
    graphController.trials = [];
    const trialNumbersEmpty = graphController.getTrialNumbers();
    expect(trialNumbersEmpty.length).toEqual(0);
    graphController.trials = [
      { name: 'Trial 1' },
      { name: 'Trial 2' },
      { name: 'Trial 3' }
    ];
    const trialNumbers = graphController.getTrialNumbers();
    expect(trialNumbers[0]).toEqual(1);
    expect(trialNumbers[1]).toEqual(2);
    expect(trialNumbers[2]).toEqual(3);
  });

  it('should delete a trial', () => {
    graphController.trials = [
      { name: 'Trial 1' },
      { name: 'Trial 2' },
      { name: 'Trial 3' }
    ];
    expect(graphController.trials.length).toEqual(3);
    graphController.deleteTrial(1);
    expect(graphController.trials.length).toEqual(2);
    expect(graphController.trials[0].name).toEqual('Trial 1');
    expect(graphController.trials[1].name).toEqual('Trial 3');
  });

  it('should make the highest trial active', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa', series: [] },
      { name: 'Trial 2', id: 'bbbbbbbbbb', series: [] },
      { name: 'Trial 3', id: 'cccccccccc', series: [] }
    ];
    graphController.trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    expect(graphController.activeTrial).toEqual(null);
    graphController.makeHighestTrialActive();
    expect(graphController.activeTrial).toEqual(graphController.trials[1]);
  });

  it('should get the highest shown trial', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa' },
      { name: 'Trial 2', id: 'bbbbbbbbbb' },
      { name: 'Trial 3', id: 'cccccccccc' }
    ];
    graphController.trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    expect(graphController.activeTrial).toEqual(null);
    const highestTrial = graphController.getHighestTrial();
    expect(highestTrial).toEqual(graphController.trials[1]);
  });

  it('should set the trial ids to show', () => {
    expect(graphController.trialIdsToShow.length).toEqual(0);
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa', show: true },
      { name: 'Trial 2', id: 'bbbbbbbbbb', show: false },
      { name: 'Trial 3', id: 'cccccccccc', show: true }
    ];
    graphController.setTrialIdsToShow();
    expect(graphController.trialIdsToShow.length).toEqual(2);
    expect(graphController.trialIdsToShow[0]).toEqual('aaaaaaaaaa');
    expect(graphController.trialIdsToShow[1]).toEqual('cccccccccc');
  });

  it('should delete trials by id', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa' },
      { name: 'Trial 2', id: 'bbbbbbbbbb' },
      { name: 'Trial 3', id: 'cccccccccc' }
    ];
    expect(graphController.trials.length).toEqual(3);
    graphController.deleteTrialsByTrialId(['aaaaaaaaaa', 'bbbbbbbbbb']);
    expect(graphController.trials.length).toEqual(1);
  });

  it('should delete trial by id', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa' },
      { name: 'Trial 2', id: 'bbbbbbbbbb' },
      { name: 'Trial 3', id: 'cccccccccc' }
    ];
    expect(graphController.trials.length).toEqual(3);
    graphController.deleteTrialId('bbbbbbbbbb');
    expect(graphController.trials.length).toEqual(2);
  });

  it('should get the latest student data trial', () => {
    const studentData = {
      trials: [
        { name: 'Trial 1', id: 'aaaaaaaaaa' },
        { name: 'Trial 2', id: 'bbbbbbbbbb' }
      ]
    };
    const latestTrial = graphController.getLatestStudentDataTrial(studentData);
    expect(latestTrial.id).toEqual('bbbbbbbbbb');
  });

  it('should hide all trials', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa', show: true },
      { name: 'Trial 2', id: 'bbbbbbbbbb', show: true }
    ];
    expect(graphController.trials[0].show).toEqual(true);
    expect(graphController.trials[1].show).toEqual(true);
    graphController.hideAllTrials();
    expect(graphController.trials[0].show).toEqual(false);
    expect(graphController.trials[1].show).toEqual(false);
  });

  it('should create a new trial object', () => {
    const trial = graphController.createNewTrial('aaaaaaaaaa');
    expect(trial.id).toEqual('aaaaaaaaaa');
    expect(trial.name).toEqual('');
    expect(trial.series.length).toEqual(0);
    expect(trial.show).toEqual(true);
  });

  it('should copy a series', () => {
    const series = {
      name: 'Series 1',
      data: [],
      color: 'blue',
      canEdit: true,
      allowPointSelect: true
    };
    const newSeries = graphController.copySeries(series);
    expect(newSeries.name).toEqual('Series 1');
    expect(newSeries.data.length).toEqual(0);
    expect(newSeries.color).toEqual('blue');
    expect(newSeries.canEdit).toEqual(false);
    expect(newSeries.allowPointSelect).toEqual(false);
  });

  it('should remove default trial if necessary', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa', series: [] }
    ];
    expect(graphController.trials.length).toEqual(1);
    const latestStudentDataTrialId = 2;
    graphController.removeDefaultTrialIfNecessary(latestStudentDataTrialId);
    expect(graphController.trials.length).toEqual(0);
  });

  it('should check if a trial has an empty series', () => {
    const trial1 = { series: [] };
    expect(graphController.isTrialHasEmptySeries(trial1)).toEqual(true);
    const trial2 = { series: [ { id: 'series-0' }, { id: 'series-1' }] };
    expect(graphController.isTrialHasEmptySeries(trial2)).toEqual(false);
  });

  it('should check if a series is empty', () => {
    const series1 = [ { data: [] } ];
    expect(graphController.isSeriesEmpty(series1)).toEqual(true);
    const series2 = [
      { id: 'series-0', data: [[0, 10]] }
    ];
    expect(graphController.isSeriesEmpty(series2)).toEqual(false);
  });

  it('should create new trial if necessary', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa', show: true }
    ];
    const trialId = 2;
    graphController.createNewTrialIfNecessary(trialId);
    expect(graphController.trials.length).toEqual(2);
  });

  it('should not create new trial when not necessary', () => {
    graphController.trials = [
      { name: 'Trial 1', id: 'aaaaaaaaaa', show: true }
    ];
    const trialId = 'aaaaaaaaaa';
    graphController.createNewTrialIfNecessary(trialId);
    expect(graphController.trials.length).toEqual(1);
  });

  it('should copy series into trial', () => {
    const oldTrial = {
      series: [ { id: 'series-0' } ]
    };
    const newTrial = {
      series: []
    };
    const studentData = {};
    const params = {};
    expect(newTrial.series.length).toEqual(0);
    graphController.copySeriesIntoTrial(oldTrial, newTrial, studentData, params);
    expect(newTrial.series.length).toEqual(1);
  });

  it('should copy name into trial', () => {
    const oldTrial = {
      name: 'Trial 1'
    };
    const newTrial = {
      name: 'Trial 2'
    };
    expect(newTrial.name).toEqual('Trial 2');
    graphController.copyTrialNameIntoTrial(oldTrial, newTrial);
    expect(newTrial.name).toEqual('Trial 1');
  });

  it('should get the trial by id', () => {
    const trial1 = { name: 'Trial 1', id: 'aaaaaaaaaa' };
    const trial2 = { name: 'Trial 2', id: 'bbbbbbbbbb' };
    const trial3 = { name: 'Trial 3', id: 'cccccccccc' };
    graphController.trials = [
      trial1,
      trial2,
      trial3
    ];
    expect(graphController.getTrialById('aaaaaaaaaa')).toEqual(trial1);
    expect(graphController.getTrialById('bbbbbbbbbb')).toEqual(trial2);
    expect(graphController.getTrialById('cccccccccc')).toEqual(trial3);
  });

  it('should check if there is an editable series', () => {
    graphController.series = [
      { id: 'series-0', canEdit: false }
    ];
    expect(graphController.hasEditableSeries()).toEqual(false);
    graphController.series = [
      { id: 'series-0', canEdit: true }
    ];
    expect(graphController.hasEditableSeries()).toEqual(true);
    const trial0 = {
      id: 'trial0',
      series: [
        {
          id: 'series0',
          canEdit: false
        },
        {
          id: 'series1',
          canEdit: false
        }
      ]
    };
    expect(graphController.hasEditableSeries(trial0.series)).toEqual(false);
    const trial1 = {
      id: 'trial1',
      series: [
        {
          id: 'series0',
          canEdit: true
        },
        {
          id: 'series1',
          canEdit: false
        }
      ]
    };
    expect(graphController.hasEditableSeries(trial1.series)).toEqual(true);
  });

  it('should get min max values', () => {
    const series = [
      { id: 'series-0', data: [[0, 20], [10, 200]] }
    ];
    const minMaxValues = graphController.getMinMaxValues(series);
    expect(minMaxValues.xMin).toEqual(0);
    expect(minMaxValues.xMax).toEqual(10);
    expect(minMaxValues.yMin).toEqual(0);
    expect(minMaxValues.yMax).toEqual(200);
  });

  it('should update min max axis values', () => {
    const series = [
      { id: 'series-0', data: [[-10, -20], [1000, 2000]] }
    ];
    const xAxis = { min: 0, max: 100 };
    const yAxis = { min: 0, max: 100 };
    graphController.updateMinMaxAxisValues(series, xAxis, yAxis);
    expect(xAxis.min).toEqual(null);
    expect(xAxis.max).toEqual(null);
    expect(yAxis.min).toEqual(null);
    expect(yAxis.max).toEqual(null);
  });

  it('should clear series ids', () => {
    const series = [
      { id: 'series-0' },
      { id: 'series-1' }
    ];
    graphController.clearSeriesIds(series);
    expect(series[0].id).toEqual(null);
    expect(series[1].id).toEqual(null);
  });

  it('should read csv into active series', () => {
    const csvString = `0,100
    10, 200`;
    graphController.activeSeries = {};
    graphController.readCSVIntoActiveSeries(csvString);
    expect(graphController.activeSeries.data[0][0]).toEqual(0);
    expect(graphController.activeSeries.data[0][1]).toEqual(100);
    expect(graphController.activeSeries.data[1][0]).toEqual(10);
    expect(graphController.activeSeries.data[1][1]).toEqual(200);
  });

  it('should convert series data points from limits to categories', () => {
    const series = {
      data: [[0, 100],[10, 200]]
    };
    const xAxisType = 'categories';
    graphController.convertSeriesDataPoints(series, xAxisType);
    expect(series.data[0]).toEqual(100);
    expect(series.data[1]).toEqual(200);
  });

  it('should convert series data points from categories to limits', () => {
    const series = {
      data: [100, 200]
    };
    const xAxisType = 'limits';
    graphController.convertSeriesDataPoints(series, xAxisType);
    expect(series.data[0][1]).toEqual(100);
    expect(series.data[1][1]).toEqual(200);
  });

  it('should set vertical plot line', () => {
    const x = 10;
    graphController.setVerticalPlotLine(x);
    expect(graphController.plotLines.length).toEqual(1);
    expect(graphController.plotLines[0].value).toEqual(10);
  });

  it('should merge component state', () => {
    const baseComponentState = {
      studentData: {
        trials: [
          { id: 'aaaaaaaaaa', name: 'Trial 1', series: [] }
        ]
      }
    };
    const connectedComponentState = {
      studentData: {
        trials: [
          { id: 'bbbbbbbbbb', name: 'Trial 2', series: [] }
        ]
      }
    };
    const mergeFields = [
      {
        name: 'trials',
        when: 'always',
        action: 'write'
      }
    ];
    const firstTime = false;
    expect(baseComponentState.studentData.trials[0].name).toEqual('Trial 1');
    graphController.mergeComponentState(
      baseComponentState, connectedComponentState, mergeFields, firstTime);
    expect(baseComponentState.studentData.trials[0].name).toEqual('Trial 2');
  });

  it('should convert selected cells to trial ids', () => {
    const selectedCells = [
      {
        airTemp: 'Warm',
        bevTemp: 'Hot',
        material: 'Aluminum',
        dateAdded: 1556233173611
      },
      {
        airTemp: 'Warm',
        bevTemp: 'Cold',
        material: 'Aluminum',
        dateAdded: 1556233245396
      }
    ];
    const selectedTrialIds = graphController.convertSelectedCellsToTrialIds(selectedCells);
    expect(selectedTrialIds.length).toEqual(2);
    expect(selectedTrialIds[0]).toEqual('Aluminum-HotLiquid');
    expect(selectedTrialIds[1]).toEqual('Aluminum-ColdLiquid');
  });

  it('should convert null selected cells to empty array of trial ids', () => {
    const selectedCells = null;
    const selectedTrialIds = graphController.convertSelectedCellsToTrialIds(selectedCells);
    expect(selectedTrialIds.length).toEqual(0);
  });

  it('should read the connected component field', () => {
    const studentData = {
      selectedCells: [
        {
          airTemp: 'Warm',
          bevTemp: 'Hot',
          material: 'Aluminum',
          dateAdded: 1556233173611
        },
        {
          airTemp: 'Warm',
          bevTemp: 'Cold',
          material: 'Aluminum',
          dateAdded: 1556233245396
        }
      ]
    };
    const params = {};
    const name = 'selectedCells';
    graphController.trials = [
      { id: 'Aluminum-HotLiquid' },
      { id: 'Aluminum-ColdLiquid' },
      { id: 'Wood-HotLiquid' },
      { id: 'Wood-ColdLiquid' }
    ];
    graphController.readConnectedComponentFieldFromStudentData(studentData, params, name);
    expect(graphController.trials[0].show).toEqual(true);
    expect(graphController.trials[1].show).toEqual(true);
    expect(graphController.trials[2].show).toEqual(false);
    expect(graphController.trials[3].show).toEqual(false);
  });

  it('should click undo', () => {
    graphController.trials = [
      { id: 'aaaaaaaaaa' }
    ];
    const componentState = {
      studentData: {
        trials: [
          { id: 'aaaaaaaaaa' },
          { id: 'bbbbbbbbbb' }
        ]
      }
    };
    graphController.undoStack = [componentState];
    graphController.undoClicked();
    expect(graphController.undoStack.length).toEqual(0);
    expect(graphController.previousComponentState).toEqual(componentState);
    expect(graphController.trials[0].id).toEqual('aaaaaaaaaa');
    expect(graphController.trials[1].id).toEqual('bbbbbbbbbb');
  });

  it('should get the category by index', () => {
    graphController.componentContent = {
      xAxis: {
        categories: [
          'Computers',
          'Phones',
          'Pizzas'
        ]
      }
    };
    expect(graphController.getCategoryByIndex(0)).toEqual('Computers');
    expect(graphController.getCategoryByIndex(1)).toEqual('Phones');
    expect(graphController.getCategoryByIndex(2)).toEqual('Pizzas');
  });

  it('should get the x value from data point', () => {
    const dataPointObject = { x: 10, y: 20 };
    const dataPointArray = [100, 200];
    expect(graphController.getXValueFromDataPoint(dataPointObject)).toEqual(10);
    expect(graphController.getXValueFromDataPoint(dataPointArray)).toEqual(100);
  });

  it('should get the y value from data point', () => {
    const dataPointObject = { x: 10, y: 20 };
    const dataPointArray = [100, 200];
    expect(graphController.getYValueFromDataPoint(dataPointObject)).toEqual(20);
    expect(graphController.getYValueFromDataPoint(dataPointArray)).toEqual(200);
  });

  it('should get the latest mouse over point x', () => {
    graphController.mouseOverPoints = [{ x: 10, y: 20 }, { x: 11, y: 22 }];
    expect(graphController.getLatestMouseOverPointX()).toEqual(11);
    graphController.mouseOverPoints = [[100, 200], [111, 222]];
    expect(graphController.getLatestMouseOverPointX()).toEqual(111);
  });

  it('should get the latest mouse over point y', () => {
    graphController.mouseOverPoints = [{ x: 10, y: 20 }, { x: 11, y: 22 }];
    expect(graphController.getLatestMouseOverPointY()).toEqual(22);
    graphController.mouseOverPoints = [[100, 200], [111, 222]];
    expect(graphController.getLatestMouseOverPointY()).toEqual(222);
  });

  it('should add point to series', () => {
    const series = {
      data: [[10, 20], [100, 200]]
    };
    expect(series.data.length).toEqual(2);
    graphController.addPointToSeries(series, 1000, 2000);
    expect(series.data.length).toEqual(3);
    expect(series.data[2][0]).toEqual(1000);
    expect(series.data[2][1]).toEqual(2000);
  });

  it('should remove point from series', () => {
    const series = {
      data: [[10, 20], [100, 200]]
    };
    expect(series.data.length).toEqual(2);
    graphController.removePointFromSeries(series, 10);
    expect(series.data.length).toEqual(1);
    expect(series.data[0][0]).toEqual(100);
    expect(series.data[0][1]).toEqual(200);
  });

  it('should get the trial index', () => {
    const trial0 = {};
    const trial1 = {};
    const trial2 = {};
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    expect(graphController.getTrialIndex(trial0)).toEqual(0);
    expect(graphController.getTrialIndex(trial1)).toEqual(1);
    expect(graphController.getTrialIndex(trial2)).toEqual(2);
  });

  it('should create the chart config', () => {
    const trial0 = {};
    const trial1 = {};
    const trial2 = {};
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    const deferred = {};
    const title = 'My Graph';
    const xAxis = {
      min: 0,
      max: 100
    };
    const yAxis = {
      min: 0,
      max: 50
    };
    const series = [[10, 20], [100, 200]];
    const zoomType = null;
    const chartConfig = graphController.createChartConfig(deferred, title, xAxis, yAxis, series, zoomType);
    expect(chartConfig.title.text).toEqual('My Graph');
    expect(chartConfig.xAxis.min).toEqual(0);
    expect(chartConfig.xAxis.max).toEqual(100);
    expect(chartConfig.yAxis.min).toEqual(0);
    expect(chartConfig.yAxis.max).toEqual(50);
    expect(chartConfig.series).toEqual(series);
    expect(chartConfig.options.chart.zoomType).toEqual(null);
  });

  it('should check if a series is editable', () => {
    const multipleSeries = [
      { id: 'series0', canEdit: true},
      { id: 'series1', canEdit: false},
      { id: 'series2', canEdit: true}
    ];
    expect(graphController.isSeriesEditable(multipleSeries, 0)).toEqual(true);
    expect(graphController.isSeriesEditable(multipleSeries, 1)).toEqual(false);
    expect(graphController.isSeriesEditable(multipleSeries, 2)).toEqual(true);
  });

  it('should get the latest editable series index', () => {
    const multipleSeries0 = [
      { id: 'series0', canEdit: true},
      { id: 'series1', canEdit: false},
      { id: 'series2', canEdit: false}
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries0)).toEqual(0);
    const multipleSeries1 = [
      { id: 'series0', canEdit: true},
      { id: 'series1', canEdit: true},
      { id: 'series2', canEdit: false}
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries1)).toEqual(1);
    const multipleSeries2 = [
      { id: 'series0', canEdit: true},
      { id: 'series1', canEdit: false},
      { id: 'series2', canEdit: true}
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries2)).toEqual(2);
    const multipleSeries3 = [
      { id: 'series0', canEdit: false},
      { id: 'series1', canEdit: false},
      { id: 'series2', canEdit: false}
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries3)).toEqual(null);
  });

  it('should handle trial ids to show changed', () => {
    const trial0 = {
      id: 'aaaaaaaaaa',
      show: true,
      series: [
        {
          id: '1111111111',
          canEdit: true
        }
      ]
    };
    const trial1 = {
      id: 'bbbbbbbbbb',
      show: true,
      series: [
        {
          id: '2222222222',
          canEdit: true
        }
      ]
    };
    const trial2 = {
      id: 'cccccccccc',
      show: true,
      series: [
        {
          id: '3333333333',
          canEdit: true
        }
      ]
    };
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    graphController.previousTrialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    graphController.trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc'];
    const studentDataChangedSpy = spyOn(graphController, 'studentDataChanged').and.callFake(() => {});
    graphController.trialIdsToShowChanged();
    expect(graphController.activeTrial).toEqual(trial2);
    expect(graphController.activeSeries).toEqual(trial2.series[0]);
    expect(studentDataChangedSpy).toHaveBeenCalled();
  });

  it('should handle trial ids to show changed when the latest trial is not editable', () => {
    const trial0 = {
      id: 'aaaaaaaaaa',
      show: true,
      series: [
        {
          id: '1111111111',
          canEdit: true
        }
      ]
    };
    const trial1 = {
      id: 'bbbbbbbbbb',
      show: true,
      series: [
        {
          id: '2222222222',
          canEdit: true
        }
      ]
    };
    const trial2 = {
      id: 'cccccccccc',
      show: true,
      series: [
        {
          id: '3333333333',
          canEdit: false
        }
      ]
    };
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc'];
    graphController.trialIdsToShow = trialIdsToShow;
    graphController.previousTrialIdsToShow = trialIdsToShow;
    graphController.trialIdsToShowChanged();
    expect(graphController.activeTrial).toEqual(trial1);
    expect(graphController.activeSeries).toEqual(trial1.series[0]);
  });

  it('should show and hide trials', () => {
    const trial0 = {
      id: 'aaaaaaaaaa',
      show: true,
      series: [
        {
          id: '1111111111',
          canEdit: true
        }
      ]
    };
    const trial1 = {
      id: 'bbbbbbbbbb',
      show: true,
      series: [
        {
          id: '2222222222',
          canEdit: true
        }
      ]
    };
    const trial2 = {
      id: 'cccccccccc',
      show: true,
      series: [
        {
          id: '3333333333',
          canEdit: false
        }
      ]
    };
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    graphController.series = trial1.series;
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    graphController.showOrHideTrials(trialIdsToShow);
    expect(trial0.show).toEqual(true);
    expect(trial1.show).toEqual(true);
    expect(trial2.show).toEqual(false);
  });

  it('should show trials and hide the currently active trial', () => {
    const trial0 = {
      id: 'aaaaaaaaaa',
      show: true,
      series: [
        {
          id: '1111111111',
          canEdit: true
        }
      ]
    };
    const trial1 = {
      id: 'bbbbbbbbbb',
      show: true,
      series: [
        {
          id: '2222222222',
          canEdit: true
        }
      ]
    };
    const trial2 = {
      id: 'cccccccccc',
      show: true,
      series: [
        {
          id: '3333333333',
          canEdit: false
        }
      ]
    };
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    graphController.series = trial1.series;
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'cccccccccc'];
    graphController.showOrHideTrials(trialIdsToShow);
    expect(trial0.show).toEqual(true);
    expect(trial1.show).toEqual(false);
    expect(trial2.show).toEqual(true);
    expect(graphController.series).toEqual([]);
    expect(graphController.activeTrial).toEqual(null);
    expect(graphController.activeSeries).toEqual(null);
  });

  it('should set active trial and series by trial ids to show', () => {
    const trial0 = {
      id: 'aaaaaaaaaa',
      show: true,
      series: [
        {
          id: '1111111111',
          canEdit: true
        }
      ]
    };
    const trial1 = {
      id: 'bbbbbbbbbb',
      show: true,
      series: [
        {
          id: '2222222222',
          canEdit: true
        }
      ]
    };
    const trial2 = {
      id: 'cccccccccc',
      show: true,
      series: [
        {
          id: '3333333333',
          canEdit: false
        }
      ]
    };
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    graphController.series = trial2.series;
    graphController.activeTrial = trial2;
    graphController.activeSeries = trial2.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    graphController.setActiveTrialAndSeriesByTrialIdsToShow(trialIdsToShow);
    expect(graphController.series).toEqual(trial1.series);
    expect(graphController.activeTrial).toEqual(trial1);
    expect(graphController.activeSeries).toEqual(trial1.series[0]);
  });

  it('should not set the active trial and series if the trial can not be edited', () => {
    const trial0 = {
      id: 'aaaaaaaaaa',
      show: true,
      series: [
        {
          id: '1111111111',
          canEdit: true
        }
      ]
    };
    const trial1 = {
      id: 'bbbbbbbbbb',
      show: true,
      series: [
        {
          id: '2222222222',
          canEdit: true
        }
      ]
    };
    const trial2 = {
      id: 'cccccccccc',
      show: true,
      series: [
        {
          id: '3333333333',
          canEdit: false
        }
      ]
    };
    graphController.trials = [
      trial0,
      trial1,
      trial2
    ];
    graphController.series = trial1.series;
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc'];
    graphController.setActiveTrialAndSeriesByTrialIdsToShow(trialIdsToShow);
    expect(graphController.series).toEqual(trial1.series);
    expect(graphController.activeTrial).toEqual(trial1);
    expect(graphController.activeSeries).toEqual(trial1.series[0]);
  });

});
