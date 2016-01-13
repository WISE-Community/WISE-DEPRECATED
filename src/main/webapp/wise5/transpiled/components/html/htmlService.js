'use strict';

define(['nodeService', 'studentDataService'], function (nodeService, studentDataService) {

    var service = ['$http', 'NodeService', 'StudentDataService', function ($http, NodeService, StudentDataService) {
        var serviceObject = Object.create(NodeService);

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

            if (nodeEvents != null) {

                // loop through all the events
                for (var e = 0; e < nodeEvents.length; e++) {

                    // get an event
                    var event = nodeEvents[e];

                    if (event != null && event.event === 'nodeEntered') {
                        result = true;
                        break;
                    }
                }
            }

            return result;
        };

        return serviceObject;
    }];

    return service;
});