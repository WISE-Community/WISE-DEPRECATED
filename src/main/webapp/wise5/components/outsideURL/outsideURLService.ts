  import { ComponentService } from '../componentService';

class OutsideURLService extends ComponentService {
  $http: any;
  $translate: any;

  static $inject = ['$filter', '$http', 'StudentDataService', 'UtilService'];

  constructor($filter, $http, StudentDataService, UtilService) {
    super(StudentDataService, UtilService);
    this.$http = $http;
    this.$translate = $filter('translate');
  }

  getComponentTypeLabel() {
    return this.$translate('outsideURL.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
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
    return this.$http.get(`wise5/components/outsideURL/resources.json`).then(result => {
      return result.data;
    });
  }
}

export default OutsideURLService;
