import vleModule from '../../vle/vle';

let ConfigService;
let NodeService;
let ProjectService;
let StudentDataService;
let demoProjectJSON;
const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

describe('NodeService', () => {
  beforeEach(angular.mock.module(vleModule.name));
  beforeEach(inject(function(
    _ConfigService_,
    _NodeService_,
    _ProjectService_,
    _StudentDataService_,
    _$q_
  ) {
    ConfigService = _ConfigService_;
    NodeService = _NodeService_;
    ProjectService = _ProjectService_;
    StudentDataService = _StudentDataService_;
    StudentDataService.studentData = { events: [] };
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
  }));
  getNextNodeId();
});

function getNextNodeId() {
  describe('getNextNodeNodeId', () => {
    it('should return the next node in the project', async () => {
      ProjectService.setProject(demoProjectJSONOriginal);
      spyOn(NodeService, 'chooseTransition').and.returnValue(Promise.resolve({ to: 'node2' }));
      NodeService.getNextNodeId('node1').then(nextNodeId => {
        expect(NodeService.chooseTransition).toHaveBeenCalled();
        expect(nextNodeId).toEqual('node2');
      });
    });
  });
}
