import authoringToolModule from '../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let authoringToolController;

describe('AuthoringToolController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    authoringToolController = $controller('AuthoringToolController', { $scope: $scope });
  }));

  shouldSetTheGlobalMessage();
});

function shouldSetTheGlobalMessage() {
  it('should set the global message', () => {
    spyOn($rootScope, '$broadcast');
    const message = '';
    const isProgressIndicatorVisible = true;
    const time = null;
    authoringToolController.setGlobalMessage(message, isProgressIndicatorVisible, time);
    const globalMessage = {
      text: message,
      isProgressIndicatorVisible: isProgressIndicatorVisible,
      time: time
    };
    expect($rootScope.$broadcast).toHaveBeenCalledWith('setGlobalMessage', { globalMessage });
  });
}
