import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('DiscussionController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let discussionController;
  let component;
  const createComponentState = (componentStateId, nodeId, componentId, componentStateIdReplyingTo, response) => {
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

  beforeEach(angular.mock.module(mainModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
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

  it('should get the level 1 responses', () => {
    const nodeId = 'node1';
    const componentId = 'component1';
    discussionController.classResponses = [
      createComponentState(1, nodeId, componentId, null, 'Alice Thread'),
      createComponentState(2, nodeId, componentId, 1, 'Alice reply in Alice Thread'),
      createComponentState(3, nodeId, componentId, null, 'Bob Thread'),
      createComponentState(4, nodeId, componentId, 3, 'Alice reply in Bob Thread')
    ];
    const level1Responses = discussionController.getLevel1Responses();
    expect(level1Responses.length).toEqual(2);
  });

});
