'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeService = function () {
    function NodeService($http, $injector, $q, ConfigService, ProjectService, StudentDataService) {
        _classCallCheck(this, NodeService);

        this.$http = $http;
        this.$injector = $injector;
        this.$q = $q;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
    }

    _createClass(NodeService, [{
        key: 'getLatestNodeState',
        value: function getLatestNodeState(nodeVisits) {
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
        }
    }, {
        key: 'getStudentWorkAsHTML',
        value: function getStudentWorkAsHTML(nodeState) {
            var studentWorkAsHTML = null;

            if (nodeState != null) {
                var response = nodeState.response;

                studentWorkAsHTML = '<p>' + response + '</p>';
            }

            return studentWorkAsHTML;
        }
    }, {
        key: 'createNewComponentState',


        /**
         * Create a new empty node state
         * @return a new empty node state
         */
        value: function createNewComponentState() {
            var componentState = {};

            // set the timestamp
            componentState.clientSaveTime = Date.parse(new Date());

            return componentState;
        }
    }, {
        key: 'createNewNodeState',


        /**
         * Create a new empty node state
         * @return a new empty node state
         */
        value: function createNewNodeState() {
            var nodeState = {};

            // set the timestamp
            nodeState.clientSaveTime = Date.parse(new Date());

            return nodeState;
        }
    }, {
        key: 'toCamelCase',


        /**
         * Get the node type in camel case
         * @param nodeType the node type e.g. OpenResponse
         * @return the node type in camel case
         * e.g.
         * openResponse
         */
        value: function toCamelCase(nodeType) {
            var nodeTypeCamelCased = null;

            if (nodeType != null && nodeType.length > 0) {

                // get the first character
                var firstChar = nodeType.charAt(0);

                if (firstChar != null) {

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
        }
    }, {
        key: 'isStringUpperCase',


        /**
         * Check if the string is in all uppercase
         * @param str the string to check
         * @return whether the string is in all uppercase
         */
        value: function isStringUpperCase(str) {
            var result = false;

            if (str != null) {
                if (str === str.toUpperCase()) {
                    // the string is in all uppercase
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'getComponentTemplatePath',


        /**
         * Get the html template for the component
         * @param componentType the component type
         * @return the path to the html template for the component
         */
        value: function getComponentTemplatePath(componentType) {

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
            var wiseBaseURL = this.ConfigService.getConfigParam('wiseBaseURL');
            return wiseBaseURL + '/wise5/components/' + componentType + '/index.html';
        }
    }, {
        key: 'getComponentContentById',


        /**
         * Get the component content
         * @param componentContent the component content
         * @param componentId the component id
         * @return the component content
         */
        value: function getComponentContentById(nodeContent, componentId) {
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
        }
    }, {
        key: 'isWorkSubmitted',


        /**
         * Check if any of the component states were submitted
         * @param componentStates an array of component states
         * @return whether any of the component states were submitted
         */
        value: function isWorkSubmitted(componentStates) {
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
        }
    }, {
        key: 'callFunction',
        value: function callFunction(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;

            if (functionName === 'isCompleted') {
                result = this.isCompleted(functionParams);
            } else if (functionName === 'branchPathTaken') {
                result = this.branchPathTaken(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents);
            }

            return result;
        }
    }, {
        key: 'isCompleted',


        /**
         * Check if the node or component is completed
         * @param functionParams the params that will specify which node or component
         * to check for completion
         * @returns whether the specified node or component is completed
         */
        value: function isCompleted(functionParams) {

            var result = false;

            if (functionParams != null) {
                var nodeId = functionParams.nodeId;
                var componentId = functionParams.componentId;

                result = this.StudentDataService.isCompleted(nodeId, componentId);
            }

            return result;
        }
    }, {
        key: 'branchPathTaken',
        value: function branchPathTaken(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {

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

                                if (expectedFromNodeId === fromNodeId && expectedToNodeId === toNodeId) {
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

    }, {
        key: 'goToNextNode',
        value: function goToNextNode() {

            var nextNodeId = this.getNextNodeId();
            if (nextNodeId != null) {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId);
            }
        }
    }, {
        key: 'getNextNodeId',


        /**
         * Get the next node in the project sequence
         */
        value: function getNextNodeId() {

            var nextNodeId = null;

            // get the current node
            var currentNode = this.StudentDataService.getCurrentNode();

            if (currentNode != null) {
                var currentNodeId = currentNode.id;

                // get the branch path node states
                var branchPathNodeStates = this.StudentDataService.getBranchPathTakenNodeStates(currentNodeId);

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
                    var transitions = this.ProjectService.getTransitionLogicByFromNodeId(currentNodeId);

                    // choose a transition
                    var transition = this.chooseTransition(transitions);

                    if (transition != null) {
                        // move the student to the toNodeId
                        nextNodeId = transition.to;
                    }
                }
            }

            return nextNodeId;
        }
    }, {
        key: 'goToPrevNode',


        /**
         * Go to the previous node
         */
        value: function goToPrevNode() {

            var prevNodeId = this.getPrevNodeId();
            if (prevNodeId != null) {
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(prevNodeId);
            }
        }
    }, {
        key: 'getPrevNodeId',


        /**
         * Get the previous node in the project sequence
         */
        value: function getPrevNodeId() {

            var prevNodeId = null;

            // get the current node
            var currentNode = this.StudentDataService.getCurrentNode();

            if (currentNode != null) {

                var currentNodeId = currentNode.id;

                var transitions = this.ProjectService.getTransitionsByToNodeId(currentNodeId);

                if (transitions != null && transitions.length === 1) {
                    // TODO: remove this if case, as transition.from has been deprecated
                    var transition = transitions[0];

                    if (transition != null) {
                        prevNodeId = transition.from;
                    }
                } else {
                    var currentNodePos = this.ProjectService.getOrderById(currentNode.id);
                    var previousPos = currentNodePos - 1;
                    if (previousPos > 0) {
                        prevNodeId = this.ProjectService.getIdByOrder(previousPos);
                    }
                }
            }

            return prevNodeId;
        }
    }, {
        key: 'closeNode',


        /**
         * Close the current node (and open the current node's parent group)
         */
        value: function closeNode() {
            var currentNode = this.StudentDataService.getCurrentNode();
            if (currentNode) {

                var currentNodeId = currentNode.id;

                // get the parent node of the current node
                var parentNode = this.ProjectService.getParentGroup(currentNodeId);

                var parentNodeId = parentNode.id;

                // set the current node to the parent node
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(parentNodeId);
            }
        }
    }, {
        key: 'chooseTransition',


        /**
         * Choose the transition the student will take
         * @param transitionLogic an object containing transitions and parameters
         * for how to choose a transition
         * @returns a transition object
         */
        value: function chooseTransition(transitionLogic) {
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
        }
    }, {
        key: 'hasTransitionLogic',
        value: function hasTransitionLogic() {
            var result = false;

            var currentNode = this.StudentDataService.getCurrentNode();

            if (currentNode != null) {
                var transitionLogic = currentNode.transitionLogic;

                if (transitionLogic != null) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'evaluateTransitionLogic',
        value: function evaluateTransitionLogic() {

            // get the current node
            var currentNode = this.StudentDataService.getCurrentNode();

            if (currentNode != null) {

                var transitionLogic = currentNode.transitionLogic;

                if (transitionLogic != null) {
                    //var whenToChoosePath = transitionLogic.whenToChoosePath;

                    //var nodeStates = this.StudentDataService.getNodeStatesByNodeId(currentNode.id);

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
        }
    }, {
        key: 'getBranchNodeStates',
        value: function getBranchNodeStates() {
            var branchNodeStates = [];

            var nodeStates = this.StudentDataService.getNodeStatesByNodeId(currentNode.id);

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
        }
    }, {
        key: 'createBranchNodeState',
        value: function createBranchNodeState(fromNodeId, toNodeId) {

            if (fromNodeId != null && toNodeId != null) {

                // create a new node state
                var nodeState = this.createNewNodeState();
                nodeState.runId = this.ConfigService.getRunId();
                nodeState.periodId = this.ConfigService.getPeriodId();
                nodeState.workgroupId = this.ConfigService.getWorkgroupId();
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
                this.StudentDataService.saveNodeStates(nodeStates);
            }
        }
    }, {
        key: 'getLatestBranchNodeState',


        /**
         * Get the latest branch node state for given nodeId
         */
        value: function getLatestBranchNodeState(nodeId) {

            var latestBranchNodeState = null;

            var nodeStates = this.StudentDataService.getNodeStatesByNodeId(nodeId);

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
        }
    }, {
        key: 'evaluateTransitionLogicOn',
        value: function evaluateTransitionLogicOn(event) {

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
        }
    }]);

    return NodeService;
}();

NodeService.$inject = ['$http', '$injector', '$q', 'ConfigService', 'ProjectService', 'StudentDataService'];

exports.default = NodeService;
//# sourceMappingURL=nodeService.js.map