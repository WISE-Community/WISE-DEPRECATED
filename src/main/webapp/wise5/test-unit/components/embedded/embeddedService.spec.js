import vleModule from '../../../vle/vle';

let EmbeddedService;

describe('EmbeddedService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(_EmbeddedService_ => {
    EmbeddedService = _EmbeddedService_;
  }));

  shouldCheckThatAComponentIsNotCompleted();
  shouldCheckThatAComponentIsCompleted();
});

function shouldCheckThatAComponentIsNotCompleted() {
  it('should check that a component is not completed', () => {
    const component = {};
    const componentStates = [];
    const isCompleted = EmbeddedService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(false);
  });
}

function shouldCheckThatAComponentIsCompleted() {
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
}
