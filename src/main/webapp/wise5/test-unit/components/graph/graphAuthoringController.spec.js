import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let graphAuthoringController;
let component;

describe('GraphAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    graphAuthoringController = $controller('GraphAuthoringController', { $scope: $scope });
  }));

  shouldAddAnXAxisPlotLine();
  shouldDeleteAnAAxisPlotLine();
  shouldAddAYAxisPlotLine();
  shouldDeleteAYAxisPlotLine();
});

function createComponent() {
  return {
    id: '86fel4wjm4',
    type: 'Graph',
    prompt: '',
    showSaveButton: false,
    showSubmitButton: false,
    xAxis: {
      plotLines: []
    },
    yAxis: {
      plotLines: []
    }
  };
}

function shouldAddAnXAxisPlotLine() {
  it('should add an x axis plot line', () => {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(0);
    graphAuthoringController.authoringAddXAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(1);
  });
}

function shouldDeleteAnAAxisPlotLine() {
  it('should delete an x axis plot line', () => {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    const plotLine = {
      value: 10,
      label: {
        text: 'Hello'
      }
    };
    graphAuthoringController.authoringComponentContent.xAxis.plotLines.push(plotLine);
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(1);
    graphAuthoringController.authoringDeleteXAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(0);
  });
}

function shouldAddAYAxisPlotLine() {
  it('should add a y axis plot line', () => {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(0);
    graphAuthoringController.authoringAddYAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(1);
  });
}

function shouldDeleteAYAxisPlotLine() {
  it('should delete a y axis plot line', () => {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    const plotLine = {
      value: 10,
      label: {
        text: 'Hello'
      }
    };
    graphAuthoringController.authoringComponentContent.yAxis.plotLines.push(plotLine);
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(1);
    graphAuthoringController.authoringDeleteYAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(0);
  });
}
