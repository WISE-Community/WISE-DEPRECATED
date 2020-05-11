import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let CRaterService;
let openResponseController;
let component;

describe('OpenResponseController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_, _CRaterService_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    CRaterService = _CRaterService_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    openResponseController = $controller('OpenResponseController', {
      $scope: $scope,
      CRaterService: CRaterService
    });
    openResponseController.nodeId = 'node1';
  }));

  shouldCheckHasFeedbackWhenCRaterIsNotEnabled();
  shouldCheckHasFeedbackWhenCRaterIsEnabledAndNotShowFeedbackOrScore();
  shouldCheckHasFeedbackWhenCRaterIsEnabledAndShowFeedback();
  shouldCheckHasFeedbackWhenCRaterIsEnabledAndShowScore();
});

function createComponent() {
  return {
    id: 'j4m2hu5fd0',
    type: 'OpenResponse',
    prompt: 'Explain how plants obtain energy.',
    showSaveButton: false,
    showSubmitButton: false
  };
}

function shouldCheckHasFeedbackWhenCRaterIsNotEnabled() {
  it('should check has feedback when crater is not enabled', () => {
    spyOn(CRaterService, 'isCRaterEnabled').and.returnValue(false);
    expect(openResponseController.hasFeedback()).toEqual(false);
  });
}

function shouldCheckHasFeedbackWhenCRaterIsEnabledAndNotShowFeedbackOrScore() {
  it('should check has feedback when crater is enabled and not show feedback or score', () => {
    openResponseController.componentContent.cRater = {
      showFeedback: false,
      showScore: false
    };
    spyOn(CRaterService, 'isCRaterEnabled').and.returnValue(true);
    expect(openResponseController.hasFeedback()).toEqual(false);
  });
}

function shouldCheckHasFeedbackWhenCRaterIsEnabledAndShowFeedback() {
  it('should check has feedback when crater is enabled and show feedback', () => {
    openResponseController.componentContent.cRater = {
      showFeedback: true,
      showScore: false
    };
    spyOn(CRaterService, 'isCRaterEnabled').and.returnValue(true);
    expect(openResponseController.hasFeedback()).toEqual(true);
  });
}

function shouldCheckHasFeedbackWhenCRaterIsEnabledAndShowScore() {
  it('should check has feedback when crater is enabled and show score', () => {
    openResponseController.componentContent.cRater = {
      showFeedback: false,
      showScore: true
    };
    spyOn(CRaterService, 'isCRaterEnabled').and.returnValue(true);
    expect(openResponseController.hasFeedback()).toEqual(true);
  });
}
