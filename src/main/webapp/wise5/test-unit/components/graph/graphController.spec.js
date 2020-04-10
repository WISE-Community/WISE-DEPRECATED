import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let graphController;
let component;

describe('GraphController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    graphController = $controller('GraphController', { $scope: $scope });
    graphController.nodeId = 'node1';
  }));

  shouldMakeSureXIsWithinLimits();
  shouldMakeSureYIsWithinLimits();
  shouldGetTheSeriesFromTheTrials();
  shouldPerformRounding();
  shouldSetTheDefaultActiveSeries();
  shouldGetSeriesByIndex();
  shouldConvertRowDataToSeriesData();
  shouldGetTheXColumnValueFromParams();
  shouldGetTheYColumnValueFromParams();
  shouldCheckIfASeriesIsTheActiveSeries();
  shouldCreateANewTrial();
  shouldGetTheTrialNumbers();
  shouldDeleteATrial();
  shouldMakeTheHighestTrialActive();
  shouldGetTheHighestShownTrial();
  shouldSetTheTrialIdsToShow();
  shouldDeleteTrialsById();
  shouldDeleteTrialById();
  shouldGetTheLatestStudentDataTrial();
  shouldHideAllTrials();
  shouldCreateANewTrialObject();
  shouldCopyASeries();
  shouldRemoveDefaultTrialIfNecessary();
  shouldCheckIfATrialHasAnEmptySeries();
  shouldCheckIfASeriesIsEmpty();
  shouldNotCreateNewTrialWhenNotNecessary();
  shouldCopySeriesIntoTrial();
  shouldCopyNameIntoTrial();
  shouldGetTheTrialById();
  shouldCheckIfThereIsAnEditableSeries();
  shouldGetMinMaxValues();
  shouldUpdateMinMaxAxisValues();
  shouldClearSeriesIds();
  shouldReadCSVIntoActiveSeries();
  shouldConvertSeriesDataPointsFromLimitsToCategories();
  shouldConvertSeriesDataPointsFromCategoriesToLimits();
  shouldSetVerticalPlotLine();
  shouldMergeComponentState();
  shouldConvertSelectedCellsToTrialIds();
  shouldConvertNullSelectedCellsToEmptyArrayOfTrialIds();
  shouldReadTheConnectedComponentField();
  shouldClickUndo();
  shouldGetTheCategoryByIndex();
  shouldGetTheXValueFromDataPoint();
  shouldGetTheYValueFromDataPoint();
  shouldGetTheLatestMouseOverPointX();
  shouldGetTheLatestMouseOverPointY();
  shouldAddPointToSeries();
  shouldRemovePointFromSeries();
  shouldGetTheTrialIndex();
  shouldCreateTheChartConfig();
  shouldCheckIfASeriesIsEditable();
  shouldGetTheLatestEditableSeriesIndex();
  shouldHandleTrialIdsToShowChanged();
  shouldHandleTrialIbdsToShowChangedWhenTheLatestTrialIsNotEditable();
  shouldShowAndHideTrials();
  shouldShowTrialsAndHideTheCurrentlyActiveTrial();
  shouldSetActiveTrialAndSeriesByTrialIdsToShow();
  shouldNotSetTheActiveTrialAndSeriesIfTheTrialCanNotBeEdited();
  shouldHandleDataExplorer();
  shouldGenerateDataExplorerSeries();
  shouldCalculateRegressionLine();
  shouldGetValuesInColumn();
  shouldSortLineData();
  shouldConvertDataExplorerDataToSeriesData();
  shouldCheckIfYAxisIsLockedWithOneYAxisTrue();
  shouldCheckIfYAxisIsLockedWithOneYAxisFalse();
  shouldCheckIfYAxisIsLockedWithMultipleYAxesTrue();
  shouldCheckIfYAxisIsLockedWithMultipleYAxesFalse();
  shouldSetYAxisLabelsWhenSingleYAxis();
  shouldSetYAxisLabelsWhenMultipleYAxes();
  shouldSetSeriesYIndex();
  shouldCheckIfYAxisLabelIsBlankWithSingleYAxisFalse();
  shouldCheckIfYAxisLabelIsBlankWithSingleYAxisTrue();
  shouldCheckIfYAxisLabelIsBlankWithMultipleYAxesFalse();
  shouldCheckIfYAxisLabelIsBlankWithMultipleYAxesTrue();
  shouldGetEventYValueWhenThereIsOneYAxis();
  shouldGetEventYValueWhenThereAreMultipleYAxes();
  shouldTurnOffXAxisDecimals();
  shouldTurnOffYAxisDecimalsWhenThereIsOneYAxis();
  shouldTurnOffYAxisDecimalsWhenThereAreMultipleYAxes();
  shouldGetSeriesYAxisIndexWhenItHasNoneSet();
  shouldGetSeriesYAxisIndexWhenItHasItSet();
  shouldImportGraphSettings();
  shouldGetYAxisColor();
  shouldSetSingleSeriesColorsToMatchYAxisWhenYAxisIsNotSet();
  shouldSetSingleSeriesColorsToMatchYAxisWhenYAxisIsSet();
  shouldSetAllSeriesColorsToMatchYAxes();
});

function createComponent() {
  return {
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
}

function createYAxis(color) {
  return {
    labels: {
      style: {
        color: color
      }
    },
    title: {
      style: {
        color: color
      }
    }
  };
}

function shouldMakeSureXIsWithinLimits() {
  it('should make sure x is within limits', () => {
    let highX = 120;
    highX = graphController.makeSureXIsWithinXMinMaxLimits(highX);
    expect(highX).toEqual(100);
    let lowX = -10;
    lowX = graphController.makeSureXIsWithinXMinMaxLimits(lowX);
    expect(lowX).toEqual(0);
  });
}

function shouldMakeSureYIsWithinLimits() {
  it('should make sure y is within limits', () => {
    let highY = 120;
    highY = graphController.makeSureYIsWithinYMinMaxLimits(highY);
    expect(highY).toEqual(100);
    let lowY = -10;
    lowY = graphController.makeSureYIsWithinYMinMaxLimits(lowY);
    expect(lowY).toEqual(0);
  });
}

function shouldGetTheSeriesFromTheTrials() {
  it('should get the series from the trials', () => {
    const trials = [
      {
        name: 'Trial 1',
        show: true,
        series: [
          {
            name: 'Prediction',
            data: [
              [0, 0],
              [10, 20],
              [20, 40]
            ]
          },
          {
            name: 'Actual',
            data: [
              [0, 0],
              [10, 30],
              [20, 60]
            ]
          }
        ],
        id: 'u3ijj5vfxd'
      },
      {
        name: 'Trial 2',
        show: true,
        series: [
          {
            name: 'Prediction',
            data: [
              [0, 0],
              [30, 20],
              [40, 40]
            ]
          },
          {
            name: 'Actual',
            data: [
              [0, 0],
              [30, 30],
              [40, 60]
            ]
          }
        ],
        id: 'u3ijj5vfxd'
      }
    ];
    const series = graphController.getSeriesFromTrials(trials);
    expect(series.length).toEqual(4);
  });
}

function shouldPerformRounding() {
  it('should perform rounding', () => {
    const number = 10.234;
    graphController.componentContent.roundValuesTo = 'integer';
    expect(graphController.performRounding(number)).toEqual(10);
    graphController.componentContent.roundValuesTo = 'tenth';
    expect(graphController.performRounding(number)).toEqual(10.2);
    graphController.componentContent.roundValuesTo = 'hundredth';
    expect(graphController.performRounding(number)).toEqual(10.23);
  });
}

function shouldSetTheDefaultActiveSeries() {
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
}

function shouldGetSeriesByIndex() {
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
}

function shouldConvertRowDataToSeriesData() {
  it('should convert row data to series data', () => {
    const rows = [
      [{ text: 'Time' }, { text: 'Distance' }],
      [{ text: '0' }, { text: '10' }],
      [{ text: '20' }, { text: '30' }]
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
}

function shouldGetTheXColumnValueFromParams() {
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
}

function shouldGetTheYColumnValueFromParams() {
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
}

function shouldCheckIfASeriesIsTheActiveSeries() {
  it('should check if a series is the active series', () => {
    const series1 = {};
    const series2 = {};
    graphController.series = [series1, series2];
    graphController.activeSeries = series2;
    expect(graphController.isActiveSeries(series2)).toEqual(true);
  });
}

function shouldCreateANewTrial() {
  it('should create a new trial', () => {
    const series1 = {};
    const series2 = {};
    graphController.series = [series1, series2];
    graphController.activeSeries = series1;
    expect(graphController.trials.length).toEqual(0);
    graphController.newTrial();
    expect(graphController.trials.length).toEqual(1);
  });
}

function shouldGetTheTrialNumbers() {
  it('should get the trial numbers', () => {
    graphController.trials = [];
    const trialNumbersEmpty = graphController.getTrialNumbers();
    expect(trialNumbersEmpty.length).toEqual(0);
    graphController.trials = [{ name: 'Trial 1' }, { name: 'Trial 2' }, { name: 'Trial 3' }];
    const trialNumbers = graphController.getTrialNumbers();
    expect(trialNumbers[0]).toEqual(1);
    expect(trialNumbers[1]).toEqual(2);
    expect(trialNumbers[2]).toEqual(3);
  });
}

function shouldDeleteATrial() {
  it('should delete a trial', () => {
    graphController.trials = [{ name: 'Trial 1' }, { name: 'Trial 2' }, { name: 'Trial 3' }];
    expect(graphController.trials.length).toEqual(3);
    graphController.deleteTrial(1);
    expect(graphController.trials.length).toEqual(2);
    expect(graphController.trials[0].name).toEqual('Trial 1');
    expect(graphController.trials[1].name).toEqual('Trial 3');
  });
}

function shouldMakeTheHighestTrialActive() {
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
}

function shouldGetTheHighestShownTrial() {
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
}

function shouldSetTheTrialIdsToShow() {
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
}

function shouldDeleteTrialsById() {
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
}

function shouldDeleteTrialById() {
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
}

function shouldGetTheLatestStudentDataTrial() {
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
}

function shouldHideAllTrials() {
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
}

function shouldCreateANewTrialObject() {
  it('should create a new trial object', () => {
    const trial = graphController.createNewTrial('aaaaaaaaaa');
    expect(trial.id).toEqual('aaaaaaaaaa');
    expect(trial.name).toEqual('');
    expect(trial.series.length).toEqual(0);
    expect(trial.show).toEqual(true);
  });
}

function shouldCopyASeries() {
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
}

function shouldRemoveDefaultTrialIfNecessary() {
  it('should remove default trial if necessary', () => {
    graphController.trials = [{ name: 'Trial 1', id: 'aaaaaaaaaa', series: [] }];
    expect(graphController.trials.length).toEqual(1);
    const latestStudentDataTrialId = 2;
    graphController.removeDefaultTrialIfNecessary(latestStudentDataTrialId);
    expect(graphController.trials.length).toEqual(0);
  });
}

function shouldCheckIfATrialHasAnEmptySeries() {
  it('should check if a trial has an empty series', () => {
    const trial1 = { series: [] };
    expect(graphController.isTrialHasEmptySeries(trial1)).toEqual(true);
    const trial2 = { series: [{ id: 'series-0' }, { id: 'series-1' }] };
    expect(graphController.isTrialHasEmptySeries(trial2)).toEqual(false);
  });
}

function shouldCheckIfASeriesIsEmpty() {
  it('should check if a series is empty', () => {
    const series1 = [{ data: [] }];
    expect(graphController.isSeriesEmpty(series1)).toEqual(true);
    const series2 = [{ id: 'series-0', data: [[0, 10]] }];
    expect(graphController.isSeriesEmpty(series2)).toEqual(false);
  });
}

function shouldCreateNewTrialIfNecessary() {
  it('should create new trial if necessary', () => {
    graphController.trials = [{ name: 'Trial 1', id: 'aaaaaaaaaa', show: true }];
    const trialId = 2;
    graphController.createNewTrialIfNecessary(trialId);
    expect(graphController.trials.length).toEqual(2);
  });
}

function shouldNotCreateNewTrialWhenNotNecessary() {
  it('should not create new trial when not necessary', () => {
    graphController.trials = [{ name: 'Trial 1', id: 'aaaaaaaaaa', show: true }];
    const trialId = 'aaaaaaaaaa';
    graphController.createNewTrialIfNecessary(trialId);
    expect(graphController.trials.length).toEqual(1);
  });
}

function shouldCopySeriesIntoTrial() {
  it('should copy series into trial', () => {
    const oldTrial = {
      series: [{ id: 'series-0' }]
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
}

function shouldCopyNameIntoTrial() {
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
}

function shouldGetTheTrialById() {
  it('should get the trial by id', () => {
    const trial1 = { name: 'Trial 1', id: 'aaaaaaaaaa' };
    const trial2 = { name: 'Trial 2', id: 'bbbbbbbbbb' };
    const trial3 = { name: 'Trial 3', id: 'cccccccccc' };
    graphController.trials = [trial1, trial2, trial3];
    expect(graphController.getTrialById('aaaaaaaaaa')).toEqual(trial1);
    expect(graphController.getTrialById('bbbbbbbbbb')).toEqual(trial2);
    expect(graphController.getTrialById('cccccccccc')).toEqual(trial3);
  });
}

function shouldCheckIfThereIsAnEditableSeries() {
  it('should check if there is an editable series', () => {
    graphController.series = [{ id: 'series-0', canEdit: false }];
    expect(graphController.hasEditableSeries()).toEqual(false);
    graphController.series = [{ id: 'series-0', canEdit: true }];
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
}

function shouldGetMinMaxValues() {
  it('should get min max values', () => {
    const series = [
      {
        id: 'series-0',
        data: [
          [0, 20],
          [10, 200]
        ]
      }
    ];
    const minMaxValues = graphController.getMinMaxValues(series);
    expect(minMaxValues.xMin).toEqual(0);
    expect(minMaxValues.xMax).toEqual(10);
    expect(minMaxValues.yMin).toEqual(0);
    expect(minMaxValues.yMax).toEqual(200);
  });
}

function shouldUpdateMinMaxAxisValues() {
  it('should update min max axis values', () => {
    const series = [
      {
        id: 'series-0',
        data: [
          [-10, -20],
          [1000, 2000]
        ]
      }
    ];
    const xAxis = { min: 0, max: 100 };
    const yAxis = { min: 0, max: 100 };
    graphController.updateMinMaxAxisValues(series, xAxis, yAxis);
    expect(xAxis.min).toEqual(null);
    expect(xAxis.max).toEqual(null);
    expect(yAxis.min).toEqual(null);
    expect(yAxis.max).toEqual(null);
  });
}

function shouldClearSeriesIds() {
  it('should clear series ids', () => {
    const series = [{ id: 'series-0' }, { id: 'series-1' }];
    graphController.clearSeriesIds(series);
    expect(series[0].id).toEqual(null);
    expect(series[1].id).toEqual(null);
  });
}

function shouldReadCSVIntoActiveSeries() {
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
}

function shouldConvertSeriesDataPointsFromLimitsToCategories() {
  it('should convert series data points from limits to categories', () => {
    const series = {
      data: [
        [0, 100],
        [10, 200]
      ]
    };
    const xAxisType = 'categories';
    graphController.convertSeriesDataPoints(series, xAxisType);
    expect(series.data[0]).toEqual(100);
    expect(series.data[1]).toEqual(200);
  });
}

function shouldConvertSeriesDataPointsFromCategoriesToLimits() {
  it('should convert series data points from categories to limits', () => {
    const series = {
      data: [100, 200]
    };
    const xAxisType = 'limits';
    graphController.convertSeriesDataPoints(series, xAxisType);
    expect(series.data[0][1]).toEqual(100);
    expect(series.data[1][1]).toEqual(200);
  });
}

function shouldSetVerticalPlotLine() {
  it('should set vertical plot line', () => {
    const x = 10;
    graphController.setVerticalPlotLine(x);
    expect(graphController.plotLines.length).toEqual(1);
    expect(graphController.plotLines[0].value).toEqual(10);
  });
}

function shouldMergeComponentState() {
  it('should merge component state', () => {
    const baseComponentState = {
      studentData: {
        trials: [{ id: 'aaaaaaaaaa', name: 'Trial 1', series: [] }]
      }
    };
    const connectedComponentState = {
      studentData: {
        trials: [{ id: 'bbbbbbbbbb', name: 'Trial 2', series: [] }]
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
      baseComponentState,
      connectedComponentState,
      mergeFields,
      firstTime
    );
    expect(baseComponentState.studentData.trials[0].name).toEqual('Trial 2');
  });
}

function shouldConvertSelectedCellsToTrialIds() {
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
}

function shouldConvertNullSelectedCellsToEmptyArrayOfTrialIds() {
  it('should convert null selected cells to empty array of trial ids', () => {
    const selectedCells = null;
    const selectedTrialIds = graphController.convertSelectedCellsToTrialIds(selectedCells);
    expect(selectedTrialIds.length).toEqual(0);
  });
}

function shouldReadTheConnectedComponentField() {
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
}

function shouldClickUndo() {
  it('should click undo', () => {
    graphController.trials = [{ id: 'aaaaaaaaaa' }];
    const componentState = {
      studentData: {
        trials: [{ id: 'aaaaaaaaaa' }, { id: 'bbbbbbbbbb' }]
      }
    };
    graphController.undoStack = [componentState];
    graphController.undoClicked();
    expect(graphController.undoStack.length).toEqual(0);
    expect(graphController.previousComponentState).toEqual(componentState);
    expect(graphController.trials[0].id).toEqual('aaaaaaaaaa');
    expect(graphController.trials[1].id).toEqual('bbbbbbbbbb');
  });
}

function shouldGetTheCategoryByIndex() {
  it('should get the category by index', () => {
    graphController.componentContent = {
      xAxis: {
        categories: ['Computers', 'Phones', 'Pizzas']
      }
    };
    expect(graphController.getCategoryByIndex(0)).toEqual('Computers');
    expect(graphController.getCategoryByIndex(1)).toEqual('Phones');
    expect(graphController.getCategoryByIndex(2)).toEqual('Pizzas');
  });
}

function shouldGetTheXValueFromDataPoint() {
  it('should get the x value from data point', () => {
    const dataPointObject = { x: 10, y: 20 };
    const dataPointArray = [100, 200];
    expect(graphController.getXValueFromDataPoint(dataPointObject)).toEqual(10);
    expect(graphController.getXValueFromDataPoint(dataPointArray)).toEqual(100);
  });
}

function shouldGetTheYValueFromDataPoint() {
  it('should get the y value from data point', () => {
    const dataPointObject = { x: 10, y: 20 };
    const dataPointArray = [100, 200];
    expect(graphController.getYValueFromDataPoint(dataPointObject)).toEqual(20);
    expect(graphController.getYValueFromDataPoint(dataPointArray)).toEqual(200);
  });
}

function shouldGetTheLatestMouseOverPointX() {
  it('should get the latest mouse over point x', () => {
    graphController.mouseOverPoints = [
      { x: 10, y: 20 },
      { x: 11, y: 22 }
    ];
    expect(graphController.getLatestMouseOverPointX()).toEqual(11);
    graphController.mouseOverPoints = [
      [100, 200],
      [111, 222]
    ];
    expect(graphController.getLatestMouseOverPointX()).toEqual(111);
  });
}

function shouldGetTheLatestMouseOverPointY() {
  it('should get the latest mouse over point y', () => {
    graphController.mouseOverPoints = [
      { x: 10, y: 20 },
      { x: 11, y: 22 }
    ];
    expect(graphController.getLatestMouseOverPointY()).toEqual(22);
    graphController.mouseOverPoints = [
      [100, 200],
      [111, 222]
    ];
    expect(graphController.getLatestMouseOverPointY()).toEqual(222);
  });
}

function shouldAddPointToSeries() {
  it('should add point to series', () => {
    const series = {
      data: [
        [10, 20],
        [100, 200]
      ]
    };
    expect(series.data.length).toEqual(2);
    graphController.addPointToSeries(series, 1000, 2000);
    expect(series.data.length).toEqual(3);
    expect(series.data[2][0]).toEqual(1000);
    expect(series.data[2][1]).toEqual(2000);
  });
}

function shouldRemovePointFromSeries() {
  it('should remove point from series', () => {
    const series = {
      data: [
        [10, 20],
        [100, 200]
      ]
    };
    expect(series.data.length).toEqual(2);
    graphController.removePointFromSeries(series, 10);
    expect(series.data.length).toEqual(1);
    expect(series.data[0][0]).toEqual(100);
    expect(series.data[0][1]).toEqual(200);
  });
}

function shouldGetTheTrialIndex() {
  it('should get the trial index', () => {
    const trial0 = {};
    const trial1 = {};
    const trial2 = {};
    graphController.trials = [trial0, trial1, trial2];
    expect(graphController.getTrialIndex(trial0)).toEqual(0);
    expect(graphController.getTrialIndex(trial1)).toEqual(1);
    expect(graphController.getTrialIndex(trial2)).toEqual(2);
  });
}

function shouldCreateTheChartConfig() {
  it('should create the chart config', () => {
    const trial0 = {};
    const trial1 = {};
    const trial2 = {};
    graphController.trials = [trial0, trial1, trial2];
    const deferred = {};
    const title = 'My Graph';
    const subtitle = 'My Subtitle';
    const xAxis = {
      min: 0,
      max: 100
    };
    const yAxis = {
      min: 0,
      max: 50
    };
    const series = [
      [10, 20],
      [100, 200]
    ];
    const zoomType = null;
    const chartConfig = graphController.createChartConfig(
      deferred,
      title,
      subtitle,
      xAxis,
      yAxis,
      series,
      zoomType
    );
    expect(chartConfig.title.text).toEqual('My Graph');
    expect(chartConfig.xAxis.min).toEqual(0);
    expect(chartConfig.xAxis.max).toEqual(100);
    expect(chartConfig.yAxis.min).toEqual(0);
    expect(chartConfig.yAxis.max).toEqual(50);
    expect(chartConfig.series).toEqual(series);
    expect(chartConfig.options.chart.zoomType).toEqual(null);
  });
}

function shouldCheckIfASeriesIsEditable() {
  it('should check if a series is editable', () => {
    const multipleSeries = [
      { id: 'series0', canEdit: true },
      { id: 'series1', canEdit: false },
      { id: 'series2', canEdit: true }
    ];
    expect(graphController.isSeriesEditable(multipleSeries, 0)).toEqual(true);
    expect(graphController.isSeriesEditable(multipleSeries, 1)).toEqual(false);
    expect(graphController.isSeriesEditable(multipleSeries, 2)).toEqual(true);
  });
}

function shouldGetTheLatestEditableSeriesIndex() {
  it('should get the latest editable series index', () => {
    const multipleSeries0 = [
      { id: 'series0', canEdit: true },
      { id: 'series1', canEdit: false },
      { id: 'series2', canEdit: false }
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries0)).toEqual(0);
    const multipleSeries1 = [
      { id: 'series0', canEdit: true },
      { id: 'series1', canEdit: true },
      { id: 'series2', canEdit: false }
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries1)).toEqual(1);
    const multipleSeries2 = [
      { id: 'series0', canEdit: true },
      { id: 'series1', canEdit: false },
      { id: 'series2', canEdit: true }
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries2)).toEqual(2);
    const multipleSeries3 = [
      { id: 'series0', canEdit: false },
      { id: 'series1', canEdit: false },
      { id: 'series2', canEdit: false }
    ];
    expect(graphController.getLatestEditableSeriesIndex(multipleSeries3)).toEqual(null);
  });
}

function shouldHandleTrialIdsToShowChanged() {
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
    graphController.trials = [trial0, trial1, trial2];
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    graphController.previousTrialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    graphController.trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc'];
    const studentDataChangedSpy = spyOn(
      graphController,
      'studentDataChanged'
    ).and.callFake(() => {});
    graphController.trialIdsToShowChanged();
    expect(graphController.activeTrial).toEqual(trial2);
    expect(graphController.activeSeries).toEqual(trial2.series[0]);
    expect(studentDataChangedSpy).toHaveBeenCalled();
  });
}

function shouldHandleTrialIbdsToShowChangedWhenTheLatestTrialIsNotEditable() {
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
    graphController.trials = [trial0, trial1, trial2];
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc'];
    graphController.trialIdsToShow = trialIdsToShow;
    graphController.previousTrialIdsToShow = trialIdsToShow;
    graphController.trialIdsToShowChanged();
    expect(graphController.activeTrial).toEqual(trial1);
    expect(graphController.activeSeries).toEqual(trial1.series[0]);
  });
}

function shouldShowAndHideTrials() {
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
    graphController.trials = [trial0, trial1, trial2];
    graphController.series = trial1.series;
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    graphController.showOrHideTrials(trialIdsToShow);
    expect(trial0.show).toEqual(true);
    expect(trial1.show).toEqual(true);
    expect(trial2.show).toEqual(false);
  });
}

function shouldShowTrialsAndHideTheCurrentlyActiveTrial() {
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
    graphController.trials = [trial0, trial1, trial2];
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
}

function shouldSetActiveTrialAndSeriesByTrialIdsToShow() {
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
    graphController.trials = [trial0, trial1, trial2];
    graphController.series = trial2.series;
    graphController.activeTrial = trial2;
    graphController.activeSeries = trial2.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb'];
    graphController.setActiveTrialAndSeriesByTrialIdsToShow(trialIdsToShow);
    expect(graphController.series).toEqual(trial1.series);
    expect(graphController.activeTrial).toEqual(trial1);
    expect(graphController.activeSeries).toEqual(trial1.series[0]);
  });
}

function shouldNotSetTheActiveTrialAndSeriesIfTheTrialCanNotBeEdited() {
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
    graphController.trials = [trial0, trial1, trial2];
    graphController.series = trial1.series;
    graphController.activeTrial = trial1;
    graphController.activeSeries = trial1.series[0];
    const trialIdsToShow = ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc'];
    graphController.setActiveTrialAndSeriesByTrialIdsToShow(trialIdsToShow);
    expect(graphController.series).toEqual(trial1.series);
    expect(graphController.activeTrial).toEqual(trial1);
    expect(graphController.activeSeries).toEqual(trial1.series[0]);
  });
}

function shouldHandleDataExplorer() {
  it('should handle data explorer', () => {
    const studentData = {
      dataExplorerGraphType: 'scatter',
      tableData: [
        [{ text: 'ID' }, { text: 'Age' }, { text: 'Score' }],
        [{ text: '1' }, { text: '10' }, { text: '100' }],
        [{ text: '2' }, { text: '20' }, { text: '200' }],
        [{ text: '3' }, { text: '30' }, { text: '300' }]
      ],
      dataExplorerSeries: [{ xColumn: 0, yColumn: 1, name: 'The series name' }],
      dataExplorerXAxisLabel: 'Hello',
      dataExplorerYAxisLabel: 'World'
    };
    graphController.activeTrial = {};
    graphController.handleDataExplorer(studentData);
    expect(graphController.xAxis.title.text).toEqual('Hello');
    expect(graphController.yAxis.title.text).toEqual('World');
    expect(graphController.activeTrial.series.length).toEqual(1);
    const series = graphController.activeTrial.series[0];
    expect(series.type).toEqual('scatter');
    expect(series.name).toEqual('The series name');
    expect(series.color).toEqual('blue');
    expect(series.data[0][0]).toEqual(1);
    expect(series.data[0][1]).toEqual(10);
  });
}

function shouldGenerateDataExplorerSeries() {
  it('should generate data explorer series', () => {
    const tableData = [
      [{ text: 'ID' }, { text: 'Age' }, { text: 'Score' }],
      [{ text: '1' }, { text: '10' }, { text: '100' }],
      [{ text: '2' }, { text: '20' }, { text: '200' }],
      [{ text: '3' }, { text: '30' }, { text: '300' }]
    ];
    const xColumn = 0;
    const yColumn = 1;
    const graphType = 'scatter';
    const name = 'Age';
    const color = 'blue';
    const series = graphController.generateDataExplorerSeries(
      tableData,
      xColumn,
      yColumn,
      graphType,
      name,
      color
    );
    expect(series.name).toEqual('Age');
    expect(series.type).toEqual('scatter');
    expect(series.color).toEqual('blue');
    expect(series.data.length).toEqual(3);
    expect(series.data[0][0]).toEqual(1);
    expect(series.data[0][1]).toEqual(10);
    expect(series.data[1][0]).toEqual(2);
    expect(series.data[1][1]).toEqual(20);
    expect(series.data[2][0]).toEqual(3);
    expect(series.data[2][1]).toEqual(30);
  });
}

function shouldCalculateRegressionLine() {
  it('should calculate regression line', () => {
    const tableData = [
      [{ text: 'ID' }, { text: 'Age' }, { text: 'Score' }],
      [{ text: '1' }, { text: '10' }, { text: '100' }],
      [{ text: '2' }, { text: '20' }, { text: '200' }],
      [{ text: '3' }, { text: '30' }, { text: '300' }]
    ];
    window.covariance = () => {};
    spyOn(window, 'covariance').and.returnValue([
      [1, 10],
      [10, 100]
    ]);
    const regressionLineData = graphController.calculateRegressionLineData(tableData, 0, 1);
    expect(regressionLineData[0][0]).toEqual(1);
    expect(regressionLineData[0][1]).toEqual(10);
    expect(regressionLineData[1][0]).toEqual(3);
    expect(regressionLineData[1][1]).toEqual(30);
  });
}

function shouldGetValuesInColumn() {
  it('should get values in column', () => {
    const tableData = [
      [{ text: 'ID' }, { text: 'Age' }, { text: 'Score' }],
      [{ text: '1' }, { text: '10' }, { text: '100' }],
      [{ text: '2' }, { text: '20' }, { text: '200' }],
      [{ text: '3' }, { text: '30' }, { text: '300' }]
    ];
    const column0 = graphController.getValuesInColumn(tableData, 0);
    const column1 = graphController.getValuesInColumn(tableData, 1);
    const column2 = graphController.getValuesInColumn(tableData, 2);
    expect(column0[0]).toEqual(1);
    expect(column0[1]).toEqual(2);
    expect(column0[2]).toEqual(3);
    expect(column1[0]).toEqual(10);
    expect(column1[1]).toEqual(20);
    expect(column1[2]).toEqual(30);
    expect(column2[0]).toEqual(100);
    expect(column2[1]).toEqual(200);
    expect(column2[2]).toEqual(300);
  });
}

function shouldSortLineData() {
  it('should sort line data', () => {
    const line = [
      [1, 10],
      [2, 20],
      [3, 30],
      [3, 40]
    ];
    expect(graphController.sortLineData(line[0], line[1])).toEqual(-1);
    expect(graphController.sortLineData(line[1], line[0])).toEqual(1);
    expect(graphController.sortLineData(line[0], line[0])).toEqual(0);
    expect(graphController.sortLineData(line[2], line[3])).toEqual(-1);
  });
}

function shouldConvertDataExplorerDataToSeriesData() {
  it('should convert data explorer data to series data', () => {
    const rows = [
      [{ text: 'ID' }, { text: 'Age' }, { text: 'Score' }],
      [{ text: '1' }, { text: '10' }, { text: '100' }],
      [{ text: '2' }, { text: '20' }, { text: '200' }],
      [{ text: '3' }, { text: '30' }, { text: '300' }]
    ];
    const xColumn = 0;
    const yColumn = 1;
    const data = graphController.convertDataExplorerDataToSeriesData(rows, xColumn, yColumn);
    expect(data.length).toEqual(3);
    expect(data[0][0]).toEqual(1);
    expect(data[0][1]).toEqual(10);
    expect(data[1][0]).toEqual(2);
    expect(data[1][1]).toEqual(20);
    expect(data[2][0]).toEqual(3);
    expect(data[2][1]).toEqual(30);
  });
}

function shouldCheckIfYAxisIsLockedWithOneYAxisTrue() {
  it('should check if Y axis is locked with one Y axis true', () => {
    expect(graphController.isYAxisLocked()).toEqual(true);
  }); 
}

function shouldCheckIfYAxisIsLockedWithOneYAxisFalse() {
  it('should check if Y axis is locked with one Y axis false', () => {
    graphController.componentContent.yAxis.locked = false;
    expect(graphController.isYAxisLocked()).toEqual(false);
  }); 
}

function shouldCheckIfYAxisIsLockedWithMultipleYAxesTrue() {
  it('should check if Y axis is locked with multiple Y axes true', () => {
    const firstYAxis = {
      title: {
        text: 'Count'
      },
      min: 0,
      max: 100,
      units: '',
      locked: true
    };
    const secondYAxis = {
      title: {
        text: 'Price'
      },
      min: 0,
      max: 1000,
      units: '',
      locked: true,
      opposite: true
    }
    graphController.componentContent.yAxis = [firstYAxis, secondYAxis];
    expect(graphController.isYAxisLocked()).toEqual(true);
  });
}

function shouldCheckIfYAxisIsLockedWithMultipleYAxesFalse() {
  it('should check if Y axis is locked with multiple Y axes false', () => {
    const firstYAxis = {
      title: {
        text: 'Count'
      },
      min: 0,
      max: 100,
      units: '',
      locked: false
    };
    const secondYAxis = {
      title: {
        text: 'Price'
      },
      min: 0,
      max: 1000,
      units: '',
      locked: false,
      opposite: true
    }
    graphController.componentContent.yAxis = [firstYAxis, secondYAxis];
    expect(graphController.isYAxisLocked()).toEqual(false);
  });
}

function shouldSetYAxisLabelsWhenSingleYAxis() {
  it('should set y axis labels when there is one y axis', () => {
    graphController.yAxis = {
      title: {
        text: ''
      }
    };
    const studentData = {
      dataExplorerYAxisLabel: 'Count'
    };
    graphController.setYAxisLabels(studentData);
    expect(graphController.yAxis.title.text).toEqual('Count');
  });
}

function shouldSetYAxisLabelsWhenMultipleYAxes() {
  it('should set y axis labels when there are multiple y axes', () => {
    graphController.yAxis = [{
      title: {
        text: ''
      }
    },{
      title: {
        text: ''
      }
    }];
    const studentData = {
      dataExplorerYAxisLabels: ['Count', 'Price']
    };
    graphController.setYAxisLabels(studentData);
    expect(graphController.yAxis[0].title.text).toEqual('Count');
    expect(graphController.yAxis[1].title.text).toEqual('Price');
  });
}

function shouldSetSeriesYIndex() {
  it('should set series Y index', () => {
    const firstYAxis = {
      title: {
        text: ''
      },
      min: 0,
      max: 100,
      units: '',
      locked: false
    };
    const secondYAxis = {
      title: {
        text: ''
      },
      min: 0,
      max: 1000,
      units: '',
      locked: false,
      opposite: true
    }
    graphController.yAxis = [firstYAxis, secondYAxis];
    const seriesOne = {};
    const seriesTwo = {};
    graphController.setSeriesYAxisIndex(seriesOne, 0);
    graphController.setSeriesYAxisIndex(seriesTwo, 1);
    expect(seriesOne.yAxis).toEqual(0);
    expect(seriesTwo.yAxis).toEqual(1);
  });
}

function shouldCheckIfYAxisLabelIsBlankWithSingleYAxisFalse() {
  it('should check if Y Axis label is blank with single y axis false', () => {
    const yAxis = {
      title: {
        text: 'Count'
      },
      min: 0,
      max: 100,
      units: '',
      locked: false
    };
    expect(graphController.isYAxisLabelBlank(yAxis)).toEqual(false);
  });
}

function shouldCheckIfYAxisLabelIsBlankWithSingleYAxisTrue() {
  it('should check if Y Axis label is blank with single Y axis true', () => {
    const yAxis = {
      title: {
        text: ''
      },
      min: 0,
      max: 100,
      units: '',
      locked: false
    };
    expect(graphController.isYAxisLabelBlank(yAxis)).toEqual(true);
  });
}

function shouldCheckIfYAxisLabelIsBlankWithMultipleYAxesFalse() {
  it('should check if Y Axis label is blank with multiple y axes false', () => {
    const firstYAxis = {
      title: {
        text: 'Count'
      },
      min: 0,
      max: 100,
      units: '',
      locked: false
    };
    const secondYAxis = {
      title: {
        text: 'Price'
      },
      min: 0,
      max: 1000,
      units: '',
      locked: false,
      opposite: true
    }
    const yAxis = [firstYAxis, secondYAxis];
    expect(graphController.isYAxisLabelBlank(yAxis, 0)).toEqual(false);
    expect(graphController.isYAxisLabelBlank(yAxis, 1)).toEqual(false);
  });
}

function shouldCheckIfYAxisLabelIsBlankWithMultipleYAxesTrue() {
  it('should check if Y Axis label is blank with multiple y axes true', () => {
    const firstYAxis = {
      title: {
        text: ''
      },
      min: 0,
      max: 100,
      units: '',
      locked: false
    };
    const secondYAxis = {
      title: {
        text: ''
      },
      min: 0,
      max: 1000,
      units: '',
      locked: false,
      opposite: true
    }
    const yAxis = [firstYAxis, secondYAxis];
    expect(graphController.isYAxisLabelBlank(yAxis, 0)).toEqual(true);
    expect(graphController.isYAxisLabelBlank(yAxis, 1)).toEqual(true);
  });
}

function shouldGetEventYValueWhenThereIsOneYAxis() {
  it('should get event y value when there is one y axis', () => {
    const event = {
      yAxis: [{value: 10}]
    };
    expect(graphController.getEventYValue(event)).toEqual(10);
  });
}

function shouldGetEventYValueWhenThereAreMultipleYAxes() {
  it('should get event y value when there are multiple y axes', () => {
    const event = {
      yAxis: [{value: 10}, {value: 20}]
    };
    graphController.yAxis = [{
      title: { text: 'Y Axis 1' }
    },{
      title: { text: 'Y Axis 2' }
    }];
    graphController.activeSeries = {
      yAxis: 1
    };
    expect(graphController.getEventYValue(event)).toEqual(20);
  });
}

function shouldTurnOffXAxisDecimals() {
  it('should turn off x axis decimals', () => { 
    graphController.xAxis = {
      title: { text: 'X Axis' }
    };
    graphController.turnOffXAxisDecimals();
    expect(graphController.xAxis.allowDecimals).toEqual(false);
  });
}

function shouldTurnOffYAxisDecimalsWhenThereIsOneYAxis() {
  it('should turn off y axis decimals when there is one y axis', () => { 
    graphController.yAxis = {
      title: { text: 'Y Axis' }
    };
    graphController.turnOffYAxisDecimals();
    expect(graphController.yAxis.allowDecimals).toEqual(false);
  });
}

function shouldTurnOffYAxisDecimalsWhenThereAreMultipleYAxes() {
  it('should turn off y axis decimals when there are multiple y axes', () => { 
    graphController.yAxis = [{
      title: { text: 'Y Axis 1' }
    },{
      title: { text: 'Y Axis 2' }
    }];
    graphController.turnOffYAxisDecimals();
    expect(graphController.yAxis[0].allowDecimals).toEqual(false);
    expect(graphController.yAxis[1].allowDecimals).toEqual(false);
  });
}

function shouldGetSeriesYAxisIndexWhenItHasNoneSet() {
  it('should get series y axis index when it has none set', () => {
    graphController.yAxis = [
      {
        title: { text: 'Y Axis 1' }
      },
      {
        title: { text: 'Y Axis 2' }
      }
    ];
    const series = {
      
    };
    expect(graphController.getSeriesYAxisIndex(series)).toEqual(0);
  });
}

function shouldGetSeriesYAxisIndexWhenItHasItSet() {
  it('should get series y axis index when it has it set', () => {
    graphController.yAxis = [
      {
        title: { text: 'Y Axis 1' }
      },
      {
        title: { text: 'Y Axis 2' }
      }
    ];
    const series = {
      yAxis: 1
    };
    expect(graphController.getSeriesYAxisIndex(series)).toEqual(1);
  });
}

function shouldImportGraphSettings() {
  it('should import graph settings', () => {
    graphController.title = 'Graph 1 Title';
    graphController.subtitle = 'Graph 1 Subtitle';
    graphController.width = 100;
    graphController.height = 200;
    graphController.xAxis = {
      title: { text: 'X Axis 1' }
    };
    graphController.yAxis = {
      title: { text: 'Y Axis 1' }
    };
    const graph2Title = 'Graph 2 Title';
    const graph2Subtitle = 'Graph 2 Subtitle';
    const graph2Width = 300;
    const graph2Height = 400;
    const xAxis2Title = 'X Axis 2';
    const yAxis2Title = 'Y Axis 2';
    const component = {
      title: graph2Title,
      subtitle: graph2Subtitle,
      width: graph2Width,
      height: graph2Height
    };
    const componentState = {
      studentData: {
        xAxis: {
          title: { text: xAxis2Title }
        },
        yAxis: {
          title: { text: yAxis2Title }
        }
      }
    };
    graphController.importGraphSettings(component, componentState);
    expect(graphController.title).toEqual(graph2Title);
    expect(graphController.subtitle).toEqual(graph2Subtitle);
    expect(graphController.width).toEqual(graph2Width);
    expect(graphController.height).toEqual(graph2Height);
    expect(graphController.xAxis.title.text).toEqual(xAxis2Title);
    expect(graphController.yAxis.title.text).toEqual(yAxis2Title);
  });
}

function shouldGetYAxisColor() {
  it('should get y axis color', () => {
    graphController.yAxis = [
      createYAxis('blue'),
      createYAxis('red'),
      createYAxis('green'),
      createYAxis('orange')
    ];
    expect(graphController.getYAxisColor(0)).toEqual('blue');
    expect(graphController.getYAxisColor(1)).toEqual('red');
    expect(graphController.getYAxisColor(2)).toEqual('green');
    expect(graphController.getYAxisColor(3)).toEqual('orange');
  });
}

function shouldSetSingleSeriesColorsToMatchYAxisWhenYAxisIsNotSet() {
  it('should set single series colors to match y axis when y axis is not set', () => {
    graphController.yAxis = [
      createYAxis('blue'),
      createYAxis('red'),
      createYAxis('green'),
      createYAxis('orange')
    ];
    const series = {};
    graphController.setSinglSeriesColorsToMatchYAxis(series);
    expect(series.color).toEqual('blue');
  });
}

function shouldSetSingleSeriesColorsToMatchYAxisWhenYAxisIsSet() {
  it('should set single series colors to match y axis when y axis is set', () => {
    graphController.yAxis = [
      createYAxis('blue'),
      createYAxis('red'),
      createYAxis('green'),
      createYAxis('orange')
    ];
    const series = { yAxis: 1 };
    graphController.setSinglSeriesColorsToMatchYAxis(series);
    expect(series.color).toEqual('red');
  });
}

function shouldSetAllSeriesColorsToMatchYAxes() {
  it('should set all series colors to match y axes', () => {
    graphController.yAxis = [
      createYAxis('blue'),
      createYAxis('red'),
      createYAxis('green'),
      createYAxis('orange')
    ];
    const series = [
      { yAxis: 0 },
      { yAxis: 1 },
      { yAxis: 2 },
      { yAxis: 3 }
    ];
    graphController.setAllSeriesColorsToMatchYAxes(series);
    expect(series[0].color).toEqual('blue');
    expect(series[1].color).toEqual('red');
    expect(series[2].color).toEqual('green');
    expect(series[3].color).toEqual('orange');
  });
}