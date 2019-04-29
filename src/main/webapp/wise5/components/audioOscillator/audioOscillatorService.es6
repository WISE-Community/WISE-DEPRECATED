import ComponentService from '../componentService';

class AudioOscillatorService extends ComponentService {
  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('audioOscillator.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'AudioOscillator';
    component.oscillatorTypes = [
      'sine'
    ];
    component.startingFrequency = 440;
    component.oscilloscopeWidth = 800;
    component.oscilloscopeHeight = 400;
    component.gridCellSize = 50;
    component.stopAfterGoodDraw = true;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    if (componentStates && componentStates.length) {
      let componentState = componentStates[componentStates.length - 1];
      return this.componentStateHasStudentWork(componentState);
    }
    return false;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        if (studentData.frequenciesPlayed != null &&
          studentData.frequenciesPlayed.length > 0) {
          return true;
        }
      }
    }
    return false;
  }
}

AudioOscillatorService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default AudioOscillatorService;
