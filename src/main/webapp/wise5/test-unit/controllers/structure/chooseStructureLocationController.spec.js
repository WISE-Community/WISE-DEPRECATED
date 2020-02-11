import authoringToolModule from '../../../authoringTool/authoringTool';

describe('ChooseStructureLocationController', () => {
  let $controller;
  let $rootScope;
  let $state;
  let $scope;
  let controller;
  let ProjectService;
  let demoProjectJSON;
  const structure = { id: 'jigsaw', label: 'A jigsaw activity' };

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

  function testInsertAsFirstActivity() {
    describe('insertAsFirstActivity', () => {
      it('should insert the structure as the first activity', () => {
        ProjectService.setProject(demoProjectJSON);
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
        ProjectService.setProject(demoProjectJSON);
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
});
