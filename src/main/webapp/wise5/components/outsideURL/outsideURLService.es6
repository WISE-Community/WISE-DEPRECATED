import NodeService from '../../services/nodeService';

class OutsideURLService extends NodeService {
    constructor(UtilService) {
        super();
        this.UtilService = UtilService;
    }

    /**
     * Create an OutsideURL component object
     * @returns a new OutsideURL component object
     */
    createComponent() {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'OutsideURL';
        component.url = '';
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


OutsideURLService.$inject = [
    'UtilService'
];

export default OutsideURLService;