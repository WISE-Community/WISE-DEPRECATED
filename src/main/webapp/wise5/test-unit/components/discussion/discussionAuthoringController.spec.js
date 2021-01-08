import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let discussionAuthoringController;
let component;

const mockProjectService = {
  getComponentByNodeIdAndComponentId: function(nodeId, componentId) {
    return { nodeId: nodeId, componentId: componentId };
  }
};

describe('DiscussionAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    discussionAuthoringController = $controller('DiscussionAuthoringController', {
      $scope: $scope,
      ProjectService: mockProjectService
    });
    discussionAuthoringController.nodeId = 'node10';
  }));

  shouldChangeAllDiscussionConnectedComponentTypes();
});

function createComponent() {
  return {
    id: '1sc05cn75f',
    type: 'Discussion',
    prompt: 'What is your favorite ice cream flavor?',
    showSaveButton: false,
    showSubmitButton: false,
    isStudentAttachmentEnabled: true,
    gateClassmateResponses: true,
    showAddToNotebookButton: true
  };
}

function shouldChangeAllDiscussionConnectedComponentTypes() {
  it('should change all discussion connected component types', () => {
    discussionAuthoringController.authoringComponentContent.connectedComponents = [
      { nodeId: 'node1', componentId: '1111111111', type: 'showWork' },
      { nodeId: 'node2', componentId: '2222222222', type: 'showWork' }
    ];
    const componentChangedSpy = spyOn(discussionAuthoringController, 'componentChanged');
    const getComponentByNodeIdAndComponentIdSpy = spyOn(
      mockProjectService,
      'getComponentByNodeIdAndComponentId'
    ).and.returnValue({ nodeId: 'node1', componentId: '1111111111', type: 'Discussion' });
    const firstConnectedComponent =
      discussionAuthoringController.authoringComponentContent.connectedComponents[0];
    const secondConnectedComponent =
      discussionAuthoringController.authoringComponentContent.connectedComponents[1];
    firstConnectedComponent.type = 'importWork';
    discussionAuthoringController.connectedComponentTypeChanged(firstConnectedComponent);
    expect(firstConnectedComponent.type).toEqual('importWork');
    expect(secondConnectedComponent.type).toEqual('importWork');
  });
}
