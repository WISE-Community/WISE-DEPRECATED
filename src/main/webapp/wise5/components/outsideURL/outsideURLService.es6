import ComponentService from '../componentService';

class OutsideURLService extends ComponentService {
  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('outsideURL.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'OutsideURL';
    component.url = '';
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    var result = false;
    if (nodeEvents != null) {
      // loop through all the events
      for (var e = 0; e < nodeEvents.length; e++) {
        // get an event
        var event = nodeEvents[e];
        if (event != null && event.event === 'nodeEntered') {
          result = true;
          break;
        }
      }
    }
    return result;
  };

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

OutsideURLService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default OutsideURLService;
