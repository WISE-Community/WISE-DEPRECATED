'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
        this.runStatus = null;

        this.maxPlanningNodeNumber = 0;
    }

    _createClass(StudentDataService, [{
        key: 'retrieveStudentData',
        value: function retrieveStudentData() {
            var _this = this;

            if (this.ConfigService.isPreview()) {
                // we are previewing the project

                // initialize dummy student data
                this.studentData = {};
                this.studentData.componentStates = [];
                this.studentData.nodeStates = [];
                this.studentData.events = [];
                this.studentData.userName = 'Preview Student';
                this.studentData.userId = '0';

                // populate the student history
                this.populateHistories(this.studentData.events);

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

                        // Check to see if this Project contains any Planning activities
                        if (_this.ProjectService.project.nodes != null && _this.ProjectService.project.nodes.length > 0) {
                            // Overload/add new nodes based on student's work in the NodeState for the planning group.
                            for (var p = 0; p < _this.ProjectService.project.nodes.length; p++) {
                                var planningGroupNode = _this.ProjectService.project.nodes[p];
                                if (planningGroupNode.planning) {
                                    var lastestNodeStateForPlanningGroupNode = _this.getLatestNodeStateByNodeId(planningGroupNode.id);
                                    if (lastestNodeStateForPlanningGroupNode != null) {
                                        var studentModifiedNodes = lastestNodeStateForPlanningGroupNode.studentData.nodes;
                                        if (studentModifiedNodes != null) {
                                            for (var _s = 0; _s < studentModifiedNodes.length; _s++) {
                                                var studentModifiedNode = studentModifiedNodes[_s]; // Planning Node that student modified or new instances.
                                                var studentModifiedNodeId = studentModifiedNode.id;
                                                if (studentModifiedNode.planning) {
                                                    // If this is a Planning Node that exists in the project, replace the one in the original project with this one.
                                                    for (var n = 0; n < _this.ProjectService.project.nodes.length; n++) {
                                                        if (_this.ProjectService.project.nodes[n].id === studentModifiedNodeId) {
                                                            // Only overload the ids. This will allow authors to add more planningNodes during the run if needed.
                                                            _this.ProjectService.project.nodes[n].ids = studentModifiedNode.ids;
                                                        }
                                                    }
                                                } else {
                                                    // Otherwise, this is an instance of a PlanningNode template, so just append it to the end of the Project.nodes
                                                    _this.ProjectService.project.nodes.push(studentModifiedNode);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            // Re-parse the project with the modified changes
                            _this.ProjectService.parseProject();
                        }

                        // get events
                        _this.studentData.events = resultData.events;

                        // get annotations
                        _this.studentData.annotations = resultData.annotations;

                        _this.AnnotationService.setAnnotations(_this.studentData.annotations);

                        // populate the student history
                        _this.populateHistories(_this.studentData.events);

                        // update the node statuses
                        _this.updateNodeStatuses();
                    }

                    return _this.studentData;
                });
            }
        }
    }, {
        key: 'retrieveRunStatus',


        /**
         * Retrieve the run status
         */
        value: function retrieveRunStatus() {
            var _this2 = this;

            if (this.ConfigService.isPreview()) {
                // we are previewing the project
                this.runStatus = {};
            } else {
                // we are in a run
                var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
                var runId = this.ConfigService.getConfigParam('runId');

                //create the params for the request
                var params = {
                    runId: runId
                };

                var httpParams = {};
                httpParams.method = 'GET';
                httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                httpParams.url = runStatusURL;
                httpParams.params = params;

                // make the request for the run status
                return this.$http(httpParams).then(function (result) {
                    if (result != null) {
                        var data = result.data;
                        if (data != null) {
                            // remember the run status
                            _this2.runStatus = data;
                        }
                    }
                });
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
            var nodes = this.ProjectService.getNodes();
            var groups = this.ProjectService.getGroups();

            if (nodes != null) {

                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    if (!this.ProjectService.isGroupNode(node.id)) {
                        this.updateNodeStatusByNode(node);
                    }
                }
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


        /**
         * Update the node status for a node
         * @param node the node to update
         */
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
                var functionName = null;
                if (criteria.function != null) {
                    functionName = criteria.function.name;
                }

                if (functionName == null) {} else if (functionName === 'branchPathTaken') {
                    result = this.evaluateBranchPathTakenCriteria(criteria);
                } else if (functionName === 'isVisible') {} else if (functionName === 'isVisitable') {} else if (functionName === 'isVisited') {
                    result = this.evaluateIsVisitedCriteria(criteria);
                } else if (functionName === 'isComplete') {} else if (functionName === 'isCorrect') {} else if (functionName === 'choiceChosen') {
                    result = this.evaluateChoiceChosenCriteria(criteria);
                } else if (functionName === 'isPlanningActivityCompleted') {
                    result = this.evaluateIsPlanningActivityCompletedCriteria(criteria);
                } else if (functionName === '') {}
            }

            return result;
        }
    }, {
        key: 'evaluateIsPlanningActivityCompletedCriteria',


        /**
         * Check if the isPlanningActivityCompleted criteria was satisfied
         * @param criteria a isPlanningActivityCompleted criteria
         */
        value: function evaluateIsPlanningActivityCompletedCriteria(criteria) {
            var result = false;

            if (criteria != null) {
                // get the function name
                //var name = criteria.name;

                var params = null;

                // get the params
                if (criteria.function != null) {
                    params = criteria.function.params;
                }

                if (params != null) {

                    // get the group id
                    var nodeId = params.nodeId;

                    // get the number of planning steps the student needs to create
                    var planningStepsCreated = params.planningStepsCreated;

                    // get whether the student needs to complete all the steps in the activity
                    var planningStepsCompleted = params.planningStepsCompleted;

                    var planningStepsCreatedSatisfied = false;
                    var planningStepsCompletedSatisfied = false;

                    var planningNodes = [];

                    if (planningStepsCreated == null) {
                        // there is no value set so we will regard it as satisfied
                        planningStepsCreatedSatisfied = true;
                    } else {
                        /*
                         * there is a value for number of planning steps that need to be created
                         * so we will check if the student created enough planning steps
                         */

                        // get the node states for the activity
                        var nodeStates = this.getNodeStatesByNodeId(nodeId);

                        if (nodeStates != null) {

                            /*
                             * loop through all the node states from newest to oldest
                             * for the sake of efficiency
                             */
                            for (var ns = nodeStates.length - 1; ns >= 0; ns--) {

                                var planningStepCount = 0;

                                var nodeState = nodeStates[ns];

                                if (nodeState != null) {

                                    // get the student data
                                    var studentData = nodeState.studentData;

                                    if (studentData != null) {

                                        // get the nodes
                                        var nodes = studentData.nodes;

                                        if (nodes != null) {

                                            // loop through the nodes
                                            for (var n = 0; n < nodes.length; n++) {
                                                var node = nodes[n];

                                                if (node != null) {
                                                    if (node.type === 'node' && (node.templateId != null || node.planningTemplateId != null)) {
                                                        // we have found a planning step the student created
                                                        planningStepCount++;
                                                    }
                                                }
                                            }

                                            if (planningStepCount >= planningStepsCreated) {
                                                // the student has created a sufficient number of planning steps
                                                planningStepsCreatedSatisfied = true;
                                                planningNodes = nodes;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (planningStepsCompleted == null) {
                        planningStepsCompletedSatisfied = true;
                    } else {
                        /*
                         * check if the activity is completed. this checks if all
                         * the children of the activity are completed.
                         */
                        if (this.isCompleted(nodeId)) {
                            planningStepsCompletedSatisfied = true;
                        }
                    }

                    if (planningStepsCreatedSatisfied && planningStepsCompletedSatisfied) {
                        result = true;
                    }
                }
            }

            return result;
        }

        /**
         * Check if this branchPathTaken criteria was satisfied
         * @param criteria a branchPathTaken criteria
         * @returns whether the branchPathTaken criteria was satisfied
         */

    }, {
        key: 'evaluateBranchPathTakenCriteria',
        value: function evaluateBranchPathTakenCriteria(criteria) {
            var result = false;

            if (criteria != null) {
                // get the expected from and to node ids
                var expectedFromNodeId = criteria.fromNodeId;
                var expectedToNodeId = criteria.toNodeId;

                // get all the branchPathTaken events from the from node id
                var branchPathTakenEvents = this.getBranchPathTakenEventsByNodeId(expectedFromNodeId);

                if (branchPathTakenEvents != null) {

                    // loop through all the branchPathTaken events
                    for (var b = 0; b < branchPathTakenEvents.length; b++) {
                        var branchPathTakenEvent = branchPathTakenEvents[b];

                        if (branchPathTakenEvent != null) {
                            var data = branchPathTakenEvent.data;

                            if (data != null) {
                                // get the from and to node ids of the event
                                var fromNodeId = data.fromNodeId;
                                var toNodeId = data.toNodeId;

                                if (expectedFromNodeId === fromNodeId && expectedToNodeId === toNodeId) {
                                    // the from and to node ids match the ones we are looking for
                                    result = true;
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'evaluateIsVisitedCriteria',


        /**
         * Check if the isVisited criteria was satisfied
         * @param criteria the isVisited criteria
         * @returns whether the node id is visited
         */
        value: function evaluateIsVisitedCriteria(criteria) {

            var isVisited = false;

            if (criteria != null) {

                // get the node id we want to check if was visited
                var nodeId = criteria.nodeId;

                // get all the events
                var events = this.studentData.events;

                if (events != null) {

                    // loop through all the events
                    for (var e = 0; e < events.length; e++) {
                        var event = events[e];

                        if (event != null) {
                            if (nodeId == event.nodeId && 'nodeEntered' === event.event) {
                                // the student has entered the node before
                                isVisited = true;
                            }
                        }
                    }
                }
            }

            return isVisited;
        }

        /**
         * Get all the branchPathTaken events by node id
         * @params fromNodeId the from node id
         * @returns all the branchPathTaken events from the given node id
         */

    }, {
        key: 'getBranchPathTakenEventsByNodeId',
        value: function getBranchPathTakenEventsByNodeId(fromNodeId) {

            var branchPathTakenEvents = [];
            var events = this.studentData.events;

            if (events != null) {

                // loop through all the events
                for (var e = 0; e < events.length; e++) {
                    var event = events[e];

                    if (event != null) {
                        if (fromNodeId === event.nodeId && 'branchPathTaken' === event.event) {
                            // we have found a branchPathTaken event from the from node id
                            branchPathTakenEvents.push(event);
                        }
                    }
                }
            }

            return branchPathTakenEvents;
        }

        /**
         * Evaluate the choice chosen criteria
         * @param criteria the criteria to evaluate
         * @returns a boolena value whether the criteria was satisfied or not
         */

    }, {
        key: 'evaluateChoiceChosenCriteria',
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
         * @param events the events
         */
        value: function populateHistories(events) {
            this.stackHistory = [];
            this.visitedNodesHistory = [];

            if (events != null) {

                // loop through all the events
                for (var e = 0; e < events.length; e++) {
                    var event = events[e];

                    if (event != null) {

                        // look for the nodeEntered event
                        if (event.event === 'nodeEntered') {

                            // the student has visited this node id before
                            this.updateStackHistory(event.nodeId);
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
        key: 'getNodeStates',


        /**
         * Returns all NodeStates
         * @returns Array of all NodeStates
         */
        value: function getNodeStates() {
            var nodeStates = [];

            if (this.studentData != null && this.studentData.nodeStates != null) {
                nodeStates = this.studentData.nodeStates;
            }

            return nodeStates;
        }
    }, {
        key: 'getNodeStatesByNodeId',


        /**
         * Get all NodeStates for a specific node
         * @param nodeId id of node
         * @returns Array of NodeStates for the specified node
         */
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
            var _this3 = this;

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

            if (this.ConfigService.isPreview()) {
                var savedStudentDataResponse = {
                    studentWorkList: studentWorkList,
                    events: events,
                    annotations: annotations
                };

                // if we're in preview, don't make any request to the server but pretend we did
                this.saveToServerSuccess(savedStudentDataResponse);
                var deferred = this.$q.defer();
                deferred.resolve(savedStudentDataResponse);
                return deferred.promise;
            } else {
                // set the workgroup id and run id
                var params = {};
                params.runId = this.ConfigService.getRunId();
                params.workgroupId = this.ConfigService.getWorkgroupId();
                params.studentWorkList = angular.toJson(studentWorkList);
                params.events = angular.toJson(events);
                params.annotations = angular.toJson(annotations);

                // get the url to POST the student data
                var httpParams = {};
                httpParams.method = 'POST';
                httpParams.url = this.ConfigService.getConfigParam('studentDataURL');
                httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                httpParams.data = $.param(params);

                // make the request to post the student data
                return this.$http(httpParams).then(function (result) {
                    // get the local references to the component states that were posted and set their id and serverSaveTime
                    if (result != null && result.data != null) {
                        var savedStudentDataResponse = result.data;

                        _this3.saveToServerSuccess(savedStudentDataResponse);

                        return savedStudentDataResponse;
                    }
                }, function (result) {
                    // a server error occured
                    return null;
                });
            }
        }
    }, {
        key: 'saveToServerSuccess',
        value: function saveToServerSuccess(savedStudentDataResponse) {
            // set dummy serverSaveTime for use if we're in preview mode
            var serverSaveTime = Date.parse(new Date());

            // handle saved studentWork
            if (savedStudentDataResponse.studentWorkList) {
                var savedStudentWorkList = savedStudentDataResponse.studentWorkList;
                var localStudentWorkList = this.studentData.componentStates;
                if (this.studentData.nodeStates) {
                    localStudentWorkList = localStudentWorkList.concat(this.studentData.nodeStates);
                }

                // set the id and serverSaveTime in the local studentWorkList
                for (var i = 0; i < savedStudentWorkList.length; i++) {
                    var savedStudentWork = savedStudentWorkList[i];

                    /*
                     * loop through all the student work that were posted
                     * to find the one with the matching request token
                     */
                    for (var l = localStudentWorkList.length - 1; l >= 0; l--) {
                        var localStudentWork = localStudentWorkList[l];
                        if (localStudentWork.requestToken && localStudentWork.requestToken === savedStudentWork.requestToken) {
                            localStudentWork.id = savedStudentWork.id;
                            localStudentWork.serverSaveTime = savedStudentWork.serverSaveTime ? savedStudentWork.serverSaveTime : serverSaveTime;
                            localStudentWork.requestToken = null; // requestToken is no longer needed.

                            this.$rootScope.$broadcast('studentWorkSavedToServer', { studentWork: localStudentWork });
                            break;
                        }
                    }
                }
            }
            // handle saved events
            if (savedStudentDataResponse.events) {
                var savedEvents = savedStudentDataResponse.events;

                var localEvents = this.studentData.events;

                // set the id and serverSaveTime in the local event
                for (var i = 0; i < savedEvents.length; i++) {
                    var savedEvent = savedEvents[i];

                    /*
                     * loop through all the events that were posted
                     * to find the one with the matching request token
                     */
                    for (var l = localEvents.length - 1; l >= 0; l--) {
                        var localEvent = localEvents[l];
                        if (localEvent.requestToken && localEvent.requestToken === savedEvent.requestToken) {
                            localEvent.id = savedEvent.id;
                            localEvent.serverSaveTime = savedEvent.serverSaveTime ? savedEvent.serverSaveTime : serverSaveTime;
                            localEvent.requestToken = null; // requestToken is no longer needed.

                            this.$rootScope.$broadcast('eventSavedToServer', { event: localEvent });
                            break;
                        }
                    }
                }
            }

            // handle saved annotations
            if (savedStudentDataResponse.annotations) {
                var savedAnnotations = savedStudentDataResponse.annotations;

                var localAnnotations = this.studentData.annotations;

                // set the id and serverSaveTime in the local annotation
                for (var i = 0; i < savedAnnotations.length; i++) {
                    var savedAnnotation = savedAnnotations[i];

                    /*
                     * loop through all the events that were posted
                     * to find the one with the matching request token
                     */
                    for (var l = localAnnotations.length - 1; l >= 0; l--) {
                        var localAnnotation = localAnnotations[l];
                        if (localAnnotation.requestToken && localAnnotation.requestToken === savedAnnotation.requestToken) {
                            localAnnotation.id = savedAnnotation.id;
                            localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime ? savedAnnotation.serverSaveTime : serverSaveTime;
                            localAnnotation.requestToken = null; // requestToken is no longer needed.

                            this.$rootScope.$broadcast('annotationSavedToServer', { annotation: localAnnotation });
                            break;
                        }
                    }
                }
            }

            this.updateNodeStatuses();
        }
    }, {
        key: 'retrieveComponentStates',
        value: function retrieveComponentStates(runId, periodId, workgroupId) {}
    }, {
        key: 'getLatestComponentState',
        value: function getLatestComponentState() {
            var latestComponentState = null;

            var studentData = this.studentData;

            if (studentData != null) {
                var componentStates = studentData.componentStates;

                if (componentStates != null) {
                    latestComponentState = componentStates[componentStates.length - 1];
                }
            }

            return latestComponentState;
        }
    }, {
        key: 'isComponentSubmitDirty',


        /**
         * Check whether the component has unsubmitted work
         * @return boolean whether or not there is unsubmitted work
         */
        value: function isComponentSubmitDirty() {
            var submitDirty = false;

            var latestComponentState = this.getLatestComponentState();
            if (latestComponentState && !latestComponentState.isSubmit) {
                submitDirty = true;
            }

            return submitDirty;
        }
    }, {
        key: 'getLatestNodeStateByNodeId',


        /**
         * Get the latest NodeState for the specified node id
         * @param nodeId the node id
         * @return the latest node state with the matching node id or null if none are found
         */
        value: function getLatestNodeStateByNodeId(nodeId) {
            var latestNodeState = null;
            var allNodeStatesByNodeId = this.getNodeStatesByNodeId(nodeId);
            if (allNodeStatesByNodeId != null && allNodeStatesByNodeId.length > 0) {
                latestNodeState = allNodeStatesByNodeId[allNodeStatesByNodeId.length - 1];
            }
            return latestNodeState;
        }
    }, {
        key: 'getLatestComponentStateByNodeIdAndComponentId',


        /**
         * Get the latest component state for the given node id and component
         * id.
         * @param nodeId the node id
         * @param componentId the component id (optional)
         * @return the latest component state with the matching node id and
         * component id or null if none are found
         */
        value: function getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId) {
            var latestComponentState = null;

            if (nodeId) {
                var studentData = this.studentData;

                if (studentData) {
                    // get the component states
                    var componentStates = studentData.componentStates;

                    if (componentStates) {
                        // loop through all the component states from newest to oldest
                        for (var c = componentStates.length - 1; c >= 0; c--) {
                            var componentState = componentStates[c];

                            if (componentState) {
                                var componentStateNodeId = componentState.nodeId;

                                // compare the node id and component id
                                if (nodeId === componentStateNodeId) {
                                    if (componentId) {
                                        var componentStateComponentId = componentState.componentId;
                                        if (componentId === componentStateComponentId) {
                                            latestComponentState = componentState;
                                            break;
                                        }
                                    } else {
                                        latestComponentState = componentState;
                                        break;
                                    }
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

                var node = this.ProjectService.getNodeById(nodeId);

                if (component != null) {

                    // get the component type
                    var componentType = component.type;

                    if (componentType != null) {

                        // get the service for the component type
                        var service = this.$injector.get(componentType + 'Service');

                        // check if the component is completed
                        if (service.isCompleted(component, componentStates, componentEvents, nodeEvents, node)) {
                            result = true;
                        }
                    }
                }
            } else if (nodeId) {
                // check if node is a group
                var isGroup = this.ProjectService.isGroupNode(nodeId);

                var node = this.ProjectService.getNodeById(nodeId);

                if (isGroup) {
                    // node is a group
                    var tempResult = true;

                    // check that all the nodes in the group are visible and completed
                    var nodeIds = this.ProjectService.getChildNodeIdsById(nodeId);
                    for (var n = 0; n < nodeIds.length; n++) {
                        var id = nodeIds[n];

                        if (this.nodeStatuses[id] == null || !this.nodeStatuses[id].isVisible || !this.nodeStatuses[id].isCompleted) {
                            // the child is not visible or not completed so the group is not completed
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
                                        var isComponentCompleted = service.isCompleted(tempComponent, componentStates, componentEvents, nodeEvents, node);

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
                                    console.log('Error: Could not calculate isCompleted() for component with id ' + tempComponentId);
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

        /**
         * Get the project completion for the signed in student
         * @returns the project completion percentage for the signed in student
         */

    }, {
        key: 'getProjectCompletion',
        value: function getProjectCompletion() {

            // group0 is always the root node of the whole project
            var nodeId = 'group0';

            // get the progress including all of the children nodes
            var progress = this.getNodeProgressById(nodeId);

            return progress;
        }

        /**
         * Get the run status
         */

    }, {
        key: 'getRunStatus',
        value: function getRunStatus() {
            return this.runStatus;
        }

        /**
         * Get the next available planning node instance node id
         * @returns the next available planning node instance node id
         */

    }, {
        key: 'getNextAvailablePlanningNodeId',
        value: function getNextAvailablePlanningNodeId() {

            // used to keep track of the highest planning node number we have found, which is 1-based
            var currentMaxPlanningNodeNumber = 1;

            var nodeStates = this.getNodeStates();

            if (nodeStates != null) {

                // loop through all the NodeStates
                for (var ns = 0; ns < nodeStates.length; ns++) {
                    var nodeState = nodeStates[ns];

                    if (nodeState != null) {
                        var nodeStateNodeId = nodeState.nodeId;
                        if (this.ProjectService.isPlanning(nodeStateNodeId) && nodeState.studentData != null) {
                            var nodes = nodeState.studentData.nodes;
                            for (var n = 0; n < nodes.length; n++) {
                                var node = nodes[n];
                                var nodeId = node.id;
                                // regex to match the planning node id e.g. planningNode2
                                var planningNodeIdRegEx = /planningNode(.*)/;

                                // run the regex on the node id
                                var result = nodeId.match(planningNodeIdRegEx);

                                if (result != null) {
                                    // we have found a planning node instance node id

                                    /*
                                     * get the number part of the planning node instance node id
                                     * e.g. if the nodeId is planningNode2, the number part
                                     * would be 2
                                     */
                                    var planningNodeNumber = parseInt(result[1]);

                                    if (planningNodeNumber > currentMaxPlanningNodeNumber) {
                                        /*
                                         * update the max number part if we have found a new
                                         * higher number
                                         */
                                        currentMaxPlanningNodeNumber = planningNodeNumber;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (this.maxPlanningNodeNumber < currentMaxPlanningNodeNumber) {
                // Update maxPlanningNodeNumber if we find a bigger number in the NodeStates
                this.maxPlanningNodeNumber = currentMaxPlanningNodeNumber;
            }

            // Increment maxPlanningNodeNumber each time this function is called.
            this.maxPlanningNodeNumber++;

            // return the next available planning node instance node id
            return 'planningNode' + this.maxPlanningNodeNumber;
        }
    }]);

    return StudentDataService;
}();

StudentDataService.$inject = ['$http', '$injector', '$q', '$rootScope', 'AnnotationService', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = StudentDataService;
//# sourceMappingURL=studentDataService.js.map