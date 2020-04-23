import ComponentService from '../componentService';

class MultipleChoiceService extends ComponentService {
  static $inject = ['$filter', 'StudentDataService', 'UtilService'];

  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('multipleChoice.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'MultipleChoice';
    component.choiceType = 'radio';
    component.choices = [];
    component.showFeedback = true;
    return component;
  }

  /**
   * Check if the student chose a specific choice
   * @param criteria the criteria object
   * @returns a boolean value whether the student chose the choice specified in the
   * criteria object
   */
  choiceChosen(criteria) {
    const nodeId = criteria.params.nodeId;
    const componentId = criteria.params.componentId;
    const constraintChoiceIds = criteria.params.choiceIds;
    const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    if (latestComponentState != null) {
      const studentChoices = latestComponentState.studentData.studentChoices;
      const studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);
      return this.isChoicesSelected(studentChoiceIds, constraintChoiceIds);
    }
    return false;
  }

  isChoicesSelected(studentChoiceIds, constraintChoiceIds) {
    if (typeof constraintChoiceIds === 'string') {
      return studentChoiceIds.length === 1 && studentChoiceIds[0] === constraintChoiceIds;
    } else if (Array.isArray(constraintChoiceIds)) {
      if (studentChoiceIds.length === constraintChoiceIds.length) {
        for (let constraintChoiceId of constraintChoiceIds) {
          if (studentChoiceIds.indexOf(constraintChoiceId) === -1) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Get the student choice ids from the student choice objects
   * @param studentChoices an array of student choice objects. these objects contain
   * an id and text fields
   * @returns an array of choice id strings
   */
  getStudentChoiceIdsFromStudentChoiceObjects(studentChoices) {
    let choiceIds = [];

    if (studentChoices != null) {
      // loop through all the student choice objects
      for (let c = 0; c < studentChoices.length; c++) {
        // get a student choice object
        let studentChoice = studentChoices[c];

        if (studentChoice != null) {
          // get the student choice id
          let studentChoiceId = studentChoice.id;

          choiceIds.push(studentChoiceId);
        }
      }
    }

    return choiceIds;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    let result = false;

    if (componentStates && componentStates.length) {
      let submitRequired =
        node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      // loop through all the component states
      for (let c = 0, l = componentStates.length; c < l; c++) {
        // the component state
        let componentState = componentStates[c];

        // get the student data from the component state
        let studentData = componentState.studentData;

        if (studentData != null) {
          let studentChoices = studentData.studentChoices;

          if (studentChoices != null) {
            // there is a student choice so the component has saved work
            if (submitRequired) {
              // completion requires a submission, so check for isSubmit
              if (componentState.isSubmit) {
                result = true;
                break;
              }
            } else {
              result = true;
              break;
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get the human readable student data string
   * @param componentState the component state
   * @return a human readable student data string
   */
  getStudentDataString(componentState) {
    let studentDataString = '';

    if (componentState != null) {
      const studentData = componentState.studentData;

      if (studentData != null) {
        // get the choices the student chose
        const studentChoices = studentData.studentChoices;

        if (studentChoices != null) {
          // loop through all the choices the student chose
          for (let c = 0; c < studentChoices.length; c++) {
            const studentChoice = studentChoices[c];

            if (studentChoice != null) {
              // get the choice text
              const text = studentChoice.text;

              if (text != null) {
                if (studentDataString != '') {
                  // separate the choices with a comma
                  studentDataString += ', ';
                }

                // append the choice text
                studentDataString += text;
              }
            }
          }
        }
      }
    }
    return studentDataString;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        let studentChoices = studentData.studentChoices;
        if (studentChoices != null && studentChoices.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  componentHasCorrectAnswer(component) {
    for (const choice of component.choices) {
      if (choice.isCorrect) {
        return true;
      }
    }
    return false;
  }
}

export default MultipleChoiceService;
