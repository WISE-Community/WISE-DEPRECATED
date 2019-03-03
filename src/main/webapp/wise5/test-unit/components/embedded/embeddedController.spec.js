'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('EmbeddedController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var $httpBackend = void 0;
  var embeddedController = void 0;
  var component = void 0;
  var createComponentState = function createComponentState(componentStateId, nodeId, componentId, componentStateIdReplyingTo, response) {
    return {
      id: componentStateId,
      nodeId: nodeId,
      componentId: componentId,
      studentData: {
        response: response,
        componentStateIdReplyingTo: componentStateIdReplyingTo
      }
    };
  };

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    component = {
      'id': '1sc05cn75f',
      'type': 'Embedded',
      'prompt': 'Use the model and learn stuff.',
      'showSaveButton': false,
      'showSubmitButton': false,
      'isStudentAttachmentEnabled': true,
      'gateClassmateResponses': true,
      'showAddToNotebookButton': true
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    embeddedController = $controller('EmbeddedController', { $scope: $scope });
    embeddedController.nodeId = 'node1';
  }));

  it('should merge a component state', function () {
    var toComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 1
      }
    };
    var fromComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 2
      }
    };
    var mergedComponentState = embeddedController.mergeComponentState(toComponentState, fromComponentState);
    expect(mergedComponentState.studentData.modelScore).toEqual(2);
  });

  it('should merge a specific field in a component state', function () {
    var toComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 1,
        modelText: 'Try Again'
      }
    };
    var fromComponentState = {
      componentType: 'Embedded',
      studentData: {
        modelScore: 2,
        modelText: 'Good Job'
      }
    };
    var mergeFields = [{
      name: 'modelText',
      when: 'always',
      action: 'write'
    }];
    var mergedComponentState = embeddedController.mergeComponentState(toComponentState, fromComponentState, mergeFields);
    expect(mergedComponentState.studentData.modelScore).toEqual(1);
    expect(mergedComponentState.studentData.modelText).toEqual('Good Job');
  });
});
//# sourceMappingURL=embeddedController.spec.js.map
