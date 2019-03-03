import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

class MockTeacherDataService {
  constructor() {

  }
  getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
    return [];
  }
  getComponentStatesByComponentId(componentId) {
    return [];
  }
}

describe('DiscussionService', () => {

  let DiscussionService;
  let TeacherDataService;
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

  beforeEach(inject((_DiscussionService_) => {
    DiscussionService = _DiscussionService_;
    TeacherDataService = new MockTeacherDataService();
  }));

  it('should check that a component state does not have student work', () => {
    const componentState = {
      studentData: {
        response: ''
      }
    };
    const hasStudentWork = DiscussionService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(false);
  });

  it('should check that a component state has student work', () => {
    const componentState = {
      studentData: {
        response: 'The sun generates heat.'
      }
    };
    const hasStudentWork = DiscussionService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(true);
  });

  it('should get post and all replies with component id and component state id', () => {
    const nodeId = 'node1';
    const componentId = 'component1';
    const componentStateId = 1;
    DiscussionService.TeacherDataService = TeacherDataService;
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByComponentId').and.callFake(() => {
      const componentStates = [
        createComponentState(1, nodeId, componentId, null, 'Hello'),
        createComponentState(2, nodeId, componentId, 1, 'World')
      ];
      return componentStates;
    });
    const postAndAllReplies = DiscussionService.getPostAndAllReplies(componentId, componentStateId);
    expect(postAndAllReplies.length).toEqual(2);
  });

  it('should get posts associated with workgroup id', () => {
    const nodeId = 'node1';
    const componentId = 'component1';
    const workgroupId = 1;
    const alicePost1 = createComponentState(1, nodeId, componentId, null, 'Alice Thread');
    const alicePost2 = createComponentState(2, nodeId, componentId, 1, 'Alice reply in Alice Thread');
    const bobPost1 = createComponentState(3, nodeId, componentId, null, 'Bob Thread');
    const alicePost3 = createComponentState(4, nodeId, componentId, 3, 'Alice reply in Bob Thread');
    DiscussionService.TeacherDataService = TeacherDataService;
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByWorkgroupIdAndComponentId')
        .and.callFake(() => {
      const componentStates = [
        alicePost1,
        alicePost2,
        alicePost3
      ];
      return componentStates;
    });
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByComponentId')
        .and.callFake(() => {
      const componentStates = [
        alicePost1,
        alicePost2,
        bobPost1,
        alicePost3
      ];
      return componentStates;
    });
    const postAndAllReplies = DiscussionService.getPostsAssociatedWithWorkgroupId(componentId, workgroupId);
    expect(postAndAllReplies.length).toEqual(4);
  });

});
