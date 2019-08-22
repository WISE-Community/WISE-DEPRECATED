import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('EmbeddedService', () => {

  let EmbeddedService;

  beforeEach(angular.mock.module(mainModule.name));

  beforeEach(inject((_EmbeddedService_) => {
    EmbeddedService = _EmbeddedService_;
  }));

  it('should check that a component is not completed', () => {
    const component = {};
    const componentStates = [];
    const isCompleted = EmbeddedService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(false);
  });

  it('should check that a component is completed', () => {
    const component = {};
    const componentStates = [
      {
        studentData: {
          isCompleted: true
        }
      }
    ];
    const isCompleted = EmbeddedService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(true);
  });

});
