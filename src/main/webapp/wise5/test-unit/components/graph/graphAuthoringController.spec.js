"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _main = _interopRequireDefault(require("authoringTool/main"));

require("angular-mocks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('GraphAuthoringController', function () {
  var $controller;
  var $rootScope;
  var $scope;
  var graphAuthoringController;
  var component;
  beforeEach(_angular["default"].mock.module(_main["default"].name));
  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '86fel4wjm4',
      'type': 'Graph',
      'prompt': '',
      'showSaveButton': false,
      'showSubmitButton': false,
      'xAxis': {
        'plotLines': []
      },
      'yAxis': {
        'plotLines': []
      }
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    graphAuthoringController = $controller('GraphAuthoringController', {
      $scope: $scope
    });
  }));
  it('should add an x axis plot line', function () {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(0);
    graphAuthoringController.authoringAddXAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.xAxis.plotLines.length).toEqual(1);
  });
  it('should delete an x axis plot line', function () {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    var plotLine = {
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
  it('should add a y axis plot line', function () {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(0);
    graphAuthoringController.authoringAddYAxisPlotLine();
    expect(graphAuthoringController.authoringComponentContent.yAxis.plotLines.length).toEqual(1);
  });
  it('should delete a y axis plot line', function () {
    spyOn(graphAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    var plotLine = {
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
});
//# sourceMappingURL=graphAuthoringController.spec.js.map
