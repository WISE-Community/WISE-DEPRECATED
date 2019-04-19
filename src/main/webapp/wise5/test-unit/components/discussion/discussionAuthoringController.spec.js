'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockProjectService = {
  getComponentByNodeIdAndComponentId: function getComponentByNodeIdAndComponentId(nodeId, componentId) {
    return { nodeId: nodeId, componentId: componentId };
  }
};

describe('DiscussionAuthoringController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var discussionAuthoringController = void 0;
  var component = void 0;

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
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    discussionAuthoringController = $controller('DiscussionAuthoringController', { $scope: $scope, ProjectService: mockProjectService });
    discussionAuthoringController.nodeId = 'node10';
  }));

  it('should change all discussion connected component types', function () {
    discussionAuthoringController.authoringComponentContent.connectedComponents = [{ nodeId: 'node1', componentId: '1111111111', type: 'showWork' }, { nodeId: 'node2', componentId: '2222222222', type: 'showWork' }];
    var authoringViewComponentChangedSpy = spyOn(discussionAuthoringController, 'authoringViewComponentChanged');
    var getComponentByNodeIdAndComponentIdSpy = spyOn(mockProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue({ nodeId: 'node1', componentId: '1111111111', type: 'Discussion' });
    var firstConnectedComponent = discussionAuthoringController.authoringComponentContent.connectedComponents[0];
    var secondConnectedComponent = discussionAuthoringController.authoringComponentContent.connectedComponents[1];
    firstConnectedComponent.type = 'importWork';
    discussionAuthoringController.authoringConnectedComponentTypeChanged(firstConnectedComponent);
    expect(firstConnectedComponent.type).toEqual('importWork');
    expect(secondConnectedComponent.type).toEqual('importWork');
  });
});
//# sourceMappingURL=discussionAuthoringController.spec.js.map
