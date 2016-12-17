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
        let component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'MultipleChoice';
        component.prompt = this.$translate('enterPromptHere');
        component.showSaveButton = false;
        component.showSubmitButton = false;
        component.choiceType = 'radio';
        component.choices = [];
        component.showFeedback = true;
        return component;
    }

    /**
     * Copies an existing MultipleChoice component object
     * @returns a copied MultipleChoice component object
     */
    copyComponent(componentToCopy) {
        var component = this.createComponent();
        component.prompt = componentToCopy.prompt;
        component.showSaveButton = componentToCopy.showSaveButton;
        component.showSubmitButton = componentToCopy.showSubmitButton;
        component.choiceType = componentToCopy.choiceType;
        component.choices = [];
        // go through the original choices and create new id's
        if (componentToCopy.choices != null && componentToCopy.choices.length > 0) {
            for (var c = 0; c < componentToCopy.choices.length; c++) {
                var choice = componentToCopy.choices[c];
                choice.id = this.UtilService.generateKey();  // generate a new id for this choice.
                component.choices.push(choice);
            }
        }
        return component;
    }

    /**
     * Returns all possible criteria for this component.
     * @param component a MultipleChoice component
     */
    getPossibleTransitionCriteria(nodeId, componentId, component) {
        let allPossibleTransitionCriteria = [];
        if (component.choiceType === "radio") {
            // Go through all the choices
            for (var c = 0; c < component.choices.length; c++) {
                let choice = component.choices[c];
                let possibleTransitionCriteria = {
                    "name": "choiceChosen",
                    "id": "choiceChosen_" + choice.id,
                    "params": {
                        "nodeId": nodeId,
                        "componentId": componentId,
                        "choiceIds": [choice.id]
                    },
                    "userFriendlyDescription": this.$translate('userChose', {choiceText: choice.text, choiceId: choice.id})
                };
                allPossibleTransitionCriteria.push(possibleTransitionCriteria);
            }
        } else if (component.choiceType === "checkbox") {
            // TODO: implement meeee!
        }
        return allPossibleTransitionCriteria;
    }

    /**
     * Check if the student chose a specific choice
     * @param criteria the criteria object
     * @returns a boolean value whether the student chose the choice specified in the
     * criteria object
     */
    choiceChosen(criteria) {

        let result = false;

        if (criteria != null && criteria.params != null) {
            let nodeId = criteria.params.nodeId;
            let componentId = criteria.params.componentId;
            let choiceIds = criteria.params.choiceIds; // the choice ids that we expect the student to have chosen

            if (nodeId != null && componentId != null) {

                // get the component states
                let componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

                if (componentStates != null && componentStates.length > 0) {

                    if (choiceIds != null) {
                        // get the latest component state
                        let componentState = componentStates[componentStates.length - 1];

                        // get the student data
                        let studentData = componentState.studentData;

                        if (studentData != null) {

                            // get the choice(s) the student chose
                            let studentChoices = studentData.studentChoices;

                            if (studentChoices != null) {

                                if (studentChoices.length === choiceIds.length) {
                                    /*
                                     * the number of choices the student chose do match so the student may
                                     * have matched the choices. we will now need to compare each of the
                                     * choice ids to make sure the student chose the ones that are required
                                     */

                                    let studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);

                                    for (let c = 0; c < choiceIds.length; c++) {
                                        let choiceId = choiceIds[c];

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
        let choiceIds = [];

        if (studentChoices != null) {

            // loop through all the student choice objects
            for (let c = 0; c < studentChoices.length; c++) {

                // get a student choice object
                let studentChoice = studentChoices[c];

                if (studentChoice != null) {

                    // get the student choice id
                    let studentChoiceId = studentChoice.id;

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
        let componentState = null;

        if (componentStateFromOtherComponent != null) {

            // create an empty component state
            componentState = this.StudentDataService.createComponentState();

            // get the component type of the other component state
            let otherComponentType = componentStateFromOtherComponent.componentType;

            if (otherComponentType === 'MultipleChoice') {
                // the other component is an MultipleChoice component

                // get the student data from the other component state
                let studentData = componentStateFromOtherComponent.studentData;

                // create a copy of the student data
                let studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

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

            // loop through all the component states
            for (let c = 0, l = componentStates.length; c < l; c++) {

                // the component state
                let componentState = componentStates[c];

                // get the student data from the component state
                let studentData = componentState.studentData;

                if (studentData != null) {
                    let studentChoices = studentData.studentChoices;

                    if (studentChoices != null) {
                        // there is a student choice so the component has saved work
                        if (submitRequired) {
                            // completion requires a submission, so check for isSubmit
                            if (componentState.isSubmit) {
                                result = true;
                                break;
                            }
                        } else {
                            result = true;
                            break;
                        }
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
}

MultipleChoiceService.$inject = [
    'StudentDataService',
    'UtilService'
];

export default MultipleChoiceService;
