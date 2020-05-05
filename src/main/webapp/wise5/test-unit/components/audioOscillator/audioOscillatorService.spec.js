import vleModule from '../../../vle/vle';

let AudioOscillatorService;

describe('AudioOscillatorService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(_AudioOscillatorService_ => {
    AudioOscillatorService = _AudioOscillatorService_;
  }));

  shouldDetectThatAComponentStateHasStudentWork();
  shouldDetectThatAComponentStateDoesNotHaveStudentWork();
});

function shouldDetectThatAComponentStateHasStudentWork() {
  it('should detect that a component state has student work', () => {
    const componentState = {
      studentData: {
        frequenciesPlayed: [440]
      }
    };
    const hasStudentWork = AudioOscillatorService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(true);
  });
}

function shouldDetectThatAComponentStateDoesNotHaveStudentWork() {
  it('should detect that a component state does not have student work', () => {
    const componentState = {
      studentData: {
        frequenciesPlayed: []
      }
    };
    const hasStudentWork = AudioOscillatorService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(false);
  });
}
