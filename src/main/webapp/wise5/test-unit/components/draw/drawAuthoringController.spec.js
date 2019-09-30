'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('DrawAuthoringController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var drawAuthoringController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '6ib04ymmi8',
      'type': 'Draw',
      'prompt': 'Draw your favorite thing.',
      'showSaveButton': false,
      'showSubmitButton': false,
      'stamps': {
        'Stamps': ['carbon.png', 'oxygen.png']
      },
      'tools': {
        'select': true,
        'line': true,
        'shape': true,
        'freeHand': true,
        'text': true,
        'stamp': true,
        'strokeColor': true,
        'fillColor': true,
        'clone': true,
        'strokeWidth': true,
        'sendBack': true,
        'sendForward': true,
        'undo': true,
        'redo': true,
        'delete': true
      },
      'showAddToNotebookButton': true,
      'background': 'background.png'
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    drawAuthoringController = $controller('DrawAuthoringController', { $scope: $scope });
    drawAuthoringController.nodeId = 'node1';
  }));

  it('should select the background image', function () {
    drawAuthoringController.nodeId = 'node1';
    drawAuthoringController.componentId = 'component1';
    expect(drawAuthoringController.authoringComponentContent.background).toEqual('background.png');
    spyOn(drawAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    var event = {};
    var args = {
      nodeId: 'node1',
      componentId: 'component1',
      target: 'background',
      assetItem: {
        fileName: 'new_background.png'
      }
    };
    drawAuthoringController.assetSelected(event, args);
    expect(drawAuthoringController.authoringComponentContent.background).toEqual('new_background.png');
  });

  it('should move a stamp up', function () {
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual('carbon.png');
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual('oxygen.png');
    spyOn(drawAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    drawAuthoringController.authoringMoveStampUp(1);
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual('oxygen.png');
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual('carbon.png');
  });

  it('should move a stamp down', function () {
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual('carbon.png');
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual('oxygen.png');
    spyOn(drawAuthoringController, 'authoringViewComponentChanged').and.callFake(function () {});
    drawAuthoringController.authoringMoveStampDown(0);
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[0]).toEqual('oxygen.png');
    expect(drawAuthoringController.authoringComponentContent.stamps.Stamps[1]).toEqual('carbon.png');
  });
});
//# sourceMappingURL=drawAuthoringController.spec.js.map
