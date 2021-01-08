import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let tableAuthoringController;
let component;

describe('TableAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    tableAuthoringController = $controller('TableAuthoringController', { $scope: $scope });
  }));

  shouldToggleDataExplorer();
  shouldToggleDataExplorerScatterPlot();
  shouldToggleDataExplorerLineGraph();
  shouldToggleDataExplorerBarGraph();
  shouldToggleDataExplorerGraphType();
  shouldCreateGraphTypeObject();
  shouldInitializeDataExplorerGraphTypes();
  shouldRepopulateDataExplorerGraphTypes();
  shouldInitializeDataExplorerSeriesParams();
  shouldHandleNumDataExplorerSeriesChangeIncrease();
  shouldHandleNumDataExplorerSeriesChangeDecrease();
  shouldIncreaseNumDataExplorerSeries();
  shouldDecreaseNumDataExplorerSeries();
  shouldUpdateDataExplorerSeriesParamsYAxis();
});

function createComponent() {
  return {
    id: '9dbz79h8ge',
    type: 'Table',
    prompt: '',
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

function shouldToggleDataExplorer() {
  it('should toggle data explorer', () => {
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    tableAuthoringController.authoringComponentContent.isDataExplorerEnabled = true;
    tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes = null;
    tableAuthoringController.authoringComponentContent.numDataExplorerSeries = null;
    tableAuthoringController.authoringComponentContent.isDataExplorerAxisLabelsEditable = null;
    tableAuthoringController.toggleDataExplorer();
    const authoringComponentContent = tableAuthoringController.authoringComponentContent;
    expect(authoringComponentContent.isDataExplorerEnabled).toEqual(true);
    expect(authoringComponentContent.dataExplorerGraphTypes.length).toEqual(1);
    expect(authoringComponentContent.dataExplorerGraphTypes[0].value).toEqual('scatter');
    expect(authoringComponentContent.numDataExplorerSeries).toEqual(1);
    expect(authoringComponentContent.isDataExplorerAxisLabelsEditable).toEqual(false);
    expect(authoringComponentContent.isDataExplorerAxisLabelsEditable).toEqual(false);
    expect(authoringComponentContent.dataExplorerSeriesParams).toEqual([{}]);
  });
}

function shouldToggleDataExplorerScatterPlot() {
  it('should toggle data explorer scatter plot', () => {
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    const dataExplorerGraphTypes =
      tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes;
    expect(dataExplorerGraphTypes.length).toEqual(2);
    expect(dataExplorerGraphTypes[0].value).toEqual('scatter');
    expect(dataExplorerGraphTypes[1].value).toEqual('column');
    tableAuthoringController.dataExplorerToggleScatterPlot();
    expect(dataExplorerGraphTypes.length).toEqual(1);
    expect(dataExplorerGraphTypes[0].value).toEqual('column');
  });
}

function shouldToggleDataExplorerLineGraph() {
  it('should toggle data explorer line graph', () => {
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    const dataExplorerGraphTypes =
      tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes;
    expect(dataExplorerGraphTypes.length).toEqual(2);
    expect(dataExplorerGraphTypes[0].value).toEqual('scatter');
    expect(dataExplorerGraphTypes[1].value).toEqual('column');
    tableAuthoringController.dataExplorerToggleLineGraph();
    expect(dataExplorerGraphTypes.length).toEqual(3);
    expect(dataExplorerGraphTypes[2].value).toEqual('line');
  });
}

function shouldToggleDataExplorerBarGraph() {
  it('should toggle data explorer bar graph', () => {
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    const dataExplorerGraphTypes =
      tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes;
    expect(dataExplorerGraphTypes.length).toEqual(2);
    expect(dataExplorerGraphTypes[0].value).toEqual('scatter');
    expect(dataExplorerGraphTypes[1].value).toEqual('column');
    tableAuthoringController.dataExplorerToggleBarGraph();
    expect(dataExplorerGraphTypes.length).toEqual(1);
    expect(dataExplorerGraphTypes[0].value).toEqual('scatter');
  });
}

function shouldToggleDataExplorerGraphType() {
  it('should toggle data explorer graph type', () => {
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    const dataExplorerGraphTypes =
      tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes;
    expect(dataExplorerGraphTypes.length).toEqual(2);
    tableAuthoringController.dataExplorerToggleGraphType('Hello', 'World');
    expect(dataExplorerGraphTypes.length).toEqual(3);
    expect(dataExplorerGraphTypes[2].name).toEqual('Hello');
    expect(dataExplorerGraphTypes[2].value).toEqual('World');
  });
}

function shouldCreateGraphTypeObject() {
  it('should create graph type object', () => {
    const graphTypeObject = tableAuthoringController.createGraphTypeObject('Hello', 'World');
    expect(graphTypeObject.name).toEqual('Hello');
    expect(graphTypeObject.value).toEqual('World');
  });
}

function shouldInitializeDataExplorerGraphTypes() {
  it('should initialize data explorer graph types', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes = [];
    tableAuthoringController.initializeDataExplorerGraphTypes();
    const dataExplorerGraphTypes =
      tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes;
    expect(dataExplorerGraphTypes.length).toEqual(1);
    expect(dataExplorerGraphTypes[0].name).toEqual('Scatter Plot');
    expect(dataExplorerGraphTypes[0].value).toEqual('scatter');
  });
}

function shouldRepopulateDataExplorerGraphTypes() {
  it('should repopulate data explorer graph types', () => {
    tableAuthoringController.isDataExplorerScatterPlotEnabled = false;
    tableAuthoringController.isDataExplorerLineGraphEnabled = false;
    tableAuthoringController.isDataExplorerBarGraphEnabled = false;
    tableAuthoringController.repopulateDataExplorerGraphTypes();
    expect(tableAuthoringController.isDataExplorerScatterPlotEnabled).toEqual(true);
    expect(tableAuthoringController.isDataExplorerLineGraphEnabled).toEqual(false);
    expect(tableAuthoringController.isDataExplorerBarGraphEnabled).toEqual(true);
  });
}

function shouldInitializeDataExplorerSeriesParams() {
  it('should initialize data explorer series params', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams = null;
    tableAuthoringController.authoringComponentContent.numDataExplorerSeries = 2;
    tableAuthoringController.initializeDataExplorerSeriesParams();
    expect(
      tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams.length
    ).toEqual(2);
  });
}

function shouldHandleNumDataExplorerSeriesChangeIncrease() {
  it('should handle num data explorer series change increase', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams = [{}];
    tableAuthoringController.authoringComponentContent.numDataExplorerSeries = 2;
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    tableAuthoringController.numDataExplorerSeriesChanged();
    expect(
      tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams.length
    ).toEqual(2);
  });
}

function shouldHandleNumDataExplorerSeriesChangeDecrease() {
  it('should handle num data explorer series change decrease', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams = [{}, {}, {}];
    tableAuthoringController.authoringComponentContent.numDataExplorerSeries = 2;
    spyOn(tableAuthoringController, 'componentChanged').and.callFake(() => {});
    tableAuthoringController.numDataExplorerSeriesChanged();
    expect(
      tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams.length
    ).toEqual(2);
  });
}

function shouldIncreaseNumDataExplorerSeries() {
  it('should increase num data explorer series', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams = [{}];
    tableAuthoringController.increaseNumDataExplorerSeries(3);
    expect(
      tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams.length
    ).toEqual(3);
  });
}

function shouldDecreaseNumDataExplorerSeries() {
  it('should decrease num data explorer series', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams = [{}, {}, {}];
    tableAuthoringController.decreaseNumDataExplorerSeries(1);
    expect(
      tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams.length
    ).toEqual(1);
  });
}

function shouldUpdateDataExplorerSeriesParamsYAxis() {
  it('should update data explorer series params y axis', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams = [
      { yAxis: 0 },
      { yAxis: 1 },
      { yAxis: 2 }
    ];
    tableAuthoringController.authoringComponentContent.numDataExplorerYAxis = 2;
    tableAuthoringController.updateDataExplorerSeriesParamsYAxis(1);
    const dataExplorerSeriesParams =
      tableAuthoringController.authoringComponentContent.dataExplorerSeriesParams;
    expect(dataExplorerSeriesParams[0].yAxis).toEqual(0);
    expect(dataExplorerSeriesParams[1].yAxis).toEqual(1);
    expect(dataExplorerSeriesParams[2].yAxis).toEqual(0);
  });
}
