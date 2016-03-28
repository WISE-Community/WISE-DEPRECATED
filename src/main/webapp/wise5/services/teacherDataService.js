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
        this.runStatus == null;
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
        key: 'retrieveRunStatus',


        /**
         * Retrieve the run status from the server
         */
        value: function retrieveRunStatus() {
            var _this2 = this;

            var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
            var runId = this.ConfigService.getConfigParam('runId');

            //create the params for the request
            var params = {
                runId: runId
            };

            var httpParams = {};
            httpParams.method = 'GET';
            httpParams.url = runStatusURL;
            httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            httpParams.params = params;

            // make the request
            return this.$http(httpParams).then(function (result) {
                if (result != null) {
                    var data = result.data;
                    if (data != null) {
                        // save the run status
                        _this2.runStatus = data;
                    }
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

        /**
         * Get the run status
         * @returns the run status object
         */

    }, {
        key: 'getRunStatus',
        value: function getRunStatus() {
            return this.runStatus;
        }

        /**
         * Check if a period is paused
         * @returns whether the period is paused or not
         */

    }, {
        key: 'isPeriodPaused',
        value: function isPeriodPaused(periodId) {

            var isPaused = false;

            // get the run status
            var runStatus = this.runStatus;

            if (runStatus != null) {
                if (periodId == -1) {
                    // -1 represents all periods
                    isPaused = runStatus.allPeriodsPaused;
                } else {
                    var periods = runStatus.periods;

                    // loop through all the periods
                    for (var p = 0; p < periods.length; p++) {
                        var period = periods[p];

                        if (period != null) {
                            if (periodId == period.periodId) {
                                // we have found the period we are looking for
                                isPaused = period.paused;
                            }
                        }
                    }
                }
            }

            return isPaused;
        }

        /**
         * Create a local run status object to keep track of the run status
         * @returns the run status object
         */

    }, {
        key: 'createRunStatus',
        value: function createRunStatus() {
            var runStatus = {};

            //get the run id
            runStatus.runId = this.ConfigService.getConfigParam('runId');

            //set this to default to not paused
            runStatus.allPeriodsPaused = false;

            //get all the periods objects
            var periods = this.ConfigService.getPeriods();

            //loop through all the periods
            for (var x = 0; x < periods.length; x++) {
                //get a period
                var period = periods[x];

                //set this to default to not paused
                period.paused = false;
            }

            //set the periods into the run status
            runStatus.periods = periods;

            //set the run status into the view so we can access it later
            this.runStatus = runStatus;

            return this.runStatus;
        }

        /**
         * Update the paused value for a period in our run status
         * @param periodId the period id
         * @param value whether the period is paused or not
         */

    }, {
        key: 'updatePausedRunStatusValue',
        value: function updatePausedRunStatusValue(periodId, value) {
            //create the local run status object if necessary
            if (this.runStatus == null) {
                this.createRunStatus();
            }

            //get the local run status object
            var runStatus = this.runStatus;

            if (periodId == null || periodId == -1) {
                //we are updating the all periods value
                runStatus.allPeriodsPaused = value;

                //set all the periods to the value as well
                //this.setAllPeriodsPaused(value);
            } else {
                    //we are updating a specific period

                    //get all the periods
                    var periods = runStatus.periods;

                    if (periods != null) {
                        //loop through all the periods
                        for (var x = 0; x < periods.length; x++) {
                            //get a period
                            var tempPeriod = periods[x];

                            //get the period id
                            var tempPeriodId = tempPeriod.periodId;

                            //check if the period id matches the one we need to update
                            if (periodId == tempPeriodId) {
                                //we have found the period we want to update
                                tempPeriod.paused = value;
                            }
                        }
                    }
                }
        }

        /**
         * Send the run status back to the server to be saved in the db
         * @param customPauseMessage the custom pause message text to send to the students
         */

    }, {
        key: 'sendRunStatus',
        value: function sendRunStatus(customPauseMessage) {
            //get the run status url we will use to make the request
            var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');

            if (runStatusURL != null) {
                //make the request to the server for the student statuses

                //get the run id
                var runId = this.ConfigService.getConfigParam('runId');

                if (customPauseMessage != null) {
                    //set the pause message if one was provided
                    this.runStatus.pauseMessage = customPauseMessage;
                }

                //get the run status as a string
                var runStatus = angular.toJson(this.runStatus);

                //create the params for the request
                var runStatusParams = {
                    runId: runId,
                    status: runStatus
                };

                var httpParams = {};
                httpParams.method = 'POST';
                httpParams.url = runStatusURL;
                httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                httpParams.data = $.param(runStatusParams);

                // make the request
                this.$http(httpParams);
            }
        }
    }]);

    return TeacherDataService;
}();

TeacherDataService.$inject = ['$http', '$rootScope', 'AnnotationService', 'ConfigService'];

exports.default = TeacherDataService;
//# sourceMappingURL=teacherDataService.js.map