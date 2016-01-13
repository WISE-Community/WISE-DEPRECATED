'use strict';

define(['nodeService'], function (nodeService) {

    var service = ['$http', '$q', 'ConfigService', 'NodeService', 'TeacherDataService', function ($http, $q, ConfigService, NodeService, TeacherDataService) {
        var serviceObject = Object.create(NodeService);

        serviceObject.config = null;

        serviceObject.callFunction = function (node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;

            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }

            return result;
        };

        serviceObject.wordCountCompare = function (params) {
            var result = false;

            if (params != null) {
                var operator = params.operator;
                var count = params.count;
                var nodeVisits = params.nodeVisits;

                var latestNodeState = this.getLatestNodeState(nodeVisits);

                var wordCount = 0;

                if (latestNodeState != null) {
                    var response = latestNodeState.studentData;

                    if (response != null) {
                        wordCount = this.getWordCount(response);

                        if (operator === '<') {
                            if (wordCount < count) {
                                result = true;
                            }
                        } else if (operator === '>=') {
                            if (wordCount >= count) {
                                result = true;
                            }
                        }
                    }
                }
            }

            return result;
        };

        serviceObject.getWordCount = function (response) {
            var wordCount = 0;

            if (response != null) {
                var regex = /\s+/gi;
                wordCount = response.trim().replace(regex, ' ').split(' ').length;
            }

            return wordCount;
        };

        serviceObject.getStudentWorkAsHTML = function (nodeState) {
            var studentWorkAsHTML = null;

            if (nodeState != null) {
                var response = nodeState.studentData;

                if (response != null) {
                    studentWorkAsHTML = '<p>' + response + '</p>';
                }
            }

            return studentWorkAsHTML;
        };

        serviceObject.populateComponentState = function (componentStateFromOtherComponent, otherComponentType) {
            var componentState = null;

            if (componentStateFromOtherComponent != null && otherComponentType != null) {
                componentState = StudentDataService.createComponentState();

                if (otherComponentType === 'OpenResponse') {
                    componentState.studentData = componentStateFromOtherComponent.studentData;
                }
            }

            return componentState;
        };

        serviceObject.getClassmateResponses = function (runId, periodId, nodeId, componentId) {

            if (runId != null && periodId != null && nodeId != null && componentId != null) {
                return $q(angular.bind(this, function (resolve, reject) {

                    var httpParams = {};
                    httpParams.method = 'GET';
                    httpParams.url = ConfigService.getConfigParam('studentDataURL');

                    var params = {};
                    params.runId = runId;
                    params.periodId = periodId;
                    params.nodeId = nodeId;
                    params.componentId = componentId;
                    params.getStudentWork = true;
                    httpParams.params = params;

                    $http(httpParams).then(angular.bind(this, function (result) {
                        var classmateData = result.data;

                        //console.log(classmateData);

                        resolve(classmateData);
                    }));
                }));
            }
        };

        /**
        * Check if the component was completed
        * @param component the component object
        * @param componentStates the component states for the specific component
        * @param componentEvents the events for the specific component
        * @param nodeEvents the events for the parent node of the component
        * @returns whether the component was completed
        */
        serviceObject.isCompleted = function (component, componentStates, componentEvents, nodeEvents) {
            var result = false;

            if (componentStates != null) {

                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {

                    // the component state
                    var componentState = componentStates[c];

                    // get the student data from the component state
                    var studentData = componentState.studentData;

                    if (studentData != null) {
                        var response = studentData.response;

                        if (response != null) {
                            // there is a response so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        };

        /**
         * Get all the posts associated with a workgroup id. This will
         * get all the posts and replies that the workgroup posted
         * or replied to as well as all the other replies classmates made.
         * @param componentId the component id
         * @param workgroupId the workgroup id
         * @returns an array containing all the component states for
         * top level posts and replies that are associated with the
         * workgroup
         */
        serviceObject.getPostsAssociatedWithWorkgroupId = function (componentId, workgroupId) {
            var allPosts = [];

            var topLevelComponentIdsFound = [];

            // get all the component states for the workgroup id
            var componentStates = TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId);

            if (componentStates != null) {

                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {

                    var componentState = componentStates[c];

                    if (componentState != null) {
                        var studentData = componentState.studentData;

                        if (studentData != null) {
                            if (studentData.componentStateIdReplyingTo == null) {

                                // check if we have already added the top level post
                                if (topLevelComponentIdsFound.indexOf(componentState.id) == -1) {
                                    // we haven't found the top level post yet so

                                    /*
                                     * the component state is a top level post so we will
                                     * get the post and all the replies to the post
                                     */
                                    allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, componentState.id));

                                    topLevelComponentIdsFound.push(componentState.id);
                                }
                            } else {

                                // check if we have already added the top level post
                                if (topLevelComponentIdsFound.indexOf(studentData.componentStateIdReplyingTo) == -1) {
                                    // we haven't found the top level post yet so

                                    /*
                                     * the component state is a reply so we will get the
                                     * top level post and all the replies to it
                                     */
                                    allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, studentData.componentStateIdReplyingTo));

                                    topLevelComponentIdsFound.push(studentData.componentStateIdReplyingTo);
                                }
                            }
                        }
                    }
                }
            }

            return allPosts;
        };

        /**
         * Get the top level post and all the replies to it
         * @param componentId the component id
         * @param componentStateId the component state id
         * @returns an array containing the top level post and all the replies
         */
        serviceObject.getPostAndAllReplies = function (componentId, componentStateId) {
            var postAndAllReplies = [];

            // get all the component states for the node
            var componentStatesForNodeId = TeacherDataService.getComponentStatesByComponentId(componentId);

            for (var c = 0; c < componentStatesForNodeId.length; c++) {
                var tempComponentState = componentStatesForNodeId[c];

                if (tempComponentState != null) {
                    if (componentStateId === tempComponentState.id) {
                        // we have found the top level post
                        postAndAllReplies.push(tempComponentState);
                    } else {
                        // check if the component state is a reply to the post we are looking for
                        var studentData = tempComponentState.studentData;

                        if (studentData != null) {
                            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

                            if (componentStateIdReplyingTo != null) {
                                if (componentStateId === componentStateIdReplyingTo) {
                                    // this is a reply to the post we are looking for
                                    postAndAllReplies.push(tempComponentState);
                                }
                            }
                        }
                    }
                }
            }

            return postAndAllReplies;
        };

        return serviceObject;
    }];

    return service;
});