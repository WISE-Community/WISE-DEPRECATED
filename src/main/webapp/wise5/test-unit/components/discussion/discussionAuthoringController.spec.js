import authoringToolModule from '../../../authoringTool/authoringTool';

const mockProjectService = {
  getComponentByNodeIdAndComponentId: function(nodeId, componentId) {
    return { nodeId: nodeId, componentId: componentId };
  }
};

describe('DiscussionAuthoringController', () => {

  let $controller;
  let $rootScope;
  let $scope;
  let discussionAuthoringController;
  let component;

  beforeEach(angular.mock.module(authoringToolModule.name));

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
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    discussionAuthoringController = $controller('DiscussionAuthoringController',
        { $scope: $scope, ProjectService: mockProjectService });
    discussionAuthoringController.nodeId = 'node10';
  }));

  it('should change all discussion connected component types', () => {
    discussionAuthoringController.authoringComponentContent.connectedComponents = [
      { nodeId: 'node1', componentId: '1111111111', type: 'showWork'},
      { nodeId: 'node2', componentId: '2222222222', type: 'showWork'}
    ];
    const authoringViewComponentChangedSpy =
        spyOn(discussionAuthoringController, 'authoringViewComponentChanged');
    const getComponentByNodeIdAndComponentIdSpy =
        spyOn(mockProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(
          { nodeId: 'node1', componentId: '1111111111', type: 'Discussion' }
        );
    const firstConnectedComponent =
        discussionAuthoringController.authoringComponentContent.connectedComponents[0];
    const secondConnectedComponent =
      discussionAuthoringController.authoringComponentContent.connectedComponents[1];
    firstConnectedComponent.type = 'importWork';
    discussionAuthoringController.authoringConnectedComponentTypeChanged(firstConnectedComponent);
    expect(firstConnectedComponent.type).toEqual('importWork');
    expect(secondConnectedComponent.type).toEqual('importWork');
  });
});
