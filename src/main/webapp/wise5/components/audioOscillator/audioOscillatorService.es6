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
    component.stopAfterGoodDraw = false;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    let result = false;

    if (componentStates && componentStates.length) {
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      if (submitRequired) {
        // completion requires a submission, so check for isSubmit in any component states
        for (let i = 0, l = componentStates.length; i < l; i++) {
          let state = componentStates[i];
          if (state.isSubmit && state.studentData) {
            // component state is a submission
            if (state.studentData.frequenciesPlayed != null && studentData.frequenciesPlayed.length > 0) {
              // the student has played at least one frequency so the component is completed
              result = true;
              break;
            }
          }
        }
      } else {
        // get the last component state
        let l = componentStates.length - 1;
        let componentState = componentStates[l];

        let studentData = componentState.studentData;

        if (studentData != null) {
          if (studentData.frequenciesPlayed != null && studentData.frequenciesPlayed.length > 0) {
            // the student has played at least one frequency so the component is completed
            result = true;
          }
        }
      }
    }

    return result;
  };

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
