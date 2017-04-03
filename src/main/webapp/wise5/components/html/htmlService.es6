import NodeService from '../../services/nodeService';

class HTMLService extends NodeService {
    constructor($filter,
                StudentDataService,
                UtilService) {
        super();
        this.$filter = $filter;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');
    }

    /**
     * Create an HTML component object
     * @returns a new HTML component object
     */
    createComponent() {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'HTML';
        component.html = this.$translate('html.enterHTMLHere');

        return component;
    }

    /**
     * Copies an existing HTML component object
     * @returns a copied HTML component object
     */
    copyComponent(componentToCopy) {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'HTML';
        component.html = componentToCopy.html;

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
    }

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
        return false;
    }

    /**
     * Whether this component uses a submit button
     * @return whether this component uses a submit button
     */
    componentUsesSubmitButton() {
        return false;
    }
}

HTMLService.$inject = [
    '$filter',
    'StudentDataService',
    'UtilService'
];

export default HTMLService;
