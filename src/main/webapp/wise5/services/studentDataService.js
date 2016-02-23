'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentDataService = function () {
    function StudentDataService($http, $injector, $q, $rootScope, AnnotationService, ConfigService, ProjectService, UtilService) {
        _classCallCheck(this, StudentDataService);

        this.$http = $http;
        this.$injector = $injector;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;

        this.currentNode = null;
        this.previousStep = null;
        this.studentData = null;
        this.stackHistory = []; // array of node id's
        this.visitedNodesHistory = [];
        this.nodeStatuses = {};
    }

    _createClass(StudentDataService, [{
        key: 'retrieveStudentData',
        value: function retrieveStudentData() {
            var _this = this;

            // get the mode
            var mode = this.ConfigService.getConfigParam('mode');

            if (mode === 'preview') {
                // we are previewing the project

                // initialize dummy student data
                this.studentData = {};
                this.studentData.componentStates = [];
                this.studentData.events = [];
                this.studentData.userName = 'Preview Student';
                this.studentData.userId = '0';

                // populate the student history
                this.populateHistories(this.studentData.componentStates);

                // update the node statuses
                this.updateNodeStatuses();
            } else {
                // we are in a run

                // get the url to get the student data
                var studentDataURL = this.ConfigService.getConfigParam('studentDataURL');

                var httpParams = {};
                httpParams.method = 'GET';
                httpParams.url = studentDataURL;

                // set the workgroup id and run id
                var params = {};
                params.workgroupId = this.ConfigService.getWorkgroupId();
                params.runId = this.ConfigService.getRunId();
                params.getStudentWork = true;
                params.getEvents = true;
                params.getAnnotations = true;
                params.toWorkgroupId = this.ConfigService.getWorkgroupId();
                httpParams.params = params;

                // make the request for the student data
                return this.$http(httpParams).then(function (result) {
                    var resultData = result.data;
                    if (resultData != null) {

                        _this.studentData = {};

                        // get student work
                        _this.studentData.componentStates = [];
                        _this.studentData.nodeStates = [];
                        var studentWorkList = resultData.studentWorkList;
                        for (var s = 0; s < studentWorkList.length; s++) {
                            var studentWork = studentWorkList[s];
                            if (studentWork.componentId != null) {
                                _this.studentData.componentStates.push(studentWork);
                            } else {
                                _this.studentData.nodeStates.push(studentWork);
                            }
                        }

                        // get events
                        _this.studentData.events = resultData.events;

                        // get annotations
                        _this.studentData.annotations = resultData.annotations;

                        _this.AnnotationService.setAnnotations(_this.studentData.annotations);

                        // load the student planning nodes
                        //this.loadStudentNodes();

                        // TODO
                        // populate the student history
                        _this.populateHistories(_this.studentData.componentStates, _this.studentData.events);

                        // TODO
                        // update the node statuses
                        _this.updateNodeStatuses();
                    }

                    return _this.studentData;
                });
            }
        }
    }, {
        key: 'loadStudentNodes',
        value: function loadStudentNodes() {
            var nodes = this.ProjectService.applicationNodes;

            if (nodes != null) {
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];

                    if (node != null) {
                        if (node.type === 'Planning') {
                            var nodeId = node.id;

                            var latestNodeState = this.getLatestNodeStateByNodeId(nodeId);

                            if (latestNodeState != null) {
                                var latestStateStudentNodes = latestNodeState.studentNodes;
                                var latestTransitions = latestNodeState.studentTransition;

                                this.ProjectService.loadNodes(latestStateStudentNodes);
                                this.ProjectService.loadTransitions(latestTransitions);
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: 'getNodeStatuses',
        value: function getNodeStatuses() {
            return this.nodeStatuses;
        }
    }, {
        key: 'setNodeStatusByNodeId',
        value: function setNodeStatusByNodeId(nodeId, nodeStatus) {

            if (nodeId != null && nodeStatus != null) {
                var nodeStatuses = this.nodeStatuses;

                if (nodeStatuses != null) {
                    nodeStatuses[nodeId] = nodeStatus;
                }
            }
        }
    }, {
        key: 'getNodeStatusByNodeId',
        value: function getNodeStatusByNodeId(nodeId) {
            var nodeStatus = null;

            var nodeStatuses = this.nodeStatuses;

            if (nodeId != null && nodeStatuses != null) {
                nodeStatus = nodeStatuses[nodeId];
            }

            return nodeStatus;
        }
    }, {
        key: 'updateNodeStatuses',
        value: function updateNodeStatuses() {
            //this.nodeStatuses = [];

            var nodes = this.ProjectService.getNodes();
            var groups = this.ProjectService.getGroups();

            if (nodes != null) {

                //var nodeStatuses = [];

                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    if (!this.ProjectService.isGroupNode(node.id)) {
                        this.updateNodeStatusByNode(node);
                    }

                    //var nodeStatusesByNode = this.updateNodeStatusByNode(node);
                    //nodeStatuses.push(nodeStatusesByNode);
                    //console.log(nodeStatusesByNode);
                }

                //this.nodeStatuses = nodeStatuses;
            }

            var group;
            if (groups != null) {
                for (var g = 0; g < groups.length; g++) {
                    group = groups[g];
                    group.depth = this.ProjectService.getNodeDepth(group.id);
                }

                // sort by descending depth order (need to calculate completion for lowest level groups first)
                groups.sort(function (a, b) {
                    return b.depth - a.depth;
                });

                for (var i = 0; i < groups.length; i++) {
                    group = groups[i];
                    this.updateNodeStatusByNode(group);
                }
            }

            this.$rootScope.$broadcast('nodeStatusesChanged');
        }
    }, {
        key: 'updateNodeStatusByNode',
        value: function updateNodeStatusByNode(node) {

            if (node != null) {
                var nodeId = node.id;

                var tempNodeStatus = {};
                tempNodeStatus.nodeId = nodeId;
                tempNodeStatus.isVisitable = true;
                tempNodeStatus.isCompleted = true;

                // get the constraints that affect this node
                var constraintsForNode = this.ProjectService.getConstraintsForNode(node);

                if (constraintsForNode == null || constraintsForNode.length == 0) {
                    // this node does not have any constraints so it is clickable
                    tempNodeStatus.isVisible = true;
                    tempNodeStatus.isVisitable = true;
                } else {

                    var isVisibleResults = [];
                    var isVisitableResults = [];

                    var result = false;
                    var firstResult = true;

                    // loop through all the constraints that affect this node
                    for (var c = 0; c < constraintsForNode.length; c++) {
                        var constraintForNode = constraintsForNode[c];

                        if (constraintForNode != null) {

                            // evaluate the constraint to see if the node can be visited
                            var tempResult = this.evaluateConstraint(node, constraintForNode);

                            /*
                             if (firstResult) {
                             // this is the first constraint in this for loop
                             result = tempResult;
                             firstResult = false;
                             } else {
                             // this is not the first constraint in this for loop so we will && the result
                             result = result && tempResult;
                             }
                             */

                            var action = constraintForNode.action;

                            if (action != null) {
                                if (action === 'makeThisNodeNotVisible') {
                                    isVisibleResults.push(tempResult);
                                } else if (action === 'makeThisNodeNotVisitable') {
                                    isVisitableResults.push(tempResult);
                                } else if (action === 'makeAllNodesAfterThisNotVisible') {
                                    isVisibleResults.push(tempResult);
                                } else if (action === 'makeAllNodesAfterThisNotVisitable') {
                                    isVisitableResults.push(tempResult);
                                } else if (action === 'makeAllOtherNodesNotVisible') {
                                    isVisibleResults.push(tempResult);
                                } else if (action === 'makeAllOtherNodesNotVisitable') {
                                    isVisitableResults.push(tempResult);
                                }
                            }
                        }
                    }

                    var isVisible = true;
                    var isVisitable = true;

                    for (var a = 0; a < isVisibleResults.length; a++) {
                        var isVisibleResult = isVisibleResults[a];

                        isVisible = isVisible && isVisibleResult;
                    }

                    for (var b = 0; b < isVisitableResults.length; b++) {
                        var isVisitableResult = isVisitableResults[b];

                        isVisitable = isVisitable && isVisitableResult;
                    }

                    tempNodeStatus.isVisible = isVisible;
                    tempNodeStatus.isVisitable = isVisitable;
                }

                tempNodeStatus.isCompleted = this.isCompleted(nodeId);
                tempNodeStatus.isVisited = this.isNodeVisited(nodeId);

                var nodeStatus = this.getNodeStatusByNodeId(nodeId);

                if (nodeStatus == null) {
                    this.setNodeStatusByNodeId(nodeId, tempNodeStatus);
                } else {
                    this.nodeStatuses[nodeId].isVisited = tempNodeStatus.isVisited;
                    this.nodeStatuses[nodeId].isVisible = tempNodeStatus.isVisible;
                    this.nodeStatuses[nodeId].isVisitable = tempNodeStatus.isVisitable;
                    this.nodeStatuses[nodeId].isCompleted = tempNodeStatus.isCompleted;
                }

                this.nodeStatuses[nodeId].progress = this.getNodeProgressById(nodeId);
                this.nodeStatuses[nodeId].icon = this.ProjectService.getNodeIconByNodeId(nodeId);

                //console.log(angular.toJson(tempNodeStatus));
            }

            //return nodeStatus;
        }
    }, {
        key: 'evaluateConstraint',

        /**
         * Evaluate the constraint
         * @param node the node
         * @param constraintForNode the constraint object
         * @returns whether the node has satisfied the constraint
         */
        value: function evaluateConstraint(node, constraintForNode) {
            var result = false;

            if (constraintForNode != null) {

                var removalCriteria = constraintForNode.removalCriteria;

                if (removalCriteria != null) {
                    result = this.evaluateNodeConstraint(node, constraintForNode);
                }
            }

            return result;
        }
    }, {
        key: 'evaluateGuidedNavigationConstraint',

        /**
         * Evaluate the guided navigation constraint
         * @param node the node
         * @param constraintForNode the constraint object
         * @returns whether the node can be visited or not
         */
        value: function evaluateGuidedNavigationConstraint(node, constraintForNode) {

            var result = false;

            if (node != null) {
                var nodeId = node.id;

                if (this.isNodeVisited(nodeId)) {
                    // the node has been visited before so it should be clickable
                    result = true;
                } else {

                    // get all the nodes that have been visited
                    var visitedNodes = this.getVisitedNodesHistory();

                    var transitionsToNodeId = [];

                    // loop through all the ndoes that have been visited
                    for (var v = 0; v < visitedNodes.length; v++) {
                        var visitedNodeId = visitedNodes[v];

                        // get the transitions from the visited node to the node status node
                        var transitions = this.ProjectService.getTransitionsByFromAndToNodeId(visitedNodeId, nodeId);

                        // TODO: check if the transition can be used by the student

                        // concat the node ids
                        transitionsToNodeId = transitionsToNodeId.concat(transitions);
                    }

                    if (transitionsToNodeId != null && transitionsToNodeId.length > 0) {
                        // there is a transition between the current node and the node status node

                        /*
                         * there are transitions from the current node to the node status node so
                         * the node status node is clickable
                         */
                        result = true;
                    } else {
                        /*
                         * there is no transition between the visited nodes and the node status node
                         * so we will set the node to be not clickable
                         */
                        result = false;
                    }

                    if (this.ProjectService.isStartNode(node)) {
                        /*
                         * the node is the start node of the project or a start node of a group
                         * so we will make it clickable
                         */
                        result = true;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'evaluateNodeConstraint',

        /**
         * Evaluate the node constraint
         * @param node the node
         * @param constraintForNode the constraint object
         * @returns whether the node satisifies the constraint
         */
        value: function evaluateNodeConstraint(node, constraintForNode) {
            var result = false;

            if (constraintForNode != null) {
                var removalCriteria = constraintForNode.removalCriteria;

                if (removalCriteria == null) {
                    result = true;
                } else {
                    var firstResult = true;

                    // loop through all the criteria that need to be satisifed
                    for (var c = 0; c < removalCriteria.length; c++) {

                        // get a criteria
                        var tempCriteria = removalCriteria[c];

                        if (tempCriteria != null) {

                            // evaluate the criteria
                            var tempResult = this.evaluateCriteria(tempCriteria);

                            if (firstResult) {
                                // this is the first criteria in this for loop
                                result = tempResult;
                                firstResult = false;
                            } else {
                                // this is not the first criteria in this for loop so we will && the result
                                result = result && tempResult;
                            }
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'evaluateCriteria',

        /**
         * Evaluate the criteria
         * @param criteria the criteria
         * @returns whether the criteria is satisfied or not
         */
        value: function evaluateCriteria(criteria) {

            var result = false;

            if (criteria != null) {
                //var nodeId = criteria.nodeId;
                //var componentId = criteria.componentId;
                var functionName = criteria.functionName;

                if (functionName == null) {} else if (functionName === 'branchPathTaken') {
                    result = this.evaluateBranchPathTakenCriteria(criteria);
                } else if (functionName === 'isVisible') {} else if (functionName === 'isVisitable') {} else if (functionName === 'isVisited') {} else if (functionName === 'isComplete') {} else if (functionName === 'isCorrect') {} else if (functionName === 'choiceChosen') {
                    result = this.evaluateChoiceChosenCriteria(criteria);
                } else if (functionName === '') {}
            }

            return result;
        }
    }, {
        key: 'evaluateBranchPathTakenCriteria',
        value: function evaluateBranchPathTakenCriteria(criteria) {
            var result = false;

            if (criteria != null) {
                var expectedFromNodeId = criteria.fromNodeId;
                var expectedToNodeId = criteria.toNodeId;

                // get the node states
                var nodeStates = this.getBranchPathTakenNodeStates(expectedFromNodeId);

                if (nodeStates != null) {
                    for (var n = 0; n < nodeStates.length; n++) {
                        var nodeState = nodeStates[n];

                        if (nodeState != null) {
                            var studentData = nodeState.studentData;

                            if (studentData != null) {
                                var dataType = studentData.dataType;

                                if (dataType != null && dataType === 'branchPathTaken') {

                                    var tempFromNodeId = studentData.fromNodeId;
                                    var tempToNodeId = studentData.toNodeId;

                                    if (expectedFromNodeId === tempFromNodeId && expectedToNodeId === tempToNodeId) {
                                        result = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'getBranchPathTakenNodeStates',
        value: function getBranchPathTakenNodeStates(fromNodeId) {

            var branchpathTakenNodeStates = [];

            // get the node states
            var nodeStatesFromNodeId = this.getNodeStatesByNodeId(fromNodeId);

            if (nodeStatesFromNodeId != null) {
                for (var n = 0; n < nodeStatesFromNodeId.length; n++) {
                    var nodeState = nodeStatesFromNodeId[n];

                    if (nodeState != null) {
                        var studentData = nodeState.studentData;

                        if (studentData != null) {
                            var dataType = studentData.dataType;

                            if (dataType != null && dataType === 'branchPathTaken') {

                                branchpathTakenNodeStates.push(nodeState);
                            }
                        }
                    }
                }
            }

            return branchpathTakenNodeStates;
        }
    }, {
        key: 'evaluateChoiceChosenCriteria',

        /**
         * Evaluate the choice chosen criteria
         * @param criteria the criteria to evaluate
         * @returns a boolena value whether the criteria was satisfied or not
         */
        value: function evaluateChoiceChosenCriteria(criteria) {

            var result = false;

            var serviceName = 'MultipleChoiceService';

            if (this.$injector.has(serviceName)) {

                // get the MultipleChoiceService
                var service = this.$injector.get(serviceName);

                // check if the criteria was satisfied
                result = service.choiceChosen(criteria);
            }

            return result;
        }
    }, {
        key: 'populateHistories',

        /**
         * Populate the stack history and visited nodes history
         * @param componentStates the component states
         * @param events the events
         */
        value: function populateHistories(componentStates, events) {
            this.stackHistory = [];
            this.visitedNodesHistory = [];

            if (componentStates != null) {

                // loop through all the component state
                for (var i = 0; i < componentStates.length; i++) {

                    var componentState = componentStates[i];

                    if (componentState != null) {
                        var componentStateNodeId = componentState.nodeId;
                        this.updateStackHistory(componentStateNodeId);
                        this.updateVisitedNodesHistory(componentStateNodeId);
                    }
                }
            }

            if (events != null) {

                // loop through all the events
                for (var e = 0; e < events.length; e++) {
                    var event = events[e];

                    if (event != null) {

                        // look for the nodeEntered event
                        if (event.event === 'nodeEntered') {

                            // the student has visited this node id before
                            this.updateVisitedNodesHistory(event.nodeId);
                        }
                    }
                }
            }
        }
    }, {
        key: 'getStackHistoryAtIndex',
        value: function getStackHistoryAtIndex(index) {
            if (index < 0) {
                index = this.stackHistory.length + index;
            }
            var stackHistoryResult = null;
            if (this.stackHistory != null && this.stackHistory.length > 0) {
                stackHistoryResult = this.stackHistory[index];
            }
            return stackHistoryResult;
        }
    }, {
        key: 'getStackHistory',
        value: function getStackHistory() {
            return this.stackHistory;
        }
    }, {
        key: 'updateStackHistory',
        value: function updateStackHistory(nodeId) {
            var indexOfNodeId = this.stackHistory.indexOf(nodeId);
            if (indexOfNodeId === -1) {
                this.stackHistory.push(nodeId);
            } else {
                this.stackHistory.splice(indexOfNodeId + 1, this.stackHistory.length);
            }
        }
    }, {
        key: 'updateVisitedNodesHistory',
        value: function updateVisitedNodesHistory(nodeId) {
            var indexOfNodeId = this.visitedNodesHistory.indexOf(nodeId);
            if (indexOfNodeId === -1) {
                this.visitedNodesHistory.push(nodeId);
            }
        }
    }, {
        key: 'getVisitedNodesHistory',
        value: function getVisitedNodesHistory() {
            return this.visitedNodesHistory;
        }
    }, {
        key: 'isNodeVisited',
        value: function isNodeVisited(nodeId) {
            var result = false;
            var visitedNodesHistory = this.visitedNodesHistory;

            if (visitedNodesHistory != null) {
                var indexOfNodeId = visitedNodesHistory.indexOf(nodeId);

                if (indexOfNodeId !== -1) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'getLatestStudentWorkForNodeAsHTML',
        value: function getLatestStudentWorkForNodeAsHTML(nodeId) {
            var studentWorkAsHTML = null;

            var node = this.ProjectService.getNodeById(nodeId);

            if (node != null) {
                //var nodeType = node.type;
                //var latestNodeState = this.getLatestNodeStateByNodeId(nodeId);

                // TODO: make this dynamically call the correct {{nodeType}}Service
                if (nodeType === 'OpenResponse') {
                    //studentWorkAsHTML = OpenResponseService.getStudentWorkAsHTML(latestNodeState);
                }
            }

            return studentWorkAsHTML;
        }
    }, {
        key: 'createComponentState',
        value: function createComponentState() {
            var componentState = {};

            componentState.timestamp = Date.parse(new Date());

            return componentState;
        }
    }, {
        key: 'addComponentState',
        value: function addComponentState(componentState) {
            if (this.studentData != null && this.studentData.componentStates != null) {
                this.studentData.componentStates.push(componentState);

                this.updateNodeStatuses();
            }
        }
    }, {
        key: 'addNodeState',
        value: function addNodeState(nodeState) {
            if (this.studentData != null && this.studentData.nodeStates != null) {
                this.studentData.nodeStates.push(nodeState);

                this.updateNodeStatuses();
            }
        }
    }, {
        key: 'getNodeStatesByNodeId',
        value: function getNodeStatesByNodeId(nodeId) {
            var nodeStatesByNodeId = [];

            if (this.studentData != null && this.studentData.nodeStates != null) {
                var nodeStates = this.studentData.nodeStates;

                for (var n = 0; n < nodeStates.length; n++) {
                    var nodeState = nodeStates[n];

                    if (nodeState != null) {
                        var tempNodeId = nodeState.nodeId;

                        if (nodeId === tempNodeId) {
                            nodeStatesByNodeId.push(nodeState);
                        }
                    }
                }
            }

            return nodeStatesByNodeId;
        }
    }, {
        key: 'addEvent',
        value: function addEvent(event) {
            if (this.studentData != null && this.studentData.events != null) {
                this.studentData.events.push(event);
            }
        }
    }, {
        key: 'addAnnotation',
        value: function addAnnotation(annotation) {
            if (this.studentData != null && this.studentData.annotations != null) {
                this.studentData.annotations.push(annotation);
            }
        }
    }, {
        key: 'saveComponentEvent',
        value: function saveComponentEvent(component, category, event, data) {
            if (component == null || category == null || event == null) {
                alert("StudentDataService.saveComponentEvent: component, category, event args must not be null");
                return;
            }
            var context = "Component";
            var nodeId = component.nodeId;
            var componentId = component.componentId;
            var componentType = component.componentType;
            if (nodeId == null || componentId == null || componentType == null) {
                alert("StudentDataService.saveComponentEvent: nodeId, componentId, componentType must not be null");
                return;
            }
            this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
        }
    }, {
        key: 'saveVLEEvent',
        value: function saveVLEEvent(nodeId, componentId, componentType, category, event, data) {
            if (category == null || event == null) {
                alert("StudentDataService.saveVLEEvent: category and event args must not be null");
                return;
            }
            var context = "VLE";
            this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
        }
    }, {
        key: 'saveEvent',
        value: function saveEvent(context, nodeId, componentId, componentType, category, event, data) {
            var events = [];
            var newEvent = this.createNewEvent();
            newEvent.context = context;
            newEvent.nodeId = nodeId;
            newEvent.componentId = componentId;
            newEvent.type = componentType;
            newEvent.category = category;
            newEvent.event = event;
            newEvent.data = data;
            events.push(newEvent);
            var componentStates = null;
            var nodeStates = null;
            var annotations = null;
            this.saveToServer(componentStates, nodeStates, events, annotations);
        }
    }, {
        key: 'createNewEvent',

        /**
         * Create a new empty event
         * @return a new empty event
         */
        value: function createNewEvent() {
            var event = {};

            event.runId = this.ConfigService.getRunId();
            event.periodId = this.ConfigService.getPeriodId();
            event.workgroupId = this.ConfigService.getWorkgroupId();
            event.clientSaveTime = Date.parse(new Date());

            return event;
        }
    }, {
        key: 'saveNodeStates',
        value: function saveNodeStates(nodeStates) {
            var componentStates = null;
            var events = null;
            var annotations = null;
            this.saveToServer(componentStates, nodeStates, events, annotations);
        }
    }, {
        key: 'saveAnnotations',
        value: function saveAnnotations(annotations) {
            var componentStates = null;
            var nodeStates = null;
            var events = null;
            this.saveToServer(componentStates, nodeStates, events, annotations);
        }
    }, {
        key: 'saveToServer',
        value: function saveToServer(componentStates, nodeStates, events, annotations) {
            var _this2 = this;

            // merge componentStates and nodeStates into StudentWork before posting
            var studentWorkList = [];
            if (componentStates != null && componentStates.length > 0) {
                for (var c = 0; c < componentStates.length; c++) {
                    var componentState = componentStates[c];

                    if (componentState != null) {
                        componentState.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved componentStates.
                        this.addComponentState(componentState);
                        studentWorkList.push(componentState);
                    }
                }
            }

            if (nodeStates != null && nodeStates.length > 0) {
                for (var n = 0; n < nodeStates.length; n++) {
                    var nodeState = nodeStates[n];

                    if (nodeState != null) {
                        nodeState.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved componentStates.
                        this.addNodeState(nodeState);
                        studentWorkList.push(nodeState);
                    }
                }
            }

            if (events != null && events.length > 0) {
                for (var e = 0; e < events.length; e++) {
                    var event = events[e];

                    if (event != null) {
                        event.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved events.
                        this.addEvent(event);
                    }
                }
            } else {
                events = [];
            }

            if (annotations != null && annotations.length > 0) {
                for (var a = 0; a < annotations.length; a++) {
                    var annotation = annotations[a];

                    if (annotation != null) {
                        annotation.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved annotations.
                        this.addAnnotation(annotation);
                    }
                }
            } else {
                annotations = [];
            }

            if (this.ConfigService.getConfigParam('mode') === 'preview') {
                // if we're in preview mode, don't make any request to the server
                return;
            }

            // get the url to POST the student data
            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = this.ConfigService.getConfigParam('studentDataURL');
            httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

            // set the workgroup id and run id
            var params = {};
            params.runId = this.ConfigService.getRunId();
            params.workgroupId = this.ConfigService.getWorkgroupId();
            params.studentWorkList = angular.toJson(studentWorkList);
            params.events = angular.toJson(events);
            params.annotations = angular.toJson(annotations);
            httpParams.data = $.param(params);

            // make the request to post the student data
            return this.$http(httpParams).then(function (result) {
                // get the local references to the component states that were posted and set their id and serverSaveTime
                if (result != null && result.data != null) {

                    var savedStudentDataResponse = result.data;

                    // handle saved studentWork
                    if (savedStudentDataResponse.studentWorkList != null) {
                        var savedStudentWorkList = savedStudentDataResponse.studentWorkList;

                        var localStudentWorkList = _this2.studentData.componentStates.concat(_this2.studentData.nodeStates);

                        // set the id and serverSaveTime in the local studentWorkList
                        for (var i = 0; i < savedStudentWorkList.length; i++) {
                            var savedStudentWork = savedStudentWorkList[i];

                            /*
                             * loop through all the student work that were posted
                             * to find the one with the matching request token
                             */
                            for (var l = localStudentWorkList.length - 1; l >= 0; l--) {
                                var localStudentWork = localStudentWorkList[l];
                                if (localStudentWork.requestToken != null && localStudentWork.requestToken === savedStudentWork.requestToken) {
                                    localStudentWork.id = savedStudentWork.id;
                                    localStudentWork.serverSaveTime = savedStudentWork.serverSaveTime;
                                    localStudentWork.requestToken = null; // requestToken is no longer needed.

                                    _this2.$rootScope.$broadcast('studentWorkSavedToServer', { studentWork: localStudentWork });
                                    break;
                                }
                            }
                        }
                    }
                    // handle saved events
                    if (savedStudentDataResponse.events != null) {
                        var savedEvents = savedStudentDataResponse.events;

                        var localEvents = _this2.studentData.events;

                        // set the id and serverSaveTime in the local event
                        for (var i = 0; i < savedEvents.length; i++) {
                            var savedEvent = savedEvents[i];

                            /*
                             * loop through all the events that were posted
                             * to find the one with the matching request token
                             */
                            for (var l = localEvents.length - 1; l >= 0; l--) {
                                var localEvent = localEvents[l];
                                if (localEvent.requestToken != null && localEvent.requestToken === savedEvent.requestToken) {
                                    localEvent.id = savedEvent.id;
                                    localEvent.serverSaveTime = savedEvent.serverSaveTime;
                                    localEvent.requestToken = null; // requestToken is no longer needed.

                                    _this2.$rootScope.$broadcast('eventSavedToServer', { event: localEvent });
                                    break;
                                }
                            }
                        }
                    }

                    // handle saved annotations
                    if (savedStudentDataResponse.annotations != null) {
                        var savedAnnotations = savedStudentDataResponse.annotations;

                        var localAnnotations = _this2.studentData.annotations;

                        // set the id and serverSaveTime in the local annotation
                        for (var i = 0; i < savedAnnotations.length; i++) {
                            var savedAnnotation = savedAnnotations[i];

                            /*
                             * loop through all the events that were posted
                             * to find the one with the matching request token
                             */
                            for (var l = localAnnotations.length - 1; l >= 0; l--) {
                                var localAnnotation = localAnnotations[l];
                                if (localAnnotation.requestToken != null && localAnnotation.requestToken === savedAnnotation.requestToken) {
                                    localAnnotation.id = savedAnnotation.id;
                                    localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
                                    localAnnotation.requestToken = null; // requestToken is no longer needed.

                                    _this2.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
                                    break;
                                }
                            }
                        }
                    }

                    return savedStudentDataResponse;
                }
            });
        }
    }, {
        key: 'retrieveComponentStates',
        value: function retrieveComponentStates(runId, periodId, workgroupId) {}
    }, {
        key: 'getLatestComponentState',
        value: function getLatestComponentState(type) {
            var latestComponentState = null;

            var studentData = this.studentData;

            if (studentData != null) {
                var componentStates = studentData.componentStates;

                if (componentStates != null) {
                    if (type === 'isSubmit') {
                        for (var i = componentStates.length - 1; i > -1; i--) {
                            var state = componentStates[i];
                            if (state.isSubmit) {
                                latestComponentState = state;
                                break;
                            }
                        }
                    } else {
                        latestComponentState = componentStates[componentStates.length - 1];
                    }
                }
            }

            return latestComponentState;
        }
    }, {
        key: 'getLatestComponentStateByNodeIdAndComponentId',

        /**
         * Get the latest component state for the given node id and component
         * id.
         * @param nodeId the node id
         * @param componentId the component id
         * @return the latest component state with the matching node id and
         * component id or null if none are found
         */
        value: function getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId) {
            var latestComponentState = null;

            if (nodeId != null && componentId != null) {
                var studentData = this.studentData;

                if (studentData != null) {

                    // get the component states
                    var componentStates = studentData.componentStates;

                    if (componentStates != null) {

                        // loop through all the component states from newest to oldest
                        for (var c = componentStates.length - 1; c >= 0; c--) {
                            var componentState = componentStates[c];

                            if (componentState != null) {
                                var componentStateNodeId = componentState.nodeId;
                                var componentStateComponentId = componentState.componentId;

                                // compare the node id and component id
                                if (nodeId == componentStateNodeId && componentId == componentStateComponentId) {
                                    latestComponentState = componentState;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            return latestComponentState;
        }
    }, {
        key: 'getStudentWorkByStudentWorkId',

        /**
         * Get the student work by specified student work id, which can be a ComponentState or NodeState
         * @param studentWorkId the student work id
         * @return an StudentWork or null
         */
        value: function getStudentWorkByStudentWorkId(studentWorkId) {
            if (studentWorkId != null) {
                // get the component states
                var componentStates = this.studentData.componentStates;

                if (componentStates != null) {

                    // loop through all the component states
                    for (var c = 0; c < componentStates.length; c++) {
                        var componentState = componentStates[c];

                        if (componentState != null && componentState.id === studentWorkId) {
                            return componentState;
                        }
                    }
                }

                // get the node states
                var nodeStates = this.studentData.nodeStates;

                if (nodeStates != null) {

                    // loop through all the node states
                    for (var n = 0; n < nodeStates.length; n++) {
                        var nodeState = nodeStates[n];
                        if (nodeState != null && nodeState.id === studentWorkId) {
                            return nodeState;
                        }
                    }
                }
            }
            return null;
        }
    }, {
        key: 'getComponentStatesByNodeId',

        /**
         * Get the component states for the given node id
         * @param nodeId the node id
         * @return an array of component states for the given node id
         */
        value: function getComponentStatesByNodeId(nodeId) {
            var componentStatesByNodeId = [];

            if (nodeId != null) {
                var studentData = this.studentData;

                if (studentData != null) {

                    // get the component states
                    var componentStates = studentData.componentStates;

                    if (componentStates != null) {

                        // loop through all the component states
                        for (var c = 0; c < componentStates.length; c++) {
                            var componentState = componentStates[c];

                            if (componentState != null) {
                                var componentStateNodeId = componentState.nodeId;

                                // compare the node id
                                if (nodeId == componentStateNodeId) {

                                    componentStatesByNodeId.push(componentState);
                                }
                            }
                        }
                    }
                }
            }

            return componentStatesByNodeId;
        }
    }, {
        key: 'getComponentStatesByNodeIdAndComponentId',

        /**
         * Get the component states for the given node id and component id
         * @param nodeId the node id
         * @param componentId the component id
         * @return an array of component states for the given node id and
         * component id
         */
        value: function getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
            var componentStatesByNodeIdAndComponentId = [];

            if (nodeId != null && componentId != null) {
                var studentData = this.studentData;

                if (studentData != null) {

                    // get the component states
                    var componentStates = studentData.componentStates;

                    if (componentStates != null) {

                        // loop through all the component states
                        for (var c = 0; c < componentStates.length; c++) {
                            var componentState = componentStates[c];

                            if (componentState != null) {
                                var componentStateNodeId = componentState.nodeId;
                                var componentStateComponentId = componentState.componentId;

                                // compare the node id and component id
                                if (nodeId == componentStateNodeId && componentId == componentStateComponentId) {

                                    componentStatesByNodeIdAndComponentId.push(componentState);
                                }
                            }
                        }
                    }
                }
            }

            return componentStatesByNodeIdAndComponentId;
        }
    }, {
        key: 'getEventsByNodeId',

        /**
         * Get the events for a node id
         * @param nodeId the node id
         * @returns the events for the node id
         */
        value: function getEventsByNodeId(nodeId) {
            var eventsByNodeId = [];

            if (nodeId != null) {

                if (this.studentData != null && this.studentData.events != null) {

                    // get all the events
                    var events = this.studentData.events;

                    // loop through all the events
                    for (var e = 0; e < events.length; e++) {
                        var event = events[e];

                        if (event != null) {
                            var eventNodeId = event.nodeId;

                            if (nodeId === eventNodeId) {
                                // this event is for the node id we are looking for
                                eventsByNodeId.push(event);
                            }
                        }
                    }
                }
            }

            return eventsByNodeId;
        }
    }, {
        key: 'getEventsByNodeIdAndComponentId',

        /**
         * Get the events for a component id
         * @param nodeId the node id
         * @param componentId the component id
         * @returns an array of events for the component id
         */
        value: function getEventsByNodeIdAndComponentId(nodeId, componentId) {
            var eventsByNodeId = [];

            if (nodeId != null) {

                if (this.studentData != null && this.studentData.events != null) {

                    // get all the events
                    var events = this.studentData.events;

                    // loop through all the events
                    for (var e = 0; e < events.length; e++) {
                        var event = events[e];

                        if (event != null) {
                            var eventNodeId = event.nodeId;
                            var eventComponentId = event.componentId;

                            if (nodeId === eventNodeId && componentId === eventComponentId) {
                                // this events is for the component id we are looking for
                                eventsByNodeId.push(event);
                            }
                        }
                    }
                }
            }

            return eventsByNodeId;
        }
    }, {
        key: 'makeCopyOfJSONObject',

        /**
         * Create a copy of a JSON object
         * @param jsonObject the JSON object to get a copy of
         * @return a copy of the JSON object that was passed in
         */
        value: function makeCopyOfJSONObject(jsonObject) {
            var copyOfJSONObject = null;

            if (jsonObject != null) {
                // create a JSON string from the JSON object
                var jsonObjectString = angular.toJson(jsonObject);

                // create a JSON object from the JSON string
                copyOfJSONObject = angular.fromJson(jsonObjectString);
            }

            return copyOfJSONObject;
        }
    }, {
        key: 'canVisitNode',

        /**
         * Check if the student can visit the node
         * @param nodeId the node id
         * @returns whether the student can visit the node
         */
        value: function canVisitNode(nodeId) {

            var result = false;

            if (nodeId != null) {

                // get the node status for the node
                var nodeStatus = this.getNodeStatusByNodeId(nodeId);

                if (nodeStatus != null) {
                    if (nodeStatus.isVisitable) {
                        result = true;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'getNodeStatusByNodeId',

        /**
         * Get the node status by node id
         * @param nodeId the node id
         * @returns the node status object for a node
         */
        value: function getNodeStatusByNodeId(nodeId) {
            var nodeStatuses = this.nodeStatuses;
            var nodeStatus = null;

            if (nodeId != null) {
                nodeStatus = nodeStatuses[nodeId];
            }

            return nodeStatus;
        }
    }, {
        key: 'getNodeProgressById',

        /**
         * Get completed items, total number of visible items, completion % for a node
         * @param nodeId the node id
         * @returns object with number of completed items and number of visible items
         */
        value: function getNodeProgressById(nodeId) {
            var completedItems = 0;
            var totalItems = 0;

            if (this.ProjectService.isGroupNode(nodeId)) {
                var nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);
                for (var n = 0; n < nodeIds.length; n++) {
                    var id = nodeIds[n];
                    var status = this.nodeStatuses[id];
                    if (this.ProjectService.isGroupNode(id)) {
                        var completedGroupItems = status.progress.completedItems;
                        var totalGroupItems = status.progress.totalItems;
                        completedItems += completedGroupItems;
                        totalItems += totalGroupItems;
                    } else {
                        if (status.isVisible) {
                            totalItems++;
                            if (status.isCompleted) {
                                completedItems++;
                            }
                        }
                    }
                }
            }

            // TODO: implement for steps (using components instead of child nodes)

            var completionPct = totalItems ? Math.round(completedItems / totalItems * 100) : 0;
            var progress = {
                "completedItems": completedItems,
                "totalItems": totalItems,
                "completionPct": completionPct
            };
            return progress;
        }
    }, {
        key: 'isCompleted',

        /**
         * Check if the given node or component is completed
         * @param nodeId the node id
         * @param componentId (optional) the component id
         * @returns whether the node or component is completed
         */
        value: function isCompleted(nodeId, componentId) {

            var result = false;

            if (nodeId && componentId) {
                // check that the component is completed

                // get the component states for the component
                var componentStates = this.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

                // get the component events
                var componentEvents = this.getEventsByNodeIdAndComponentId(nodeId, componentId);

                // get the node events
                var nodeEvents = this.getEventsByNodeId(nodeId);

                // get the component object
                var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

                if (component != null) {

                    // get the component type
                    var componentType = component.type;

                    if (componentType != null) {

                        // get the service for the component type
                        var service = this.$injector.get(componentType + 'Service');

                        // check if the component is completed
                        if (service.isCompleted(component, componentStates, componentEvents, nodeEvents)) {
                            result = true;
                        }
                    }
                }
            } else if (nodeId) {
                // check if node is a group
                var isGroup = this.ProjectService.isGroupNode(nodeId);

                if (isGroup) {
                    // node is a group
                    var tempResult = true;

                    // check that all the nodes in the group and visible are completed
                    var nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);
                    for (var n = 0; n < nodeIds.length; n++) {
                        var id = nodeIds[n];
                        if (this.nodeStatuses[id].isVisible && !this.nodeStatuses[id].isCompleted) {
                            tempResult = false;
                            break;
                        }
                    }

                    result = tempResult;
                } else {
                    // check that all the components in the node are completed

                    // get all the components in the node
                    var components = this.ProjectService.getComponentsByNodeId(nodeId);

                    var tempResult = false;
                    var firstResult = true;

                    /*
                     * All components must be completed in order for the node to be completed
                     * so we will loop through all the components and check if they are
                     * completed
                     */
                    for (var c = 0; c < components.length; c++) {
                        var component = components[c];

                        if (component != null) {
                            var componentId = component.id;
                            var componentType = component.type;
                            var showPreviousWorkNodeId = component.showPreviousWorkNodeId;
                            var showPreviousWorkComponentId = component.showPreviousWorkComponentId;

                            var tempNodeId = nodeId;
                            var tempComponentId = componentId;
                            var tempComponent = component;

                            if (showPreviousWorkNodeId != null && showPreviousWorkComponentId != null) {
                                /*
                                 * this is a show previous work component so we will check if the
                                 * previous component was completed
                                 */
                                tempNodeId = showPreviousWorkNodeId;
                                tempComponentId = showPreviousWorkComponentId;
                                tempComponent = this.ProjectService.getComponentByNodeIdAndComponentId(tempNodeId, tempComponentId);
                            }

                            if (componentType != null) {
                                try {

                                    // get the service name
                                    var serviceName = componentType + 'Service';

                                    if (this.$injector.has(serviceName)) {

                                        // get the service for the component type
                                        var service = this.$injector.get(serviceName);

                                        // get the component states for the component
                                        var componentStates = this.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);

                                        // get the component events
                                        var componentEvents = this.getEventsByNodeIdAndComponentId(tempNodeId, tempComponentId);

                                        // get the node events
                                        var nodeEvents = this.getEventsByNodeId(tempNodeId);

                                        // check if the component is completed
                                        var isComponentCompleted = service.isCompleted(tempComponent, componentStates, componentEvents, nodeEvents);

                                        if (firstResult) {
                                            // this is the first component we have looked at
                                            tempResult = isComponentCompleted;
                                            firstResult = false;
                                        } else {
                                            // this is not the first component we have looked at
                                            tempResult = tempResult && isComponentCompleted;
                                        }
                                    }
                                } catch (e) {
                                    console.log('Error: Could not calculate isCompleted() for a component');
                                }
                            }
                        }
                    }

                    result = tempResult;
                }
            }

            return result;
        }
    }, {
        key: 'getCurrentNode',

        /**
         * Get the current node
         * @returns the current node object
         */
        value: function getCurrentNode() {
            return this.currentNode;
        }
    }, {
        key: 'getCurrentNodeId',

        /**
         * Get the current node id
         * @returns the current node id
         */
        value: function getCurrentNodeId() {
            var currentNodeId = null;

            if (this.currentNode != null) {
                currentNodeId = this.currentNode.id;
            }

            return currentNodeId;
        }
    }, {
        key: 'setCurrentNodeByNodeId',

        /**
         * Set the current node
         * @param nodeId the node id
         */
        value: function setCurrentNodeByNodeId(nodeId) {
            if (nodeId != null) {
                var node = this.ProjectService.getNodeById(nodeId);

                this.setCurrentNode(node);
            }
        }
    }, {
        key: 'setCurrentNode',

        /**
         * Set the current node
         * @param node the node object
         */
        value: function setCurrentNode(node) {
            var previousCurrentNode = this.currentNode;

            if (previousCurrentNode !== node) {
                // the current node is about to change

                if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)) {
                    // set the previous node to the current node
                    this.previousStep = previousCurrentNode;
                }

                // set the current node to the new node
                this.currentNode = node;

                // broadcast the event that the current node has changed
                this.$rootScope.$broadcast('currentNodeChanged', { previousNode: previousCurrentNode, currentNode: this.currentNode });
            }
        }
    }, {
        key: 'endCurrentNode',

        /**
         * End the current node
         */
        value: function endCurrentNode() {

            // get the current node
            var previousCurrentNode = this.currentNode;

            if (previousCurrentNode != null) {

                // tell the node to exit
                this.$rootScope.$broadcast('exitNode', { nodeToExit: previousCurrentNode });
            }
        }
    }, {
        key: 'endCurrentNodeAndSetCurrentNodeByNodeId',

        /**
         * End the current node and set the current node
         * @param nodeId the node id of the new current node
         */
        value: function endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {

            // check if the node is visitable
            if (this.nodeStatuses[nodeId].isVisitable) {
                // the node is visitable
                // end the current node
                this.endCurrentNode();

                // set the current node
                this.setCurrentNodeByNodeId(nodeId);
            } else {
                // the node is not visitable
                this.nodeClickLocked(nodeId);
            }
        }
    }, {
        key: 'nodeClickLocked',

        /**
         * Broadcast a listenable event that a locked node has been clicked (attempted to be opened)
         * @param nodeId
         */
        value: function nodeClickLocked(nodeId) {
            this.$rootScope.$broadcast('nodeClickLocked', { nodeId: nodeId });
        }
    }, {
        key: 'CSVToArray',

        /**
         * This will parse a delimited string into an array of
         * arrays. The default delimiter is the comma, but this
         * can be overriden in the second argument.
         * Source: http://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
         */
        value: function CSVToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = strDelimiter || ",";

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");

            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
                } else {

                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[3];
                }

                // Now that we have our value string, let's add
                // it to the data array.
                var finalValue = strMatchedValue;
                var floatVal = parseFloat(strMatchedValue);
                if (!isNaN(floatVal)) {
                    finalValue = floatVal;
                }
                arrData[arrData.length - 1].push(finalValue);
            }

            // Return the parsed data.
            return arrData;
        }
    }, {
        key: 'getTotalScore',

        /**
         * Get the total score for the workgroup
         * @returns the total score for the workgroup
         */
        value: function getTotalScore() {
            var annotations = this.studentData.annotations;
            var workgroupId = this.ConfigService.getWorkgroupId();
            return this.AnnotationService.getTotalScore(annotations, workgroupId);
        }
    }]);

    return StudentDataService;
}();

StudentDataService.$inject = ['$http', '$injector', '$q', '$rootScope', 'AnnotationService', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = StudentDataService;
//# sourceMappingURL=studentDataService.js.map