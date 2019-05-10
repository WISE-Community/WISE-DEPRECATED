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

  it('should get grading component ids', function () {
    var componentId1 = 'component1';
    discussionController.componentId = componentId1;
    discussionController.componentContent = {
      id: componentId1
    };
    var gradingComponentIds1 = discussionController.getGradingComponentIds();
    expect(gradingComponentIds1.length).toEqual(1);
    var componentId2 = 'component2';
    discussionController.componentContent = {
      id: componentId2,
      connectedComponents: [{
        nodeId: 'node1', componentId: 'component1'
      }]
    };
    var gradingComponentIds2 = discussionController.getGradingComponentIds();
    expect(gradingComponentIds2.length).toEqual(2);
    var componentId3 = 'component2';
    discussionController.componentContent = {
      id: componentId3,
      connectedComponents: [{
        nodeId: 'node1', componentId: 'component1'
      }, {
        nodeId: 'node2', componentId: 'component2'
      }]
    };
    var gradingComponentIds3 = discussionController.getGradingComponentIds();
    expect(gradingComponentIds3.length).toEqual(3);
  });

  it('should sort component states by server save time', function () {
    var componentState1 = {
      id: 1,
      serverSaveTime: 1
    };
    var componentState2 = {
      id: 2,
      serverSaveTime: 2
    };
    var componentState3 = {
      id: 3,
      serverSaveTime: 3
    };
    var componentStates = [componentState1, componentState3, componentState2];
    var sortedComponentStates = componentStates.sort(discussionController.sortByServerSaveTime);
    expect(sortedComponentStates[0]).toEqual(componentState1);
    expect(sortedComponentStates[1]).toEqual(componentState2);
    expect(sortedComponentStates[2]).toEqual(componentState3);
  });

  it('should check if a thread has a post from this component and workgroup id', function () {
    var componentId1 = 'component1';
    var componentId2 = 'component2';
    var workgroupId1 = 1;
    var workgroupId2 = 2;
    var componentState1 = {
      id: 1,
      componentId: componentId1,
      workgroupId: workgroupId1,
      replies: []
    };
    var componentState2 = {
      id: 2,
      componentId: componentId2,
      workgroupId: workgroupId2,
      replies: [{
        id: 3,
        componentId: componentId2,
        workgroupId: workgroupId1
      }]
    };
    discussionController.componentId = componentId1;
    discussionController.workgroupId = workgroupId2;
    expect(discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState1)).toEqual(false);
    discussionController.workgroupId = workgroupId1;
    expect(discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState1)).toEqual(true);
    discussionController.componentId = componentId2;
    discussionController.workgroupId = workgroupId2;
    expect(discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState2)).toEqual(true);
    discussionController.workgroupId = workgroupId1;
    expect(discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState2)).toEqual(true);
  });
});
//# sourceMappingURL=discussionController.spec.js.map
