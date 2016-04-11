import NodeService from '../../services/nodeService';

class AudioPlayerService extends NodeService {
    constructor(StudentDataService,
                UtilService) {
        super();
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
    }

    /**
     * Create a AudioPlayer component object
     * @returns a new AudioPlayer component object
     */
    createComponent() {

        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'AudioPlayer';
        component.prompt = 'Enter prompt here';
        component.oscillatorTypes = [
            'sine'
        ];
        component.startingFrequency = 440;
        component.oscilloscopeWidth = 800;
        component.oscilloscopeHeight = 400;
        component.gridCellSize = 50;
        component.stopAfterGoodDraw = true;
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

            if (otherComponentType === 'AudioPlayer') {
                // the other component is an OpenResponse component

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
        let result = false;

        if (componentStates && componentStates.length) {
            let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

            if (submitRequired) {
                // completion requires a submission, so check for isSubmit in any component states
                for (let i = 0, l = componentStates.length; i < l; i++) {
                    let state = componentStates[i];
                    if (state.isSubmit && state.studentData) {
                        // component state is a submission
                        if (state.studentData.response) {
                            // there is a response so the component is completed
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
                    if (studentData.response) {
                        // there is a response so the component is completed
                        result = true;
                    }
                }
            }
        }

        return result;
    };

}

AudioPlayerService.$inject = [
    'StudentDataService',
    'UtilService'
];

export default AudioPlayerService;
