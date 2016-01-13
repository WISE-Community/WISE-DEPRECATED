'use strict';

define(['nodeService', 'studentDataService'], function (nodeService, studentDataService) {

    var service = ['$http', '$q', 'ConfigService', 'NodeService', 'StudentDataService', function ($http, $q, ConfigService, NodeService, StudentDataService) {
        var serviceObject = Object.create(NodeService);

        serviceObject.config = null;

        serviceObject.callFunction = function (node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;

            /*
            if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }
            */

            return result;
        };

        serviceObject.getStudentWorkAsHTML = function (nodeState) {
            var studentWorkAsHTML = '';

            if (nodeState != null) {
                var studentData = nodeState.studentData;

                if (studentData != null) {
                    var buckets = studentData.buckets;

                    if (buckets != null) {
                        for (var b = 0; b < buckets.length; b++) {
                            var bucket = buckets[b];

                            if (bucket != null) {
                                var bucketValue = bucket.value;
                                var items = bucket.items;

                                studentWorkAsHTML += bucketValue;
                                studentWorkAsHTML += '<br/>';

                                if (items != null) {
                                    for (var i = 0; i < items.length; i++) {
                                        var item = items[i];

                                        if (item != null) {
                                            var itemValue = item.value;

                                            studentWorkAsHTML += itemValue;
                                            studentWorkAsHTML += '<br/>';
                                        }
                                    }
                                }
                            }
                        }
                    }
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

                if (otherComponentType === 'Match') {
                    // the other component is an Match component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = StudentDataService.makeCopyOfJSONObject(studentData);

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
                        var buckets = studentData.buckets;

                        if (buckets != null) {
                            // there is a bucket so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        };

        return serviceObject;
    }];

    return service;
});