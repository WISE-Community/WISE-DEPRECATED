'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

            return this.$http(httpParams).then(function (result) {
                return result.data;
            });
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
        key: 'retrieveAnnotations',


        /**
         * Retrieve the annotations for the run
         * @returns the annotations for the run
         */
        value: function retrieveAnnotations() {
            var params = {};
            params.runId = this.ConfigService.getRunId();
            params.periodId = null;
            params.nodeId = null;
            params.workgroupId = null;
            params.toWorkgroupId = null;
            params.getStudentWork = false;
            params.getEvents = false;
            params.getAnnotations = true;

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
            var _this = this;

            var studentDataURL = this.ConfigService.getConfigParam('teacherDataURL');

            if (params.getStudentWork == null) {
                params.getStudentWork = true;
            }

            if (params.getEvents == null) {
                params.getEvents = false;
            }

            if (params.getAnnotations == null) {
                params.getAnnotations = true;
            }

            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = studentDataURL;
            httpParams.params = params;

            return this.$http(httpParams).then(function (result) {
                var resultData = result.data;
                if (resultData != null) {

                    if (_this.studentData == null) {
                        _this.studentData = {};
                    }

                    if (resultData.studentWorkList != null) {
                        var componentStates = resultData.studentWorkList;

                        // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId arrays
                        _this.studentData.componentStates = componentStates;
                        _this.studentData.componentStatesByWorkgroupId = {};
                        _this.studentData.componentStatesByNodeId = {};
                        _this.studentData.componentStatesByComponentId = {};

                        for (var i = 0; i < componentStates.length; i++) {
                            var componentState = componentStates[i];

                            var componentStateWorkgroupId = componentState.workgroupId;
                            if (_this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] == null) {
                                _this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] = new Array();
                            }
                            _this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].push(componentState);

                            var componentStateNodeId = componentState.nodeId;
                            if (_this.studentData.componentStatesByNodeId[componentStateNodeId] == null) {
                                _this.studentData.componentStatesByNodeId[componentStateNodeId] = new Array();
                            }
                            _this.studentData.componentStatesByNodeId[componentStateNodeId].push(componentState);

                            var componentId = componentState.componentId;
                            if (_this.studentData.componentStatesByComponentId[componentId] == null) {
                                _this.studentData.componentStatesByComponentId[componentId] = new Array();
                            }
                            _this.studentData.componentStatesByComponentId[componentId].push(componentState);
                        }
                    }

                    if (resultData.events != null) {
                        // populate allEvents, eventsByWorkgroupId, and eventsByNodeId arrays
                        _this.studentData.allEvents = resultData.events;
                        _this.studentData.eventsByWorkgroupId = {};
                        _this.studentData.eventsByNodeId = {};
                        for (var i = 0; i < resultData.events.length; i++) {
                            var event = resultData.events[i];
                            var eventWorkgroupId = event.workgroupId;
                            if (_this.studentData.eventsByWorkgroupId[eventWorkgroupId] == null) {
                                _this.studentData.eventsByWorkgroupId[eventWorkgroupId] = new Array();
                            }
                            _this.studentData.eventsByWorkgroupId[eventWorkgroupId].push(event);

                            var eventNodeId = event.nodeId;
                            if (_this.studentData.eventsByNodeId[eventNodeId] == null) {
                                _this.studentData.eventsByNodeId[eventNodeId] = new Array();
                            }
                            _this.studentData.eventsByNodeId[eventNodeId].push(event);
                        }
                    }

                    if (resultData.annotations != null) {
                        // populate annotations, annotationsByWorkgroupId, and annotationsByNodeId arrays
                        _this.studentData.annotations = resultData.annotations;
                        _this.studentData.annotationsToWorkgroupId = {};
                        _this.studentData.annotationsByNodeId = {};
                        for (var i = 0; i < resultData.annotations.length; i++) {
                            var annotation = resultData.annotations[i];
                            var annotationWorkgroupId = annotation.toWorkgroupId;
                            if (_this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] == null) {
                                _this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
                            }
                            _this.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);

                            var annotationNodeId = annotation.nodeId;
                            if (_this.studentData.annotationsByNodeId[annotationNodeId] == null) {
                                _this.studentData.annotationsByNodeId[annotationNodeId] = new Array();
                            }
                            _this.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
                        }
                    }

                    _this.AnnotationService.setAnnotations(_this.studentData.annotations);
                }
            });
        }
    }, {
        key: 'getComponentStatesByWorkgroupId',
        value: function getComponentStatesByWorkgroupId(workgroupId) {
            if (this.studentData.componentStatesByWorkgroupId == null) {
                debugger;
            }
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
    }, {
        key: 'getTotalScoreByWorkgroupId',


        /**
         * Get the total score for a workgroup
         * @param workgroupId the workgroup id
         * @returns the total score for the workgroup
         */
        value: function getTotalScoreByWorkgroupId(workgroupId) {

            var totalScore = null;

            if (this.studentData.annotationsToWorkgroupId != null) {

                // get all the annotations for a workgroup
                var annotations = this.studentData.annotationsToWorkgroupId[workgroupId];

                // get the total score for the workgroup
                totalScore = this.AnnotationService.getTotalScore(annotations, workgroupId);
            }

            return totalScore;
        }
    }]);

    return TeacherDataService;
}();

TeacherDataService.$inject = ['$http', '$rootScope', 'AnnotationService', 'ConfigService'];

exports.default = TeacherDataService;
//# sourceMappingURL=teacherDataService.js.map