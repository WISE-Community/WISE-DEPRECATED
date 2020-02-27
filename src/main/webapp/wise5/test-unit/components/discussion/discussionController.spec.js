import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let discussionController;
let component;

describe('DiscussionController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    discussionController = $controller('DiscussionController', { $scope: $scope });
    discussionController.nodeId = 'node1';
  }));

  shouldGetTheLevel1Responses();
  shouldGetGradingComponentIds();
  shouldSortComponentStatesByServerSaveTime();
  shouldCheckIfAThreadHasAPostFromThisComponentAndWorkgroupId();
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

function createComponentState(
  componentStateId,
  nodeId,
  componentId,
  componentStateIdReplyingTo,
  response
) {
  return {
    id: componentStateId,
    nodeId: nodeId,
    componentId: componentId,
    studentData: {
      response: response,
      componentStateIdReplyingTo: componentStateIdReplyingTo
    }
  };
}

function shouldGetTheLevel1Responses() {
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
    expect(level1Responses.all.length).toEqual(2);
  });
}

function shouldGetGradingComponentIds() {
  it('should get grading component ids', () => {
    const componentId1 = 'component1';
    discussionController.componentId = componentId1;
    discussionController.componentContent = {
      id: componentId1
    };
    const gradingComponentIds1 = discussionController.getGradingComponentIds();
    expect(gradingComponentIds1.length).toEqual(1);
    const componentId2 = 'component2';
    discussionController.componentContent = {
      id: componentId2,
      connectedComponents: [
        {
          nodeId: 'node1',
          componentId: 'component1'
        }
      ]
    };
    const gradingComponentIds2 = discussionController.getGradingComponentIds();
    expect(gradingComponentIds2.length).toEqual(2);
    const componentId3 = 'component2';
    discussionController.componentContent = {
      id: componentId3,
      connectedComponents: [
        {
          nodeId: 'node1',
          componentId: 'component1'
        },
        {
          nodeId: 'node2',
          componentId: 'component2'
        }
      ]
    };
    const gradingComponentIds3 = discussionController.getGradingComponentIds();
    expect(gradingComponentIds3.length).toEqual(3);
  });
}

function shouldSortComponentStatesByServerSaveTime() {
  it('should sort component states by server save time', () => {
    const componentState1 = {
      id: 1,
      serverSaveTime: 1
    };
    const componentState2 = {
      id: 2,
      serverSaveTime: 2
    };
    const componentState3 = {
      id: 3,
      serverSaveTime: 3
    };
    const componentStates = [componentState1, componentState3, componentState2];
    const sortedComponentStates = componentStates.sort(discussionController.sortByServerSaveTime);
    expect(sortedComponentStates[0]).toEqual(componentState1);
    expect(sortedComponentStates[1]).toEqual(componentState2);
    expect(sortedComponentStates[2]).toEqual(componentState3);
  });
}

function shouldCheckIfAThreadHasAPostFromThisComponentAndWorkgroupId() {
  it('should check if a thread has a post from this component and workgroup id', () => {
    const componentId1 = 'component1';
    const componentId2 = 'component2';
    const workgroupId1 = 1;
    const workgroupId2 = 2;
    const componentState1 = {
      id: 1,
      componentId: componentId1,
      workgroupId: workgroupId1,
      replies: []
    };
    const componentState2 = {
      id: 2,
      componentId: componentId2,
      workgroupId: workgroupId2,
      replies: [
        {
          id: 3,
          componentId: componentId2,
          workgroupId: workgroupId1
        }
      ]
    };
    discussionController.componentId = componentId1;
    discussionController.workgroupId = workgroupId2;
    expect(
      discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState1)
    ).toEqual(false);
    discussionController.workgroupId = workgroupId1;
    expect(
      discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState1)
    ).toEqual(true);
    discussionController.componentId = componentId2;
    discussionController.workgroupId = workgroupId2;
    expect(
      discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState2)
    ).toEqual(true);
    discussionController.workgroupId = workgroupId1;
    expect(
      discussionController.threadHasPostFromThisComponentAndWorkgroupId()(componentState2)
    ).toEqual(true);
  });
}
