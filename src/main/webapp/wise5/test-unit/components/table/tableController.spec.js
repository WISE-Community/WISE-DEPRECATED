import vleModule from '../../../vle/vle';

describe('TableController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let tableController;
  let component;

  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
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
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    tableController = $controller('TableController', { $scope: $scope });
    tableController.nodeId = 'node1';
  }));

  it('should update column names', () => {
    expect(tableController.columnNames.length).toEqual(2);
    expect(tableController.columnNames[1]).toEqual('Grade');
    tableController.tableData[0][1].text = 'Score';
    tableController.updateColumnNames();
    expect(tableController.columnNames.length).toEqual(2);
    expect(tableController.columnNames[1]).toEqual('Score');
  });

  it('should get column names', () => {
    expect(tableController.getColumnName(0)).toEqual('Student ID');
    expect(tableController.getColumnName(1)).toEqual('Grade');
  });

  it('should handle data explorer x column changed', () => {
    expect(tableController.dataExplorerXColumn).toEqual(undefined);
    expect(tableController.dataExplorerXAxisLabel).toEqual(undefined);
    tableController.dataExplorerXColumn = 0;
    tableController.dataExplorerXColumnChanged();
    expect(tableController.dataExplorerXColumn).toEqual(0);
    expect(tableController.dataExplorerXAxisLabel).toEqual('Student ID');
  });

  it('should handle data explorer y column changed', () => {
    expect(tableController.dataExplorerSeries[0].yColumn).toEqual(null);
    expect(tableController.dataExplorerYAxisLabel).toEqual(undefined);
    tableController.dataExplorerSeries[0].yColumn = 1;
    tableController.dataExplorerYColumnChanged(0);
    expect(tableController.dataExplorerSeries[0].yColumn).toEqual(1);
    expect(tableController.dataExplorerYAxisLabel).toEqual('Grade');
  });

  it('should get data explorer y axis label', () => {
    expect(tableController.getDataExplorerYAxisLabel()).toEqual('');
    tableController.dataExplorerSeries[0].yColumn = 1;
    expect(tableController.getDataExplorerYAxisLabel()).toEqual('Grade');
  });

  it('should create data explorer series', () => {
    tableController.dataExplorerSeries = []
    tableController.createDataExplorerSeries();
    expect(tableController.dataExplorerSeries.length).toEqual(1);
  });

  it('should repopulate data explorer data', () => {
    const componentState = {
      studentData: {
        dataExplorerGraphType: 'column',
        dataExplorerXAxisLabel: 'Student ID',
        dataExplorerYAxisLabel: 'Grade',
        dataExplorerSeries: [
          { xColumn: 0, yColumn: 1 }
        ]
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
});
