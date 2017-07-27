import NodeService from '../../services/nodeService';

class TableService extends NodeService {

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
     * "Table"
     */
    getComponentTypeLabel() {
        return this.$translate('table.componentTypeLabel');
    }

    /**
     * Create an Table component object
     * @returns a new Table component object
     */
    createComponent() {
        var component = {};
        component.id = this.UtilService.generateKey();
        component.type = 'Table';
        component.prompt = '';
        component.showSaveButton = false;
        component.showSubmitButton = false;
        component.globalCellSize = 10;
        component.numRows = 3;
        component.numColumns = 3;
        component.tableData = [
            [
                {
                    "text": "",
                    "editable": true,
                    "size": null
                },
                {
                    "text": "",
                    "editable": true,
                    "size": null
                },
                {
                    "text": "",
                    "editable": true,
                    "size": null
                }
            ],
            [
                {
                    "text": "",
                    "editable": true,
                    "size": null
                },
                {
                    "text": "",
                    "editable": true,
                    "size": null
                },
                {
                    "text": "",
                    "editable": true,
                    "size": null
                }
            ],
            [
                {
                    "text": "",
                    "editable": true,
                    "size": null
                },
                {
                    "text": "",
                    "editable": true,
                    "size": null
                },
                {
                    "text": "",
                    "editable": true,
                    "size": null
                }
            ]
        ];

        return component;
    }

    /**
     * Copies an existing Table component object
     * @returns a copied Table component object
     */
    copyComponent(componentToCopy) {
        var component = this.createComponent();
        component.prompt = componentToCopy.prompt;
        component.showSaveButton = componentToCopy.showSaveButton;
        component.showSubmitButton = componentToCopy.showSubmitButton;
        component.globalCellSize = componentToCopy.globalCellSize;
        component.numRows = componentToCopy.numRows;
        component.numColumns = componentToCopy.numColumns;
        component.tableData = componentToCopy.tableData;
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

            if (otherComponentType === 'Table') {
                // the other component is an Table component

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

            // loop through all the component states
            for (let c = 0, l = componentStates.length; c < l; c++) {

                // the component state
                let componentState = componentStates[c];

                // get the student data from the component state
                let studentData = componentState.studentData;

                if (studentData != null) {
                    let tableData = studentData.tableData;

                    if (tableData != null) {
                        // there is a table data so the component has saved work
                        // TODO: check for actual student data from the table (compare to starting state)
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

TableService.$inject = [
    '$filter',
    'StudentDataService',
    'UtilService'
];

export default TableService;
