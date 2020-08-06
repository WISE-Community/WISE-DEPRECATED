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
  shouldGetDataExplorerYAxisLabel();
  shouldCreateDataExplorerSeries();
  shouldRepopulateDataExplorerData();
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

function shouldGetDataExplorerYAxisLabel() {
  it('should get data explorer y axis label', () => {
    expect(tableController.getDataExplorerYAxisLabel()).toEqual('');
    tableController.dataExplorerSeries[0].yColumn = 1;
    expect(tableController.getDataExplorerYAxisLabel()).toEqual('Grade');
  });
}

function shouldCreateDataExplorerSeries() {
  it('should create data explorer series', () => {
    tableController.dataExplorerSeries = [];
    tableController.createDataExplorerSeries();
    expect(tableController.dataExplorerSeries.length).toEqual(1);
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
