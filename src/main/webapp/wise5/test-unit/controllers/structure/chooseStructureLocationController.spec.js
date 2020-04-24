import authoringToolModule from '../../../authoringTool/authoringTool';

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
    type: 'group',
    ids: ['node1'],
    transitionLogic: {
      transitions: []
    }
  },
  nodes: [
    {
      id: 'node1',
      type: 'node',
      transitionLogic: {
        transitions: []
      }
    }
  ]
};
const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

describe('ChooseStructureLocationController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

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
  testReplaceNodeIds();
  testReplaceConstraintIds();
});

function testInsertAsFirstActivity() {
  describe('insertAsFirstActivity', () => {
    it('should insert the structure as the first activity', () => {
      expect(ProjectService.getGroupNodes().length).toEqual(3);
      spyOn(ProjectService, 'checkPotentialStartNodeIdChangeThenSaveProject').and.returnValue(
        Promise.resolve()
      );
      controller.insertAsFirstActivity();
      ProjectService.parseProject();
      expect(ProjectService.getGroupNodes().length).toEqual(4);
      expect(ProjectService.getPositionById('group3')).toEqual('1');
    });
  });
}

function testInsertAfter() {
  describe('insertAfter', () => {
    it('should insert the structure after the specified activity', () => {
      expect(ProjectService.getGroupNodes().length).toEqual(3);
      spyOn(ProjectService, 'checkPotentialStartNodeIdChangeThenSaveProject').and.returnValue(
        Promise.resolve()
      );
      controller.insertAfterGroup('group1');
      ProjectService.parseProject();
      expect(ProjectService.getGroupNodes().length).toEqual(4);
      expect(ProjectService.getPositionById('group3')).toEqual('2');
    });
  });
}

function testCancel() {
  describe('cancel', () => {
    it('should go to the project state', () => {
      spyOn($state, 'go');
      controller.cancel();
      expect($state.go).toHaveBeenCalledWith('root.at.project');
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
          },
          {
            id: 'node10'
          }
        ]
      };
      structure = controller.replaceOldNodeIds(structure, { group1: 'group2', node1: 'node2' });
      expect(structure.group.id).toEqual('group2');
      expect(structure.nodes[0].id).toEqual('node2');
      expect(structure.nodes[1].id).toEqual('node10');
    });
  });
}

function testReplaceNodeIds() {
  describe('replaceNodeIds', () => {
    it('should replace all instances of a node id', () => {
      let structureJSONString = '["node1", "node2", "node10", "node1"]';
      const oldNodeId = 'node1';
      const newNodeId = 'node3';
      structureJSONString = controller.replaceNodeIds(structureJSONString, oldNodeId, newNodeId);
      const structureJSONArray = JSON.parse(structureJSONString);
      expect(structureJSONArray[0]).toEqual('node3');
      expect(structureJSONArray[1]).toEqual('node2');
      expect(structureJSONArray[2]).toEqual('node10');
      expect(structureJSONArray[3]).toEqual('node3');
    });
  });
}

function testReplaceConstraintIds() {
  describe('replaceConstraintIds', () => {
    it('should replace all instances of a node id in the constraint ids', () => {
      let structureJSONString = '["node1Constraint1", "node1Constraint2", "node2Constraint2"]';
      const oldNodeId = 'node1';
      const newNodeId = 'node3';
      structureJSONString = controller.replaceConstraintIds(
        structureJSONString,
        oldNodeId,
        newNodeId
      );
      const structureJSONArray = JSON.parse(structureJSONString);
      expect(structureJSONArray[0]).toEqual('node3Constraint1');
      expect(structureJSONArray[1]).toEqual('node3Constraint2');
      expect(structureJSONArray[2]).toEqual('node2Constraint2');
    });
  });
}
