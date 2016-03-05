import NodeService from '../../services/nodeService';

class MultipleChoiceService extends NodeService {
    constructor(StudentDataService,
                UtilService) {
        super();
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
    }

    /**
     * Create a MultipleChoice component object
     * @returns a new MultipleChoice component object
     */
    createComponent() {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'MultipleChoice';
        component.prompt = 'Enter prompt here';
        component.showSaveButton = false;
        component.showSubmitButton = true;
        component.choiceType = 'radio';
        component.choices = [];

        return component;
    }

    /**
     * Check if the student chose a specific choice
     * @param criteria the criteria object
     * @returns a boolean value whether the student chose the choice specified in the
     * criteria object
     */
    choiceChosen(criteria) {

        var result = false;

        if (criteria != null) {
            var nodeId = criteria.nodeId;
            var componentId = criteria.componentId;
            var functionName = criteria.functionName;
            var functionParams = criteria.functionParams;

            if (nodeId != null && componentId != null) {

                // get the component states
                var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

                if (componentStates != null && componentStates.length > 0) {

                    // get the choice ids that we expect the student to have chose
                    var choiceIds = functionParams.choiceIds;

                    if (choiceIds != null) {
                        // get the latest component state
                        var componentState = componentStates[componentStates.length - 1];

                        // get the student data
                        var studentData = componentState.studentData;

                        if (studentData != null) {

                            // get the choice(s) the student chose
                            var studentChoices = studentData.studentChoices;

                            if (studentChoices != null) {

                                if (studentChoices.length === choiceIds.length) {
                                    /*
                                     * the number of choices the student chose do match so the student may
                                     * have matched the choices. we will now need to compare each of the
                                     * choice ids to make sure the student chose the ones that are required
                                     */

                                    var studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);

                                    for (var c = 0; c < choiceIds.length; c++) {
                                        var choiceId = choiceIds[c];

                                        if (studentChoiceIds.indexOf(choiceId) === -1) {
                                            /*
                                             * the required choice id is not in the student choices so the student
                                             * did not match all the choices
                                             */
                                            result = false;
                                            break;
                                        } else {
                                            // the required choice id is in the student choices
                                            result = true;
                                        }
                                    }

                                } else {
                                    /*
                                     * the number of choices the student chose do not match so the student did
                                     * not match the choices
                                     */

                                    result = false;
                                }
                            }
                        }
                    }
                }
            }
        }

        return result;
    };

    /**
     * Get the student choice ids from the student choice objects
     * @param studentChoices an array of student choice objects. these objects contain
     * an id and text fields
     * @returns an array of choice id strings
     */
    getStudentChoiceIdsFromStudentChoiceObjects(studentChoices) {
        var choiceIds = [];

        if (studentChoices != null) {

            // loop through all the student choice objects
            for (var c = 0; c < studentChoices.length; c++) {

                // get a student choice object
                var studentChoice = studentChoices[c];

                if (studentChoice != null) {

                    // get the student choice id
                    var studentChoiceId = studentChoice.id;

                    choiceIds.push(studentChoiceId);
                }
            }
        }

        return choiceIds;
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
            componentState = this.StudentDataService.createComponentState();

            // get the component type of the other component state
            var otherComponentType = componentStateFromOtherComponent.componentType;

            if (otherComponentType === 'MultipleChoice') {
                // the other component is an MultipleChoice component

                // get the student data from the other component state
                var studentData = componentStateFromOtherComponent.studentData;

                // create a copy of the student data
                var studentDataCopy = this.StudentDataService.makeCopyOfJSONObject(studentData);

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
                    var studentChoices = studentData.studentChoices;

                    if (studentChoices != null) {
                        // there is a student choice so the component is completed
                        result = true;
                        break;
                    }
                }
            }
        }

        return result;
    };
}

MultipleChoiceService.$inject = [
    'StudentDataService',
    'UtilService'
];

export default MultipleChoiceService;