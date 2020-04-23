import ComponentService from '../componentService';

class HTMLService extends ComponentService {
  static $inject = ['$filter', 'StudentDataService', 'UtilService'];

  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('html.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'HTML';
    component.html = this.$translate('html.enterHTMLHere');
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    let result = false;

    if (nodeEvents != null) {
      // loop through all the events
      for (let e = 0; e < nodeEvents.length; e++) {
        // get an event
        const event = nodeEvents[e];

        if (event != null && event.event === 'nodeEntered') {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  componentHasWork(component) {
    return false;
  }

  componentUsesSaveButton() {
    return false;
  }

  componentUsesSubmitButton() {
    return false;
  }
}

export default HTMLService;
