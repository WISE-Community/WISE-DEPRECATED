import authoringToolModule from '../../../authoringTool/authoringTool';

describe('ConfigureStructureController', () => {
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
    controller = $controller('ConfigureStructureController', { $scope: $scope, $state: $state });
  }));

  testChooseLocation();
  testCancel();

  function testChooseLocation() {
    describe('chooseLocation', () => {
      it('should go to the choose location state', () => {
        spyOn($state, 'go');
        controller.chooseLocation();
        expect($state.go).toHaveBeenCalledWith('root.project.structure.location');
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


