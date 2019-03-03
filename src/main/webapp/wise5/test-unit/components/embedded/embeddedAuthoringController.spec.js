'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('EmbeddedAuthoringController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var embeddedAuthoringController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

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
    embeddedAuthoringController = $controller('EmbeddedAuthoringController', { $scope: $scope });
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
});
//# sourceMappingURL=embeddedAuthoringController.spec.js.map
