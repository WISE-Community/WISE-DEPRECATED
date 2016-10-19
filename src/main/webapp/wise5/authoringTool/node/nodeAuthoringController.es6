'use strict';

class NodeAuthoringController {

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
        this.whenToChoosePathOptions = [null, "enterNode", "exitNode", "scoreChanged", "studentDataChanged"];
        this.canChangePathOptions = [null, true, false];
        
        // the available constraint actions
        this.constraintActions = [
            {
                value: "makeThisNodeNotVisible",
                text: "Make this node not visible"
            },
            {
                value: "makeThisNodeNotVisitable",
                text: "Make this node not visitable"
            },
            {
                value: "makeAllNodesAfterThisNotVisible",
                text: "Make all nodes after this not visible"
            },
            {
                value: "makeAllNodesAfterThisNotVisitable",
                text: "Make all nodes after this not visitable"
            },
            {
                value: "makeAllOtherNodesNotVisible",
                text: "Make all other nodes not visible"
            },
            {
                value: "makeAllOtherNodesNotVisitable",
                text: "Make all other nodes not visitable"
            }
        ];
        
        // the available removal conditionals
        this.removalConditionals = [
            {
                value: "any",
                text: "Any"
            },
            {
                value: "all",
                text: "All"
            }
        ];
        
        // the available removal criteria
        this.removalCriteria = [
            {
                value: "isCompleted",
                text: "Is Completed",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    }
                ]
            },
            {
                value: "score",
                text: "Score",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    },
                    {
                        value: "componentId",
                        text: "Component Id"
                    },
                    {
                        value: "scores",
                        text: "Score(s)"
                    }
                ]
            },
            {
                value: "branchPathTaken",
                text: "Branch Path Taken",
                params: [
                    {
                        value: "fromNodeId",
                        text: "From Node Id"
                    },
                    {
                        value: "toNodeId",
                        text: "To Node Id"
                    }
                ]
            },
            {
                value: "choiceChosen",
                text: "Choice Chosen",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    },
                    {
                        value: "componentId",
                        text: "Component Id"
                    },
                    {
                        value: "choiceIds",
                        text: "Choices"
                    }
                ]
            },
            {
                value: "isCorrect",
                text: "Is Correct",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    },
                    {
                        value: "componentId",
                        text: "Component Id"
                    }
                ]
            },
            {
                value: "isVisible",
                text: "Is Visible",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    }
                ]
            },
            {
                value: "isVisitable",
                text: "Is Visitable",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    }
                ]
            },
            {
                value: "isVisited",
                text: "Is Visited",
                params: [
                    {
                        value: "nodeId",
                        text: "Node Id"
                    }
                ]
            },
            {
                value: "isPlanningActivityCompleted",
                text: "Is Planning Activity Completed"
            }
        ];

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
        let commitMessage = "Made changes to Step.";
        this.ProjectService.saveProject(commitMessage);

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
                    "name":"",
                    "params": {
                        "nodeId": "",
                        "componentId": ""
                    }
                };
                nodeTransition.criteria.push(newTransitionCriteria);
            }
        }
    }

    /**
     * Author chose/updated a transition criteria, which is saved in this.selectedTransitionCriteria.
     * The original transitionCriteria is passed in as originalTransitionCriteria parameter.
     * @param originalTransitionCriteria
     */
    transitionCriteriaChanged(transitionIndex, criteriaIndex, newTransitionCriteria) {
        this.node.transitionLogic.transitions[transitionIndex].criteria[criteriaIndex] = newTransitionCriteria;
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
    
    /**
     * Get the removal criteria params for a removal criteria name
     * @param name a removal criteria name e.g. 'isCompleted', 'score', 'branchPathTaken'
     * @return the params for the given removal criteria name
     */
    getRemovalCriteriaParamsByName(name) {
        var params = [];
        
        if (name != null) {
            
            // loop through all the available removal criteria
            for (var r = 0; r < this.removalCriteria.length; r++) {
                
                // get a single removal criteria
                var singleRemovalCriteria = this.removalCriteria[r];
                
                if (singleRemovalCriteria != null) {
                    
                    if (singleRemovalCriteria.value == name) {
                        /*
                         * we have found the removal criteria we are looking for
                         * so we will get its params
                         */
                        params = singleRemovalCriteria.params;
                        break;
                    }
                }
            }
        }
        
        return params;
    }
    
    /**
     * Get the choices of a component
     * @param nodeId the node id
     * @param componentId the component id
     * @return the choices from the component
     */
    getChoicesByNodeIdAndComponentId(nodeId, componentId) {
        
        var choices = [];
        
        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
        
        if (component != null && component.choices != null) {
            // get the choices
            choices = component.choices;
        }
        
        return choices;
    }
    
    /**
     * Get the choice type of a component
     * @param nodeId the node id
     * @param componentId the component id
     * @return the choice type e.g. 'radio' or 'checkbox'
     */
    getChoiceTypeByNodeIdAndComponentId(nodeId, componentId) {
        
        var choiceType = null;
        
        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
        
        if (component != null && component.choiceType != null) {
            // get the choice type
            choiceType = component.choiceType;
        }
        
        return choiceType;
    }
    
    /**
     * Get the next available constraint id for a node
     * @param nodeId the node id
     * @return a constraint id that hasn't been used yet
     */
    getNewNodeConstraintId(nodeId) {
        
        var newNodeConstraintId = null;
        
        var usedConstraintIds = [];
        
        // get the node content
        var node = this.ProjectService.getNodeById(nodeId);
        
        if (node != null) {
            
            // get the constraints
            var constraints = node.constraints;
            
            if (constraints != null) {
                
                // loop through all the constraints
                for (var c = 0; c < constraints.length; c++) {
                    
                    // get a constraint
                    var constraint = constraints[c];
                    
                    if (constraint != null) {
                        
                        // get the id of the constraint
                        var constraintId = constraint.id;
                        
                        // add the constraint id to the array of used constraint ids
                        usedConstraintIds.push(constraintId);
                    }
                }
            }
        }
        
        // counter used for finding a constraint id that hasn't been used yet
        var constraintCounter = 1;
        
        // loop until we have found an unused constraint id
        while (newNodeConstraintId == null) {
            
            // create a potential constraint id
            var potentialNewNodeConstraintId = nodeId + 'Constraint' + constraintCounter;
            
            // check if the constraint id has been used already
            if (usedConstraintIds.indexOf(potentialNewNodeConstraintId) == -1) {
                // the constraint id has not been used so we can use it
                newNodeConstraintId = potentialNewNodeConstraintId;
            } else {
                /*
                 * the constraint id has been used so we will increment the 
                 * counter to try another contraint id
                 */
                constraintCounter++;
            }
        }
        
        return newNodeConstraintId;
    }
    
    /**
     * Add a constraint
     */
    addConstraint() {
        
        // get a new constraint id
        var newNodeConstraintId = this.getNewNodeConstraintId(this.nodeId);
        
        // create the constraint object
        var constraint = {};
        constraint.id = newNodeConstraintId;
        constraint.action = null;
        constraint.targetId = this.nodeId;
        constraint.removalConditional = "all";
        constraint.removalCriteria = [];
        
        // create a removal criteria
        var removalCriteria = {};
        removalCriteria.name = "";
        removalCriteria.params = {};
        
        // add the removal criteria to the constraint
        constraint.removalCriteria.push(removalCriteria);
        
        // create the constraints array if it does not exist
        if (this.node.constraints == null) {
            this.node.constraints = [];
        }
        
        // add the constraint to the node
        this.node.constraints.push(constraint);
        
        // save the project
        this.ProjectService.saveProject();
    }
    
    /**
     * Delete a constraint
     * @param constraintIndex delete the constraint at the index
     */
    deleteConstraint(constraintIndex) {
        
        if (constraintIndex != null) {
            // get the node content
            var node = this.ProjectService.getNodeById(this.nodeId);
            
            if (node != null) {
                
                // get the constraints
                var constraints = node.constraints;
                
                if (constraints != null) {
                    
                    // remove the constraint at the given index
                    constraints.splice(constraintIndex, 1);
                }
            }
        }
        
        // save the project
        this.ProjectService.saveProject();
    }
    
    /**
     * Add a removal criteria
     * @param constraint add the removal criteria to this constraint
     */
    addRemovalCriteria(constraint) {
        
        if (constraint != null) {
            
            // create the removal criteria
            var removalCriteria = {};
            removalCriteria.name = "";
            removalCriteria.params = {};
            
            // add the removal criteria to the constraint
            constraint.removalCriteria.push(removalCriteria);
        }
        
        // save the project
        this.ProjectService.saveProject();
    }
    
    /**
     * Delete a removal criteria from a constraint
     * @param constraint remove the removal criteria from this constraint
     * @param removalCriteriaIndex the index of the removal criteria to remove
     */
    deleteRemovalCriteria(constraint, removalCriteriaIndex) {
        if (constraint != null) {
            
            // get all the removal criteria
            var removalCriteria = constraint.removalCriteria;
            
            if (removalCriteria != null) {
                // remove the single removal criteria
                removalCriteria.splice(removalCriteriaIndex, 1);
            }
        }
        
        // save the project
        this.ProjectService.saveProject();
    }
    
    /**
     * A removal criteria name has changed so we will clear the params so
     * that the params from the previous removal criteria name do not persist
     */
    removalCriteriaNameChanged(criteria) {
        
        if (criteria != null) {
            // clear the params
            criteria.params = {};
        }
        
        // save the project
        this.authoringViewNodeChanged();
    }
};

NodeAuthoringController.$inject = ['$anchorScroll', '$location', '$scope', '$state', '$stateParams', '$timeout', '$translate', 'ConfigService', 'ProjectService', 'UtilService'];

export default NodeAuthoringController;
