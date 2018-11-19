import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('ConceptMapService', () => {

  let ConceptMapService;

  beforeEach(angular.mock.module(mainModule.name));

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
