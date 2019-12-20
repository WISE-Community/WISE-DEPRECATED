import authoringToolModule from '../../../authoringTool/authoringTool';

describe('TableAuthoringController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let tableAuthoringController;
  let component;

  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
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
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    tableAuthoringController = $controller('TableAuthoringController', { $scope: $scope });
  }));

  it('should toggle data explorer', () => {
    spyOn(tableAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    tableAuthoringController.authoringComponentContent.isDataExplorerEnabled = true;
    tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes = null;
    tableAuthoringController.authoringComponentContent.numDataExplorerSeries = null; 
    tableAuthoringController.authoringComponentContent.isDataExplorerAxisLabelsEditable = null;
    tableAuthoringController.authoringToggleDataExplorer();
    expect(tableAuthoringController.authoringComponentContent.isDataExplorerEnabled).toEqual(true);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(1);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('scatter');
    expect(tableAuthoringController.authoringComponentContent.numDataExplorerSeries).toEqual(1);
    expect(tableAuthoringController.authoringComponentContent.isDataExplorerAxisLabelsEditable)
        .toEqual(false);
  });

  it('should toggle data explorer scatter plot', () => {
    spyOn(tableAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(2);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('scatter');
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[1].value)
        .toEqual('column');
    tableAuthoringController.dataExplorerToggleScatterPlot();
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(1);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('column');
  });

  it('should toggle data explorer line graph', () => {
    spyOn(tableAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(2);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('scatter');
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[1].value)
        .toEqual('column');
    tableAuthoringController.dataExplorerToggleLineGraph();
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(3);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[2].value)
        .toEqual('line');
  });

  it('should toggle data explorer bar graph', () => {
    spyOn(tableAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(2);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('scatter');
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[1].value)
        .toEqual('column');
    tableAuthoringController.dataExplorerToggleBarGraph();
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(1);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('scatter');
  });

  it('should toggle data explorer graph type', () => {
    spyOn(tableAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(2);
    tableAuthoringController.dataExplorerToggleGraphType('Hello', 'World');
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(3); 
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[2].name)
        .toEqual('Hello');
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[2].value)
        .toEqual('World');
  });

  it('should create graph type object', () => {
    const graphTypeObject = tableAuthoringController.createGraphTypeObject('Hello', 'World');
    expect(graphTypeObject.name).toEqual('Hello');
    expect(graphTypeObject.value).toEqual('World');
  });

  it('should initialize data explorer graph types', () => {
    tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes = [];
    tableAuthoringController.initializeDataExplorerGraphTypes();
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes.length)
        .toEqual(1);
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].name)
        .toEqual('Scatter Plot');
    expect(tableAuthoringController.authoringComponentContent.dataExplorerGraphTypes[0].value)
        .toEqual('scatter');
  });

  it('should repopulate data explorer graph types', () => {
    tableAuthoringController.isDataExplorerScatterPlotEnabled = false;
    tableAuthoringController.isDataExplorerLineGraphEnabled = false;
    tableAuthoringController.isDataExplorerBarGraphEnabled = false;
    tableAuthoringController.repopulateDataExplorerGraphTypes();
    expect(tableAuthoringController.isDataExplorerScatterPlotEnabled).toEqual(true);
    expect(tableAuthoringController.isDataExplorerLineGraphEnabled).toEqual(false);
    expect(tableAuthoringController.isDataExplorerBarGraphEnabled).toEqual(true);
  });

});
