import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $state;
let $stateParams;
let $scope;
let controller;
const structure = { id: 'jigsaw' };

describe('ConfigureStructureController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_, _$state_, _$stateParams_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $stateParams.structure = structure;
    $scope = $rootScope.$new();
    controller = $controller('ConfigureStructureController', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams
    });
  }));

  testChooseLocation();
  testCancel();
});

function testChooseLocation() {
  describe('chooseLocation', () => {
    it('should go to the choose location state', () => {
      spyOn($state, 'go');
      controller.chooseLocation();
      expect($state.go).toHaveBeenCalledWith('root.at.project.structure.location', {
        structure: {}
      });
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
