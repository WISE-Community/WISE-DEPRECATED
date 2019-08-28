import vleModule from '../../../vle/vle';

describe('ConceptMapService', () => {

  let ConceptMapService;

  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_ConceptMapService_) => {
    ConceptMapService = _ConceptMapService_;
  }));

  it('should get the next available id', () => {
    const nodes = [
      { id: 'node1' },
      { id: 'node2' },
      { id: 'node3' }
    ];
    const nextAvailableId = ConceptMapService.getNextAvailableId(nodes, 'node');
    expect(nextAvailableId).toEqual('node4');
  });

});
