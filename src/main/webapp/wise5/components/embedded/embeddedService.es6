import NodeService from '../../services/nodeService';

class EmbeddedService extends NodeService {
  constructor($filter, UtilService) {
    super();
    this.$filter = $filter;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
  }

  /**
   * Get the component type label
   * example
   * "Embedded"
   */
  getComponentTypeLabel() {
    return this.$translate('embedded.componentTypeLabel');
  }

  /**
   * Create an Embedded component object
   * @returns a new Embedded component object
   */
  createComponent() {
    var component = {};
    component.id = this.UtilService.generateKey();
    component.type = 'Embedded';
    component.url = '';
    component.showSaveButton = false;
    component.showSubmitButton = false;
    return component;
  }

  /**
   * Copies an existing Embedded component object
   * @returns a copied Embedded component object
   */
  copyComponent(componentToCopy) {
    var component = this.createComponent();
    component.url = componentToCopy.url;
    component.showSaveButton = componentToCopy.showSaveButton;
    component.showSubmitButton = componentToCopy.showSubmitButton;
    return component;
  }

  /**
   * Check if the component was completed
   * @param component the component object
   * @param componentStates the component states for the specific component
   * @param componentEvents the events for the specific component
   * @param nodeEvents the events for the parent node of the component
   * @returns whether the component was completed
   */
  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    var result = false;
    var isCompletedFieldInComponentState = false;
    if (componentStates != null) {
      for (var c = 0; c < componentStates.length; c++) {
        var componentState = componentStates[c];
        if (componentState != null) {
          var studentData = componentState.studentData;
          if (studentData != null) {
            if (studentData.isCompleted != null) {
              /*
               * the model has set the isCompleted field in the
               * student data
               */
              isCompletedFieldInComponentState = true;

              if (studentData.isCompleted === true) {
                /*
                 * the model has set the isCompleted field to true
                 * which means the student has completed the component
                 */
                return true;
              }
            }
          }
        }
      }
    }

    if (isCompletedFieldInComponentState == false) {
      /*
       * the isCompleted field was not set into the component state so
       * we will look for events to determine isCompleted
       */

      if (nodeEvents != null) {
        for (var e = 0; e < nodeEvents.length; e++) {
          var event = nodeEvents[e];
          if (event != null && event.event === 'nodeEntered') {
            result = true;
            break;
          }
        }
      }
    }
    return result;
  };

  /**
   * Whether this component generates student work
   * @param component (optional) the component object. if the component object
   * is not provided, we will use the default value of whether the
   * component type usually has work.
   * @return whether this component generates student work
   */
  componentHasWork(component) {
    return false;
  }

  /**
   * Whether this component uses a save button
   * @return whether this component uses a save button
   */
  componentUsesSaveButton() {
    return true;
  }

  /**
   * Whether this component uses a submit button
   * @return whether this component uses a submit button
   */
  componentUsesSubmitButton() {
    return true;
  }

  /**
   * Check if the component state has student work. Sometimes a component
   * state may be created if the student visits a component but doesn't
   * actually perform any work. This is where we will check if the student
   * actually performed any work.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return whether the component state has any work
   */
  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        return true;
      }
    }
    return false;
  }
}

EmbeddedService.$inject = [
  '$filter',
  'UtilService'
];

export default EmbeddedService;
