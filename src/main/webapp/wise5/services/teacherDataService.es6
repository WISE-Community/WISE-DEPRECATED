'use strict';

class TeacherDataService {

    constructor($http,
                $filter,
                $q,
                $rootScope,
                AnnotationService,
                ConfigService,
                NotificationService,
                ProjectService,
                TeacherWebSocketService,
                UtilService) {
        this.$http = $http;
        this.$filter = $filter;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.TeacherWebSocketService = TeacherWebSocketService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

        this.studentData = {
            componentStatesByWorkgroupId: {},
            componentStatesByNodeId: {},
            componentStatesByComponentId: {}
        };

        this.currentPeriod = null;
        this.currentWorkgroup = null;
        this.currentNode = null;
        this.previousStep = null;
        this.runStatus = null;
        this.periods = [];
        this.nodeGradingSort = 'team';
        this.studentProgressSort = 'team';

        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$rootScope.$on('annotationSavedToServer', (event, args) => {

            if (args) {
                // get the annotation that was saved to the server
                let annotation = args.annotation;
                this.handleAnnotationReceived(annotation);
            }
        });

        /**
         * Listen for the 'newAnnotationReceived' event which is fired when
         * teacher receives a new annotation (usually on a student work) from the server
         */
        this.$rootScope.$on('newAnnotationReceived', (event, args) => {

            if (args) {
                // get the annotation that was saved to the server
                let annotation = args.annotation;
                this.handleAnnotationReceived(annotation);
            }
        });

        /**
         * Listen for the 'newStudentWorkReceived' event which is fired when
         * teacher receives a new student work from the server
         */
        this.$rootScope.$on('newStudentWorkReceived', (event, args) => {

            if (args) {
                // get the student work (component state) that was saved to the server
                let studentWork = args.studentWork;
                this.addOrUpdateComponentState(studentWork);
                // broadcast the event that a new work has been received
                this.$rootScope.$broadcast('studentWorkReceived', {studentWork: studentWork});
            }
        });
    }

    handleAnnotationReceived(annotation) {
        // add the annotation to the local annotations array
        this.studentData.annotations.push(annotation);

        let toWorkgroupId = annotation.toWorkgroupId;
        if (this.studentData.annotationsToWorkgroupId[toWorkgroupId] == null) {
            this.studentData.annotationsToWorkgroupId[toWorkgroupId] = new Array();
        }
        this.studentData.annotationsToWorkgroupId[toWorkgroupId].push(annotation);

        let nodeId = annotation.nodeId;
        if (this.studentData.annotationsByNodeId[nodeId] == null) {
            this.studentData.annotationsByNodeId[nodeId] = new Array();
        }
        this.studentData.annotationsByNodeId[nodeId].push(annotation);

        this.AnnotationService.setAnnotations(this.studentData.annotations);

        // broadcast the event that a new annotation has been received
        this.$rootScope.$broadcast('annotationReceived', {annotation: annotation});
    }

    /**
     * Get the data for the export and generate the csv file that will be downloaded
     * @param exportType the type of export
     */
    getExport(exportType, selectedNodes) {
        let exportURL = this.ConfigService.getConfigParam('runDataExportURL');
        let runId = this.ConfigService.getRunId();
        exportURL += "/" + runId + "/" + exportType;

        if (exportType === "allStudentWork" || exportType === "latestStudentWork") {
            let params = {};
            params.runId = this.ConfigService.getRunId();
            params.getStudentWork = true;
            params.getAnnotations = true;
            params.getEvents = false;
            params.components = selectedNodes;

            return this.retrieveStudentData(params);
        } else if (exportType === "events") {
            let params = {};
            params.runId = this.ConfigService.getRunId();
            params.getStudentWork = false;
            params.getAnnotations = false;
            params.getEvents = true;
            params.components = selectedNodes;

            return this.retrieveStudentData(params);
        } else if (exportType === "latestNotebookItems" || exportType === "allNotebookItems") {
            let httpParams = {
                method : 'GET',
                url : exportURL,
                params : {}
            };

            return this.$http(httpParams).then((result) => {
                return result.data;
            });
        } else if (exportType === "notifications") {
            let httpParams = {
                method : 'GET',
                url : exportURL,
                params : {}
            };

            return this.$http(httpParams).then((result) => {
                return result.data;
            });
        } else if (exportType === "studentAssets") {
            window.location.href = exportURL;
            let deferred = this.$q.defer();
            let promise = deferred.promise;
            deferred.resolve([]);
            return promise;
        } else if (exportType === "oneWorkgroupPerRow") {
            let params = {};
            params.runId = this.ConfigService.getRunId();
            params.getStudentWork = true;
            params.getAnnotations = true;
            params.getEvents = true;
            params.components = selectedNodes;

            return this.retrieveStudentData(params);
        } else if (exportType === "rawData") {
            let params = {};
            params.runId = this.ConfigService.getRunId();
            params.getStudentWork = true;
            params.getAnnotations = true;
            params.getEvents = true;
            params.components = selectedNodes;

            return this.retrieveStudentData(params);
        }
    }

    /**
     * Retrieves the export given the export Type
     * @param exportType
     */
    getExport0(exportType) {
        let exportURL = this.ConfigService.getConfigParam('runDataExportURL');
        let runId = this.ConfigService.getRunId();
        exportURL += "/" + runId + "/" + exportType;

        if (exportType === "studentAssets") {
            window.location.href = exportURL;
            let deferred = this.$q.defer();
            let promise = deferred.promise;
            deferred.resolve([]);
            return promise;
        } else {
            let httpParams = {
                method : 'GET',
                url : exportURL,
                params : {}
            };

            return this.$http(httpParams).then((result) => {
                return result.data;
            });
        }
    };

    /**
     * Save events that occur in the Classroom Monitor to the server
     * @param event the event object
     * @returns a promise
     */
    saveEvent(context, nodeId, componentId, componentType, category, event, data) {
        let newEvent = {
            runId : this.ConfigService.getRunId(),
            workgroupId : this.ConfigService.getWorkgroupId(),
            clientSaveTime : Date.parse(new Date()),
            context : context,
            nodeId : nodeId,
            componentId : componentId,
            type : componentType,
            category : category,
            event : event,
            data : data
        };

        let events = [newEvent];

        let params = {
             runId : this.ConfigService.getRunId(),
             workgroupId : this.ConfigService.getWorkgroupId(),
             events : angular.toJson(events)
        };

        let httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = this.ConfigService.getConfigParam('teacherDataURL');
        httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        httpParams.data = $.param(params);

        return this.$http(httpParams).then((result) => {

            let savedEvents = null;

            if (result != null && result.data != null) {
                let data = result.data;

                if (data != null) {

                    // get the saved events
                    savedEvents = data.events;
                }
            }

            return savedEvents;
        });
    };

    /**
     * Retrieve the student data for a node id
     * @param nodeId the node id
     * @returns the student data for the node id
     */
    retrieveStudentDataByNodeId(nodeId) {

        //var periodId = null;

        //if (this.currentPeriod != null && this.currentPeriod.periodName != 'All') {
            //periodId = this.currentPeriod.periodId;
        //}

        // get the node ids and component ids in the node
        var nodeIdsAndComponentIds = this.ProjectService.getNodeIdsAndComponentIds(nodeId);

        // get the show previous work node ids and component ids in the node
        var showPreviousWorkNodeIdsAndComponentIds = this.ProjectService.getShowPreviousWorkNodeIdsAndComponentIds(nodeId);

        var components = [];
        components = components.concat(nodeIdsAndComponentIds);
        components = components.concat(showPreviousWorkNodeIdsAndComponentIds);

        var params = {};
        params.runId = this.ConfigService.getRunId();
        //params.periodId = periodId;
        params.periodId = null;
        params.workgroupId = null;
        params.components = components;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the student data for the workgroup id
     * @param workgroupId the workgroup id
     * @returns the student data for the workgroup id
     */
    retrieveStudentDataByWorkgroupId(workgroupId) {

        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.periodId = null;
        params.nodeId = null;
        params.workgroupId = workgroupId;
        params.toWorkgroupId = workgroupId;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the annotations for the run
     * @returns the annotations for the run
     */
    retrieveAnnotations() {
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
    };

    /**
     * Retrieve the student data
     * @param params the params that specify what student data we want
     * @returns a promise
     */
    retrieveStudentData(params) {
        let studentDataURL = this.ConfigService.getConfigParam('teacherDataURL');

        if (params.getStudentWork == null) {
            params.getStudentWork = true;
        }

        if (params.getEvents == null) {
            params.getEvents = false;
        }

        if (params.getAnnotations == null) {
            params.getAnnotations = true;
        }

        let httpParams = {
            "method": "GET",
            "url": studentDataURL,
            "params": params
        };

        return this.$http(httpParams).then((result) => {
            var resultData = result.data;
            if (resultData != null) {

                if (resultData.studentWorkList != null) {
                    var componentStates = resultData.studentWorkList;

                    // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId objects
                    for (var i = 0; i < componentStates.length; i++) {
                        var componentState = componentStates[i];
                        this.addOrUpdateComponentState(componentState);
                    }
                }

                if (resultData.events != null) {
                    // populate allEvents, eventsByWorkgroupId, and eventsByNodeId arrays

                    // sort the events by server save time
                    resultData.events.sort(this.UtilService.sortByServerSaveTime);

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
                        if (!this.studentData.annotationsToWorkgroupId[annotationWorkgroupId]) {
                            this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
                        }
                        this.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);

                        var annotationNodeId = annotation.nodeId;
                        if (!this.studentData.annotationsByNodeId[annotationNodeId]) {
                            this.studentData.annotationsByNodeId[annotationNodeId] = new Array();
                        }
                        this.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
                    }
                }

                this.AnnotationService.setAnnotations(this.studentData.annotations);
            }
        });
    };

    /**
     * Add ComponentState to local bookkeeping
     * @param componentState the ComponentState to add
     */
    addOrUpdateComponentState(componentState) {
        var componentStateWorkgroupId = componentState.workgroupId;
        if (this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] == null) {
            this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] = new Array();
        }
        let found = false;
        for (let w = 0; w < this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].length; w++) {
            let cs = this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId][w];
            if (cs.id != null && cs.id === componentState.id) {
                // found the same component id, so just update it in place.
                this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId][w] = componentState;
                found = true;  // remember this so we don't insert later.
                break;
            }
        }
        if (!found) {
            this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].push(componentState);
        }

        var componentStateNodeId = componentState.nodeId;
        if (this.studentData.componentStatesByNodeId[componentStateNodeId] == null) {
            this.studentData.componentStatesByNodeId[componentStateNodeId] = new Array();
        }
        found = false;  // reset
        for (let n = 0; n < this.studentData.componentStatesByNodeId[componentStateNodeId].length; n++) {
            let cs = this.studentData.componentStatesByNodeId[componentStateNodeId][n];
            if (cs.id != null && cs.id === componentState.id) {
                // found the same component id, so just update it in place.
                this.studentData.componentStatesByNodeId[componentStateNodeId][n] = componentState;
                found = true; // remember this so we don't insert later.
                break;
            }
        }
        if (!found) {
            this.studentData.componentStatesByNodeId[componentStateNodeId].push(componentState);
        }

        var componentId = componentState.componentId;
        if (this.studentData.componentStatesByComponentId[componentId] == null) {
            this.studentData.componentStatesByComponentId[componentId] = new Array();
        }
        found = false;  // reset
        for (let c = 0; c < this.studentData.componentStatesByComponentId[componentId].length; c++) {
            let cs = this.studentData.componentStatesByComponentId[componentId][c];
            if (cs.id != null && cs.id === componentState.id) {
                // found the same component id, so just update it in place.
                this.studentData.componentStatesByComponentId[componentId][c] = componentState
                found = true; // remember this so we don't insert later.
                break;
            }
        }
        if (!found) {
            this.studentData.componentStatesByComponentId[componentId].push(componentState);
        }
    };

    /**
     * Retrieve the run status from the server
     */
    retrieveRunStatus() {
        var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
        var runId = this.ConfigService.getConfigParam('runId');

        //create the params for the request
        var params = {
            runId:runId
        };

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.url = runStatusURL;
        httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        httpParams.params = params;

        // make the request
        return this.$http(httpParams).then((result) => {
            if (result != null) {
                var data = result.data;
                if (data != null) {
                    // save the run status
                    this.runStatus = data;
                    this.initializePeriods();
                }
            }
        });
    }

    getComponentStatesByWorkgroupId(workgroupId) {
        if (this.studentData.componentStatesByWorkgroupId == null) {
            //debugger;
        }
        var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
        if (componentStatesByWorkgroupId != null) {
            return componentStatesByWorkgroupId;
        } else {
            return [];
        }
    }

    getComponentStatesByNodeId(nodeId) {
        var componentStatesByNodeId = this.studentData.componentStatesByNodeId[nodeId];
        if (componentStatesByNodeId != null) {
            return componentStatesByNodeId;
        } else {
            return [];
        }
    }

    /**
     * Get the component stats for a component id
     * @param componentId the component id
     * @returns an array containing component states for a component id
     */
    getComponentStatesByComponentId(componentId) {
        var componentStates = [];

        var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];

        if (componentStatesByComponentId != null) {
            componentStates = componentStatesByComponentId;
        }

        return componentStates;
    }

    getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId) {
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
                    if (nodeId == componentStateNodeId &&
                        componentId == componentStateComponentId) {
                        latestComponentState = componentState;
                        break;
                    }
                }
            }
        }

        return latestComponentState;
    }

    getLatestComponentStateByWorkgroupIdNodeId(workgroupId, nodeId) {
        var latestComponentState = null;

        var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

        if (componentStates != null) {

            // loop through all the component states from newest to oldest
            for (var c = componentStates.length - 1; c >= 0; c--) {
                var componentState = componentStates[c];

                if (componentState != null) {
                    var componentStateNodeId = componentState.nodeId;

                    // compare the node id and component id
                    if (nodeId == componentStateNodeId) {
                        latestComponentState = componentState;
                        break;
                    }
                }
            }
        }

        return latestComponentState;
    }

    /**
     * Get the latest component states for a workgroup. Each component state
     * will be the latest component state for a component.
     * @param workgroupId the workgroup id
     * @return an array of latest component states
     */
    getLatestComponentStatesByWorkgroupId(workgroupId) {
        var componentStates = [];

        if (workgroupId != null) {

            // get all the component states for a workgroup
            var componentStatesForWorkgroup = this.getComponentStatesByWorkgroupId(workgroupId);

            if (componentStatesForWorkgroup != null) {

                // mapping of component to revision counter
                var componentRevisionCounter = {};

                /*
                 * used to keep track of the components we have found component
                 * states for already
                 */
                var componentsFound = {};

                // loop through the component states forwards
                for (var csf = 0; csf < componentStatesForWorkgroup.length; csf++) {

                    // get a component state
                    var componentState = componentStatesForWorkgroup[csf];

                    if (componentState != null) {

                        // get the node id and component id of the component state
                        var nodeId = componentState.nodeId;
                        var componentId = componentState.componentId;

                        // generate the component key e.g. "node2_bb83hs0sd8"
                        var key = nodeId + "-" + componentId;

                        if (componentRevisionCounter[key] == null) {
                            // initialize the component revision counter for this component to 1 if there is no entry
                            componentRevisionCounter[key] = 1;
                        }

                        // get the revision counter
                        var revisionCounter = componentRevisionCounter[key];

                        // set the revision counter into the component state
                        componentState.revisionCounter = revisionCounter;

                        // increment the revision counter for the component
                        componentRevisionCounter[key] = revisionCounter + 1;
                    }
                }

                // loop through the component states backwards
                for(var csb = componentStatesForWorkgroup.length - 1; csb >= 0; csb--) {

                    // get a component state
                    var componentState = componentStatesForWorkgroup[csb];

                    if (componentState != null) {

                        // get the node id and component id of the component state
                        var nodeId = componentState.nodeId;
                        var componentId = componentState.componentId;

                        // generate the component key e.g. "node2_bb83hs0sd8"
                        var key = nodeId + "-" + componentId;

                        if (componentsFound[key] == null) {
                            /*
                             * we have not found a component state for this
                             * component yet so we will add it to the array
                             * of component states
                             */
                            componentStates.push(componentState);

                            /*
                             * add an entry into the components found so that
                             * don't add any more component states from this
                             * component
                             */
                            componentsFound[key] = true;
                        }
                    }
                }

                /*
                 * reverse the component states array since we have been adding
                 * component states from newest to oldest order but we want them
                 * in oldest to newest order
                 */
                componentStates.reverse();
            }
        }

        return componentStates;
    }

    getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {

        var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
        var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

        // find the intersect and return it
        return componentStatesByWorkgroupId.filter((n) => {
            return componentStatesByNodeId.indexOf(n) != -1;
        });
    }

    /**
     * Get component states for a workgroup id and component id
     * @param workgroupId the workgroup id
     * @param componentId the component id
     * @returns an array of component states
     */
    getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
        var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
        var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

        // find the intersect and return it
        return componentStatesByWorkgroupId.filter((n) => {
            return componentStatesByComponentId.indexOf(n) != -1;
        });
    }

    getEventsByWorkgroupId(workgroupId) {
        var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
        if (eventsByWorkgroupId != null) {
            return eventsByWorkgroupId;
        } else {
            return [];
        }
    };

    getEventsByNodeId(nodeId) {
        var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
        if (eventsByNodeId != null) {
            return eventsByNodeId;
        } else {
            return [];
        }
    };

    getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
        var eventsByNodeId = this.getEventsByNodeId(nodeId);

        // find the intersect and return it
        return eventsByWorkgroupId.filter((n) => {
            return eventsByNodeId.indexOf(n) != -1;
        });
    };

    /**
     * Get the latest event by workgroup id, node id, and event type
     * @param workgroupId the workgroup id
     * @param nodeId the node id
     * @param eventType the event type
     * @return the latest event with the matching parameters or null if
     * no event is found with the matching parameters
     */
    getLatestEventByWorkgroupIdAndNodeIdAndType(workgroupId, nodeId, eventType) {

        // get all the events for a workgroup id
        var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);

        if (eventsByWorkgroupId != null) {

            /*
             * loop through all the events for the workgroup from newest to
             * oldest
             */
            for (var e = eventsByWorkgroupId.length - 1; e >= 0; e--) {

                // get an event
                var event = eventsByWorkgroupId[e];

                if (event != null) {
                    if (event.nodeId == nodeId && event.event == eventType) {
                        /*
                         * the event parameters match the ones we are looking
                         * for
                         */
                        return event;
                    }
                }
            }
        }

        return null;
    }

    getAnnotationsToWorkgroupId(workgroupId) {
        var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
        if (annotationsToWorkgroupId != null) {
            return annotationsToWorkgroupId;
        } else {
            return [];
        }
    }

    getAnnotationsByNodeId(nodeId) {
        var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
        if (annotationsByNodeId != null) {
            return annotationsByNodeId;
        } else {
            return [];
        }
    }

    getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
        var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

        // find the intersect and return it
        return annotationsToWorkgroupId.filter((n) => {
            return annotationsByNodeId.indexOf(n) != -1;
        });
    }

    /**
     * Initialize the periods
     */
    initializePeriods() {

        // get the periods from the config
        let periods = this.ConfigService.getPeriods();
        let currentPeriod = null;

        if (periods.length > 1) {
            // create an option for all periods
            let allPeriodsOption = {
                periodId: -1,
                periodName: this.$translate('allPeriods')
            };

            periods.unshift(allPeriodsOption);
            currentPeriod = periods[0];
        } else if (periods.length == 1) {
            currentPeriod = periods[0];
        }

        // an array to gather all the periods
        let mergedPeriods = [];

        /*
         * Get the periods from the run status. These periods may not be up to
         * date so we need to compare them with the periods from the config.
         */
        let runStatusPeriods = this.runStatus.periods;

        // loop through all the periods in the config
        for (let p = 0; p < periods.length; p++) {
            let period = periods[p];

            if (period != null) {
                // check if the period object is in the run status periods

                let runStatusPeriod = null;

                if (runStatusPeriods != null) {
                    // loop through all the periods in the run status
                    for (let r = 0; r < runStatusPeriods.length; r++) {
                        let tempRunStatusPeriod = runStatusPeriods[r];

                        if (tempRunStatusPeriod != null) {
                            if (period.periodId == tempRunStatusPeriod.periodId) {
                                /*
                                 * We have found a period that is in the config and
                                 * the run status.
                                 */
                                runStatusPeriod = tempRunStatusPeriod;
                            }
                        }
                    }
                }

                if (runStatusPeriod == null) {
                    /*
                     * we did not find the period object in the run status so
                     * we will use the period object from the config
                     */
                    mergedPeriods.push(period);
                } else {
                    // we found the period object in the run status so we will use it
                    mergedPeriods.push(runStatusPeriod);
                }
            }
        }

        this.periods = mergedPeriods;
        this.runStatus.periods = mergedPeriods;

        // set the current period
        if (currentPeriod) {
            this.setCurrentPeriod(currentPeriod);
        }
    }

    setCurrentPeriod(period) {
        let previousPeriod = this.currentPeriod;
        this.currentPeriod = period;

        // whenever the current period is set, clear the currently selected workgroup
        this.setCurrentWorkgroup(null);

        // broadcast the event that the current period has changed
        this.$rootScope.$broadcast('currentPeriodChanged', {previousPeriod: previousPeriod, currentPeriod: this.currentPeriod});
    }

    getCurrentPeriod() {
        return this.currentPeriod;
    }

    getPeriods() {
        return this.periods;
    }

    getRunStatus() {
        return this.runStatus;
    }

    setCurrentWorkgroup(workgroup) {
        this.currentWorkgroup = workgroup;

        // broadcast the event that the current workgroup has changed
        this.$rootScope.$broadcast('currentWorkgroupChanged', {currentWorkgroup: this.currentWorkgroup});
    }

    getCurrentWorkgroup() {
        return this.currentWorkgroup;
    }

    /**
     * Get the current node
     * @returns the current node object
     */
    getCurrentNode() {
        return this.currentNode;
    }

    /**
     * Get the current node id
     * @returns the current node id
     */
    getCurrentNodeId() {
        var currentNodeId = null;

        if (this.currentNode != null) {
            currentNodeId = this.currentNode.id;
        }

        return currentNodeId;
    }

    /**
     * Set the current node
     * @param nodeId the node id
     */
    setCurrentNodeByNodeId(nodeId) {
        if (nodeId != null) {
            let node = this.ProjectService.getNodeById(nodeId);

            this.setCurrentNode(node);
        }
    }

    /**
     * Set the current node
     * @param node the node object
     */
    setCurrentNode(node) {
        let previousCurrentNode = this.currentNode;

        if (previousCurrentNode !== node) {
            // the current node is about to change

            if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)){
                // set the previous node to the current node
                this.previousStep = previousCurrentNode;
            }

            // set the current node to the new node
            this.currentNode = node;

            // broadcast the event that the current node has changed
            this.$rootScope.$broadcast('currentNodeChanged', {previousNode: previousCurrentNode, currentNode: this.currentNode});
        }
    }

    /**
     * End the current node
     */
    endCurrentNode() {

        // get the current node
        var previousCurrentNode = this.currentNode;

        if (previousCurrentNode != null) {

            // tell the node to exit
            this.$rootScope.$broadcast('exitNode', {nodeToExit: previousCurrentNode});
        }
    }

    /**
     * End the current node and set the current node
     * @param nodeId the node id of the new current node
     */
    endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
        // end the current node
        this.endCurrentNode();

        // set the current node
        this.setCurrentNodeByNodeId(nodeId);
    }

    /**
     * Get the total score for a workgroup
     * @param workgroupId the workgroup id
     * @returns the total score for the workgroup
     */
    getTotalScoreByWorkgroupId(workgroupId) {

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
    getRunStatus() {
        return this.runStatus;
    }

    /**
     * Check if any period in the run is paused
     * @returns Boolean whether any periods are paused
     */
    isAnyPeriodPaused(periodId) {
        let isPaused = false;

        // get the run status
        let runStatus = this.runStatus;

        if (runStatus && runStatus.periods) {
            let periods = runStatus.periods;
            let nPeriods = periods.length;
            let nPeriodsPaused = 0;

            // loop through all the periods
            for (let p = 0; p < periods.length; p++) {
                let period = periods[p];

                if (period != null) {
                    if (period.paused) {
                        isPaused = true;
                        break;
                    }
                }
            }
        }

        return isPaused;
    }

    /**
     * Check if the given period is paused
     * @param periodId the id for a period
     * @returns Boolean whether the period is paused or not
     */
    isPeriodPaused(periodId) {

        let isPaused = false;

        // get the run status
        let runStatus = this.runStatus;

        if (runStatus && runStatus.periods) {
            let periods = runStatus.periods;
            let nPeriods = periods.length;
            let nPeriodsPaused = 0;

            // loop through all the periods
            for (let p = 0; p < periods.length; p++) {
                let period = periods[p];

                if (period != null) {
                    isPaused = period.paused;
                    if (periodId == period.periodId) {
                        // we have found the period we are looking for
                        break;
                    } else {
                        if (isPaused) {
                            nPeriodsPaused++;
                        } else {
                            break;
                        }
                    }
                }
            }

            if (periodId === -1 && nPeriods === nPeriodsPaused) {
                isPaused = true;
            }
        }

        return isPaused;
    }

    /**
     * The pause screen status was changed for the given periodId. Update period accordingly.
     * @param periodId the id of the period to toggle
     * @param isPaused Boolean whether the period should be paused or not
     */
    pauseScreensChanged(periodId, isPaused) {
        if (periodId) {
            // update the run status
            this.updatePausedRunStatusValue(periodId, isPaused);

            if (isPaused) {
                // pause the student screens
                this.TeacherWebSocketService.pauseScreens(periodId);
            } else {
                // unpause the student screens
                this.TeacherWebSocketService.unPauseScreens(periodId);
            }

            // save the run status to the server
            this.sendRunStatus();

            // save pause/unpause screen event
            let context = "ClassroomMonitor", nodeId = null, componentId = null, componentType = null,
                category = "TeacherAction", data = { periodId: periodId };
            let event = "pauseScreen";
            if (!isPaused) {
                event = "unPauseScreen";
            }
            this.saveEvent(context, nodeId, componentId, componentType, category, event, data);

            this.$rootScope.$broadcast('pauseScreensChanged', {periods: this.runStatus.periods});
        }
    }

    /**
     * Create a local run status object to keep track of the run status
     * @returns the run status object
     */
    createRunStatus() {
        var runStatus = {};

        // get the run id
        runStatus.runId = this.ConfigService.getConfigParam('runId');

        // get all the periods objects
        var periods = this.ConfigService.getPeriods();

        //loop through all the periods
        for (var x = 0; x < periods.length; x++) {
            //get a period
            var period = periods[x];

            //set this to default to not paused
            period.paused = false;
        }

        // set the periods into the run status
        runStatus.periods = periods;

        // set the run status into the view so we can access it later
        this.runStatus = runStatus;

        return this.runStatus;
    }

    /**
     * Update the paused value for a period in our run status
     * @param periodId the period id
     * @param value whether the period is paused or not
     */
    updatePausedRunStatusValue(periodId, value) {
        //create the local run status object if necessary
        if (this.runStatus == null) {
            this.createRunStatus();
        }

        //get the local run status object
        let runStatus = this.runStatus;
        let periods = runStatus.periods;

        let allPeriodsPaused = true;

        if (periods) {
            let l = periods.length, x = l - 1;
            //loop through all the periods
            for (; x > -1; x--) {
                //get a period
                let tempPeriod = periods[x];

                //get the period id
                let tempPeriodId = tempPeriod.periodId;

                //check if the period id matches the one we need to update or if all periods has been selected
                if (periodId === tempPeriodId || periodId === -1) {
                    //we have found the period we want to update
                    tempPeriod.paused = value;
                }

                if (tempPeriodId !== -1 && !tempPeriod.paused) {
                    allPeriodsPaused = false;
                }

                if (tempPeriodId === -1) {
                    // set the paused status for the all periods option
                    tempPeriod.paused = allPeriodsPaused;
                }
             }
        }
    }

    /**
     * Send the run status back to the server to be saved in the db
     * @param customPauseMessage the custom pause message text to send to the students
     */
    sendRunStatus(customPauseMessage) {
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
                runId:runId,
                status:runStatus
            };

            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = runStatusURL;
            httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            httpParams.data = $.param(runStatusParams);

            // make the request
            this.$http(httpParams);
        }
    };
}

TeacherDataService.$inject = [
    '$http',
    '$filter',
    '$q',
    '$rootScope',
    'AnnotationService',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'TeacherWebSocketService',
    'UtilService'
];

export default TeacherDataService;
