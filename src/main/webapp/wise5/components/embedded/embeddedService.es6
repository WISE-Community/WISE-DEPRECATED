import NodeService from '../../services/nodeService';

class EmbeddedService extends NodeService {
    constructor(UtilService) {
        super();
        this.UtilService = UtilService;
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

            /*
             * loop through all the component states and look for a component
             * that has the isCompleted field set to true
             */
            for (var c = 0; c < componentStates.length; c++) {

                // get a component state
                var componentState = componentStates[c];

                if (componentState != null) {
                    // get the student data from the model
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
}

EmbeddedService.$inject = [
    'UtilService'
];

export default EmbeddedService;
