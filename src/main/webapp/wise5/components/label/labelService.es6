import NodeService from '../../services/nodeService';

class LabelService extends NodeService {

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
     * Get the component type label
     * example
     * "Label"
     */
    getComponentTypeLabel() {
        return this.$translate('label.componentTypeLabel');
    }

    /**
     * Create a Label component object
     * @returns a new Label component object
     */
    createComponent() {
        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'Label';
        component.prompt = '';
        component.showSaveButton = false;
        component.showSubmitButton = false;
        component.backgroundImage = '';
        component.canCreateLabels = true;
        component.canDeleteLabels = true;
        component.width = 800;
        component.height = 600;
        component.labels = [];
        return component;
    }

    /**
     * Copies an existing Label component object
     * @returns a copied Label component object
     */
    copyComponent(componentToCopy) {
        var component = this.createComponent();
        component.prompt = componentToCopy.prompt;
        component.showSaveButton = componentToCopy.showSaveButton;
        component.showSubmitButton = componentToCopy.showSubmitButton;
        component.backgroundImage = componentToCopy.backgroundImage;
        component.canCreateLabels = componentToCopy.canCreateLabels;
        component.canDeleteLabels = componentToCopy.canDeleteLabels;
        component.width = componentToCopy.width;
        component.height = componentToCopy.height;
        component.labels = [];
        // go through the original labels and create new id's
        if (componentToCopy.labels != null && componentToCopy.labels.length > 0) {
            for (var l = 0; l < componentToCopy.labels.length; l++) {
                var label = componentToCopy.labels[l];
                label.id = this.UtilService.generateKey();  // generate a new id for this label.
                component.labels.push(label);
            }
        }
        return component;
    }

    /**
     * Populate a component state with the data from another component state
     * @param componentStateFromOtherComponent the component state to obtain the data from
     * @return a new component state that contains the student data from the other
     * component state
     */
    populateComponentState(componentStateFromOtherComponent) {
        var componentState = null;

        if (componentStateFromOtherComponent != null) {

            // create an empty component state
            componentState = this.StudentDataService.createComponentState();

            // get the component type of the other component state
            var otherComponentType = componentStateFromOtherComponent.componentType;

            if (otherComponentType === 'Label') {
                // the other component is an Label component

                // get the student data from the other component state
                var studentData = componentStateFromOtherComponent.studentData;

                // create a copy of the student data
                var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

                // set the student data into the new component state
                componentState.studentData = studentDataCopy;
            }
        }

        return componentState;
    };

    /**
     * Check if the component was completed
     * @param component the component object
     * @param componentStates the component states for the specific component
     * @param componentEvents the events for the specific component
     * @param nodeEvents the events for the parent node of the component
     * @param node parent node of the component
     * @returns whether the component was completed
     */
    isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
        var result = false;

        if (componentStates && componentStates.length) {
            let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

            if (submitRequired) {
                // completion requires a submission, so check for isSubmit in any component states
                for (let i = 0, l = componentStates.length; i < l; i++) {
                    let state = componentStates[i];
                    if (state.isSubmit && state.studentData) {
                        // component state is a submission
                        if (state.studentData.labels && state.studentData.labels.length) {
                            // there are labels so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            } else {
                // get the last component state
                let l = componentStates.length - 1;
                let componentState = componentStates[l];

                let studentData = componentState.studentData;

                if (studentData != null) {
                    if (studentData.labels && studentData.labels.length) {
                        // there are labels so the component is completed
                        result = true;
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

LabelService.$inject = [
    '$filter',
    'StudentDataService',
    'UtilService'
];

export default LabelService;
