'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('DiscussionController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var discussionController = void 0;
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

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '1sc05cn75f',
      'type': 'Discussion',
      'prompt': 'What is your favorite ice cream flavor?',
      'showSaveButton': false,
      'showSubmitButton': false,
      'isStudentAttachmentEnabled': true,
      'gateClassmateResponses': true,
      'showAddToNotebookButton': true
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    discussionController = $controller('DiscussionController', { $scope: $scope });
    discussionController.nodeId = 'node1';
  }));

  it('should get the level 1 responses', function () {
    var nodeId = 'node1';
    var componentId = 'component1';
    discussionController.classResponses = [createComponentState(1, nodeId, componentId, null, 'Alice Thread'), createComponentState(2, nodeId, componentId, 1, 'Alice reply in Alice Thread'), createComponentState(3, nodeId, componentId, null, 'Bob Thread'), createComponentState(4, nodeId, componentId, 3, 'Alice reply in Bob Thread')];
    var level1Responses = discussionController.getLevel1Responses();
    expect(level1Responses.length).toEqual(2);
  });
});
//# sourceMappingURL=discussionController.spec.js.map
