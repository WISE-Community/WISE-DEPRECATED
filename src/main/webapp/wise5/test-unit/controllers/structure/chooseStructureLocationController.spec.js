import authoringToolModule from '../../../authoringTool/authoringTool';

describe('ChooseStructureLocationController', () => {
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
    controller = $controller('ChooseStructureLocationController', {
      $scope: $scope,
      $state: $state
    });
  }));

  testInsertAsFirstActivity();
  testInsertAfter();
  testCancel();

  function testInsertAsFirstActivity() {
    describe('insertAsFirstActivity', () => {
      xit('should insert the structure as the first activity', () => {});
    });
  }

  function testInsertAfter() {
    describe('insertAfter', () => {
      xit('should insert the structure after the specified activity', () => {});
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
