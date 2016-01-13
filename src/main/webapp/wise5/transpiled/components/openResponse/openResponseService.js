'use strict';

define(['nodeService', 'studentDataService'], function (nodeService, studentDataService) {

    var service = ['$http', 'NodeService', 'StudentDataService', function ($http, NodeService, StudentDataService) {
        var serviceObject = Object.create(NodeService);

        serviceObject.config = null;

        serviceObject.callFunction = function (node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;

            if (functionName === 'isCompleted') {
                result = this.isCompleted(component, componentStates, componentEvents, nodeEvents);
            } else if (functionName === 'wordCountCompare') {
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

        serviceObject.getStudentWorkAsHTML = function (componentState) {
            var studentWorkAsHTML = null;

            if (componentState != null && componentState.studentData != null) {
                var response = componentState.studentData.response;

                if (response != null) {
                    studentWorkAsHTML = response.replace(/\n/gi, '<br />');
                }

                var attachments = componentState.studentData.attachments;

                // TODO: make into directive and use in component displays as well
                if (attachments && attachments.length) {
                    studentWorkAsHTML += '<div class="component-content__actions" layout="row" layout-wrap="true">';
                    for (var a = 0; a < attachments.length; a++) {
                        var attachment = attachments[a];
                        studentWorkAsHTML += '<div class="component__attachment">' + '<img src="' + attachment.iconURL + '" alt="' + attachment.iconURL + '" class="component__attachment__content" />' + '</div>';
                    }
                    studentWorkAsHTML += '</div>';
                }
            }

            return studentWorkAsHTML;
        };

        /**
         * Populate a component state with the data from another component state
         * @param componentStateFromOtherComponent the component state to obtain the data from
         * @return a new component state that contains the student data from the other
         * component state
         */
        serviceObject.populateComponentState = function (componentStateFromOtherComponent) {
            var componentState = null;

            if (componentStateFromOtherComponent != null) {

                // create an empty component state
                componentState = StudentDataService.createComponentState();

                // get the component type of the other component state
                var otherComponentType = componentStateFromOtherComponent.componentType;

                if (otherComponentType === 'OpenResponse') {
                    // the other component is an OpenResponse component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = StudentDataService.makeCopyOfJSONObject(studentData);

                    // set the student data into the new component state
                    componentState.studentData = studentDataCopy;
                } else if (otherComponentType === 'Planning') {
                    componentState.studentData = JSON.stringify(componentStateFromOtherComponent.studentNodes);
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
         * @returns whether the component was completed
         */
        serviceObject.isCompleted = function (component, componentStates, componentEvents, nodeEvents) {
            var result = false;

            if (componentStates != null && componentStates.length) {

                // get the last component state
                var l = componentStates.length - 1;
                var componentState = componentStates[l];

                var studentData = componentState.studentData;

                if (studentData != null) {
                    var response = studentData.response;

                    if (response) {
                        // there is a response so the component is completed
                        result = true;
                    }
                }
            }

            return result;
        };

        return serviceObject;
    }];

    return service;
});