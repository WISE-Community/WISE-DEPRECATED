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
  shouldConvertSingleYAxisToMultipleYAxes();
  shouldConvertMultipleYAxesToSingleYAxis();
  shouldAddYAxisToAllSeries();
  shouldRemoveYAxisToAllSeries();
  shouldIncreaseYAxes();
  shouldDecreaseYAxes();
  shouldUpdateYAxisTitleColor();
  shouldAddAnyMissingYAxisFields();
  shouldAddAnyMissingYAxisFieldsToAllYAxesWithOneYAxis();
  shouldAddAnyMissingYAxisFieldsToAllYAxesWithMultipleYAxes();
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

function shouldConvertSingleYAxisToMultipleYAxes() {
  it('should convert single Y axis to multiple y axes', () => {
    const firstYAxis = {
      title: {
        text: 'Count'
      },
      min: 0,
      max: 100,
      units: '',
      locked: true
    };
    graphAuthoringController.authoringComponentContent.yAxis = firstYAxis;
    graphAuthoringController.convertSingleYAxisToMultipleYAxes();
    expect(Array.isArray(graphAuthoringController.authoringComponentContent.yAxis)).toBe(true);
    expect(graphAuthoringController.authoringComponentContent.yAxis.length).toEqual(2);
    expect(graphAuthoringController.authoringComponentContent.yAxis[0]).toEqual(firstYAxis);
    expect(graphAuthoringController.authoringComponentContent.yAxis[1].title.text).toEqual('');
    expect(graphAuthoringController.authoringComponentContent.yAxis[1].opposite).toEqual(true);
  });
}

function shouldConvertMultipleYAxesToSingleYAxis() {
  it('should convert multiple Y axes to single y axis', () => {
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
    graphAuthoringController.authoringComponentContent.yAxis = [firstYAxis, secondYAxis];
    graphAuthoringController.convertMultipleYAxesToSingleYAxis();
    expect(Array.isArray(graphAuthoringController.authoringComponentContent.yAxis)).toBe(false);
    expect(graphAuthoringController.authoringComponentContent.yAxis).toEqual(firstYAxis);
  });
}

function shouldAddYAxisToAllSeries() {
  it('should add y axis to all series', () => {
    graphAuthoringController.authoringComponentContent.series = [
      { name: 'Prediction' },
      { name: 'Actual' }
    ];
    graphAuthoringController.addYAxisToAllSeries();
    expect(graphAuthoringController.authoringComponentContent.series[0].yAxis).toEqual(0);
    expect(graphAuthoringController.authoringComponentContent.series[1].yAxis).toEqual(0);
  });
}

function shouldRemoveYAxisToAllSeries() {
  it('should remove y axes from all series', () => {
    graphAuthoringController.authoringComponentContent.series = [
      { name: 'Prediction', yAxis: 0 },
      { name: 'Actual', yAxis: 1 }
    ];
    graphAuthoringController.removeYAxisFromAllSeries();
    expect(graphAuthoringController.authoringComponentContent.series[0].yAxis).toBeUndefined();
    expect(graphAuthoringController.authoringComponentContent.series[1].yAxis).toBeUndefined();
  });
}

function shouldIncreaseYAxes() {
  it('should increase y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [{
      title: { text: 'Y Axis 1' }
    },{
      title: { text: 'Y Axis 2' }
    }];
    graphAuthoringController.increaseYAxes(4);
    expect(graphAuthoringController.authoringComponentContent.yAxis.length).toEqual(4);
    expect(graphAuthoringController.authoringComponentContent.yAxis[0].title.text).toEqual('Y Axis 1');
    expect(graphAuthoringController.authoringComponentContent.yAxis[1].title.text).toEqual('Y Axis 2');
    expect(graphAuthoringController.authoringComponentContent.yAxis[2].title.text).toEqual('');
    expect(graphAuthoringController.authoringComponentContent.yAxis[3].title.text).toEqual('');
  });
}

function shouldDecreaseYAxes() {
  it('should decrease y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [{
      title: { text: 'Y Axis 1' }
    },{
      title: { text: 'Y Axis 2' }
    },{
      title: { text: 'Y Axis 3' }
    }];
    graphAuthoringController.decreaseYAxes(2);
    expect(graphAuthoringController.authoringComponentContent.yAxis.length).toEqual(2);
    expect(graphAuthoringController.authoringComponentContent.yAxis[0].title.text).toEqual('Y Axis 1');
    expect(graphAuthoringController.authoringComponentContent.yAxis[1].title.text).toEqual('Y Axis 2');
  });
}

function shouldUpdateYAxisTitleColor() {
  it('should update y axis title color', () => {
    const yAxis = {
      labels: {
        style: {
          color: 'red'
        }
      },
      title: {
        style: {
          color: 'red'
        }
      }
    };
    yAxis.labels.style.color = 'blue';
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(() => {});
    graphAuthoringController.yAxisColorChanged(yAxis);
    expect(yAxis.title.style.color).toEqual('blue');
  });
}

function shouldAddAnyMissingYAxisFields() {
  it('should add any missing y axis fields', () => {
    const yAxis = {};
    graphAuthoringController.addAnyMissingYAxisFields(yAxis);
    expect(yAxis.title.style).toBeDefined();
    expect(yAxis.labels.style).toBeDefined();
  });
}

function shouldAddAnyMissingYAxisFieldsToAllYAxesWithOneYAxis() {
  it('should add any missing y axis fields to all y axes with one y axis', () => {
    const yAxis = {};
    graphAuthoringController.addAnyMissingYAxisFieldsToAllYAxes(yAxis);
    expect(yAxis.title.style).toBeDefined();
    expect(yAxis.labels.style).toBeDefined();
    expect(yAxis.opposite).toBe(false);
  });
}

function shouldAddAnyMissingYAxisFieldsToAllYAxesWithMultipleYAxes() {
  it('should add any missing y axis fields to all y axes with multiple y axes', () => {
    const yAxis = [{},{}];
    graphAuthoringController.addAnyMissingYAxisFieldsToAllYAxes(yAxis);
    expect(yAxis[0].title.style).toBeDefined();
    expect(yAxis[0].labels.style).toBeDefined();
    expect(yAxis[0].opposite).toBe(false);
    expect(yAxis[1].title.style).toBeDefined();
    expect(yAxis[1].labels.style).toBeDefined();
    expect(yAxis[1].opposite).toBe(false);
  });
}