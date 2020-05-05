import vleModule from '../../../vle/vle';

let DiscussionService;
let TeacherDataService;

class MockTeacherDataService {
  constructor() {}
  getComponentStatesByWorkgroupIdAndComponentIds(workgroupId, componentId) {
    return [];
  }
  getComponentStatesByComponentIds(componentIds) {
    return [];
  }
}

describe('DiscussionService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(_DiscussionService_ => {
    DiscussionService = _DiscussionService_;
    TeacherDataService = new MockTeacherDataService();
  }));

  shouldCheckThatAComponentStateHasStudentWorkWhenStudentOnlyAttachedAFile();
  shouldCheckThatAComponentStateDesNotHaveStudentWork();
  shouldCheckThatAComponentStateHasStudentWork();
  shouldGetPostAndAllRepliesWithComponentIdAndComponentStateId();
  shouldGetPostsAssociatedWithComponentIdsAndWorkgroupId();
});

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

function shouldCheckThatAComponentStateHasStudentWorkWhenStudentOnlyAttachedAFile() {
  it('should check that a component state has student work when student only attached a file', () => {
    const componentState = {
      studentData: {
        attachments: ['somefile.png']
      }
    };
    const componentContent = {
      starterSentence: 'starter sentence'
    };
    const hasStudentWork = DiscussionService.componentStateHasStudentWork(
      componentState,
      componentContent
    );
    expect(hasStudentWork).toEqual(true);
  });
}

function shouldCheckThatAComponentStateDesNotHaveStudentWork() {
  it('should check that a component state does not have student work', () => {
    const componentState = {
      studentData: {
        response: ''
      }
    };
    const componentContent = {
      starterSentence: 'starter sentence'
    };
    const hasStudentWork = DiscussionService.componentStateHasStudentWork(
      componentState,
      componentContent
    );
    expect(hasStudentWork).toEqual(false);
    const componentState2 = {
      studentData: {
        response: 'starter sentence'
      }
    };
    const hasStudentWork2 = DiscussionService.componentStateHasStudentWork(
      componentState2,
      componentContent
    );
    expect(hasStudentWork2).toEqual(false);
  });
}

function shouldCheckThatAComponentStateHasStudentWork() {
  it('should check that a component state has student work', () => {
    const componentState = {
      studentData: {
        response: 'The sun generates heat.'
      }
    };
    const componentContent = {
      starterSentence: 'starter sentence'
    };
    const hasStudentWork = DiscussionService.componentStateHasStudentWork(
      componentState,
      componentContent
    );
    expect(hasStudentWork).toEqual(true);
  });
}

function shouldGetPostAndAllRepliesWithComponentIdAndComponentStateId() {
  it('should get post and all replies with component id and component state id', () => {
    const nodeId = 'node1';
    const componentId = 'component1';
    const componentStateId = 1;
    DiscussionService.TeacherDataService = TeacherDataService;
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByComponentIds').and.callFake(
      () => {
        const componentStates = [
          createComponentState(1, nodeId, componentId, null, 'Hello'),
          createComponentState(2, nodeId, componentId, 1, 'World'),
          createComponentState(3, nodeId, componentId, null, 'OK')
        ];
        return componentStates;
      }
    );
    const postAndAllReplies = DiscussionService.getPostAndAllRepliesByComponentIds(
      [componentId],
      componentStateId
    );
    expect(postAndAllReplies.length).toEqual(2);
  });
}

function shouldGetPostsAssociatedWithComponentIdsAndWorkgroupId() {
  it('should get posts associated with component ids and workgroup id', () => {
    const nodeId = 'node1';
    const componentId = 'component1';
    const workgroupId = 1;
    const alicePost1 = createComponentState(1, nodeId, componentId, null, 'Alice Thread');
    const alicePost2 = createComponentState(
      2,
      nodeId,
      componentId,
      1,
      'Alice reply in Alice Thread'
    );
    const bobPost1 = createComponentState(3, nodeId, componentId, null, 'Bob Thread');
    const alicePost3 = createComponentState(4, nodeId, componentId, 3, 'Alice reply in Bob Thread');
    DiscussionService.TeacherDataService = TeacherDataService;
    spyOn(
      DiscussionService.TeacherDataService,
      'getComponentStatesByWorkgroupIdAndComponentIds'
    ).and.callFake(() => {
      const componentStates = [alicePost1, alicePost2, alicePost3];
      return componentStates;
    });
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByComponentIds').and.callFake(
      () => {
        const componentStates = [alicePost1, alicePost2, bobPost1, alicePost3];
        return componentStates;
      }
    );
    const postAndAllReplies = DiscussionService.getPostsAssociatedWithComponentIdsAndWorkgroupId(
      [componentId],
      workgroupId
    );
    expect(postAndAllReplies.length).toEqual(4);
  });
}
