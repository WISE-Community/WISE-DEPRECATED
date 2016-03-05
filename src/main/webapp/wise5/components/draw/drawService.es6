import NodeService from '../../services/nodeService';

class DrawService extends NodeService {
    constructor(StudentDataService,
                UtilService) {
        super();
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
    }

    /**
     * Create a Draw component object
     * @returns a new Draw component object
     */
    createComponent() {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'Draw';
        component.prompt = 'Enter prompt here';
        component.showSaveButton = false;
        component.showSubmitButton = false;
        component.stamps = {};
        component.stamps.Stamps = [];

        return component;
    }

    getStudentWorkJPEG(componentState) {
        if (componentState != null) {
            var studentData = componentState.studentData;

            if (studentData != null && studentData.drawData != null) {
                var drawData = JSON.parse(studentData.drawData);
                if (drawData != null && drawData.jpeg != null && drawData.jpeg != "") {
                    return drawData.jpeg;
                }
            }
        }
        return null;
    };

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
            componentState = StudentDataService.createComponentState();

            // get the component type of the other component state
            var otherComponentType = componentStateFromOtherComponent.componentType;

            if (otherComponentType === 'Draw') {
                // the other component is an Draw component

                // get the student data from the other component state
                var studentData = componentStateFromOtherComponent.studentData;

                // create a copy of the student data
                var studentDataCopy = StudentDataService.makeCopyOfJSONObject(studentData);

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
        let result = false;

        if (componentStates && componentStates.length) {
            let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

            if (submitRequired) {
                // completion requires a submission, so check for isSubmit in any component states
                for (let i = 0, l = componentStates.length; i < l; i++) {
                    let state = componentStates[i];
                    if (state.isSubmit && state.studentData) {
                        // component state is a submission
                        if (state.studentData.drawData) {
                            // there is draw data so the component is completed
                            // TODO: check for empty drawing or drawing same as initial state
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

                if (studentData) {
                    if (studentData.drawData) {
                        // there is draw data so the component is completed
                        // TODO: check for empty drawing or drawing same as initial state
                        result = true;
                    }
                }
            }
        }

        return result;
    };
}

DrawService.$inject = [
    'StudentDataService',
    'UtilService'
];

export default DrawService;
