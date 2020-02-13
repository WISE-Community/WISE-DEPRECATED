import authoringToolModule from '../../../authoringTool/authoringTool';

describe('ChooseStructureLocationController', () => {
  let $controller;
  let $rootScope;
  let $state;
  let $scope;
  let controller;
  let ProjectService;
  let demoProjectJSON;
  const structure = {
    id: 'jigsaw',
    label: 'A jigsaw activity',
    group: {
      id: 'group1',
      ids: ['node1']
    },
    nodes: [
      {
        id: 'node1'
      }
    ]
  };

  beforeEach(angular.mock.module(authoringToolModule.name));

  const demoProjectJSONOriginal =
    window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

  beforeEach(inject((_$controller_, _$rootScope_, _$state_, _$stateParams_, _ProjectService_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    ProjectService = _ProjectService_;
    $state = _$state_;
    _$stateParams_.structure = structure;
    $scope = $rootScope.$new();
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    ProjectService.setProject(demoProjectJSON);
    controller = $controller('ChooseStructureLocationController', {
      $scope: $scope,
      $state: $state,
      $stateParams: _$stateParams_,
      ProjectService: ProjectService
    });
  }));

  testInsertAsFirstActivity();
  testInsertAfter();
  testCancel();
  testInjectUniqueIds();
  testReplaceOldNodeIds();

  function testInsertAsFirstActivity() {
    describe('insertAsFirstActivity', () => {
      it('should insert the structure as the first activity', () => {
        expect(ProjectService.getGroupNodes().length).toEqual(3);
        const newGroup = controller.insertAsFirstActivity();
        expect(ProjectService.getGroupNodes().length).toEqual(4);
        expect(ProjectService.getPositionById(newGroup.id)).toEqual('1');
      });
    });
  }

  function testInsertAfter() {
    describe('insertAfter', () => {
      it('should insert the structure after the specified activity', () => {
        expect(ProjectService.getGroupNodes().length).toEqual(3);
        const newGroup = controller.insertAfterGroup('group1');
        expect(ProjectService.getGroupNodes().length).toEqual(4);
        expect(ProjectService.getPositionById(newGroup.id)).toEqual('2');
      });
    });
  }

  function testCancel() {
    describe('cancel', () => {
      it('should go to the project state', () => {
        spyOn($state, 'go');
        controller.cancel();
        expect($state.go).toHaveBeenCalledWith('root.project');
      });
    });
  }

  function testInjectUniqueIds() {
    describe('injectUniqueIds', () => {
      it('should inject unique ids', () => {
        let structure = {
          group: {
            id: 'group1'
          },
          nodes: [
            {
              id: 'node1'
            }
          ]
        };
        structure = controller.injectUniqueIds(structure);
        expect(structure.group.id).toEqual('group3');
        expect(structure.nodes[0].id).toEqual('node790');
      });
    });
  }

  function testReplaceOldNodeIds() {
    describe('replaceOldNodeIds', () => {
      it('should replace old node ids', () => {
        let structure = {
          group: {
            id: 'group1'
          },
          nodes: [
            {
              id: 'node1'
            }
          ]
        };
        structure = controller.replaceOldNodeIds(structure, { group1: 'group2', node1: 'node2' });
        expect(structure.group.id).toEqual('group2');
        expect(structure.nodes[0].id).toEqual('node2');
      });
    });
  }
});
