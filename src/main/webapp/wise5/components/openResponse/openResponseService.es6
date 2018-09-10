import ComponentService from '../componentService';

class OpenResponseService extends ComponentService {
  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('openResponse.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'OpenResponse';
    component.starterSentence = null;
    component.isStudentAttachmentEnabled = false;
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

  displayAnnotation(componentContent, annotation) {
    if (annotation.displayToStudent === false) {
      return false;
    } else {
      if (annotation.type == 'score') {

      } else if (annotation.type == 'comment') {

      } else if (annotation.type == 'autoScore') {
        if (componentContent.cRater != null && !componentContent.cRater.showScore) {
          return false;
        } else if (componentContent.showAutoScore === false) {
          return false;
        }
      } else if (annotation.type == 'autoComment') {
        if (componentContent.cRater != null && !componentContent.cRater.showFeedback) {
          return false;
        } else if (componentContent.showAutoFeedback === false) {
          return false;
        }
      }
    }
    return true;
  }

  getStudentDataString(componentState) {
    return componentState.studentData.response;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (this.hasStarterSentence(componentContent)) {
      let response = componentState.studentData.response;
      let starterSentence = componentContent.starterSentence;
      return this.hasResponse(componentState) && response !== starterSentence;
    } else {
      return this.hasResponse(componentState);
    }
  }

  hasStarterSentence(componentContent) {
    const starterSentence = componentContent.starterSentence;
    return starterSentence != null && starterSentence !== '';
  }

  hasResponse(componentState) {
    const response = componentState.studentData.response;
    return response != null && response !== '';
  }
}

OpenResponseService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default OpenResponseService;
