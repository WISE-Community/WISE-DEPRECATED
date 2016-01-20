'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TeacherDataService = function () {
    function TeacherDataService($http, $rootScope, AnnotationService, ConfigService) {
        _classCallCheck(this, TeacherDataService);

        this.$http = $http;
        this.$rootScope = $rootScope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;

        this.studentData = {};

        this.currentPeriod = null;
    }

    /**
     * Retrieves the export given the export Type
     * @param exportType
     */

    _createClass(TeacherDataService, [{
        key: 'getExport',
        value: function getExport(exportType) {
            var exportURL = this.ConfigService.getConfigParam('runDataExportURL');
            var runId = this.ConfigService.getRunId();
            exportURL += "/" + runId + "/" + exportType;

            var params = {};
            params.getStudentWork = true;
            params.getEvents = false;
            params.getAnnotations = true;

            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = exportURL;
            httpParams.params = params;

            return this.$http(httpParams).then(angular.bind(this, function (result) {
                return result.data;
            }));
        }
    }, {
        key: 'retrieveStudentDataByNodeId',

        /**
         * Retrieve the student data for a node id
         * @param nodeId the node id
         * @returns the student data for the node id
         */
        value: function retrieveStudentDataByNodeId(nodeId) {

            var periodId = null;

            if (this.currentPeriod != null && this.currentPeriod.periodName != 'All') {
                periodId = this.currentPeriod.periodId;
            }

            var params = {};
            params.runId = this.ConfigService.getRunId();
            params.periodId = periodId;
            params.nodeId = nodeId;
            params.workgroupId = null;

            return this.retrieveStudentData(params);
        }
    }, {
        key: 'retrieveStudentDataByWorkgroupId',

        /**
         * Retrieve the student data for the workgroup id
         * @param workgroupId the workgroup id
         * @returns the student data for the workgroup id
         */
        value: function retrieveStudentDataByWorkgroupId(workgroupId) {

            var params = {};
            params.runId = this.ConfigService.getRunId();
            params.periodId = null;
            params.nodeId = null;
            params.workgroupId = workgroupId;
            params.toWorkgroupId = workgroupId;

            return this.retrieveStudentData(params);
        }
    }, {
        key: 'retrieveStudentData',

        /**
         * Retrieve the student data
         * @param params the params that specify what student data we want
         * @returns a promise
         */
        value: function retrieveStudentData(params) {
            var studentDataURL = this.ConfigService.getConfigParam('teacherDataURL');

            params.getStudentWork = true;
            params.getEvents = false;
            params.getAnnotations = true;

            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = studentDataURL;
            httpParams.params = params;

            return this.$http(httpParams).then(angular.bind(this, function (result) {
                var resultData = result.data;
                if (resultData != null) {

                    this.studentData = {};

                    if (resultData.studentWorkList != null) {
                        var componentStates = resultData.studentWorkList;

                        // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId arrays
                        this.studentData.componentStates = componentStates;
                        this.studentData.componentStatesByWorkgroupId = {};
                        this.studentData.componentStatesByNodeId = {};
                        this.studentData.componentStatesByComponentId = {};

                        for (var i = 0; i < componentStates.length; i++) {
                            var componentState = componentStates[i];

                            var componentStateWorkgroupId = componentState.workgroupId;
                            if (this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] == null) {
                                this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] = new Array();
                            }
                            this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].push(componentState);

                            var componentStateNodeId = componentState.nodeId;
                            if (this.studentData.componentStatesByNodeId[componentStateNodeId] == null) {
                                this.studentData.componentStatesByNodeId[componentStateNodeId] = new Array();
                            }
                            this.studentData.componentStatesByNodeId[componentStateNodeId].push(componentState);

                            var componentId = componentState.componentId;
                            if (this.studentData.componentStatesByComponentId[componentId] == null) {
                                this.studentData.componentStatesByComponentId[componentId] = new Array();
                            }
                            this.studentData.componentStatesByComponentId[componentId].push(componentState);
                        }
                    }

                    if (resultData.events != null) {
                        // populate allEvents, eventsByWorkgroupId, and eventsByNodeId arrays
                        this.studentData.allEvents = resultData.events;
                        this.studentData.eventsByWorkgroupId = {};
                        this.studentData.eventsByNodeId = {};
                        for (var i = 0; i < resultData.events.length; i++) {
                            var event = resultData.events[i];
                            var eventWorkgroupId = event.workgroupId;
                            if (this.studentData.eventsByWorkgroupId[eventWorkgroupId] == null) {
                                this.studentData.eventsByWorkgroupId[eventWorkgroupId] = new Array();
                            }
                            this.studentData.eventsByWorkgroupId[eventWorkgroupId].push(event);

                            var eventNodeId = event.nodeId;
                            if (this.studentData.eventsByNodeId[eventNodeId] == null) {
                                this.studentData.eventsByNodeId[eventNodeId] = new Array();
                            }
                            this.studentData.eventsByNodeId[eventNodeId].push(event);
                        }
                    }

                    if (resultData.annotations != null) {
                        // populate annotations, annotationsByWorkgroupId, and annotationsByNodeId arrays
                        this.studentData.annotations = resultData.annotations;
                        this.studentData.annotationsToWorkgroupId = {};
                        this.studentData.annotationsByNodeId = {};
                        for (var i = 0; i < resultData.annotations.length; i++) {
                            var annotation = resultData.annotations[i];
                            var annotationWorkgroupId = annotation.toWorkgroupId;
                            if (this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] == null) {
                                this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
                            }
                            this.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);

                            var annotationNodeId = annotation.nodeId;
                            if (this.studentData.annotationsByNodeId[annotationNodeId] == null) {
                                this.studentData.annotationsByNodeId[annotationNodeId] = new Array();
                            }
                            this.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
                        }
                    }

                    this.AnnotationService.setAnnotations(this.studentData.annotations);
                }
            }));
        }
    }, {
        key: 'sortVLEStatesAlphabeticallyByUserName',
        value: function sortVLEStatesAlphabeticallyByUserName() {
            var vleStates = this.vleStates;

            if (vleStates != null) {
                vleStates.sort(this.sortVLEStatesAlphabeticallyByUserNameHelper);
            }

            return vleStates;
        }
    }, {
        key: 'sortVLEStatesAlphabeticallyByUserNameHelper',
        value: function sortVLEStatesAlphabeticallyByUserNameHelper(a, b) {
            var aUserId = a.userId;
            var bUserId = b.userId;
            var result = 0;

            if (aUserId < bUserId) {
                result = -1;
            } else if (aUserId > bUserId) {
                result = 1;
            }

            return result;
        }
    }, {
        key: 'getComponentStatesByWorkgroupId',
        value: function getComponentStatesByWorkgroupId(workgroupId) {
            var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
            if (componentStatesByWorkgroupId != null) {
                return componentStatesByWorkgroupId;
            } else {
                return [];
            }
        }
    }, {
        key: 'getComponentStatesByNodeId',
        value: function getComponentStatesByNodeId(nodeId) {
            var componentStatesByNodeId = this.studentData.componentStatesByNodeId[nodeId];
            if (componentStatesByNodeId != null) {
                return componentStatesByNodeId;
            } else {
                return [];
            }
        }
    }, {
        key: 'getComponentStatesByComponentId',

        /**
         * Get the component stats for a component id
         * @param componentId the component id
         * @returns an array containing component states for a component id
         */
        value: function getComponentStatesByComponentId(componentId) {
            var componentStates = [];

            var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];

            if (componentStatesByComponentId != null) {
                componentStates = componentStatesByComponentId;
            }

            return componentStates;
        }
    }, {
        key: 'getLatestComponentStateByWorkgroupIdNodeIdAndComponentId',
        value: function getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId) {
            var latestComponentState = null;

            var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

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

            return latestComponentState;
        }
    }, {
        key: 'getComponentStatesByWorkgroupIdAndNodeId',
        value: function getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {

            var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
            var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

            // find the intersect and return it
            return componentStatesByWorkgroupId.filter(function (n) {
                return componentStatesByNodeId.indexOf(n) != -1;
            });
        }
    }, {
        key: 'getComponentStatesByWorkgroupIdAndComponentId',

        /**
         * Get component states for a workgroup id and component id
         * @param workgroupId the workgroup id
         * @param componentId the component id
         * @returns an array of component states
         */
        value: function getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
            var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
            var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

            // find the intersect and return it
            return componentStatesByWorkgroupId.filter(function (n) {
                return componentStatesByComponentId.indexOf(n) != -1;
            });
        }
    }, {
        key: 'getEventsByWorkgroupId',
        value: function getEventsByWorkgroupId(workgroupId) {
            var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
            if (eventsByWorkgroupId != null) {
                return eventsByWorkgroupId;
            } else {
                return [];
            }
        }
    }, {
        key: 'getEventsByNodeId',
        value: function getEventsByNodeId(nodeId) {
            var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
            if (eventsByNodeId != null) {
                return eventsByNodeId;
            } else {
                return [];
            }
        }
    }, {
        key: 'getEventsByWorkgroupIdAndNodeId',
        value: function getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
            var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
            var eventsByNodeId = this.getEventsByNodeId(nodeId);

            // find the intersect and return it
            return eventsByWorkgroupId.filter(function (n) {
                return eventsByNodeId.indexOf(n) != -1;
            });
        }
    }, {
        key: 'getAnnotationsToWorkgroupId',
        value: function getAnnotationsToWorkgroupId(workgroupId) {
            var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
            if (annotationsToWorkgroupId != null) {
                return annotationsToWorkgroupId;
            } else {
                return [];
            }
        }
    }, {
        key: 'getAnnotationsByNodeId',
        value: function getAnnotationsByNodeId(nodeId) {
            var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
            if (annotationsByNodeId != null) {
                return annotationsByNodeId;
            } else {
                return [];
            }
        }
    }, {
        key: 'getAnnotationsToWorkgroupIdAndNodeId',
        value: function getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
            var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
            var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

            // find the intersect and return it
            return annotationsToWorkgroupId.filter(function (n) {
                return annotationsByNodeId.indexOf(n) != -1;
            });
        }
    }, {
        key: 'setCurrentPeriod',
        value: function setCurrentPeriod(period) {
            this.currentPeriod = period;
        }
    }, {
        key: 'getCurrentPeriod',
        value: function getCurrentPeriod() {
            return this.currentPeriod;
        }
    }]);

    return TeacherDataService;
}();

TeacherDataService.$inject = ['$http', '$rootScope', 'AnnotationService', 'ConfigService'];

exports.default = TeacherDataService;
//# sourceMappingURL=teacherDataService.js.map