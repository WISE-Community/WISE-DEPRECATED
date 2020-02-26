import vleModule from '../../vle/vle';

let NodeService;
let ProjectService;
let StudentDataService;
let demoProjectJSON;
const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

describe('NodeService', () => {
  beforeEach(angular.mock.module(vleModule.name));
  beforeEach(inject(function(
    _NodeService_,
    _ProjectService_,
    _StudentDataService_,
    _$q_
  ) {
    NodeService = _NodeService_;
    ProjectService = _ProjectService_;
    StudentDataService = _StudentDataService_;
    StudentDataService.studentData = { events: [] };
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    ProjectService.setProject(demoProjectJSON);
  }));
  getNextNodeId();
  moveComponent();
});

function getNextNodeId() {
  describe('getNextNodeNodeId', () => {
    getNextNodeNodeId_ReturnNextNodeInProject();
  });
}

function getNextNodeNodeId_ReturnNextNodeInProject() {
  it('should return the next node in the project', async () => {
    spyOn(NodeService, 'chooseTransition').and.returnValue(Promise.resolve({ to: 'node2' }));
    NodeService.getNextNodeId('node1').then(nextNodeId => {
      expect(NodeService.chooseTransition).toHaveBeenCalled();
      expect(nextNodeId).toEqual('node2');
    });
  });
}

function moveComponent() {
  describe('moveComponent', () => {
    moveComponent_MoveOneComponentToBeginning();
    moveComponent_MoveMultipleComponentsToBeginning();
    moveComponent_MoveMultipleComponentsAfterComponent();
  });
}

function moveComponent_MoveOneComponentToBeginning() {
  it('should move one component to the beginning of the node', () => {
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'cjv5kq5290')).toEqual(4);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'm97kyu4d4v')).toEqual(0);
    NodeService.moveComponent('node10', ['cjv5kq5290'], null);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'cjv5kq5290')).toEqual(0);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'm97kyu4d4v')).toEqual(1);
  });
}

function moveComponent_MoveMultipleComponentsToBeginning() {
  it('should move multiple components to the beginning of the node', () => {
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', '2upmb3om1q')).toEqual(2);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'cjv5kq5290')).toEqual(4);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'm97kyu4d4v')).toEqual(0);
    NodeService.moveComponent('node10', ['2upmb3om1q', 'cjv5kq5290'], null);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', '2upmb3om1q')).toEqual(0);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'cjv5kq5290')).toEqual(1);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'm97kyu4d4v')).toEqual(2);
  });
}

function moveComponent_MoveMultipleComponentsAfterComponent() {
  it('should move multiple components after another component', () => {
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', '2upmb3om1q')).toEqual(2);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'cjv5kq5290')).toEqual(4);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'm97kyu4d4v')).toEqual(0);
    NodeService.moveComponent('node10', ['2upmb3om1q', 'cjv5kq5290'], 'm97kyu4d4v');
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', '2upmb3om1q')).toEqual(1);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'cjv5kq5290')).toEqual(2);
    expect(ProjectService.getComponentPositionByNodeIdAndComponentId('node10', 'm97kyu4d4v')).toEqual(0);
  });
}
