import NodeService from '../../services/nodeService';

class EmbeddedService extends NodeService {
    constructor(UtilService) {
        super();
        this.UtilService = UtilService;
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

    /**
     * Whether this component generates student work
     * @param component (optional) the component object. if the component object
     * is not provided, we will use the default value of whether the
     * component type usually has work.
     * @return whether this component generates student work
     */
    componentHasWork(component) {
        return true;
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
