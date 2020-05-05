import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let audioOscillatorController;
let component;

describe('AudioOscillatorController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      id: 'q4024mds8j',
      type: 'AudioOscillator',
      prompt: '',
      showSaveButton: false,
      showSubmitButton: true,
      oscillatorTypes: ['sine', 'triangle', 'sawtooth'],
      startingFrequency: 440,
      oscilloscopeWidth: 800,
      oscilloscopeHeight: 400,
      gridCellSize: 50,
      stopAfterGoodDraw: false,
      showAddToNotebookButton: true
    };

    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    window.AudioContext = function() {};
    audioOscillatorController = $controller('AudioOscillatorController', { $scope: $scope });
    audioOscillatorController.nodeId = 'node1';
  }));

  shouldSetTheParametersFromTheComponentContent();
  shouldAddAFrequencyPlayedToTheStudentData();
  shouldCallPlayWhenTheTogglePlayIsCalled();
  shouldRepopulateStudentWork();
});

function shouldSetTheParametersFromTheComponentContent() {
  it('should set the parameters from the component content', () => {
    expect(audioOscillatorController.frequency).toEqual(component.startingFrequency);
    expect(audioOscillatorController.oscilloscopeWidth).toEqual(component.oscilloscopeWidth);
    expect(audioOscillatorController.oscilloscopeHeight).toEqual(component.oscilloscopeHeight);
    expect(audioOscillatorController.gridCellSize).toEqual(component.gridCellSize);
    expect(audioOscillatorController.oscillatorTypes.length).toEqual(3);
  });
}

function shouldAddAFrequencyPlayedToTheStudentData() {
  it('should add a frequency played to the student data', () => {
    audioOscillatorController.addFrequencyPlayed(440);
    expect(audioOscillatorController.frequenciesPlayed.length).toEqual(1);
    expect(audioOscillatorController.frequenciesPlayed[0]).toEqual(440);
  });
}

function shouldCallPlayWhenTheTogglePlayIsCalled() {
  it('should call play when the toggle play is called', () => {
    const playSpy = spyOn(audioOscillatorController, 'play');
    audioOscillatorController.togglePlay();
    expect(playSpy).toHaveBeenCalled();
  });
}

function shouldRepopulateStudentWork() {
  it('should repopulate student work', () => {
    const componentState = {
      studentData: {
        frequenciesPlayed: [440, 880]
      }
    };
    audioOscillatorController.setStudentWork(componentState);
    expect(audioOscillatorController.frequenciesPlayed.length).toEqual(2);
    expect(audioOscillatorController.frequenciesPlayed[0]).toEqual(440);
    expect(audioOscillatorController.frequenciesPlayed[1]).toEqual(880);
  });
}
