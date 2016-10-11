class NodeService {

    constructor($http,
                $injector,
                $mdDialog,
                $q,
                ConfigService,
                ProjectService,
                StudentDataService,
                TeacherDataService) {
        this.$http = $http;
        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.TeacherDataService = TeacherDataService;

        this.transitionResults = {};
        this.chooseTransitionPromises = {};
    }

    /**
     * Create a new empty node state
     * @return a new empty node state
     */
    createNewComponentState() {
        var componentState = {};

        // set the timestamp
        componentState.clientSaveTime = Date.parse(new Date());

        return componentState;
    };

    /**
     * Create a new empty node state
     * @return a new empty node state
     */
    createNewNodeState() {
        var nodeState = {};
        nodeState.runId = this.ConfigService.getRunId();
        nodeState.periodId = this.ConfigService.getPeriodId();
        nodeState.workgroupId = this.ConfigService.getWorkgroupId();

        // set the timestamp
        nodeState.clientSaveTime = Date.parse(new Date());

        return nodeState;
    };

    /**
     * Get the node type in camel case
     * @param nodeType the node type e.g. OpenResponse
     * @return the node type in camel case
     * e.g.
     * openResponse
     */
    toCamelCase(nodeType) {
        var nodeTypeCamelCased = null;

        if (nodeType != null && nodeType.length > 0) {

            // get the first character
            var firstChar = nodeType.charAt(0);

            if(firstChar != null) {

                // make the first character lower case
                var firstCharLowerCase = firstChar.toLowerCase();

                if (firstCharLowerCase != null) {

                    /*
                     * replace the first character with the lower case
                     * character
                     */
                    nodeTypeCamelCased = firstCharLowerCase + nodeType.substr(1);
                }
            }
        }

        return nodeTypeCamelCased;
    };

    /**
     * Check if the string is in all uppercase
     * @param str the string to check
     * @return whether the string is in all uppercase
     */
    isStringUpperCase(str) {
        var result = false;

        if (str != null) {
            if (str === str.toUpperCase()) {
                // the string is in all uppercase
                result = true;
            }
        }

        return result;
    };

    /**
     * Get the html template for the component
     * @param componentType the component type
     * @return the path to the html template for the component
     */
    getComponentTemplatePath(componentType) {

        if (componentType == null) {
            // error
        } else if (this.isStringUpperCase(componentType)) {
            /*
             * the component type is all uppercase so we will convert it to all
             * lowercase
             */
            componentType = componentType.toLowerCase();
        } else {
            // get the component type in camel case
            componentType = this.toCamelCase(componentType);
        }
        var wiseBaseURL = this.ConfigService.getWISEBaseURL();
        return wiseBaseURL + '/wise5/components/' + componentType + '/index.html';
    };

    /**
     * Get the component content
     * @param componentContent the component content
     * @param componentId the component id
     * @return the component content
     */
    getComponentContentById(nodeContent, componentId) {
        var componentContent = null;

        if (nodeContent != null && componentId != null) {

            // get the components
            var components = nodeContent.components;

            if (components != null) {

                // loop through the components
                for (var c = 0; c < components.length; c++) {
                    var tempComponent = components[c];

                    if (tempComponent != null) {
                        var tempComponentId = tempComponent.id;

                        if (tempComponentId === componentId) {
                            // we have found the component with the component id we want
                            componentContent = tempComponent;
                            break;
                        }
                    }
                }
            }
        }

        return componentContent;
    };

    /**
     * Check if any of the component states were submitted
     * @param componentStates an array of component states
     * @return whether any of the component states were submitted
     */
    isWorkSubmitted(componentStates) {
        var result = false;

        if (componentStates != null) {

            // loop through all the component states
            for (var c = 0; c < componentStates.length; c++) {
                var componentState = componentStates[c];

                if (componentState != null) {

                    if (componentState.isSubmit) {
                        result = true;
                        break;
                    }
                }
            }
        }

        return result;
    };

    /**
     * Check if the node or component is completed
     * @param functionParams the params that will specify which node or component
     * to check for completion
     * @returns whether the specified node or component is completed
     */
    isCompleted(functionParams) {

        var result = false;

        if (functionParams != null) {
            var nodeId = functionParams.nodeId;
            var componentId = functionParams.componentId;

            result = this.StudentDataService.isCompleted(nodeId, componentId);
        }

        return result;
    };

    /**
     * Go to the next node
     */
    goToNextNode() {

        this.getNextNodeId().then((nextNodeId) => {
            if (nextNodeId != null) {
                if (this.ConfigService.getMode() === 'classroomMonitor') {
                    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
                } else {
                    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
                }
            }
        });
    };

    /**
     * Get the next node in the project sequence. We return a promise because
     * in preview mode we allow the user to specify which branch path they want
     * to go to. In all other cases we will resolve the promise immediately.
     * @param currentId (optional)
     * @returns a promise that returns the next node id
     */
    getNextNodeId(currentId) {
        // create a promise that will return the next node id
        let deferred = this.$q.defer();
        let promise = deferred.promise;

        let nextNodeId = null;
        let currentNodeId = null;
        let mode = this.ConfigService.getMode();

        if (currentId) {
            // a current node id was passed in
            currentNodeId = currentId;
        } else {
            // no current id was passed in, so get current node
            let currentNode = null;

            if (mode === 'classroomMonitor') {
                currentNode = this.TeacherDataService.getCurrentNode();
            } else {
                currentNode = this.StudentDataService.getCurrentNode();
            }
            if (currentNode) {
                currentNodeId = currentNode.id;
            }
        }

        if (currentNodeId) {
            if (mode === 'classroomMonitor') {
                let currentNodeOrder = this.ProjectService.getNodeOrderById(currentNodeId);

                if (currentNodeOrder) {
                    let nextNodeOrder = currentNodeOrder + 1;
                    let nextId = this.ProjectService.getNodeIdByOrder(nextNodeOrder);

                    if (nextId) {
                        if (this.ProjectService.isApplicationNode(nextId)) {
                            // node is a step, so set it as the next node
                            nextNodeId = nextId;
                        } else if (this.ProjectService.isGroupNode(nextId)){
                            // node is an activity, so get next nodeId
                            nextNodeId = this.getNextNodeId(nextId);
                        }
                    }
                }

                // resolve the promise with the next node id
                deferred.resolve(nextNodeId);
            } else {
                // get the transition logic from the current node
                var transitionLogic = this.ProjectService.getTransitionLogicByFromNodeId(currentNodeId);

                // get all the branchPathTaken events for the current node
                var branchPathTakenEvents = this.StudentDataService.getBranchPathTakenEventsByNodeId(currentNodeId);

                if (branchPathTakenEvents != null && branchPathTakenEvents.length > 0 &&
                    (transitionLogic != null && transitionLogic.canChangePath != true)) {
                    // the student has branched on this node before and they are not allowed to change paths

                    // loop through all the branchPathTaken events from newest to oldest
                    for (var b = branchPathTakenEvents.length - 1; b >= 0; b--) {
                        var branchPathTakenEvent = branchPathTakenEvents[b];

                        if (branchPathTakenEvent != null) {

                            // get the data from the event
                            var data = branchPathTakenEvent.data;

                            if (data != null) {
                                // get the to node id
                                var toNodeId = data.toNodeId;
                                nextNodeId = toNodeId;
                                deferred.resolve(nextNodeId);
                                break;
                            }
                        }
                    }
                } else {
                    // the student has not branched on this node before

                    if (transitionLogic != null) {
                        var transitions = transitionLogic.transitions;

                        if (transitions == null || transitions.length == 0) {
                            /*
                             * this node does not have any transitions so we will
                             * check if the parent group has transitions
                             */

                            // get the parent group id
                            var parentGroupId = this.ProjectService.getParentGroupId(currentNodeId);
                            var parentHasTransitionLogic = false;

                            if (parentGroupId != null) {

                                // get the transition logic from the parent
                                var parentTransitionLogic = this.ProjectService.getTransitionLogicByFromNodeId(parentGroupId);

                                if (parentTransitionLogic != null) {

                                    parentHasTransitionLogic = true;

                                    // choose a transition
                                    this.chooseTransition(parentGroupId, parentTransitionLogic).then((transition) => {

                                        if (transition != null) {
                                            // get the to node id
                                            var transitionToNodeId = transition.to;

                                            if (this.ProjectService.isGroupNode(transitionToNodeId)) {
                                                // the to node is a group

                                                // get the start id of the group
                                                var startId = this.ProjectService.getGroupStartId(transitionToNodeId);

                                                if (startId == null || startId == '') {
                                                    // the group does not have a start id so we will just use the group
                                                    nextNodeId = transitionToNodeId;
                                                } else {
                                                    // the group has a start id so we will use the start id
                                                    nextNodeId = startId;
                                                }
                                            } else {
                                                // the to node is a step
                                                nextNodeId = transitionToNodeId;
                                            }
                                        }

                                        // resolve the promise with the next node id
                                        deferred.resolve(nextNodeId);
                                    });
                                }
                            }

                            if (!parentHasTransitionLogic) {
                                /*
                                 * the parent does not have any transition logic so
                                 * there is no next node from the parent
                                 */
                                deferred.resolve(null);
                            }
                        } else {
                            // choose a transition
                            this.chooseTransition(currentNodeId, transitionLogic).then((transition) => {

                                if (transition != null) {
                                    // move the student to the toNodeId
                                    nextNodeId = transition.to;

                                    // resolve the promise with the next node id
                                    deferred.resolve(nextNodeId);
                                }
                            });
                        }
                    }
                }
            }
        } else {
            deferred.resolve(null);
        }

        return promise;
    };

    /**
     * Go to the previous node
     */
    goToPrevNode() {

        var prevNodeId = this.getPrevNodeId();
        if (this.ConfigService.getMode() === 'classroomMonitor') {
            this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
        } else {
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
        }
    };

    /**
     * Get the previous node in the project sequence
     * @param currentId (optional)
     */
    getPrevNodeId(currentId) {
        let prevNodeId = null;
        let currentNodeId = null;
        let mode = this.ConfigService.getMode();

        if (currentId) {
            // a current node id was passed in
            currentNodeId = currentId;
        } else {
            // no current id was passed in, so get current node
            let currentNode = null;

            if (mode === 'classroomMonitor') {
                currentNode = this.TeacherDataService.getCurrentNode();
            } else {
                currentNode = this.StudentDataService.getCurrentNode();
            }
            if (currentNode) {
                currentNodeId = currentNode.id;
            }
        }

        if (currentNodeId) {
            if (mode === 'classroomMonitor') {
                let currentNodeOrder = this.ProjectService.getNodeOrderById(currentNodeId);

                if (currentNodeOrder) {
                    let prevNodeOrder = currentNodeOrder - 1;
                    let prevId = this.ProjectService.getNodeIdByOrder(prevNodeOrder);

                    if (prevId) {
                        if (this.ProjectService.isApplicationNode(prevId)) {
                            // node is a step, so set it as the next node
                            prevNodeId = prevId;
                        } else if (this.ProjectService.isGroupNode(prevId)){
                            // node is an activity, so get next nodeId
                            prevNodeId = this.getPrevNodeId(prevId);
                        }
                    }
                }
            } else {
                // get all the nodes that transition to the current node
                var nodeIdsByToNodeId = this.ProjectService.getNodeIdsByToNodeId(currentNodeId);

                if (nodeIdsByToNodeId == null) {

                } else if (nodeIdsByToNodeId.length === 1) {
                    // there is only one node that transitions to the current node
                    prevNodeId = nodeIdsByToNodeId[0];
                } else if (nodeIdsByToNodeId.length > 1) {
                    // there are multiple nodes that transition to the current node

                    // get the stack history
                    var stackHistory = this.StudentDataService.getStackHistory();

                    // loop through the stack history node ids from newest to oldest
                    for (var s = stackHistory.length - 1; s >= 0; s--) {
                        var stackHistoryNodeId = stackHistory[s];

                        if (nodeIdsByToNodeId.indexOf(stackHistoryNodeId) != -1) {
                            // we have found a node that we previously visited that transitions to the current node
                            prevNodeId = stackHistoryNodeId;
                            break;
                        }
                    }
                }
            }
        }

        return prevNodeId;
    };

    /**
     * Close the current node (and open the current node's parent group)
     */
    closeNode() {
        let mode = this.ConfigService.getMode();
        let currentNode = null;

        if (mode === 'classroomMonitor') {
            currentNode = this.TeacherDataService.getCurrentNode();
        } else {
            currentNode = this.StudentDataService.getCurrentNode();
        }

        if (currentNode) {

            let currentNodeId = currentNode.id;

            // get the parent node of the current node
            let parentNode = this.ProjectService.getParentGroup(currentNodeId);

            let parentNodeId = parentNode.id;

            // set the current node to the parent node
            if (mode === 'classroomMonitor') {
                this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
            } else {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
            }
        }
    };

    /**
     * Choose the transition the student will take
     * @param nodeId the current node id
     * @param transitionLogic an object containing transitions and parameters
     * for how to choose a transition
     * @returns a promise that will return a transition
     */
    chooseTransition(nodeId, transitionLogic) {

        var deferred = this.$q.defer();

        // see if there is already a promise for this step
        var promise = this.getChooseTransitionPromise(nodeId);

        if (promise == null) {
            // there is no existing promise for this step so we will create one
            promise = deferred.promise;
        } else {
            // there is an existing promise for this step so we will use it
            return promise;
        }

        var resolvePromiseNow = true;

        // check if the transition was already previously calculated
        var transitionResult = this.getTransitionResultByNodeId(nodeId);

        if (transitionResult == null || (transitionLogic != null && transitionLogic.canChangePath == true)) {
            /*
             * we have not previously calculated the transition or the
             * transition logic allows the student to change branch paths
             * so we will calculate the transition again
             */

            // get the transitions
            var transitions = transitionLogic.transitions;

            if (transitions != null) {

                let availableTransitions = [];

                // loop through all the transitions
                for (var t = 0; t < transitions.length; t++) {

                    // get a transition
                    var transition = transitions[t];

                    // get the to node id
                    var toNodeId = transition.to;

                    // get the criteria for which this transition can be used
                    var criteria = transition.criteria;

                    // set the default result to true in case there is no criteria
                    var criteriaResult = true;

                    if (criteria != null) {

                        var firstResult = true;
                        var tempResult = true;

                        // loop through all of the criteria
                        for (var c = 0; c < criteria.length; c++) {

                            // get a criteria
                            var tempCriteria = criteria[c];

                            // check if the criteria is satisfied
                            tempResult = this.StudentDataService.evaluateCriteria(tempCriteria);

                            if (firstResult) {
                                // this is the first criteria in this for loop
                                criteriaResult = tempResult;
                                firstResult = false;
                            } else {
                                // this is not the first criteria in this for loop so we will && the result
                                criteriaResult = criteriaResult && tempResult;
                            }
                        }
                    }

                    if (toNodeId != null) {

                        // check if the criteria was satisfied and the to node is visitable
                        if (criteriaResult) {

                            // the student is allowed to use the transition
                            availableTransitions.push(transition);
                        }
                    }
                }

                if (availableTransitions.length == 0) {
                    // there are no available transitions for the student
                    transitionResult = null;
                } else if (availableTransitions.length == 1) {
                    // there is one available transition for the student
                    transitionResult = availableTransitions[0];
                } else if (availableTransitions.length > 1) {
                    // there are multiple available transitions for the student

                    if (this.ConfigService.isPreview()) {
                        /*
                         * we are in preview mode so we will let the user choose
                         * the branch path to go to
                         */

                         if (transitionResult != null) {
                             /*
                              * the user has previously chosen the branch path
                              * so we will use the transition they chose and
                              * not ask them again
                              */
                         } else {
                             // ask the user which branch path to go to

                             resolvePromiseNow = false;

                             let chooseBranchPathTemplateUrl = this.ProjectService.getThemePath() + '/templates/branchPathChooser.html';

                             var dialogOptions = {
                                 templateUrl: chooseBranchPathTemplateUrl,
                                 controller: ChooseBranchPathController,
                                 locals: {
                                     availableTransitions: availableTransitions,
                                     deferred: deferred,
                                     nodeId: nodeId
                                 }
                             };

                             /**
                              * Controller that handles the dialog popup that lets the user
                              * which branch path to go to.
                              * @param $scope the scope
                              * @param $mdDialog the dialog popup object
                              * @param availableTransitions the branch paths
                              * @param deferred used to resolve the promise once the user
                              * has chosen a branch path
                              * @param nodeId the current node
                              */
                             function ChooseBranchPathController($scope, $mdDialog, NodeService, ProjectService, availableTransitions, deferred, nodeId) {

                                 $scope.availableTransitions = availableTransitions;
                                 $scope.NodeService = NodeService;
                                 $scope.ProjectService = ProjectService;

                                 // called when the user clicks on a branch path
                                 $scope.chooseBranchPath = (transitionResult) => {
                                     // remember the transition that was chosen
                                     $scope.NodeService.setTransitionResult(nodeId, transitionResult);

                                     // resolve the promise
                                     deferred.resolve(transitionResult);

                                     /*
                                      * don't remember the promise for this step anymore
                                      * since we have resolved it
                                      */
                                     $scope.NodeService.setChooseTransitionPromise(nodeId, null);

                                     // close the dialog
                                     $mdDialog.hide();
                                 }

                                 // obtains the step number and title
                                 $scope.getNodePositionAndTitleByNodeId = (nodeId) => {
                                     return $scope.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
                                 }

                                 // called when the dialog is closed
                                 $scope.close = () => {
                                     $mdDialog.hide();
                                 }
                             }

                             ChooseBranchPathController.$inject = ['$scope', '$mdDialog', 'NodeService', 'ProjectService', 'availableTransitions', 'deferred', 'nodeId'];

                             /*
                              * show the popup dialog that lets the user choose the
                              * branch path
                              */
                             this.$mdDialog.show(dialogOptions);
                         }
                    } else {
                        /*
                         * we are in regular student run mode so we will choose
                         * the branch according to how the step was authored
                         */

                        var howToChooseAmongAvailablePaths = transitionLogic.howToChooseAmongAvailablePaths;

                        if (howToChooseAmongAvailablePaths == null ||
                            howToChooseAmongAvailablePaths === '' ||
                            howToChooseAmongAvailablePaths === 'random') {
                            // choose a random transition

                            var randomIndex = Math.floor(Math.random() * availableTransitions.length);
                            transitionResult = availableTransitions[randomIndex];
                        } else if (howToChooseAmongAvailablePaths === 'workgroupId') {
                            // use the workgroup id to choose the transition

                            // get the workgroup id
                            var workgroupId = this.ConfigService.getWorkgroupId();

                            // choose the transition index
                            var index = workgroupId % availableTransitions.length;

                            transitionResult = availableTransitions[index];
                        } else if (howToChooseAmongAvailablePaths === 'firstAvailable') {
                            // choose the first available transition

                            transitionResult = availableTransitions[0];
                        } else if (howToChooseAmongAvailablePaths === 'lastAvailable') {
                            // choose the last available transition

                            transitionResult = availableTransitions[availableTransitions.length - 1];
                        }
                    }
                }
            }
        }

        if (resolvePromiseNow) {
            // remember the transition that was chosen for this step
            this.setTransitionResult(nodeId, transitionResult);

            // resolve the promise immediately
            deferred.resolve(transitionResult);
        } else {
            /*
             * remember the promise in case someone else calls chooseTransition()
             * so we can chain off of this promise instead of creating another
             * promise
             */
            this.setChooseTransitionPromise(nodeId, promise);
        }

        return promise;
    };

    hasTransitionLogic() {
        var result = false;

        var currentNode = this.StudentDataService.getCurrentNode();

        if (currentNode != null) {
            var transitionLogic = currentNode.transitionLogic;

            if (transitionLogic != null) {
                result = true;
            }
        }

        return result;
    };

    /**
     * Evaluate the transition logic for the current node and create branch
     * path taken events if necessary.
     */
    evaluateTransitionLogic() {

        // get the current node
        var currentNode = this.StudentDataService.getCurrentNode();

        if (currentNode != null) {

            var nodeId = currentNode.id;
            var transitionLogic = currentNode.transitionLogic;

            if (transitionLogic != null) {

                // get all the transitions from the current node
                var transitions = transitionLogic.transitions;
                var canChangePath = transitionLogic.canChangePath;
                var alreadyBranched = false;

                // get all the branchPathTaken events for the current node
                var events = this.StudentDataService.getBranchPathTakenEventsByNodeId(currentNode.id);

                if (events.length > 0) {
                    // the student has branched from this node before
                    alreadyBranched = true;
                }

                var transition, fromNodeId, toNodeId;

                if (alreadyBranched) {
                    // student has previously branched

                    if (canChangePath) {
                        // student can change path

                        // choose a transition
                        this.chooseTransition(nodeId, transitionLogic).then((transition) => {

                            if (transition != null) {
                                fromNodeId = currentNode.id;
                                toNodeId = transition.to;

                                // create a branchPathTaken event to signify taking the branch path
                                this.createBranchPathTakenEvent(fromNodeId, toNodeId);
                            }
                        });
                    } else {
                        // student can't change path

                    }
                } else {
                    // student has not branched yet

                    // choose a transition
                    this.chooseTransition(nodeId, transitionLogic).then((transition) => {

                        if (transition != null) {
                            fromNodeId = currentNode.id;
                            toNodeId = transition.to;

                            // create a branchPathTaken event to signify taking the branch path
                            this.createBranchPathTakenEvent(fromNodeId, toNodeId);
                        }
                    });
                }
            }
        }
    };

    /**
     * Create a branchPathTaken event
     * @param fromNodeId the from node id
     * @param toNodeid the to node id
     */
    createBranchPathTakenEvent(fromNodeId, toNodeId) {
        var nodeId = fromNodeId;
        var componentId = null;
        var componentType = null;
        var category = "Navigation";
        var event = "branchPathTaken";
        var eventData = {};
        eventData.fromNodeId = fromNodeId;
        eventData.toNodeId = toNodeId;
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    }

    evaluateTransitionLogicOn(event) {
        var result = false;

        // get the current node
        var currentNode = this.StudentDataService.getCurrentNode();

        if (currentNode != null) {
            var transitionLogic = currentNode.transitionLogic;

            var whenToChoosePath = transitionLogic.whenToChoosePath;

            if (event === whenToChoosePath) {
                result = true;
            }
        }

        return result;
    };

    /**
     * Get the transition result for a node
     * @param nodeId the the node id
     * @returns the transition object that was chosen for the node
     */
    getTransitionResultByNodeId(nodeId) {
        return this.transitionResults[nodeId];
    }

    /**
     * Set the transition result for a node
     * @param nodeId the node id
     * @param transitionResult the transition object that was chosen for the node
     */
    setTransitionResult(nodeId, transitionResult) {
        if (nodeId != null) {
            this.transitionResults[nodeId] = transitionResult;
        }
    }

    /**
     * Get the promise that was created for a specific node when the
     * chooseTransition() function was called. This promise has not been
     * resolved yet.
     * @param nodeId the node id
     * @returns the promise that was created when chooseTransition() was called
     * or null if there is no unresolved promise.
     */
    getChooseTransitionPromise(nodeId) {
        return this.chooseTransitionPromises[nodeId];
    }

    /**
     * Set the promise that was created for a specific node when the
     * chooseTransition() function was called. This promise has not been
     * resolved yet.
     * @param nodeId the node id
     * @param promise the promise
     */
    setChooseTransitionPromise(nodeId, promise) {
        if (nodeId != null) {
            this.chooseTransitionPromises[nodeId] = promise;
        }
    }
}

NodeService.$inject = [
    '$http',
    '$injector',
    '$mdDialog',
    '$q',
    'ConfigService',
    'ProjectService',
    'StudentDataService',
    'TeacherDataService'
];

export default NodeService;
