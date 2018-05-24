import ComponentService from '../componentService';

class MatchService extends ComponentService {
  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('match.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Match';
    component.choices = [];
    component.buckets = [];
    component.feedback = [
      {
        'bucketId': '0',
        'choices': []
      }
    ];
    component.ordered = false;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    var result = false;

    if (componentStates && componentStates.length) {
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      // loop through all the component states
      for (var c = 0; c < componentStates.length; c++) {

        // the component state
        var componentState = componentStates[c];

        // get the student data from the component state
        var studentData = componentState.studentData;

        if (studentData != null) {
          var buckets = studentData.buckets;

          if (buckets && buckets.length) {
            // there is a bucket, so the student has saved work
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

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        let buckets = studentData.buckets;
        if (buckets != null) {
          for (let b = 0; b < buckets.length; b++) {
            let bucket = buckets[b];
            if (bucket != null) {
              let items = bucket.items;
              if (items != null && items.length > 0) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if a the component has a correct answer.
   * @param component The component content object.
   * @return Whether the component has a correct answer.
   */
  hasCorrectAnswer(component) {
    if (component != null) {
      for (let bucket of component.feedback) {
        for (let choice of bucket.choices) {
          if (choice.isCorrect) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

MatchService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default MatchService;
