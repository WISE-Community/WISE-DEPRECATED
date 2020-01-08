import ComponentService from '../componentService';

class OutsideURLService extends ComponentService {
  constructor($filter, $http, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$http = $http;
  }

  getComponentTypeLabel() {
    return this.$translate('outsideURL.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'OutsideURL';
    component.url = '';
    component.height = 600;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    if (nodeEvents != null) {
      for (const event of nodeEvents) {
        if (event.event === 'nodeEntered') {
          return true;
        }
      }
    }
    return false;
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

  getOpenEducationalResources() {
    return this.$http.get(`wise5/components/outsideURL/resources.json`).then((result) => {
      return result.data;
    });
  }
}

OutsideURLService.$inject = [
  '$filter',
  '$http',
  'StudentDataService',
  'UtilService'
];

export default OutsideURLService;
