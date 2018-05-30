import ComponentService from '../componentService';

class AnimationService extends ComponentService {
  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('animation.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Animation';
    component.widthInPixels = 600;
    component.widthInUnits = 60;
    component.heightInPixels = 200;
    component.heightInUnits = 20;
    component.dataXOriginInPixels = 0;
    component.dataYOriginInPixels = 80;
    component.coordinateSystem = 'screen';
    component.objects = [];
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
            if (state.studentData.response) {
              // there is a response so the component is completed
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
          if (studentData.response) {
            // there is a response so the component is completed
            result = true;
          }
        }
      }
    }

    if (component.completionCriteria != null) {
      /*
       * there is a special completion criteria authored in this component
       * so we will evaluate the completion criteria to see if the student
       * has completed this component
       */
      result = this.StudentDataService.isCompletionCriteriaSatisfied(component.completionCriteria);
    }

    return result;
  };

  getStudentDataString(componentState) {

    var studentDataString = '';

    if (componentState != null) {
      var studentData = componentState.studentData;

      if (studentData != null) {
        // get the response the student typed
        studentDataString = studentData.response;
      }
    }

    return studentDataString;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        return true;
      }
    }
    return false;
  }
}

AnimationService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default AnimationService;
