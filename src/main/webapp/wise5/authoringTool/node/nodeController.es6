'use strict';

class NodeController {

    constructor($anchorScroll,
                $location,
                $scope,
                $state,
                $stateParams,
                $timeout,
                $translate,
                ConfigService,
                ProjectService,
                UtilService) {

        this.$anchorScroll = $anchorScroll;
        this.$location = $location;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.projectId = $stateParams.projectId;
        this.nodeId = $stateParams.nodeId;
        this.showCreateComponent = false;
        this.showEditTransitions = false;
        this.selectedComponent = null;
        this.nodeCopy = null;
        this.undoStack = [];
        this.howToChooseAmongAvailablePathsOptions = [null, "random", "workgroupId", "firstAvailable", "lastAvailable"];
        this.whenToChoosePathOptions = [null, "enterNode", "exitNode", "studentDataChanged"];
        this.canChangePathOptions = [null, true, false];

        // the array of component types that can be created
        this.componentTypes = [
            {componentType: 'AudioOscillator', componentName: 'Audio Oscillator'},
            {componentType: 'ConceptMap', componentName: 'Concept Map'},
            {componentType: 'Discussion', componentName: 'Discussion'},
            {componentType: 'Draw', componentName: 'Draw'},
            {componentType: 'Embedded', componentName: 'Embedded'},
            {componentType: 'Graph', componentName: 'Graph'},
            {componentType: 'HTML', componentName: 'HTML'},
            {componentType: 'Label', componentName: 'Label'},
            {componentType: 'Match', componentName: 'Match'},
            {componentType: 'MultipleChoice', componentName: 'Multiple Choice'},
            {componentType: 'OpenResponse', componentName: 'Open Response'},
            {componentType: 'OutsideURL', componentName: 'Outside URL'},
            {componentType: 'Table', componentName: 'Table'}
        ];

        // set the drop down to the first item
        this.selectedComponent = this.componentTypes[0].componentType;

        // get the node
        this.node = this.ProjectService.getNodeById(this.nodeId);

        // get the step number e.g. 1.3
        this.nodePosition = this.ProjectService.getNodePositionById(this.nodeId);

        // get the components in the node
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

        /*
         * remember a copy of the node at the beginning of this node authoring
         * session in case we need to roll back if the user decides to
         * cancel/revert all the changes.
         */
        this.originalNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);

        /*
         * remember the current version of the node. this will be updated each
         * time the user makes a change.
         */
        this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    }

    /**
     * Launch VLE with this current step as the initial step
     */
    previewStep() {
        let previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
        let previewStepURL  = previewProjectURL + "#/vle/" + this.nodeId;
        window.open(previewStepURL);
    };
    
    /**
     * Launch VLE with this current step as the initial step without constraints
     */
    previewStepWithoutConstraints() {
        let previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
        let previewStepURL  = previewProjectURL + "?constraints=false" + "#/vle/" + this.nodeId;
        window.open(previewStepURL);
    };

    /**
     * Close the node authoring view
     */
    close() {
        // perform any node cleanup if necessary
        this.$scope.$broadcast('exitNode', {nodeToExit: this.node});
        
        this.$state.go('root.project', {projectId: this.projectId});
    };

    /**
     * The author has clicked the cancel button which will revert all
     * the recent changes since they opened the node.
     */
    cancel() {

        // check if the user has made any changes
        if (!angular.equals(this.node, this.originalNodeCopy)) {
            // the user has made changes

            this.$translate('confirmUndo').then((confirmUndo) => {
                var result = confirm(confirmUndo);

                if (result) {
                    // revert the node back to the previous version
                    this.ProjectService.replaceNode(this.nodeId, this.originalNodeCopy);

                    // save the project
                    this.ProjectService.saveProject();

                    // close the node authoring view
                    this.close();
                }
            });
        } else {
            // the user has not made any changes

            //close the node authoring view
            this.close();
        }
    }

    /**
     * Add a new transition for this node.
     */
    addNewTransition() {
        if (this.node.transitionLogic.transitions == null) {
            this.node.transitionLogic.transitions = [];
        }
        let nodeTransitions = this.node.transitionLogic.transitions;
        if (nodeTransitions.length > 0) {
            // If this node already has transitions, copy the last one.
            let lastNodeTransition = nodeTransitions[nodeTransitions.length - 1];
            let newTransition = {
                "to": lastNodeTransition.to
            };
            nodeTransitions.push(newTransition);
        } else {
            // Otherwise set the new transition to the current nodeId
            let newTransition = {
                "to": this.nodeId
            };
            nodeTransitions.push(newTransition);
        }
    }

    /**
     * Add a new transition for the specified transition.
     */
    addNewTransitionCriteria(transition) {
        let nodeTransitions = this.node.transitionLogic.transitions;
        for (var n = 0; n < nodeTransitions.length; n++) {
            let nodeTransition = nodeTransitions[n];
            if (nodeTransition == transition) {
                if (nodeTransition.criteria == null) {
                    nodeTransition.criteria = [];
                }
                let newTransitionCriteria = {
                    "nodeId": "",
                    "componentId": "",
                    "function": {}
                };
                nodeTransition.criteria.push(newTransitionCriteria);
            }
        }
    }

    /**
     * Deletes the specified transition from this node
     */
    deleteTransition(transition) {
        let nodeTransitions = this.node.transitionLogic.transitions;

        let index = nodeTransitions.indexOf(transition);
        if (index > -1) {
            nodeTransitions.splice(index, 1);
        }
    }


    /**
     * Save transitions for this node
     */
    saveTransitions() {

        // save the project
        this.ProjectService.saveProject();

        // hide the create component elements
        this.showEditTransitions = false;
    }

    /**
     * Create a component in this node
     */
    createComponent() {

        // create a component and add it to this node
        this.ProjectService.createComponent(this.nodeId, this.selectedComponent);

        // save the project
        this.ProjectService.saveProject();

        // hide the create component elements
        this.showCreateComponent = false;

        // Scroll to the bottom of the page where the new component was added
        this.$timeout(() => {
            this.$location.hash('bottom');
            this.$anchorScroll();
        });
    }

    /**
     * Move a component up within this node
     * @param componentId the component id
     */
    moveComponentUp(componentId) {

        // move the component up within the node
        this.ProjectService.moveComponentUp(this.nodeId, componentId);

        // save the project
        this.ProjectService.saveProject();
    }

    /**
     * Move a component up within this node
     * @param componentId the component id
     */
    moveComponentDown(componentId) {

        // move the component down within the node
        this.ProjectService.moveComponentDown(this.nodeId, componentId);

        // save the project
        this.ProjectService.saveProject();
    }

    /**
     * Delete the component from this node
     * @param componentId the component id
     */
    deleteComponent(componentId) {

        this.$translate('confirmDeleteComponent').then((confirmDeleteComponent) => {

            // ask the user to confirm the delete
            var answer = confirm(confirmDeleteComponent);

            if (answer) {
                // the user confirmed yes

                // delete the component from the node
                this.ProjectService.deleteComponent(this.nodeId, componentId);

                // save the project
                this.ProjectService.saveProject();
            }
        });
    }

    /**
     * The node has changed in the authoring view
     */
    authoringViewNodeChanged() {
        // put the previous version of the node on to the undo stack
        this.undoStack.push(this.currentNodeCopy);

        // save the project
        this.ProjectService.saveProject();

        // update the current node copy
        this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    }

    /**
     * Undo the last change by reverting the node to the previous version
     */
    undo() {

        if (this.undoStack.length === 0) {
            // the undo stack is empty so there are no changes to undo
            this.$translate('noUndoAvailable').then((noUndoAvailable) => {
                alert(noUndoAvailable);
            });

        } else if (this.undoStack.length > 0) {
            // the undo stack has elements

            this.$translate('confirmUndoLastChange').then((confirmUndoLastChange) => {

                // ask the user to confirm the delete
                var result = confirm(confirmUndoLastChange);

                if (result) {
                    // perform any node cleanup if necessary
                    this.$scope.$broadcast('exitNode', {nodeToExit: this.node});
                    
                    // get the previous version of the node
                    var nodeCopy = this.undoStack.pop();

                    // revert the node back to the previous version
                    this.ProjectService.replaceNode(this.nodeId, nodeCopy);

                    // get the node
                    this.node = this.ProjectService.getNodeById(this.nodeId);

                    // get the components in the node
                    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

                    // save the project
                    this.ProjectService.saveProject();
                }
            });
        }
    }
};

NodeController.$inject = ['$anchorScroll', '$location', '$scope', '$state', '$stateParams', '$timeout', '$translate', 'ConfigService', 'ProjectService', 'UtilService'];

export default NodeController;
