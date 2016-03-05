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
     * @returns whether the component was completed
     */
    isCompleted(component, componentStates, componentEvents, nodeEvents) {
        var result = false;

        if (componentStates != null) {

            // loop through all the component states
            for (var c = 0; c < componentStates.length; c++) {

                // the component state
                var componentState = componentStates[c];

                // get the student data from the component state
                var studentData = componentState.studentData;

                if (studentData != null) {
                    var drawData = studentData.drawData;

                    if (drawData != null) {
                        // there is draw data so the component is completed
                        result = true;
                        break;
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
