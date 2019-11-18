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
    component.height = 600;
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
  
  getOpenEducationalResources() {
    return [
      {
        url: "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_en.html",
        info: "https://phet.colorado.edu/en/simulation/energy-forms-and-changes",
        thumbnail: "https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes-600.png",
        metadata: {
          title: "Energy Forms and Changes",
          subject: "Physics",
          source: "PhET"
        }
      },
      {
        url: "http://has.concord.org/air-pollution.html",
        info: "https://learn.concord.org/resources/855/air-pollution-model-cross-section",
        thumbnail: "https://learn-resources.concord.org/images/stem-resources/icons/air.png",
        metadata: {
          title: "Air Pollution Model (cross-section)",
          subject: "Earth Science",
          source: "Concord Consortium"
        }
      }
    ];
  }
}

OutsideURLService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default OutsideURLService;
