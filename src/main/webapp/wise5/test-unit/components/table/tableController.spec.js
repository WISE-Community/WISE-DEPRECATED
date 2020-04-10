import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let tableController;
let component;

describe('TableController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    tableController = $controller('TableController', { $scope: $scope });
    tableController.nodeId = 'node1';
  }));

  shouldUpdateColumnNames();
  shouldGetColumnNames();
  shouldHandleDataExplorerXColumnChanged();
  shouldHandleDataExplorerYColumnChanged();
  shouldGetDataExplorerYAxisLabelWhenOneYAxis();
  shouldSetDataExplorerYAxisLabelWithMultipleYAxes();
  shouldCreateDataExplorerSeries();
  shouldRepopulateDataExplorerData();
  shouldSetDataExplorerSeriesYAxis();
  shouldGetYAxisForDataExplorerSeries();
  shouldGetYAxisForDataExplorerSeriesWhenNoDataExplorerSeriesParams();
});

function createComponent() {
  return {
    id: 'h24gt89has',
    type: 'Table',
    prompt: 'Fill out the table.',
    showSaveButton: false,
    showSubmitButton: false,
    tableData: [
      [
        {
          text: 'Student ID',
          editable: true,
          size: null
        },
        {
          text: 'Grade',
          editable: true,
          size: null
        }
      ],
      [
        {
          text: '1',
          editable: true,
          size: null
        },
        {
          text: '90',
          editable: true,
          size: null
        }
      ],
      [
        {
          text: '2',
          editable: true,
          size: null
        },
        {
          text: '80',
          editable: true,
          size: null
        }
      ]
    ],
    isDataExplorerEnabled: true,
    dataExplorerGraphTypes: [
      {
        name: 'Scatter Plot',
        value: 'scatter'
      },
      {
        name: 'Bar Graph',
        value: 'column'
      }
    ],
    numDataExplorerSeries: 1,
    numDataExplorerYAxis: 1,
    isDataExplorerAxisLabelsEditable: false,
    isDataExplorerScatterPlotRegressionLineEnabled: true
  };
}

function shouldUpdateColumnNames() {
  it('should update column names', () => {
    expect(tableController.columnNames.length).toEqual(2);
    expect(tableController.columnNames[1]).toEqual('Grade');
    tableController.tableData[0][1].text = 'Score';
    tableController.updateColumnNames();
    expect(tableController.columnNames.length).toEqual(2);
    expect(tableController.columnNames[1]).toEqual('Score');
  });
}

function shouldGetColumnNames() {
  it('should get column names', () => {
    expect(tableController.getColumnName(0)).toEqual('Student ID');
    expect(tableController.getColumnName(1)).toEqual('Grade');
  });
}

function shouldHandleDataExplorerXColumnChanged() {
  it('should handle data explorer x column changed', () => {
    expect(tableController.dataExplorerXColumn).toEqual(undefined);
    expect(tableController.dataExplorerXAxisLabel).toEqual(undefined);
    tableController.dataExplorerXColumn = 0;
    tableController.dataExplorerXColumnChanged();
    expect(tableController.dataExplorerXColumn).toEqual(0);
    expect(tableController.dataExplorerXAxisLabel).toEqual('Student ID');
  });
}

function shouldHandleDataExplorerYColumnChanged() {
  it('should handle data explorer y column changed', () => {
    expect(tableController.dataExplorerSeries[0].yColumn).toEqual(null);
    expect(tableController.dataExplorerYAxisLabel).toEqual(undefined);
    tableController.dataExplorerSeries[0].yColumn = 1;
    tableController.dataExplorerYColumnChanged(0);
    expect(tableController.dataExplorerSeries[0].yColumn).toEqual(1);
    expect(tableController.dataExplorerYAxisLabel).toEqual('Grade');
  });
}

function shouldGetDataExplorerYAxisLabelWhenOneYAxis() {
  it('should get data explorer y axis label', () => {
    expect(tableController.getDataExplorerYAxisLabelWhenOneYAxis()).toEqual('');
    tableController.dataExplorerSeries[0].yColumn = 1;
    expect(tableController.getDataExplorerYAxisLabelWhenOneYAxis()).toEqual('Grade');
  });
}

function shouldSetDataExplorerYAxisLabelWithMultipleYAxes() {
  it('should set data explorer y axis label with multiple y axes', () => {
    tableController.dataExplorerYAxisLabels =
        Array(tableController.componentContent.numDataExplorerYAxis).fill('');
    tableController.dataExplorerSeries = [
      { yAxis: 0 },
      { yAxis: 1 }
    ];
    const label1 = 'Label 1';
    const label2 = 'Label 2';
    tableController.setDataExplorerYAxisLabelWithMultipleYAxes(0, label1);
    tableController.setDataExplorerYAxisLabelWithMultipleYAxes(1, label2);
    expect(tableController.dataExplorerYAxisLabels[0]).toEqual(label1);
    expect(tableController.dataExplorerYAxisLabels[1]).toEqual(label2);
  });
}

function shouldCreateDataExplorerSeries() {
  it('should create data explorer series', () => {
    tableController.dataExplorerSeries = [];
    tableController.createDataExplorerSeries();
    expect(tableController.dataExplorerSeries.length).toEqual(1);
    expect(tableController.dataExplorerSeries[0].hasOwnProperty('xColumn')).toEqual(true);
    expect(tableController.dataExplorerSeries[0].hasOwnProperty('yColumn')).toEqual(true);
    expect(tableController.dataExplorerSeries[0].hasOwnProperty('yAxis')).toEqual(true);
  });
}

function shouldRepopulateDataExplorerData() {
  it('should repopulate data explorer data', () => {
    const componentState = {
      studentData: {
        dataExplorerGraphType: 'column',
        dataExplorerXAxisLabel: 'Student ID',
        dataExplorerYAxisLabel: 'Grade',
        dataExplorerSeries: [{ xColumn: 0, yColumn: 1 }]
      }
    };
    expect(tableController.dataExplorerGraphType).toEqual('scatter');
    expect(tableController.dataExplorerXAxisLabel).toEqual(undefined);
    expect(tableController.dataExplorerYAxisLabel).toEqual(undefined);
    expect(tableController.dataExplorerXColumn).toEqual(undefined);
    tableController.repopulateDataExplorerData(componentState);
    expect(tableController.dataExplorerGraphType).toEqual('column');
    expect(tableController.dataExplorerXAxisLabel).toEqual('Student ID');
    expect(tableController.dataExplorerYAxisLabel).toEqual('Grade');
    expect(tableController.dataExplorerXColumn).toEqual(0);
  });
}

function shouldSetDataExplorerSeriesYAxis() {
  it('should set data explorer series y axis', () => {
    tableController.dataExplorerSeriesParams = [
      { yAxis: 0 }
    ];
    tableController.dataExplorerSeries = [
      {}
    ];
    tableController.setDataExplorerSeriesYAxis(0);
    expect(tableController.dataExplorerSeries[0].yAxis).toEqual(0);
  });
}

function shouldGetYAxisForDataExplorerSeries() {
  it('should get y axis for data explorer series', () => {
    tableController.dataExplorerSeriesParams = [
      { yAxis: 0 }
    ];
    expect(tableController.getYAxisForDataExplorerSeries(0)).toEqual(0);
  });
}

function shouldGetYAxisForDataExplorerSeriesWhenNoDataExplorerSeriesParams() {
  it('should get y axis for data explorer series', () => {
    expect(tableController.getYAxisForDataExplorerSeries(0)).toEqual(null);
  });
}
