"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _main = _interopRequireDefault(require("authoringTool/main"));

require("angular-mocks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('EmbeddedAuthoringController', function () {
  var $controller;
  var $rootScope;
  var $scope;
  var embeddedAuthoringController;
  var component;
  beforeEach(_angular["default"].mock.module(_main["default"].name));
  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '86fel4wjm4',
      'type': 'Embedded',
      'prompt': '',
      'showSaveButton': false,
      'showSubmitButton': false,
      'url': 'glucose.html',
      'showAddToNotebookButton': true,
      'width': null
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    embeddedAuthoringController = $controller('EmbeddedAuthoringController', {
      $scope: $scope
    });
    embeddedAuthoringController.nodeId = 'node1';
  }));
  it('should select the model file', function () {
    embeddedAuthoringController.nodeId = 'node1';
    embeddedAuthoringController.componentId = 'component1';
    expect(embeddedAuthoringController.authoringComponentContent.url).toEqual('glucose.html');
    spyOn(embeddedAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    var event = {};
    var args = {
      nodeId: 'node1',
      componentId: 'component1',
      target: 'modelFile',
      assetItem: {
        fileName: 'thermo.html'
      }
    };
    embeddedAuthoringController.assetSelected(event, args);
    expect(embeddedAuthoringController.authoringComponentContent.url).toEqual('thermo.html');
  });
  it('should have a default height', function () {
    expect(embeddedAuthoringController.height).toEqual('600px');
  });
  it('should set the width and height', function () {
    expect(embeddedAuthoringController.width).toEqual('none');
    expect(embeddedAuthoringController.height).toEqual('600px');
    embeddedAuthoringController.setWidthAndHeight(400, 300);
    expect(embeddedAuthoringController.width).toEqual('400px');
    expect(embeddedAuthoringController.height).toEqual('300px');
  });
});
//# sourceMappingURL=embeddedAuthoringController.spec.js.map
