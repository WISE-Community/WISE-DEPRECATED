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
        component.showSaveButton = false;
        component.showSubmitButton = false;

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
}

EmbeddedService.$inject = [
    'UtilService'
];

export default EmbeddedService;