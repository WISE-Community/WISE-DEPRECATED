import authoringToolModule from '../../../authoringTool/authoringTool';

describe('ChooseStructureController', () => {
  let $controller;
  let $rootScope;
  let $state;
  let $scope;
  let controller;

  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_, _$state_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    $scope = $rootScope.$new();
    controller = $controller('ChooseStructureController', { $scope: $scope, $state: $state });
  }));

  testChooseStructure();
  testCancel();

  function testChooseStructure() {
    describe('chooseStructure', () => {
      it('should go to the configure state with the chosen structure', () => {
        spyOn($state, 'go');
        const structure = {
          id: 'jigsaw',
          label: 'Jigsaw',
          description: 'This is a Jigsaw. Students do stuff.'
        };
        controller.chooseStructure(structure);
        expect($state.go).toHaveBeenCalledWith('root.project.structure.configure',
            { structure: structure });
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
    })
  }
});


