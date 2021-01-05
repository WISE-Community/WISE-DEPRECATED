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
  shouldAddColorToYAxes();
  shouldAddColorToSeries();
  shouldSetSeriesColorToMatchYAxisColor();
  shouldGetYAxisColor();
  shouldUpdateSeriesColorsToMatchYAxisColor();
  shouldHandleSeriesYAxisChanged();
  shouldSetTheNewSeriesColorToMatchYAxis();
  shouldTurnOnMultipleYAxes();
  shouldTurnOffMultipleYAxes();
  shouldIncreaseNumYAxes();
  shouldDecreaseNumYAxes();
  shouldUpdateSeriesYAxisAndColorWhenYAxisIsRemoved();
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

function shouldAddAnXAxisPlotLine() {
  it('should add an x axis plot line', () => {
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(0);
    graphAuthoringController.addXAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(1);
  });
}

function shouldDeleteAnAAxisPlotLine() {
  it('should delete an x axis plot line', () => {
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    const plotLine = {
      value: 10,
      label: {
        text: 'Hello'
      }
    };
    graphAuthoringController.authoringComponentContent.xAxis.plotLines.push(plotLine);
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(1);
    graphAuthoringController.deleteXAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(0);
  });
}

function shouldAddAYAxisPlotLine() {
  it('should add a y axis plot line', () => {
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(0);
    graphAuthoringController.addYAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(1);
  });
}

function shouldDeleteAYAxisPlotLine() {
  it('should delete a y axis plot line', () => {
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    const plotLine = {
      value: 10,
      label: {
        text: 'Hello'
      }
    };
    graphAuthoringController.authoringComponentContent.yAxis.plotLines.push(plotLine);
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(1);
    graphAuthoringController.deleteYAxisPlotLine();
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
    const yAxis = graphAuthoringController.authoringComponentContent.yAxis;
    expect(yAxis.length).toEqual(2);
    expect(yAxis[0]).toEqual(firstYAxis);
    expect(yAxis[1].title.text).toEqual('');
    expect(yAxis[1].opposite).toEqual(true);
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
    };
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
    graphAuthoringController.authoringComponentContent.yAxis = [
      {
        title: { text: 'Y Axis 1' }
      },
      {
        title: { text: 'Y Axis 2' }
      }
    ];
    graphAuthoringController.increaseYAxes(4);
    const yAxis = graphAuthoringController.authoringComponentContent.yAxis;
    expect(yAxis.length).toEqual(4);
    expect(yAxis[0].title.text).toEqual('Y Axis 1');
    expect(yAxis[1].title.text).toEqual('Y Axis 2');
    expect(yAxis[2].title.text).toEqual('');
    expect(yAxis[3].title.text).toEqual('');
  });
}

function shouldDecreaseYAxes() {
  it('should decrease y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      {
        title: { text: 'Y Axis 1' }
      },
      {
        title: { text: 'Y Axis 2' }
      },
      {
        title: { text: 'Y Axis 3' }
      }
    ];
    graphAuthoringController.decreaseYAxes(2);
    const yAxis = graphAuthoringController.authoringComponentContent.yAxis;
    expect(yAxis.length).toEqual(2);
    expect(yAxis[0].title.text).toEqual('Y Axis 1');
    expect(yAxis[1].title.text).toEqual('Y Axis 2');
  });
}

function shouldUpdateYAxisTitleColor() {
  it('should update y axis title color', () => {
    const yAxis = createYAxis('red');
    graphAuthoringController.authoringComponentContent.yAxis = [yAxis];
    graphAuthoringController.authoringComponentContent.series = [];
    yAxis.labels.style.color = 'blue';
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.yAxisColorChanged(0);
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
    expect(yAxis.allowDecimals).toBe(false);
    expect(yAxis.opposite).toBe(false);
  });
}

function shouldAddAnyMissingYAxisFieldsToAllYAxesWithMultipleYAxes() {
  it('should add any missing y axis fields to all y axes with multiple y axes', () => {
    const yAxis = [{}, {}];
    graphAuthoringController.addAnyMissingYAxisFieldsToAllYAxes(yAxis);
    expect(yAxis[0].title.style).toBeDefined();
    expect(yAxis[0].labels.style).toBeDefined();
    expect(yAxis[0].allowDecimals).toBe(false);
    expect(yAxis[0].opposite).toBe(false);
    expect(yAxis[1].title.style).toBeDefined();
    expect(yAxis[1].labels.style).toBeDefined();
    expect(yAxis[1].allowDecimals).toBe(false);
    expect(yAxis[1].opposite).toBe(false);
  });
}

function shouldAddColorToYAxes() {
  it('should add color to y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis(),
      createYAxis(),
      createYAxis(),
      createYAxis()
    ];
    graphAuthoringController.addColorToYAxes();
    const yAxis = graphAuthoringController.authoringComponentContent.yAxis;
    expect(yAxis[0].title.style.color).toEqual('blue');
    expect(yAxis[0].labels.style.color).toEqual('blue');
    expect(yAxis[1].title.style.color).toEqual('red');
    expect(yAxis[1].labels.style.color).toEqual('red');
    expect(yAxis[2].title.style.color).toEqual('green');
    expect(yAxis[2].labels.style.color).toEqual('green');
    expect(yAxis[3].title.style.color).toEqual('orange');
    expect(yAxis[3].labels.style.color).toEqual('orange');
  });
}

function shouldAddColorToSeries() {
  it('should add color to series', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red')
    ];
    graphAuthoringController.authoringComponentContent.series = [{ yAxis: 0 }, { yAxis: 1 }];
    graphAuthoringController.addColorToSeries();
    expect(graphAuthoringController.authoringComponentContent.series[0].color).toEqual('blue');
    expect(graphAuthoringController.authoringComponentContent.series[1].color).toEqual('red');
  });
}

function shouldSetSeriesColorToMatchYAxisColor() {
  it('should set series color to match y axis color', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red')
    ];
    const series = {
      yAxis: 0
    };
    graphAuthoringController.setSeriesColorToMatchYAxisColor(series);
    expect(series.color).toEqual('blue');
    series.yAxis = 1;
    graphAuthoringController.setSeriesColorToMatchYAxisColor(series);
    expect(series.color).toEqual('red');
  });
}

function shouldGetYAxisColor() {
  it('should get y axis color', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red')
    ];
    expect(graphAuthoringController.getYAxisColor(0)).toEqual('blue');
    expect(graphAuthoringController.getYAxisColor(1)).toEqual('red');
  });
}

function shouldUpdateSeriesColorsToMatchYAxisColor() {
  it('should update series colors', () => {
    const series1 = { yAxis: 0, color: 'blue' };
    const series2 = { yAxis: 1, color: 'blue' };
    const series3 = { yAxis: 2, color: 'blue' };
    const series4 = { yAxis: 0, color: 'blue' };
    graphAuthoringController.authoringComponentContent.series = [
      series1,
      series2,
      series3,
      series4
    ];
    graphAuthoringController.updateSeriesColors(0, 'green');
    expect(series1.color).toEqual('green');
    expect(series2.color).toEqual('blue');
    expect(series3.color).toEqual('blue');
    expect(series4.color).toEqual('green');
  });
}

function shouldHandleSeriesYAxisChanged() {
  it('should handle series y axis changed', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red')
    ];
    const series = {
      yAxis: 1
    };
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.seriesYAxisChanged(series);
    expect(series.color).toEqual('red');
  });
}

function shouldSetTheNewSeriesColorToMatchYAxis() {
  it('should set the new series color to match y axis', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('black'),
      createYAxis('red')
    ];
    graphAuthoringController.enableMultipleYAxes = true;
    graphAuthoringController.authoringComponentContent.series = [];
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.addSeriesClicked();
    expect(graphAuthoringController.authoringComponentContent.series[0].color).toEqual('black');
  });
}

function shouldTurnOnMultipleYAxes() {
  it('should turn on multiple y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = createYAxis('black');
    graphAuthoringController.enableMultipleYAxes = true;
    graphAuthoringController.authoringComponentContent.series = [{}];
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.enableMultipleYAxesChanged();
    expect(graphAuthoringController.authoringComponentContent.yAxis.length).toEqual(2);
    expect(graphAuthoringController.authoringComponentContent.series[0].color).toEqual('black');
  });
}

function shouldTurnOffMultipleYAxes() {
  it('should turn off multiple y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [createYAxis('black')];
    graphAuthoringController.enableMultipleYAxes = false;
    graphAuthoringController.authoringComponentContent.series = [{}];
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.enableMultipleYAxesChanged();
    expect(Array.isArray(graphAuthoringController.authoringComponentContent.yAxis)).toEqual(false);
    expect(graphAuthoringController.authoringComponentContent.series[0].yAxis).toBeUndefined();
  });
}

function shouldIncreaseNumYAxes() {
  it('should increase num y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red')
    ];
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.numYAxesChanged(4, 2);
    const yAxis = graphAuthoringController.authoringComponentContent.yAxis;
    expect(yAxis.length).toEqual(4);
    expect(yAxis[0].labels.style.color).toEqual('blue');
    expect(yAxis[1].labels.style.color).toEqual('red');
    expect(yAxis[2].labels.style.color).toEqual('green');
    expect(yAxis[3].labels.style.color).toEqual('orange');
  });
}

function shouldDecreaseNumYAxes() {
  it('should decrease num y axes', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red'),
      createYAxis('green'),
      createYAxis('orange')
    ];
    graphAuthoringController.authoringComponentContent.series = [];
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.numYAxesChanged(2, 4);
    const yAxis = graphAuthoringController.authoringComponentContent.yAxis;
    expect(yAxis.length).toEqual(2);
    expect(yAxis[0].labels.style.color).toEqual('blue');
    expect(yAxis[1].labels.style.color).toEqual('red');
  });
}

function shouldUpdateSeriesYAxisAndColorWhenYAxisIsRemoved() {
  it('should update series y axis and color when y axis is removed', () => {
    graphAuthoringController.authoringComponentContent.yAxis = [
      createYAxis('blue'),
      createYAxis('red'),
      createYAxis('green')
    ];
    graphAuthoringController.authoringComponentContent.series = [
      {
        yAxis: 2,
        color: 'green'
      }
    ];
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(graphAuthoringController, 'componentChanged').and.callFake(() => {});
    graphAuthoringController.numYAxesChanged(2, 3);
    const singleSeries = graphAuthoringController.authoringComponentContent.series[0];
    expect(singleSeries.yAxis).toEqual(0);
    expect(singleSeries.color).toEqual('blue');
  });
}
