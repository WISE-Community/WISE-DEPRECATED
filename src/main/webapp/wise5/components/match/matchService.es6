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
    component.feedback = [{ 'bucketId': '0', 'choices': [] }];
    component.ordered = false;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    if (componentStates && componentStates.length > 0) {
      for (let componentState of componentStates) {
        const buckets = componentState.studentData.buckets;
        if (buckets && buckets.length > 0) {
          if (this.isSubmitRequired(node, component)) {
            if (componentState.isSubmit) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }

  isSubmitRequired(node, component) {
    return node.showSubmitButton ||
        (component.showSubmitButton && !node.showSaveButton);
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      const buckets = componentState.studentData.buckets;
      for (let bucket of buckets) {
        const items = bucket.items;
        if (items != null && items.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  hasCorrectAnswer(component) {
    for (let bucket of component.feedback) {
      for (let choice of bucket.choices) {
        if (choice.isCorrect) {
          return true;
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
