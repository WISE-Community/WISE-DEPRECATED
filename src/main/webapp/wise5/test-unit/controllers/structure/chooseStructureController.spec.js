import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $state;
let $scope;
let controller;

describe('ChooseStructureController', () => {
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
});

function testChooseStructure() {
  describe('chooseStructure', () => {
    it('should go to the configure state with the chosen structure', () => {
      spyOn($state, 'go');
      controller.chooseStructure('root.at.project.structure.jigsaw');
      expect($state.go).toHaveBeenCalledWith('root.at.project.structure.jigsaw');
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
