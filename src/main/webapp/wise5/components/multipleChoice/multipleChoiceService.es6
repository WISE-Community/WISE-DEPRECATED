import ComponentService from '../componentService';

class MultipleChoiceService extends ComponentService {
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
   * Returns all possible criteria for this component.
   * @param component a MultipleChoice component
   */
  getPossibleTransitionCriteria(nodeId, componentId, component) {
    let allPossibleTransitionCriteria = [];
    if (component.choiceType === 'radio') {
      // Go through all the choices
      for (var c = 0; c < component.choices.length; c++) {
        let choice = component.choices[c];
        let possibleTransitionCriteria = {
          'name': 'choiceChosen',
          'id': 'choiceChosen_' + choice.id,
          'params': {
            'nodeId': nodeId,
            'componentId': componentId,
            'choiceIds': [choice.id]
          },
          'userFriendlyDescription': this.$translate('multipleChoice.userChose', {choiceText: choice.text, choiceId: choice.id})
        };
        allPossibleTransitionCriteria.push(possibleTransitionCriteria);
      }
    } else if (component.choiceType === 'checkbox') {
      // TODO: implement meeee!
    }
    return allPossibleTransitionCriteria;
  }

  /**
   * Check if the student chose a specific choice
   * @param criteria the criteria object
   * @returns a boolean value whether the student chose the choice specified in the
   * criteria object
   */
  choiceChosen(criteria) {

    let result = false;

    if (criteria != null && criteria.params != null) {
      let nodeId = criteria.params.nodeId;
      let componentId = criteria.params.componentId;
      let choiceIds = criteria.params.choiceIds; // the choice ids that we expect the student to have chosen

      if (nodeId != null && componentId != null) {

        // get the component states
        let componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

        if (componentStates != null && componentStates.length > 0) {

          if (choiceIds != null) {
            // get the latest component state
            let componentState = componentStates[componentStates.length - 1];

            // get the student data
            let studentData = componentState.studentData;

            if (studentData != null) {

              // get the choice(s) the student chose
              let studentChoices = studentData.studentChoices;

              if (studentChoices != null) {

                if (studentChoices.length === choiceIds.length) {
                  /*
                   * the number of choices the student chose do match so the student may
                   * have matched the choices. we will now need to compare each of the
                   * choice ids to make sure the student chose the ones that are required
                   */

                  let studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);

                  for (let c = 0; c < choiceIds.length; c++) {
                    let choiceId = choiceIds[c];

                    if (studentChoiceIds.indexOf(choiceId) === -1) {
                      /*
                       * the required choice id is not in the student choices so the student
                       * did not match all the choices
                       */
                      result = false;
                      break;
                    } else {
                      // the required choice id is in the student choices
                      result = true;
                    }
                  }

                } else {
                  /*
                   * the number of choices the student chose do not match so the student did
                   * not match the choices
                   */

                  result = false;
                }
              }
            }
          }
        }
      }
    }

    return result;
  };

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
  };

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    let result = false;

    if (componentStates && componentStates.length) {
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

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
  };

  /**
   * Get the human readable student data string
   * @param componentState the component state
   * @return a human readable student data string
   */
  getStudentDataString(componentState) {

    var studentDataString = '';

    if (componentState != null) {
      var studentData = componentState.studentData;

      if (studentData != null) {

        // get the choices the student chose
        var studentChoices = studentData.studentChoices;

        if (studentChoices != null) {

          // loop through all the choices the student chose
          for (var c = 0; c < studentChoices.length; c++) {
            var studentChoice = studentChoices[c];

            if (studentChoice != null) {

              // get the choice text
              var text = studentChoice.text;

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
}

MultipleChoiceService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default MultipleChoiceService;
