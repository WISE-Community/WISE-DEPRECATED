import NodeService from '../../services/nodeService';

class OpenResponseService extends NodeService {
    constructor(StudentDataService,
                UtilService) {
        super();
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
    }

    /**
     * Create a OpenResponse component object
     * @returns a new OpenResponse component object
     */
    createComponent() {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'OpenResponse';
        component.prompt = 'Enter prompt here';
        component.showSaveButton = false;
        component.showSubmitButton = false;
        component.starterSentence = null;
        component.isStudentAttachmentEnabled = false;

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

            if (otherComponentType === 'OpenResponse') {
                // the other component is an OpenResponse component

                // get the student data from the other component state
                var studentData = componentStateFromOtherComponent.studentData;

                // create a copy of the student data
                var studentDataCopy = this.StudentDataService.makeCopyOfJSONObject(studentData);

                // set the student data into the new component state
                componentState.studentData = studentDataCopy;
            } else if (otherComponentType === 'Planning') {
                componentState.studentData = JSON.stringify(componentStateFromOtherComponent.studentNodes);
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
     * @returns whether the component was completed
     */
    isCompleted(component, componentStates, componentEvents, nodeEvents) {
        var result = false;

        if (componentStates != null && componentStates.length) {

            // get the last component state
            var l = componentStates.length - 1;
            var componentState = componentStates[l];

            var studentData = componentState.studentData;

            if (studentData != null) {
                var response = studentData.response;

                if (response) {
                    // there is a response so the component is completed
                    result = true;
                }
            }
        }

        return result;
    };

}

OpenResponseService.$inject = [
    'StudentDataService',
    'UtilService'
];

export default OpenResponseService;