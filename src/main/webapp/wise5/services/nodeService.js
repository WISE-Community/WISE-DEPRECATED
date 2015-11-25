define(['configService', 'projectService', 'studentDataService'], function(configService, projectService, studentDataService) {

    var service = ['$http', '$injector', '$q', 'ConfigService', 'ProjectService', 'StudentDataService',
        function($http, $injector, $q, ConfigService, ProjectService, StudentDataService) {
            var serviceObject = {};

            serviceObject.getLatestNodeState = function(nodeVisits) {
                var result = null;

                if (nodeVisits != null) {
                    for (var nv = nodeVisits.length - 1; nv >= 0; nv--) {
                        var nodeVisit = nodeVisits[nv];

                        if (nodeVisit != null) {
                            var nodeStates = nodeVisit.nodeStates;

                            for (var ns = nodeStates.length - 1; ns >= 0; ns--) {
                                var nodeState = nodeStates[ns];

                                if (nodeState != null) {
                                    result = nodeState;
                                    break;
                                }
                            }

                            if (result != null) {
                                break;
                            }
                        }
                    }
                }

                return result;
            };

            serviceObject.getStudentWorkAsHTML = function(nodeState) {
                var studentWorkAsHTML = null;

                if (nodeState != null) {
                    var response = nodeState.response;

                    studentWorkAsHTML = '<p>' + response + '</p>';
                }

                return studentWorkAsHTML;
            };

            /**
             * Create a new empty node state
             * @return a new empty node state
             */
            serviceObject.createNewComponentState = function() {
                var componentState = {};

                // set the timestamp
                componentState.clientSaveTime = Date.parse(new Date());

                return componentState;
            };

            /**
             * Create a new empty node state
             * @return a new empty node state
             */
            serviceObject.createNewNodeState = function() {
                var nodeState = {};

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
            serviceObject.toCamelCase = function(nodeType) {
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
            serviceObject.isStringUpperCase = function(str) {
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
            serviceObject.getComponentTemplatePath = function(componentType) {

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

                return 'wise5/components/' + componentType + '/index.html';
            };

            /**
             * Get the component content
             * @param componentContent the component content
             * @param componentId the component id
             * @return the component content
             */
            serviceObject.getComponentContentById = function(nodeContent, componentId) {
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
            serviceObject.isWorkSubmitted = function(componentStates) {
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

            serviceObject.callFunction = function(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
                var result = null;

                if (functionName === 'isCompleted') {
                    result = this.isCompleted(functionParams);
                } else if (functionName === 'branchPathTaken') {
                    result = this.branchPathTaken(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents);
                }

                return result;
            };

            /**
             * Check if the node or component is completed
             * @param functionParams the params that will specify which node or component
             * to check for completion
             * @returns whether the specified node or component is completed
             */
            serviceObject.isCompleted = function(functionParams) {

                var result = false;

                if (functionParams != null) {
                    var nodeId = functionParams.nodeId;
                    var componentId = functionParams.componentId;

                    result = StudentDataService.isCompleted(nodeId, componentId);
                }

                return result;
            };

            serviceObject.branchPathTaken = function(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {

                var result = false;

                var expectedFromNodeId = null;
                var expectedToNodeId = null;

                if (node != null) {
                    expectedFromNodeId = node.id;
                }

                if (functionParams != null && functionParams.toNodeId != null) {
                    expectedToNodeId = functionParams.toNodeId;
                }

                if (nodeStates != null) {
                    for (var n = 0; n < nodeStates.length; n++) {
                        var nodeState = nodeStates[n];

                        if (nodeState != null) {
                            var studentData = nodeState.studentData;

                            if (studentData != null) {
                                var dataType = nodeState.dataType;

                                if (dataType != null && dataType === 'branchPathTaken') {

                                    var fromNodeId = studentData.fromNodeId;
                                    var toNodeId = studentData.toNodeId;

                                    if (expectedFromNodeId === fromNodeId &&
                                        expectedToNodeId === toNodeId) {
                                        result = true;
                                    }
                                }
                            }
                        }
                    }
                }

                return result;
            }

            /**
             * Go to the next node
             */
            serviceObject.goToNextNode = function() {

                var nextNodeId = this.getNextNodeId();
                if (nextNodeId != null) {
                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
                }
            };

            /**
             * Get the next node in the project sequence
             */
            serviceObject.getNextNodeId = function() {

                var nextNodeId = null;

                // get the current node
                var currentNode = StudentDataService.getCurrentNode();

                if (currentNode != null) {
                    var currentNodeId = currentNode.id;

                    // get the branch path node states
                    var branchPathNodeStates = StudentDataService.getBranchPathTakenNodeStates(currentNodeId);

                    if (branchPathNodeStates != null && branchPathNodeStates.length > 0) {

                        // loop through the branch path node states from newest to oldest
                        for (var b = branchPathNodeStates.length - 1; b >= 0; b--) {
                            var nodeState = branchPathNodeStates[b];

                            var studentData = nodeState.studentData;

                            if (studentData != null) {
                                // get the to node id for the node state
                                nextNodeId = studentData.toNodeId;
                            }
                        }
                    } else {
                        // get the transition logic from the current node
                        var transitions = ProjectService.getTransitionLogicByFromNodeId(currentNodeId);

                        // choose a transition
                        var transition = this.chooseTransition(transitions);

                        if (transition != null) {
                            // move the student to the toNodeId
                            nextNodeId = transition.to;
                        }
                    }
                }

                return nextNodeId;
            };

            /**
             * Go to the previous node
             */
            serviceObject.goToPrevNode = function() {

                var prevNodeId = this.getPrevNodeId();
                if (prevNodeId != null) {
                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
                }
            };

            /**
             * Get the previous node in the project sequence
             */
            serviceObject.getPrevNodeId = function() {

                var prevNodeId = null;

                // get the current node
                var currentNode = StudentDataService.getCurrentNode();

                if (currentNode != null) {

                    var currentNodeId = currentNode.id;

                    var transitions = ProjectService.getTransitionsByToNodeId(currentNodeId);

                    if (transitions != null && transitions.length === 1) {
                        // TODO: remove this if case, as transition.from has been deprecated
                        var transition = transitions[0];

                        if (transition != null) {
                            prevNodeId = transition.from;
                        }
                    } else {
                        var currentNodePos = ProjectService.getOrderById(currentNode.id);
                        var previousPos = currentNodePos-1;
                        if(previousPos > 0) {
                            prevNodeId = ProjectService.getIdByOrder(previousPos);
                        }
                    }
                }

                return prevNodeId;
            };

            /**
             * Close the current node (and open the current node's parent group)
             */
            serviceObject.closeNode = function() {
                var currentNode = StudentDataService.getCurrentNode();
                if (currentNode) {

                    var currentNodeId = currentNode.id;

                    // get the parent node of the current node
                    var parentNode = ProjectService.getParentGroup(currentNodeId);

                    var parentNodeId = parentNode.id;

                    // set the current node to the parent node
                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
                }
            };

            /**
             * Choose the transition the student will take
             * @param transitionLogic an object containing transitions and parameters
             * for how to choose a transition
             * @returns a transition object
             */
            serviceObject.chooseTransition = function(transitionLogic) {
                var transitionResult = null;
                if (transitionLogic != null) {

                    // get the transitions
                    var transitions = transitionLogic.transitions;

                    if (transitions != null) {

                        var availableTransitions = [];

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
                                    tempResult = StudentDataService.evaluateCriteria(tempCriteria);

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

                        // there are available transitions for the student
                        if (availableTransitions.length > 0) {

                            var howToChooseAmongAvailablePaths = transitionLogic.howToChooseAmongAvailablePaths;

                            if (howToChooseAmongAvailablePaths == null || howToChooseAmongAvailablePaths === 'random') {
                                // choose a random transition

                                var randomIndex = Math.floor(Math.random() * availableTransitions.length);
                                transitionResult = availableTransitions[randomIndex];
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
                return transitionResult;
            };

            serviceObject.hasTransitionLogic = function() {
                var result = false;

                var currentNode = StudentDataService.getCurrentNode();

                if (currentNode != null) {
                    var transitionLogic = currentNode.transitionLogic;

                    if (transitionLogic != null) {
                        result = true;
                    }
                }

                return result;
            };

            serviceObject.evaluateTransitionLogic = function() {

                // get the current node
                var currentNode = StudentDataService.getCurrentNode();

                if (currentNode != null) {

                    var transitionLogic = currentNode.transitionLogic;

                    if (transitionLogic != null) {
                        //var whenToChoosePath = transitionLogic.whenToChoosePath;

                        //var nodeStates = StudentDataService.getNodeStatesByNodeId(currentNode.id);

                        var transitions = transitionLogic.transitions;
                        var canChangePath = transitionLogic.canChangePath;

                        var alreadyBranched = false;
                        var latestBranchNodeState = this.getLatestBranchNodeState(currentNode.id);

                        if (latestBranchNodeState != null) {
                            alreadyBranched = true;
                        }

                        var transition, fromeNodeId, toNodeId;

                        if (alreadyBranched) {
                            // student has previously branched

                            if (canChangePath) {
                                // student can change path

                                // choose a transition
                                transition = this.chooseTransition(transitionLogic);

                                if (transition != null) {
                                    fromNodeId = currentNode.id;
                                    toNodeId = transition.to;

                                    this.createBranchNodeState(fromNodeId, toNodeId);
                                }
                            } else {
                                // student can't change path

                            }

                        } else {
                            // student has not branched yet

                            // choose a transition
                            transition = this.chooseTransition(transitionLogic);

                            if (transition != null) {
                                fromNodeId = currentNode.id;
                                toNodeId = transition.to;

                                this.createBranchNodeState(fromNodeId, toNodeId);
                            }
                        }
                    }
                }
            };

            serviceObject.getBranchNodeStates = function() {
                var branchNodeStates = [];

                var nodeStates = StudentDataService.getNodeStatesByNodeId(currentNode.id);

                if (nodeStates != null) {
                    for (var n = 0; n < nodeStates.length; n++) {
                        var nodeState = nodeStates[n];

                        if (nodeState != null) {
                            var studentData = nodeState.studentData;

                            if (studentData != null) {
                                var dataType = studentData.dataType;

                                if (dataType != null && dataType === 'branchPathTaken') {
                                    branchNodeStates.push(nodeState);
                                }
                            }
                        }
                    }
                }

                return branchNodeStates;
            };

            serviceObject.createBranchNodeState = function(fromNodeId, toNodeId) {

                if (fromNodeId != null && toNodeId != null) {

                    // create a new node state
                    var nodeState = this.createNewNodeState();
                    nodeState.runId = ConfigService.getRunId();
                    nodeState.periodId = ConfigService.getPeriodId();
                    nodeState.workgroupId = ConfigService.getWorkgroupId();
                    nodeState.nodeId = fromNodeId;
                    nodeState.isAutoSave = false;
                    nodeState.isSubmit = false;

                    var studentData = {};
                    studentData.dataType = 'branchPathTaken';
                    studentData.fromNodeId = fromNodeId;
                    studentData.toNodeId = toNodeId;

                    nodeState.studentData = studentData;
                    var nodeStates = [];
                    nodeStates.push(nodeState);
                    StudentDataService.saveNodeStates(nodeStates);
                }
            };

            /**
             * Get the latest branch node state for given nodeId
             */
            serviceObject.getLatestBranchNodeState = function(nodeId) {

                var latestBranchNodeState = null;

                var nodeStates = StudentDataService.getNodeStatesByNodeId(nodeId);

                if (nodeStates != null) {
                    for (var n = nodeStates.length - 1; n >= 0; n--) {
                        var nodeState = nodeStates[n];

                        if (nodeState != null) {
                            var studentData = nodeState.studentData;

                            if (studentData != null) {
                                var dataType = studentData.dataType;

                                if (dataType != null && dataType === 'branchPathTaken') {
                                    latestBranchNodeState = nodeState;
                                }
                            }
                        }
                    }
                }

                return latestBranchNodeState;
            };

            serviceObject.evaluateTransitionLogicOn = function(event) {

                var result = false;

                // get the current node
                var currentNode = StudentDataService.getCurrentNode();

                if (currentNode != null) {
                    var transitionLogic = currentNode.transitionLogic;

                    var whenToChoosePath = transitionLogic.whenToChoosePath;

                    if (event === whenToChoosePath) {
                        result = true;
                    }
                }

                return result;
            };

            return serviceObject;
        }];

    return service;
});